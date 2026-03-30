/**
 * Serviço de Avaliações e Feedback de Pacientes
 * Gerencia avaliações pós-sessão e análise de satisfação
 */

export interface SessionFeedback {
  id: string;
  appointmentId: string;
  patientId: string;
  therapistId: string;
  rating: number; // 1-5
  comment: string;
  categories: {
    communication: number;
    effectiveness: number;
    environment: number;
    professionalism: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // 1: count, 2: count, etc.
  };
  categoryAverages: {
    communication: number;
    effectiveness: number;
    environment: number;
    professionalism: number;
  };
  trend: "improving" | "stable" | "declining";
  topComments: string[];
  improvementAreas: string[];
}

/**
 * Calcula análise agregada de feedback
 */
export function calculateFeedbackAnalytics(feedbacks: SessionFeedback[]): FeedbackAnalytics {
  if (feedbacks.length === 0) {
    return {
      totalFeedback: 0,
      averageRating: 0,
      ratingDistribution: {},
      categoryAverages: {
        communication: 0,
        effectiveness: 0,
        environment: 0,
        professionalism: 0,
      },
      trend: "stable",
      topComments: [],
      improvementAreas: [],
    };
  }

  // Distribuição de ratings
  const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  // Médias de categorias
  let communicationSum = 0;
  let effectivenessSum = 0;
  let environmentSum = 0;
  let professionalismSum = 0;

  feedbacks.forEach((feedback) => {
    ratingDistribution[feedback.rating]++;
    totalRating += feedback.rating;

    communicationSum += feedback.categories.communication;
    effectivenessSum += feedback.categories.effectiveness;
    environmentSum += feedback.categories.environment;
    professionalismSum += feedback.categories.professionalism;
  });

  const averageRating = totalRating / feedbacks.length;

  // Tendência (comparar últimas 10 com anteriores)
  const recentFeedbacks = feedbacks.slice(-10);
  const olderFeedbacks = feedbacks.slice(0, -10);

  const recentAverage =
    recentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / recentFeedbacks.length;
  const olderAverage =
    olderFeedbacks.length > 0
      ? olderFeedbacks.reduce((sum, f) => sum + f.rating, 0) / olderFeedbacks.length
      : recentAverage;

  let trend: "improving" | "stable" | "declining" = "stable";
  if (recentAverage > olderAverage + 0.3) trend = "improving";
  if (recentAverage < olderAverage - 0.3) trend = "declining";

  // Comentários principais
  const comments = feedbacks
    .filter((f) => f.comment && f.comment.length > 0)
    .map((f) => f.comment)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  // Áreas de melhoria (categorias com menor pontuação)
  const categoryAverages = {
    communication: communicationSum / feedbacks.length,
    effectiveness: effectivenessSum / feedbacks.length,
    environment: environmentSum / feedbacks.length,
    professionalism: professionalismSum / feedbacks.length,
  };

  const improvementAreas = Object.entries(categoryAverages)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([category]) => {
      const categoryNames: { [key: string]: string } = {
        communication: "Comunicação",
        effectiveness: "Efetividade",
        environment: "Ambiente",
        professionalism: "Profissionalismo",
      };
      return categoryNames[category] || category;
    });

  return {
    totalFeedback: feedbacks.length,
    averageRating,
    ratingDistribution,
    categoryAverages,
    trend,
    topComments: comments,
    improvementAreas,
  };
}

/**
 * Gera mensagem de feedback humanizada
 */
export function generateFeedbackMessage(rating: number): string {
  const messages: { [key: number]: string[] } = {
    1: [
      "Desculpe ouvir isso. Gostaríamos de melhorar. Pode nos contar mais sobre sua experiência?",
      "Sentimos muito que a sessão não atendeu suas expectativas. Sua opinião é valiosa para nós.",
      "Agradecemos o feedback. Vamos trabalhar para oferecer uma melhor experiência.",
    ],
    2: [
      "Obrigada pelo feedback. Há espaço para melhorias e vamos trabalhar nisso.",
      "Valorizamos sua honestidade. Queremos oferecer um serviço melhor.",
      "Entendemos. Vamos revisar nossa abordagem para próximas sessões.",
    ],
    3: [
      "Obrigada pela avaliação! Continuaremos melhorando.",
      "Valorizamos seu feedback. Estamos sempre buscando evoluir.",
      "Agradeço a avaliação. Há sempre espaço para crescimento.",
    ],
    4: [
      "Que bom saber que você aproveitou a sessão! 😊",
      "Obrigada pelo feedback positivo! Continuaremos nesse caminho.",
      "Fico feliz que tenha sido uma boa experiência!",
    ],
    5: [
      "Que alegria! Obrigada por essa avaliação incrível! 💙",
      "Muito obrigada! Seu feedback nos motiva a continuar assim.",
      "Fico imensamente feliz! Obrigada por confiar em mim.",
    ],
  };

  const messageList = messages[rating] || messages[3];
  return messageList[Math.floor(Math.random() * messageList.length)];
}

