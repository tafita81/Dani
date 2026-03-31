import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  blockTimeAndSync,
  unblockTimeAndSync,
  createAppointmentIfAvailable,
  updateAppointmentInBothSystems,
  deleteAppointmentAndSync,
  syncAllAppointmentsToOutlook,
} from "../integrations/outlookSync";
import { getDb } from "../core_logic/db";
import { appointments } from "../../drizzle/schema";
import { and, eq, gte, lt, lte } from "drizzle-orm";

/**
 * Router para o Assistente Carro controlar agenda
 */
export const carAssistantRouter = router({
  /**
   * Bloqueia um horário no calendário
   */
  blockTimeSlot: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await blockTimeAndSync(
          {
            start: input.startDate,
            end: input.endDate,
            reason: input.reason,
          },
          ctx.user.id
        );

        return {
          success: true,
          message: `✅ Horário bloqueado: ${input.reason}`,
        };
      } catch (error) {
        console.error("Erro ao bloquear horário:", error);
        throw error;
      }
    }),

  /**
   * Libera um horário bloqueado
   */
  unblockTimeSlot: protectedProcedure
    .input(z.object({ appointmentId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await unblockTimeAndSync(input.appointmentId);
        return { success: true, message: "✅ Horário liberado" };
      } catch (error) {
        console.error("Erro ao liberar horário:", error);
        throw error;
      }
    }),

  /**
   * Cria agendamento se disponível
   */
  createAppointment: protectedProcedure
    .input(
      z.object({
        patientId: z.string().optional(),
        title: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await createAppointmentIfAvailable(
          ctx.user.id,
          input.patientId || null,
          input.title,
          input.startDate,
          input.endDate,
          input.description
        );

        return {
          success: true,
          message: `✅ Agendamento criado: ${input.title}`,
        };
      } catch (error) {
        if (error instanceof Error && error.message === "Time slot not available") {
          return {
            success: false,
            message: "❌ Horário não disponível",
          };
        }
        throw error;
      }
    }),

  /**
   * Atualiza agendamento
   */
  updateAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const updates: any = {};
        if (input.title) updates.title = input.title;
        if (input.description) updates.description = input.description;
        if (input.status) updates.status = input.status;

        await updateAppointmentInBothSystems(input.appointmentId, updates);

        return { success: true, message: "✅ Agendamento atualizado" };
      } catch (error) {
        console.error("Erro ao atualizar:", error);
        throw error;
      }
    }),

  /**
   * Deleta agendamento
   */
  deleteAppointment: protectedProcedure
    .input(z.object({ appointmentId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteAppointmentAndSync(input.appointmentId);
        return { success: true, message: "✅ Agendamento deletado" };
      } catch (error) {
        console.error("Erro ao deletar:", error);
        throw error;
      }
    }),

  /**
   * Sincroniza todos os agendamentos
   */
  syncAllAppointments: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const count = await syncAllAppointmentsToOutlook();
      return {
        success: true,
        message: `✅ ${count} agendamentos sincronizados`,
        count,
      };
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      throw error;
    }
  }),

  /**
   * Obtém agendamentos de hoje
   */
  getTodayAppointments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.userId, ctx.user.id),
            gte(appointments.startTime, today.getTime()),
            lt(appointments.startTime, tomorrow.getTime())
          )
        );

      return {
        appointments: todayAppointments,
        count: todayAppointments.length,
        message: `✅ ${todayAppointments.length} agendamentos para hoje`,
      };
    } catch (error) {
      console.error("Erro ao obter agendamentos:", error);
      throw error;
    }
  }),

  /**
   * Obtém agendamentos de um período
   */
  getAppointmentsByPeriod: protectedProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const periodAppointments = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.userId, ctx.user.id),
              gte(appointments.startTime, input.startDate.getTime()),
              lte(appointments.startTime, input.endDate.getTime())
            )
          );

        return {
          appointments: periodAppointments,
          count: periodAppointments.length,
          message: `✅ ${periodAppointments.length} agendamentos encontrados`,
        };
      } catch (error) {
        console.error("Erro ao obter agendamentos:", error);
        throw error;
      }
    }),
});
