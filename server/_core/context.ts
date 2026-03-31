/**
 * context.ts — Contexto tRPC com auth JWT (substitui Manus OAuth2)
 */

import { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getUserFromRequest, type AuthUser } from "./auth.js";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const user = await getUserFromRequest(req);

  return {
    req,
    res,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
