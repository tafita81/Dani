/**
 * Analisador de Áudio + Transcrição em Tempo Real
 * Captura padrões de voz e linguagem para inferência silenciosa
 */

export interface AudioAnalysis {
  // Análise de voz
  tone: "alegre" | "neutro" | "triste" | "ansioso" | "calmo" | "irritado";
  emotionalIntensity: number; // 0-100
  confidence: number; // 0-100 (segurança na fala)
  
  // Ritmo e padrões
  speakingRate: number; // palavras por minuto
  pauseFrequency: number; // pausas por minuto
  pauseDuration: number; // ms média de pausa
  
  // Características vocais
  voicePitch: "alto" | "médio" | "baixo";
  voiceVariation: number; // 0-100 (monotonia vs. expressividade)
  breathingPatterns: "normal" | "acelerado" | "lento";
  
  // Indicadores de estado
  stressLevel: number; // 0-100
  engagementLevel: number; // 0-100
  clarityOfSpeech: number; // 0-100
  
  // Comparação com histórico
  changeFromBaseline: number; // -100 a +100
  trendDirection: "melhorando" | "piorando" | "estável";
}

export interface TranscriptionAnalysis {
  // Análise de vocabulário
  vocabularyLevel: "simples" | "moderado" | "sofisticado";
  vocabularyVariety: number; // 0-100
  averageWordLength: number;
  
  // Análise de estrutura
  sentenceComplexity: "simples" | "moderada" | "complexa";
  sentenceLength: number; // palavras média
  grammarQuality: number; // 0-100
  
  // Análise de conteúdo emocional
  emotionalWords: Array<{
    word: string;
    emotion: string;
    intensity: number; // 0-100
  }>;
  
  // Padrões de linguagem
  topicsEngaged: string[];
  topicsAvoided: string[];
  repeatedPhrases: string[];
  uniqueExpressions: string[];
  
  // Indicadores de compreensão
  clarificationRequests: number;
  confusionIndicators: number;
  understandingSignals: number;
  
  // Mudanças ao longo do tempo
  vocabularyProgression: "expandindo" | "mantendo" | "reduzindo";
  topicShifts: number; // quantas vezes mudou de tópico
  
  // Padrões de resposta
  responseLength: number; // palavras
  responseLatency: number; // ms até começar a falar
  responseCompleteness: number; // 0-100
}

export interface CombinedAnalysis {
  // Síntese de áudio + texto
  overallEngagement: number; // 0-100
  authenticity: number; // 0-100 (coerência entre voz e palavras)
  emotionalAlignment: number; // 0-100 (tom e conteúdo alinhados?)
  
  // Inferências combinadas
  inferredMood: "positivo" | "neutro" | "negativo" | "misto";
  inferredComfort: number; // 0-100
  inferredTrust: number; // 0-100
  inferredUnderstanding: number; // 0-100
  
  // Recomendações de adaptação
  suggestedAdaptations: string[];
  urgencyOfAdaptation: "baixa" | "média" | "alta";
  
  // Comparação com histórico
  sessionQuality: number; // 0-100
  progressIndicators: string[];
  concernIndicators: string[];
}

/**
 * Analisa características de áudio em tempo real
 */
