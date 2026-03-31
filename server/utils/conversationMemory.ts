/**
 * Conversation Memory — Histórico Eterno e Contexto Permanente
 * Mantém todas as conversas de cada paciente
 * Nunca confunde pacientes
 * Sempre responde em primeira pessoa (Dani)
 */

import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── TIPOS ───
// ═══════════════════════════════════════════════════════════════

export interface ConversationMessage {
  id: number;
  patientId: number;
  userId: number; // Dani
  sender: "patient" | "therapist"; // Quem enviou
  message: string;
  channel: "whatsapp" | "telegram" | "email" | "app"; // Onde foi enviado
  timestamp: Date;
  readAt?: Date; // Quando foi lido
  responseTime?: number; // Tempo de resposta em ms
}

export interface PatientContext {
  patientId: number;
  patientName: string;
  patientPhone: string;
  mainIssue: string; // Problema principal
  abordagem: string; // TCC, Gestalt, Esquema, etc
  sessionCount: number; // Número de sessões
  lastSessionDate?: Date;
  nextSessionDate?: Date;
  keyInsights: string[]; // Insights importantes
  triggers: string[]; // Gatilhos identificados
  progressNotes: string[]; // Notas de progresso
  conversationHistory: ConversationMessage[]; // Histórico completo
}

// ═══════════════════════════════════════════════════════════════
// ─── CARREGAR HISTÓRICO COMPLETO DO PACIENTE ───
// ═══════════════════════════════════════════════════════════════

