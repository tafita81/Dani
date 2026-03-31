import { router, publicProcedure, protectedProcedure } from "../_core/trpc.js";
import { checkLLMHealth } from "../_core/llm.js";
import { db } from "./db.js";
import { sql } from "drizzle-orm";

export const systemRouter = router({
  health: publicProcedure.query(async () => {
    let dbOk = false;
    let llmOk = false;

    try {
      await db.execute(sql`SELECT 1`);
      dbOk = true;
    } catch {}

    try {
      llmOk = await checkLLMHealth();
    } catch {}

    return {
      status: dbOk && llmOk ? "healthy" : "degraded",
      services: {
        database: dbOk ? "ok" : "error",
        llm: llmOk ? "ok" : "error",
      },
      version: "1.2.0",
      timestamp: new Date().toISOString(),
    };
  }),

  ping: publicProcedure.query(() => ({ pong: true })),
});
