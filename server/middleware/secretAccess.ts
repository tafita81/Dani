import { Request, Response, NextFunction } from "express";

/**
 * Middleware de acesso exclusivo para Dra. Daniela de Oliveira Coelho
 * URL secreto: /app?token=SECRET_TOKEN_DANIELA_2026
 * 
 * Este middleware garante que apenas quem conhece a URL secreta
 * possa acessar o aplicativo completo.
 */

// Token secreto único para Daniela (em produção, usar variável de ambiente)
const SECRET_TOKEN = process.env.DANIELA_SECRET_TOKEN || "dani-psicologia-2026-exclusive-access";

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ["/api/health", "/api/public"];

/**
 * Valida o token de acesso
 */
export function validateSecretToken(token: string): boolean {
  return token === SECRET_TOKEN;
}

/**
 * Middleware Express para validar acesso
 */
export function secretAccessMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Verificar se é rota pública
  if (PUBLIC_ROUTES.some((route) => req.path.startsWith(route))) {
    return next();
  }

  // Verificar token no query string
  const token = req.query.token as string;

  if (!token) {
    console.log("[Access Denied] Tentativa de acesso sem token:", req.path);
    return res.status(403).json({
      error: "Acesso não autorizado",
      message: "Token de acesso necessário",
    });
  }

  if (!validateSecretToken(token)) {
    console.log("[Access Denied] Token inválido:", token);
    return res.status(403).json({
      error: "Token inválido",
      message: "Acesso negado",
    });
  }

  // Token válido - continuar
  console.log("[Access Granted] Acesso autorizado para Dra. Daniela Coelho");
  next();
}

/**
 * Gera a URL de acesso completa
 */
export function generateAccessUrl(baseUrl: string): string {
  return `${baseUrl}?token=${SECRET_TOKEN}`;
}

/**
 * Valida se a requisição tem acesso autorizado
 * (para uso em tRPC procedures)
 */
export function hasSecretAccess(token?: string): boolean {
  if (!token) return false;
  return validateSecretToken(token);
}
