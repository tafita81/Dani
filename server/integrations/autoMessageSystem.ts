/**
 * AUTO MESSAGE SYSTEM — Mensagens Automáticas para Pacientes Afetados
 * 
 * Quando um horário é bloqueado, todos os pacientes agendados naquele período
 * recebem automaticamente mensagens no WhatsApp informando sobre o reagendamento
 * e oferecendo novos horários disponíveis.
 * 
 * Baseado nas diretrizes do repositório tafita81/Dani
 */

import { z } from "zod";
import { protectedProcedure } from "./trpc";
import { db } from "./db";
import { invokeLLM } from "./server/_core/llm";
import { appointmentTemplates, getTemplate } from "./messageTemplates";

// ═══════════════════════════════════════════════════════════════
// ─── TIPOS ───
// ═══════════════════════════════════════════════════════════════

export interface AffectedPatient {
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: Date;
  appointmentTime: string;
  preferredChannel: "whatsapp" | "telegram" | "sms" | "email";
}

export interface AutoMessageResult {
  success: boolean;
  affectedPatients: number;
  messagesSent: number;
  messagesFailed: number;
  details: Array<{
    patientId: number;
    patientName: string;
    status: "sent" | "failed";
    message: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// ─── ENCONTRAR PACIENTES AFETADOS ───
// ═══════════════════════════════════════════════════════════════

export async function findAffectedPatients(
  userId: number,
  blockedDate: Date,
  blockedStartTime?: string,
  blockedEndTime?: string
): Promise<AffectedPatient[]> {
  /**
   * Encontra todos os pacientes com agendamentos no dia/período bloqueado
   */

  try {
    // Buscar agendamentos no dia bloqueado
    const appointments = await db.getAppointmentsByDate(userId, blockedDate);

    if (!appointments || appointments.length === 0) {
      return [];
    }

    const affectedPatients: AffectedPatient[] = [];

    for (const appointment of appointments) {
      // Se é período, verificar se está dentro do horário bloqueado
      if (blockedStartTime && blockedEndTime) {
        const appointmentHour = parseInt(appointment.appointmentTime.split(":")[0]);
        const blockStart = parseInt(blockedStartTime.split(":")[0]);
        const blockEnd = parseInt(blockedEndTime.split(":")[0]);

        if (appointmentHour < blockStart || appointmentHour >= blockEnd) {
          continue; // Não afetado
        }
      }

      // Buscar informações do paciente
      const patient = await db.getPatientById(appointment.patientId);

      if (patient) {
        affectedPatients.push({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          patientName: patient.name || "Paciente",
          patientPhone: patient.phone || "",
          patientEmail: patient.email || "",
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          preferredChannel:
            (patient.preferredContactChannel as
              | "whatsapp"
              | "telegram"
              | "sms"
              | "email") || "whatsapp",
        });
      }
    }

    return affectedPatients;
  } catch (error) {
    console.error("Erro ao encontrar pacientes afetados:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR HORÁRIOS DISPONÍVEIS ───
// ═══════════════════════════════════════════════════════════════

export async function generateAvailableSlots(
  userId: number,
  daysAhead: number = 30
): Promise<
  Array<{
    date: string;
    slots: string[];
  }>
> {
  /**
   * Gera lista de horários disponíveis para os próximos dias
   */

  const availableSlots: Array<{ date: string; slots: string[] }> = [];

  // Verificar próximos 30 dias
  for (let i = 1; i <= daysAhead; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + i);

    // Pular fins de semana
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue;

    const dateStr = checkDate.toLocaleDateString("pt-BR");
    const slots: string[] = [];

    // Verificar horários disponíveis (9h-18h)
    for (let hour = 9; hour < 18; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;

      // Verificar se há agendamento conflitante
      const conflict = await db.getAppointmentByDateTime(
        userId,
        checkDate,
        timeStr
      );

      if (!conflict) {
        slots.push(timeStr);
      }
    }

    if (slots.length > 0) {
      availableSlots.push({
        date: dateStr,
        slots,
      });
    }

    // Se já temos 5 dias com slots disponíveis, parar
    if (availableSlots.length >= 5) break;
  }

  return availableSlots;
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR LINK DE REAGENDAMENTO ───
// ═══════════════════════════════════════════════════════════════

export async function generateRescheduleLink(
  patientId: number
): Promise<string> {
  /**
   * Gera link único para reagendamento
   */

  const token = Buffer.from(`patient_${patientId}_${Date.now()}`).toString(
    "base64"
  );
  const link = `https://clinassist-dqdp2gmy.manus.space/agendar?reschedule=${token}&patient=${patientId}`;

  return link;
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR MENSAGEM PERSONALIZADA COM IA ───
// ═══════════════════════════════════════════════════════════════

export async function generatePersonalizedMessage(
  patientName: string,
  originalDate: string,
  originalTime: string,
  blockReason: string,
  rescheduleLink: string,
  availableSlots: Array<{ date: string; slots: string[] }>
): Promise<string> {
  /**
   * Gera mensagem educada e personalizada usando IA
   */

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente de uma psicóloga profissional.

Gere uma mensagem educada, empática e profissional para informar que uma sessão foi reagendada por imprevisto.

DIRETRIZES:
- Seja empático(a) e compreensivo(a)
- Explique que foi um imprevisto
- Ofereça as novas opções de horários
- Inclua o link de reagendamento
- Mantenha tom profissional-humanizado
- Máximo 3-4 frases
- Use emojis discretamente
- Responda APENAS com a mensagem (sem explicações adicionais)`,
        },
        {
          role: "user",
          content: `Paciente: ${patientName}
Sessão original: ${originalDate} às ${originalTime}
Motivo do bloqueio: ${blockReason}
Horários disponíveis: ${availableSlots.map((s) => `${s.date} (${s.slots.join(", ")})`).join("; ")}
Link de reagendamento: ${rescheduleLink}`,
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Erro ao gerar mensagem personalizada:", error);
    // Fallback para template padrão
    return appointmentTemplates.rescheduleAppointment(
      patientName,
      originalDate,
      availableSlots[0]?.date || "em breve",
      availableSlots[0]?.slots[0] || "09:00",
      blockReason
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── ENVIAR MENSAGENS AUTOMÁTICAS ───
// ═══════════════════════════════════════════════════════════════

export async function sendAutoMessages(
  affectedPatients: AffectedPatient[],
  blockReason: string,
  availableSlots: Array<{ date: string; slots: string[] }>
): Promise<AutoMessageResult> {
  /**
   * Envia mensagens automáticas para todos os pacientes afetados
   */

  const result: AutoMessageResult = {
    success: true,
    affectedPatients: affectedPatients.length,
    messagesSent: 0,
    messagesFailed: 0,
    details: [],
  };

  for (const patient of affectedPatients) {
    try {
      // Gerar link de reagendamento
      const rescheduleLink = await generateRescheduleLink(patient.patientId);

      // Gerar mensagem personalizada
      const message = await generatePersonalizedMessage(
        patient.patientName,
        patient.appointmentDate.toLocaleDateString("pt-BR"),
        patient.appointmentTime,
        blockReason,
        rescheduleLink,
        availableSlots
      );

      // Enviar mensagem via canal preferido
      await sendMessageViaChannel(
        patient.patientPhone,
        patient.patientEmail,
        message,
        rescheduleLink,
        patient.preferredChannel
      );

      // Registrar no banco de dados
      await db.createAutoMessage({
        patientId: patient.patientId,
        appointmentId: patient.appointmentId,
        messageContent: message,
        sentVia: patient.preferredChannel,
        rescheduleLink,
        status: "sent",
      });

      result.messagesSent++;
      result.details.push({
        patientId: patient.patientId,
        patientName: patient.patientName,
        status: "sent",
        message: `Mensagem enviada via ${patient.preferredChannel}`,
      });
    } catch (error) {
      result.messagesFailed++;
      result.details.push({
        patientId: patient.patientId,
        patientName: patient.patientName,
        status: "failed",
        message: `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// ─── ENVIAR MENSAGEM VIA CANAL ───
// ═══════════════════════════════════════════════════════════════

async function sendMessageViaChannel(
  phone: string,
  email: string,
  message: string,
  rescheduleLink: string,
  channel: "whatsapp" | "telegram" | "sms" | "email"
): Promise<void> {
  /**
   * Envia mensagem via canal específico
   */

  try {
    switch (channel) {
      case "whatsapp":
        // TODO: Integrar com API WhatsApp
        console.log(`[WhatsApp] Enviando para ${phone}: ${message}`);
        console.log(`[WhatsApp] Link: ${rescheduleLink}`);
        break;

      case "telegram":
        // TODO: Integrar com API Telegram
        console.log(`[Telegram] Enviando para ${phone}: ${message}`);
        console.log(`[Telegram] Link: ${rescheduleLink}`);
        break;

      case "sms":
        // TODO: Integrar com API SMS
        console.log(`[SMS] Enviando para ${phone}: ${message}`);
        break;

      case "email":
        // TODO: Integrar com API Email
        console.log(`[Email] Enviando para ${email}: ${message}`);
        console.log(`[Email] Link: ${rescheduleLink}`);
        break;
    }
  } catch (error) {
    console.error(`Erro ao enviar via ${channel}:`, error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── PROCEDURE: BLOQUEAR E NOTIFICAR AUTOMATICAMENTE ───
// ═══════════════════════════════════════════════════════════════

export const autoMessageProcedure = protectedProcedure
  .input(
    z.object({
      blockedDate: z.number(),
      blockedStartTime: z.string().optional(),
      blockedEndTime: z.string().optional(),
      blockReason: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // 1. Encontrar pacientes afetados
      const affectedPatients = await findAffectedPatients(
        ctx.user.id,
        new Date(input.blockedDate),
        input.blockedStartTime,
        input.blockedEndTime
      );

      if (affectedPatients.length === 0) {
        return {
          success: true,
          message: "Nenhum paciente afetado",
          affectedPatients: 0,
          messagesSent: 0,
        };
      }

      // 2. Gerar horários disponíveis
      const availableSlots = await generateAvailableSlots(ctx.user.id);

      // 3. Enviar mensagens automáticas
      const result = await sendAutoMessages(
        affectedPatients,
        input.blockReason,
        availableSlots
      );

      return {
        success: result.success,
        message: `${result.messagesSent} mensagens enviadas, ${result.messagesFailed} falharam`,
        affectedPatients: result.affectedPatients,
        messagesSent: result.messagesSent,
        messagesFailed: result.messagesFailed,
        details: result.details,
      };
    } catch (error) {
      console.error("Erro ao processar bloqueio e notificações:", error);
      throw error;
    }
  });