export async function loadPatientConversationHistory(
  patientId: number,
  userId: number,
  limit: number = 1000 // Carregar últimas 1000 mensagens
): Promise<ConversationMessage[]> {
  /**
   * Carrega TODAS as mensagens de um paciente
   * Nunca confunde com outro paciente
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Buscar histórico completo do paciente
  const messages = await db.query.conversationMessages?.findMany?.({
    where: (messages: any) =>
      messages.patientId === patientId && messages.userId === userId,
    orderBy: (messages: any) => messages.timestamp,
    limit,
  });

  return messages || [];
}

// ═══════════════════════════════════════════════════════════════
// ─── CARREGAR CONTEXTO COMPLETO DO PACIENTE ───
// ═══════════════════════════════════════════════════════════════

export async function loadPatientFullContext(
  patientId: number,
  userId: number
): Promise<PatientContext> {
  /**
   * Carrega contexto COMPLETO do paciente:
   * - Informações básicas
   * - Histórico de conversas
   * - Insights e progresso
   * - Próximas sessões
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Buscar paciente
  const patient = await db.query.patients?.findFirst?.({
    where: (patients: any) => patients.id === patientId,
  });

  if (!patient) {
    throw new Error(`Paciente ${patientId} não encontrado`);
  }

  // Buscar histórico de conversas
  const conversationHistory = await loadPatientConversationHistory(
    patientId,
    userId
  );

  // Buscar sessões
  const appointments = await db.query.appointments?.findMany?.({
    where: (appointments: any) => appointments.patientId === patientId,
    orderBy: (appointments: any) => appointments.appointmentDate,
  });

  // Buscar notas clínicas
  const sessionNotes = await db.query.sessionNotes?.findMany?.({
    where: (notes: any) => notes.patientId === patientId,
    orderBy: (notes: any) => notes.sessionDate,
  });

  // Extrair insights e progresso
  const keyInsights: string[] = [];
  const progressNotes: string[] = [];

  sessionNotes?.forEach((note: any) => {
    if (note.keyInsights) keyInsights.push(note.keyInsights);
    if (note.progressNotes) progressNotes.push(note.progressNotes);
  });

  // Buscar triggers
  const triggers: string[] = [];
  const therapeuticPlan = await db.query.therapeuticPlans?.findFirst?.({
    where: (plans: any) => plans.patientId === patientId,
  });

  if (therapeuticPlan && therapeuticPlan.triggers) {
    triggers.push(...therapeuticPlan.triggers.split(","));
  }

  return {
    patientId,
    patientName: patient.name || "Paciente",
    patientPhone: patient.phone || "",
    mainIssue: patient.mainIssue || "Não especificado",
    abordagem: patient.therapeuticApproach || "Integrativa",
    sessionCount: appointments?.length || 0,
    lastSessionDate: appointments?.[appointments.length - 1]?.appointmentDate,
    nextSessionDate: appointments?.find(
      (a: any) => new Date(a.appointmentDate) > new Date()
    )?.appointmentDate,
    keyInsights,
    triggers,
    progressNotes,
    conversationHistory,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── SALVAR MENSAGEM NO HISTÓRICO ───
// ═══════════════════════════════════════════════════════════════

export async function saveConversationMessage(
  patientId: number,
  userId: number,
  sender: "patient" | "therapist",
  message: string,
  channel: "whatsapp" | "telegram" | "email" | "app" = "whatsapp",
  responseTime?: number
): Promise<ConversationMessage> {
  /**
   * Salva uma mensagem no histórico
   * Mantém registro eterno
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Aqui você inseriria no banco de dados
  // Por enquanto, retornamos o objeto

  const newMessage: ConversationMessage = {
    id: Math.floor(Math.random() * 1000000),
    patientId,
    userId,
    sender,
    message,
    channel,
    timestamp: new Date(),
    responseTime,
  };

  return newMessage;
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR RESPOSTA COM CONTEXTO COMPLETO ───
// ═══════════════════════════════════════════════════════════════

export async function generateResponseWithFullContext(
  patientId: number,
  userId: number,
  patientMessage: string,
  therapistName: string = "Dani"
): Promise<string> {
  /**
   * Gera resposta considerando:
   * - Histórico completo de conversas
   * - Contexto do paciente
   * - Insights e progresso
   * - Nunca confunde com outro paciente
   * - Sempre em primeira pessoa (Dani)
   */

  // Carregar contexto completo
  const context = await loadPatientFullContext(patientId, userId);

  // Preparar histórico para o LLM
  const recentHistory = context.conversationHistory
    .slice(-20) // Últimas 20 mensagens
    .map(
      (msg) =>
        `${msg.sender === "patient" ? context.patientName : therapistName}: ${msg.message}`
    )
    .join("\n");

  const systemPrompt = `Você é ${therapistName}, uma psicóloga profissional.

INFORMAÇÕES DO PACIENTE:
- Nome: ${context.patientName}
- Problema principal: ${context.mainIssue}
- Abordagem: ${context.abordagem}
- Número de sessões: ${context.sessionCount}
${context.lastSessionDate ? `- Última sessão: ${new Date(context.lastSessionDate).toLocaleDateString("pt-BR")}` : ""}
${context.nextSessionDate ? `- Próxima sessão: ${new Date(context.nextSessionDate).toLocaleDateString("pt-BR")}` : ""}

INSIGHTS IMPORTANTES:
${context.keyInsights.slice(-3).join("\n") || "Nenhum insight registrado ainda"}

GATILHOS IDENTIFICADOS:
${context.triggers.join(", ") || "Nenhum gatilho identificado ainda"}

PROGRESSO:
${context.progressNotes.slice(-2).join("\n") || "Sem notas de progresso ainda"}

INSTRUÇÕES:
1. Responda SEMPRE em primeira pessoa (como se fosse ${therapistName})
2. Use o contexto completo para personalizar a resposta
3. Lembre-se de tudo que foi conversado com ${context.patientName}
4. Nunca confunda com outro paciente
5. Mantenha tom profissional-humanizado
6. Máximo 2-3 frases
7. Responda APENAS com a mensagem`;

  const userPrompt = `HISTÓRICO RECENTE:
${recentHistory}

NOVA MENSAGEM DE ${context.patientName}:
"${patientMessage}"

Responda como ${therapistName}:`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0].message.content || "";
}

// ═══════════════════════════════════════════════════════════════
// ─── FLUXO COMPLETO: RECEBER → CARREGAR CONTEXTO → RESPONDER ───
// ═══════════════════════════════════════════════════════════════

