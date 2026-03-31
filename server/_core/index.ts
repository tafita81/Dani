/**
 * index.ts — Ponto de entrada do servidor
 * Corrigido: remove dependência Manus OAuth2, usa auth JWT própria
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../core_logic/routers.js";
import { createContext } from "./context.js";
import { setupAuthRoutes } from "./auth.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const isDev = process.env.NODE_ENV !== "production";

const app = express();

// ── Middlewares base ─────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "1.2.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

// ── Auth routes (JWT) ─────────────────────────────────────────
setupAuthRoutes(app);

// ── tRPC ──────────────────────────────────────────────────────
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC error] ${path}:`, error.message);
    },
  })
);

// ── Webhooks ──────────────────────────────────────────────────
// WhatsApp
import whatsappWebhookRouter from "../webhooks/whatsappWebhook.js";
app.use("/api/webhooks/whatsapp", whatsappWebhookRouter);

// ── Frontend estático (produção) ──────────────────────────────
if (!isDev) {
  const distPath = path.resolve(__dirname, "../../dist/public");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ── Error handler global ──────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server error]", err);
  res.status(err.status ?? 500).json({
    error: isDev ? err.message : "Erro interno do servidor",
  });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando: http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV}`);
  console.log(`   tRPC:    http://localhost:${PORT}/trpc`);
  console.log(`   Health:  http://localhost:${PORT}/api/health`);
});

export default app;