export function analyzeAudioInRealTime(
  audioBuffer: Float32Array,
  sampleRate: number,
  previousAnalysis?: AudioAnalysis
): AudioAnalysis {
  // Análise de tom emocional (usando padrões de frequência)
  const tone = analyzeEmotionalTone(audioBuffer, sampleRate);
  const emotionalIntensity = calculateEmotionalIntensity(audioBuffer);
  const confidence = calculateSpeakingConfidence(audioBuffer, sampleRate);

  // Análise de ritmo
  const speakingRate = calculateSpeakingRate(audioBuffer, sampleRate);
  const { pauseFrequency, pauseDuration } = analyzePauses(audioBuffer, sampleRate);

  // Características vocais
  const voicePitch = analyzeVoicePitch(audioBuffer, sampleRate);
  const voiceVariation = calculateVoiceVariation(audioBuffer, sampleRate);
  const breathingPatterns = analyzeBreathingPatterns(audioBuffer, sampleRate);

  // Indicadores de estado
  const stressLevel = calculateStressLevel(audioBuffer, sampleRate);
  const engagementLevel = calculateEngagementFromAudio(audioBuffer, sampleRate);
  const clarityOfSpeech = calculateSpeechClarity(audioBuffer, sampleRate);

  // Comparação com histórico
  let changeFromBaseline = 0;
  let trendDirection: "melhorando" | "piorando" | "estável" = "estável";

  if (previousAnalysis) {
    changeFromBaseline = emotionalIntensity - previousAnalysis.emotionalIntensity;
    if (changeFromBaseline > 10) trendDirection = "melhorando";
    else if (changeFromBaseline < -10) trendDirection = "piorando";
  }

  return {
    tone,
    emotionalIntensity,
    confidence,
    speakingRate,
    pauseFrequency,
    pauseDuration,
    voicePitch,
    voiceVariation,
    breathingPatterns,
    stressLevel,
    engagementLevel,
    clarityOfSpeech,
    changeFromBaseline,
    trendDirection,
  };
}

/**
 * Analisa transcrição de texto em tempo real
 */
export function analyzeTranscriptionInRealTime(
  transcription: string,
  previousTranscriptions: string[] = []
): TranscriptionAnalysis {
  // Análise de vocabulário
  const words = transcription.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const vocabularyLevel = inferVocabularyLevel(words);
  const vocabularyVariety = (uniqueWords.size / words.length) * 100;
  const averageWordLength = calculateAverageWordLength(words);

  // Análise de estrutura
  const sentences = transcription.split(/[.!?]+/).filter(s => s.trim());
  const sentenceComplexity = inferSentenceComplexity(sentences);
  const sentenceLength = calculateAverageSentenceLength(sentences);
  const grammarQuality = analyzeGrammarQuality(transcription);

  // Análise de conteúdo emocional
  const emotionalWords = extractEmotionalWords(transcription);

  // Padrões de linguagem
  const topicsEngaged = extractTopics(transcription);
  const topicsAvoided = identifyAvoidedTopics(transcription, previousTranscriptions);
  const repeatedPhrases = findRepeatedPhrases(transcription);
  const uniqueExpressions = findUniqueExpressions(transcription, previousTranscriptions);

  // Indicadores de compreensão
  const clarificationRequests = countClarificationRequests(transcription);
  const confusionIndicators = countConfusionIndicators(transcription);
  const understandingSignals = countUnderstandingSignals(transcription);

  // Mudanças ao longo do tempo
  const vocabularyProgression = analyzeVocabularyProgression(
    transcription,
    previousTranscriptions
  );
  const topicShifts = countTopicShifts(sentences);

  // Padrões de resposta
  const responseLength = words.length;
  const responseLatency = estimateResponseLatency(transcription);
  const responseCompleteness = calculateResponseCompleteness(transcription);

  return {
    vocabularyLevel,
    vocabularyVariety,
    averageWordLength,
    sentenceComplexity,
    sentenceLength,
    grammarQuality,
    emotionalWords,
    topicsEngaged,
    topicsAvoided,
    repeatedPhrases,
    uniqueExpressions,
    clarificationRequests,
    confusionIndicators,
    understandingSignals,
    vocabularyProgression,
    topicShifts,
    responseLength,
    responseLatency,
    responseCompleteness,
  };
}

/**
 * Combina análise de áudio + transcrição para inferência completa
 */
