/**
 * Análise de Voz com IA
 * Processa transcrições de áudio do Assistente Carro com LLM para gerar insights
 */

import { invokeLLM } from "./_core/llm";

export interface VoiceAIInsight {
  transcript: string;
  summary: string;
  keyTopics: string[];
  emotionalTone: string;
  recommendations: string[];
  patternDetected: string | null;
  confidenceScore: number;
  timestamp: Date;
}

/**
 * Analisa transcrição de voz com IA para gerar insights
 */
export async function analyzeVoiceWithAI(
  transcript: string,
  patientContext?: {
    name: string;
    history: string;
    currentTreatment: string;
  }
): Promise<VoiceAIInsight> {
  try {
    const systemPrompt = `Você é um assistente clínico especializado em análise de consultas psicológicas.
Sua tarefa é analisar transcrições de áudio do Assistente Carro (psicóloga dirigindo sozinha) e gerar insights clínicos.

Analise:
1. Resumo da transcrição
2. Tópicos principais mencionados
3. Tom emocional detectado
4. Recomendações clínicas
5. Padrões comportamentais detectados

Responda em JSON com a seguinte estrutura:
{
  "summary": "resumo conciso",
  "keyTopics": ["tópico1", "tópico2"],
  "emotionalTone": "tom detectado",
  "recommendations": ["recomendação1", "recomendação2"],
  "patternDetected": "padrão ou null",
  "confidenceScore": 0.85
}`;

    const userPrompt = `Analise esta transcrição do Assistente Carro:
${patientContext ? `Contexto do paciente: ${patientContext.name} - ${patientContext.history}` : ""}

Transcrição:
"${transcript}"

Forneça análise em JSON.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "voice_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              keyTopics: { type: "array", items: { type: "string" } },
              emotionalTone: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } },
              patternDetected: { type: ["string", "null"] },
              confidenceScore: { type: "number" },
            },
            required: [
              "summary",
              "keyTopics",
              "emotionalTone",
              "recommendations",
              "patternDetected",
              "confidenceScore",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      transcript,
      summary: parsed.summary,
      keyTopics: parsed.keyTopics,
      emotionalTone: parsed.emotionalTone,
      recommendations: parsed.recommendations,
      patternDetected: parsed.patternDetected,
      confidenceScore: parsed.confidenceScore,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Erro ao analisar voz com IA:", error);
    throw error;
  }
}

/**
 * Detecta sinais de risco na transcrição
 */
export async function detectRiskSignals(
  transcript: string
): Promise<{
  riskLevel: "low" | "medium" | "high";
  signals: string[];
  urgency: boolean;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em detecção de sinais de risco em consultas psicológicas.
Detecte sinais de:
- Ideação suicida
- Automutilação
- Abuso de substâncias
- Violência
- Crises de ansiedade/pânico
- Depressão severa

Responda em JSON com riskLevel (low/medium/high), signals (array), e urgency (boolean).`,
        },
        {
          role: "user",
          content: `Analise esta transcrição para sinais de risco:\n"${transcript}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "risk_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              riskLevel: { type: "string", enum: ["low", "medium", "high"] },
              signals: { type: "array", items: { type: "string" } },
              urgency: { type: "boolean" },
            },
            required: ["riskLevel", "signals", "urgency"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      riskLevel: parsed.riskLevel,
      signals: parsed.signals,
      urgency: parsed.urgency,
    };
  } catch (error) {
    console.error("Erro ao detectar sinais de risco:", error);
    throw error;
  }
}

/**
 * Gera recomendações de técnicas baseadas na análise
 */
export async function generateTechniqueRecommendations(
  transcript: string,
  patientApproach: "TCC" | "Esquema" | "Gestalt" | "Integrativa"
): Promise<string[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em técnicas terapêuticas ${patientApproach}.
Baseado na transcrição, recomende as 3-5 técnicas mais eficazes para esta situação.
Responda como um array JSON de strings.`,
        },
        {
          role: "user",
          content: `Transcrição:\n"${transcript}"\n\nRecomende técnicas em JSON array.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      // Extrair array JSON da resposta
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }
    return [];
  } catch (error) {
    console.error("Erro ao gerar recomendações de técnicas:", error);
    return [];
  }
}
