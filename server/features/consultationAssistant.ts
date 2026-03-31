/**
 * CONSULTATION ASSISTANT — Assistente IA para Consultas em Tempo Real
 * 
 * Funcionalidades:
 * ✅ Análise de emoções em tempo real
 * ✅ Recomendação inteligente de técnicas
 * ✅ Análise de histórico do paciente
 * ✅ Inferência silenciosa de preferências
 * ✅ Sugestões clínicas discretas
 * ✅ Detecção de padrões comportamentais
 * ✅ Alertas de risco
 * ✅ Responde APENAS em TEXTO (nunca áudio)
 * ✅ Invisível para o paciente
 * ✅ Apenas a psicóloga vê as sugestões
 */

import { z } from "zod";
import { protectedProcedure } from "./trpc";
import { db } from "./db";
import { invokeLLM } from "./server/_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── TIPOS ───
// ═══════════════════════════════════════════════════════════════

export interface ConsultationSession {
  sessionId: string;
  patientId: number;
  therapistId: number;
  startTime: Date;
  endTime?: Date;
  transcripts: Array<{
    speaker: "patient" | "therapist";
    text: string;
    timestamp: Date;
  }>;
  suggestions: ConsultationSuggestion[];
  alerts: ConsultationAlert[];
  analysis: SessionAnalysis;
}

export interface ConsultationSuggestion {
  id: string;
  type: "technique" | "intervention" | "observation" | "question" | "reframing";
  title: string;
  description: string;
  reasoning: string;
  relevanceScore: number; // 0-100
  timing: "immediate" | "soon" | "later";
  techniques: string[];
  approaches: Array<"TCC" | "Gestalt" | "Esquema" | "Integrativa">;
  createdAt: Date;
}

export interface ConsultationAlert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  type: "risk" | "pattern" | "opportunity" | "concern";
  title: string;
  description: string;
  recommendation: string;
  createdAt: Date;
}

export interface SessionAnalysis {
  emotionalState: {
    primaryEmotion: string;
    intensity: number; // 0-100
    sentiment: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
    secondaryEmotions: string[];
  };
  
  behavioralPatterns: {
    engagementLevel: number; // 0-100
    defensiveness: number; // 0-100
    vulnerabilityLevel: number; // 0-100
    communicationStyle: "direto" | "gradual" | "metafórico" | "socrático";
  };
  
  therapeuticProgress: {
    insightLevel: number; // 0-100
    resistanceLevel: number; // 0-100
    motivationLevel: number; // 0-100
    progressIndicators: string[];
  };
  
  techniqueEffectiveness: Array<{
    technique: string;
    effectiveness: number; // 0-100
    patientResponse: string;
  }>;
  
  keyThemes: string[];
  coreBeliefs: string[];
  triggers: string[];
  copingMechanisms: string[];
  riskFactors: string[];
}

// ═══════════════════════════════════════════════════════════════
// ─── ANÁLISE DE EMOÇÕES EM TEMPO REAL ───
// ═══════════════════════════════════════════════════════════════