export function combineAnalyses(
  audioAnalysis: AudioAnalysis,
  transcriptionAnalysis: TranscriptionAnalysis,
  historicalData?: {
    audioHistory: AudioAnalysis[];
    transcriptionHistory: TranscriptionAnalysis[];
  }
): CombinedAnalysis {
  // Calcula engajamento geral
  const overallEngagement = (audioAnalysis.engagementLevel +
    (transcriptionAnalysis.responseLength > 0 ? 50 : 0)) / 2;

  // Verifica autenticidade (coerência entre voz e palavras)
  const authenticity = calculateAuthenticity(audioAnalysis, transcriptionAnalysis);

  // Verifica alinhamento emocional
  const emotionalAlignment = calculateEmotionalAlignment(
    audioAnalysis,
    transcriptionAnalysis
  );

  // Infere humor geral
  const inferredMood = inferMood(audioAnalysis, transcriptionAnalysis);

  // Inferências de estado
  const inferredComfort = (audioAnalysis.confidence + (100 - audioAnalysis.stressLevel)) / 2;
  const inferredTrust = calculateTrustLevel(audioAnalysis, transcriptionAnalysis);
  const inferredUnderstanding = (transcriptionAnalysis.understandingSignals * 10 +
    audioAnalysis.clarityOfSpeech) / 2;

  // Recomendações de adaptação
  const { adaptations, urgency } = generateAdaptationRecommendations(
    audioAnalysis,
    transcriptionAnalysis
  );

  // Comparação com histórico
  let sessionQuality = 75;
  const progressIndicators: string[] = [];
  const concernIndicators: string[] = [];

  if (historicalData && historicalData.audioHistory.length > 0) {
    const previousEngagement =
      historicalData.audioHistory[historicalData.audioHistory.length - 1].engagementLevel;
    if (audioAnalysis.engagementLevel > previousEngagement + 10) {
      progressIndicators.push("Engajamento aumentou");
      sessionQuality += 10;
    } else if (audioAnalysis.engagementLevel < previousEngagement - 10) {
      concernIndicators.push("Engajamento diminuiu");
      sessionQuality -= 10;
    }
  }

  if (audioAnalysis.stressLevel > 70) {
    concernIndicators.push("Nível de stress elevado");
    sessionQuality -= 15;
  }

  if (authenticity < 50) {
    concernIndicators.push("Possível desconexão entre palavras e sentimentos");
  }

  return {
    overallEngagement,
    authenticity,
    emotionalAlignment,
    inferredMood,
    inferredComfort,
    inferredTrust,
    inferredUnderstanding,
    suggestedAdaptations: adaptations,
    urgencyOfAdaptation: urgency,
    sessionQuality: Math.max(0, Math.min(100, sessionQuality)),
    progressIndicators,
    concernIndicators,
  };
}

// ─── Funções Auxiliares de Análise de Áudio ───

function analyzeEmotionalTone(
  audioBuffer: Float32Array,
  sampleRate: number
): AudioAnalysis["tone"] {
  // Análise simplificada baseada em frequência
  const frequencies = performFFT(audioBuffer);
  const highFreqEnergy = frequencies.slice(frequencies.length / 2).reduce((a, b) => a + b, 0);
  const lowFreqEnergy = frequencies.slice(0, frequencies.length / 2).reduce((a, b) => a + b, 0);

  const ratio = highFreqEnergy / (lowFreqEnergy + 1);

  if (ratio > 2) return "alegre";
  if (ratio < 0.5) return "triste";
  if (ratio > 1.5) return "ansioso";
  return "neutro";
}

function calculateEmotionalIntensity(audioBuffer: Float32Array): number {
  const rms = Math.sqrt(audioBuffer.reduce((sum, val) => sum + val * val, 0) / audioBuffer.length);
  return Math.min(100, rms * 1000);
}

function calculateSpeakingConfidence(audioBuffer: Float32Array, sampleRate: number): number {
  // Confiança é indicada por volume consistente
  const rms = Math.sqrt(audioBuffer.reduce((sum, val) => sum + val * val, 0) / audioBuffer.length);
  const variance = calculateVariance(audioBuffer);
  return Math.max(0, 100 - variance * 100);
}

function calculateSpeakingRate(audioBuffer: Float32Array, sampleRate: number): number {
  // Estimativa de palavras por minuto
  const duration = audioBuffer.length / sampleRate;
  const estimatedWords = duration * 150; // Média de 150 palavras por minuto
  return Math.round(estimatedWords / (duration / 60));
}

