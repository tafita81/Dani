/**
 * Análise de Emoções em Tempo Real
 * Detecta e analisa emoções do paciente durante consulta com o Assistente IA
 */

import { invokeLLM } from "../_core/llm";

export interface EmotionAnalysis {
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number; // 0-10
  confidence: number; // 0-1
  triggers: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface PatientEmotionalState {
  sessionId: string;
  patientId: string;
  currentMood: number; // 1-10
  emotionalTrend: "improving" | "stable" | "declining";
  dominantEmotions: string[];
  emotionalShifts: Array<{
    from: string;
    to: string;
    timestamp: Date;
  }>;
}

/**
 * Palavras-chave para detecção de emoções
 */
const emotionKeywords = {
  alegria: [
    "feliz",
    "alegre",
    "contente",
    "animado",
    "ótimo",
    "maravilhoso",
    "adorei",
    "rindo",
  ],
  tristeza: [
    "triste",
    "infeliz",
    "deprimido",
    "desanimado",
    "chorando",
    "mal",
    "horrível",
    "péssimo",
  ],
  ansiedade: [
    "ansioso",
    "nervoso",
    "preocupado",
    "tenso",
    "assustado",
    "pânico",
    "medo",
    "terror",
  ],
  raiva: [
    "furioso",
    "raiva",
    "irritado",
    "bravo",
    "revoltado",
    "indignado",
    "enraivecido",
  ],
  calma: [
    "calmo",
    "tranquilo",
    "relaxado",
    "sereno",
    "pacífico",
    "zen",
    "equilibrado",
  ],
  confusão: [
    "confuso",
    "desorientado",
    "perdido",
    "indeciso",
    "incerto",
    "duvidoso",
    "perplexo",
  ],
  esperança: [
    "esperançoso",
    "otimista",
    "confiante",
    "motivado",
    "inspirado",
    "determinado",
  ],
  desespero: [
    "desesperado",
    "sem esperança",
    "resignado",
    "impotente",
    "derrotado",
    "fracasso",
  ],
};

/**
 * Detecta emoções na transcrição
 */
export function detectEmotions(transcript: string): {
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number;
} {
  const lowerTranscript = transcript.toLowerCase();
  const emotionScores: Record<string, number> = {};

  // Calcular scores para cada emoção
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerTranscript.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    emotionScores[emotion] = score;
  }

  // Encontrar emoção primária e secundárias
  const sorted = Object.entries(emotionScores)
    .sort((a, b) => b[1] - a[1])
    .filter((e) => e[1] > 0);

  const primaryEmotion = sorted[0]?.[0] || "neutra";
  const secondaryEmotions = sorted.slice(1, 3).map((e) => e[0]);

  // Calcular intensidade (0-10)
  const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
  const intensity = Math.min(10, Math.ceil((totalScore / 5) * 2));

  return {
    primaryEmotion,
    secondaryEmotions,
    intensity,
  };
}

/**
 * Analisa emoções com IA para insights mais profundos
 */
