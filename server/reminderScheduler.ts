/**
 * Módulo de agendamento automático de lembretes
 * Envia lembretes em intervalos configuráveis antes da consulta
 */

import { sendReminderViaWhatsApp } from "./whatsappService";
import { notifyConfirmation } from "./emailService";

export interface ReminderConfig {
  hoursBeforeAppointment: number; // 24, 1, 0.25 (15 min)
  channel: "email" | "whatsapp" | "both";
  enabled: boolean;
}

export interface ScheduledReminder {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: Date;
  appointmentTime: string;
  therapistName: string;
  reminderTime: Date;
  hoursBeforeAppointment: number;
  channel: "email" | "whatsapp" | "both";
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  error?: string;
}

export interface ReminderLog {
  id: string;
  scheduledReminderId: string;
  appointmentId: string;
  channel: "email" | "whatsapp";
  status: "success" | "failed";
  message: string;
  sentAt: Date;
}

// Fila de lembretes pendentes
const reminderQueue: Map<string, ScheduledReminder> = new Map();

// Configurações padrão de lembretes
const DEFAULT_REMINDER_CONFIG: ReminderConfig[] = [
  { hoursBeforeAppointment: 24, channel: "whatsapp", enabled: true },
  { hoursBeforeAppointment: 1, channel: "both", enabled: true },
  { hoursBeforeAppointment: 0.25, channel: "whatsapp", enabled: true }, // 15 minutos
];

/**
 * Agenda lembretes para um agendamento
 */
export function scheduleReminders(
  appointmentId: string,
  patientName: string,
  patientPhone: string,
  patientEmail: string,
  appointmentDate: Date,
  appointmentTime: string,
  therapistName: string,
  configs: ReminderConfig[] = DEFAULT_REMINDER_CONFIG
): ScheduledReminder[] {
  const scheduledReminders: ScheduledReminder[] = [];

  for (const config of configs) {
    if (!config.enabled) continue;

    // Calcular tempo do lembrete
    const reminderTime = new Date(appointmentDate);
    reminderTime.setHours(reminderTime.getHours() - config.hoursBeforeAppointment);

    const reminder: ScheduledReminder = {
      id: `reminder_${Date.now()}_${Math.random()}`,
      appointmentId,
      patientName,
      patientPhone,
      patientEmail,
      appointmentDate,
      appointmentTime,
      therapistName,
      reminderTime,
      hoursBeforeAppointment: config.hoursBeforeAppointment,
      channel: config.channel,
      status: "pending",
    };

    reminderQueue.set(reminder.id, reminder);
    scheduledReminders.push(reminder);

    console.log(
      `[Reminder Scheduler] Agendado lembrete para ${patientName} em ${reminderTime.toLocaleString()}`
    );
  }

  return scheduledReminders;
}

/**
 * Cancela lembretes agendados para um agendamento
 */
export function cancelReminders(appointmentId: string): number {
  let cancelled = 0;

  for (const [id, reminder] of Array.from(reminderQueue)) {
    if (reminder.appointmentId === appointmentId) {
      reminderQueue.delete(id);
      cancelled++;
      console.log(
        `[Reminder Scheduler] Cancelado lembrete ${id} para agendamento ${appointmentId}`
      );
    }
  }

  return cancelled;
}

/**
 * Processa lembretes pendentes (deve ser chamado periodicamente)
 */
