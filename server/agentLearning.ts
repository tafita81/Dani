/**
 * Agent Learning System — Sistema de aprendizado contínuo e evolução quantitativa
 * Rastreia ações, calcula métricas, descobre insights e otimiza automaticamente
 */

import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import {
  agentActionLog,
  performanceMetrics,
  learningInsights,
  optimizationHistory,
  aiLearningModel,
  continuousImprovementPlan,
} from "../drizzle/schema";
import { eq, gte, lte, and } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════
// ─── LOGGING DE AÇÕES ───
// ═══════════════════════════════════════════════════════════════

export async function logAgentAction(
  userId: number,
  actionType: string,
  data: {
    description: string;
    actionData: any;
    success: boolean;
    errorMessage?: string;
    resultMetrics?: any;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const action = await db.insert(agentActionLog).values({
    userId,
    actionType: actionType as any,
    description: data.description,
    actionData: data.actionData,
    success: data.success,
    errorMessage: data.errorMessage,
    resultMetrics: data.resultMetrics,
  });

  return action;
}

export async function logActionWithFeedback(
  userId: number,
  actionType: string,
  data: {
    description: string;
    actionData: any;
    success: boolean;
    resultMetrics?: any;
  },
  feedback?: {
    userFeedback: "positive" | "neutral" | "negative";
    feedbackNotes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const action = await db.insert(agentActionLog).values({
    userId,
    actionType: actionType as any,
    description: data.description,
    actionData: data.actionData,
    success: data.success,
    resultMetrics: data.resultMetrics,
    userFeedback: feedback?.userFeedback,
    feedbackNotes: feedback?.feedbackNotes,
  });

  return action;
}

// ═══════════════════════════════════════════════════════════════
// ─── CÁLCULO DE MÉTRICAS ───
// ═══════════════════════════════════════════════════════════════

export async function calculateDailyMetrics(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Buscar todas as ações do dia
  const dailyActions = await db
    .select()
    .from(agentActionLog)
    .where(and(eq(agentActionLog.userId, userId), gte(agentActionLog.createdAt, today), lte(agentActionLog.createdAt, tomorrow)));

  if (dailyActions.length === 0) return null;

  // Calcular métricas
  const successfulActions = dailyActions.filter((a) => a.success).length;
  const failedActions = dailyActions.filter((a) => !a.success).length;
  const successRate = (successfulActions / dailyActions.length) * 100;

  // Agregar engagement e conversões
  let totalEngagement = 0;
  let totalReach = 0;
  let totalConversions = 0;

  for (const action of dailyActions) {
    if (action.resultMetrics) {
      const metrics = action.resultMetrics as any;
      totalEngagement += metrics.engagement || 0;
      totalReach += metrics.reach || 0;
      totalConversions += metrics.conversions || 0;
    }
  }

  const avgEngagementPerAction = totalEngagement / dailyActions.length;
  const conversionRate = dailyActions.length > 0 ? (totalConversions / dailyActions.length) * 100 : 0;

  // Contar feedback
  const positiveActions = dailyActions.filter((a) => a.userFeedback === "positive").length;
  const negativeActions = dailyActions.filter((a) => a.userFeedback === "negative").length;
  const satisfactionScore = (positiveActions / dailyActions.length) * 100;

  // Salvar métricas
  const metrics = await db.insert(performanceMetrics).values({
    userId,
    period: "daily",
    periodDate: today,
    totalActionsExecuted: dailyActions.length,
    successfulActions,
    failedActions,
    successRate: successRate.toString() as any,
    totalEngagement,
    totalReach,
    avgEngagementPerAction: avgEngagementPerAction.toString() as any,
    totalConversions,
    conversionRate: conversionRate.toString() as any,
    positiveActions,
    negativeActions,
    satisfactionScore: satisfactionScore.toString() as any,
  });

  return metrics;
}

// ═══════════════════════════════════════════════════════════════
// ─── DESCOBERTA DE INSIGHTS ───
// ═══════════════════════════════════════════════════════════════

export async function discoverInsights(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar últimas 30 dias de dados
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActions = await db
    .select()
    .from(agentActionLog)
    .where(and(eq(agentActionLog.userId, userId), gte(agentActionLog.createdAt, thirtyDaysAgo)));

  const recentMetrics = await db
    .select()
    .from(performanceMetrics)
    .where(and(eq(performanceMetrics.userId, userId), gte(performanceMetrics.createdAt, thirtyDaysAgo)));

  // Analisar padrões com IA
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um especialista em análise de dados e descoberta de padrões. 
Analise os dados de ações e métricas para descobrir insights valiosos que podem melhorar a performance.`,
      },
      {
        role: "user",
        content: `Analise estes dados e descubra insights:

Ações executadas (últimas 30 dias): ${recentActions.length}
Ações bem-sucedidas: ${recentActions.filter((a) => a.success).length}
Taxa de sucesso média: ${(recentMetrics.reduce((sum, m) => sum + parseFloat(m.successRate || "0"), 0) / recentMetrics.length).toFixed(2)}%
Engagement total: ${recentActions.reduce((sum, a) => sum + ((a.resultMetrics as any)?.engagement || 0), 0)}
Conversões totais: ${recentActions.reduce((sum, a) => sum + ((a.resultMetrics as any)?.conversions || 0), 0)}

Forneça 3-5 insights principais em JSON com: tipo, título, descrição, confiança (0-100), recomendações.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "insights",
        strict: true,
        schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  confidence: { type: "number" },
                  recommendations: { type: "array", items: { type: "string" } },
                },
                required: ["type", "title", "description", "confidence", "recommendations"],
              },
            },
          },
          required: ["insights"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  // Salvar insights
  const savedInsights = [];
  for (const insight of parsed.insights) {
    const saved = await db.insert(learningInsights).values({
      userId,
      insightType: insight.type as any,
      title: insight.title,
      description: insight.description,
      supportingData: { actionCount: recentActions.length, metricsCount: recentMetrics.length },
      confidence: insight.confidence,
      recommendations: insight.recommendations,
    });
    savedInsights.push(saved);
  }

  return savedInsights;
}