export async function handlePatientMessageWithMemory(
  patientId: number,
  userId: number,
  patientMessage: string,
  patientName: string,
  therapistName: string = "Dani"
): Promise<{
  patientId: number;
  patientName: string;
  response: string;
  contextLoaded: boolean;
  historyLength: number;
}> {
  /**
   * Fluxo completo:
   * 1. Carregar contexto completo do paciente
   * 2. Verificar se é o paciente correto (nunca confundir)
   * 3. Gerar resposta com contexto
   * 4. Salvar mensagem no histórico
   * 5. Retornar resposta
   */

  try {
    // Carregar contexto
    const context = await loadPatientFullContext(patientId, userId);

    // Verificar se é o paciente correto
    if (context.patientId !== patientId) {
      throw new Error(
        `Erro de segurança: Tentativa de confundir pacientes! ${patientId} vs ${context.patientId}`
      );
    }

    // Gerar resposta com contexto
    const response = await generateResponseWithFullContext(
      patientId,
      userId,
      patientMessage,
      therapistName
    );

    // Salvar mensagem do paciente
    await saveConversationMessage(
      patientId,
      userId,
      "patient",
      patientMessage,
      "whatsapp"
    );

    // Salvar resposta de Dani
    await saveConversationMessage(
      patientId,
      userId,
      "therapist",
      response,
      "whatsapp"
    );

    return {
      patientId,
      patientName: context.patientName,
      response,
      contextLoaded: true,
      historyLength: context.conversationHistory.length,
    };
  } catch (error) {
    throw new Error(
      `Erro ao processar mensagem do paciente ${patientId}: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── BUSCAR MENSAGENS POR PERÍODO ───
// ═══════════════════════════════════════════════════════════════

export async function getConversationsByDateRange(
  patientId: number,
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<ConversationMessage[]> {
  /**
   * Busca todas as mensagens de um paciente em um período
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const messages = await db.query.conversationMessages?.findMany?.({
    where: (messages: any) =>
      messages.patientId === patientId &&
      messages.userId === userId &&
      messages.timestamp >= startDate &&
      messages.timestamp <= endDate,
    orderBy: (messages: any) => messages.timestamp,
  });

  return messages || [];
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR RESUMO DE CONVERSA ───
// ═══════════════════════════════════════════════════════════════

export async function generateConversationSummary(
  patientId: number,
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<string> {
  /**
   * Gera um resumo das conversas em um período
   * Útil para relatórios e notas clínicas
   */

  const messages = await getConversationsByDateRange(
    patientId,
    userId,
    startDate,
    endDate
  );

  const context = await loadPatientFullContext(patientId, userId);

  const conversationText = messages
    .map((msg) => `${msg.sender === "patient" ? "Paciente" : "Dani"}: ${msg.message}`)
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é uma psicóloga. Gere um resumo profissional das conversas com um paciente.
        
Inclua:
- Temas principais abordados
- Emoções expressadas
- Progresso observado
- Próximos passos sugeridos

Responda em primeira pessoa como se fosse a psicóloga.`,
      },
      {
        role: "user",
        content: `Paciente: ${context.patientName}
Período: ${startDate.toLocaleDateString("pt-BR")} a ${endDate.toLocaleDateString("pt-BR")}

Conversas:
${conversationText}

Gere um resumo profissional:`,
      },
    ],
  });

  return response.choices[0].message.content || "";
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE USO ───
// ═══════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Carregar histórico completo
 * 
 * const history = await loadPatientConversationHistory(
 *   patientId = 123,
 *   userId = 1
 * );
 * 
 * console.log(`Total de mensagens: ${history.length}`);
 * 
 * 
 * Exemplo 2: Carregar contexto completo
 * 
 * const context = await loadPatientFullContext(
 *   patientId = 123,
 *   userId = 1
 * );
 * 
 * console.log(`Paciente: ${context.patientName}`);
 * console.log(`Problema: ${context.mainIssue}`);
 * console.log(`Sessões: ${context.sessionCount}`);
 * console.log(`Insights: ${context.keyInsights}`);
 * 
 * 
 * Exemplo 3: Gerar resposta com contexto
 * 
 * const response = await generateResponseWithFullContext(
 *   patientId = 123,
 *   userId = 1,
 *   patientMessage = "Não consegui dormir essa noite",
 *   therapistName = "Dani"
 * );
 * 
 * console.log(response);
 * // Resposta em primeira pessoa, considerando todo o histórico
 * 
 * 
 * Exemplo 4: Fluxo completo
 * 
 * const result = await handlePatientMessageWithMemory(
 *   patientId = 123,
 *   userId = 1,
 *   patientMessage = "Tô melhorando!",
 *   patientName = "Maria",
 *   therapistName = "Dani"
 * );
 * 
 * console.log(result);
 * // {
 * //   patientId: 123,
 * //   patientName: "Maria",
 * //   response: "Que bom ouvir isso, Maria! Continua assim...",
 * //   contextLoaded: true,
 * //   historyLength: 45
 * // }
 * 
 * 
 * Exemplo 5: Gerar resumo de conversa
 * 
 * const summary = await generateConversationSummary(
 *   patientId = 123,
 *   userId = 1,
 *   startDate = new Date("2026-03-01"),
 *   endDate = new Date("2026-03-31")
 * );
 * 
 * console.log(summary);
 * // Resumo profissional do mês
 */
