/**
 * Serviço de integração com WhatsApp Business API
 * Permite enviar confirmações e lembretes de agendamento via WhatsApp
 */

export interface WhatsAppMessage {
  to: string; // Número com DDD (ex: 5511987654321)
  message: string;
  type?: "text" | "template";
  templateName?: string;
  parameters?: Record<string, string>;
}

export interface AppointmentConfirmationMessage {
  patientPhone: string;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  therapistName: string;
}

export interface RescheduleMessage {
  patientPhone: string;
  patientName: string;
  originalDate: Date;
  originalTime: string;
  newDate: Date;
  newTime: string;
  therapistName: string;
}

export interface CancellationMessage {
  patientPhone: string;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  therapistName: string;
  rescheduleLink?: string;
}

/**
 * Gera mensagem variada de confirmação (evita repetição)
 */
export function generateConfirmationMessage(
  data: AppointmentConfirmationMessage
): string {
  const dateStr = data.appointmentDate.toLocaleDateString("pt-BR");
  const variations = [
    `Oi ${data.patientName}! 👋 Sua consulta com ${data.therapistName} está confirmada para ${dateStr} às ${data.appointmentTime}. Nos vemos em breve! 😊`,
    `${data.patientName}, tudo bem? 🙂 Confirmamos sua consulta com ${data.therapistName} em ${dateStr} às ${data.appointmentTime}. Até lá!`,
    `Olá ${data.patientName}! ✨ Sua sessão com ${data.therapistName} está agendada para ${dateStr} às ${data.appointmentTime}. Preparado(a)?`,
    `${data.patientName}, sua consulta com ${data.therapistName} foi confirmada! 📅 ${dateStr} às ${data.appointmentTime}. Vamos conversar!`,
    `Oi! 👋 Confirmamos sua consulta com ${data.therapistName} para ${dateStr} às ${data.appointmentTime}. Até breve, ${data.patientName}!`,
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Gera mensagem variada de remarcação
 */
export function generateRescheduleMessage(data: RescheduleMessage): string {
  const originalDateStr = data.originalDate.toLocaleDateString("pt-BR");
  const newDateStr = data.newDate.toLocaleDateString("pt-BR");

  const variations = [
    `${data.patientName}, sua consulta com ${data.therapistName} foi remarcada! 📅 De ${originalDateStr} às ${data.originalTime} para ${newDateStr} às ${data.newTime}. Tudo bem para você?`,
    `Oi ${data.patientName}! 👋 Precisamos remarcar sua sessão com ${data.therapistName}. Nova data: ${newDateStr} às ${data.newTime}. Pode ser?`,
    `${data.patientName}, informamos que sua consulta com ${data.therapistName} foi remarcada para ${newDateStr} às ${data.newTime}. Confirma?`,
    `Olá! 🔔 Sua consulta com ${data.therapistName} foi remarcada para ${newDateStr} às ${data.newTime}. Avisa se tiver algum problema!`,
    `${data.patientName}, sua sessão com ${data.therapistName} foi movida para ${newDateStr} às ${data.newTime}. Tudo certo?`,
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Gera mensagem variada de cancelamento
 */
export function generateCancellationMessage(data: CancellationMessage): string {
  const dateStr = data.appointmentDate.toLocaleDateString("pt-BR");

  const variations = [
    `${data.patientName}, sua consulta com ${data.therapistName} em ${dateStr} às ${data.appointmentTime} foi cancelada. ${data.rescheduleLink ? "Clique aqui para remarcar: " + data.rescheduleLink : "Entre em contato para agendar novo horário."}`,
    `Oi ${data.patientName}! 😔 Infelizmente precisamos cancelar sua sessão com ${data.therapistName} em ${dateStr} às ${data.appointmentTime}. ${data.rescheduleLink ? "Remarque aqui: " + data.rescheduleLink : "Nos avise quando puder!"}`,
    `${data.patientName}, informamos que sua consulta com ${data.therapistName} em ${dateStr} às ${data.appointmentTime} foi cancelada. ${data.rescheduleLink ? "Novo agendamento: " + data.rescheduleLink : "Fale conosco!"}`,
    `Olá! 🔔 Sua consulta com ${data.therapistName} em ${dateStr} às ${data.appointmentTime} foi cancelada. ${data.rescheduleLink ? "Agende novo horário: " + data.rescheduleLink : "Nos procure!"}`,
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Gera mensagem de lembrete 24h antes
 */
export function generateReminderMessage(
  patientName: string,
  appointmentDate: Date,
  appointmentTime: string,
  therapistName: string
): string {
  const dateStr = appointmentDate.toLocaleDateString("pt-BR");

  const variations = [
    `${patientName}, lembrete! 🔔 Sua consulta com ${therapistName} é amanhã (${dateStr}) às ${appointmentTime}. Não esqueça!`,
    `Oi ${patientName}! 👋 Amanhã você tem consulta com ${therapistName} às ${appointmentTime}. Até lá!`,
    `${patientName}, sua sessão com ${therapistName} é amanhã às ${appointmentTime}. Preparado(a)?`,
    `Lembrete: sua consulta com ${therapistName} é amanhã (${dateStr}) às ${appointmentTime}. Vamos conversar!`,
    `${patientName}, não esqueça! Sua consulta com ${therapistName} é amanhã às ${appointmentTime}. 😊`,
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Envia mensagem via WhatsApp Business API
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.BUILT_IN_FORGE_API_URL}/whatsapp/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        },
        body: JSON.stringify({
          to: message.to,
          message: message.message,
          type: message.type || "text",
          templateName: message.templateName,
          parameters: message.parameters,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `Erro ao enviar mensagem WhatsApp para ${message.to}:`,
        response.statusText
      );
      return false;
    }

    console.log(`✅ Mensagem WhatsApp enviada para ${message.to}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return false;
  }
}

/**
 * Envia confirmação de agendamento via WhatsApp
 */
export async function sendConfirmationViaWhatsApp(
  data: AppointmentConfirmationMessage
): Promise<boolean> {
  const message = generateConfirmationMessage(data);
  return sendWhatsAppMessage({
    to: data.patientPhone,
    message,
    type: "text",
  });
}

/**
 * Envia remarcação via WhatsApp
 */
export async function sendRescheduleViaWhatsApp(
  data: RescheduleMessage
): Promise<boolean> {
  const message = generateRescheduleMessage(data);
  return sendWhatsAppMessage({
    to: data.patientPhone,
    message,
    type: "text",
  });
}

/**
 * Envia cancelamento via WhatsApp
 */
export async function sendCancellationViaWhatsApp(
  data: CancellationMessage
): Promise<boolean> {
  const message = generateCancellationMessage(data);
  return sendWhatsAppMessage({
    to: data.patientPhone,
    message,
    type: "text",
  });
}

/**
 * Envia lembrete 24h antes via WhatsApp
 */
export async function sendReminderViaWhatsApp(
  patientPhone: string,
  patientName: string,
  appointmentDate: Date,
  appointmentTime: string,
  therapistName: string
): Promise<boolean> {
  const message = generateReminderMessage(
    patientName,
    appointmentDate,
    appointmentTime,
    therapistName
  );
  return sendWhatsAppMessage({
    to: patientPhone,
    message,
    type: "text",
  });
}

/**
 * Parser para respostas de confirmação do paciente
 */
export function parseConfirmationResponse(response: string): "confirmed" | "cancelled" | "rescheduled" | "unknown" {
  const normalized = response.toLowerCase().trim();

  // Confirmação
  if (
    normalized.includes("sim") ||
    normalized.includes("yes") ||
    normalized.includes("ok") ||
    normalized.includes("certo") ||
    normalized.includes("pode ser") ||
    normalized.includes("👍") ||
    normalized.includes("✅")
  ) {
    return "confirmed";
  }

  // Cancelamento
  if (
    normalized.includes("não") ||
    normalized.includes("no") ||
    normalized.includes("cancela") ||
    normalized.includes("não posso") ||
    normalized.includes("❌") ||
    normalized.includes("👎")
  ) {
    return "cancelled";
  }

  // Remarcação
  if (
    normalized.includes("remarcar") ||
    normalized.includes("outro horário") ||
    normalized.includes("outro dia") ||
    normalized.includes("quando?") ||
    normalized.includes("que horas?")
  ) {
    return "rescheduled";
  }

  return "unknown";
}
