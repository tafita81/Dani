/**
 * Analisador de Sentimento para Perguntas do Usuário
 * Detecta emoção e adapta tom da resposta
 */

export type SentimentType = "positive" | "neutral" | "negative" | "urgent";

interface SentimentAnalysis {
  sentiment: SentimentType;
  score: number; // -1 a 1
  keywords: string[];
  urgency: number; // 0 a 1
  tone: "empathetic" | "professional" | "supportive" | "urgent";
}

// Palavras-chave para cada sentimento
const SENTIMENT_KEYWORDS = {
  positive: [
    "ótimo",
    "maravilhoso",
    "excelente",
    "feliz",
    "alegre",
    "melhor",
    "adorei",
    "perfeito",
    "incrível",
    "legal",
  ],
  negative: [
    "péssimo",
    "horrível",
    "ruim",
    "triste",
    "deprimido",
    "ansioso",
    "assustado",
    "frustrado",
    "irritado",
    "desesperado",
  ],
  urgent: [
    "emergência",
    "urgente",
    "risco",
    "perigo",
    "crise",
    "suicida",
    "morte",
    "grave",
    "crítico",
    "imediato",
  ],
};

/**
 * Analisar sentimento de uma pergunta
 */
export function analyzeSentiment(question: string): SentimentAnalysis {
  const lowerQuestion = question.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  let urgencyCount = 0;
  const foundKeywords: string[] = [];

  // Contar palavras-chave positivas
  for (const keyword of SENTIMENT_KEYWORDS.positive) {
    if (lowerQuestion.includes(keyword)) {
      positiveCount++;
      foundKeywords.push(keyword);
    }
  }

  // Contar palavras-chave negativas
  for (const keyword of SENTIMENT_KEYWORDS.negative) {
    if (lowerQuestion.includes(keyword)) {
      negativeCount++;
      foundKeywords.push(keyword);
    }
  }

  // Contar palavras-chave de urgência
  for (const keyword of SENTIMENT_KEYWORDS.urgent) {
    if (lowerQuestion.includes(keyword)) {
      urgencyCount++;
      foundKeywords.push(keyword);
    }
  }

  // Detectar pontos de exclamação e interrogação
  const exclamationCount = (question.match(/!/g) || []).length;
  const questionMarkCount = (question.match(/\?/g) || []).length;

  // Calcular score de sentimento (-1 a 1)
  let sentimentScore = 0;
  if (positiveCount > 0 || negativeCount > 0) {
    sentimentScore = (positiveCount - negativeCount) / (positiveCount + negativeCount);
  }

  // Ajustar por pontuação
  if (exclamationCount > 2) sentimentScore += 0.2;
  if (questionMarkCount > 3) sentimentScore -= 0.1;

  // Limitar score entre -1 e 1
  sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

  // Determinar tipo de sentimento
  let sentiment: SentimentType = "neutral";
  if (urgencyCount > 0) {
    sentiment = "urgent";
  } else if (sentimentScore > 0.3) {
    sentiment = "positive";
  } else if (sentimentScore < -0.3) {
    sentiment = "negative";
  }

  // Calcular urgência (0 a 1)
  const urgency = Math.min(1, urgencyCount * 0.5);

  // Determinar tom da resposta
  let tone: "empathetic" | "professional" | "supportive" | "urgent" = "professional";
  if (sentiment === "urgent") {
    tone = "urgent";
  } else if (sentiment === "negative") {
    tone = "empathetic";
  } else if (sentiment === "positive") {
    tone = "supportive";
  }

  return {
    sentiment,
    score: sentimentScore,
    keywords: foundKeywords,
    urgency,
    tone,
  };
}

/**
 * Adaptar resposta baseado em sentimento
 */
export function adaptResponseToSentiment(
  baseResponse: string,
  analysis: SentimentAnalysis
): string {
  let adaptedResponse = baseResponse;

  // Prefixos empáticos
  const empatheticPrefixes = [
    "Entendo sua preocupação. ",
    "Vejo que você está passando por um momento difícil. ",
    "Reconheço suas dificuldades. ",
  ];

  // Prefixos de suporte
  const supportivePrefixes = [
    "Que bom saber disso! ",
    "Fico feliz em ajudar. ",
    "Vamos trabalhar nisso juntos. ",
  ];

  // Prefixos urgentes
  const urgentPrefixes = [
    "⚠️ SITUAÇÃO URGENTE: ",
    "🚨 ATENÇÃO: ",
    "PRIORIDADE: ",
  ];

  // Sufixos empáticos
  const empatheticSuffixes = [
    " Estou aqui para ajudar.",
    " Vamos encontrar uma solução juntos.",
    " Você não está sozinho nisto.",
  ];

  // Sufixos de suporte
  const supportiveSuffixes = [
    " Continue assim!",
    " Que progresso maravilhoso!",
    " Você está no caminho certo!",
  ];

  // Sufixos urgentes
  const urgentSuffixes = [
    " Por favor, procure ajuda profissional imediatamente.",
    " Isso requer atenção urgente.",
    " Contate um profissional de saúde mental agora.",
  ];

  // Aplicar adaptações
  if (analysis.tone === "empathetic") {
    const prefix = empatheticPrefixes[Math.floor(Math.random() * empatheticPrefixes.length)];
    const suffix = empatheticSuffixes[Math.floor(Math.random() * empatheticSuffixes.length)];
    adaptedResponse = prefix + adaptedResponse + suffix;
  } else if (analysis.tone === "supportive") {
    const prefix = supportivePrefixes[Math.floor(Math.random() * supportivePrefixes.length)];
    const suffix = supportiveSuffixes[Math.floor(Math.random() * supportiveSuffixes.length)];
    adaptedResponse = prefix + adaptedResponse + suffix;
  } else if (analysis.tone === "urgent") {
    const prefix = urgentPrefixes[Math.floor(Math.random() * urgentPrefixes.length)];
    const suffix = urgentSuffixes[Math.floor(Math.random() * urgentSuffixes.length)];
    adaptedResponse = prefix + adaptedResponse + suffix;
  }

  return adaptedResponse;
}

/**
 * Obter recomendação de ação baseado em sentimento
 */
export function getActionRecommendation(analysis: SentimentAnalysis): string | null {
  if (analysis.sentiment === "urgent") {
    return "Recomenda-se contato imediato com profissional de saúde mental ou serviço de emergência.";
  }

  if (analysis.sentiment === "negative" && analysis.score < -0.7) {
    return "Considere agendar uma sessão de acompanhamento com o terapeuta.";
  }

  if (analysis.sentiment === "positive") {
    return "Ótimo progresso! Continue com as técnicas recomendadas.";
  }

  return null;
}

/**
 * Formatar análise de sentimento para exibição
 */
export function formatSentimentAnalysis(analysis: SentimentAnalysis): string {
  const sentimentEmoji = {
    positive: "😊",
    negative: "😔",
    neutral: "😐",
    urgent: "🚨",
  };

  const scorePercentage = Math.round((analysis.score + 1) * 50);

  return `${sentimentEmoji[analysis.sentiment]} Sentimento: ${analysis.sentiment} (${scorePercentage}%) | Urgência: ${Math.round(analysis.urgency * 100)}%`;
}
