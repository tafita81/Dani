/**
 * Agendamento Automático via WhatsApp
 * Permite que pacientes confirmem ou reagendem consultas respondendo mensagens WhatsApp
 */

export interface WhatsAppSchedulingMessage {
  patientId: string;
  patientPhone: string;
  messageType:
    | "confirm_appointment"
    | "reschedule_options"
    | "appointment_reminder"
    | "reschedule_confirmation";
  appointmentId: string;
  appointmentDate: Date;
  availableSlots?: Array<{
    date: Date;
    time: string;
    available: boolean;
  }>;
  messageText: string;
  timestamp: Date;
}

/**
 * Mensagens variadas e humanizadas para WhatsApp
 */
const humanizedMessages = {
  confirm_appointment: [
    "Oi {{patientName}}! 👋 Tudo bem? Só confirmando nossa consulta em {{date}} às {{time}}. Você consegue confirmar? Responde com 'SIM' ou 'NÃO'.",
    "E aí {{patientName}}! Você está confirmado(a) para {{date}} às {{time}}? Deixa eu saber! 😊",
    "Olá {{patientName}}! Você vem mesmo na {{date}} às {{time}}? Fico feliz em te atender! Confirma aí? 💙",
    "Opa {{patientName}}! Só checando: você vem na {{date}} às {{time}}, certo? Confirma pra gente!",
  ],
  reschedule_options: [
    "Oi {{patientName}}, tudo bem? Vejo que você não consegue vir em {{date}}. Sem problema! Que tal a gente marca para outro dia? Aqui estão as opções: {{slots}}. Qual te agrada?",
    "Entendi {{patientName}}! Sem problema reagendar. Olha só essas datas disponíveis: {{slots}}. Qual funciona melhor pra você?",
    "Tudo certo {{patientName}}! Vamos marcar outro dia então. Tenho essas opções: {{slots}}. Qual você prefere?",
    "Sem stress {{patientName}}! Vamos achar um horário que funcione pra você. Que tal: {{slots}}?",
  ],
  appointment_reminder: [
    "Oi {{patientName}}! 🔔 Só lembrando que temos consulta amanhã às {{time}}. Até lá! 💙",
    "E aí {{patientName}}! Amanhã às {{time}} a gente se vê! Tá pronto(a)?",
    "Olá {{patientName}}, amanhã é dia de consulta! {{time}} te espero! 😊",
    "Opa {{patientName}}! Amanhã às {{time}} é nosso encontro. Até lá!",
  ],
  reschedule_confirmation: [
    "Perfeito {{patientName}}! Sua consulta foi remarcada para {{date}} às {{time}}. Até lá! 💙",
    "Ótimo {{patientName}}! Confirmado para {{date}} às {{time}}. Vou te esperar!",
    "Tudo certo {{patientName}}! Agora é {{date}} às {{time}}. Até breve!",
    "Maravilha {{patientName}}! Sua nova data é {{date}} às {{time}}. Até logo!",
  ],
};

/**
 * Gera mensagem humanizada e variada
 */
export function generateHumanizedMessage(
  messageType: WhatsAppSchedulingMessage["messageType"],
  variables: Record<string, string>
): string {
  const messages = humanizedMessages[messageType];
  if (!messages || messages.length === 0) return "";

  // Selecionar mensagem aleatória
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  // Substituir variáveis
  let finalMessage = randomMessage;
  for (const [key, value] of Object.entries(variables)) {
    finalMessage = finalMessage.replace(`{{${key}}}`, value);
  }

  return finalMessage;
}

/**
 * Cria mensagem de confirmação de agendamento
 */
export function createConfirmationMessage(
  patientName: string,
  date: Date,
  time: string
): WhatsAppSchedulingMessage {
  const messageText = generateHumanizedMessage("confirm_appointment", {
    patientName,
    date: formatDate(date),
    time,
  });

  return {
    patientId: "",
    patientPhone: "",
    messageType: "confirm_appointment",
    appointmentId: "",
    appointmentDate: date,
    messageText,
    timestamp: new Date(),
  };
}

/**
 * Cria mensagem com opções de reagendamento
 */
