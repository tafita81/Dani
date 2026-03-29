/**
 * Analisador de Histórico do Paciente
 * Identifica técnicas mais efetivas baseado em histórico completo
 */

export interface TechniqueEffectiveness {
  technique: string;
  timesUsed: number;
  averageEffectiveness: number; // 0-100
  improvementRate: number; // % de melhora após usar
  patientEngagement: number; // 0-100
  successRate: number; // % de sessões com progresso
  lastUsed: Date;
  notes: string[];
}

export interface PatientHistoryAnalysis {
  patientId: string;
  totalSessions: number;
  analysisDate: Date;
  
  // Técnicas mais efetivas
  mostEffectiveTechniques: TechniqueEffectiveness[];
  leastEffectiveTechniques: TechniqueEffectiveness[];
  
  // Padrões de progresso
  overallProgressTrend: "melhorando" | "piorando" | "estável";
  progressRate: number; // % de melhora por sessão
  
  // Padrões de engajamento
  engagementTrend: "aumentando" | "diminuindo" | "estável";
  averageEngagement: number; // 0-100
  
  // Sensibilidades e preferências
  detectedSensitivities: string[];
  preferredCommunicationStyle: string;
  preferredSessionPace: string;
  
  // Recomendações personalizadas
  recommendedTechniques: Array<{
    technique: string;
    reasoning: string;
    expectedEffectiveness: number; // 0-100
    priority: "alta" | "média" | "baixa";
  }>;
  
  // Alertas e observações
  alerts: string[];
  observations: string[];
}

/**
 * Analisa histórico completo do paciente e identifica técnicas mais efetivas
 */
export async function analyzePatientHistory(
  patientId: string,
  sessions: any[],
  db: any
): Promise<PatientHistoryAnalysis> {
  // Agrupa sessões por técnica usada
  const techniqueUsage = groupSessionsByTechnique(sessions);
  
  // Calcula efetividade de cada técnica
  const techniqueEffectiveness = calculateTechniqueEffectiveness(
    techniqueUsage,
    sessions
  );
  
  // Ordena por efetividade
  const sortedByEffectiveness = Array.from(techniqueEffectiveness.values())
    .sort((a, b) => b.averageEffectiveness - a.averageEffectiveness);
  
  const mostEffective = sortedByEffectiveness.slice(0, 3);
  const leastEffective = sortedByEffectiveness.slice(-3).reverse();
  
  // Analisa tendências de progresso
  const progressTrend = analyzeProgressTrend(sessions);
  const progressRate = calculateProgressRate(sessions);
  
  // Analisa tendências de engajamento
  const engagementTrend = analyzeEngagementTrend(sessions);
  const averageEngagement = calculateAverageEngagement(sessions);
  
  // Detecta sensibilidades
  const sensitivities = detectSensitivities(sessions);
  
  // Infere preferências
  const communicationStyle = inferCommunicationStyle(sessions);
  const sessionPace = inferSessionPace(sessions);
  
  // Gera recomendações personalizadas
  const recommendations = generatePersonalizedRecommendations(
    mostEffective,
    sessions,
    progressTrend
  );
  
  // Gera alertas
  const alerts = generateAlerts(sessions, progressTrend, engagementTrend);
  
  // Gera observações
  const observations = generateObservations(sessions, mostEffective);
  
  return {
    patientId,
    totalSessions: sessions.length,
    analysisDate: new Date(),
    mostEffectiveTechniques: mostEffective,
    leastEffectiveTechniques: leastEffective,
    overallProgressTrend: progressTrend,
    progressRate,
    engagementTrend,
    averageEngagement,
    detectedSensitivities: sensitivities,
    preferredCommunicationStyle: communicationStyle,
    preferredSessionPace: sessionPace,
    recommendedTechniques: recommendations,
    alerts,
    observations,
  };
}

/**
 * Agrupa sessões por técnica utilizada
 */
function groupSessionsByTechnique(sessions: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();
  
  sessions.forEach(session => {
    const techniques = extractTechniquesFromSession(session);
    
    techniques.forEach(technique => {
      if (!grouped.has(technique)) {
        grouped.set(technique, []);
      }
      grouped.get(technique)!.push(session);
    });
  });
  
  return grouped;
}

/**
 * Extrai técnicas usadas em uma sessão
 */
