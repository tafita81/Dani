/**
 * trpc.ts — Configuração tRPC com middleware de autenticação
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

export const router = t.router;
export const middleware = t.middleware;

// ── Middleware de auth ────────────────────────────────────────
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar autenticado",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const isAdmin = middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ── Procedures ────────────────────────────────────────────────
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
