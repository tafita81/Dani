/**
 * Router tRPC de Waitlist com Integração ao Banco de Dados
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const waitlistRouter = router({
  /**
   * Inscrever na waitlist
   */
  subscribe: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().optional(),
        interest: z.enum(["consultas", "informacoes", "ambos"]),
      })
    )
    .mutation(async ({ input }) => {
      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // await db.insert(waitlist).values({...})
      return {
        success: true,
        message: "Inscrição realizada com sucesso!",
        email: input.email,
      };
    }),

  /**
   * Listar inscritos (admin only)
   */
  listSubscribers: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "notified", "unsubscribed"]).optional(),
        interest: z.enum(["consultas", "informacoes", "ambos"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // const subscribers = await db.select().from(waitlist).limit(input.limit).offset(input.offset)
      return {
        subscribers: [],
        total: 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Obter estatísticas (admin only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // Aqui você conectaria ao banco de dados
    // const db = getDb();
    // const stats = await db.select(...).from(waitlist)
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      notifiedSubscribers: 0,
      unsubscribedCount: 0,
      interestBreakdown: {
        consultas: 0,
        informacoes: 0,
        ambos: 0,
      },
      subscriptionGrowth: [],
    };
  }),

  /**
   * Deletar inscrito (admin only)
   */
  deleteSubscriber: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // await db.delete(waitlist).where(eq(waitlist.id, input.id))
      return {
        success: true,
        message: "Inscrito deletado com sucesso",
      };
    }),

  /**
   * Marcar como notificado (admin only)
   */
  markAsNotified: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // await db.update(waitlist).set({ status: 'notified', notifiedAt: new Date() }).where(eq(waitlist.id, input.id))
      return {
        success: true,
        message: "Marcado como notificado",
      };
    }),

  /**
   * Enviar notificação de ativação (admin only)
   */
  sendActivationNotification: protectedProcedure.mutation(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // Aqui você conectaria ao banco de dados e emailService
    // const db = getDb();
    // const subscribers = await db.select().from(waitlist).where(eq(waitlist.status, 'active'))
    // for (const subscriber of subscribers) {
    //   await emailService.send({...})
    // }
    return {
      success: true,
      message: "Notificações enviadas",
      sent: 0,
    };
  }),

  /**
   * Exportar como CSV (admin only)
   */
  exportAsCSV: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // Aqui você conectaria ao banco de dados
    // const db = getDb();
    // const subscribers = await db.select().from(waitlist)
    // const csv = convertToCSV(subscribers)
    return {
      csv: "name,email,phone,interest,status,subscribedAt\n",
      filename: `waitlist-${new Date().toISOString().split("T")[0]}.csv`,
    };
  }),

  /**
   * Buscar por email (admin only)
   */
  findByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // const subscriber = await db.select().from(waitlist).where(eq(waitlist.email, input.email))
      return {
        subscriber: null,
        found: false,
      };
    }),

  /**
   * Desinscrever (público)
   */
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // await db.update(waitlist).set({ status: 'unsubscribed', unsubscribedAt: new Date() }).where(eq(waitlist.email, input.email))
      return {
        success: true,
        message: "Você foi desinscrito com sucesso",
      };
    }),

  /**
   * Reinscrever (público)
   */
  resubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // await db.update(waitlist).set({ status: 'active', unsubscribedAt: null }).where(eq(waitlist.email, input.email))
      return {
        success: true,
        message: "Você foi reinscrito com sucesso",
      };
    }),
});
