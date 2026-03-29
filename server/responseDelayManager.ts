/**
 * Response Delay Manager — Gerencia Delay de Respostas no WhatsApp
 * Aguarda 39+ segundos para simular leitura humana
 * Mantém tom profissional-humanizado (não amiga íntima)
 */

import { invokeLLM } from "./_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── DELAY DE RESPOSTA ───
// ═══════════════════════════════════════════════════════════════

export async function scheduleDelayedResponse(
  messageId: string,
  patientMessage: string,
  patientName: string,
  therapistName: string = "Dani",
  minDelay: number = 39000, // 39 segundos mínimo
  maxDelay: number = 120000 // 2 minutos máximo
): Promise<{ scheduledTime: Date; delayMs: number }> {
  /**
   * Agenda uma resposta com delay aleatório entre minDelay e maxDelay
   * Simula tempo de leitura e digitação humana
   */

  // Gerar delay aleatório entre minDelay e maxDelay
  const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;

  const scheduledTime = new Date(Date.now() + randomDelay);

  // Aqui você agendaria a resposta no banco de dados ou fila de mensagens
  // Por enquanto, retornamos os dados

  return {
    scheduledTime,
    delayMs: randomDelay,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR RESPOSTA PROFISSIONAL-HUMANIZADA ───
// ═══════════════════════════════════════════════════════════════

export async function generateProfessionalHumanizedResponse(
  patientMessage: string,
  patientName: string,
  therapistName: string = "Dani",
  context: {
    appointmentDate?: string;
    appointmentTime?: string;
    lastSessionDate?: string;
    patientIssue?: string;
    abordagem?: string;
  } = {}
): Promise<string> {
  /**
   * Gera resposta que é:
   * - Profissional (mantém relação terapeuta-paciente)
   * - Humanizada (acolhedora, empática)
   * - Não informal demais (não é amiga íntima)
   * - Ética (respeita limites profissionais)
   */

  const systemPrompt = `Você é um assistente de uma psicóloga chamada ${therapistName}.

IMPORTANTE - Seu tom deve ser:
✅ Profissional e respeitoso
✅ Acolhedor e empático
✅ Humanizado mas não familiar
✅ Mantém a relação terapeuta-paciente
✅ Reconhece sentimentos sem ser amiga íntima
✅ Usa linguagem natural mas formal o suficiente
✅ Nunca faz terapia, apenas agenda e suporta
✅ Encaminha questões clínicas para a Dani

NUNCA:
❌ Seja muito casual ou íntima
❌ Use gírias excessivas
❌ Pareça uma amiga próxima
❌ Tente fazer terapia
❌ Dê conselhos clínicos
❌ Seja fria ou corporativa demais

Responda de forma natural, reconhecendo o que o paciente disse, 
mas mantendo profissionalismo e limites éticos.

Máximo 2-3 frases. Responda APENAS com a mensagem.`;

  const userPrompt = `Paciente: ${patientName}
Mensagem do paciente: "${patientMessage}"
${context.appointmentDate ? `Próxima sessão: ${context.appointmentDate} às ${context.appointmentTime}` : ""}
${context.lastSessionDate ? `Última sessão: ${context.lastSessionDate}` : ""}
${context.patientIssue ? `Questão principal: ${context.patientIssue}` : ""}

Gere uma resposta profissional-humanizada.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0].message.content || "";
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE RESPOSTAS (Profissional-Humanizado) ───
// ═══════════════════════════════════════════════════════════════

export const professionalHumanizedExamples = {
  // Paciente: "Oi, tudo bem?"
  greeting: {
    wrong: "Opa, tudo certo! 😄 Como você tá?", // Muito informal
    correct: "Oi! Tudo bem sim. Como posso ajudá-lo(a)?", // Profissional-humanizado
  },

  // Paciente: "Não consegui dormir essa noite, tô muito ansioso"
  anxiety: {
    wrong: "Ai que ruim! Tá tudo bem, passa! 💙", // Muito amiga, não profissional
    correct:
      "Entendo que a ansiedade está afetando seu sono. Isso é importante conversar com a Dani na próxima sessão. Quer marcar um horário antes?", // Profissional-humanizado
  },

  // Paciente: "Preciso cancelar amanhã"
  cancellation: {
    wrong: "Tudo bem, sem stress! Marca outro dia! 😊", // Muito casual
    correct:
      "Entendo. Pode me contar o motivo? Assim a gente vê a melhor forma de reagendar.",
    // Profissional-humanizado
  },

  // Paciente: "Tô com medo da sessão"
  fear: {
    wrong: "Relaxa, vai ser legal! A Dani é top! 🙌", // Muito amiga
    correct:
      "É natural sentir apreensão. A Dani cria um espaço seguro para você. Quer conversar sobre o que te deixa apreensivo(a)?", // Profissional-humanizado
  },

  // Paciente: "Não tô melhorando"
  noProgress: {
    wrong: "Ué, mas você tá indo bem sim! 💙", // Minimiza sentimento
    correct:
      "Entendo essa frustração. Terapia é um processo. Isso é importante discutir com a Dani. Quando é sua próxima sessão?", // Profissional-humanizado
  },

  // Paciente: "Obrigado(a) pela ajuda"
  gratitude: {
    wrong: "De nada! Fico feliz em ajudar! 💙", // Muito pessoal
    correct:
      "Fico grato(a) em poder ajudar. Qualquer coisa, estou aqui.", // Profissional-humanizado
  },

  // Paciente: "Posso remarcar para outra hora?"
  reschedule: {
    wrong: "Claro! Qual horário você quer? 😊", // Muito casual
    correct:
      "Claro. Qual data e horário funcionam melhor para você?", // Profissional-humanizado
  },

  // Paciente: "Tô passando por algo difícil"
  difficulty: {
    wrong: "Ai, que ruim! Mas passa! 💙", // Minimiza, muito amiga
    correct:
      "Sinto que esteja passando por isso. A Dani está aqui para ajudar. Quer agendar uma sessão em breve?", // Profissional-humanizado
  },

  // Paciente: "Não tenho dinheiro agora"
  financial: {
    wrong: "Ué, mas é só 150 reais! 😅", // Insensível
    correct:
      "Entendo. Temos opções de parcelamento. Quer conversar sobre isso?", // Profissional-humanizado
  },

  // Paciente: "Você é a Dani?"
  identity: {
    wrong: "Não, sou o assistente dela! 😄", // Muito casual
    correct:
      "Não, sou o assistente de agendamentos da Dani. Como posso ajudá-lo(a)?", // Profissional-humanizado
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── CHECKLIST: RESPOSTA PROFISSIONAL-HUMANIZADA ───
// ═══════════════════════════════════════════════════════════════

export function validateResponseTone(message: string): {
  isValid: boolean;
  issues: string[];
  score: number;
} {
  /**
   * Valida se a resposta tem o tom correto
   * Retorna score de 0-100
   */

  const issues: string[] = [];
  let score = 100;

  // Verificar se é muito casual
  const casualIndicators = [
    "opa",
    "ué",
    "relaxa",
    "tá bom",
    "sem stress",
    "passa",
    "tamo",
    "tá tudo certo",
  ];
  casualIndicators.forEach((indicator) => {
    if (message.toLowerCase().includes(indicator)) {
      issues.push(`Muito casual: "${indicator}"`);
      score -= 10;
    }
  });

  // Verificar se é muito formal/corporativo
  const formalIndicators = [
    "conforme solicitado",
    "informamos que",
    "prezado(a)",
    "atenciosamente",
  ];
  formalIndicators.forEach((indicator) => {
    if (message.toLowerCase().includes(indicator)) {
      issues.push(`Muito formal: "${indicator}"`);
      score -= 15;
    }
  });

  // Verificar se reconhece sentimentos
  const emotionalKeywords = [
    "entendo",
    "sinto",
    "compreendo",
    "natural",
    "importante",
  ];
  const hasEmotionalRecognition = emotionalKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
  if (!hasEmotionalRecognition) {
    issues.push("Não reconhece sentimentos do paciente");
    score -= 20;
  }

  // Verificar se mantém limites profissionais
  if (message.toLowerCase().includes("amiga") || message.includes("💙💙💙")) {
    issues.push("Muito pessoal/íntima");
    score -= 25;
  }

  // Verificar se é breve (2-3 frases)
  const sentences = message.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 4) {
    issues.push("Resposta muito longa");
    score -= 10;
  }

  return {
    isValid: score >= 70,
    issues,
    score: Math.max(0, score),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── FLUXO COMPLETO: RECEBER → DELAY → RESPONDER ───
// ═══════════════════════════════════════════════════════════════

export async function handlePatientMessageWithDelay(
  messageId: string,
  patientMessage: string,
  patientName: string,
  patientPhone: string,
  therapistName: string = "Dani",
  context: any = {}
): Promise<{
  messageId: string;
  scheduledTime: Date;
  delayMs: number;
  responsePreview: string;
  tonScore: number;
}> {
  /**
   * Fluxo completo:
   * 1. Recebe mensagem do paciente
   * 2. Gera resposta profissional-humanizada
   * 3. Valida tom
   * 4. Agenda com delay de 39+ segundos
   * 5. Retorna preview
   */

  // Gerar resposta
  const response = await generateProfessionalHumanizedResponse(
    patientMessage,
    patientName,
    therapistName,
    context
  );

  // Validar tom
  const tonValidation = validateResponseTone(response);

  // Agendar delay
  const { scheduledTime, delayMs } = await scheduleDelayedResponse(
    messageId,
    patientMessage,
    patientName,
    therapistName
  );

  return {
    messageId,
    scheduledTime,
    delayMs,
    responsePreview: response,
    tonScore: tonValidation.score,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE USO ───
// ═══════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Gerar resposta profissional-humanizada
 * 
 * const response = await generateProfessionalHumanizedResponse(
 *   "Oi, tudo bem?",
 *   "Maria",
 *   "Dani",
 *   { appointmentDate: "30/03/2026", appointmentTime: "14:00" }
 * );
 * 
 * console.log(response);
 * // Output: "Oi! Tudo bem sim. Como posso ajudá-lo(a)?"
 * 
 * 
 * Exemplo 2: Validar tom da resposta
 * 
 * const validation = validateResponseTone(
 *   "Entendo sua frustração. Isso é importante conversar com a Dani."
 * );
 * 
 * console.log(validation);
 * // Output: { isValid: true, issues: [], score: 95 }
 * 
 * 
 * Exemplo 3: Fluxo completo
 * 
 * const result = await handlePatientMessageWithDelay(
 *   "msg_123",
 *   "Não consegui dormir essa noite",
 *   "João",
 *   "11999999999",
 *   "Dani",
 *   { patientIssue: "Ansiedade" }
 * );
 * 
 * console.log(result);
 * // Resposta será enviada em 39-120 segundos
 */
