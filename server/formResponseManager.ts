/**
 * Sistema Completo de Gerenciamento de Respostas de Formulários
 * Inclui: Salvamento, Histórico, Comparativos, Alertas e Relatórios
 */

import { v4 as uuidv4 } from "uuid";

export interface FormResponse {
  id: string;
  patientId: string;
  formId: string;
  formName: string;
  technique: "TCC" | "Esquema" | "Gestalt" | "Geral";
  responses: Record<string, any>;
  totalScore?: number;
  interpretation?: string;
  completedAt: number; // timestamp
  createdAt: number;
  updatedAt: number;
}

export interface FormComparison {
  id: string;
  patientId: string;
  formId: string;
  baselineResponseId: string;
  currentResponseId: string;
  scoreChange: number;
  percentageChange: number;
  trend: "improved" | "declined" | "stable";
  significantChange: boolean;
  createdAt: number;
}

export interface FormAlert {
  id: string;
  patientId: string;
  formId: string;
  responseId: string;
  alertType: "improvement" | "decline" | "critical" | "milestone";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  acknowledged: boolean;
  createdAt: number;
}

export interface FormProgressReport {
  id: string;
  patientId: string;
  formId: string;
  reportPeriod: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate: number;
  endDate: number;
  responseCount: number;
  averageScore: number;
  scoreImprovement: number;
  improvementPercentage: number;
  trend: "improving" | "declining" | "stable";
  insights: string[];
  recommendations: string[];
  createdAt: number;
}

/**
 * Salva resposta de formulário com timestamp completo
 */
