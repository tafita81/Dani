/**
 * Message Templates — Templates Padrão de Mensagens WhatsApp
 * Para agendamentos, reagendamentos, lembretes e confirmações
 */

// ═══════════════════════════════════════════════════════════════
// ─── TEMPLATES DE AGENDAMENTO ───
// ═══════════════════════════════════════════════════════════════

export const appointmentTemplates = {
  // Confirmação de novo agendamento
  confirmNewAppointment: (patientName: string, date: string, time: string, therapistName: string = "Dani") => `
Olá ${patientName}! 👋

Sua sessão foi confirmada com sucesso! 

📅 Data: ${date}
🕐 Horário: ${time}
👩‍⚕️ Terapeuta: ${therapistName}

Você receberá um lembrete 24h antes da sessão.

Alguma dúvida? Responda aqui! 💬
  `.trim(),

  // Reagendamento automático
  rescheduleAppointment: (patientName: string, originalDate: string, newDate: string, newTime: string, reason: string = "Bloqueio de agenda") => `
Olá ${patientName}! 

Precisamos reagendar sua sessão de ${originalDate}.

❌ Motivo: ${reason}
✅ Novo horário: ${newDate} às ${newTime}

Você confirma este novo horário?

Responda:
• ✅ Confirmo
• ❌ Preciso de outro horário
  `.trim(),

  // Lembrança 24h antes
  reminder24h: (patientName: string, date: string, time: string) => `
Olá ${patientName}! 🔔

Lembrando que sua sessão é amanhã!

📅 ${date}
🕐 ${time}

Confirma presença?

Responda:
• ✅ Confirmo
• ❌ Preciso cancelar
  `.trim(),

  // Lembrança 1h antes
  reminder1h: (patientName: string, time: string) => `
${patientName}, sua sessão começa em 1 hora! ⏰

🕐 ${time}

Estamos prontos para você! 💙
  `.trim(),

  // Confirmação de presença
  confirmPresence: (patientName: string) => `
Obrigado por confirmar, ${patientName}! ✅

Até já! 💙
  `.trim(),

  // Cancelamento confirmado
  cancellationConfirmed: (patientName: string, date: string) => `
Entendido, ${patientName}. 

Sua sessão de ${date} foi cancelada.

Quando quiser remarcar, é só chamar! 💬
  `.trim(),

  // Sessão realizada - feedback
  sessionCompleted: (patientName: string) => `
Olá ${patientName}! 

Obrigado por participar da sessão de hoje! 💙

Como foi sua experiência? Deixe um feedback:
• ⭐⭐⭐⭐⭐ Excelente
• ⭐⭐⭐⭐ Muito bom
• ⭐⭐⭐ Bom

Sua opinião é importante! 📝
  `.trim(),

  // Próxima sessão agendada
  nextAppointmentScheduled: (patientName: string, date: string, time: string) => `
Ótimo, ${patientName}! 

Sua próxima sessão já está agendada:

📅 ${date}
🕐 ${time}

Você receberá lembretes antes da sessão. 🔔
  `.trim(),
};

// ═══════════════════════════════════════════════════════════════
// ─── TEMPLATES DE SUPORTE E INFORMAÇÕES ───
// ═══════════════════════════════════════════════════════════════

export const supportTemplates = {
  // Boas-vindas para novo paciente
  welcomeNewPatient: (patientName: string, therapistName: string = "Dani") => `
Bem-vindo(a), ${patientName}! 👋

Sou o assistente de agendamentos da ${therapistName}.

Aqui você pode:
✅ Agendar sessões
✅ Remarcar horários
✅ Receber lembretes
✅ Tirar dúvidas

Como posso ajudar? 💬
  `.trim(),

  // Informações sobre cancelamento
  cancellationPolicy: () => `
📋 Política de Cancelamento

Cancelamentos devem ser feitos com até 24h de antecedência.

Cancelamentos com menos de 24h podem gerar taxa de falta.

Precisa cancelar? Responda aqui! 💬
  `.trim(),

  // Informações sobre horários
  availableHours: (therapistName: string = "Dani") => `
🕐 Horários Disponíveis

${therapistName} atende:
📅 Segunda a Sexta
🕐 09:00 - 18:00

Qual horário você prefere? 💬
  `.trim(),

  // Informações sobre valores
  priceInfo: (price: string = "R$ 150") => `
💰 Valores

Sessão individual: ${price}

Pacote 10 sessões: 20% de desconto

Quer agendar? 💬
  `.trim(),

  // Resposta automática
  autoReply: (therapistName: string = "Dani") => `
Olá! 👋

Obrigado por sua mensagem. ${therapistName} está em atendimento.

Responderemos assim que possível! 💙

Urgência? Ligue: (11) 9XXXX-XXXX
  `.trim(),
};

// ═══════════════════════════════════════════════════════════════
// ─── TEMPLATES DE FOLLOW-UP ───
// ═══════════════════════════════════════════════════════════════