function extractTechniquesFromSession(session: any): string[] {
  const techniques: string[] = [];
  
  // Verifica se há registro de técnicas usadas
  if (session.interventionsSummary) {
    if (session.interventionsSummary.includes("TCC")) techniques.push("TCC");
    if (session.interventionsSummary.includes("Esquema")) techniques.push("Esquema");
    if (session.interventionsSummary.includes("Gestalt")) techniques.push("Gestalt");
    if (session.interventionsSummary.includes("Mindfulness")) techniques.push("Mindfulness");
    if (session.interventionsSummary.includes("Psicodrama")) techniques.push("Psicodrama");
  }
  
  // Se não houver técnicas registradas, tenta inferir do conteúdo
  if (techniques.length === 0) {
    const content = (session.aiSummary || "").toLowerCase();
    
    if (content.includes("pensamento") || content.includes("crença")) techniques.push("TCC");
    if (content.includes("esquema") || content.includes("padrão")) techniques.push("Esquema");
    if (content.includes("emoção") || content.includes("aqui agora")) techniques.push("Gestalt");
    if (content.includes("respiração") || content.includes("atenção plena")) techniques.push("Mindfulness");
  }
  
  return techniques.length > 0 ? techniques : ["Não Especificada"];
}

/**
 * Calcula efetividade de cada técnica
 */
function calculateTechniqueEffectiveness(
  techniqueUsage: Map<string, any[]>,
  allSessions: any[]
): Map<string, TechniqueEffectiveness> {
  const effectiveness = new Map<string, TechniqueEffectiveness>();
  
  techniqueUsage.forEach((sessions, technique) => {
    const timesUsed = sessions.length;
    
    // Calcula melhora média após usar a técnica
    let totalImprovement = 0;
    let improvementCount = 0;
    let totalEngagement = 0;
    let successCount = 0;
    
    sessions.forEach((session, index) => {
      // Compara com sessão anterior
      if (index > 0) {
        const previousSession = sessions[index - 1];
        const improvement = calculateSessionImprovement(previousSession, session);
        totalImprovement += improvement;
        improvementCount++;
        
        if (improvement > 10) successCount++;
      }
      
      // Adiciona engajamento
      totalEngagement += session.engagementLevel || 50;
    });
    
    const averageEffectiveness = improvementCount > 0 
      ? totalImprovement / improvementCount 
      : 50;
    
    const improvementRate = improvementCount > 0
      ? (totalImprovement / improvementCount / 100) * 100
      : 0;
    
    const patientEngagement = totalEngagement / sessions.length;
    const successRate = (successCount / sessions.length) * 100;
    
    effectiveness.set(technique, {
      technique,
      timesUsed,
      averageEffectiveness: Math.min(100, Math.max(0, averageEffectiveness)),
      improvementRate,
      patientEngagement,
      successRate,
      lastUsed: sessions[sessions.length - 1]?.createdAt || new Date(),
      notes: generateTechniqueNotes(technique, sessions),
    });
  });
  
  return effectiveness;
}

/**
 * Calcula melhora entre duas sessões
 */
function calculateSessionImprovement(previousSession: any, currentSession: any): number {
  let improvement = 0;
  
  // Compara sintomas/queixas principais
  if (previousSession.mainThemes && currentSession.mainThemes) {
    const previousThemes = previousSession.mainThemes.split(",").map((t: string) => t.trim());
    const currentThemes = currentSession.mainThemes.split(",").map((t: string) => t.trim());
    
    // Se temas diminuíram, houve melhora
    if (currentThemes.length < previousThemes.length) {
      improvement += 20;
    }
  }
  
  // Compara nível de engajamento
  if (previousSession.engagementLevel && currentSession.engagementLevel) {
    const engagementDiff = currentSession.engagementLevel - previousSession.engagementLevel;
    improvement += engagementDiff * 0.5;
  }
  
  // Compara notas de progresso
  if (currentSession.progressNotes && currentSession.progressNotes.toLowerCase().includes("melhora")) {
    improvement += 30;
  }
  
  return improvement;
}

/**
 * Gera notas sobre efetividade da técnica
 */
function generateTechniqueNotes(technique: string, sessions: any[]): string[] {
  const notes: string[] = [];
  
  const avgEngagement = sessions.reduce((sum, s) => sum + (s.engagementLevel || 0), 0) / sessions.length;
  
  if (avgEngagement > 75) {
    notes.push("Alto engajamento do paciente com esta técnica");
  }
  
  if (sessions.some(s => s.progressNotes?.toLowerCase().includes("resistência"))) {
    notes.push("Paciente mostrou resistência em algumas aplicações");
  }
  
  if (sessions.some(s => s.progressNotes?.toLowerCase().includes("insight"))) {
    notes.push("Técnica gerou insights significativos");
  }
  
  return notes;
}

