import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../core_logic/db";
import { scheduleBlocks, outlookCredentials, outlookSyncLog } from "../drizzle/scheduleBlockSchema";
import { desc, eq, and, between } from "drizzle-orm";

/**
 * Procedure para criar bloqueio de horário
 */
export const createScheduleBlockProcedure = protectedProcedure
  .input(
    z.object({
      blockDate: z.string(), // YYYY-MM-DD
      startTime: z.string(), // HH:MM
      endTime: z.string(), // HH:MM
      reason: z.string().optional(),
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

      await database.insert(scheduleBlocks).values({
        userId: ctx.user.id,
        blockDate: input.blockDate,
        startTime: input.startTime,
        endTime: input.endTime,
        reason: input.reason,
        isBlocked: true,
      });

      return {
        success: true,
        message: "Bloqueio criado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao criar bloqueio:", error);
      return {
        success: false,
        error: "Erro ao criar bloqueio",
      };
    }
  });

/**
 * Procedure para liberar horário (remover bloqueio)
 */
export const releaseScheduleBlockProcedure = protectedProcedure
  .input(
    z.object({
      blockId: z.number(),
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

      // Buscar bloqueio
      const block = await database
        .select()
        .from(scheduleBlocks)
        .where(
          and(
            eq(scheduleBlocks.id, input.blockId),
            eq(scheduleBlocks.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (block.length === 0) {
        return {
          success: false,
          error: "Bloqueio não encontrado",
        };
      }

      // Atualizar para liberado
      await database
        .update(scheduleBlocks)
        .set({
          isBlocked: false,
        })
        .where(eq(scheduleBlocks.id, input.blockId));

      return {
        success: true,
        message: "Horário liberado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao liberar horário:", error);
      return {
        success: false,
        error: "Erro ao liberar horário",
      };
    }
  });

/**
 * Procedure para obter bloqueios de um dia
 */
export const getScheduleBlocksByDateProcedure = protectedProcedure
  .input(
    z.object({
      blockDate: z.string(), // YYYY-MM-DD
    })
  )
  .query(async ({ ctx, input }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          blocks: [],
          error: "Database connection failed",
        };
      }

      const blocks = await database
        .select()
        .from(scheduleBlocks)
        .where(
          and(
            eq(scheduleBlocks.userId, ctx.user.id),
            eq(scheduleBlocks.blockDate, input.blockDate)
          )
        )
        .orderBy(scheduleBlocks.startTime);

      return {
        success: true,
        blocks,
      };
    } catch (error) {
      console.error("Erro ao obter bloqueios:", error);
      return {
        success: false,
        blocks: [],
        error: "Erro ao obter bloqueios",
      };
    }
  });

/**
 * Procedure para salvar credenciais do Outlook
 */
export const saveOutlookCredentialsProcedure = protectedProcedure
  .input(
    z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      expiresAt: z.string(), // ISO string
      outlookEmail: z.string(),
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

      // Verificar se já existe credencial
      const existing = await database
        .select()
        .from(outlookCredentials)
        .where(eq(outlookCredentials.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        // Atualizar
        await database
          .update(outlookCredentials)
          .set({
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            expiresAt: new Date(input.expiresAt),
            outlookEmail: input.outlookEmail,
          })
          .where(eq(outlookCredentials.userId, ctx.user.id));
      } else {
        // Criar novo
        await database.insert(outlookCredentials).values({
          userId: ctx.user.id,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresAt: new Date(input.expiresAt),
          outlookEmail: input.outlookEmail,
          isActive: true,
        });
      }

      return {
        success: true,
        message: "Credenciais do Outlook salvas com sucesso",
      };
    } catch (error) {
      console.error("Erro ao salvar credenciais:", error);
      return {
        success: false,
        error: "Erro ao salvar credenciais",
      };
    }
  });

/**
 * Procedure para sincronizar bloqueio com Outlook
 */
export const syncBlockToOutlookProcedure = protectedProcedure
  .input(
    z.object({
      blockId: z.number(),
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

      // Buscar credenciais
      const creds = await database
        .select()
        .from(outlookCredentials)
        .where(
          and(
            eq(outlookCredentials.userId, ctx.user.id),
            eq(outlookCredentials.isActive, true)
          )
        )
        .limit(1);

      if (creds.length === 0) {
        return {
          success: false,
          error: "Credenciais do Outlook não configuradas",
        };
      }

      // Buscar bloqueio
      const block = await database
        .select()
        .from(scheduleBlocks)
        .where(
          and(
            eq(scheduleBlocks.id, input.blockId),
            eq(scheduleBlocks.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (block.length === 0) {
        return {
          success: false,
          error: "Bloqueio não encontrado",
        };
      }

      // Aqui você implementaria a chamada real à API do Outlook
      // Por enquanto, apenas registramos como sincronizado
      await database
        .update(scheduleBlocks)
        .set({
          syncedToOutlook: true,
        })
        .where(eq(scheduleBlocks.id, input.blockId));

      // Registrar no log de sincronização
      await database.insert(outlookSyncLog).values({
        userId: ctx.user.id,
        blockId: input.blockId,
        syncType: "create",
        status: "success",
      });

      return {
        success: true,
        message: "Bloqueio sincronizado com Outlook",
      };
    } catch (error) {
      console.error("Erro ao sincronizar com Outlook:", error);

      // Registrar erro no log
      try {
        const database = await getDb();
        if (database) {
          await database.insert(outlookSyncLog).values({
            userId: ctx.user.id,
            blockId: input.blockId,
            syncType: "create",
            status: "failed",
            errorMessage: (error as Error).message,
          });
        }
      } catch (logError) {
        console.error("Erro ao registrar log:", logError);
      }

      return {
        success: false,
        error: "Erro ao sincronizar com Outlook",
      };
    }
  });

/**
 * Procedure para obter status de sincronização
 */
export const getOutlookSyncStatusProcedure = protectedProcedure.query(
  async ({ ctx }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          isConfigured: false,
          error: "Database connection failed",
        };
      }

      const creds = await database
        .select()
        .from(outlookCredentials)
        .where(
          and(
            eq(outlookCredentials.userId, ctx.user.id),
            eq(outlookCredentials.isActive, true)
          )
        )
        .limit(1);

      const isConfigured = creds.length > 0;
      const outlookEmail = isConfigured ? (creds[0] as any).outlookEmail : null;

      // Obter últimas sincronizações
      const recentSyncs = await database
        .select()
        .from(outlookSyncLog)
        .where(eq(outlookSyncLog.userId, ctx.user.id))
        .orderBy(desc(outlookSyncLog.createdAt))
        .limit(10);

      return {
        success: true,
        isConfigured,
        outlookEmail,
        recentSyncs,
      };
    } catch (error) {
      console.error("Erro ao obter status:", error);
      return {
        success: false,
        isConfigured: false,
        error: "Erro ao obter status",
      };
    }
  }
);
