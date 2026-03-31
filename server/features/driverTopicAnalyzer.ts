/**
 * Analisador de Tópicos para Assistente Carro
 * Detecta tópicos de perguntas baseado em dados reais do banco de dados
 */

export type TopicCategory = 
  | "pacientes"
  | "agendamentos"
  | "sessões"
  | "tratamento"
  | "humor"
  | "histórico"
  | "pensamentos"
  | "inventários"
  | "leads"
  | "documentos"
  | "geral";

interface TopicDetection {
  topic: TopicCategory;
  confidence: number; // 0 a 1
  keywords: string[];
  relatedTables: string[];
}

// Palavras-chave por tópico
const TOPIC_KEYWORDS: Record<TopicCategory, string[]> = {
  pacientes: [
    "paciente",
    "cliente",
    "nome",
    "contato",
    "telefone",
    "email",
    "cadastro",
    "quantos",
    "quais",
  ],
  agendamentos: [
    "agendamento",
    "consulta",
    "horário",
    "data",
    "próximo",
    "quando",
    "agendar",
    "disponível",
    "marcado",
  ],
  sessões: [
    "sessão",
    "consulta",
    "nota",
    "evolução",
    "progresso",
    "histórico",
    "anterior",
    "última",
    "anotação",
  ],
  tratamento: [
    "tratamento",
    "plano",
    "objetivo",
    "técnica",
    "terapia",
    "estratégia",
    "abordagem",
    "recomendação",
  ],
  humor: [
    "humor",
    "emoção",
    "sentimento",
    "mood",
    "estado",
    "como está",
    "feliz",
    "triste",
    "ansioso",
  ],
  histórico: [
    "histórico",
    "anamnese",
    "background",
    "passado",
    "história",
    "origem",
    "antecedente",
  ],
  pensamentos: [
    "pensamento",
    "cognitivo",
    "crença",
    "automático",
    "padrão",
    "mente",
    "ideia",
  ],
  inventários: [
    "inventário",
    "teste",
    "resultado",
    "avaliação",
    "escala",
    "questionário",
    "pontuação",
  ],
  leads: [
    "lead",
    "prospect",
    "potencial",
    "novo",
    "contato",
    "interessado",
    "oportunidade",
  ],
  documentos: [
    "documento",
    "arquivo",
    "relatório",
    "certificado",
    "comprovante",
    "papel",
    "formulário",
  ],
  geral: ["informação", "dados", "estatística", "resumo", "análise"],
};

// Tabelas relacionadas por tópico
const RELATED_TABLES: Record<TopicCategory, string[]> = {
  pacientes: ["patients", "leads"],
  agendamentos: ["appointments"],
  sessões: ["sessionNotes"],
  tratamento: ["treatmentPlans"],
  humor: ["moodEntries"],
  histórico: ["anamnesis"],
  pensamentos: ["thoughtRecords"],
  inventários: ["inventoryResults"],
  leads: ["leads"],
  documentos: ["documents"],
  geral: ["patients", "appointments", "sessionNotes", "treatmentPlans"],
};

/**
 * Detectar tópico de uma pergunta
 */
export function detectTopic(question: string): TopicDetection {
  const lowerQuestion = question.toLowerCase();
  const scores: Record<TopicCategory, number> = {
    pacientes: 0,
    agendamentos: 0,
    sessões: 0,
    tratamento: 0,
    humor: 0,
    histórico: 0,
    pensamentos: 0,
    inventários: 0,
    leads: 0,
    documentos: 0,
    geral: 0,
  };

  const foundKeywords: string[] = [];

  // Contar palavras-chave por tópico
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuestion.includes(keyword)) {
        scores[topic as TopicCategory]++;
        foundKeywords.push(keyword);
      }
    }
  }

  // Encontrar tópico com maior score
  let topTopic: TopicCategory = "geral";
  let maxScore = scores.geral;

  for (const [topic, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topTopic = topic as TopicCategory;
    }
  }

  // Calcular confiança (0 a 1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? maxScore / totalScore : 0;

  return {
    topic: topTopic,
    confidence: Math.min(1, confidence),
    keywords: Array.from(new Set(foundKeywords)),
    relatedTables: RELATED_TABLES[topTopic],
  };
}

/**
 * Categorizar múltiplas perguntas
 */
export function categorizePquestions(questions: string[]): Record<TopicCategory, number> {
  const categories: Record<TopicCategory, number> = {
    pacientes: 0,
    agendamentos: 0,
    sessões: 0,
    tratamento: 0,
    humor: 0,
    histórico: 0,
    pensamentos: 0,
    inventários: 0,
    leads: 0,
    documentos: 0,
    geral: 0,
  };

  for (const question of questions) {
    const detection = detectTopic(question);
    categories[detection.topic]++;
  }

  return categories;
}

/**
 * Obter tabelas relevantes para uma pergunta
 */
export function getRelevantTables(question: string): string[] {
  const detection = detectTopic(question);
  return detection.relatedTables;
}

/**
 * Formatar detecção de tópico para exibição
 */
export function formatTopicDetection(detection: TopicDetection): string {
  const confidencePercentage = Math.round(detection.confidence * 100);
  const tablesText = detection.relatedTables.join(", ");

  return `📌 Tópico: ${detection.topic} (${confidencePercentage}% confiança) | Tabelas: ${tablesText}`;
}
