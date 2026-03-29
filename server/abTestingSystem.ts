/**
 * Sistema de A/B Testing para Otimização do Funil
 * Testa variações de landing pages, CTAs e copywriting com rastreamento automático
 */

export interface ABTestVariant {
  id: string;
  testId: string;
  name: string;
  type: "control" | "variant";
  description: string;
  changes: {
    headline?: string;
    cta?: string;
    color?: string;
    layout?: string;
    copywriting?: string;
  };
}

export interface ABTest {
  id: string;
  name: string;
  stage: "discovery" | "engagement" | "consideration" | "conversion" | "retention";
  description: string;
  variants: ABTestVariant[];
  startDate: Date;
  endDate?: Date;
  status: "active" | "paused" | "completed" | "archived";
  hypothesis: string;
  successMetric: string;
  minSampleSize: number;
  confidenceLevel: number; // 0.90, 0.95, 0.99
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  variantName: string;
  totalVisitors: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  revenuePerVisitor?: number;
  confidence?: number;
  winner?: boolean;
}

export interface ABTestStatistics {
  testId: string;
  startDate: Date;
  endDate?: Date;
  duration: number; // em dias
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  variants: ABTestResult[];
  winner?: {
    variantId: string;
    variantName: string;
    improvement: number;
    confidence: number;
  };
  recommendation: string;
}

/**
 * Cria novo teste A/B
 */
export async function createABTest(test: Omit<ABTest, "id">): Promise<ABTest | null> {
  try {
    const newTest: ABTest = {
      ...test,
      id: `test_${Date.now()}`,
    };

    console.log("Criando novo teste A/B:", newTest.name);
    return newTest;
  } catch (error) {
    console.error("Erro ao criar teste:", error);
    return null;
  }
}

/**
 * Distribui usuários entre variantes (random assignment)
 */
export function assignVariant(testId: string, userId: string, variants: ABTestVariant[]): ABTestVariant {
  // Usar hash do userId para garantir consistência
  const hash = userId
    .split("")
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  const index = Math.abs(hash) % variants.length;

  return variants[index];
}

/**
 * Registra conversão em teste A/B
 */
export async function recordABTestConversion(
  testId: string,
  variantId: string,
  userId: string,
  conversionValue?: number
): Promise<boolean> {
  try {
    console.log(`Registrando conversão: teste=${testId}, variante=${variantId}, usuário=${userId}`);

    // Aqui seria feita uma chamada ao banco de dados
    return true;
  } catch (error) {
    console.error("Erro ao registrar conversão:", error);
    return false;
  }
}

/**
 * Calcula estatísticas do teste
 */
export async function calculateABTestStatistics(testId: string): Promise<ABTestStatistics | null> {
  try {
    // Dados simulados para demonstração
    const stats: ABTestStatistics = {
      testId,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      duration: 7,
      totalVisitors: 10000,
      totalConversions: 600,
      overallConversionRate: 6.0,
      variants: [
        {
          testId,
          variantId: "control",
          variantName: "Control (Original)",
          totalVisitors: 5000,
          conversions: 280,
          conversionRate: 5.6,
          revenue: 14000,
          revenuePerVisitor: 2.8,
          confidence: 0.85,
          winner: false,
        },
        {
          testId,
          variantId: "variant_1",
          variantName: "Headline Alternativo",
          totalVisitors: 5000,
          conversions: 320,
          conversionRate: 6.4,
          revenue: 16000,
          revenuePerVisitor: 3.2,
          confidence: 0.92,
          winner: true,
        },
      ],
      winner: {
        variantId: "variant_1",
        variantName: "Headline Alternativo",
        improvement: 14.3,
        confidence: 0.92,
      },
      recommendation:
        "Implementar variante vencedora em 100% do tráfego. Melhoria de 14.3% na taxa de conversão com 92% de confiança.",
    };

    return stats;
  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error);
    return null;
  }
}

/**
 * Realiza teste estatístico (Chi-Square)
 */
export function performChiSquareTest(
  controlConversions: number,
  controlVisitors: number,
  variantConversions: number,
  variantVisitors: number
): {
  pValue: number;
  isSignificant: boolean;
  confidence: number;
} {
  // Implementação simplificada do teste Chi-Square
  const controlRate = controlConversions / controlVisitors;
  const variantRate = variantConversions / variantVisitors;

  const pooledRate = (controlConversions + variantConversions) / (controlVisitors + variantVisitors);

  const se = Math.sqrt(
    pooledRate * (1 - pooledRate) * (1 / controlVisitors + 1 / variantVisitors)
  );

  const zScore = (variantRate - controlRate) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  return {
    pValue,
    isSignificant: pValue < 0.05,
    confidence: 1 - pValue,
  };
}