export function createFormResponse(
  patientId: string,
  formId: string,
  formName: string,
  technique: "TCC" | "Esquema" | "Gestalt" | "Geral",
  responses: Record<string, any>,
  totalScore?: number,
  interpretation?: string
): FormResponse {
  const now = Date.now();
  return {
    id: uuidv4(),
    patientId,
    formId,
    formName,
    technique,
    responses,
    totalScore,
    interpretation,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calcula comparativo entre duas respostas
 */
export function compareResponses(
  baseline: FormResponse,
  current: FormResponse
): FormComparison {
  if (!baseline.totalScore || !current.totalScore) {
    throw new Error("Ambas as respostas devem ter totalScore para comparação");
  }

  const scoreChange = current.totalScore - baseline.totalScore;
  const percentageChange = (scoreChange / baseline.totalScore) * 100;
  
  // Determinar trend (melhora/piora depende do formulário)
  // Para PHQ-9 e GAD-7: scores menores = melhor
  let trend: "improved" | "declined" | "stable";
  if (Math.abs(percentageChange) < 5) {
    trend = "stable";
  } else if (scoreChange < 0) {
    trend = "improved"; // Score diminuiu (melhor para depressão/ansiedade)
  } else {
    trend = "declined"; // Score aumentou (pior)
  }

  const significantChange = Math.abs(percentageChange) >= 20;

  return {
    id: uuidv4(),
    patientId: baseline.patientId,
    formId: baseline.formId,
    baselineResponseId: baseline.id,
    currentResponseId: current.id,
    scoreChange,
    percentageChange,
    trend,
    significantChange,
    createdAt: Date.now(),
  };
}

/**
 * Gera alerta baseado em mudança significativa
 */
export function generateAlert(
  comparison: FormComparison,
  formName: string,
  responseId: string
): FormAlert | null {
  if (!comparison.significantChange) {
    return null;
  }

  let alertType: "improvement" | "decline" | "critical" | "milestone";
  let severity: "low" | "medium" | "high" | "critical";
  let message: string;

  if (comparison.trend === "improved") {
    if (comparison.percentageChange < -50) {
      alertType = "milestone";
      severity = "high";
      message = `🎉 Progresso Significativo! ${formName} melhorou ${Math.abs(comparison.percentageChange).toFixed(1)}%`;
    } else {
      alertType = "improvement";
      severity = "medium";
      message = `✅ Melhora detectada em ${formName}: ${Math.abs(comparison.percentageChange).toFixed(1)}%`;
    }
  } else if (comparison.trend === "declined") {
    if (comparison.percentageChange > 50) {
      alertType = "critical";
      severity = "critical";
      message = `⚠️ ALERTA: ${formName} piorou significativamente ${comparison.percentageChange.toFixed(1)}%`;
    } else {
      alertType = "decline";
      severity = "high";
      message = `⚠️ Piora detectada em ${formName}: ${comparison.percentageChange.toFixed(1)}%`;
    }
  } else {
    return null;
  }

  return {
    id: uuidv4(),
    patientId: comparison.patientId,
    formId: comparison.formId,
    responseId,
    alertType,
    severity,
    message,
    acknowledged: false,
    createdAt: Date.now(),
  };
}

/**
 * Gera relatório de progresso para período específico
 */
export function generateProgressReport(
  patientId: string,
  formId: string,
  responses: FormResponse[],
  reportPeriod: "weekly" | "monthly" | "quarterly" | "yearly"
): FormProgressReport {
  if (responses.length === 0) {
    throw new Error("Nenhuma resposta disponível para gerar relatório");
  }

  const scores = responses
    .filter(r => r.totalScore !== undefined)
    .map(r => r.totalScore as number);

  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const scoreImprovement = lastScore - firstScore;
  const improvementPercentage = (scoreImprovement / firstScore) * 100;

  let trend: "improving" | "declining" | "stable";
  if (Math.abs(improvementPercentage) < 5) {
    trend = "stable";
  } else if (scoreImprovement < 0) {
    trend = "improving";
  } else {
    trend = "declining";
  }

  const insights = generateInsights(responses, trend, improvementPercentage);
  const recommendations = generateRecommendations(
    trend,
    improvementPercentage,
    responses[responses.length - 1].technique
  );

  const now = Date.now();
  const startDate = responses[0].completedAt;
  const endDate = responses[responses.length - 1].completedAt;

  return {
    id: uuidv4(),
    patientId,
    formId,
    reportPeriod,
    startDate,
    endDate,
    responseCount: responses.length,
    averageScore,
    scoreImprovement,
    improvementPercentage,
    trend,
    insights,
    recommendations,
    createdAt: now,
  };
}

/**
 * Gera insights baseados em padrões de resposta
 */
function generateInsights(
  responses: FormResponse[],
  trend: "improving" | "declining" | "stable",
  improvementPercentage: number
): string[] {
  const insights: string[] = [];

  if (trend === "improving") {
    insights.push(
      `Progresso consistente: ${Math.abs(improvementPercentage).toFixed(1)}% de melhora`
    );
    insights.push("Paciente está respondendo bem ao tratamento");
  } else if (trend === "declining") {
    insights.push(
      `Regressão detectada: ${improvementPercentage.toFixed(1)}% de piora`
    );
    insights.push("Pode ser necessário ajuste na abordagem terapêutica");
  } else {
    insights.push("Sintomas estáveis, sem mudanças significativas");
  }

  // Análise de variabilidade
  const scores = responses
    .filter(r => r.totalScore !== undefined)
    .map(r => r.totalScore as number);

  if (scores.length >= 3) {
    const variance = calculateVariance(scores);
    if (variance > 10) {
      insights.push("Variabilidade alta nas respostas - possível instabilidade emocional");
    } else {
      insights.push("Respostas consistentes - boa estabilidade");
    }
  }

  return insights;
}

/**
 * Gera recomendações baseadas em progresso
 */
function generateRecommendations(
  trend: "improving" | "declining" | "stable",
  improvementPercentage: number,
  technique: string
): string[] {
  const recommendations: string[] = [];

  if (trend === "improving") {
    recommendations.push("Manter a abordagem atual - está funcionando bem");
    recommendations.push("Considerar aumentar a complexidade das intervenções");
    recommendations.push("Consolidar ganhos com técnicas de manutenção");
  } else if (trend === "declining") {
    recommendations.push("Revisar a formulação do caso");
    recommendations.push("Considerar mudança de técnica ou combinação de técnicas");
    recommendations.push("Investigar possíveis fatores externos que afetam o progresso");
    recommendations.push("Aumentar frequência de sessões se possível");
  } else {
    recommendations.push("Continuar monitorando de perto");
    recommendations.push("Considerar introduzir variações na técnica");
    recommendations.push("Explorar possíveis resistências ou bloqueios");
  }

  // Recomendações específicas por técnica
  if (technique === "TCC") {
    recommendations.push("Revisar registros de pensamentos e comportamentos");
  } else if (technique === "Esquema") {
    recommendations.push("Trabalhar modos de esquema e necessidades emocionais");
  } else if (technique === "Gestalt") {
    recommendations.push("Aprofundar trabalho com consciência e contato");
  }

  return recommendations;
}

/**
 * Calcula variância de um array de números
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDifferences = values.map(v => Math.pow(v - mean, 2));
  return squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Formata data/hora para exibição
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Calcula dias desde última resposta
 */
export function daysSinceLastResponse(lastResponseDate: number): number {
  const now = Date.now();
  const daysDifference = Math.floor((now - lastResponseDate) / (1000 * 60 * 60 * 24));
  return daysDifference;
}

/**
 * Determina se paciente deveria refazer formulário
 */
export function shouldRetakeForm(
  lastResponseDate: number,
  formId: string
): boolean {
  const daysSince = daysSinceLastResponse(lastResponseDate);

  // Diferentes intervalos recomendados por tipo de formulário
  const intervals: Record<string, number> = {
    "phq-9": 14, // 2 semanas
    "gad-7": 14, // 2 semanas
    "tcc-registro-pensamentos": 7, // 1 semana
    "schema-identificacao": 30, // 1 mês
    "gestalt-ciclo-contato": 21, // 3 semanas
  };

  const recommendedInterval = intervals[formId] || 30;
  return daysSince >= recommendedInterval;
}

export default {
  createFormResponse,
  compareResponses,
  generateAlert,
  generateProgressReport,
  formatDateTime,
  daysSinceLastResponse,
  shouldRetakeForm,
};
