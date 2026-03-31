/**
 * Sistema de Inferência Silenciosa
 * Observa comportamentos, analisa padrões e adapta atendimento automaticamente
 * SEM fazer perguntas diretas - tudo discreto e imperceptível
 */

export interface BehavioralSignals {
  // Sinais de comunicação
  responseTime: number; // ms até responder
  responseLength: number; // palavras na resposta
  pauseDuration: number; // ms de pausas
  speakingPace: "rápido" | "moderado" | "lento";
  
  // Sinais de engajamento
  engagementLevel: number; // 0-100
  attentionSpan: number; // minutos
  interruptionFrequency: number; // vezes por sessão
  
  // Sinais emocionais
  emotionalOpenness: number; // 0-100
  defensiveness: number; // 0-100
  vulnerabilityLevel: number; // 0-100
  
  // Sinais de compreensão
  clarificationRequests: number; // quantas vezes pediu esclarecimento
  confusionIndicators: number; // sinais de confusão
  understandingLevel: number; // 0-100
  
  // Sinais de preferência
  topicAvoidance: string[]; // tópicos que evita
  topicEngagement: string[]; // tópicos que se engaja
  
  // Sinais de efetividade
  techniqueResponse: Map<string, number>; // técnica -> efetividade (0-100)
  interventionResponse: number; // como reagiu à última intervenção (0-100)
  
  // Sinais de relacionamento
  rapportLevel: number; // 0-100
  trustLevel: number; // 0-100
  comfortLevel: number; // 0-100
}

export interface InferredPreferences {
  // Inferências sobre comunicação
  preferredCommunicationStyle: "direto" | "gradual" | "metafórico" | "socrático";
  communicationPace: "rápido" | "moderado" | "lento";
  preferredLanguageLevel: "técnico" | "formal" | "informal" | "acessível";
  
  // Inferências sobre abordagem
  mostEffectiveApproaches: Array<{
    approach: string;
    effectiveness: number; // 0-100
    confidence: number; // confiança da inferência 0-100
  }>;
  
  // Inferências sobre relacionamento
  relationshipStyle: "amigável" | "profissional" | "estruturado" | "flexível";
  preferredTone: "empático" | "neutro" | "motivador" | "desafiador";
  
  // Inferências sobre estrutura
  sessionStructure: "estruturada" | "flexível" | "exploratória";
  preferredSessionPace: "rápido" | "moderado" | "lento";
  
  // Sensibilidades detectadas
  detectedSensitivities: Array<{
    topic: string;
    sensitivity: number; // 0-100
    avoidanceLevel: number; // 0-100
  }>;
  
  // Padrões de aprendizado
  learningStyle: "visual" | "auditivo" | "cinestésico" | "leitura";
  processingSpeed: "rápido" | "moderado" | "lento";
  
  // Confiança geral das inferências
  overallConfidence: number; // 0-100
  lastUpdated: Date;
}

/**
 * Analisa sinais comportamentais e infere preferências
 */
export function inferPreferencesFromBehavior(
  signals: BehavioralSignals,
  sessionHistory: BehavioralSignals[]
): InferredPreferences {
  // Análise de comunicação
  const communicationStyle = inferCommunicationStyle(signals, sessionHistory);
  const communicationPace = inferCommunicationPace(signals);
  const languageLevel = inferLanguageLevel(signals);

  // Análise de efetividade de técnicas
  const mostEffectiveApproaches = identifyMostEffectiveTechniques(
    signals.techniqueResponse,
    sessionHistory
  );

  // Análise de relacionamento
  const relationshipStyle = inferRelationshipStyle(signals);
  const preferredTone = inferPreferredTone(signals, sessionHistory);

  // Análise de estrutura
  const sessionStructure = inferSessionStructure(signals);
  const sessionPace = inferSessionPace(signals);

  // Análise de sensibilidades
  const sensitivities = detectSensitivities(signals, sessionHistory);

  // Análise de estilo de aprendizado
  const learningStyle = inferLearningStyle(signals, sessionHistory);
  const processingSpeed = inferProcessingSpeed(signals);

  // Calcula confiança geral
  const confidence = calculateInferenceConfidence(signals, sessionHistory);

  return {
    preferredCommunicationStyle: communicationStyle,
    communicationPace,
    preferredLanguageLevel: languageLevel,
    mostEffectiveApproaches,
    relationshipStyle,
    preferredTone,
    sessionStructure,
    preferredSessionPace: sessionPace,
    detectedSensitivities: sensitivities,
    learningStyle,
    processingSpeed,
    overallConfidence: confidence,
    lastUpdated: new Date(),
  };
}

