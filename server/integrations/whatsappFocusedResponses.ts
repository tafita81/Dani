/**
 * WhatsApp/Telegram Focused Responses
 * Respostas focadas APENAS em agendamento e reagendamento
 * Nunca se estende em questões clínicas
 * Deixa detalhes para a consulta
 */

import { invokeLLM } from "./_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── TIPOS ───
// ═══════════════════════════════════════════════════════════════

export type MessageChannel = "whatsapp" | "telegram" | "app";

export interface ChannelContext {
  channel: MessageChannel;
  patientName: string;
  therapistName: string;
  nextAppointmentDate?: string;
  nextAppointmentTime?: string;
}

// ═══════════════════════════════════════════════════════════════
// ─── CLASSIFICAR TIPO DE MENSAGEM ───
// ═══════════════════════════════════════════════════════════════

export async function classifyMessageType(
  message: string
): Promise<
  | "scheduling"
  | "rescheduling"
  | "confirmation"
  | "cancellation"
  | "clinical_question"
  | "other"
> {
  /**
   * Classifica o tipo de mensagem
   * Scheduling = Agendar nova sessão
   * Rescheduling = Remarcar sessão
   * Confirmation = Confirmar presença
   * Cancellation = Cancelar sessão
   * Clinical_question = Pergunta sobre problema/questão
   * Other = Outro assunto
   */

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um classificador de mensagens.

Classifique a mensagem em UMA destas categorias:
- scheduling: Paciente quer agendar nova sessão
- rescheduling: Paciente quer remarcar/mudar horário
- confirmation: Paciente confirma presença na sessão
- cancellation: Paciente quer cancelar sessão
- clinical_question: Pergunta sobre problema/questão clínica
- other: Outro assunto

Responda APENAS com a categoria (uma palavra).`,
      },
      {
        role: "user",
        content: `Mensagem: "${message}"`,
      },
    ],
  });

  const classification = response.choices[0].message.content?.toLowerCase().trim() as any;

  const validTypes = [
    "scheduling",
    "rescheduling",
    "confirmation",
    "cancellation",
    "clinical_question",
    "other",
  ];

  return validTypes.includes(classification) ? classification : "other";
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR RESPOSTA FOCADA EM AGENDAMENTO ───
// ═══════════════════════════════════════════════════════════════

export async function generateFocusedSchedulingResponse(
  message: string,
  messageType:
    | "scheduling"
    | "rescheduling"
    | "confirmation"
    | "cancellation"
    | "clinical_question"
    | "other",
  context: ChannelContext
): Promise<string> {
  /**
   * Gera resposta focada em agendamento
   * Nunca se estende em questões clínicas
   * Máximo 1-2 frases
   */

  let systemPrompt = `Você é um assistente de agendamento de uma psicóloga chamada ${context.therapistName}.

REGRA PRINCIPAL: Respostas FOCADAS APENAS em agendamento/reagendamento.
- NUNCA discuta questões clínicas em detalhes
- NUNCA dê conselhos terapêuticos
- NUNCA se estenda em conversas
- Máximo 1-2 frases
- Sempre profissional e educado
- Se for pergunta clínica, redirecione para a consulta

Responda APENAS com a mensagem.`;

  let userPrompt = "";

  switch (messageType) {
    case "scheduling":
      systemPrompt += `

TIPO: Paciente quer AGENDAR nova sessão
Responda oferecendo horários disponíveis ou pedindo preferência.`;
      userPrompt = `Paciente ${context.patientName}: "${message}"

Ofereça opções de agendamento:`;
      break;

    case "rescheduling":
      systemPrompt += `

TIPO: Paciente quer REMARCAR sessão
Responda confirmando e oferecendo alternativas.`;
      userPrompt = `Paciente ${context.patientName}: "${message}"

Confirme o reagendamento e ofereça opções:`;
      break;

    case "confirmation":
      systemPrompt += `

TIPO: Paciente CONFIRMA presença
Responda confirmando e relembrando horário.`;
      userPrompt = `Paciente ${context.patientName}: "${message}"

Confirme a presença:`;
      break;

    case "cancellation":
      systemPrompt += `

TIPO: Paciente quer CANCELAR sessão
Responda confirmando e oferecendo reagendamento.`;
      userPrompt = `Paciente ${context.patientName}: "${message}"

Confirme o cancelamento e ofereça reagendamento:`;
      break;

    case "clinical_question":
      systemPrompt += `

TIPO: Pergunta clínica/sobre problema
IMPORTANTE: NÃO discuta o problema em detalhes!
Redirecione para a consulta de forma educada.`;
      userPrompt = `Paciente ${context.patientName}: "${message}"

Redirecione para a consulta sem discutir o problema:`;
      break;

    default:
      systemPrompt += `

TIPO: Outro assunto
Responda brevemente e redirecione para agendamento se necessário.`;
      userPrompt = `Paciente ${context.patientName}: "${message}"

Responda brevemente:`;
  }

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0].message.content || "";
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE RESPOSTAS FOCADAS ───
// ═══════════════════════════════════════════════════════════════

export const focusedResponseExamples = {
  // ═══════════════════════════════════════════════════════════════
  // SCHEDULING (Agendar)
  // ═══════════════════════════════════════════════════════════════

  scheduling: {
    question: "Oi, gostaria de agendar uma sessão",
    correct:
      "Ótimo! Temos disponibilidade terça às 14h ou quinta às 10h. Qual você prefere?",
    wrong:
      "Que bom que você quer começar! Vamos conversar sobre seus sentimentos...", // Muito longo, clínico
  },

  // ═══════════════════════════════════════════════════════════════
  // RESCHEDULING (Remarcar)
  // ═══════════════════════════════════════════════════════════════

  rescheduling: {
    question: "Preciso remarcar minha sessão de amanhã",
    correct:
      "Sem problema! Temos terça às 14h ou quinta às 10h. Qual funciona melhor?",
    wrong:
      "Tudo bem, entendo que algo surgiu. Qual é o motivo? Podemos conversar sobre isso...", // Muito longo, investigativo
  },

  // ═══════════════════════════════════════════════════════════════
  // CONFIRMATION (Confirmar)
  // ═══════════════════════════════════════════════════════════════

  confirmation: {
    question: "Confirmo minha sessão de terça às 14h",
    correct: "Perfeito! Te vejo terça às 14h. Até lá!",
    wrong:
      "Que bom que você está confirmando! Isso mostra seu comprometimento com o processo...", // Muito longo, motivacional
  },

  // ═══════════════════════════════════════════════════════════════
  // CANCELLATION (Cancelar)
  // ═══════════════════════════════════════════════════════════════

  cancellation: {
    question: "Não consigo ir amanhã, preciso cancelar",
    correct: "Tudo bem. Quer remarcar para outro dia? Temos terça ou quinta.",
    wrong:
      "Entendo que algo urgente surgiu. Tudo bem? Quer conversar sobre o que aconteceu?", // Muito investigativo
  },

  // ═══════════════════════════════════════════════════════════════
  // CLINICAL QUESTION (Pergunta Clínica)
  // ═══════════════════════════════════════════════════════════════

  clinical_question_anxiety: {
    question: "Estou com muita ansiedade, o que fazer?",
    correct:
      "Vamos conversar sobre isso na sua sessão. Quando você pode vir? Terça ou quinta?",
    wrong:
      "A ansiedade é uma resposta natural do corpo. Vamos trabalhar técnicas de respiração...", // Muito clínico, detalhado
  },

  clinical_question_depression: {
    question: "Estou me sentindo muito triste últimamente",
    correct:
      "Entendo. Vamos explorar isso melhor na sua consulta. Quer agendar logo?",
    wrong:
      "A tristeza pode estar relacionada a vários fatores. Vamos investigar sua história...", // Muito clínico
  },

  clinical_question_relationship: {
    question: "Meu relacionamento está complicado",
    correct:
      "Vamos conversar sobre isso na sessão. Quando você pode vir? Terça às 14h ou quinta às 10h?",
    wrong:
      "Relacionamentos são complexos. Vamos explorar sua dinâmica com seu parceiro...", // Muito clínico
  },

  // ═══════════════════════════════════════════════════════════════
  // OTHER (Outro)
  // ═══════════════════════════════════════════════════════════════

  other: {
    question: "Qual é o valor da sessão?",
    correct: "A sessão custa R$ 150. Quer agendar?",
    wrong:
      "Nossos valores são competitivos no mercado. Oferecemos pacotes com desconto...", // Muito longo
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── FLUXO COMPLETO: MENSAGEM → CLASSIFICAR → RESPONDER ───
// ═══════════════════════════════════════════════════════════════

export async function handleWhatsappTelegramMessage(
  message: string,
  context: ChannelContext
): Promise<{
  messageType:
    | "scheduling"
    | "rescheduling"
    | "confirmation"
    | "cancellation"
    | "clinical_question"
    | "other";
  response: string;
  isFocused: boolean;
  characterCount: number;
  wordCount: number;
}> {
  /**
   * Fluxo completo para WhatsApp/Telegram:
   * 1. Classificar tipo de mensagem
   * 2. Gerar resposta focada
   * 3. Validar se está focada (máx 1-2 frases)
   * 4. Retornar resposta
   */

  // Classificar mensagem
  const messageType = await classifyMessageType(message);

  // Gerar resposta focada
  const response = await generateFocusedSchedulingResponse(
    message,
    messageType,
    context
  );

  // Validar se está focada
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const isFocused = sentences.length <= 2 && response.length <= 200;

  return {
    messageType,
    response,
    isFocused,
    characterCount: response.length,
    wordCount: response.split(/\s+/).length,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── VALIDAR RESPOSTA FOCADA ───
// ═══════════════════════════════════════════════════════════════

export function validateFocusedResponse(response: string): {
  isValid: boolean;
  issues: string[];
  score: number;
} {
  /**
   * Valida se a resposta está focada em agendamento
   * Retorna score de 0-100
   */

  const issues: string[] = [];
  let score = 100;

  // Verificar comprimento
  if (response.length > 200) {
    issues.push("Resposta muito longa (máx 200 caracteres)");
    score -= 20;
  }

  // Verificar número de frases
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 2) {
    issues.push(`Muitas frases (${sentences.length}, máx 2)`);
    score -= 15;
  }

  // Verificar se tem palavras clínicas
  const clinicalKeywords = [
    "técnica",
    "terapia",
    "trauma",
    "inconsciente",
    "padrão",
    "bloqueio",
    "processamento",
    "integração",
  ];
  const hasClinical = clinicalKeywords.some((keyword) =>
    response.toLowerCase().includes(keyword)
  );
  if (hasClinical) {
    issues.push("Contém linguagem clínica (deixar para consulta)");
    score -= 25;
  }

  // Verificar se menciona agendamento
  const schedulingKeywords = [
    "agendar",
    "horário",
    "dia",
    "hora",
    "disponível",
    "terça",
    "quinta",
    "segunda",
    "quarta",
    "sexta",
  ];
  const hasScheduling = schedulingKeywords.some((keyword) =>
    response.toLowerCase().includes(keyword)
  );
  if (!hasScheduling && sentences.length > 0) {
    // Se não é resposta simples de confirmação
    issues.push("Não menciona agendamento/horários");
    score -= 10;
  }

  return {
    isValid: score >= 70,
    issues,
    score: Math.max(0, score),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE USO ───
// ═══════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Classificar mensagem
 * 
 * const type = await classifyMessageType("Estou com muita ansiedade");
 * console.log(type); // "clinical_question"
 * 
 * 
 * Exemplo 2: Gerar resposta focada
 * 
 * const response = await generateFocusedSchedulingResponse(
 *   message = "Estou com muita ansiedade",
 *   messageType = "clinical_question",
 *   context = {
 *     channel: "whatsapp",
 *     patientName: "Maria",
 *     therapistName: "Dani"
 *   }
 * );
 * 
 * console.log(response);
 * // "Vamos conversar sobre isso na sua sessão. Quando você pode vir?"
 * 
 * 
 * Exemplo 3: Fluxo completo
 * 
 * const result = await handleWhatsappTelegramMessage(
 *   message = "Preciso agendar uma sessão",
 *   context = {
 *     channel: "whatsapp",
 *     patientName: "João",
 *     therapistName: "Dani",
 *     nextAppointmentDate: "30/03/2026",
 *     nextAppointmentTime: "14:00"
 *   }
 * );
 * 
 * console.log(result);
 * // {
 * //   messageType: "scheduling",
 * //   response: "Ótimo! Temos terça às 14h ou quinta às 10h. Qual você prefere?",
 * //   isFocused: true,
 * //   characterCount: 78,
 * //   wordCount: 15
 * // }
 * 
 * 
 * Exemplo 4: Validar resposta
 * 
 * const validation = validateFocusedResponse(
 *   "Ótimo! Temos terça às 14h ou quinta às 10h. Qual você prefere?"
 * );
 * 
 * console.log(validation);
 * // { isValid: true, issues: [], score: 100 }
 */
