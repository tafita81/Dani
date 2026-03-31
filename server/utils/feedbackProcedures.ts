import { z } from "zod";
import { publicProcedure } from "../core_logic/routers";

export const saveFeedbackProcedure = publicProcedure
  .input(
    z.object({
      question: z.string(),
      answer: z.string(),
      feedback: z.enum(["positive", "negative", "neutral"]),
      rating: z.number().min(1).max(5).optional(),
      responseTime: z.number(),
      intent: z.string().optional(),
    })
  )
  .mutation(async ({ input }: any) => {
    try {
      // Aqui você integraria com o banco de dados real
      // Por enquanto, apenas retornamos sucesso
      return {
        success: true,
        feedbackId: `feedback-${Date.now()}`,
        message: "Feedback salvo com sucesso",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: "Erro ao salvar feedback",
      };
    }
  });

export const getFeedbackStatsProcedure = publicProcedure
  .input(
    z.object({
      period: z.enum(["24h", "7d", "30d"]).optional(),
      userId: z.string().optional(),
    })
  )
  .query(async ({ input }: any) => {
    // Simular dados de feedback
    const stats = {
      totalResponses: 45,
      positiveCount: 32,
      negativeCount: 5,
      neutralCount: 8,
      averageRating: 4.2,
      satisfactionRate: 0.89,
      averageResponseTime: 1200, // ms
      trends: {
        byIntent: {
          patient_info: 15,
          appointment_info: 18,
          session_info: 10,
          statistics: 2,
        },
        byHour: {
          8: 5,
          9: 8,
          10: 7,
          11: 6,
          12: 4,
          13: 3,
          14: 2,
          15: 3,
          16: 4,
          17: 3,
        },
      },
    };

    return {
      success: true,
      stats,
      period: input.period || "24h",
    };
  });

export const getRecentFeedbackProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().default(10),
      userId: z.string().optional(),
    })
  )
  .query(async ({ input }: any) => {
    // Simular feedback recente
    const recentFeedback = [
      {
        id: "fb-1",
        question: "Quantos pacientes ativos?",
        answer: "Você tem 12 pacientes ativos",
        feedback: "positive",
        rating: 5,
        responseTime: 850,
        timestamp: Date.now() - 300000,
      },
      {
        id: "fb-2",
        question: "Ver próximos agendamentos",
        answer: "Você tem 3 agendamentos hoje",
        feedback: "positive",
        rating: 5,
        responseTime: 920,
        timestamp: Date.now() - 600000,
      },
      {
        id: "fb-3",
        question: "Pacientes com atraso",
        answer: "2 pacientes não compareceram",
        feedback: "neutral",
        rating: 3,
        responseTime: 1100,
        timestamp: Date.now() - 900000,
      },
    ];

    return {
      success: true,
      feedback: recentFeedback.slice(0, input.limit),
      total: recentFeedback.length,
    };
  });