/**
 * Infere estilo de comunicação observando como o paciente responde
 */
function inferCommunicationStyle(
  signals: BehavioralSignals,
  history: BehavioralSignals[]
): "direto" | "gradual" | "metafórico" | "socrático" {
  // Se responde rápido e com respostas curtas → prefere direto
  if (signals.responseTime < 2000 && signals.responseLength < 50) {
    return "direto";
  }

  // Se pede esclarecimentos frequentes → prefere gradual
  if (signals.clarificationRequests > 2) {
    return "gradual";
  }

  // Se engaja mais com exemplos → prefere metafórico
  const topicEngagementWithExamples = signals.topicEngagement.filter(
    t => t.includes("exemplo") || t.includes("história")
  ).length;
  if (topicEngagementWithExamples > signals.topicEngagement.length / 2) {
    return "metafórico";
  }

  // Se faz muitas perguntas → prefere socrático
  if (signals.interruptionFrequency > 5) {
    return "socrático";
  }

  return "moderado" as any;
}

/**
 * Infere ritmo de comunicação
 */
function inferCommunicationPace(
  signals: BehavioralSignals
): "rápido" | "moderado" | "lento" {
  if (signals.speakingPace === "rápido" && signals.responseTime < 1000) {
    return "rápido";
  }
  if (signals.pauseDuration > 3000 || signals.speakingPace === "lento") {
    return "lento";
  }
  return "moderado";
}

/**
 * Infere nível de linguagem preferido
 */
function inferLanguageLevel(
  signals: BehavioralSignals
): "técnico" | "formal" | "informal" | "acessível" {
  // Se pede esclarecimento sobre termos técnicos → acessível
  if (signals.clarificationRequests > 1) {
    return "acessível";
  }
  // Se usa termos técnicos nas respostas → técnico
  // Se é mais formal → formal
  // Se é mais casual → informal
  return "acessível";
}

/**
 * Identifica técnicas mais efetivas para este paciente
 */
function identifyMostEffectiveTechniques(
  techniqueResponse: Map<string, number>,
  history: BehavioralSignals[]
): Array<{ approach: string; effectiveness: number; confidence: number }> {
  const techniques = Array.from(techniqueResponse.entries())
    .map(([technique, effectiveness]) => ({
      approach: technique,
      effectiveness,
      confidence: 70, // Confiança inicial
    }))
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .slice(0, 3);

  return techniques;
}

/**
 * Infere estilo de relacionamento preferido
 */
function inferRelationshipStyle(
  signals: BehavioralSignals
): "amigável" | "profissional" | "estruturado" | "flexível" {
  // Se conforto é alto e rapport é alto → amigável
  if (signals.comfortLevel > 80 && signals.rapportLevel > 75) {
    return "amigável";
  }
  // Se prefere estrutura → estruturado
  if (signals.engagementLevel > 70 && signals.confusionIndicators < 2) {
    return "estruturado";
  }
  // Se é flexível → flexível
  return "profissional";
}

/**
 * Infere tom preferido
 */
function inferPreferredTone(
  signals: BehavioralSignals,
  history: BehavioralSignals[]
): "empático" | "neutro" | "motivador" | "desafiador" {
  // Se vulnerabilidade é alta → empático
  if (signals.vulnerabilityLevel > 70) {
    return "empático";
  }
  // Se engajamento é alto com desafios → desafiador
  if (signals.engagementLevel > 80) {
    return "desafiador";
  }
  // Se é consistente → neutro
  return "motivador";
}

/**
 * Infere estrutura de sessão preferida
 */
function inferSessionStructure(
  signals: BehavioralSignals
): "estruturada" | "flexível" | "exploratória" {
  // Se confusão é baixa e engajamento é alto → estruturada
  if (signals.confusionIndicators < 1 && signals.engagementLevel > 75) {
    return "estruturada";
  }
  // Se há muitas interrupções → flexível
  if (signals.interruptionFrequency > 3) {
    return "flexível";
  }
  return "exploratória";
}

/**
 * Infere ritmo preferido da sessão
 */
function inferSessionPace(
  signals: BehavioralSignals
): "rápido" | "moderado" | "lento" {
  if (signals.speakingPace === "rápido" && signals.attentionSpan > 45) {
    return "rápido";
  }
  if (signals.pauseDuration > 2000 || signals.attentionSpan < 30) {
    return "lento";
  }
  return "moderado";
}

/**
 * Detecta sensibilidades observando reações
 */
