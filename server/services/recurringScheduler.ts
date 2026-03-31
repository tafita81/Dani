/**
 * Módulo de Agendamento Recorrente de Sessões
 * Gerencia sessões recorrentes (semanal, quinzenal, mensal)
 * com sincronização automática com Outlook Calendar
 */

import { db } from "./db";
import { appointments } from "../drizzle/schema";
import { syncAppointmentToOutlook } from "./outlookSync";
import { sendWhatsAppReminder } from "./whatsappService";
import { notifyOwner } from "./_core/notification";

export type RecurrencePattern = "weekly" | "biweekly" | "monthly" | "custom";
export type RecurrenceEnd = "never" | "after_count" | "on_date";

export interface RecurringSession {
  id: string;
  patientId: string;
  therapistId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string; // HH:MM
  duration: number; // em minutos
  pattern: RecurrencePattern;
  customIntervalDays?: number; // para pattern "custom"
  endType: RecurrenceEnd;
  endDate?: Date;
  endCount?: number;
  occurrencesCreated: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringSessionInstance {
  appointmentId: string;
  recurringSessionId: string;
  scheduledDate: Date;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  outlookEventId?: string;
  createdAt: Date;
}

// Mapa de padrões de recorrência
const RECURRENCE_PATTERNS: Record<RecurrencePattern, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  custom: 0, // usa customIntervalDays
};

/**
 * Calcula a próxima data de agendamento baseado no padrão
 */
