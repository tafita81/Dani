import { invokeLLM } from "../_core/llm";

export interface SentimentAnalysisResult {
  overallSentiment: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
  sentimentScore: number; // -1 to 1
  emotionalStates: Array<{
    emotion: string;
    intensity: number; // 0-1
    confidence: number; // 0-1
  }>;
  emotionalShifts: Array<{
    from: string;
    to: string;
    timestamp: Date;
    significance: "low" | "medium" | "high";
  }>;
  keyPhrases: string[];
  riskIndicators: Array<{
    indicator: string;
    severity: "low" | "medium" | "high";
    recommendation: string;
  }>;
  positiveIndicators: string[];
  sessionMood: {
    start: string;
    current: string;
    trajectory: "improving" | "stable" | "declining";
  };
}

/**
 * Analisa sentimentos em tempo real durante a sessão
 */
export async function analyzeSentimentRealTime(
  transcriptionSegment: string,
  previousContext?: {
    patientName: string;
    mainComplaint: string;
    sessionHistory: string[];
  }
): Promise<SentimentAnalysisResult> {
  try {
    const systemPrompt = `Você é um especialista em análise de sentimentos e emoções para psicologia clínica.
Analise a transcrição para detectar:
1. Sentimento geral (muito positivo, positivo, neutro, negativo, muito negativo)
2. Estados emocionais específicos (ansiedade, tristeza, alegria, raiva, medo, esperança, etc.)
3. Mudanças emocionais significativas
4. Frases-chave que indicam emoções
5. Indicadores de risco (ideação suicida, desespero, etc.)
6. Indicadores positivos (esperança, resiliência, etc.)

Responda em JSON estruturado.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `${previousContext ? `Contexto: Paciente ${previousContext.patientName}, queixa: ${previousContext.mainComplaint}\n` : ""}Analise esta transcrição: "${transcriptionSegment}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentiment_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallSentiment: {
                type: "string",
                enum: ["very_positive", "positive", "neutral", "negative", "very_negative"],
              },
              sentimentScore: { type: "number" },
              emotionalStates: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    emotion: { type: "string" },
                    intensity: { type: "number" },
                    confidence: { type: "number" },
                  },
                },
              },
              keyPhrases: { type: "array", items: { type: "string" } },
              riskIndicators: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    indicator: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                    recommendation: { type: "string" },
                  },
                },
              },
              positiveIndicators: { type: "array", items: { type: "string" } },
            },
            required: [
              "overallSentiment",
              "sentimentScore",
              "emotionalStates",
              "keyPhrases",
              "riskIndicators",
              "positiveIndicators",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      overallSentiment: parsed.overallSentiment || "neutral",
      sentimentScore: parsed.sentimentScore || 0,
      emotionalStates: parsed.emotionalStates || [],
      emotionalShifts: [], // Será preenchido ao comparar com análises anteriores
      keyPhrases: parsed.keyPhrases || [],
      riskIndicators: parsed.riskIndicators || [],
      positiveIndicators: parsed.positiveIndicators || [],
      sessionMood: {
        start: "Análise inicial",
        current: parsed.overallSentiment || "neutral",
        trajectory: "stable",
      },
    };
  } catch (error) {
    console.error("Erro ao analisar sentimentos:", error);
    return {
      overallSentiment: "neutral",
      sentimentScore: 0,
      emotionalStates: [],
      emotionalShifts: [],
      keyPhrases: [],
      riskIndicators: [],
      positiveIndicators: [],
      sessionMood: {
        start: "Erro na análise",
        current: "neutral",
        trajectory: "stable",
      },
    };
  }
}

/**
 * Detecta mudanças emocionais significativas entre análises
 */
