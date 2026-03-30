/**
 * Módulo de Captura de Voz em Tempo Real
 * Integra Web Speech API para transcrição contínua durante consulta
 * Respostas do Assistente Carro aparecem apenas no painel da terapeuta
 */

export interface VoiceSession {
  id: string;
  appointmentId: string;
  therapistId: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  transcription: TranscriptionSegment[];
  audioUrl?: string;
  duration: number; // em segundos
}

export interface TranscriptionSegment {
  id: string;
  timestamp: Date;
  speaker: "patient" | "therapist" | "system";
  text: string;
  confidence: number; // 0-1
  duration: number; // em segundos
  emotions?: string[]; // detectadas pela IA
}

export interface VoiceSettings {
  language: "pt-BR" | "en-US" | "es-ES";
  continuousListening: boolean;
  autoStopAfterSilence: number; // em segundos
  confidenceThreshold: number; // 0-1, mínimo para aceitar
  enableEmotionDetection: boolean;
  enableNLU: boolean; // Natural Language Understanding
}

export interface AssistantResponse {
  id: string;
  voiceSessionId: string;
  timestamp: Date;
  transcriptionSegmentId: string;
  response: string;
  confidence: number;
  suggestedActions?: string[];
  visibleToPatient: boolean; // sempre false para voz
}

// Configurações padrão
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  language: "pt-BR",
  continuousListening: true,
  autoStopAfterSilence: 3, // 3 segundos
  confidenceThreshold: 0.7,
  enableEmotionDetection: true,
  enableNLU: true,
};

/**
 * Inicia sessão de captura de voz
 */
export function startVoiceSession(
  appointmentId: string,
  therapistId: string,
  patientId: string,
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS
): VoiceSession {
  const session: VoiceSession = {
    id: `voice_${Date.now()}_${Math.random()}`,
    appointmentId,
    therapistId,
    patientId,
    startTime: new Date(),
    isActive: true,
    transcription: [],
    duration: 0,
  };

  console.log(
    `[Voice Capture] Sessão iniciada: ${session.id} (${settings.language})`
  );
  console.log(
    `[Voice Capture] Escuta contínua: ${settings.continuousListening ? "Ativada" : "Desativada"}`
  );
  console.log(
    `[Voice Capture] Detecção de emoções: ${settings.enableEmotionDetection ? "Ativada" : "Desativada"}`
  );

  return session;
}

/**
 * Adiciona segmento de transcrição
 */
export function addTranscriptionSegment(
  session: VoiceSession,
  speaker: "patient" | "therapist" | "system",
  text: string,
  confidence: number,
  duration: number,
  emotions?: string[]
): TranscriptionSegment {
  const segment: TranscriptionSegment = {
    id: `seg_${Date.now()}_${Math.random()}`,
    timestamp: new Date(),
    speaker,
    text,
    confidence,
    duration,
    emotions,
  };

  session.transcription.push(segment);
  session.duration += duration;

  console.log(
    `[Voice Capture] ${speaker.toUpperCase()}: "${text}" (confiança: ${(confidence * 100).toFixed(1)}%)`
  );

  if (emotions && emotions.length > 0) {
    console.log(`[Voice Capture] Emoções detectadas: ${emotions.join(", ")}`);
  }

  return segment;
}

/**
 * Pausa captura de voz
 */
export function pauseVoiceCapture(session: VoiceSession): void {
  session.isActive = false;
  console.log(`[Voice Capture] Captura pausada para sessão ${session.id}`);
}

/**
 * Retoma captura de voz
 */
export function resumeVoiceCapture(session: VoiceSession): void {
  session.isActive = true;
  console.log(`[Voice Capture] Captura retomada para sessão ${session.id}`);
}

/**
 * Finaliza sessão de voz
 */
export function endVoiceSession(session: VoiceSession): VoiceSession {
  session.isActive = false;
  session.endTime = new Date();

  const durationMinutes = Math.floor(session.duration / 60);
  const durationSeconds = session.duration % 60;

  console.log(
    `[Voice Capture] Sessão finalizada: ${durationMinutes}m${durationSeconds}s`
  );
  console.log(
    `[Voice Capture] Total de segmentos: ${session.transcription.length}`
  );

  return session;
}

/**
 * Gera resposta do Assistente Carro (visível apenas para terapeuta)
 */