/**
 * Analisa tendência de progresso
 */
function analyzeProgressTrend(sessions: any[]): "melhorando" | "piorando" | "estável" {
  if (sessions.length < 2) return "estável";
  
  const recentSessions = sessions.slice(-5);
  let improvementCount = 0;
  
  for (let i = 1; i < recentSessions.length; i++) {
    const improvement = calculateSessionImprovement(
      recentSessions[i - 1],
      recentSessions[i]
    );
    if (improvement > 5) improvementCount++;
  }
  
  if (improvementCount >= 3) return "melhorando";
  if (improvementCount <= 1) return "piorando";
  return "estável";
}

/**
 * Calcula taxa de progresso
 */
function calculateProgressRate(sessions: any[]): number {
  if (sessions.length < 2) return 0;
  
  let totalImprovement = 0;
  
  for (let i = 1; i < sessions.length; i++) {
    totalImprovement += calculateSessionImprovement(sessions[i - 1], sessions[i]);
  }
  
  return totalImprovement / (sessions.length - 1);
}

/**
 * Analisa tendência de engajamento
 */
function analyzeEngagementTrend(sessions: any[]): "aumentando" | "diminuindo" | "estável" {
  if (sessions.length < 2) return "estável";
  
  const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
  const secondHalf = sessions.slice(Math.floor(sessions.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, s) => sum + (s.engagementLevel || 50), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + (s.engagementLevel || 50), 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  
  if (diff > 10) return "aumentando";
  if (diff < -10) return "diminuindo";
  return "estável";
}

/**
 * Calcula engajamento médio
 */
function calculateAverageEngagement(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const total = sessions.reduce((sum, s) => sum + (s.engagementLevel || 50), 0);
  return total / sessions.length;
}

/**
 * Detecta sensibilidades do paciente
 */
function detectSensitivities(sessions: any[]): string[] {
  const sensitivities: string[] = [];
  
  sessions.forEach(session => {
    if (session.mainThemes) {
      const themes = session.mainThemes.split(",").map((t: string) => t.trim());
      themes.forEach((theme: string) => {
        if (!sensitivities.includes(theme)) {
          sensitivities.push(theme);
        }
      });
    }
  });
  
  return sensitivities.slice(0, 5); // Retorna as 5 principais
}

/**
 * Infere estilo de comunicação preferido
 */
function inferCommunicationStyle(sessions: any[]): string {
  let directCount = 0;
  let empathyCount = 0;
  let socraticCount = 0;
  
  sessions.forEach(session => {
    const content = (session.aiSummary || "").toLowerCase();
    
    if (content.includes("direto") || content.includes("objetivo")) directCount++;
    if (content.includes("empatia") || content.includes("sentimento")) empathyCount++;
    if (content.includes("pergunta") || content.includes("reflexão")) socraticCount++;
  });
  
  if (directCount > empathyCount && directCount > socraticCount) return "Direto";
  if (empathyCount > socraticCount) return "Empático";
  if (socraticCount > 0) return "Socrático";
  return "Flexível";
}

/**
 * Infere ritmo de sessão preferido
 */
function inferSessionPace(sessions: any[]): string {
  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 50), 0) / sessions.length;
  
  if (avgDuration > 60) return "Lento";
  if (avgDuration < 30) return "Rápido";
  return "Moderado";
}

/**
 * Gera recomendações personalizadas
 */
function generatePersonalizedRecommendations(
  mostEffective: TechniqueEffectiveness[],
  sessions: any[],
  progressTrend: string
): Array<{ technique: string; reasoning: string; expectedEffectiveness: number; priority: "alta" | "média" | "baixa" }> {
  const recommendations: Array<{
    technique: string;
    reasoning: string;
    expectedEffectiveness: number;
    priority: "alta" | "média" | "baixa";
  }> = [];
  
  // Recomenda técnicas mais efetivas
  mostEffective.forEach((tech, index) => {
    recommendations.push({
      technique: tech.technique,
      reasoning: `Esta técnica teve ${tech.successRate.toFixed(0)}% de taxa de sucesso em sessões anteriores`,
      expectedEffectiveness: tech.averageEffectiveness,
      priority: index === 0 ? "alta" : index === 1 ? "média" : "baixa",
    });
  });
  
  // Se progresso está piorando, recomenda mudança de abordagem
  if (progressTrend === "piorando") {
    recommendations.push({
      technique: "Combinação de Técnicas",
      reasoning: "Progresso está diminuindo. Recomenda-se combinar técnicas para renovar a abordagem",
      expectedEffectiveness: 70,
      priority: "alta",
    });
  }
  
  return recommendations;
}

