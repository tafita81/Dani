/**
 * Sistema de Analytics de Conversão do Funil
 * Rastreamento detalhado de cada etapa com heatmaps e otimizações automáticas
 */

export interface FunnelStage {
  id: string;
  name: string;
  description: string;
  order: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeSpent: number; // em segundos
  usersEntered: number;
  usersConverted: number;
}

export interface FunnelMetrics {
  totalUsers: number;
  stageMetrics: FunnelStage[];
  overallConversionRate: number;
  bottlenecks: FunnelStage[];
  opportunities: FunnelStage[];
}

export interface HeatmapData {
  stageId: string;
  stageName: string;
  elementId: string;
  elementName: string;
  clicks: number;
  timeSpent: number;
  conversionRate: number;
  heatIntensity: "cold" | "warm" | "hot" | "very_hot";
}

export interface OptimizationRecommendation {
  stageId: string;
  stageName: string;
  issue: string;
  recommendation: string;
  estimatedImpact: number; // percentual de melhoria esperada
  priority: "low" | "medium" | "high";
  actionItems: string[];
}

/**
 * Define os estágios do funil viral
 */
export function defineFunnelStages(): FunnelStage[] {
  return [
    {
      id: "stage_1",
      name: "Descoberta",
      description: "Usuário descobre a marca (Instagram, Google, Referência)",
      order: 1,
      conversionRate: 0,
      dropoffRate: 0,
      avgTimeSpent: 45,
      usersEntered: 10000,
      usersConverted: 4500,
    },
    {
      id: "stage_2",
      name: "Engajamento",
      description: "Usuário interage com conteúdo (cliques, compartilhamentos)",
      order: 2,
      conversionRate: 45,
      dropoffRate: 55,
      avgTimeSpent: 120,
      usersEntered: 4500,
      usersConverted: 2700,
    },
    {
      id: "stage_3",
      name: "Consideração",
      description: "Usuário visualiza ofertas e avaliações",
      order: 3,
      conversionRate: 60,
      dropoffRate: 40,
      avgTimeSpent: 180,
      usersEntered: 2700,
      usersConverted: 1620,
    },
    {
      id: "stage_4",
      name: "Conversão",
      description: "Usuário agenda consulta ou se torna lead qualificado",
      order: 4,
      conversionRate: 60,
      dropoffRate: 40,
      avgTimeSpent: 90,
      usersEntered: 1620,
      usersConverted: 972,
    },
    {
      id: "stage_5",
      name: "Retenção",
      description: "Paciente retorna para nova consulta",
      order: 5,
      conversionRate: 65,
      dropoffRate: 35,
      avgTimeSpent: 300,
      usersEntered: 972,
      usersConverted: 632,
    },
  ];
}

/**
 * Calcula métricas do funil
 */
export function calculateFunnelMetrics(stages: FunnelStage[]): FunnelMetrics {
  const totalUsers = stages[0]?.usersEntered || 0;
  const finalConverted = stages[stages.length - 1]?.usersConverted || 0;
  const overallConversionRate = totalUsers > 0 ? (finalConverted / totalUsers) * 100 : 0;

  // Identificar gargalos (stages com dropoff > 50%)
  const bottlenecks = stages.filter((s) => s.dropoffRate > 50);

  // Identificar oportunidades (stages com taxa de conversão < 50%)
  const opportunities = stages.filter((s) => s.conversionRate < 50);

  return {
    totalUsers,
    stageMetrics: stages,
    overallConversionRate,
    bottlenecks,
    opportunities,
  };
}

/**
 * Gera dados de heatmap para visualização
 */
export function generateHeatmapData(stages: FunnelStage[]): HeatmapData[] {
  const heatmapData: HeatmapData[] = [];

  stages.forEach((stage) => {
    const conversionRate = (stage.usersConverted / stage.usersEntered) * 100;
    let heatIntensity: "cold" | "warm" | "hot" | "very_hot";

    if (conversionRate >= 70) heatIntensity = "very_hot";
    else if (conversionRate >= 50) heatIntensity = "hot";
    else if (conversionRate >= 30) heatIntensity = "warm";
    else heatIntensity = "cold";

    heatmapData.push({
      stageId: stage.id,
      stageName: stage.name,
      elementId: `element_${stage.id}`,
      elementName: `${stage.name} - CTA Principal`,
      clicks: stage.usersEntered,
      timeSpent: stage.avgTimeSpent,
      conversionRate,
      heatIntensity,
    });
  });

  return heatmapData;
}

/**
 * Identifica gargalos no funil
 */
export function identifyBottlenecks(stages: FunnelStage[]): FunnelStage[] {
  return stages
    .filter((stage) => stage.dropoffRate > 50)
    .sort((a, b) => b.dropoffRate - a.dropoffRate);
}

/**
 * Gera recomendações de otimização
 */
