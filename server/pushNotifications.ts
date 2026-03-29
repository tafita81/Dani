import { notifyOwner } from "./_core/notification";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Envia notificação push para o proprietário (Daniela)
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // Usar o sistema de notificação integrado do Manus
    const success = await notifyOwner({
      title: payload.title,
      content: payload.body,
    });

    if (success) {
      console.log("Notificação push enviada com sucesso:", payload.title);
    }

    return success;
  } catch (error) {
    console.error("Erro ao enviar notificação push:", error);
    return false;
  }
}

/**
 * Notifica sobre reagendamento de paciente
 */
export async function notifyReschedule(patientData: {
  patientName: string;
  originalDate: string;
  originalTime: string;
  newDate: string;
  newTime: string;
  reason?: string;
}): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: "📅 Reagendamento Confirmado",
    body: `${patientData.patientName} reagendou de ${patientData.originalDate} às ${patientData.originalTime} para ${patientData.newDate} às ${patientData.newTime}${patientData.reason ? ` (${patientData.reason})` : ""}`,
    tag: `reschedule-${patientData.patientName}`,
    data: {
      type: "reschedule",
      patientName: patientData.patientName,
      newDate: patientData.newDate,
      newTime: patientData.newTime,
    },
  };

  return sendPushNotification(payload);
}

/**
 * Notifica sobre novo agendamento
 */
export async function notifyNewAppointment(appointmentData: {
  patientName: string;
  date: string;
  time: string;
  channel: string;
}): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: "✅ Novo Agendamento",
    body: `${appointmentData.patientName} agendou para ${appointmentData.date} às ${appointmentData.time} via ${appointmentData.channel}`,
    tag: `appointment-${appointmentData.patientName}`,
    data: {
      type: "new_appointment",
      patientName: appointmentData.patientName,
      date: appointmentData.date,
      time: appointmentData.time,
    },
  };

  return sendPushNotification(payload);
}

/**
 * Notifica sobre cancelamento de agendamento
 */
export async function notifyCancellation(cancellationData: {
  patientName: string;
  date: string;
  time: string;
  reason?: string;
}): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: "❌ Agendamento Cancelado",
    body: `${cancellationData.patientName} cancelou agendamento de ${cancellationData.date} às ${cancellationData.time}${cancellationData.reason ? ` (${cancellationData.reason})` : ""}`,
    tag: `cancellation-${cancellationData.patientName}`,
    data: {
      type: "cancellation",
      patientName: cancellationData.patientName,
      date: cancellationData.date,
      time: cancellationData.time,
    },
  };

  return sendPushNotification(payload);
}

/**
 * Notifica sobre alerta de risco detectado
 */
export async function notifyRiskAlert(riskData: {
  patientName: string;
  riskType: string;
  severity: "low" | "medium" | "high";
  recommendation: string;
}): Promise<boolean> {
  const severityEmoji = {
    low: "🟡",
    medium: "🟠",
    high: "🔴",
  };

  const payload: PushNotificationPayload = {
    title: `${severityEmoji[riskData.severity]} Alerta de Risco - ${riskData.patientName}`,
    body: `${riskData.riskType}: ${riskData.recommendation}`,
    tag: `risk-${riskData.patientName}`,
    data: {
      type: "risk_alert",
      patientName: riskData.patientName,
      riskType: riskData.riskType,
      severity: riskData.severity,
    },
  };

  return sendPushNotification(payload);
}

/**
 * Notifica sobre mensagem recebida de paciente
 */
export async function notifyPatientMessage(messageData: {
  patientName: string;
  channel: string;
  messagePreview: string;
  timestamp: Date;
}): Promise<boolean> {
  const channelEmoji: Record<string, string> = {
    whatsapp: "💬",
    telegram: "✈️",
    instagram: "📸",
    sms: "📱",
    email: "📧",
  };

  const payload: PushNotificationPayload = {
    title: `${channelEmoji[messageData.channel] || "📨"} Mensagem de ${messageData.patientName}`,
    body: messageData.messagePreview.substring(0, 100),
    tag: `message-${messageData.patientName}`,
    data: {
      type: "patient_message",
      patientName: messageData.patientName,
      channel: messageData.channel,
    },
  };

  return sendPushNotification(payload);
}

/**
 * Notifica sobre sessão do Assistente Carro iniciada
 */
export async function notifyCarAssistantSession(sessionData: {
  startTime: Date;
  deviceType: string;
  siriActivated: boolean;
}): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: "🚗 Assistente Carro Ativado",
    body: `Sessão iniciada em ${sessionData.deviceType}${sessionData.siriActivated ? " via Siri" : ""}`,
    tag: "car-assistant-session",
    data: {
      type: "car_session",
      deviceType: sessionData.deviceType,
      siriActivated: sessionData.siriActivated.toString(),
    },
  };

  return sendPushNotification(payload);
}

/**
 * Notifica sobre análise em tempo real concluída
 */
export async function notifyAnalysisComplete(analysisData: {
  patientName: string;
  riskLevel: string;
  suggestedTechniques: string[];
}): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: `🔍 Análise Concluída - ${analysisData.patientName}`,
    body: `Nível de risco: ${analysisData.riskLevel}. Técnicas sugeridas: ${analysisData.suggestedTechniques.slice(0, 2).join(", ")}`,
    tag: `analysis-${analysisData.patientName}`,
    data: {
      type: "analysis_complete",
      patientName: analysisData.patientName,
      riskLevel: analysisData.riskLevel,
    },
  };

  return sendPushNotification(payload);
}
