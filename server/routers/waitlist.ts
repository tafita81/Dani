import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { validateWaitlistEntry, generateWelcomeMessage } from "../waitlistService";

/**
 * Router tRPC para gerenciar waitlist
 */
export const waitlistRouter = router({
  /**
   * Inscrever novo usuário na waitlist
   */
  subscribe: publicProcedure
    .input(
      z.object({
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().optional(),
        interest: z.enum(["consultas", "informacoes", "ambos"]),
      })
    )
    .mutation(async ({ input }) => {
      // Validar entrada
      const validation = validateWaitlistEntry(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      // TODO: Salvar no banco de dados
      // const entry = await db.waitlist.create({
      //   data: {
      //     name: input.name,
      //     email: input.email,
      //     phone: input.phone,
      //     interest: input.interest,
      //     status: "active",
      //     createdAt: new Date(),
      //   }
      // });

      // TODO: Enviar email de confirmação
      // const welcomeMessage = generateWelcomeMessage(input.name, input.interest);
      // await emailService.sendWelcomeEmail(input.email, welcomeMessage);

      return {
        success: true,
        message: "Você foi adicionado à lista de espera com sucesso!",
        // id: entry.id,
      };
    }),

  /**
   * Listar todos os inscritos (apenas admin)
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

      // TODO: Buscar do banco de dados
      // const subscribers = await db.waitlist.findMany({
      //   where: {
      //     ...(input.status && { status: input.status }),
      //     ...(input.interest && { interest: input.interest }),
      //   },
      //   take: input.limit,
      //   skip: input.offset,
      //   orderBy: { createdAt: "desc" },
      // });

      return {
        subscribers: [],
        total: 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Obter estatísticas da waitlist
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // TODO: Buscar do banco de dados
    // const stats = await db.waitlist.aggregate({
    //   _count: true,
    //   where: { status: "active" }
    // });

    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      notifiedSubscribers: 0,
      interestBreakdown: {
        consultas: 0,
        informacoes: 0,
        ambos: 0,
      },
      subscriptionGrowth: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
    };
  }),

  /**
   * Deletar inscrito da waitlist
   */
  deleteSubscriber: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // TODO: Deletar do banco de dados
      // await db.waitlist.delete({
      //   where: { id: input }
      // });

      return {
        success: true,
        message: "Inscrito removido com sucesso",
      };
    }),

  /**
   * Marcar como notificado
   */
  markAsNotified: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // TODO: Atualizar no banco de dados
      // await db.waitlist.update({
      //   where: { id: input },
      //   data: {
      //     status: "notified",
      //     notifiedAt: new Date()
      //   }
      // });

      return {
        success: true,
        message: "Marcado como notificado",
      };
    }),

  /**
   * Enviar notificação de ativação para todos
   */
  sendActivationNotification: protectedProcedure.mutation(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // TODO: Buscar todos os ativos
    // const subscribers = await db.waitlist.findMany({
    //   where: { status: "active" }
    // });

    // TODO: Enviar emails
    // for (const subscriber of subscribers) {
    //   await emailService.sendActivationNotification(
    //     subscriber.email,
    //     subscriber.name
    //   );
    // }

    return {
      success: true,
      message: "Notificações de ativação enviadas",
      // count: subscribers.length,
    };
  }),

  /**
   * Exportar inscritos como CSV
   */
  exportAsCSV: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // TODO: Buscar todos
    // const subscribers = await db.waitlist.findMany();

    // TODO: Gerar CSV
    // const csv = [
    //   "Nome,Email,Telefone,Interesse,Status,Data de Inscrição",
    //   ...subscribers.map(s =>
    //     `${s.name},${s.email},${s.phone || ""},${s.interest},${s.status},${s.createdAt.toISOString()}`
    //   )
    // ].join("\n");

    return {
      success: true,
      // csv: csv,
      // filename: `waitlist_${new Date().toISOString().split("T")[0]}.csv`
    };
  }),

  /**
   * Buscar inscrito por email
   */
  findByEmail: protectedProcedure
    .input(z.string().email())
    .query(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // TODO: Buscar no banco
      // const subscriber = await db.waitlist.findUnique({
      //   where: { email: input }
      // });

      return null;
    }),
});
