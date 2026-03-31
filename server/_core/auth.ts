/**
 * auth.ts — Substitui Manus OAuth2 por autenticação JWT própria
 * Compatível com o sistema de contexto tRPC existente
 */

import { Request, Response, NextFunction } from "express";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "../core_logic/db.js";
import { users } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "mude-isso-em-producao-use-64-chars-aleatorios"
);
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? "7d";

// ── Tipos ────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

// ── Gerar token ──────────────────────────────────────────────
export async function generateToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES)
    .sign(JWT_SECRET);
}

// ── Verificar token ──────────────────────────────────────────
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as "admin" | "user",
    };
  } catch {
    return null;
  }
}

// ── Extrair token do request ─────────────────────────────────
export function extractToken(req: Request): string | null {
  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // 2. Cookie
  const cookieToken = req.cookies?.["auth_token"];
  if (cookieToken) return cookieToken;

  return null;
}

// ── Middleware Express ────────────────────────────────────────
export async function authMiddleware(
  req: Request & { user?: AuthUser },
  res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const user = await verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  req.user = user;
  next();
}

// ── Contexto para tRPC ────────────────────────────────────────
export async function getUserFromRequest(req: Request): Promise<AuthUser | null> {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

// ── Rotas de auth (adicionar ao Express antes do tRPC) ────────
export function setupAuthRoutes(app: any) {
  // POST /api/auth/register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Campos obrigatórios: email, password, name" });
      }

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const [created] = await db.insert(users).values({
        email,
        name,
        password: hashedPassword,
        role: "user",
      }).$returningId();

      const user: AuthUser = { id: String(created.id), email, name, role: "user" };
      const token = await generateToken(user);

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({ token, user: { id: user.id, email, name } });
    } catch (err) {
      console.error("[auth/register]", err);
      return res.status(500).json({ error: "Erro interno" });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const [found] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!found) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const valid = await bcrypt.compare(password, found.password ?? "");
      if (!valid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const user: AuthUser = {
        id: String(found.id),
        email: found.email,
        name: found.name ?? "",
        role: (found.role as "admin" | "user") ?? "user",
      };
      const token = await generateToken(user);

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      console.error("[auth/login]", err);
      return res.status(500).json({ error: "Erro interno" });
    }
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie("auth_token");
    return res.json({ ok: true });
  });

  // GET /api/auth/me
  app.get("/api/auth/me", authMiddleware, (req: any, res: Response) => {
    return res.json({ user: req.user });
  });
}