export async function analyzeEmotionsWithAI(
  transcript: string,
  patientContext?: {
    name: string;
    history: string;
    previousMood: number;
  }
): Promise<EmotionAnalysis> {
  try {
    const systemPrompt = `Você é um especialista em análise emocional para consultas psicológicas.
Analise a transcrição e identifique:
1. Emoção primária dominante
2. Emoções secundárias
3. Intensidade (0-10)
4. Gatilhos emocionais
5. Recomendações de técnicas

Responda em JSON com a seguinte estrutura:
{
  "primaryEmotion": "emoção principal",
  "secondaryEmotions": ["emoção1", "emoção2"],
  "intensity": 7,
  "confidence": 0.85,
  "triggers": ["gatilho1", "gatilho2"],
  "recommendations": ["recomendação1", "recomendação2"]
}`;

    const userPrompt = `Analise as emoções nesta transcrição:
${patientContext ? `Contexto: ${patientContext.name} - Histórico: ${patientContext.history}` : ""}

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
          name: "emotion_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              primaryEmotion: { type: "string" },
              secondaryEmotions: { type: "array", items: { type: "string" } },
              intensity: { type: "number" },
              confidence: { type: "number" },
              triggers: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
            },
            required: [
              "primaryEmotion",
              "secondaryEmotions",
              "intensity",
              "confidence",
              "triggers",
              "recommendations",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      primaryEmotion: parsed.primaryEmotion,
      secondaryEmotions: parsed.secondaryEmotions,
      intensity: parsed.intensity,
      confidence: parsed.confidence,
      triggers: parsed.triggers,
      recommendations: parsed.recommendations,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Erro ao analisar emoções com IA:", error);
    throw error;
  }
}

/**
 * Gera sugestões personalizadas baseadas no estado emocional
 */
export async function generateEmotionBasedSuggestions(
  emotion: string,
  intensity: number,
  patientApproach: "TCC" | "Esquema" | "Gestalt" | "Integrativa"
): Promise<string[]> {
  const suggestions: Record<string, Record<string, string[]>> = {
    TCC: {
      alegria: [
        "Explorar os pensamentos positivos por trás dessa alegria",
        "Registrar evidências que sustentam esse estado positivo",
        "Planejar atividades que mantenham esse humor",
      ],
      tristeza: [
        "Identificar pensamentos automáticos negativos",
        "Questionar evidências desses pensamentos",
        "Planejar atividades comportamentais para elevar o humor",
      ],
      ansiedade: [
        "Identificar pensamentos catastróficos",
        "Testar a realidade desses pensamentos",
        "Praticar técnicas de respiração",
      ],
      raiva: [
        "Explorar pensamentos por trás da raiva",
        "Identificar necessidades não atendidas",
        "Desenvolver estratégias de comunicação assertiva",
      ],
    },
    Esquema: {
      alegria: [
        "Identificar esquemas positivos ativados",
        "Fortalecer modos saudáveis",
        "Consolidar mudanças de esquema",
      ],
      tristeza: [
        "Explorar esquemas de abandono ou privação",
        "Trabalhar modos vulneráveis",
        "Desenvolver autocuidado",
      ],
      ansiedade: [
        "Explorar esquemas de vulnerabilidade",
        "Trabalhar modos vigilantes",
        "Desenvolver segurança interna",
      ],
    },
    Gestalt: {
      alegria: [
        "Amplificar a consciência do presente",
        "Explorar o contato genuíno",
        "Integrar a experiência",
      ],
      tristeza: [
        "Explorar o que está sendo evitado",
        "Trabalhar o contato com a emoção",
        "Integrar a perda",
      ],
      ansiedade: [
        "Trazer para o aqui e agora",
        "Explorar o que está sendo antecipado",
        "Desenvolver contato com o presente",
      ],
    },
  };

  return (
    suggestions[patientApproach]?.[emotion] || [
      "Explorar a emoção com curiosidade",
      "Desenvolver autocompaixão",
      "Praticar mindfulness",
    ]
  );
}

/**
 * Rastreia evolução emocional ao longo da sessão
 */
export function trackEmotionalEvolution(
  emotionHistory: Array<{ emotion: string; timestamp: Date }>
): PatientEmotionalState {
  if (emotionHistory.length === 0) {
    return {
      sessionId: "",
      patientId: "",
      currentMood: 5,
      emotionalTrend: "stable",
      dominantEmotions: [],
      emotionalShifts: [],
    };
  }

  // Contar frequência de emoções
  const emotionCounts: Record<string, number> = {};
  emotionHistory.forEach((e) => {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
  });

  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((e) => e[0]);

  // Detectar mudanças emocionais
  const emotionalShifts: Array<{ from: string; to: string; timestamp: Date }> =
    [];
  for (let i = 1; i < emotionHistory.length; i++) {
    if (emotionHistory[i].emotion !== emotionHistory[i - 1].emotion) {
      emotionalShifts.push({
        from: emotionHistory[i - 1].emotion,
        to: emotionHistory[i].emotion,
        timestamp: emotionHistory[i].timestamp,
      });
    }
  }

  // Determinar tendência
  const firstHalf = emotionHistory.slice(0, Math.floor(emotionHistory.length / 2));
  const secondHalf = emotionHistory.slice(Math.floor(emotionHistory.length / 2));

  const firstAvgIntensity = firstHalf.length / 2;
  const secondAvgIntensity = secondHalf.length / 2;

  let emotionalTrend: "improving" | "stable" | "declining" = "stable";
  if (secondAvgIntensity > firstAvgIntensity + 1) {
    emotionalTrend = "improving";
  } else if (secondAvgIntensity < firstAvgIntensity - 1) {
    emotionalTrend = "declining";
  }

  return {
    sessionId: "",
    patientId: "",
    currentMood: 5,
    emotionalTrend,
    dominantEmotions,
    emotionalShifts,
  };
}