function analyzePauses(
  audioBuffer: Float32Array,
  sampleRate: number
): { pauseFrequency: number; pauseDuration: number } {
  const threshold = 0.01;
  let pauseCount = 0;
  let pauseTotalDuration = 0;
  let inPause = false;
  let pauseStart = 0;

  for (let i = 0; i < audioBuffer.length; i++) {
    if (Math.abs(audioBuffer[i]) < threshold) {
      if (!inPause) {
        pauseStart = i;
        inPause = true;
        pauseCount++;
      }
    } else {
      if (inPause) {
        pauseTotalDuration += i - pauseStart;
        inPause = false;
      }
    }
  }

  const duration = audioBuffer.length / sampleRate;
  return {
    pauseFrequency: pauseCount / (duration / 60),
    pauseDuration: pauseCount > 0 ? pauseTotalDuration / pauseCount / sampleRate * 1000 : 0,
  };
}

function analyzeVoicePitch(audioBuffer: Float32Array, sampleRate: number): AudioAnalysis["voicePitch"] {
  const frequencies = performFFT(audioBuffer);
  const peakFreq = frequencies.indexOf(Math.max(...frequencies)) * (sampleRate / frequencies.length);

  if (peakFreq > 200) return "alto";
  if (peakFreq < 100) return "baixo";
  return "médio";
}

function calculateVoiceVariation(audioBuffer: Float32Array, sampleRate: number): number {
  const frequencies = performFFT(audioBuffer);
  const variance = calculateVariance(frequencies);
  return Math.min(100, variance * 10);
}

function analyzeBreathingPatterns(
  audioBuffer: Float32Array,
  sampleRate: number
): AudioAnalysis["breathingPatterns"] {
  const { pauseFrequency } = analyzePauses(audioBuffer, sampleRate);

  if (pauseFrequency > 5) return "acelerado";
  if (pauseFrequency < 2) return "lento";
  return "normal";
}

function calculateStressLevel(audioBuffer: Float32Array, sampleRate: number): number {
  const voiceVariation = calculateVoiceVariation(audioBuffer, sampleRate);
  const { pauseFrequency } = analyzePauses(audioBuffer, sampleRate);

  return Math.min(100, (voiceVariation + pauseFrequency * 10) / 2);
}

function calculateEngagementFromAudio(audioBuffer: Float32Array, sampleRate: number): number {
  const rms = Math.sqrt(audioBuffer.reduce((sum, val) => sum + val * val, 0) / audioBuffer.length);
  const voiceVariation = calculateVoiceVariation(audioBuffer, sampleRate);

  return Math.min(100, (rms * 100 + voiceVariation) / 2);
}

function calculateSpeechClarity(audioBuffer: Float32Array, sampleRate: number): number {
  const rms = Math.sqrt(audioBuffer.reduce((sum, val) => sum + val * val, 0) / audioBuffer.length);
  return Math.min(100, rms * 200);
}

// ─── Funções Auxiliares de Análise de Texto ───

function inferVocabularyLevel(words: string[]): TranscriptionAnalysis["vocabularyLevel"] {
  const complexWords = words.filter(w => w.length > 10).length;
  const ratio = complexWords / words.length;

  if (ratio > 0.3) return "sofisticado";
  if (ratio > 0.15) return "moderado";
  return "simples";
}

function calculateAverageWordLength(words: string[]): number {
  return words.reduce((sum, w) => sum + w.length, 0) / words.length;
}

function inferSentenceComplexity(sentences: string[]): TranscriptionAnalysis["sentenceComplexity"] {
  const avgLength = calculateAverageSentenceLength(sentences);

  if (avgLength > 20) return "complexa";
  if (avgLength > 12) return "moderada";
  return "simples";
}

function calculateAverageSentenceLength(sentences: string[]): number {
  const totalWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
  return totalWords / sentences.length;
}

function analyzeGrammarQuality(text: string): number {
  // Análise simplificada
  let score = 100;

  // Penalidades por erros comuns
  if (text.match(/\s{2,}/g)) score -= 5; // Espaços múltiplos
  if (text.match(/[a-z]\.[A-Z]/g)) score -= 10; // Falta de espaço após ponto

  return Math.max(0, score);
}