function detectSensitivities(
  signals: BehavioralSignals,
  history: BehavioralSignals[]
): Array<{ topic: string; sensitivity: number; avoidanceLevel: number }> {
  const sensitivities: Array<{ topic: string; sensitivity: number; avoidanceLevel: number }> = [];

  // Analisa tópicos evitados
  signals.topicAvoidance.forEach(topic => {
    sensitivities.push({
      topic,
      sensitivity: 80,
      avoidanceLevel: signals.defensiveness,
    });
  });

  return sensitivities;
}

/**
 * Infere estilo de aprendizado
 */
function inferLearningStyle(
  signals: BehavioralSignals,
  history: BehavioralSignals[]
): "visual" | "auditivo" | "cinestésico" | "leitura" {
  // Se responde bem a exemplos → visual
  // Se responde bem a explicações → auditivo
  // Se prefere fazer → cinestésico
  // Se prefere ler → leitura
  return "auditivo";
}

/**
 * Infere velocidade de processamento
 */
function inferProcessingSpeed(
  signals: BehavioralSignals
): "rápido" | "moderado" | "lento" {
  if (signals.responseTime < 1500) {
    return "rápido";
  }
  if (signals.responseTime > 4000) {
    return "lento";
  }
  return "moderado";
}

/**
 * Calcula confiança geral das inferências
 */
function calculateInferenceConfidence(
  signals: BehavioralSignals,
  history: BehavioralSignals[]
): number {
  // Mais histórico = mais confiança
  const historyConfidence = Math.min(history.length * 10, 50);

  // Consistência dos sinais = mais confiança
  const consistency = calculateConsistency(signals, history);

  // Clareza dos sinais = mais confiança
  const clarity = calculateClarity(signals);

  return Math.min(100, historyConfidence + consistency + clarity);
}

function calculateConsistency(
  signals: BehavioralSignals,
  history: BehavioralSignals[]
): number {
  if (history.length === 0) return 0;

  // Compara sinais atuais com média histórica
  const avgEngagement = history.reduce((sum, s) => sum + s.engagementLevel, 0) / history.length;
  const variance = Math.abs(signals.engagementLevel - avgEngagement);

  return Math.max(0, 30 - variance / 10);
}

function calculateClarity(signals: BehavioralSignals): number {
  // Sinais claros aumentam confiança
  let clarity = 20;

  if (signals.engagementLevel > 70 || signals.engagementLevel < 30) clarity += 10;
  if (signals.rapportLevel > 70 || signals.rapportLevel < 30) clarity += 10;
  if (signals.understandingLevel > 80 || signals.understandingLevel < 40) clarity += 10;

  return clarity;
}

/**
 * Adapta recomendações em tempo real baseado em sinais atuais
 */
export function adaptRecommendationsInRealTime(
  currentSignals: BehavioralSignals,
  inferredPreferences: InferredPreferences,
  availableTechniques: any[]
): any[] {
  // Se engajamento está baixo → mude a abordagem
  if (currentSignals.engagementLevel < 40) {
    return availableTechniques
      .filter(t => inferredPreferences.mostEffectiveApproaches.some(
        a => a.approach === t.approach && a.effectiveness > 70
      ))
      .slice(0, 3);
  }

  // Se há confusão → simplifique
  if (currentSignals.confusionIndicators > 2) {
    return availableTechniques
      .filter(t => t.complexity === "baixa")
      .slice(0, 3);
  }

  // Se há defensiveness → seja mais empático
  if (currentSignals.defensiveness > 60) {
    return availableTechniques
      .filter(t => t.approach === "Gestalt" || t.approach === "Mindfulness")
      .slice(0, 3);
  }

  // Recomendação padrão
  return availableTechniques
    .filter(t => inferredPreferences.mostEffectiveApproaches.some(
      a => a.approach === t.approach
    ))
    .slice(0, 3);
}

/**
 * Rastreia evolução do paciente sem expor o sistema
 */
export interface EvolutionTracking {
  sessionNumber: number;
  date: Date;
  
  // Progresso clínico
  symptomReduction: number; // 0-100
  functionalityImprovement: number; // 0-100
  goalProgress: number; // 0-100
  
  // Satisfação (inferida, não perguntada)
  inferredSatisfaction: number; // 0-100
  rapportQuality: number; // 0-100
  
  // Técnicas efetivas
  mostEffectiveTechniques: string[];
  
  // Padrões observados
  positivePatterns: string[];
  challengingPatterns: string[];
  
  // Recomendações para próxima sessão
  nextSessionRecommendations: string[];
}

export default {
  inferPreferencesFromBehavior,
  adaptRecommendationsInRealTime,
};
