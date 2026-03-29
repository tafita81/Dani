/**
 * Integração com WhatsApp Business API
 * Envia mensagens automáticas de reagendamento e confirmação
 */

export interface WhatsAppMessage {
  to: string; // Número do paciente com DDD
  template: string; // Nome do template
  parameters?: Record<string, string>;
  mediaUrl?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Templates de mensagens para WhatsApp
 * Mensagens devem ser humanas, variadas e não robóticas
 */
const messageTemplates = {
  reschedule_available_slots: {
    templates: [
      "Oi {{patientName}}, tudo bem? Tivemos um imprevisto e precisamos remarcar sua consulta. Temos disponibilidade nos seguintes horários: {{slots}}. Qual funciona melhor para você?",
      "Olá {{patientName}}! Infelizmente precisamos reagendar sua consulta de {{originalDate}}. Que tal um desses horários? {{slots}} Avisa aí! 😊",
      "{{patientName}}, tudo certo? Surgiu um compromisso e vamos precisar remarcar. Você consegue em um desses dias? {{slots}}",
      "Oi {{patientName}}! Desculpa o aviso curto, mas precisamos remarcar sua sessão. Temos esses horários livres: {{slots}}. Qual te agrada?",
    ],
  },
  appointment_confirmation: {
    templates: [
      "Ótimo! Sua consulta está confirmada para {{date}} às {{time}}. Até lá! 💙",
      "Perfeito! Marcamos para {{date}} às {{time}}. Nos vemos em breve!",
      "Confirmado! Sua sessão está agendada para {{date}} às {{time}}. Até logo!",
      "Tudo pronto! Sua consulta é em {{date}} às {{time}}. Até breve! 🙏",
    ],
  },
  appointment_reminder: {
    templates: [
      "Oi {{patientName}}! Lembrando que sua consulta é amanhã às {{time}}. Até lá! 💙",
      "{{patientName}}, só para confirmar: sua sessão é amanhã às {{time}}. Nos vemos lá!",
      "Amanhã é dia de consulta! {{time}} com você. Até lá! 😊",
      "Não esqueça! Sua consulta é amanhã às {{time}}. Até breve!",
    ],
  },
  cancellation_notice: {
    templates: [
      "{{patientName}}, infelizmente sua consulta de {{date}} foi cancelada. Você gostaria de reagendar? Estou à disposição!",
      "Oi {{patientName}}, tivemos que cancelar sua sessão de {{date}}. Podemos marcar outro dia? Avisa aí!",
      "{{patientName}}, sua consulta de {{date}} foi cancelada. Vamos remarcar quando você tiver disponibilidade?",
      "Desculpa {{patientName}}, mas precisamos cancelar sua sessão de {{date}}. Quando você consegue vir?",
    ],
  },
  follow_up_check_in: {
    templates: [
      "Oi {{patientName}}! Como você está se sentindo? Gostaria de conversar sobre como as técnicas que trabalhamos estão funcionando?",
      "{{patientName}}, tudo bem com você? Gostaria de saber como você tem se sentido desde nossa última sessão.",
      "Olá! Como vai? Estou aqui se precisar conversar ou tirar alguma dúvida sobre o que trabalhamos.",
      "{{patientName}}, só checando como você está. Pode contar comigo se precisar! 💙",
    ],
  },
  form_invitation: {
    templates: [
      "Oi {{patientName}}! Gostaria que você respondesse um formulário rápido para acompanharmos seu progresso. Link: {{formUrl}}",
      "{{patientName}}, temos um formulário para você responder. Leva só 5 minutos! {{formUrl}}",
      "Olá! Preparei um formulário para você. Pode responder quando tiver um tempinho: {{formUrl}}",
      "{{patientName}}, você poderia responder esse formulário para eu acompanhar melhor seu progresso? {{formUrl}}",
    ],
  },
  emergency_support: {
    templates: [
      "{{patientName}}, se você estiver passando por um momento difícil, por favor procure ajuda. Você pode ligar para o CVV (188) ou ir a um pronto-socorro. Estou aqui para você! 💙",
      "Sua segurança é importante. Se estiver em crise, ligue para o CVV (188) ou procure o pronto-socorro mais próximo. Você não está sozinho!",
      "{{patientName}}, se precisar de ajuda urgente, ligue para o CVV (188). Estou aqui para apoiá-lo!",
    ],
  },
};

/**
 * Seleciona um template aleatório para parecer mais humano
 */
function selectRandomTemplate(templateGroup: string[]): string {
  return templateGroup[Math.floor(Math.random() * templateGroup.length)];
}

/**
 * Substitui placeholders no template
 */
function formatMessage(template: string, parameters: Record<string, string>): string {
  let message = template;
  Object.entries(parameters).forEach(([key, value]) => {
    message = message.replace(`{{${key}}}`, value);
  });
  return message;
}

/**
 * Envia mensagem de reagendamento com slots disponíveis
 */
export async function sendRescheduleMessage(
  patientPhone: string,
  patientName: string,
  originalDate: string,
  availableSlots: string[]
): Promise<WhatsAppResponse> {
  try {
    const template = selectRandomTemplate(
      messageTemplates.reschedule_available_slots.templates
    );

    const message = formatMessage(template, {
      patientName,
      originalDate,
      slots: availableSlots.join(", "),
    });

    return await sendWhatsAppMessage(patientPhone, message);
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar mensagem de reagendamento: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Envia confirmação de agendamento
 */
export async function sendAppointmentConfirmation(
  patientPhone: string,
  patientName: string,
  date: string,
  time: string
): Promise<WhatsAppResponse> {
  try {
    const template = selectRandomTemplate(
      messageTemplates.appointment_confirmation.templates
    );

    const message = formatMessage(template, {
      patientName,
      date,
      time,
    });

    return await sendWhatsAppMessage(patientPhone, message);
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar confirmação: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Envia lembrança de consulta (24h antes)
 */
export async function sendAppointmentReminder(
  patientPhone: string,
  patientName: string,
  time: string
): Promise<WhatsAppResponse> {
  try {
    const template = selectRandomTemplate(
      messageTemplates.appointment_reminder.templates
    );

    const message = formatMessage(template, {
      patientName,
      time,
    });

    return await sendWhatsAppMessage(patientPhone, message);
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar lembrança: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Envia notificação de cancelamento
 */
export async function sendCancellationNotice(
  patientPhone: string,
  patientName: string,
  date: string
): Promise<WhatsAppResponse> {
  try {
    const template = selectRandomTemplate(
      messageTemplates.cancellation_notice.templates
    );

    const message = formatMessage(template, {
      patientName,
      date,
    });

    return await sendWhatsAppMessage(patientPhone, message);
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar cancelamento: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Envia check-in de acompanhamento
 */
export async function sendFollowUpCheckIn(
  patientPhone: string,
  patientName: string
): Promise<WhatsAppResponse> {
  try {
    const template = selectRandomTemplate(
      messageTemplates.follow_up_check_in.templates
    );

    const message = formatMessage(template, {
      patientName,
    });

    return await sendWhatsAppMessage(patientPhone, message);
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar check-in: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Envia convite para responder formulário
 */
export async function sendFormInvitation(
  patientPhone: string,
  patientName: string,
  formUrl: string
): Promise<WhatsAppResponse> {
  try {
    const template = selectRandomTemplate(
      messageTemplates.form_invitation.templates
    );

    const message = formatMessage(template, {
      patientName,
      formUrl,
    });

    return await sendWhatsAppMessage(patientPhone, message);
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar convite de formulário: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Envia mensagem de suporte em emergência
 */
export async function sendEmergencySupportMessage(
  patientPhone: string,
  patientName: string
): Promise<WhatsAppResponse> {
  try {
    const template = selectRandomTemplate(
      messageTemplates.emergency_support.templates
    );

    const message = formatMessage(template, {
      patientName,
    });

    return await sendWhatsAppMessage(patientPhone, message);
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar suporte de emergência: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Função base para enviar mensagem via WhatsApp Business API
 */
async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    // Aqui você integraria com a API real do WhatsApp Business
    // Por enquanto, simulamos uma resposta bem-sucedida
    
    // Validar número de telefone (deve ter DDD)
    if (!phoneNumber.match(/^\d{2}9?\d{8,9}$/)) {
      return {
        success: false,
        error: "Número de telefone inválido. Deve incluir DDD.",
        timestamp: new Date(),
      };
    }

    // Simular envio
    console.log(`[WhatsApp] Enviando para ${phoneNumber}: ${message}`);

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao enviar mensagem: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Agenda envio automático de mensagens
 */
export async function scheduleAutomaticMessages(
  patientId: string,
  patientPhone: string,
  patientName: string,
  appointmentDate: Date
): Promise<void> {
  // Lembrança 24h antes
  const reminderTime = new Date(appointmentDate);
  reminderTime.setDate(reminderTime.getDate() - 1);
  reminderTime.setHours(10, 0, 0, 0);

  // Aqui você implementaria a lógica de agendamento
  // Por enquanto, apenas logamos
  console.log(
    `[WhatsApp Scheduler] Lembrança agendada para ${reminderTime} para ${patientName}`
  );
}
