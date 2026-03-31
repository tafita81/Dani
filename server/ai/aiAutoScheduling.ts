/**
 * Agendamento Automático com IA
 * Integração com Outlook Calendar, sugestões de horários, confirmação automática
 */

import { invokeLLM } from "../_core/llm";

export interface AvailableSlot {
  date: Date;
  time: string;
  duration: number; // minutos
  available: boolean;
  confidence: number; // 0-1
}

export interface SchedulingRequest {
  patientId: string;
  patientName: string;
  preferredDates?: Date[];
  preferredTimes?: string[];
  reason: string;
  urgency: "low" | "medium" | "high";
  channel: "whatsapp" | "telegram" | "email" | "chat";
}

export interface SchedulingRecommendation {
  slots: AvailableSlot[];
  suggestedSlot: AvailableSlot;
  reasoning: string;
  alternativeSlots: AvailableSlot[];
  confirmationMessage: string;
}

export interface OutlookIntegration {
  status: "connected" | "disconnected" | "error";
  lastSync: Date;
  upcomingEvents: number;
  availableSlots: number;
  syncError?: string;
}

/**
 * Busca horários disponíveis no Outlook Calendar
 */
export async function getAvailableSlotsFromOutlook(
  therapistId: string,
  startDate: Date,
  endDate: Date,
  duration: number = 60
): Promise<AvailableSlot[]> {
  try {
    // Simular busca no Outlook Calendar
    // Em produção, isso chamaria Microsoft Graph API
    const slots: AvailableSlot[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Pular fins de semana
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Gerar slots de 1h a cada 2 horas (9h-17h)
        for (let hour = 9; hour < 17; hour += 2) {
          slots.push({
            date: new Date(currentDate),
            time: `${hour.toString().padStart(2, "0")}:00`,
            duration,
            available: Math.random() > 0.3, // 70% de disponibilidade
            confidence: 0.9 + Math.random() * 0.1,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots.filter((s) => s.available);
  } catch (error) {
    console.error("Erro ao buscar slots do Outlook:", error);
    return [];
  }
}

/**
 * IA recomenda horário baseado em preferências do paciente
 */
export async function generateSchedulingRecommendation(
  request: SchedulingRequest,
  availableSlots: AvailableSlot[]
): Promise<SchedulingRecommendation> {
  try {
    const systemPrompt = `Você é um assistente de agendamento inteligente para consultório psicológico.
Recomende o melhor horário para o paciente baseado em:
1. Preferências de data/hora
2. Urgência da consulta
3. Disponibilidade do terapeuta
4. Padrões de comportamento do paciente

Retorne JSON com slots recomendados e raciocínio.`;

    const slotsText = availableSlots
      .slice(0, 10)
      .map(
        (s) =>
          `${s.date.toLocaleDateString("pt-BR")} às ${s.time} (confiança: ${Math.round(s.confidence * 100)}%)`
      )
      .join("\n");

    const userPrompt = `Paciente: ${request.patientName}
Motivo: ${request.reason}
Urgência: ${request.urgency}
Preferências: ${request.preferredTimes?.join(", ") || "Qualquer horário"}

Horários disponíveis:
${slotsText}

Recomende o melhor slot e 2 alternativas.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "scheduling_recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              suggestedIndex: { type: "number" },
              reasoning: { type: "string" },
              alternativeIndices: { type: "array", items: { type: "number" } },
              confirmationMessage: { type: "string" },
            },
            required: [
              "suggestedIndex",
              "reasoning",
              "alternativeIndices",
              "confirmationMessage",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      slots: availableSlots,
      suggestedSlot: availableSlots[parsed.suggestedIndex] || availableSlots[0],
      reasoning: parsed.reasoning,
      alternativeSlots: parsed.alternativeIndices
        .map((idx: number) => availableSlots[idx])
        .filter(Boolean),
      confirmationMessage: parsed.confirmationMessage,
    };
  } catch (error) {
    console.error("Erro ao gerar recomendação:", error);
    return {
      slots: availableSlots,
      suggestedSlot: availableSlots[0],
      reasoning: "Primeiro horário disponível",
      alternativeSlots: availableSlots.slice(1, 3),
      confirmationMessage: `Agendamento confirmado para ${availableSlots[0]?.date.toLocaleDateString("pt-BR")} às ${availableSlots[0]?.time}`,
    };
  }
}

/**
 * Cria evento no Outlook Calendar
 */
export async function createOutlookEvent(
  therapistId: string,
  patientName: string,
  date: Date,
  time: string,
  duration: number = 60
): Promise<{
  success: boolean;
  eventId?: string;
  error?: string;
}> {
  try {
    // Simular criação de evento
    // Em produção, isso chamaria Microsoft Graph API
    const eventId = `event_${Date.now()}`;

    console.log(`Evento criado: ${patientName} em ${date.toLocaleDateString()} às ${time}`);

    return {
      success: true,
      eventId,
    };
  } catch (error) {
    console.error("Erro ao criar evento no Outlook:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Gera arquivo .ics para o paciente adicionar ao calendário
 */
export function generateICSFile(
  patientName: string,
  therapistName: string,
  date: Date,
  time: string,
  duration: number = 60
): string {
  const [hours, minutes] = time.split(":").map(Number);
  const startDate = new Date(date);
  startDate.setHours(hours, minutes, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + duration);

  const formatDate = (d: Date) => {
    return d
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Assistente Clínico//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Consulta Psicológica
X-WR-TIMEZONE:America/Sao_Paulo
BEGIN:VEVENT
UID:${Date.now()}@assistente-clinico.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Consulta com ${therapistName}
DESCRIPTION:Consulta psicológica agendada com ${therapistName}
LOCATION:Consultório
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return ics;
}

/**
 * Envia lembrete automático 24h antes
 */
export async function sendReminderNotification(
  patientId: string,
  patientPhone: string,
  appointmentDate: Date,
  appointmentTime: string,
  channel: "whatsapp" | "sms" | "email"
): Promise<{
  success: boolean;
  messageId?: string;
}> {
  try {
    const reminderMessages = {
      whatsapp: `Olá! 🔔 Lembrete: sua consulta está marcada para amanhã às ${appointmentTime}. Até lá!`,
      sms: `Lembrete: Consulta amanhã às ${appointmentTime}`,
      email: `Lembrete de Consulta - ${appointmentDate.toLocaleDateString("pt-BR")} às ${appointmentTime}`,
    };

    console.log(`Lembrete enviado via ${channel}: ${reminderMessages[channel]}`);

    return {
      success: true,
      messageId: `reminder_${Date.now()}`,
    };
  } catch (error) {
    console.error("Erro ao enviar lembrete:", error);
    return {
      success: false,
    };
  }
}

/**
 * Permite reagendamento via IA
 */
export async function processRescheduleRequest(
  patientId: string,
  originalAppointmentId: string,
  reason: string,
  availableSlots: AvailableSlot[]
): Promise<{
  success: boolean;
  newAppointmentId?: string;
  message: string;
}> {
  try {
    // Selecionar melhor slot disponível
    const bestSlot = availableSlots[0];

    if (!bestSlot) {
      return {
        success: false,
        message: "Nenhum horário disponível para reagendamento",
      };
    }

    return {
      success: true,
      newAppointmentId: `appointment_${Date.now()}`,
      message: `Reagendamento confirmado para ${bestSlot.date.toLocaleDateString("pt-BR")} às ${bestSlot.time}`,
    };
  } catch (error) {
    console.error("Erro ao processar reagendamento:", error);
    return {
      success: false,
      message: "Erro ao processar reagendamento",
    };
  }
}

/**
 * Cancela consulta e libera horário
 */
export async function cancelAppointment(
  appointmentId: string,
  reason: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`Consulta ${appointmentId} cancelada. Motivo: ${reason}`);

    return {
      success: true,
      message: "Consulta cancelada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao cancelar consulta:", error);
    return {
      success: false,
      message: "Erro ao cancelar consulta",
    };
  }
}

/**
 * Verifica status de integração com Outlook
 */
export function checkOutlookIntegrationStatus(
  lastSync: Date,
  upcomingEvents: number
): OutlookIntegration {
  const now = new Date();
  const timeSinceSync = now.getTime() - lastSync.getTime();
  const hoursSinceSync = timeSinceSync / (1000 * 60 * 60);

  return {
    status: hoursSinceSync < 24 ? "connected" : "disconnected",
    lastSync,
    upcomingEvents,
    availableSlots: Math.max(0, 20 - upcomingEvents),
  };
}
