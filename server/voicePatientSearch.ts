/**
 * Voice Patient Search — Busca Inteligente de Pacientes por Voz
 * Permite que a psicóloga Dani busque pacientes por características faladas
 * Ex: "Paciente com ansiedade que usa TCC"
 * Ideal para uso no carro com escuta contínua
 */

import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── EXTRAÇÃO DE CARACTERÍSTICAS DA VOZ ───
// ═══════════════════════════════════════════════════════════════

export async function extractPatientCharacteristics(voiceInput: string) {
  /**
   * Exemplos de input:
   * - "Paciente com ansiedade que usa TCC"
   * - "Aquele que tem problema de relacionamento"
   * - "A menina que faz gestalt"
   * - "Paciente novo, depressão"
   */

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um assistente que extrai características de pacientes a partir de descrições em linguagem natural.
        
Extraia e retorne um JSON com:
- keywords: array de palavras-chave (problemas, sintomas, nomes parciais)
- approach: abordagem terapêutica (tcc, terapia_esquema, gestalt, integrativa)
- status: status do paciente (ativo, em_pausa, finalizado)
- demographics: idade aproximada, gênero se mencionado

Responda APENAS com JSON válido, sem explicações.`,
      },
      {
        role: "user",
        content: `Extraia características do paciente: "${voiceInput}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "patient_characteristics",
        strict: true,
        schema: {
          type: "object",
          properties: {
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Palavras-chave extraídas",
            },
            approach: {
              type: "string",
              enum: ["tcc", "terapia_esquema", "gestalt", "integrativa"],
              description: "Abordagem terapêutica",
            },
            status: {
              type: "string",
              enum: ["ativo", "em_pausa", "finalizado"],
              description: "Status do paciente",
            },
            demographics: {
              type: "object",
              properties: {
                ageRange: { type: "string" },
                gender: { type: "string" },
              },
            },
            confidence: {
              type: "number",
              description: "Confiança da extração (0-1)",
            },
          },
          required: ["keywords", "confidence"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return content;
  } catch (e) {
    console.error("[VoiceSearch] Erro ao parsear características:", e);
    return {
      keywords: voiceInput.split(" "),
      confidence: 0.3,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── BUSCA INTELIGENTE DE PACIENTES ───
// ═══════════════════════════════════════════════════════════════

export async function searchPatientsByVoice(userId: number, voiceInput: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // 1. Extrair características da descrição em voz
  const characteristics = await extractPatientCharacteristics(voiceInput);

  // 2. Buscar pacientes com base nas características
  const allPatients = await db.getPatients(userId);

  const scoredPatients = allPatients.map((patient: any) => {
    let score = 0;

    // Score por keywords
    const patientText = `${patient.name} ${patient.mainConcern || ""} ${patient.primaryApproach || ""}`.toLowerCase();
    characteristics.keywords?.forEach((keyword: string) => {
      if (patientText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // Score por abordagem
    if (
      characteristics.approach &&
      patient.primaryApproach === characteristics.approach
    ) {
      score += 15;
    }

    // Score por status
    if (characteristics.status && patient.status === characteristics.status) {
      score += 10;
    }

    // Score por demograficos
    if (characteristics.demographics?.gender) {
      if (patient.gender === characteristics.demographics.gender) {
        score += 5;
      }
    }

    return { patient, score };
  });

  // 3. Ordenar por score e retornar top 3
  const topMatches = scoredPatients
    .filter((p: any) => p.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3);

  return {
    characteristics,
    matches: topMatches.map((m: any) => ({
      ...m.patient,
      matchScore: m.score,
    })),
    totalMatches: topMatches.length,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE RESPOSTA CONTEXTUALIZADA ───
// ═══════════════════════════════════════════════════════════════

export async function generatePatientContextResponse(
  userId: number,
  patientId: number,
  question: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Obter contexto completo do paciente
  const context = await db.getPatientFullContext(userId, patientId);

  if (!context) {
    return {
      response:
        "Desculpe, não encontrei informações sobre este paciente.",
      confidence: 0,
    };
  }

  // Gerar resposta contextualizada com IA
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um assistente clínico para a psicóloga Dani. 
        
Você tem acesso ao contexto completo do paciente e deve responder perguntas de forma concisa e profissional.
Respostas devem ser curtas (máx 2-3 frases) pois serão lidas em voz alta enquanto dirige.

Contexto do paciente:
- Nome: ${context.name}
- Idade: ${context.age}
- Gênero: ${context.gender}
- Abordagem: ${context.primaryApproach}
- Problema Principal: ${context.mainConcern}
- Status: ${context.status}
- Última Sessão: ${context.lastSessionDate}
- Notas: ${context.clinicalNotes || "Nenhuma"}`,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  return {
    response: response.choices[0].message.content,
    patientName: context.name,
    confidence: 0.95,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── OTIMIZAÇÃO PARA USO NO CARRO ───
// ═══════════════════════════════════════════════════════════════

export function formatResponseForCar(response: string): {
  text: string;
  duration: number;
} {
  /**
   * Formata resposta para ser lida em voz alta enquanto dirige
   * - Remove markdown
   * - Mantém apenas essencial
   * - Calcula duração aproximada
   */

  // Remover markdown
  let cleanText = response
    .replace(/[*#_`]/g, "")
    .replace(/\n/g, " ")
    .trim();

  // Limitar a 150 caracteres (máx 20 segundos de fala)
  if (cleanText.length > 150) {
    cleanText = cleanText.substring(0, 147) + "...";
  }

  // Calcular duração aproximada (150 palavras por minuto)
  const wordCount = cleanText.split(" ").length;
  const duration = Math.ceil((wordCount / 150) * 60); // em segundos

  return {
    text: cleanText,
    duration,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── HISTÓRICO DE BUSCAS POR VOZ ───
// ═══════════════════════════════════════════════════════════════

export async function logVoiceSearch(
  userId: number,
  voiceInput: string,
  patientId: number | null,
  responseTime: number
) {
  /**
   * Registra buscas por voz para análise de padrões
   * Ajuda a otimizar o reconhecimento futuro
   */

  return {
    userId,
    voiceInput,
    patientId,
    responseTime,
    timestamp: new Date(),
    // Pode ser salvo em DB para análise
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── EXEMPLOS DE USO ───
// ═══════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Buscar paciente
 * 
 * const result = await searchPatientsByVoice(userId, "Paciente com ansiedade que usa TCC");
 * // Retorna: { matches: [...], characteristics: {...} }
 * 
 * 
 * Exemplo 2: Fazer pergunta sobre paciente
 * 
 * const response = await generatePatientContextResponse(
 *   userId,
 *   patientId,
 *   "Como está a ansiedade dela?"
 * );
 * // Retorna: { response: "Melhorando significativamente...", confidence: 0.95 }
 * 
 * 
 * Exemplo 3: Formatar para carro
 * 
 * const carResponse = formatResponseForCar(response.response);
 * // Retorna: { text: "Melhorando significativamente.", duration: 3 }
 */
