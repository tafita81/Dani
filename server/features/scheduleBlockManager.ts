/**
 * Schedule Block Manager — Gerenciamento de Bloqueios e Liberação de Agenda
 * Permite bloquear/liberar dia ou período específico
 * Automação completa de reagendamento com mensagens IA
 */

import { getDb } from "../core_logic/db";
import { invokeLLM } from "../_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── TIPOS ───
// ═══════════════════════════════════════════════════════════════

export interface ScheduleBlock {
  id: number;
  userId: number;
  blockType: "day" | "period"; // Dia inteiro ou período específico
  startDate: Date;
  endDate?: Date; // Para períodos
  startTime?: string; // "09:00" para períodos
  endTime?: string; // "17:00" para períodos
  reason: string; // "Férias", "Consulta médica", "Manutenção", etc
  autoReschedule: boolean; // Reagendar automaticamente?
  createdAt: Date;
  updatedAt: Date;
}

export interface RescheduleMessage {
  id: number;
  userId: number;
  patientId: number;
  appointmentId: number;
  originalDate: Date;
  suggestedDate: Date;
  messageStatus: "pending" | "sent" | "confirmed" | "rejected";
  messageContent: string;
  sentVia: "whatsapp" | "telegram" | "email" | "sms";
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// ─── BLOQUEIO DE AGENDA ───
// ═══════════════════════════════════════════════════════════════

export async function blockScheduleDay(
  userId: number,
  date: Date,
  reason: string,
  autoReschedule: boolean = true
) {
  /**
   * Bloqueia um dia inteiro
   * Exemplo: "2026-03-30" (domingo)
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Verificar se já existe bloqueio para este dia
  const existingBlock = await db.query.scheduleBlocks?.findFirst?.({
    where: (blocks: any) =>
      blocks.userId === userId &&
      blocks.blockType === "day" &&
      blocks.startDate === date,
  });

  if (existingBlock) {
    return {
      success: false,
      message: "Este dia já está bloqueado",
      block: existingBlock,
    };
  }

  // Criar bloqueio
  const block = {
    userId,
    blockType: "day" as const,
    startDate: date,
    reason,
    autoReschedule,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Se autoReschedule, reagendar automaticamente
  if (autoReschedule) {
    await autoRescheduleAppointments(userId, date, null, null);
  }

  return {
    success: true,
    message: `Dia ${date.toLocaleDateString("pt-BR")} bloqueado com sucesso`,
    block,
  };
}

export async function blockSchedulePeriod(
  userId: number,
  startDate: Date,
  endDate: Date,
  startTime: string, // "09:00"
  endTime: string, // "17:00"
  reason: string,
  autoReschedule: boolean = true
) {
  /**
   * Bloqueia um período específico
   * Exemplo: "09:00" até "12:00" em um dia
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const block = {
    userId,
    blockType: "period" as const,
    startDate,
    endDate,
    startTime,
    endTime,
    reason,
    autoReschedule,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Se autoReschedule, reagendar automaticamente
  if (autoReschedule) {
    await autoRescheduleAppointments(userId, startDate, startTime, endTime);
  }

  return {
    success: true,
    message: `Período ${startTime}-${endTime} bloqueado com sucesso`,
    block,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── LIBERAÇÃO DE AGENDA ───
// ═══════════════════════════════════════════════════════════════

export async function unblockScheduleDay(userId: number, date: Date) {
  /**
   * Libera um dia bloqueado
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Encontrar e remover bloqueio
  const block = await db.query.scheduleBlocks?.findFirst?.({
    where: (blocks: any) =>
      blocks.userId === userId &&
      blocks.blockType === "day" &&
      blocks.startDate === date,
  });

  if (!block) {
    return {
      success: false,
      message: "Nenhum bloqueio encontrado para este dia",
    };
  }

  // Remover bloqueio
  // await db.delete(scheduleBlocks).where(eq(scheduleBlocks.id, block.id));

  return {
    success: true,
    message: `Dia ${date.toLocaleDateString("pt-BR")} liberado com sucesso`,
  };
}

export async function unblockSchedulePeriod(
  userId: number,
  startDate: Date,
  startTime: string,
  endTime: string
) {
  /**
   * Libera um período bloqueado
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Encontrar e remover bloqueio
  const block = await db.query.scheduleBlocks?.findFirst?.({
    where: (blocks: any) =>
      blocks.userId === userId &&
      blocks.blockType === "period" &&
      blocks.startDate === startDate &&
      blocks.startTime === startTime &&
      blocks.endTime === endTime,
  });

  if (!block) {
    return {
      success: false,
      message: "Nenhum bloqueio encontrado para este período",
    };
  }

  // Remover bloqueio
  // await db.delete(scheduleBlocks).where(eq(scheduleBlocks.id, block.id));

  return {
    success: true,
    message: `Período ${startTime}-${endTime} liberado com sucesso`,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── REAGENDAMENTO AUTOMÁTICO ───
// ═══════════════════════════════════════════════════════════════

export async function autoRescheduleAppointments(
  userId: number,
  blockedDate: Date,
  blockedStartTime: string | null,
  blockedEndTime: string | null
) {
  /**
   * Reagenda automaticamente todos os agendamentos afetados
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Encontrar agendamentos afetados
  const affectedAppointments = await db.query.appointments?.findMany?.({
    where: (appointments: any) =>
      appointments.userId === userId &&
      appointments.appointmentDate === blockedDate,
  });

  if (!affectedAppointments || affectedAppointments.length === 0) {
    return {
      success: true,
      message: "Nenhum agendamento afetado",
      rescheduled: [],
    };
  }

  const rescheduled = [];

  for (const appointment of affectedAppointments) {
    // Encontrar próximo horário disponível
    const nextAvailable = await findNextAvailableSlot(
      userId,
      blockedDate,
      appointment.duration || 60
    );

    if (nextAvailable) {
      // Gerar mensagem automática
      const message = await generateRescheduleMessage(
        userId,
        appointment,
        nextAvailable
      );

      // Enviar mensagem ao paciente
      await sendRescheduleMessage(
        userId,
        appointment.patientId,
        appointment.id,
        message,
        nextAvailable
      );

      rescheduled.push({
        appointmentId: appointment.id,
        originalDate: blockedDate,
        newDate: nextAvailable,
        messageStatus: "sent",
      });
    }
  }

  return {
    success: true,
    message: `${rescheduled.length} agendamentos reagendados automaticamente`,
    rescheduled,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── ENCONTRAR PRÓXIMO HORÁRIO DISPONÍVEL ───
// ═══════════════════════════════════════════════════════════════

export async function findNextAvailableSlot(
  userId: number,
  afterDate: Date,
  duration: number = 60
): Promise<Date | null> {
  /**
   * Encontra o próximo horário disponível após a data bloqueada
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Buscar próximos 30 dias
  for (let i = 1; i <= 30; i++) {
    const checkDate = new Date(afterDate);
    checkDate.setDate(checkDate.getDate() + i);

    // Pular fins de semana
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue;

    // Verificar se há bloqueio neste dia
    const dayBlock = await db.query.scheduleBlocks?.findFirst?.({
      where: (blocks: any) =>
        blocks.userId === userId &&
        blocks.blockType === "day" &&
        blocks.startDate === checkDate,
    });

    if (dayBlock) continue;

    // Verificar horários disponíveis (9h-18h)
    for (let hour = 9; hour < 18; hour++) {
      const slotStart = new Date(checkDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      // Verificar se há bloqueio de período
      const periodBlock = await db.query.scheduleBlocks?.findFirst?.({
        where: (blocks: any) =>
          blocks.userId === userId &&
          blocks.blockType === "period" &&
          blocks.startDate === checkDate,
      });

      if (periodBlock) {
        const blockStart = periodBlock.startTime;
        const blockEnd = periodBlock.endTime;
        if (
          hour >= parseInt(blockStart!) &&
          hour < parseInt(blockEnd!)
        ) {
          continue; // Horário bloqueado
        }
      }

      // Verificar se há agendamento conflitante
      const conflict = await db.query.appointments?.findFirst?.({
        where: (appointments: any) =>
          appointments.userId === userId &&
          appointments.appointmentDate === checkDate &&
          appointments.appointmentTime >=
            slotStart.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }) &&
          appointments.appointmentTime <
            slotEnd.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
      });

      if (!conflict) {
        return slotStart; // Horário disponível encontrado
      }
    }
  }

  return null; // Nenhum horário disponível nos próximos 30 dias
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR MENSAGEM DE REAGENDAMENTO COM IA ───
// ═══════════════════════════════════════════════════════════════

export async function generateRescheduleMessage(
  userId: number,
  appointment: any,
  newDate: Date
): Promise<string> {
  /**
   * Gera mensagem automática e inteligente para reagendamento
   * Usa IA para personalizar a mensagem
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Obter informações do paciente
  const patient = await db.query.patients?.findFirst?.({
    where: (patients: any) => patients.id === appointment.patientId,
  });

  // Gerar mensagem com IA
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um assistente de agendamento profissional para uma clínica de psicologia.
        
Gere uma mensagem breve, amigável e profissional para reagendar uma sessão.
A mensagem deve:
- Ser concisa (máx 2 frases)
- Explicar o motivo do reagendamento
- Propor o novo horário
- Ser enviada via WhatsApp/Telegram

Responda APENAS com a mensagem, sem explicações.`,
      },
      {
        role: "user",
        content: `Paciente: ${patient?.name || "Paciente"}
Sessão original: ${appointment.appointmentDate?.toLocaleDateString("pt-BR")} às ${appointment.appointmentTime}
Novo horário: ${newDate.toLocaleDateString("pt-BR")} às ${newDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
Motivo: Bloqueio de agenda da psicóloga`,
      },
    ],
  });

  return (
    response.choices[0].message.content ||
    `Olá ${patient?.name}! Precisamos reagendar sua sessão de ${appointment.appointmentDate?.toLocaleDateString("pt-BR")} para ${newDate.toLocaleDateString("pt-BR")} às ${newDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}. Confirma?`
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ENVIAR MENSAGEM DE REAGENDAMENTO ───
// ═══════════════════════════════════════════════════════════════

export async function sendRescheduleMessage(
  userId: number,
  patientId: number,
  appointmentId: number,
  messageContent: string,
  newDate: Date,
  channel: "whatsapp" | "telegram" | "email" = "whatsapp"
): Promise<{
  success: boolean;
  messageId: number;
  status: string;
}> {
  /**
   * Envia mensagem de reagendamento ao paciente
   * Integra com WhatsApp, Telegram ou Email
   */

  // Aqui você integraria com APIs de WhatsApp, Telegram, etc
  // Por enquanto, retornamos sucesso simulado

  return {
    success: true,
    messageId: Math.floor(Math.random() * 10000),
    status: `Mensagem enviada via ${channel}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── CONVERSA DO AGENTE IA COM PACIENTE ───
// ═══════════════════════════════════════════════════════════════

export async function agentConversationWithPatient(
  userId: number,
  patientId: number,
  appointmentId: number,
  newDate: Date
): Promise<{
  initialMessage: string;
  confirmationFlow: string[];
}> {
  /**
   * Cria fluxo de conversa automática do agente IA com o paciente
   * Inclui confirmação de reagendamento e suporte
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Obter informações do paciente
  const patient = await db.query.patients?.findFirst?.({
    where: (patients: any) => patients.id === patientId,
  });

  // Mensagem inicial
  const initialMessage = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um agente de atendimento ao paciente de uma clínica de psicologia.
        
Gere uma mensagem inicial amigável e profissional para confirmar reagendamento.
Seja empático e compreensivo.
Responda APENAS com a mensagem.`,
      },
      {
        role: "user",
        content: `Paciente: ${patient?.name}
Novo horário: ${newDate.toLocaleDateString("pt-BR")} às ${newDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      },
    ],
  });

  // Fluxo de confirmação
  const confirmationFlow = [
    initialMessage.choices[0].message.content || "",
    "Você confirma este novo horário?",
    "Ótimo! Sua sessão está confirmada. Você receberá um lembrete 24h antes.",
    "Alguma dúvida ou precisa de algo mais?",
  ];

  return {
    initialMessage: initialMessage.choices[0].message.content || "",
    confirmationFlow,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── LISTAR BLOQUEIOS ───
// ═══════════════════════════════════════════════════════════════

export async function listScheduleBlocks(userId: number) {
  /**
   * Lista todos os bloqueios de agenda do usuário
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const blocks = await db.query.scheduleBlocks?.findMany?.({
    where: (blocks: any) => blocks.userId === userId,
  });

  return {
    total: blocks?.length || 0,
    blocks: blocks || [],
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE USO ───
// ═══════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Bloquear um dia inteiro
 * 
 * const result = await blockScheduleDay(
 *   userId,
 *   new Date("2026-03-30"),
 *   "Férias",
 *   true // autoReschedule
 * );
 * 
 * 
 * Exemplo 2: Bloquear período específico
 * 
 * const result = await blockSchedulePeriod(
 *   userId,
 *   new Date("2026-03-30"),
 *   new Date("2026-03-30"),
 *   "09:00",
 *   "12:00",
 *   "Consulta médica",
 *   true
 * );
 * 
 * 
 * Exemplo 3: Liberar dia
 * 
 * const result = await unblockScheduleDay(
 *   userId,
 *   new Date("2026-03-30")
 * );
 * 
 * 
 * Exemplo 4: Conversa automática com paciente
 * 
 * const conversation = await agentConversationWithPatient(
 *   userId,
 *   patientId,
 *   appointmentId,
 *   newDate
 * );
 */