/**
 * Função auxiliar: CDF da distribuição normal
 */
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calcula tamanho de amostra necessário
 */
export function calculateSampleSize(
  baselineConversionRate: number,
  minDetectableEffect: number,
  confidenceLevel: number = 0.95,
  statisticalPower: number = 0.8
): number {
  // Usando fórmula simplificada
  const zAlpha = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
  const zBeta = statisticalPower === 0.8 ? 0.84 : 1.28;

  const p1 = baselineConversionRate;
  const p2 = baselineConversionRate * (1 + minDetectableEffect);

  const sampleSize = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / Math.pow(p2 - p1, 2);

  return Math.ceil(sampleSize);
}

/**
 * Recomenda quando parar o teste
 */
export function shouldStopTest(
  stats: ABTestStatistics,
  minSampleSize: number,
  confidenceThreshold: number = 0.95
): {
  shouldStop: boolean;
  reason: string;
  recommendation: string;
} {
  if (!stats.winner) {
    return {
      shouldStop: false,
      reason: "Nenhum vencedor detectado ainda",
      recommendation: "Continue coletando dados",
    };
  }

  const variantStats = stats.variants.find((v) => v.variantId === stats.winner?.variantId);

  if (!variantStats) {
    return {
      shouldStop: false,
      reason: "Dados incompletos",
      recommendation: "Continue coletando dados",
    };
  }

  const hasMinSample = stats.totalVisitors >= minSampleSize;
  const hasConfidence = (variantStats.confidence || 0) >= confidenceThreshold;

  if (hasMinSample && hasConfidence) {
    return {
      shouldStop: true,
      reason: `Teste atingiu significância estatística (${(stats.winner.confidence * 100).toFixed(1)}% confiança)`,
      recommendation: `Implementar variante vencedora: ${stats.winner.variantName}`,
    };
  }

  const remainingSample = minSampleSize - stats.totalVisitors;
  return {
    shouldStop: false,
    reason: `Amostra insuficiente (${stats.totalVisitors}/${minSampleSize})`,
    recommendation: `Continue coletando dados. Faltam ~${remainingSample} visitantes.`,
  };
}

/**
 * Gera relatório do teste
 */
export async function generateABTestReport(testId: string): Promise<string> {
  try {
    const stats = await calculateABTestStatistics(testId);

    if (!stats) {
      return "Erro ao gerar relatório";
    }

    let report = `# Relatório de Teste A/B: ${testId}\n\n`;
    report += `**Período:** ${stats.startDate.toLocaleDateString()} - ${stats.endDate?.toLocaleDateString() || "Em andamento"}\n`;
    report += `**Duração:** ${stats.duration} dias\n\n`;

    report += `## Resumo\n`;
    report += `- Total de Visitantes: ${stats.totalVisitors.toLocaleString()}\n`;
    report += `- Total de Conversões: ${stats.totalConversions.toLocaleString()}\n`;
    report += `- Taxa de Conversão Geral: ${stats.overallConversionRate.toFixed(2)}%\n\n`;

    report += `## Resultados por Variante\n`;
    stats.variants.forEach((v) => {
      report += `### ${v.variantName}\n`;
      report += `- Visitantes: ${v.totalVisitors.toLocaleString()}\n`;
      report += `- Conversões: ${v.conversions.toLocaleString()}\n`;
      report += `- Taxa de Conversão: ${v.conversionRate.toFixed(2)}%\n`;
      if (v.revenue) report += `- Receita: R$ ${v.revenue.toLocaleString()}\n`;
      if (v.confidence) report += `- Confiança: ${(v.confidence * 100).toFixed(1)}%\n`;
      if (v.winner) report += `- **VENCEDOR**\n`;
      report += "\n";
    });

    if (stats.winner) {
      report += `## Conclusão\n`;
      report += `Variante vencedora: **${stats.winner.variantName}**\n`;
      report += `Melhoria: **${stats.winner.improvement.toFixed(1)}%**\n`;
      report += `Confiança: **${(stats.winner.confidence * 100).toFixed(1)}%**\n\n`;
      report += `## Recomendação\n`;
      report += stats.recommendation;
    }

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}

/**
 * Exporta resultados em CSV
 */
export function exportABTestResultsCSV(stats: ABTestStatistics): string {
  let csv = "Variante,Visitantes,Conversões,Taxa de Conversão,Receita,Confiança,Vencedor\n";

  stats.variants.forEach((v) => {
    csv += `${v.variantName},${v.totalVisitors},${v.conversions},${v.conversionRate.toFixed(2)}%,${v.revenue || "N/A"},${((v.confidence || 0) * 100).toFixed(1)}%,${v.winner ? "Sim" : "Não"}\n`;
  });

  return csv;
}
