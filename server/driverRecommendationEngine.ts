/**
 * Motor de Recomendações Inteligentes para Assistente Carro
 * Gera recomendações baseadas no contexto das conversas
 */

export type RecommendationType = 
  | "wellness_tip"
  | "breathing_exercise"
  | "meditation"
  | "mindfulness"
  | "stress_relief"
  | "motivation"
  | "educational";

interface Recommendation {
  type: RecommendationType;
  text: string;
  category: string;
  duration?: number; // em segundos
}

// Banco de recomendações por tópico
const RECOMMENDATIONS_BY_TOPIC: Record<string, Recommendation[]> = {
  saúde: [
    {
      type: "wellness_tip",
      text: "Lembre-se de manter uma boa postura ao dirigir. Isso ajuda a prevenir dores nas costas e no pescoço.",
      category: "bem-estar",
    },
    {
      type: "wellness_tip",
      text: "Faça pequenas pausas a cada 2 horas de direção. Saia do carro, estique os músculos e respire ar fresco.",
      category: "bem-estar",
    },
    {
      type: "wellness_tip",
      text: "Mantenha-se hidratado enquanto dirige. Beba água regularmente para manter o foco e a energia.",
      category: "bem-estar",
    },
  ],
  "bem-estar": [
    {
      type: "breathing_exercise",
      text: "Tente a técnica de respiração 4-7-8: Inspire por 4 segundos, segure por 7, expire por 8. Isso reduz o estresse.",
      category: "mindfulness",
      duration: 60,
    },
    {
      type: "mindfulness",
      text: "Pratique a atenção plena enquanto dirige. Foque nos sons ao seu redor, na sensação do volante, no caminho.",
      category: "mindfulness",
    },
    {
      type: "stress_relief",
      text: "Coloque sua música favorita para relaxar durante o trajeto. A música é uma ótima ferramenta para reduzir o estresse.",
      category: "bem-estar",
    },
  ],
  psicologia: [
    {
      type: "educational",
      text: "Sabia que a psicologia cognitivo-comportamental pode ajudar a gerenciar pensamentos negativos? Tente identificar padrões de pensamento.",
      category: "educação",
    },
    {
      type: "motivation",
      text: "Você é mais forte do que pensa. Cada desafio é uma oportunidade de crescimento pessoal.",
      category: "motivação",
    },
    {
      type: "educational",
      text: "A inteligência emocional é a capacidade de reconhecer e gerenciar suas emoções. Pratique isso diariamente.",
      category: "educação",
    },
  ],
  ansiedade: [
    {
      type: "breathing_exercise",
      text: "Quando sentir ansiedade, faça respirações profundas. Inspire lentamente pelo nariz, expire pela boca.",
      category: "alívio",
      duration: 120,
    },
    {
      type: "stress_relief",
      text: "Técnica do grounding: Identifique 5 coisas que você vê, 4 que você toca, 3 que ouve, 2 que cheira, 1 que sente.",
      category: "alívio",
    },
    {
      type: "meditation",
      text: "Medite por 5 minutos. Feche os olhos (quando seguro), foque na respiração e deixe os pensamentos passarem.",
      category: "mindfulness",
      duration: 300,
    },
  ],
  relacionamentos: [
    {
      type: "educational",
      text: "Comunicação é a chave para relacionamentos saudáveis. Sempre expresse seus sentimentos de forma clara e respeitosa.",
      category: "educação",
    },
    {
      type: "motivation",
      text: "Relacionamentos requerem empatia e compreensão. Tente sempre ver o ponto de vista do outro.",
      category: "motivação",
    },
  ],
  produtividade: [
    {
      type: "motivation",
      text: "Divida suas tarefas em pequenos passos. Isso torna tudo mais gerenciável e aumenta a motivação.",
      category: "motivação",
    },
    {
      type: "wellness_tip",
      text: "Faça pausas regulares. Estudos mostram que pausas melhoram a concentração e a produtividade.",
      category: "bem-estar",
    },
    {
      type: "educational",
      text: "A técnica Pomodoro (25 min trabalho + 5 min pausa) é excelente para manter o foco.",
      category: "educação",
    },
  ],
  sono: [
    {
      type: "wellness_tip",
      text: "Mantenha uma rotina consistente de sono. Vá para a cama e acorde no mesmo horário todos os dias.",
      category: "bem-estar",
    },
    {
      type: "meditation",
      text: "Antes de dormir, faça uma meditação de relaxamento. Isso ajuda a acalmar a mente.",
      category: "mindfulness",
      duration: 600,
    },
    {
      type: "breathing_exercise",
      text: "Técnica 4-7-8 é ótima para dormir. Inspire por 4, segure por 7, expire por 8 segundos.",
      category: "alívio",
      duration: 120,
    },
  ],
};