export const followUpTemplates = {
  // Após primeira sessão
  afterFirstSession: (patientName: string) => `
Olá ${patientName}! 

Espero que tenha gostado da sessão de hoje! 💙

Alguma dúvida sobre o processo terapêutico?

Estou aqui para ajudar! 💬
  `.trim(),

  // Paciente inativo há 1 mês
  inactivePatient1Month: (patientName: string, therapistName: string = "Dani") => `
Oi ${patientName}! 

Faz um tempo que não nos vemos! 👋

${therapistName} sente sua falta. Quer agendar uma sessão?

Estamos aqui para você! 💙
  `.trim(),

  // Paciente inativo há 3 meses
  inactivePatient3Months: (patientName: string, therapistName: string = "Dani") => `
${patientName}, tudo bem? 

Há 3 meses que não temos contato. 

${therapistName} está disponível para retomar o acompanhamento.

Vamos conversar? 💬
  `.trim(),

  // Pesquisa de satisfação
  satisfactionSurvey: (patientName: string) => `
${patientName}, sua opinião importa! 📊

Você poderia responder uma breve pesquisa sobre seu acompanhamento?

Leva apenas 2 minutos! ⏱️

Clique aqui: [link da pesquisa]
  `.trim(),

  // Indicação de amigos
  referralIncentive: (patientName: string) => `
${patientName}, que tal indicar um amigo? 👥

Para cada indicação bem-sucedida:
💝 R$50 de desconto na sua próxima sessão

Quer compartilhar nosso contato? 💬
  `.trim(),
};

// ═══════════════════════════════════════════════════════════════
// ─── TEMPLATES COM BOTÕES INTERATIVOS ───
// ═══════════════════════════════════════════════════════════════

export const interactiveTemplates = {
  // Confirmação com botões
  confirmationButtons: (patientName: string, date: string, time: string) => ({
    text: `${patientName}, você confirma a sessão de ${date} às ${time}?`,
    buttons: [
      { id: "confirm", title: "✅ Confirmo" },
      { id: "reschedule", title: "📅 Remarcar" },
      { id: "cancel", title: "❌ Cancelar" },
    ],
  }),

  // Menu principal
  mainMenu: {
    text: "O que você gostaria de fazer?",
    buttons: [
      { id: "schedule", title: "📅 Agendar" },
      { id: "reschedule", title: "📅 Remarcar" },
      { id: "cancel", title: "❌ Cancelar" },
      { id: "info", title: "ℹ️ Informações" },
    ],
  },

  // Escolher horário
  chooseTime: {
    text: "Qual horário você prefere?",
    buttons: [
      { id: "morning", title: "🌅 Manhã (9-12h)" },
      { id: "afternoon", title: "☀️ Tarde (14-17h)" },
      { id: "evening", title: "🌙 Noite (17-18h)" },
    ],
  },

  // Motivo do cancelamento
  cancellationReason: {
    text: "Por que você gostaria de cancelar?",
    buttons: [
      { id: "conflict", title: "Conflito de horário" },
      { id: "illness", title: "Doença/Indisposição" },
      { id: "other", title: "Outro motivo" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── TEMPLATES COM LISTAS ───
// ═══════════════════════════════════════════════════════════════

export const listTemplates = {
  // Horários disponíveis (lista)
  availableSlots: (dates: Array<{ date: string; slots: string[] }>) => ({
    text: "Escolha um horário disponível:",
    sections: dates.map((d) => ({
      title: d.date,
      rows: d.slots.map((slot) => ({
        id: slot,
        title: slot,
        description: "Clique para agendar",
      })),
    })),
  }),

  // Pacotes de sessões
  sessionPackages: {
    text: "Escolha um pacote:",
    sections: [
      {
        title: "Pacotes",
        rows: [
          {
            id: "package_1",
            title: "1 Sessão",
            description: "R$ 150",
          },
          {
            id: "package_5",
            title: "5 Sessões",
            description: "R$ 650 (13% desc)",
          },
          {
            id: "package_10",
            title: "10 Sessões",
            description: "R$ 1.200 (20% desc)",
          },
        ],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── FUNÇÃO AUXILIAR: OBTER TEMPLATE ───
// ═══════════════════════════════════════════════════════════════

export function getTemplate(
  category: "appointment" | "support" | "followup" | "interactive" | "list",
  templateName: string,
  ...args: any[]
): string | object {
  const templates: Record<string, any> = {
    appointment: appointmentTemplates,
    support: supportTemplates,
    followup: followUpTemplates,
    interactive: interactiveTemplates,
    list: listTemplates,
  };

  const template = templates[category]?.[templateName as any];

  if (typeof template === "function") {
    return template(...args);
  }

  return template || "Template não encontrado";
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE USO ───
// ═══════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Confirmação de novo agendamento
 * 
 * const message = appointmentTemplates.confirmNewAppointment(
 *   "Maria",
 *   "30/03/2026",
 *   "14:00",
 *   "Dani"
 * );
 * 
 * 
 * Exemplo 2: Reagendamento automático
 * 
 * const message = appointmentTemplates.rescheduleAppointment(
 *   "João",
 *   "30/03/2026",
 *   "31/03/2026",
 *   "15:00",
 *   "Férias"
 * );
 * 
 * 
 * Exemplo 3: Template com botões
 * 
 * const interactive = interactiveTemplates.confirmationButtons(
 *   "Pedro",
 *   "30/03/2026",
 *   "14:00"
 * );
 * 
 * 
 * Exemplo 4: Usar função auxiliar
 * 
 * const message = getTemplate(
 *   "appointment",
 *   "confirmNewAppointment",
 *   "Ana",
 *   "30/03/2026",
 *   "16:00"
 * );
 */