function extractEmotionalWords(text: string): TranscriptionAnalysis["emotionalWords"] {
  const emotionalKeywords: Record<string, string> = {
    feliz: "alegria",
    triste: "tristeza",
    ansioso: "ansiedade",
    medo: "medo",
    raiva: "raiva",
    amor: "amor",
    ódio: "ódio",
  };

  const words: TranscriptionAnalysis["emotionalWords"] = [];

  Object.entries(emotionalKeywords).forEach(([keyword, emotion]) => {
    if (text.toLowerCase().includes(keyword)) {
      words.push({
        word: keyword,
        emotion,
        intensity: 70,
      });
    }
  });

  return words;
}

function extractTopics(text: string): string[] {
  // Extração simplificada de tópicos
  const topics: string[] = [];

  if (text.match(/trabalho|emprego|carreira/i)) topics.push("trabalho");
  if (text.match(/relacionamento|namoro|casamento|parceiro/i)) topics.push("relacionamento");
  if (text.match(/família|mãe|pai|irmão|irmã/i)) topics.push("família");
  if (text.match(/saúde|doença|médico|hospital/i)) topics.push("saúde");
  if (text.match(/financeiro|dinheiro|gasto|renda/i)) topics.push("financeiro");

  return topics;
}

function identifyAvoidedTopics(text: string, previousTranscriptions: string[]): string[] {
  // Tópicos que não aparecem mas apareciam antes
  const currentTopics = new Set(extractTopics(text));
  const previousTopics = new Set(
    previousTranscriptions.flatMap(t => extractTopics(t))
  );

  return Array.from(previousTopics).filter(t => !currentTopics.has(t));
}

function findRepeatedPhrases(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const phrases: Record<string, number> = {};

  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    phrases[phrase] = (phrases[phrase] || 0) + 1;
  }

  return Object.entries(phrases)
    .filter(([_, count]) => count > 2)
    .map(([phrase]) => phrase);
}

function findUniqueExpressions(text: string, previousTranscriptions: string[]): string[] {
  const currentWords = new Set(text.toLowerCase().split(/\s+/));
  const previousWords = new Set(
    previousTranscriptions.flatMap(t => t.toLowerCase().split(/\s+/))
  );

  return Array.from(currentWords).filter(w => !previousWords.has(w));
}

function countClarificationRequests(text: string): number {
  return (text.match(/\?/g) || []).length;
}

function countConfusionIndicators(text: string): number {
  const confusionWords = ["não entendi", "confuso", "não sei", "não lembro"];
  return confusionWords.filter(w => text.toLowerCase().includes(w)).length;
}

function countUnderstandingSignals(text: string): number {
  const understandingWords = ["entendi", "claro", "faz sentido", "verdade"];
  return understandingWords.filter(w => text.toLowerCase().includes(w)).length;
}

function analyzeVocabularyProgression(
  text: string,
  previousTranscriptions: string[]
): TranscriptionAnalysis["vocabularyProgression"] {
  if (previousTranscriptions.length === 0) return "mantendo";

  const currentVocab = new Set(text.toLowerCase().split(/\s+/)).size;
  const previousVocab = new Set(
    previousTranscriptions[previousTranscriptions.length - 1]
      .toLowerCase()
      .split(/\s+/)
  ).size;

  if (currentVocab > previousVocab * 1.2) return "expandindo";
  if (currentVocab < previousVocab * 0.8) return "reduzindo";
  return "mantendo";
}

function countTopicShifts(sentences: string[]): number {
  let shifts = 0;
  let lastTopic = "";

  sentences.forEach(sentence => {
    const topics = extractTopics(sentence);
    if (topics.length > 0 && topics[0] !== lastTopic) {
      shifts++;
      lastTopic = topics[0];
    }
  });

  return shifts;
}

function estimateResponseLatency(text: string): number {
  // Estimativa baseada no comprimento
  return text.length > 50 ? 2000 : 1000;
}

function calculateResponseCompleteness(text: string): number {
  // Resposta completa tem múltiplas frases
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  return Math.min(100, sentences * 20);
}

// ─── Funções Auxiliares Gerais ───

function performFFT(audioBuffer: Float32Array): number[] {
  // FFT simplificada (em produção, usar biblioteca como fft.js)
  const frequencies = new Array(audioBuffer.length / 2).fill(0);

  for (let i = 0; i < audioBuffer.length; i++) {
    const binIndex = Math.floor((i / audioBuffer.length) * frequencies.length);
    frequencies[binIndex] += Math.abs(audioBuffer[i]);
  }

  return frequencies;
}