/**
 * Gerar recomendação baseada em tópico
 */
export function generateRecommendationByTopic(topic: string): Recommendation | null {
  const topicLower = topic.toLowerCase();
  const recommendations = RECOMMENDATIONS_BY_TOPIC[topicLower];

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Selecionar recomendação aleatória
  return recommendations[Math.floor(Math.random() * recommendations.length)];
}

/**
 * Gerar recomendação baseada em frequência de tópicos
 */
export function generateRecommendationByFrequency(
  topicStats: Array<{ topic: string; count: number; percentage: number }>
): Recommendation | null {
  if (topicStats.length === 0) {
    return null;
  }

  // Pegar tópico mais frequente
  const topTopic = topicStats[0];

  // Se o tópico representa mais de 30% das perguntas, dar recomendação relacionada
  if (topTopic.percentage > 30) {
    return generateRecommendationByTopic(topTopic.topic);
  }

  // Caso contrário, selecionar aleatoriamente entre os 3 principais
  const topThree = topicStats.slice(0, 3);
  const randomTopic = topThree[Math.floor(Math.random() * topThree.length)];

  return generateRecommendationByTopic(randomTopic.topic);
}

/**
 * Gerar recomendação contextual baseada em pergunta
 */
export function generateContextualRecommendation(question: string): Recommendation | null {
  const lowerQuestion = question.toLowerCase();

  // Detectar palavras-chave e gerar recomendação apropriada
  if (
    lowerQuestion.includes("estresse") ||
    lowerQuestion.includes("ansiedade") ||
    lowerQuestion.includes("preocupação")
  ) {
    return generateRecommendationByTopic("ansiedade");
  }

  if (
    lowerQuestion.includes("dormir") ||
    lowerQuestion.includes("insônia") ||
    lowerQuestion.includes("cansado")
  ) {
    return generateRecommendationByTopic("sono");
  }

  if (
    lowerQuestion.includes("relacionamento") ||
    lowerQuestion.includes("comunicação") ||
    lowerQuestion.includes("conflito")
  ) {
    return generateRecommendationByTopic("relacionamentos");
  }

  if (
    lowerQuestion.includes("produtivo") ||
    lowerQuestion.includes("foco") ||
    lowerQuestion.includes("concentração")
  ) {
    return generateRecommendationByTopic("produtividade");
  }

  if (
    lowerQuestion.includes("saúde") ||
    lowerQuestion.includes("exercício") ||
    lowerQuestion.includes("dieta")
  ) {
    return generateRecommendationByTopic("saúde");
  }

  return null;
}

/**
 * Formatar recomendação para exibição
 */
export function formatRecommendation(recommendation: Recommendation): string {
  const typeEmoji = {
    wellness_tip: "💡",
    breathing_exercise: "🫁",
    meditation: "🧘",
    mindfulness: "🧠",
    stress_relief: "😌",
    motivation: "💪",
    educational: "📚",
  };

  const emoji = typeEmoji[recommendation.type];
  let formatted = `${emoji} ${recommendation.text}`;

  if (recommendation.duration) {
    const minutes = Math.ceil(recommendation.duration / 60);
    formatted += ` (${minutes} minutos)`;
  }

  return formatted;
}

/**
 * Obter todas as recomendações disponíveis
 */
export function getAllRecommendations(): Record<string, Recommendation[]> {
  return RECOMMENDATIONS_BY_TOPIC;
}

/**
 * Obter tópicos disponíveis
 */
export function getAvailableTopics(): string[] {
  return Object.keys(RECOMMENDATIONS_BY_TOPIC);
}