export function detectEmotionalShifts(
  previousAnalysis: SentimentAnalysisResult,
  currentAnalysis: SentimentAnalysisResult
): SentimentAnalysisResult["emotionalShifts"] {
  const shifts: SentimentAnalysisResult["emotionalShifts"] = [];

  // Comparar sentimentos gerais
  if (previousAnalysis.overallSentiment !== currentAnalysis.overallSentiment) {
    const sentimentMap: Record<string, number> = {
      very_positive: 5,
      positive: 4,
      neutral: 3,
      negative: 2,
      very_negative: 1,
    };

    const previousScore = sentimentMap[previousAnalysis.overallSentiment] || 3;
    const currentScore = sentimentMap[currentAnalysis.overallSentiment] || 3;
    const difference = Math.abs(currentScore - previousScore);

    shifts.push({
      from: previousAnalysis.overallSentiment,
      to: currentAnalysis.overallSentiment,
      timestamp: new Date(),
      significance: difference >= 2 ? "high" : difference === 1 ? "medium" : "low",
    });
  }

  // Comparar estados emocionais específicos
  const previousEmotions = new Set(previousAnalysis.emotionalStates.map((e) => e.emotion));
  const currentEmotions = new Set(currentAnalysis.emotionalStates.map((e) => e.emotion));

  // Emoções que desapareceram
  previousEmotions.forEach((emotion) => {
    if (!currentEmotions.has(emotion)) {
      shifts.push({
        from: emotion,
        to: "resolvido",
        timestamp: new Date(),
        significance: "medium",
      });
    }
  });

  // Novas emoções que surgiram
  currentEmotions.forEach((emotion) => {
    if (!previousEmotions.has(emotion)) {
      shifts.push({
        from: "novo",
        to: emotion,
        timestamp: new Date(),
        significance: "medium",
      });
    }
  });

  return shifts;
}

/**
 * Gera recomendações baseado na análise de sentimentos
 */
export async function generateSentimentBasedRecommendations(
  analysis: SentimentAnalysisResult,
  treatmentApproach: string
): Promise<string[]> {
  try {
    const riskLevel =
      analysis.riskIndicators.length > 0
        ? analysis.riskIndicators.some((r) => r.severity === "high")
          ? "high"
          : "medium"
        : "low";

    const prompt = `Baseado nesta análise de sentimentos:
- Sentimento geral: ${analysis.overallSentiment}
- Estados emocionais: ${analysis.emotionalStates.map((e) => `${e.emotion} (${Math.round(e.intensity * 100)}%)`).join(", ")}
- Indicadores de risco: ${analysis.riskIndicators.map((r) => r.indicator).join(", ") || "Nenhum"}
- Nível de risco: ${riskLevel}
- Abordagem terapêutica: ${treatmentApproach}

Gere 5 recomendações práticas para a próxima intervenção terapêutica.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um psicólogo clínico especializado em ${treatmentApproach}. 
Forneça recomendações práticas e imediatas baseadas na análise emocional.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0].message.content;
    const text = typeof content === "string" ? content : JSON.stringify(content);

    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 5);
  } catch (error) {
    console.error("Erro ao gerar recomendações:", error);
    return [];
  }
}

/**
 * Cria visualização de trajetória emocional
 */
export function createEmotionalTrajectory(
  analyses: SentimentAnalysisResult[]
): {
  timeline: Array<{
    timestamp: Date;
    sentiment: string;
    score: number;
    dominantEmotion: string;
  }>;
  trend: "improving" | "stable" | "declining";
  averageSentiment: number;
} {
  if (analyses.length === 0) {
    return {
      timeline: [],
      trend: "stable",
      averageSentiment: 0,
    };
  }

  const sentimentMap: Record<string, number> = {
    very_positive: 1,
    positive: 0.5,
    neutral: 0,
    negative: -0.5,
    very_negative: -1,
  };

  const timeline = analyses.map((analysis, index) => ({
    timestamp: new Date(Date.now() - (analyses.length - index) * 60000), // Espaçado por 1 minuto
    sentiment: analysis.overallSentiment,
    score: analysis.sentimentScore,
    dominantEmotion: analysis.emotionalStates[0]?.emotion || "neutro",
  }));

  const scores = timeline.map((t) => t.score);
  const averageSentiment = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Determinar tendência
  let trend: "improving" | "stable" | "declining" = "stable";
  if (scores.length >= 2) {
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(scores.length / 2);
    const secondHalf = scores.slice(Math.floor(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(scores.length / 2);

    if (secondHalf > firstHalf + 0.2) trend = "improving";
    else if (secondHalf < firstHalf - 0.2) trend = "declining";
  }

  return {
    timeline,
    trend,
    averageSentiment,
  };
}