/**
 * Gera alertas baseado em padrões
 */
function generateAlerts(
  sessions: any[],
  progressTrend: string,
  engagementTrend: string
): string[] {
  const alerts: string[] = [];
  
  if (progressTrend === "piorando") {
    alerts.push("⚠️ Progresso está diminuindo. Considere revisar a abordagem terapêutica");
  }
  
  if (engagementTrend === "diminuindo") {
    alerts.push("⚠️ Engajamento do paciente está diminuindo. Possível desconexão");
  }
  
  const recentSession = sessions[sessions.length - 1];
  if (recentSession?.engagementLevel < 30) {
    alerts.push("⚠️ Engajamento muito baixo na última sessão");
  }
  
  const lastSession = new Date(recentSession?.createdAt || new Date());
  const daysSinceLastSession = Math.floor(
    (new Date().getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastSession > 30) {
    alerts.push("⚠️ Mais de 30 dias sem sessão. Considere contatar o paciente");
  }
  
  return alerts;
}

/**
 * Gera observações sobre o paciente
 */
function generateObservations(
  sessions: any[],
  mostEffective: TechniqueEffectiveness[]
): string[] {
  const observations: string[] = [];
  
  if (mostEffective.length > 0) {
    observations.push(
      `Técnica mais efetiva: ${mostEffective[0].technique} (${mostEffective[0].successRate.toFixed(0)}% de sucesso)`
    );
  }
  
  const totalSessions = sessions.length;
  observations.push(`Total de sessões: ${totalSessions}`);
  
  const avgEngagement = sessions.reduce((sum, s) => sum + (s.engagementLevel || 0), 0) / sessions.length;
  observations.push(`Engajamento médio: ${avgEngagement.toFixed(0)}%`);
  
  // Identifica padrões de frequência
  if (totalSessions > 10) {
    observations.push("Paciente tem histórico consistente de atendimento");
  }
  
  return observations;
}

/**
 * Recomenda próxima técnica a usar
 */
export function recommendNextTechnique(
  analysis: PatientHistoryAnalysis
): { technique: string; reasoning: string; confidence: number } {
  // Pega a técnica mais efetiva
  const mostEffective = analysis.mostEffectiveTechniques[0];
  
  if (!mostEffective) {
    return {
      technique: "TCC",
      reasoning: "Sem histórico disponível. Iniciando com TCC (técnica base)",
      confidence: 50,
    };
  }
  
  // Se progresso está bom, continua com a mesma
  if (analysis.overallProgressTrend === "melhorando") {
    return {
      technique: mostEffective.technique,
      reasoning: `Continuar com ${mostEffective.technique} - taxa de sucesso de ${mostEffective.successRate.toFixed(0)}%`,
      confidence: 85,
    };
  }
  
  // Se progresso está ruim, recomenda combinação
  if (analysis.overallProgressTrend === "piorando") {
    const secondMostEffective = analysis.mostEffectiveTechniques[1];
    const combined = secondMostEffective
      ? `${mostEffective.technique} + ${secondMostEffective.technique}`
      : `${mostEffective.technique} + Mindfulness`;
    
    return {
      technique: combined,
      reasoning: "Progresso diminuindo. Recomenda-se combinar técnicas para renovar abordagem",
      confidence: 70,
    };
  }
  
  // Se estável, tenta segunda mais efetiva
  if (analysis.mostEffectiveTechniques.length > 1) {
    return {
      technique: analysis.mostEffectiveTechniques[1].technique,
      reasoning: `Variar abordagem. Segunda técnica mais efetiva com ${analysis.mostEffectiveTechniques[1].successRate.toFixed(0)}% de sucesso`,
      confidence: 75,
    };
  }
  
  return {
    technique: mostEffective.technique,
    reasoning: `Manter com ${mostEffective.technique}`,
    confidence: 80,
  };
}

export default {
  analyzePatientHistory,
  recommendNextTechnique,
};
