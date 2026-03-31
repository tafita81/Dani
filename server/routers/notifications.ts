import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  notifyReschedule,
  notifyConfirmation,
  notifyCancellation,
} from "../ai/emailService";
import {
  sendConfirmationViaWhatsApp,
  sendRescheduleViaWhatsApp,
  sendCancellationViaWhatsApp,
  sendReminderViaWhatsApp,
} from "../integrations/whatsappService";

export const notificationsRouter = router({
  /**
   * Notifica paciente sobre remarcação via e-mail
   */
  notifyRescheduleEmail: protectedProcedure
    .input(
      z.object({
        patientName: z.string(),
        patientEmail: z.string().email(),
        originalDate: z.date(),
        originalTime: z.string(),
        newDate: z.date(),
        newTime: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await notifyReschedule({
        patientName: input.patientName,
        patientEmail: input.patientEmail,
        originalDate: input.originalDate,
        originalTime: input.originalTime,
        newDate: input.newDate,
        newTime: input.newTime,
        reason: input.reason,
        therapistName: ctx.user.name || "Terapeuta",
      });

      return {
        success,
        message: success
          ? "E-mail de remarcação enviado com sucesso"
          : "Erro ao enviar e-mail",
      };
    }),

  /**
   * Notifica paciente sobre confirmação via e-mail
   */
  notifyConfirmationEmail: protectedProcedure
    .input(
      z.object({
        patientEmail: z.string().email(),
        patientName: z.string(),
        appointmentDate: z.date(),
        appointmentTime: z.string(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await notifyConfirmation(
        input.patientEmail,
        input.patientName,
        input.appointmentDate,
        input.appointmentTime,
        ctx.user.name || "Terapeuta",
        input.location
      );

      return {
        success,
        message: success
          ? "E-mail de confirmação enviado com sucesso"
          : "Erro ao enviar e-mail",
      };
    }),

  /**
   * Notifica paciente sobre cancelamento via e-mail
   */
  notifyCancellationEmail: protectedProcedure
    .input(
      z.object({
        patientName: z.string(),
        patientEmail: z.string().email(),
        appointmentDate: z.date(),
        appointmentTime: z.string(),
        reason: z.string().optional(),
        rescheduleLink: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await notifyCancellation({
        patientName: input.patientName,
        patientEmail: input.patientEmail,
        appointmentDate: input.appointmentDate,
        appointmentTime: input.appointmentTime,
        reason: input.reason,
        therapistName: ctx.user.name || "Terapeuta",
        rescheduleLink: input.rescheduleLink,
      });

      return {
        success,
        message: success
          ? "E-mail de cancelamento enviado com sucesso"
          : "Erro ao enviar e-mail",
      };
    }),

  /**
   * Envia confirmação via WhatsApp
   */
  sendWhatsAppConfirmation: protectedProcedure
    .input(
      z.object({
        patientPhone: z.string(),
        patientName: z.string(),
        appointmentDate: z.date(),
        appointmentTime: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await sendConfirmationViaWhatsApp({
        patientPhone: input.patientPhone,
        patientName: input.patientName,
        appointmentDate: input.appointmentDate,
        appointmentTime: input.appointmentTime,
        therapistName: ctx.user.name || "Terapeuta",
      });

      return {
        success,
        message: success
          ? "Mensagem WhatsApp enviada com sucesso"
          : "Erro ao enviar mensagem WhatsApp",
      };
    }),

  /**
   * Envia remarcação via WhatsApp
   */
  sendWhatsAppReschedule: protectedProcedure
    .input(
      z.object({
        patientPhone: z.string(),
        patientName: z.string(),
        originalDate: z.date(),
        originalTime: z.string(),
        newDate: z.date(),
        newTime: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await sendRescheduleViaWhatsApp({
        patientPhone: input.patientPhone,
        patientName: input.patientName,
        originalDate: input.originalDate,
        originalTime: input.originalTime,
        newDate: input.newDate,
        newTime: input.newTime,
        therapistName: ctx.user.name || "Terapeuta",
      });

      return {
        success,
        message: success
          ? "Mensagem WhatsApp de remarcação enviada com sucesso"
          : "Erro ao enviar mensagem WhatsApp",
      };
    }),

  /**
   * Envia cancelamento via WhatsApp
   */
  sendWhatsAppCancellation: protectedProcedure
    .input(
      z.object({
        patientPhone: z.string(),
        patientName: z.string(),
        appointmentDate: z.date(),
        appointmentTime: z.string(),
        rescheduleLink: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await sendCancellationViaWhatsApp({
        patientPhone: input.patientPhone,
        patientName: input.patientName,
        appointmentDate: input.appointmentDate,
        appointmentTime: input.appointmentTime,
        therapistName: ctx.user.name || "Terapeuta",
        rescheduleLink: input.rescheduleLink,
      });

      return {
        success,
        message: success
          ? "Mensagem WhatsApp de cancelamento enviada com sucesso"
          : "Erro ao enviar mensagem WhatsApp",
      };
    }),

  /**
   * Envia lembrete via WhatsApp
   */
  sendWhatsAppReminder: protectedProcedure
    .input(
      z.object({
        patientPhone: z.string(),
        patientName: z.string(),
        appointmentDate: z.date(),
        appointmentTime: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await sendReminderViaWhatsApp(
        input.patientPhone,
        input.patientName,
        input.appointmentDate,
        input.appointmentTime,
        ctx.user.name || "Terapeuta"
      );

      return {
        success,
        message: success
          ? "Lembrete WhatsApp enviado com sucesso"
          : "Erro ao enviar lembrete",
      };
    }),
});