export function generateAssistantResponse(
  voiceSessionId: string,
  segmentId: string,
  patientText: string,
  context: {
    patientHistory?: string;
    sessionNotes?: string;
    therapeuticApproach?: string;
  }
): AssistantResponse {
  // Simular resposta da IA
  const responses: Record<string, string> = {
    ansiedade:
      "Paciente demonstra sintomas de ansiedade. Considere técnicas de respiração.",
    depressão:
      "Há indicadores de humor deprimido. Explore pensamentos automáticos negativos.",
    resistência:
      "Paciente mostra resistência. Valide sentimentos antes de prosseguir.",
    progresso:
      "Bom progresso observado. Reforce ganhos e estabeleça novos objetivos.",
    default:
      "Continue explorando este tema. Há oportunidade para aprofundamento.",
  };

  // Determinar tipo de resposta baseado em palavras-chave
  let responseType = "default";
  if (
    patientText.toLowerCase().includes("ansiedade") ||
    patientText.toLowerCase().includes("nervoso")
  ) {
    responseType = "ansiedade";
  } else if (
    patientText.toLowerCase().includes("triste") ||
    patientText.toLowerCase().includes("deprimido")
  ) {
    responseType = "depressão";
  } else if (
    patientText.toLowerCase().includes("não") ||
    patientText.toLowerCase().includes("não quero")
  ) {
    responseType = "resistência";
  } else if (
    patientText.toLowerCase().includes("melhor") ||
    patientText.toLowerCase().includes("consegui")
  ) {
    responseType = "progresso";
  }

  const response: AssistantResponse = {
    id: `resp_${Date.now()}_${Math.random()}`,
    voiceSessionId,
    timestamp: new Date(),
    transcriptionSegmentId: segmentId,
    response: responses[responseType],
    confidence: 0.85,
    suggestedActions: [
      "Aprofundar neste tema",
      "Usar técnica de reestruturação cognitiva",
      "Validar sentimentos do paciente",
    ],
    visibleToPatient: false, // SEMPRE false para voz
  };

  console.log(
    `[Assistant Response] ${response.response} (confiança: ${(response.confidence * 100).toFixed(1)}%)`
  );

  return response;
}

/**
 * Extrai palavras-chave da transcrição
 */
export function extractKeywords(transcription: TranscriptionSegment[]): string[] {
  const keywords: Set<string> = new Set();

  const keywordPatterns: Record<string, RegExp> = {
    ansiedade: /ansiedade|nervoso|preocupado|medo|pânico/gi,
    depressão: /deprimido|triste|sem esperança|vazio|cansado/gi,
    relacionamento: /relacionamento|parceiro|família|amigo|conflito/gi,
    trabalho: /trabalho|emprego|chefe|colegas|desemprego/gi,
    sono: /sono|dormir|insônia|cansaço|fadiga/gi,
    alimentação: /comida|fome|apetite|peso|dieta/gi,
    exercício: /exercício|atividade|movimento|sedentário/gi,
    autoestima: /autoestima|confiança|fracasso|inadequado|incapaz/gi,
  };

  transcription.forEach((segment) => {
    Object.entries(keywordPatterns).forEach(([category, pattern]) => {
      if (pattern.test(segment.text)) {
        keywords.add(category);
      }
    });
  });

  return Array.from(keywords);
}

/**
 * Analisa tendências emocionais ao longo da sessão
 */
export function analyzeEmotionalTrend(
  transcription: TranscriptionSegment[]
): {
  initialMood: string;
  finalMood: string;
  trend: "improving" | "worsening" | "stable";
  emotionFrequency: Record<string, number>;
} {
  const emotionFrequency: Record<string, number> = {};

  transcription.forEach((segment) => {
    if (segment.emotions) {
      segment.emotions.forEach((emotion) => {
        emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
      });
    }
  });

  const initialEmotions = transcription[0]?.emotions || [];
  const finalEmotions = transcription[transcription.length - 1]?.emotions || [];

  let trend: "improving" | "worsening" | "stable" = "stable";

  // Simples heurística: se emoções negativas diminuem, é melhora
  const negativeEmotions = ["ansiedade", "tristeza", "medo", "frustração"];
  const initialNegativeCount = initialEmotions.filter((e) =>
    negativeEmotions.includes(e)
  ).length;
  const finalNegativeCount = finalEmotions.filter((e) =>
    negativeEmotions.includes(e)
  ).length;

  if (finalNegativeCount < initialNegativeCount) {
    trend = "improving";
  } else if (finalNegativeCount > initialNegativeCount) {
    trend = "worsening";
  }

  return {
    initialMood: initialEmotions[0] || "neutro",
    finalMood: finalEmotions[0] || "neutro",
    trend,
    emotionFrequency,
  };
}

/**
 * Gera resumo da sessão
 */
export function generateSessionSummary(session: VoiceSession): {
  duration: string;
  totalSegments: number;
  keywords: string[];
  emotionalTrend: any;
  confidenceAverage: number;
  transcriptionPreview: string;
} {
  const durationMinutes = Math.floor(session.duration / 60);
  const durationSeconds = session.duration % 60;

  const keywords = extractKeywords(session.transcription);
  const emotionalTrend = analyzeEmotionalTrend(session.transcription);

  const confidenceAverage =
    session.transcription.reduce((sum, seg) => sum + seg.confidence, 0) /
    session.transcription.length;

  const patientSegments = session.transcription
    .filter((seg) => seg.speaker === "patient")
    .slice(0, 3)
    .map((seg) => seg.text)
    .join(" ");

  return {
    duration: `${durationMinutes}m${durationSeconds}s`,
    totalSegments: session.transcription.length,
    keywords,
    emotionalTrend,
    confidenceAverage,
    transcriptionPreview: patientSegments || "Sem transcrição disponível",
  };
}
