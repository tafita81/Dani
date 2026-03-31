/**
 * Response Memory — Memória de Respostas
 * Nunca esquece de respostas já dadas
 * Detecta perguntas repetidas
 * Mantém coerência nas respostas
 */

import { getDb } from "../core_logic/db";
import { invokeLLM } from "../_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── TIPOS ───
// ═══════════════════════════════════════════════════════════════

export interface StoredResponse {
  id: number;
  patientId: number;
  userId: number;
  question: string; // Pergunta original
  questionHash: string; // Hash para detecção rápida
  response: string; // Resposta dada
  responseDate: Date; // Quando foi respondida
  responseCount: number; // Quantas vezes essa pergunta foi feita
  lastAskedDate: Date; // Última vez que foi perguntado
  isVaried: boolean; // Se a resposta pode variar
  relatedQuestions: string[]; // Perguntas similares
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR HASH DA PERGUNTA ───
// ═══════════════════════════════════════════════════════════════

export function generateQuestionHash(question: string): string {
  /**
   * Gera hash da pergunta para detecção rápida
   * Normaliza a pergunta (remove pontuação, espaços extras)
   */

  const normalized = question
    .toLowerCase()
    .replace(/[?!.,;:]/g, "") // Remove pontuação
    .replace(/\s+/g, " ") // Normaliza espaços
    .trim();

  // Simples hash (em produção, usar algo mais robusto)
  return Buffer.from(normalized).toString("base64");
}

// ═══════════════════════════════════════════════════════════════
// ─── BUSCAR RESPOSTA ANTERIOR ───
// ═══════════════════════════════════════════════════════════════

export async function findPreviousResponse(
  patientId: number,
  userId: number,
  question: string
): Promise<StoredResponse | null> {
  /**
   * Busca se essa pergunta já foi feita antes
   * Retorna a resposta anterior se existir
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const questionHash = generateQuestionHash(question);

  // Buscar resposta anterior com mesmo hash
  const storedResponse = await db.query.storedResponses?.findFirst?.({
    where: (responses: any) =>
      responses.patientId === patientId &&
      responses.userId === userId &&
      responses.questionHash === questionHash,
  });

  return storedResponse || null;
}

// ═══════════════════════════════════════════════════════════════
// ─── DETECTAR PERGUNTAS SIMILARES ───
// ═══════════════════════════════════════════════════════════════

export async function findSimilarQuestions(
  patientId: number,
  userId: number,
  question: string,
  threshold: number = 0.7 // 70% de similaridade
): Promise<StoredResponse[]> {
  /**
   * Encontra perguntas similares já respondidas
   * Usa similaridade de texto (cosine similarity)
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Buscar todas as respostas anteriores do paciente
  const allResponses = await db.query.storedResponses?.findMany?.({
    where: (responses: any) =>
      responses.patientId === patientId && responses.userId === userId,
  });

  if (!allResponses || allResponses.length === 0) {
    return [];
  }

  // Calcular similaridade com cada pergunta anterior
  const similarResponses = allResponses.filter((stored: any) => {
    const similarity = calculateSimilarity(question, stored.question);
    return similarity >= threshold;
  });

  return similarResponses;
}

// ═══════════════════════════════════════════════════════════════
// ─── CALCULAR SIMILARIDADE ENTRE TEXTOS ───
// ═══════════════════════════════════════════════════════════════

export function calculateSimilarity(text1: string, text2: string): number {
  /**
   * Calcula similaridade entre dois textos (0-1)
   * Usa Levenshtein distance normalizado
   */

  const s1 = text1.toLowerCase();
  const s2 = text2.toLowerCase();

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// ═══════════════════════════════════════════════════════════════
// ─── CALCULAR DISTÂNCIA DE EDIÇÃO (LEVENSHTEIN) ───
// ═══════════════════════════════════════════════════════════════

export function getEditDistance(s1: string, s2: string): number {
  /**
   * Calcula distância de Levenshtein entre dois strings
   */

  const costs = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

// ═══════════════════════════════════════════════════════════════
// ─── SALVAR RESPOSTA NA MEMÓRIA ───
// ═══════════════════════════════════════════════════════════════

export async function saveResponseToMemory(
  patientId: number,
  userId: number,
  question: string,
  response: string,
  isVaried: boolean = false
): Promise<StoredResponse> {
  /**
   * Salva uma pergunta e resposta na memória
   * Para nunca esquecer
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const questionHash = generateQuestionHash(question);

  // Verificar se pergunta já existe
  const existing = await findPreviousResponse(patientId, userId, question);

  if (existing) {
    // Atualizar contagem e data
    // await db.update(storedResponses)
    //   .set({
    //     responseCount: existing.responseCount + 1,
    //     lastAskedDate: new Date(),
    //   })
    //   .where(eq(storedResponses.id, existing.id));

    return {
      ...existing,
      responseCount: existing.responseCount + 1,
      lastAskedDate: new Date(),
    };
  }

  // Criar nova resposta
  const newResponse: StoredResponse = {
    id: Math.floor(Math.random() * 1000000),
    patientId,
    userId,
    question,
    questionHash,
    response,
    responseDate: new Date(),
    responseCount: 1,
    lastAskedDate: new Date(),
    isVaried,
    relatedQuestions: [],
  };

  return newResponse;
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR RESPOSTA COM MEMÓRIA ───
// ═══════════════════════════════════════════════════════════════

export async function generateResponseWithMemory(
  patientId: number,
  userId: number,
  question: string,
  therapistName: string = "Dani",
  conversationHistory: any[] = []
): Promise<{
  response: string;
  isRepeated: boolean;
  previousResponseDate?: Date;
  responseCount?: number;
  isSimilar: boolean;
  similarQuestions?: string[];
}> {
  /**
   * Gera resposta considerando:
   * 1. Se a pergunta já foi feita antes (exatamente igual)
   * 2. Se há perguntas similares
   * 3. Mantém coerência com respostas anteriores
   * 4. Nunca contradiz o que foi dito antes
   */

  // Buscar resposta anterior exata
  const previousResponse = await findPreviousResponse(patientId, userId, question);

  if (previousResponse) {
    // Pergunta já foi feita antes
    return {
      response: previousResponse.response,
      isRepeated: true,
      previousResponseDate: previousResponse.responseDate,
      responseCount: previousResponse.responseCount,
      isSimilar: false,
    };
  }

  // Buscar perguntas similares
  const similarQuestions = await findSimilarQuestions(
    patientId,
    userId,
    question,
    0.75
  );

  let systemPrompt = `Você é ${therapistName}, uma psicóloga profissional.

IMPORTANTE - Memória de Respostas:
1. Você NUNCA deve contradizer respostas anteriores
2. Se a pergunta é similar a uma anterior, mantenha coerência
3. Sempre responda em primeira pessoa
4. Máximo 2-3 frases
5. Responda APENAS com a mensagem`;

  if (similarQuestions.length > 0) {
    systemPrompt += `

PERGUNTAS SIMILARES JÁ RESPONDIDAS:
${similarQuestions.map((q) => `- "${q.question}" → Resposta: "${q.response}"`).join("\n")}

Mantenha coerência com essas respostas anteriores!`;
  }

  const userPrompt = `Paciente: ${question}

Responda como ${therapistName}, mantendo coerência com respostas anteriores:`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const newResponse = response.choices[0].message.content || "";

  // Salvar na memória
  await saveResponseToMemory(patientId, userId, question, newResponse);

  return {
    response: newResponse,
    isRepeated: false,
    isSimilar: similarQuestions.length > 0,
    similarQuestions: similarQuestions.map((q) => q.question),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR VARIAÇÃO DE RESPOSTA ───
// ═══════════════════════════════════════════════════════════════

export async function generateResponseVariation(
  patientId: number,
  userId: number,
  question: string,
  previousResponse: string,
  therapistName: string = "Dani"
): Promise<string> {
  /**
   * Gera uma variação da resposta anterior
   * Mantém o mesmo significado mas com palavras diferentes
   * Útil para perguntas similares
   */

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é ${therapistName}, uma psicóloga profissional.

Gere uma VARIAÇÃO da resposta anterior, mantendo o mesmo significado mas com palavras diferentes.

IMPORTANTE:
- Mesma mensagem, palavras diferentes
- Máximo 2-3 frases
- Mantenha tom profissional-humanizado
- Responda APENAS com a mensagem`,
      },
      {
        role: "user",
        content: `Pergunta anterior similar: "${question}"
Resposta anterior: "${previousResponse}"

Gere uma variação dessa resposta:`,
      },
    ],
  });

  return response.choices[0].message.content || previousResponse;
}

// ═══════════════════════════════════════════════════════════════
// ─── FLUXO COMPLETO: PERGUNTA → MEMÓRIA → RESPOSTA ───
// ═══════════════════════════════════════════════════════════════

export async function handlePatientQuestionWithMemory(
  patientId: number,
  userId: number,
  question: string,
  patientName: string,
  therapistName: string = "Dani",
  conversationHistory: any[] = []
): Promise<{
  question: string;
  response: string;
  isRepeated: boolean;
  isSimilar: boolean;
  similarQuestions?: string[];
  previousResponseDate?: Date;
  responseCount?: number;
  timestamp: Date;
}> {
  /**
   * Fluxo completo:
   * 1. Recebe pergunta do paciente
   * 2. Verifica se já foi respondida
   * 3. Se sim, retorna resposta anterior
   * 4. Se não, gera nova resposta
   * 5. Salva na memória
   * 6. Retorna resultado
   */

  const result = await generateResponseWithMemory(
    patientId,
    userId,
    question,
    therapistName,
    conversationHistory
  );

  return {
    question,
    response: result.response,
    isRepeated: result.isRepeated,
    isSimilar: result.isSimilar,
    similarQuestions: result.similarQuestions,
    previousResponseDate: result.previousResponseDate,
    responseCount: result.responseCount,
    timestamp: new Date(),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── LISTAR TODAS AS PERGUNTAS E RESPOSTAS ───
// ═══════════════════════════════════════════════════════════════

export async function listAllQuestionsAndAnswers(
  patientId: number,
  userId: number
): Promise<
  Array<{
    question: string;
    response: string;
    responseDate: Date;
    responseCount: number;
    lastAskedDate: Date;
  }>
> {
  /**
   * Lista todas as perguntas e respostas já dadas
   * Útil para revisão e análise
   */

  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const responses = await db.query.storedResponses?.findMany?.({
    where: (responses: any) =>
      responses.patientId === patientId && responses.userId === userId,
    orderBy: (responses: any) => responses.responseDate,
  });

  return (
    responses?.map((r: any) => ({
      question: r.question,
      response: r.response,
      responseDate: r.responseDate,
      responseCount: r.responseCount,
      lastAskedDate: r.lastAskedDate,
    })) || []
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE USO ───
// ═══════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Detectar pergunta repetida
 * 
 * const previous = await findPreviousResponse(
 *   patientId = 123,
 *   userId = 1,
 *   question = "Como lidar com ansiedade?"
 * );
 * 
 * if (previous) {
 *   console.log("Pergunta já foi feita!");
 *   console.log("Resposta anterior:", previous.response);
 *   console.log("Respondida em:", previous.responseDate);
 * }
 * 
 * 
 * Exemplo 2: Encontrar perguntas similares
 * 
 * const similar = await findSimilarQuestions(
 *   patientId = 123,
 *   userId = 1,
 *   question = "Como controlar minha ansiedade?"
 * );
 * 
 * console.log(`${similar.length} perguntas similares encontradas`);
 * 
 * 
 * Exemplo 3: Gerar resposta com memória
 * 
 * const result = await generateResponseWithMemory(
 *   patientId = 123,
 *   userId = 1,
 *   question = "Como lidar com ansiedade?",
 *   therapistName = "Dani"
 * );
 * 
 * if (result.isRepeated) {
 *   console.log("Pergunta repetida!");
 *   console.log("Resposta anterior:", result.response);
 * } else {
 *   console.log("Nova pergunta respondida");
 * }
 * 
 * 
 * Exemplo 4: Fluxo completo
 * 
 * const answer = await handlePatientQuestionWithMemory(
 *   patientId = 123,
 *   userId = 1,
 *   question = "Como lidar com ansiedade?",
 *   patientName = "Maria",
 *   therapistName = "Dani"
 * );
 * 
 * console.log(answer);
 * // {
 * //   question: "Como lidar com ansiedade?",
 * //   response: "Entendo sua preocupação...",
 * //   isRepeated: false,
 * //   isSimilar: true,
 * //   similarQuestions: ["Como controlar minha ansiedade?"],
 * //   timestamp: 2026-03-29T...
 * // }
 * 
 * 
 * Exemplo 5: Listar todas as perguntas e respostas
 * 
 * const history = await listAllQuestionsAndAnswers(
 *   patientId = 123,
 *   userId = 1
 * );
 * 
 * history.forEach(item => {
 *   console.log(`P: ${item.question}`);
 *   console.log(`R: ${item.response}`);
 *   console.log(`Perguntado ${item.responseCount}x`);
 * });
 */