// ═══════════════════════════════════════════════════════════════
// ─── SUGESTÕES DE OTIMIZAÇÃO ───
// ═══════════════════════════════════════════════════════════════

export async function generateOptimizationSuggestions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar insights recentes
  const recentInsights = await db
    .select()
    .from(learningInsights)
    .where(and(eq(learningInsights.userId, userId), eq(learningInsights.isActive, true)))
    .orderBy(learningInsights.createdAt)
    .limit(10);

  // Buscar histórico de otimizações
  const recentOptimizations = await db
    .select()
    .from(optimizationHistory)
    .where(eq(optimizationHistory.userId, userId))
    .orderBy(optimizationHistory.appliedAt)
    .limit(20);

  // Gerar sugestões com IA
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um especialista em otimização de sistemas. 
Com base nos insights descobertos, sugira otimizações específicas e acionáveis.`,
      },
      {
        role: "user",
        content: `Insights recentes: ${JSON.stringify(recentInsights.map((i) => ({ title: i.title, confidence: i.confidence })))}

Otimizações anteriores: ${recentOptimizations.length} aplicadas

Sugira 3-5 otimizações específicas em JSON com: tipo, descrição, mudanças esperadas, prioridade.`,
      },
    ],
  });

  return response.choices[0].message.content;
}

// ═══════════════════════════════════════════════════════════════
// ─── PLANO DE MELHORIA CONTÍNUA ───
// ═══════════════════════════════════════════════════════════════

export async function createImprovementPlan(
  userId: number,
  objective: string,
  targetMetric: string,
  currentValue: number,
  targetValue: number,
  daysToAchieve: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToAchieve);

  // Gerar ações com IA
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um especialista em planejamento de melhoria contínua. 
Crie um plano detalhado com ações específicas para atingir o objetivo.`,
      },
      {
        role: "user",
        content: `Objetivo: ${objective}
Métrica: ${targetMetric}
Valor atual: ${currentValue}
Valor alvo: ${targetValue}
Prazo: ${daysToAchieve} dias

Forneça 5-7 ações específicas em JSON.`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const plannedActions = typeof content === "string" ? JSON.parse(content) : content;

  // Salvar plano
  const plan = await db.insert(continuousImprovementPlan).values({
    userId,
    objective,
    description: `Plano para melhorar ${targetMetric} de ${currentValue} para ${targetValue}`,
    targetMetric,
    currentValue: currentValue.toString() as any,
    targetValue: targetValue.toString() as any,
    plannedActions,
    startDate,
    targetDate,
    status: "planning",
  });

  return plan;
}

// ═══════════════════════════════════════════════════════════════
// ─── ANÁLISE DE EVOLUÇÃO ───
// ═══════════════════════════════════════════════════════════════

export async function analyzeEvolution(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Buscar métricas do período
  const metrics = await db
    .select()
    .from(performanceMetrics)
    .where(and(eq(performanceMetrics.userId, userId), gte(performanceMetrics.periodDate, startDate)))
    .orderBy(performanceMetrics.periodDate);

  if (metrics.length === 0) return null;

  // Calcular tendências
  const firstMetric = metrics[0];
  const lastMetric = metrics[metrics.length - 1];

  const successRateChange = parseFloat(lastMetric.successRate || "0") - parseFloat(firstMetric.successRate || "0");
  const engagementChange = lastMetric.totalEngagement - firstMetric.totalEngagement;
  const satisfactionChange = parseFloat(lastMetric.satisfactionScore || "0") - parseFloat(firstMetric.satisfactionScore || "0");

  return {
    period: `${days} dias`,
    metricsCount: metrics.length,
    successRateChange: successRateChange.toFixed(2),
    engagementChange,
    satisfactionChange: satisfactionChange.toFixed(2),
    trend: successRateChange > 0 ? "positive" : successRateChange < 0 ? "negative" : "stable",
    metrics,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── RELATÓRIO DIÁRIO ───
// ═══════════════════════════════════════════════════════════════

export async function generateDailyReport(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calcular métricas do dia
  const dailyMetrics = await calculateDailyMetrics(userId);

  // Buscar insights
  const insights = await db
    .select()
    .from(learningInsights)
    .where(eq(learningInsights.userId, userId))
    .orderBy(learningInsights.createdAt)
    .limit(5);

  // Buscar planos de melhoria
  const plans = await db
    .select()
    .from(continuousImprovementPlan)
    .where(eq(continuousImprovementPlan.userId, userId));

  return {
    date: new Date().toLocaleDateString("pt-BR"),
    metrics: dailyMetrics,
    insights: insights.map((i) => ({
      title: i.title,
      confidence: i.confidence,
      recommendations: i.recommendations,
    })),
    improvementPlans: plans.map((p) => ({
      objective: p.objective,
      progress: p.progressPercentage,
      status: p.status,
    })),
  };
}