/**
 * Determina recomendação baseada em feedback
 */
export function getRecommendation(analytics: FeedbackAnalytics): string {
  if (analytics.averageRating >= 4.5) {
    return "Excelente desempenho! Continue com a abordagem atual.";
  }

  if (analytics.averageRating >= 4) {
    return "Bom desempenho. Considere focar nas áreas de melhoria identificadas.";
  }

  if (analytics.averageRating >= 3) {
    return "Desempenho aceitável. Recomenda-se revisar a abordagem terapêutica.";
  }

  return "Desempenho abaixo do esperado. Considere buscar supervisão ou treinamento.";
}

/**
 * Valida dados de feedback
 */
export function validateFeedback(feedback: Partial<SessionFeedback>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!feedback.appointmentId) {
    errors.push("ID do agendamento é obrigatório");
  }

  if (!feedback.patientId) {
    errors.push("ID do paciente é obrigatório");
  }

  if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
    errors.push("Rating deve estar entre 1 e 5");
  }

  if (!feedback.categories) {
    errors.push("Categorias são obrigatórias");
  } else {
    const { communication, effectiveness, environment, professionalism } = feedback.categories;

    if (!communication || communication < 1 || communication > 5) {
      errors.push("Communication deve estar entre 1 e 5");
    }

    if (!effectiveness || effectiveness < 1 || effectiveness > 5) {
      errors.push("Effectiveness deve estar entre 1 e 5");
    }

    if (!environment || environment < 1 || environment > 5) {
      errors.push("Environment deve estar entre 1 e 5");
    }

    if (!professionalism || professionalism < 1 || professionalism > 5) {
      errors.push("Professionalism deve estar entre 1 e 5");
    }
  }

  if (feedback.comment && feedback.comment.length > 500) {
    errors.push("Comentário não pode exceder 500 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gera relatório de feedback em texto
 */
export function generateFeedbackReport(analytics: FeedbackAnalytics): string {
  const lines: string[] = [
    "=== RELATÓRIO DE FEEDBACK ===",
    "",
    `Total de Avaliações: ${analytics.totalFeedback}`,
    `Avaliação Média: ${analytics.averageRating.toFixed(2)}/5.0`,
    `Tendência: ${getTrendLabel(analytics.trend)}`,
    "",
    "Distribuição de Ratings:",
  ];

  for (let i = 5; i >= 1; i--) {
    const count = analytics.ratingDistribution[i] || 0;
    const percentage = ((count / analytics.totalFeedback) * 100).toFixed(1);
    const stars = "⭐".repeat(i);
    lines.push(`  ${stars} (${i}): ${count} (${percentage}%)`);
  }

  lines.push("");
  lines.push("Avaliação por Categoria:");
  lines.push(`  • Comunicação: ${analytics.categoryAverages.communication.toFixed(2)}/5`);
  lines.push(`  • Efetividade: ${analytics.categoryAverages.effectiveness.toFixed(2)}/5`);
  lines.push(`  • Ambiente: ${analytics.categoryAverages.environment.toFixed(2)}/5`);
  lines.push(`  • Profissionalismo: ${analytics.categoryAverages.professionalism.toFixed(2)}/5`);

  if (analytics.improvementAreas.length > 0) {
    lines.push("");
    lines.push("Áreas de Melhoria:");
    analytics.improvementAreas.forEach((area) => {
      lines.push(`  • ${area}`);
    });
  }

  if (analytics.topComments.length > 0) {
    lines.push("");
    lines.push("Comentários Destacados:");
    analytics.topComments.forEach((comment) => {
      lines.push(`  • "${comment}"`);
    });
  }

  lines.push("");
  lines.push(`Recomendação: ${getRecommendation(analytics)}`);

  return lines.join("\n");
}

/**
 * Obtém label de tendência
 */
function getTrendLabel(trend: string): string {
  const labels: { [key: string]: string } = {
    improving: "📈 Melhorando",
    stable: "→ Estável",
    declining: "📉 Piorando",
  };
  return labels[trend] || trend;
}