export function createRescheduleOptionsMessage(
  patientName: string,
  originalDate: Date,
  availableSlots: Array<{ date: Date; time: string; available?: boolean }>
): WhatsAppSchedulingMessage {
  const slotsText = availableSlots
    .map((slot, idx) => `${idx + 1}. ${formatDate(slot.date)} às ${slot.time}`)
    .join("\n");

  const messageText = generateHumanizedMessage("reschedule_options", {
    patientName,
    date: formatDate(originalDate),
    slots: slotsText,
  });

  return {
    patientId: "",
    patientPhone: "",
    messageType: "reschedule_options",
    appointmentId: "",
    appointmentDate: originalDate,
    availableSlots: availableSlots.map((slot) => ({
      ...slot,
      available: slot.available !== false,
    })),
    messageText,
    timestamp: new Date(),
  };
}

/**
 * Cria mensagem de lembrete
 */
export function createReminderMessage(
  patientName: string,
  appointmentDate: Date,
  time: string
): WhatsAppSchedulingMessage {
  const messageText = generateHumanizedMessage("appointment_reminder", {
    patientName,
    date: formatDate(appointmentDate),
    time,
  });

  return {
    patientId: "",
    patientPhone: "",
    messageType: "appointment_reminder",
    appointmentId: "",
    appointmentDate,
    messageText,
    timestamp: new Date(),
  };
}

/**
 * Cria mensagem de confirmação de reagendamento
 */
export function createRescheduleConfirmationMessage(
  patientName: string,
  newDate: Date,
  newTime: string
): WhatsAppSchedulingMessage {
  const messageText = generateHumanizedMessage("reschedule_confirmation", {
    patientName,
    date: formatDate(newDate),
    time: newTime,
  });

  return {
    patientId: "",
    patientPhone: "",
    messageType: "reschedule_confirmation",
    appointmentId: "",
    appointmentDate: newDate,
    messageText,
    timestamp: new Date(),
  };
}

/**
 * Processa resposta do paciente no WhatsApp
 */
export function processPatientResponse(
  response: string,
  messageType: WhatsAppSchedulingMessage["messageType"]
): {
  action: "confirm" | "deny" | "reschedule" | "select_slot" | "invalid";
  selectedSlot?: number;
} {
  const lowerResponse = response.toLowerCase().trim();

  if (messageType === "confirm_appointment") {
    if (
      lowerResponse === "sim" ||
      lowerResponse === "s" ||
      lowerResponse.includes("sim")
    ) {
      return { action: "confirm" };
    } else if (
      lowerResponse === "não" ||
      lowerResponse === "nao" ||
      lowerResponse === "n" ||
      lowerResponse.includes("não")
    ) {
      return { action: "deny" };
    }
  }

  if (messageType === "reschedule_options") {
    // Tentar extrair número da opção
    const numberMatch = lowerResponse.match(/\d+/);
    if (numberMatch) {
      const slotNumber = parseInt(numberMatch[0]);
      if (slotNumber > 0 && slotNumber <= 5) {
        return { action: "select_slot", selectedSlot: slotNumber - 1 };
      }
    }
  }

  return { action: "invalid" };
}

/**
 * Formata data para exibição
 */
function formatDate(date: Date): string {
  const days = [
    "domingo",
    "segunda",
    "terça",
    "quarta",
    "quinta",
    "sexta",
    "sábado",
  ];
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];

  return `${dayName}, ${dayNum} de ${monthName}`;
}

/**
 * Gera link de confirmação rápida
 */
export function generateQuickConfirmLink(
  appointmentId: string,
  patientId: string
): string {
  const baseUrl = process.env.VITE_APP_URL || "https://clinassist-dqdp2gmy.manus.space";
  return `${baseUrl}/confirm-appointment?id=${appointmentId}&patient=${patientId}`;
}

/**
 * Valida número de telefone
 */
export function validatePhoneNumber(phone: string): boolean {
  // Formato brasileiro: (XX) XXXXX-XXXX ou XX XXXXX-XXXX
  const phoneRegex = /^(\+55)?[\s]?(\d{2})[\s]?(\d{4,5})[\s-]?(\d{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Formata número de telefone
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `+55${cleaned}`;
  } else if (cleaned.length === 10) {
    return `+55${cleaned}`;
  }
  return phone;
}
