/**
 * routers.ts — Router principal do tRPC
 * Agrega todos os sub-routers do sistema
 */

import { router } from "../_core/trpc.js";
import { carAssistantRouter } from "../features/carAssistant.js";
import { clinicalAssistantRouter } from "../features/clinicalAssistant.js";
import { systemRouter } from "./systemRouter.js";

export const appRouter = router({
  // ── Sistema ──────────────────────────────────────────────
  system: systemRouter,

  // ── Assistentes ──────────────────────────────────────────
  carAssistant: carAssistantRouter,
  clinicalAssistant: clinicalAssistantRouter,

  // Os demais routers (patients, appointments, etc.)
  // serão importados conforme existirem no repositório original
});

export type AppRouter = typeof appRouter;
