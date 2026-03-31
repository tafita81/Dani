import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../core_logic/db";
import { driverConversations, driverRecommendations, driverTopicAnalysis } from "../drizzle/driverConversationSchema";
import { desc, eq, and } from "drizzle-orm";

/**
 * Procedure para salvar conversa do motorista
 */
export const saveDriverConversationProcedure = protectedProcedure
  .input(
    z.object({
      question: z.string(),
      answer: z.string(),
      audioUrl: z.string().optional(),
      duration: z.number().optional(),
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

      // Salvar conversa
      await database.insert(driverConversations).values({
        userId: ctx.user.id,
        question: input.question,
        answer: input.answer,
        audioUrl: input.audioUrl,
        duration: input.duration,
        topic: input.topic,
        dataSource: input.dataSource,
      });

      // Atualizar análise de tópicos
      if (input.topic) {
        const existingTopic = await database
          .select()
          .from(driverTopicAnalysis)
          .where(
            and(
              eq(driverTopicAnalysis.userId, ctx.user.id),
              eq(driverTopicAnalysis.topic, input.topic)
            )
          )
          .limit(1);

        if (existingTopic.length > 0) {
          // Incrementar contador
          await database
            .update(driverTopicAnalysis)
            .set({
              count: (existingTopic[0] as any).count + 1,
              lastAskedAt: new Date(),
            })
            .where(eq(driverTopicAnalysis.id, (existingTopic[0] as any).id));
        } else {
          // Criar novo registro
          await database.insert(driverTopicAnalysis).values({
            userId: ctx.user.id,
            topic: input.topic,
            count: 1,
            lastAskedAt: new Date(),
          });
        }
      }

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
 * Procedure para recuperar histórico de conversas do motorista
 */
export const getDriverConversationHistoryProcedure = protectedProcedure
  .input(
    z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      topic: z.string().optional(),
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
        .from(driverConversations)
        .where(eq(driverConversations.userId, ctx.user.id));

      if (input.topic) {
        query = database
          .select()
          .from(driverConversations)
          .where(
            and(
              eq(driverConversations.userId, ctx.user.id),
              eq(driverConversations.topic, input.topic)
            )
          );
      }

      const conversations = await query
        .orderBy(desc(driverConversations.createdAt))
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
 * Procedure para obter análise de tópicos
 */
export const getDriverTopicAnalysisProcedure = protectedProcedure.query(
  async ({ ctx }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          topics: [],
          error: "Database connection failed",
        };
      }

      const topics = await database
        .select()
        .from(driverTopicAnalysis)
        .where(eq(driverTopicAnalysis.userId, ctx.user.id))
        .orderBy(desc(driverTopicAnalysis.count));

      // Calcular estatísticas
      const totalQuestions = topics.reduce((sum: number, t: any) => sum + t.count, 0);
      const topicStats = topics.map((t: any) => ({
        topic: t.topic,
        count: t.count,
        percentage: totalQuestions > 0 ? Math.round((t.count / totalQuestions) * 100) : 0,
        lastAskedAt: t.lastAskedAt,
      }));

      return {
        success: true,
        topics: topicStats,
        totalQuestions,
      };
    } catch (error) {
      console.error("Erro ao obter análise de tópicos:", error);
      return {
        success: false,
        topics: [],
        error: "Erro ao obter análise de tópicos",
      };
    }
  }
);

/**
 * Procedure para salvar recomendação inteligente
 */
export const saveDriverRecommendationProcedure = protectedProcedure
  .input(
    z.object({
      conversationId: z.number(),
      recommendationType: z.string(),
      recommendationText: z.string(),
      category: z.string().optional(),
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

      await database.insert(driverRecommendations).values({
        conversationId: input.conversationId,
        recommendationType: input.recommendationType,
        recommendationText: input.recommendationText,
        category: input.category,
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
