/**
 * Sistema de Análise de Satisfação
 * Coleta e analisa feedback do usuário sobre respostas
 */

export type FeedbackType = "positive" | "negative" | "neutral";

export interface FeedbackRecord {
  id: string;
  questionId: string;
  question: string;
  answer: string;
  feedbackType: FeedbackType;
  rating: number; // 1-5
  comment?: string;
  timestamp: Date;
  intent?: string;
  responseTime?: number; // em ms
}

export interface SatisfactionMetrics {
  totalResponses: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageRating: number;
  satisfactionRate: number; // 0-1
  trends: {
    byIntent: Record<string, number>;
    byHour: Record<number, number>;
    byDay: Record<string, number>;
  };
}

export class SatisfactionAnalyzer {
  private static feedbackHistory: FeedbackRecord[] = [];

  /**
   * Registrar feedback do usuário
   */
  static recordFeedback(feedback: Omit<FeedbackRecord, "id" | "timestamp">): FeedbackRecord {
    const record: FeedbackRecord = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.feedbackHistory.push(record);
    console.log(`Feedback registrado: ${record.feedbackType} (${record.rating}/5)`);

    return record;
  }

  /**
   * Calcular métricas de satisfação
   */
  static calculateMetrics(timeWindowHours: number = 24): SatisfactionMetrics {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindowHours * 60 * 60 * 1000);

    const recentFeedback = this.feedbackHistory.filter(
      (f) => f.timestamp >= cutoff
    );

    if (recentFeedback.length === 0) {
      return {
        totalResponses: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        averageRating: 0,
        satisfactionRate: 0,
        trends: {
          byIntent: {},
          byHour: {},
          byDay: {},
        },
      };
    }

    // Contar feedback por tipo
    const positiveCount = recentFeedback.filter(
      (f) => f.feedbackType === "positive"
    ).length;
    const negativeCount = recentFeedback.filter(
      (f) => f.feedbackType === "negative"
    ).length;
    const neutralCount = recentFeedback.filter(
      (f) => f.feedbackType === "neutral"
    ).length;

    // Calcular rating médio
    const averageRating =
      recentFeedback.reduce((sum, f) => sum + f.rating, 0) /
      recentFeedback.length;

    // Taxa de satisfação (positivos + neutros / total)
    const satisfactionRate =
      (positiveCount + neutralCount) / recentFeedback.length;

    // Tendências por intenção
    const byIntent: Record<string, number> = {};
    recentFeedback.forEach((f) => {
      if (f.intent) {
        byIntent[f.intent] = (byIntent[f.intent] || 0) + (f.feedbackType === "positive" ? 1 : 0);
      }
    });

    // Tendências por hora
    const byHour: Record<number, number> = {};
    recentFeedback.forEach((f) => {
      const hour = f.timestamp.getHours();
      byHour[hour] = (byHour[hour] || 0) + (f.feedbackType === "positive" ? 1 : 0);
    });

    // Tendências por dia
    const byDay: Record<string, number> = {};
    recentFeedback.forEach((f) => {
      const day = f.timestamp.toLocaleDateString("pt-BR");
      byDay[day] = (byDay[day] || 0) + (f.feedbackType === "positive" ? 1 : 0);
    });

    return {
      totalResponses: recentFeedback.length,
      positiveCount,
      negativeCount,
      neutralCount,
      averageRating,
      satisfactionRate,
      trends: {
        byIntent,
        byHour,
        byDay,
      },
    };
  }

  /**
   * Obter insights de satisfação
   */
  static getInsights(): string[] {
    const metrics = this.calculateMetrics();

    const insights: string[] = [];

    if (metrics.totalResponses === 0) {
      return ["Nenhum feedback coletado ainda"];
    }

    // Insight sobre taxa de satisfação
    if (metrics.satisfactionRate > 0.8) {
      insights.push("✅ Taxa de satisfação excelente (>80%)");
    } else if (metrics.satisfactionRate > 0.6) {
      insights.push("⚠️ Taxa de satisfação moderada (60-80%)");
    } else {
      insights.push("❌ Taxa de satisfação baixa (<60%)");
    }

    // Insight sobre rating médio
    if (metrics.averageRating > 4) {
      insights.push(`⭐ Rating médio excelente: ${metrics.averageRating.toFixed(1)}/5`);
    } else if (metrics.averageRating > 3) {
      insights.push(`⭐ Rating médio bom: ${metrics.averageRating.toFixed(1)}/5`);
    } else {
      insights.push(`⭐ Rating médio baixo: ${metrics.averageRating.toFixed(1)}/5`);
    }

    // Insight sobre intenções mais satisfeitas
    const bestIntent = Object.entries(metrics.trends.byIntent).sort(
      ([, a], [, b]) => b - a
    )[0];
    if (bestIntent) {
      insights.push(
        `🎯 Melhor desempenho em: ${bestIntent[0]} (${bestIntent[1]} positivos)`
      );
    }

    // Insight sobre horários
    const bestHour = Object.entries(metrics.trends.byHour).sort(
      ([, a], [, b]) => b - a
    )[0];
    if (bestHour) {
      insights.push(
        `🕐 Melhor desempenho às ${bestHour[0]}h (${bestHour[1]} positivos)`
      );
    }

    return insights;
  }

  /**
   * Gerar recomendação baseado em feedback
   */
  static generateRecommendation(): string {
    const metrics = this.calculateMetrics();

    if (metrics.totalResponses < 5) {
      return "Colete mais feedback para gerar recomendações";
    }

    if (metrics.satisfactionRate < 0.6) {
      return "Considere revisar a qualidade das respostas do assistente";
    }

    if (metrics.averageRating < 3) {
      return "Implemente melhorias na busca de dados e processamento de perguntas";
    }

    if (metrics.negativeCount > metrics.positiveCount) {
      return "Aumente o treinamento do modelo de reconhecimento de intenção";
    }

    return "Desempenho satisfatório! Continue monitorando o feedback";
  }

  /**
   * Obter histórico de feedback
   */
  static getFeedbackHistory(limit: number = 10): FeedbackRecord[] {
    return this.feedbackHistory.slice(-limit).reverse();
  }

  /**
   * Limpar feedback antigo (mais de X dias)
   */
  static clearOldFeedback(daysOld: number = 30): number {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const initialLength = this.feedbackHistory.length;

    this.feedbackHistory = this.feedbackHistory.filter(
      (f) => f.timestamp >= cutoff
    );

    const removed = initialLength - this.feedbackHistory.length;
    console.log(`Removido ${removed} registros de feedback antigos`);

    return removed;
  }
}
