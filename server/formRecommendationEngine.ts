/**
 * Sistema Inteligente de Recomendação de Formulários
 * Monitora evolução, detecta momento certo de refazer e recomenda novos formulários
 */

export interface FormRecommendation {
  formId: string;
  formName: string;
  technique: string;
  reason: string;
  priority: "high" | "medium" | "low";
  suggestedDate: number;
  isRetake: boolean;
  daysSinceLastResponse?: number;
}

export interface SessionData {
  sessionId: string;
  date: number;
  technique: "TCC" | "Esquema" | "Gestalt" | "Geral";
  mainThemes: string[];
  interventions: string[];
  patientEngagement: number; // 0-100
  progressIndicators: string[];
  challenges: string[];
  breakthroughs: string[];
}

/**
 * Analisa histórico de sessões e recomenda formulários
 */
export function analyzeSessionHistory(
  sessions: SessionData[]
): FormRecommendation[] {
  if (sessions.length === 0) {
    return getInitialFormRecommendations();
  }

  const recommendations: FormRecommendation[] = [];
  const recentSessions = sessions.slice(-10); // Últimas 10 sessões

  // Análise de padrões
  const techniques = extractTechniques(recentSessions);
  const themes = extractMainThemes(recentSessions);
  const engagement = calculateAverageEngagement(recentSessions);
  const progress = analyzeProgress(recentSessions);

  // Recomendações baseadas em técnicas usadas
  for (const technique of techniques) {
    const recommendation = getFormRecommendationForTechnique(
      technique,
      themes,
      engagement,
      progress
    );
    if (recommendation) {
      recommendations.push(recommendation);
    }
  }

  // Recomendações baseadas em temas detectados
  const themeBasedRecs = getFormRecommendationsForThemes(themes, progress);
  recommendations.push(...themeBasedRecs);

  // Recomendações baseadas em progresso
  if (progress.hasBreakthroughs) {
    recommendations.push({
      formId: "progress-tracker",
      formName: "Rastreador de Progresso",
      technique: "Geral",
      reason: "Avanços significativos detectados - importante registrar progresso",
      priority: "high",
      suggestedDate: Date.now(),
      isRetake: false,
    });
  }

  if (progress.hasRegression) {
    recommendations.push({
      formId: "crisis-assessment",
      formName: "Avaliação de Crise",
      technique: "Geral",
      reason: "Regressão detectada - avaliação importante",
      priority: "high",
      suggestedDate: Date.now(),
      isRetake: false,
    });
  }

  // Remover duplicatas e ordenar por prioridade
  return deduplicateAndSort(recommendations);
}

/**
 * Recomendações iniciais para novo paciente
 */
function getInitialFormRecommendations(): FormRecommendation[] {
  return [
    {
      formId: "phq-9",
      formName: "PHQ-9 (Depressão)",
      technique: "Geral",
      reason: "Avaliação inicial de sintomas depressivos",
      priority: "high",
      suggestedDate: Date.now(),
      isRetake: false,
    },
    {
      formId: "gad-7",
      formName: "GAD-7 (Ansiedade)",
      technique: "Geral",
      reason: "Avaliação inicial de sintomas de ansiedade",
      priority: "high",
      suggestedDate: Date.now(),
      isRetake: false,
    },
    {
      formId: "tcc-registro-pensamentos",
      formName: "Registro de Pensamentos Automáticos (TCC)",
      technique: "TCC",
      reason: "Baseline para trabalho cognitivo-comportamental",
      priority: "medium",
      suggestedDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 semana
      isRetake: false,
    },
  ];
}

/**
 * Recomendação específica por técnica
 */
function getFormRecommendationForTechnique(
  technique: string,
  themes: string[],
  engagement: number,
  progress: ProgressAnalysis
): FormRecommendation | null {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;

  if (technique === "TCC") {
    // Se há padrões de pensamentos automáticos, refazer registro
    if (themes.includes("pensamentos") || themes.includes("crenças")) {
      return {
        formId: "tcc-registro-pensamentos",
        formName: "Registro de Pensamentos Automáticos",
        technique: "TCC",
        reason: "Padrões de pensamentos automáticos detectados - importante monitorar",
        priority: engagement > 70 ? "high" : "medium",
        suggestedDate: now + oneWeek,
        isRetake: true,
      };
    }

    // Se há trabalho com crenças centrais
    if (themes.includes("autoestima") || themes.includes("identidade")) {
      return {
        formId: "tcc-crencas-centrais",
        formName: "Análise de Crenças Centrais",
        technique: "TCC",
        reason: "Trabalho com crenças centrais em progresso",
        priority: "medium",
        suggestedDate: now + twoWeeks,
        isRetake: false,
      };
    }
  } else if (technique === "Esquema") {
    // Se há padrões de esquemas maladaptativos
    if (themes.includes("padrões") || themes.includes("relacionamento")) {
      return {
        formId: "schema-identificacao",
        formName: "Identificação de Esquemas Maladaptativos",
        technique: "Esquema",
        reason: "Esquemas maladaptativos sendo trabalhados",
        priority: "medium",
        suggestedDate: now + twoWeeks,
        isRetake: true,
      };
    }

    // Se há trabalho com modos
    if (themes.includes("emoções") || themes.includes("reações")) {
      return {
        formId: "schema-modos",
        formName: "Avaliação de Modos de Esquema",
        technique: "Esquema",
        reason: "Modos de esquema sendo identificados e trabalhados",
        priority: "medium",
        suggestedDate: now + oneWeek,
        isRetake: false,
      };
    }
  } else if (technique === "Gestalt") {
    // Se há trabalho com consciência
    if (themes.includes("consciência") || themes.includes("presente")) {
      return {
        formId: "gestalt-ciclo-contato",
        formName: "Ciclo de Contato (Gestalt)",
        technique: "Gestalt",
        reason: "Trabalho com consciência e contato em progresso",
        priority: "medium",
        suggestedDate: now + oneWeek,
        isRetake: true,
      };
    }

    // Se há mecanismos de defesa sendo trabalhados
    if (
      themes.includes("defesa") ||
      themes.includes("resistência") ||
      themes.includes("bloqueio")
    ) {
      return {
        formId: "gestalt-mecanismos-defesa",
        formName: "Mecanismos de Defesa Gestálticos",
        technique: "Gestalt",
        reason: "Mecanismos de defesa sendo explorados",
        priority: "medium",
        suggestedDate: now + twoWeeks,
        isRetake: false,
      };
    }
  }

  return null;
}

