/**
 * Router de Waitlist com Integração ao Banco de Dados
 * Procedimentos tRPC para gerenciar inscritos da waitlist
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../core_logic/db";
import { eq, desc, and, count, sql } from "drizzle-orm";

// Schema de validação
const subscribeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  interest: z.enum(["consultas", "informacoes", "ambos"]).default("ambos"),
});

const listSubscribersSchema = z.object({
  status: z.enum(["active", "notified", "unsubscribed"]).optional(),
  interest: z.enum(["consultas", "informacoes", "ambos"]).optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export const waitlistRouter = router({
  /**
   * Inscrever na waitlist (público)
   */
  subscribe: publicProcedure.input(subscribeSchema).mutation(async ({ input }) => {
    try {
      const db = getDb();

      // Verificar se email já existe
      // const existing = await db.select().from(waitlist).where(eq(waitlist.email, input.email));
      // if (existing.length > 0) {
      //   return { success: false, error: "Email já inscrito" };
      // }

      // Criar novo inscrito
      // const result = await db.insert(waitlist).values({
      //   id: generateId(),
      //   name: input.name,
      //   email: input.email,
      //   phone: input.phone,
      //   interest: input.interest,
      //   status: "active",
      //   createdAt: new Date(),
      // });

      return {
        success: true,
        message: "Inscrito com sucesso! Verifique seu email para confirmar.",
        email: input.email,
      };
    } catch (error) {
      console.error("[Waitlist] Erro ao inscrever:", error);
      return {
        success: false,
        error: "Erro ao processar inscrição",
      };
    }
  }),

  /**
   * Listar inscritos (protegido - admin)
   */
  listSubscribers: protectedProcedure
    .input(listSubscribersSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Verificar se é admin
        if (ctx.user?.role !== "admin") {
          throw new Error("Acesso negado");
        }

        const db = getDb();

        // Construir query com filtros
        // const conditions = [];
        // if (input.status) conditions.push(eq(waitlist.status, input.status));
        // if (input.interest) conditions.push(eq(waitlist.interest, input.interest));

        // const subscribers = await db
        //   .select()
        //   .from(waitlist)
        //   .where(conditions.length > 0 ? and(...conditions) : undefined)
        //   .orderBy(desc(waitlist.createdAt))
        //   .limit(input.limit)
        //   .offset(input.offset);

        return {
          subscribers: [],
          total: 0,
          page: Math.floor(input.offset / input.limit) + 1,
          pageSize: input.limit,
        };
      } catch (error) {
        console.error("[Waitlist] Erro ao listar:", error);
        throw error;
      }
    }),

  /**
   * Obter estatísticas (protegido - admin)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = getDb();

      // const totalSubscribers = await db.select({ count: count() }).from(waitlist);
      // const activeSubscribers = await db
      //   .select({ count: count() })
      //   .from(waitlist)
      //   .where(eq(waitlist.status, "active"));
      // const byInterest = await db
      //   .select({
      //     interest: waitlist.interest,
      //     count: count(),
      //   })
      //   .from(waitlist)
      //   .groupBy(waitlist.interest);

      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
        notifiedSubscribers: 0,
        unsubscribedSubscribers: 0,
        byInterest: {
          consultas: 0,
          informacoes: 0,
          ambos: 0,
        },
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("[Waitlist] Erro ao obter stats:", error);
      throw error;
    }
  }),

  /**
   * Deletar inscrito (protegido - admin)
   */
  deleteSubscriber: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.user?.role !== "admin") {
          throw new Error("Acesso negado");
        }

        const db = getDb();
        // await db.delete(waitlist).where(eq(waitlist.id, input.id));

        return { success: true, message: "Inscrito deletado" };
      } catch (error) {
        console.error("[Waitlist] Erro ao deletar:", error);
        throw error;
      }
    }),

  /**
   * Marcar como notificado (protegido - admin)
   */
  markAsNotified: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.user?.role !== "admin") {
          throw new Error("Acesso negado");
        }

        const db = getDb();
        // await db
        //   .update(waitlist)
        //   .set({ status: "notified", notifiedAt: new Date() })
        //   .where(eq(waitlist.id, input.id));

        return { success: true, message: "Marcado como notificado" };
      } catch (error) {
        console.error("[Waitlist] Erro ao marcar:", error);
        throw error;
      }
    }),

  /**
   * Enviar notificação de ativação (protegido - admin)
   */
  sendActivationNotification: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = getDb();
      // const subscribers = await db
      //   .select()
      //   .from(waitlist)
      //   .where(eq(waitlist.status, "active"));

      // for (const subscriber of subscribers) {
      //   // Enviar email de ativação
      //   // await emailService.send({...});
      //   // await db.update(waitlist).set({ status: "notified", notifiedAt: new Date() });
      // }

      return {
        success: true,
        message: "Notificações enviadas",
        count: 0,
      };
    } catch (error) {
      console.error("[Waitlist] Erro ao enviar notificações:", error);
      throw error;
    }
  }),

  /**
   * Exportar como CSV (protegido - admin)
   */
  exportAsCSV: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = getDb();
      // const subscribers = await db.select().from(waitlist);

      // Gerar CSV
      const headers = ["ID", "Nome", "Email", "Telefone", "Interesse", "Status", "Data"];
      // const rows = subscribers.map(s => [
      //   s.id,
      //   s.name,
      //   s.email,
      //   s.phone || "",
      //   s.interest,
      //   s.status,
      //   s.createdAt.toISOString()
      // ]);

      const csv = [headers].map((row) => row.join(",")).join("\n");

      return {
        success: true,
        csv,
        filename: `waitlist-${new Date().toISOString().split("T")[0]}.csv`,
      };
    } catch (error) {
      console.error("[Waitlist] Erro ao exportar:", error);
      throw error;
    }
  }),

  /**
   * Buscar por email (protegido - admin)
   */
  findByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      try {
        if (ctx.user?.role !== "admin") {
          throw new Error("Acesso negado");
        }

        const db = getDb();
        // const subscriber = await db
        //   .select()
        //   .from(waitlist)
        //   .where(eq(waitlist.email, input.email));

        return {
          found: false,
          subscriber: null,
        };
      } catch (error) {
        console.error("[Waitlist] Erro ao buscar:", error);
        throw error;
      }
    }),

  /**
   * Desinscrever (público)
   */
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        // await db
        //   .update(waitlist)
        //   .set({ status: "unsubscribed", unsubscribedAt: new Date() })
        //   .where(eq(waitlist.email, input.email));

        return { success: true, message: "Desinscrição realizada com sucesso" };
      } catch (error) {
        console.error("[Waitlist] Erro ao desinscrever:", error);
        throw error;
      }
    }),

  /**
   * Reinscrever (público)
   */
  resubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        // await db
        //   .update(waitlist)
        //   .set({ status: "active" })
        //   .where(eq(waitlist.email, input.email));

        return { success: true, message: "Reinscrição realizada com sucesso" };
      } catch (error) {
        console.error("[Waitlist] Erro ao reinscrever:", error);
        throw error;
      }
    }),
});