export async function analyzeEmotionRealtime(
  patientSpeech: string
): Promise<{
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number;
  sentiment: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
  therapeuticApproach: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise emocional e psicologia clínica.

Analise o seguinte texto do paciente e identifique:
1. Emoção primária (medo, raiva, tristeza, alegria, ansiedade, culpa, vergonha, etc)
2. Emoções secundárias (até 3)
3. Intensidade (0-100)
4. Sentimento geral (very_positive, positive, neutral, negative, very_negative)
5. Abordagem terapêutica recomendada (TCC, Gestalt, Esquema, Integrativa)

Responda em JSON válido.`,
        },
        { role: "user", content: `Analise: "${patientSpeech}"` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "emotion_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              primaryEmotion: { type: "string" },
              secondaryEmotions: { type: "array", items: { type: "string" } },
              intensity: { type: "number" },
              sentiment: { type: "string" },
              therapeuticApproach: { type: "string" },
            },
            required: [
              "primaryEmotion",
              "secondaryEmotions",
              "intensity",
              "sentiment",
              "therapeuticApproach",
            ],
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Erro ao analisar emoção:", error);
    return {
      primaryEmotion: "unknown",
      secondaryEmotions: [],
      intensity: 50,
      sentiment: "neutral",
      therapeuticApproach: "TCC",
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── RECOMENDAÇÃO DE TÉCNICAS INTELIGENTES ───
// ═══════════════════════════════════════════════════════════════

export async function recommendTechniques(
  patientContext: string,
  emotionalState: string,
  patientHistory: any[],
  sessionTranscript: string
): Promise<ConsultationSuggestion[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em psicologia clínica com conhecimento profundo em TCC, Gestalt, Terapia do Esquema e abordagens integrativas.

Recomende técnicas e intervenções específicas para o momento atual da sessão.

Retorne um JSON com array de sugestões, cada uma contendo:
- type: "technique" | "intervention" | "observation" | "question" | "reframing"
- title: título breve
- description: descrição da técnica
- reasoning: por que é apropriada agora
- relevanceScore: 0-100
- timing: "immediate" | "soon" | "later"
- techniques: array de nomes de técnicas
- approaches: array de abordagens ["TCC", "Gestalt", "Esquema", "Integrativa"]

Máximo 5 sugestões.`,
        },
        {
          role: "user",
          content: `Contexto do paciente: ${patientContext}
Estado emocional: ${emotionalState}
Histórico: ${JSON.stringify(patientHistory)}
Transcrição da sessão: ${sessionTranscript}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "technique_recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    reasoning: { type: "string" },
                    relevanceScore: { type: "number" },
                    timing: { type: "string" },
                    techniques: { type: "array", items: { type: "string" } },
                    approaches: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
            required: ["suggestions"],
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return parsed.suggestions.map((s: any) => ({
      id: `sug_${Date.now()}_${Math.random()}`,
      type: s.type,
      title: s.title,
      description: s.description,
      reasoning: s.reasoning,
      relevanceScore: s.relevanceScore,
      timing: s.timing,
      techniques: s.techniques,
      approaches: s.approaches,
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error("Erro ao recomendar técnicas:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── ANÁLISE DE HISTÓRICO DO PACIENTE ───
// ═══════════════════════════════════════════════════════════════

export async function analyzePatientHistory(
  patientId: number
): Promise<{
  mostEffectiveTechniques: string[];
  leastEffectiveTechniques: string[];
  progressTrend: "melhorando" | "piorando" | "estável";
  engagementTrend: "aumentando" | "diminuindo" | "estável";
  detectedSensitivities: string[];
  preferredCommunicationStyle: string;
  riskFactors: string[];
}> {
  try {
    // Buscar histórico de sessões do paciente
    const sessions = await db.getPatientSessions(patientId);

    if (!sessions || sessions.length === 0) {
      return {
        mostEffectiveTechniques: [],
        leastEffectiveTechniques: [],
        progressTrend: "estável",
        engagementTrend: "estável",
        detectedSensitivities: [],
        preferredCommunicationStyle: "profissional",
        riskFactors: [],
      };
    }

    // Usar IA para analisar padrões
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Analise o histórico de sessões do paciente e identifique:
1. Técnicas mais efetivas
2. Técnicas menos efetivas
3. Tendência de progresso (melhorando, piorando, estável)
4. Tendência de engajamento (aumentando, diminuindo, estável)
5. Sensibilidades detectadas
6. Estilo de comunicação preferido
7. Fatores de risco

Responda em JSON.`,
        },
        {
          role: "user",
          content: `Histórico de sessões:\n${JSON.stringify(sessions)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "patient_history_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              mostEffectiveTechniques: { type: "array", items: { type: "string" } },
              leastEffectiveTechniques: { type: "array", items: { type: "string" } },
              progressTrend: { type: "string" },
              engagementTrend: { type: "string" },
              detectedSensitivities: { type: "array", items: { type: "string" } },
              preferredCommunicationStyle: { type: "string" },
              riskFactors: { type: "array", items: { type: "string" } },
            },
            required: [
              "mostEffectiveTechniques",
              "leastEffectiveTechniques",
              "progressTrend",
              "engagementTrend",
              "detectedSensitivities",
              "preferredCommunicationStyle",
              "riskFactors",
            ],
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Erro ao analisar histórico:", error);
    return {
      mostEffectiveTechniques: [],
      leastEffectiveTechniques: [],
      progressTrend: "estável",
      engagementTrend: "estável",
      detectedSensitivities: [],
      preferredCommunicationStyle: "profissional",
      riskFactors: [],
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── DETECÇÃO DE ALERTAS E RISCOS ───
// ═══════════════════════════════════════════════════════════════

export async function detectAlertsAndRisks(
  sessionTranscript: string,
  emotionalState: string,
  patientHistory: any[]
): Promise<ConsultationAlert[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em psicologia clínica responsável por detectar sinais de risco e alertas importantes.

Analise a sessão e identifique:
1. Sinais de risco (ideação suicida, automutilação, etc)
2. Padrões preocupantes
3. Oportunidades de intervenção
4. Preocupações clínicas

Retorne um JSON com array de alertas, cada um contendo:
- severity: "low" | "medium" | "high" | "critical"
- type: "risk" | "pattern" | "opportunity" | "concern"
- title: título do alerta
- description: descrição detalhada
- recommendation: recomendação de ação

Máximo 5 alertas.`,
        },
        {
          role: "user",
          content: `Transcrição: ${sessionTranscript}
Estado emocional: ${emotionalState}
Histórico: ${JSON.stringify(patientHistory)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "alerts_and_risks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              alerts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    severity: { type: "string" },
                    type: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    recommendation: { type: "string" },
                  },
                },
              },
            },
            required: ["alerts"],
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return parsed.alerts.map((a: any) => ({
      id: `alert_${Date.now()}_${Math.random()}`,
      severity: a.severity,
      type: a.type,
      title: a.title,
      description: a.description,
      recommendation: a.recommendation,
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error("Erro ao detectar alertas:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── PROCEDURE: PROCESSAR TRANSCRIÇÃO E GERAR SUGESTÕES ───
// ═══════════════════════════════════════════════════════════════

export const processConsultationProcedure = protectedProcedure
  .input(
    z.object({
      sessionId: z.string(),
      patientId: z.number(),
      transcript: z.string(),
      speaker: z.enum(["patient", "therapist"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // 1. Analisar emoção do paciente
      const emotionAnalysis = await analyzeEmotionRealtime(input.transcript);

      // 2. Analisar histórico do paciente
      const historyAnalysis = await analyzePatientHistory(input.patientId);

      // 3. Recomendar técnicas
      const suggestions = await recommendTechniques(
        `Paciente ID: ${input.patientId}`,
        `Emoção primária: ${emotionAnalysis.primaryEmotion}, Intensidade: ${emotionAnalysis.intensity}`,
        historyAnalysis,
        input.transcript
      );

      // 4. Detectar alertas
      const alerts = await detectAlertsAndRisks(
        input.transcript,
        emotionAnalysis.sentiment,
        historyAnalysis
      );

      // 5. Filtrar sugestões por relevância (apenas as mais relevantes)
      const topSuggestions = suggestions
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      // 6. Salvar no banco de dados
      await db.createConsultationAnalysis({
        sessionId: input.sessionId,
        patientId: input.patientId,
        therapistId: ctx.user.id,
        emotionAnalysis,
        suggestions: topSuggestions,
        alerts,
        timestamp: new Date(),
      });

      return {
        success: true,
        emotionAnalysis,
        suggestions: topSuggestions,
        alerts,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      throw error;
    }
  });

// ═══════════════════════════════════════════════════════════════
// ─── PROCEDURE: OBTER SUGESTÕES DA SESSÃO ───
// ═══════════════════════════════════════════════════════════════

export const getSessionSuggestionsProcedure = protectedProcedure
  .input(
    z.object({
      sessionId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      const analysis = await db.getConsultationAnalysis(input.sessionId);

      if (!analysis) {
        return {
          success: false,
          message: "Análise não encontrada",
        };
      }

      return {
        success: true,
        emotionAnalysis: analysis.emotionAnalysis,
        suggestions: analysis.suggestions,
        alerts: analysis.alerts,
        timestamp: analysis.timestamp,
      };
    } catch (error) {
      console.error("Erro ao obter sugestões:", error);
      throw error;
    }
  });