/**
 * Recomendações baseadas em temas detectados
 */
function getFormRecommendationsForThemes(
  themes: string[],
  progress: ProgressAnalysis
): FormRecommendation[] {
  const recommendations: FormRecommendation[] = [];
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  // Se há temas de ansiedade
  if (themes.includes("ansiedade") || themes.includes("preocupação")) {
    recommendations.push({
      formId: "gad-7",
      formName: "GAD-7 (Ansiedade)",
      technique: "Geral",
      reason: "Sintomas de ansiedade sendo trabalhados",
      priority: "high",
      suggestedDate: now + oneWeek,
      isRetake: true,
    });
  }

  // Se há temas de depressão
  if (themes.includes("tristeza") || themes.includes("desesperança")) {
    recommendations.push({
      formId: "phq-9",
      formName: "PHQ-9 (Depressão)",
      technique: "Geral",
      reason: "Sintomas depressivos sendo monitorados",
      priority: "high",
      suggestedDate: now + oneWeek,
      isRetake: true,
    });
  }

  // Se há temas de trauma
  if (themes.includes("trauma") || themes.includes("medo")) {
    recommendations.push({
      formId: "pcl-5",
      formName: "PCL-5 (TEPT)",
      technique: "Geral",
      reason: "Sintomas de trauma sendo processados",
      priority: "high",
      suggestedDate: now + oneWeek,
      isRetake: false,
    });
  }

  // Se há temas de relacionamento
  if (themes.includes("relacionamento") || themes.includes("conexão")) {
    recommendations.push({
      formId: "relationship-assessment",
      formName: "Avaliação de Relacionamentos",
      technique: "Geral",
      reason: "Dinâmicas de relacionamento sendo exploradas",
      priority: "medium",
      suggestedDate: now + oneWeek,
      isRetake: false,
    });
  }

  return recommendations;
}

/**
 * Extrai técnicas usadas nas sessões
 */
function extractTechniques(sessions: SessionData[]): string[] {
  const techniques = new Set<string>();
  for (const session of sessions) {
    techniques.add(session.technique);
  }
  return Array.from(techniques);
}

/**
 * Extrai temas principais das sessões
 */
function extractMainThemes(sessions: SessionData[]): string[] {
  const themes = new Set<string>();
  for (const session of sessions) {
    for (const theme of session.mainThemes) {
      themes.add(theme.toLowerCase());
    }
  }
  return Array.from(themes);
}

/**
 * Calcula engajamento médio
 */
function calculateAverageEngagement(sessions: SessionData[]): number {
  if (sessions.length === 0) return 0;
  const total = sessions.reduce((sum, s) => sum + s.patientEngagement, 0);
  return total / sessions.length;
}

interface ProgressAnalysis {
  hasBreakthroughs: boolean;
  hasRegression: boolean;
  overallTrend: "improving" | "declining" | "stable";
  consistencyScore: number;
}

/**
 * Analisa progresso geral
 */
function analyzeProgress(sessions: SessionData[]): ProgressAnalysis {
  if (sessions.length < 2) {
    return {
      hasBreakthroughs: false,
      hasRegression: false,
      overallTrend: "stable",
      consistencyScore: 0,
    };
  }

  const recentSessions = sessions.slice(-5);
  const breakthroughs = recentSessions.filter(s => s.breakthroughs.length > 0)
    .length;
  const challenges = recentSessions.filter(s => s.challenges.length > 0).length;

  const hasBreakthroughs = breakthroughs >= 2;
  const hasRegression = challenges >= 3;

  const engagementTrend =
    recentSessions[recentSessions.length - 1].patientEngagement -
    recentSessions[0].patientEngagement;

  let overallTrend: "improving" | "declining" | "stable";
  if (engagementTrend > 10) {
    overallTrend = "improving";
  } else if (engagementTrend < -10) {
    overallTrend = "declining";
  } else {
    overallTrend = "stable";
  }

  const consistencyScore = (recentSessions.length / sessions.length) * 100;

  return {
    hasBreakthroughs,
    hasRegression,
    overallTrend,
    consistencyScore,
  };
}

/**
 * Remove duplicatas e ordena por prioridade
 */
function deduplicateAndSort(
  recommendations: FormRecommendation[]
): FormRecommendation[] {
  const seen = new Set<string>();
  const unique = recommendations.filter(rec => {
    if (seen.has(rec.formId)) {
      return false;
    }
    seen.add(rec.formId);
    return true;
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return unique.sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      a.suggestedDate - b.suggestedDate
  );
}

export default {
  analyzeSessionHistory,
  getInitialFormRecommendations,
};