function getNextOccurrenceDate(
  currentDate: Date,
  pattern: RecurrencePattern,
  customIntervalDays?: number,
  dayOfWeek?: number
): Date {
  const next = new Date(currentDate);

  if (pattern === "weekly" && dayOfWeek !== undefined) {
    // Próxima ocorrência no dia da semana especificado
    const daysUntil = (dayOfWeek - next.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
  } else if (pattern === "biweekly") {
    next.setDate(next.getDate() + 14);
  } else if (pattern === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (pattern === "custom" && customIntervalDays) {
    next.setDate(next.getDate() + customIntervalDays);
  }

  return next;
}

/**
 * Verifica se a recorrência deve terminar
 */
function shouldEndRecurrence(
  session: RecurringSession,
  occurrenceNumber: number
): boolean {
  if (session.endType === "never") {
    return false;
  }

  if (session.endType === "after_count" && session.endCount) {
    return occurrenceNumber >= session.endCount;
  }

  if (session.endType === "on_date" && session.endDate) {
    return new Date() >= session.endDate;
  }

  return false;
}

/**
 * Cria agendamentos para uma sessão recorrente
 */
export async function createRecurringSessionInstances(
  session: RecurringSession,
  startDate: Date = new Date(),
  maxInstances: number = 52 // até 1 ano
) {
  const instances: RecurringSessionInstance[] = [];
  let currentDate = new Date(startDate);
  let occurrenceNumber = session.occurrencesCreated + 1;

  while (
    instances.length < maxInstances &&
    !shouldEndRecurrence(session, occurrenceNumber)
  ) {
    // Pula para o próximo dia da semana/período
    currentDate = getNextOccurrenceDate(
      currentDate,
      session.pattern,
      session.customIntervalDays,
      session.dayOfWeek
    );

    // Verifica se não ultrapassou a data de término
    if (session.endType === "on_date" && session.endDate) {
      if (currentDate > session.endDate) {
        break;
      }
    }

    // Cria agendamento
    const [timeHour, timeMinute] = session.time.split(":").map(Number);
    const appointmentDate = new Date(currentDate);
    appointmentDate.setHours(timeHour, timeMinute, 0, 0);

    const appointment = await db
      .insert(appointments)
      .values({
        patientId: session.patientId,
        therapistId: session.therapistId,
        appointmentDate,
        duration: session.duration,
        status: "scheduled",
        notes: `Sessão recorrente: ${session.notes || ""}`,
        recurringSessionId: session.id,
      })
      .returning();

    if (appointment[0]) {
      // Sincroniza com Outlook
      try {
        const outlookEvent = await syncAppointmentToOutlook(
          appointment[0].id,
          appointmentDate,
          session.duration,
          `Sessão com ${session.patientId}`
        );

        instances.push({
          appointmentId: appointment[0].id,
          recurringSessionId: session.id,
          scheduledDate: appointmentDate,
          status: "scheduled",
          outlookEventId: outlookEvent?.eventId,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error("Erro ao sincronizar com Outlook:", error);
        instances.push({
          appointmentId: appointment[0].id,
          recurringSessionId: session.id,
          scheduledDate: appointmentDate,
          status: "scheduled",
          createdAt: new Date(),
        });
      }
    }

    occurrenceNumber++;
  }

  return instances;
}

/**
 * Processa lembretes para sessões recorrentes
 */
export async function processRecurringSessionReminders() {
  const now = new Date();

  // Lembretes 24 horas antes
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Lembretes 1 hora antes
  const in1Hour = new Date(now);
  in1Hour.setHours(in1Hour.getHours() + 1);

  // Busca agendamentos que precisam de lembrete
  const appointmentsForReminder = await db.query.appointments.findMany({
    where: (appointments, { and, eq, gte, lte }) =>
      and(
        eq(appointments.status, "scheduled"),
        gte(appointments.appointmentDate, now),
        lte(appointments.appointmentDate, in1Hour)
      ),
  });

  for (const appointment of appointmentsForReminder) {
    try {
      // Envia lembrete via WhatsApp
      const reminderText = generateReminderMessage(
        appointment.appointmentDate,
        appointment.duration
      );

      await sendWhatsAppReminder(
        appointment.patientId,
        reminderText,
        appointment.id
      );
    } catch (error) {
      console.error(
        `Erro ao enviar lembrete para agendamento ${appointment.id}:`,
        error
      );
    }
  }
}

/**
 * Gera mensagem de lembrete humanizada
 */
function generateReminderMessage(
  appointmentDate: Date,
  duration: number
): string {
  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const time = timeFormatter.format(appointmentDate);
  const messages = [
    `Olá! Lembrando que você tem uma sessão conosco em ${time} 🕐`,
    `Não esqueça! Sua consulta está marcada para ${time}. Estamos te esperando! 💙`,
    `Oi! Só confirmando: sua sessão é hoje às ${time}. Até lá! 😊`,
    `Lembrete: sua consulta com a Psi. Daniela é em ${time}. Vamos conversar? 🌟`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Cancela uma série de sessões recorrentes
 */
export async function cancelRecurringSeries(
  recurringSessionId: string,
  fromDate: Date = new Date()
) {
  // Busca todos os agendamentos da série a partir da data
  const appointmentsToCancel = await db.query.appointments.findMany({
    where: (appointments, { and, eq, gte }) =>
      and(
        eq(appointments.recurringSessionId, recurringSessionId),
        gte(appointments.appointmentDate, fromDate)
      ),
  });

  for (const appointment of appointmentsToCancel) {
    // Atualiza status para cancelado
    await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where((appointments) => appointments.id === appointment.id);

    // Notifica paciente
    try {
      const cancelMessage = generateCancellationMessage(appointment.appointmentDate);
      await sendWhatsAppReminder(
        appointment.patientId,
        cancelMessage,
        appointment.id
      );
    } catch (error) {
      console.error("Erro ao notificar cancelamento:", error);
    }
  }

  return appointmentsToCancel.length;
}

/**
 * Gera mensagem de cancelamento humanizada
 */
function generateCancellationMessage(appointmentDate: Date): string {
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = dateFormatter.format(appointmentDate);
  const messages = [
    `Infelizmente, precisamos remarcar sua sessão de ${formattedDate}. Entraremos em contato para agendar um novo horário! 📅`,
    `Sua consulta de ${formattedDate} foi cancelada. Desculpe o inconveniente! Vamos reagendar em breve. 💙`,
    `Comunicado: a sessão de ${formattedDate} foi cancelada. Falaremos com você em breve para reagendar! 🙏`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Edita uma sessão recorrente
 */
export async function updateRecurringSession(
  recurringSessionId: string,
  updates: Partial<RecurringSession>
) {
  // Atualiza a sessão recorrente
  const updated = await db.query.appointments.findMany({
    where: (appointments, { eq }) => eq(appointments.recurringSessionId, recurringSessionId),
  });

  // Se mudou o horário, atualiza os agendamentos futuros
  if (updates.time || updates.dayOfWeek || updates.duration) {
    const now = new Date();
    for (const appointment of updated) {
      if (appointment.appointmentDate > now) {
        if (updates.time) {
          const [hour, minute] = updates.time.split(":").map(Number);
          appointment.appointmentDate.setHours(hour, minute, 0, 0);
        }

        if (updates.duration) {
          appointment.duration = updates.duration;
        }

        // Sincroniza com Outlook
        try {
          await syncAppointmentToOutlook(
            appointment.id,
            appointment.appointmentDate,
            appointment.duration,
            `Sessão com ${appointment.patientId}`
          );
        } catch (error) {
          console.error("Erro ao atualizar Outlook:", error);
        }
      }
    }
  }

  return updated;
}

/**
 * Gera relatório de sessões recorrentes
 */
export async function getRecurringSessionReport(
  therapistId: string,
  startDate: Date,
  endDate: Date
) {
  const appointments = await db.query.appointments.findMany({
    where: (appointments, { and, eq, gte, lte }) =>
      and(
        eq(appointments.therapistId, therapistId),
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate)
      ),
  });

  const recurringAppointments = appointments.filter(
    (a) => a.recurringSessionId
  );

  return {
    totalAppointments: appointments.length,
    recurringAppointments: recurringAppointments.length,
    recurringPercentage: (
      (recurringAppointments.length / appointments.length) *
      100
    ).toFixed(2),
    byStatus: {
      scheduled: appointments.filter((a) => a.status === "scheduled").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      rescheduled: appointments.filter((a) => a.status === "rescheduled").length,
    },
  };
}
