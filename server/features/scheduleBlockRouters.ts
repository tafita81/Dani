/**
 * Schedule Block Routers — tRPC Procedures para Bloqueio de Agenda
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  blockScheduleDay,
  blockSchedulePeriod,
  unblockScheduleDay,
  unblockSchedulePeriod,
  autoRescheduleAppointments,
  listScheduleBlocks,
  agentConversationWithPatient,
} from "./scheduleBlockManager";

export const scheduleBlockRouter = router({
  // ─── Bloquear Dia ───
  blockDay: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        reason: z.string(),
        autoReschedule: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return blockScheduleDay(
        ctx.user.id,
        input.date,
        input.reason,
        input.autoReschedule
      );
    }),

  // ─── Bloquear Período ───
  blockPeriod: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        startTime: z.string(), // "09:00"
        endTime: z.string(), // "12:00"
        reason: z.string(),
        autoReschedule: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return blockSchedulePeriod(
        ctx.user.id,
        input.date,
        input.date,
        input.startTime,
        input.endTime,
        input.reason,
        input.autoReschedule
      );
    }),

  // ─── Liberar Dia ───
  unblockDay: protectedProcedure
    .input(
      z.object({
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return unblockScheduleDay(ctx.user.id, input.date);
    }),

  // ─── Liberar Período ───
  unblockPeriod: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return unblockSchedulePeriod(
        ctx.user.id,
        input.date,
        input.startTime,
        input.endTime
      );
    }),

  // ─── Listar Bloqueios ───
  listBlocks: protectedProcedure.query(async ({ ctx }) => {
    return listScheduleBlocks(ctx.user.id);
  }),

  // ─── Reagendar Automaticamente ───
  autoReschedule: protectedProcedure
    .input(
      z.object({
        blockedDate: z.date(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return autoRescheduleAppointments(
        ctx.user.id,
        input.blockedDate,
        input.startTime || null,
        input.endTime || null
      );
    }),

  // ─── Conversa Automática com Paciente ───
  startAgentConversation: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        appointmentId: z.number(),
        newDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentConversationWithPatient(
        ctx.user.id,
        input.patientId,
        input.appointmentId,
        input.newDate
      );
    }),
});
