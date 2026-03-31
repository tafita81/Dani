import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { carAssistantConversations, carAssistantRecommendations, carAssistantAppointments } from "../drizzle/carAssistantSchema";
import { desc, eq, and } from "drizzle-orm";

/**
 * Procedure para salvar conversa do Assistente Carro
 */
export const saveCarConversationProcedure = protectedProcedure
  .input(
    z.object({
      patientId: z.number().optional(),
      question: z.string(),
      answer: z.string(),
      audioUrl: z.string().optional(),
      duration: z.number().optional(),
      sentiment: z.string().optional(),
      topic: z.string().optional(),
      dataSource: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          error: "Database connection failed",
        };
      }

      await database.insert(carAssistantConversations).values({
        userId: ctx.user.id,
        patientId: input.patientId,
        question: input.question,
        answer: input.answer,
        audioUrl: input.audioUrl,
        duration: input.duration,
        sentiment: input.sentiment,
        topic: input.topic,
        dataSource: input.dataSource,
      });

      return {
        success: true,
        message: "Conversa salva com sucesso",
      };
    } catch (error) {
      console.error("Erro ao salvar conversa:", error);
      return {
        success: false,
        error: "Erro ao salvar conversa",
      };
    }
  });

/**
 * Procedure para recuperar histórico de conversas
 */
export const getCarConversationHistoryProcedure = protectedProcedure
  .input(
    z.object({
      patientId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .query(async ({ ctx, input }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          conversations: [],
          error: "Database connection failed",
        };
      }

      let query = database
        .select()
        .from(carAssistantConversations)
        .where(eq(carAssistantConversations.userId, ctx.user.id));

      if (input.patientId) {
        query = database
          .select()
          .from(carAssistantConversations)
          .where(
            and(
              eq(carAssistantConversations.userId, ctx.user.id),
              eq(carAssistantConversations.patientId, input.patientId)
            )
          );
      }

      const conversations = await query
        .orderBy(desc(carAssistantConversations.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return {
        success: true,
        conversations,
        count: conversations.length,
      };
    } catch (error) {
      console.error("Erro ao recuperar histórico:", error);
      return {
        success: false,
        conversations: [],
        error: "Erro ao recuperar histórico",
      };
    }
  });

/**
 * Procedure para salvar recomendação
 */
export const saveCarRecommendationProcedure = protectedProcedure
  .input(
    z.object({
      conversationId: z.number(),
      recommendationType: z.string(),
      recommendationText: z.string(),
    })
  )
  .mutation(async ({ ctx, input }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          error: "Database connection failed",
        };
      }

      await database.insert(carAssistantRecommendations).values({
        conversationId: input.conversationId,
        recommendationType: input.recommendationType,
        recommendationText: input.recommendationText,
      });

      return {
        success: true,
        message: "Recomendação salva com sucesso",
      };
    } catch (error) {
      console.error("Erro ao salvar recomendação:", error);
      return {
        success: false,
        error: "Erro ao salvar recomendação",
      };
    }
  });

/**
 * Procedure para criar agendamento via Assistente Carro
 */
export const createCarAppointmentProcedure = protectedProcedure
  .input(
    z.object({
      conversationId: z.number(),
      patientId: z.number(),
      requestedDate: z.string(), // formato YYYY-MM-DD
      requestedTime: z.string(), // formato HH:MM
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          error: "Database connection failed",
        };
      }

      await database.insert(carAssistantAppointments).values({
        conversationId: input.conversationId,
        patientId: input.patientId,
        userId: ctx.user.id,
        requestedDate: input.requestedDate,
        requestedTime: input.requestedTime,
        status: "pending",
        notes: input.notes,
      });

      return {
        success: true,
        message: "Agendamento solicitado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return {
        success: false,
        error: "Erro ao criar agendamento",
      };
    }
  });

/**
 * Procedure para obter recomendações pendentes
 */
export const getCarPendingRecommendationsProcedure = protectedProcedure.query(
  async ({ ctx }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          recommendations: [],
          error: "Database connection failed",
        };
      }

      // Buscar conversas do usuário
      const conversations = await database
        .select({ id: carAssistantConversations.id })
        .from(carAssistantConversations)
        .where(eq(carAssistantConversations.userId, ctx.user.id))
        .limit(100);

      const conversationIds = conversations.map((c: any) => c.id);

      if (conversationIds.length === 0) {
        return {
          success: true,
          recommendations: [],
        };
      }

      // Buscar recomendações não executadas
      const recommendations = await database
        .select()
        .from(carAssistantRecommendations)
        .where(
          and(
            eq(carAssistantRecommendations.actionTaken, false),
            // Filtrar por conversationId (simplificado)
          )
        )
        .orderBy(desc(carAssistantRecommendations.createdAt))
        .limit(10);

      return {
        success: true,
        recommendations,
      };
    } catch (error) {
      console.error("Erro ao obter recomendações:", error);
      return {
        success: false,
        recommendations: [],
        error: "Erro ao obter recomendações",
      };
    }
  }
);