function calculateVariance(values: Float32Array | number[]): number {
  const arr = Array.isArray(values) ? values : Array.from(values);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squaredDiffs = arr.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateAuthenticity(
  audioAnalysis: AudioAnalysis,
  transcriptionAnalysis: TranscriptionAnalysis
): number {
  // Coerência entre tom de voz e conteúdo emocional
  const emotionalWordsCount = transcriptionAnalysis.emotionalWords.length;
  const voiceEmotionalIntensity = audioAnalysis.emotionalIntensity;

  if (emotionalWordsCount > 0 && voiceEmotionalIntensity > 50) return 85;
  if (emotionalWordsCount === 0 && voiceEmotionalIntensity < 30) return 90;
  if ((emotionalWordsCount > 0) !== (voiceEmotionalIntensity > 50)) return 40;

  return 70;
}

function calculateEmotionalAlignment(
  audioAnalysis: AudioAnalysis,
  transcriptionAnalysis: TranscriptionAnalysis
): number {
  // Alinhamento entre tom de voz e palavras usadas
  const toneToMood: Record<string, string> = {
    alegre: "positivo",
    triste: "negativo",
    ansioso: "misto",
    calmo: "neutro",
  };

  const expectedMood = toneToMood[audioAnalysis.tone] || "neutro";
  const emotionalWords = transcriptionAnalysis.emotionalWords;

  if (emotionalWords.length === 0) return 60;

  const matchingEmotions = emotionalWords.filter(
    e => (expectedMood === "positivo" && e.emotion === "alegria") ||
         (expectedMood === "negativo" && e.emotion === "tristeza")
  ).length;

  return Math.min(100, (matchingEmotions / emotionalWords.length) * 100);
}

function inferMood(
  audioAnalysis: AudioAnalysis,
  transcriptionAnalysis: TranscriptionAnalysis
): CombinedAnalysis["inferredMood"] {
  const emotionalWords = transcriptionAnalysis.emotionalWords;
  const positiveEmotions = emotionalWords.filter(
    e => ["alegria", "amor"].includes(e.emotion)
  ).length;
  const negativeEmotions = emotionalWords.filter(
    e => ["tristeza", "raiva", "medo"].includes(e.emotion)
  ).length;

  if (positiveEmotions > negativeEmotions) return "positivo";
  if (negativeEmotions > positiveEmotions) return "negativo";
  if (positiveEmotions + negativeEmotions > 0) return "misto";

  return audioAnalysis.tone === "alegre" ? "positivo" : "neutro";
}

function calculateTrustLevel(
  audioAnalysis: AudioAnalysis,
  transcriptionAnalysis: TranscriptionAnalysis
): number {
  // Confiança é indicada por clareza de fala e respostas completas
  return (audioAnalysis.clarityOfSpeech + transcriptionAnalysis.responseCompleteness) / 2;
}

function generateAdaptationRecommendations(
  audioAnalysis: AudioAnalysis,
  transcriptionAnalysis: TranscriptionAnalysis
): { adaptations: string[]; urgency: "baixa" | "média" | "alta" } {
  const adaptations: string[] = [];
  let urgency: "baixa" | "média" | "alta" = "baixa";

  if (audioAnalysis.stressLevel > 70) {
    adaptations.push("Reduzir ritmo, oferecer mais espaço para respirar");
    urgency = "alta";
  }

  if (audioAnalysis.engagementLevel < 40) {
    adaptations.push("Mudar abordagem, tentar técnica mais envolvente");
    urgency = "média";
  }

  if (transcriptionAnalysis.clarificationRequests > 3) {
    adaptations.push("Simplificar explicações, usar linguagem mais acessível");
    urgency = "média";
  }

  if (transcriptionAnalysis.topicShifts > 5) {
    adaptations.push("Focar em um tópico por vez, estruturar melhor");
    urgency = "baixa";
  }

  return { adaptations, urgency };
}

export default {
  analyzeAudioInRealTime,
  analyzeTranscriptionInRealTime,
  combineAnalyses,
};