export function generateOptimizationRecommendations(
  stages: FunnelStage[]
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  stages.forEach((stage) => {
    if (stage.dropoffRate > 50) {
      const estimatedImpact = Math.min(stage.dropoffRate * 0.3, 30); // Até 30% de melhoria

      recommendations.push({
        stageId: stage.id,
        stageName: stage.name,
        issue: `Alto abandono nesta etapa (${stage.dropoffRate.toFixed(1)}%)`,
        recommendation: `Otimizar ${stage.name.toLowerCase()} para melhorar taxa de conversão`,
        estimatedImpact,
        priority: stage.dropoffRate > 70 ? "high" : "medium",
        actionItems: [
          `Simplificar fluxo de ${stage.name.toLowerCase()}`,
          `Melhorar copywriting e CTAs`,
          `Adicionar prova social (avaliações, testimoniais)`,
          `Testar diferentes variações de layout`,
          `Implementar chat ao vivo para suporte`,
        ],
      });
    }

    if (stage.avgTimeSpent > 300) {
      recommendations.push({
        stageId: stage.id,
        stageName: stage.name,
        issue: `Tempo médio muito alto (${stage.avgTimeSpent}s)`,
        recommendation: `Reduzir complexidade e tempo necessário`,
        estimatedImpact: 15,
        priority: "medium",
        actionItems: [
          `Dividir em etapas menores`,
          `Adicionar indicador de progresso`,
          `Simplificar formulários`,
          `Implementar salvamento automático`,
        ],
      });
    }
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Calcula impacto de otimizações
 */
export function calculateOptimizationImpact(
  currentMetrics: FunnelMetrics,
  recommendations: OptimizationRecommendation[]
): {
  currentConversion: number;
  projectedConversion: number;
  potentialGain: number;
  additionalLeads: number;
} {
  const currentConversion = currentMetrics.overallConversionRate;

  // Somar impactos de todas as recomendações
  const totalImpact = recommendations.reduce((sum, rec) => sum + rec.estimatedImpact, 0);

  const projectedConversion = Math.min(currentConversion + totalImpact, 100);
  const potentialGain = projectedConversion - currentConversion;

  // Calcular leads adicionais (assumindo 10k usuários no topo do funil)
  const additionalLeads = Math.round(
    (currentMetrics.totalUsers * potentialGain) / 100
  );

  return {
    currentConversion,
    projectedConversion,
    potentialGain,
    additionalLeads,
  };
}

/**
 * Gera relatório completo de analytics
 */
export function generateFunnelAnalyticsReport(stages: FunnelStage[]): {
  metrics: FunnelMetrics;
  heatmap: HeatmapData[];
  bottlenecks: FunnelStage[];
  recommendations: OptimizationRecommendation[];
  impact: ReturnType<typeof calculateOptimizationImpact>;
} {
  const metrics = calculateFunnelMetrics(stages);
  const heatmap = generateHeatmapData(stages);
  const bottlenecks = identifyBottlenecks(stages);
  const recommendations = generateOptimizationRecommendations(stages);
  const impact = calculateOptimizationImpact(metrics, recommendations);

  return {
    metrics,
    heatmap,
    bottlenecks,
    recommendations,
    impact,
  };
}

/**
 * Simula impacto de mudanças no funil
 */
export function simulateFunnelOptimization(
  stages: FunnelStage[],
  stageId: string,
  conversionRateIncrease: number
): FunnelMetrics {
  const updatedStages = stages.map((stage) => {
    if (stage.id === stageId) {
      const newConversionRate = Math.min(stage.conversionRate + conversionRateIncrease, 100);
      const newDropoffRate = 100 - newConversionRate;
      const newConverted = Math.round((stage.usersEntered * newConversionRate) / 100);

      return {
        ...stage,
        conversionRate: newConversionRate,
        dropoffRate: newDropoffRate,
        usersConverted: newConverted,
      };
    }
    return stage;
  });

  return calculateFunnelMetrics(updatedStages);
}

/**
 * Exporta dados de analytics em formato CSV
 */
export function exportFunnelAnalyticsCSV(report: ReturnType<typeof generateFunnelAnalyticsReport>): string {
  const lines: string[] = [];

  // Header
  lines.push("Estágio,Usuários Entrantes,Usuários Convertidos,Taxa de Conversão,Taxa de Abandono");

  // Dados dos estágios
  report.metrics.stageMetrics.forEach((stage) => {
    lines.push(
      `${stage.name},${stage.usersEntered},${stage.usersConverted},${stage.conversionRate.toFixed(1)}%,${stage.dropoffRate.toFixed(1)}%`
    );
  });

  lines.push("");
  lines.push("Recomendações de Otimização");
  lines.push("Estágio,Problema,Recomendação,Impacto Estimado,Prioridade");

  report.recommendations.forEach((rec) => {
    lines.push(
      `${rec.stageName},"${rec.issue}","${rec.recommendation}",${rec.estimatedImpact.toFixed(1)}%,${rec.priority}`
    );
  });

  return lines.join("\n");
}
