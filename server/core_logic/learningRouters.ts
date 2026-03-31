/**
 * Learning System Routers — Routers tRPC para aprendizado contínuo
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as learning from "./agentLearning";

export const learningRouter = router({
  // Logging de ações
  logAction: protectedProcedure
    .input(
      z.object({
        actionType: z.string(),
        description: z.string(),
        actionData: z.any(),
        success: z.boolean(),
        errorMessage: z.string().optional(),
        resultMetrics: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return learning.logAgentAction(ctx.user.id, input.actionType, {
        description: input.description,
        actionData: input.actionData,
        success: input.success,
        errorMessage: input.errorMessage,
        resultMetrics: input.resultMetrics,
      });
    }),

  logActionWithFeedback: protectedProcedure
    .input(
      z.object({
        actionType: z.string(),
        description: z.string(),
        actionData: z.any(),
        success: z.boolean(),
        resultMetrics: z.any().optional(),
        userFeedback: z.enum(["positive", "neutral", "negative"]).optional(),
        feedbackNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return learning.logActionWithFeedback(ctx.user.id, input.actionType, {
        description: input.description,
        actionData: input.actionData,
        success: input.success,
        resultMetrics: input.resultMetrics,
      });
    }),

  // Métricas
  calculateDailyMetrics: protectedProcedure.mutation(async ({ ctx }) => {
    return learning.calculateDailyMetrics(ctx.user.id);
  }),

  // Insights
  discoverInsights: protectedProcedure.mutation(async ({ ctx }) => {
    return learning.discoverInsights(ctx.user.id);
  }),

  // Otimizações
  generateOptimizationSuggestions: protectedProcedure.query(async ({ ctx }) => {
    return learning.generateOptimizationSuggestions(ctx.user.id);
  }),

  // Planos de melhoria
  createImprovementPlan: protectedProcedure
    .input(
      z.object({
        objective: z.string(),
        targetMetric: z.string(),
        currentValue: z.number(),
        targetValue: z.number(),
        daysToAchieve: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return learning.createImprovementPlan(
        ctx.user.id,
        input.objective,
        input.targetMetric,
        input.currentValue,
        input.targetValue,
        input.daysToAchieve
      );
    }),

  // Análise de evolução
  analyzeEvolution: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      return learning.analyzeEvolution(ctx.user.id, input.days);
    }),

  // Relatório diário
  generateDailyReport: protectedProcedure.query(async ({ ctx }) => {
    return learning.generateDailyReport(ctx.user.id);
  }),
});