export async function processPendingReminders(): Promise<ReminderLog[]> {
  const logs: ReminderLog[] = [];
  const now = new Date();

  for (const [id, reminder] of Array.from(reminderQueue)) {
    // Verificar se é hora de enviar o lembrete
    if (reminder.status === "pending" && reminder.reminderTime <= now) {
      console.log(
        `[Reminder Scheduler] Processando lembrete ${id} para ${reminder.patientName}`
      );

      // Enviar via WhatsApp
      if (reminder.channel === "whatsapp" || reminder.channel === "both") {
        const whatsappSuccess = await sendReminderViaWhatsApp(
          reminder.patientPhone,
          reminder.patientName,
          reminder.appointmentDate,
          reminder.appointmentTime,
          reminder.therapistName
        );

        const log: ReminderLog = {
          id: `log_${Date.now()}_whatsapp`,
          scheduledReminderId: id,
          appointmentId: reminder.appointmentId,
          channel: "whatsapp",
          status: whatsappSuccess ? "success" : "failed",
          message: whatsappSuccess
            ? `Lembrete enviado via WhatsApp para ${reminder.patientPhone}`
            : `Falha ao enviar lembrete via WhatsApp para ${reminder.patientPhone}`,
          sentAt: new Date(),
        };

        logs.push(log);

        if (whatsappSuccess) {
          reminder.status = "sent";
          reminder.sentAt = new Date();
        } else {
          reminder.status = "failed";
          reminder.error = "Falha ao enviar via WhatsApp";
        }
      }

      // Enviar via E-mail
      if (reminder.channel === "email" || reminder.channel === "both") {
        const emailSuccess = await notifyConfirmation(
          reminder.patientEmail,
          reminder.patientName,
          reminder.appointmentDate,
          reminder.appointmentTime,
          reminder.therapistName
        );

        const log: ReminderLog = {
          id: `log_${Date.now()}_email`,
          scheduledReminderId: id,
          appointmentId: reminder.appointmentId,
          channel: "email",
          status: emailSuccess ? "success" : "failed",
          message: emailSuccess
            ? `Lembrete enviado via E-mail para ${reminder.patientEmail}`
            : `Falha ao enviar lembrete via E-mail para ${reminder.patientEmail}`,
          sentAt: new Date(),
        };

        logs.push(log);

        if (emailSuccess && reminder.status !== "failed") {
          reminder.status = "sent";
          reminder.sentAt = new Date();
        }
      }
    }
  }

  return logs;
}

/**
 * Obtém lembretes agendados para um agendamento
 */
export function getScheduledReminders(appointmentId: string): ScheduledReminder[] {
  const reminders: ScheduledReminder[] = [];

  for (const reminder of Array.from(reminderQueue.values())) {
    if (reminder.appointmentId === appointmentId) {
      reminders.push(reminder);
    }
  }

  return reminders;
}

/**
 * Obtém estatísticas de lembretes
 */
export function getReminderStats(): {
  total: number;
  pending: number;
  sent: number;
  failed: number;
} {
  let total = 0;
  let pending = 0;
  let sent = 0;
  let failed = 0;

  for (const reminder of Array.from(reminderQueue.values())) {
    total++;
    if (reminder.status === "pending") pending++;
    else if (reminder.status === "sent") sent++;
    else if (reminder.status === "failed") failed++;
  }

  return { total, pending, sent, failed };
}

/**
 * Limpa lembretes antigos (enviados ou falhados há mais de 7 dias)
 */
export function cleanupOldReminders(daysOld: number = 7): number {
  let cleaned = 0;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  for (const [id, reminder] of Array.from(reminderQueue)) {
    if (
      reminder.status !== "pending" &&
      reminder.sentAt &&
      reminder.sentAt < cutoffDate
    ) {
      reminderQueue.delete(id);
      cleaned++;
    }
  }

  console.log(`[Reminder Scheduler] Limpeza: ${cleaned} lembretes removidos`);
  return cleaned;
}

/**
 * Inicia o processador de lembretes (deve ser chamado no startup do servidor)
 * Processa lembretes a cada minuto
 */
export function startReminderProcessor(intervalMinutes: number = 1): ReturnType<typeof setInterval> {
  console.log(
    `[Reminder Scheduler] Iniciando processador de lembretes (intervalo: ${intervalMinutes}min)`
  );

  return setInterval(async () => {
    try {
      const logs = await processPendingReminders();

      if (logs.length > 0) {
        console.log(
          `[Reminder Scheduler] Processados ${logs.length} lembretes`
        );
        logs.forEach((log) => {
          console.log(
            `  - ${log.channel.toUpperCase()}: ${log.status} - ${log.message}`
          );
        });
      }

      // Limpeza semanal
      if (Math.random() < 0.01) {
        // ~1% de chance a cada execução
        cleanupOldReminders();
      }
    } catch (error) {
      console.error("[Reminder Scheduler] Erro ao processar lembretes:", error);
    }
  }, intervalMinutes * 60 * 1000);
}

/**
 * Para o processador de lembretes
 */
export function stopReminderProcessor(timer: ReturnType<typeof setInterval>): void {
  clearInterval(timer);
  console.log("[Reminder Scheduler] Processador de lembretes parado");
}
