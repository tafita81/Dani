/**
 * Sistema de Formulários Dinâmicos para Pacientes
 * Gerencia aplicação inteligente de formulários clínicos (PHQ-9, GAD-7, etc.)
 * com histórico completo e análise de evolução
 */

export interface FormTemplate {
  id: string;
  name: string; // "PHQ-9", "GAD-7", etc.
  description: string;
  category: "screening" | "monitoring" | "outcome";
  questions: FormQuestion[];
  scoringSystem: ScoringSystem;
  recommendedFrequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  minDaysBetweenApplications: number;
}

export interface FormQuestion {
  id: string;
  text: string;
  type: "likert" | "yes_no" | "text" | "numeric";
  options?: FormOption[];
  scoreWeight?: number;
}

export interface FormOption {
  value: string;
  label: string;
  score: number;
}

export interface ScoringSystem {
  minScore: number;
  maxScore: number;
  interpretation: ScoreInterpretation[];
}

export interface ScoreInterpretation {
  minScore: number;
  maxScore: number;
  level: "minimal" | "mild" | "moderate" | "severe";
  interpretation: string;
}

export interface PatientFormResponse {
  id: string;
  patientId: string;
  formId: string;
  responses: FormAnswerData[];
  totalScore: number;
  scoreLevel: string;
  completedAt: Date;
  notes?: string;
}

export interface FormAnswerData {
  questionId: string;
  answer: string | number;
  score: number;
}

export interface FormSchedule {
  id: string;
  patientId: string;
  formId: string;
  nextApplicationDate: Date;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  isActive: boolean;
  lastApplicationDate?: Date;
  applicationCount: number;
}

// Formulários clínicos padrão em português
export const CLINICAL_FORMS: Record<string, FormTemplate> = {
  PHQ9: {
    id: "phq9",
    name: "PHQ-9",
    description: "Patient Health Questionnaire - Escala de Depressão",
    category: "screening",
    recommendedFrequency: "monthly",
    minDaysBetweenApplications: 7,
    questions: [
      {
        id: "phq9_1",
        text: "Pouco interesse ou prazer em fazer as coisas",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_2",
        text: "Sentir-se para baixo, deprimido ou sem esperança",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_3",
        text: "Dificuldade em adormecer, manter o sono ou dormir demais",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_4",
        text: "Sentir-se cansado ou com pouca energia",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_5",
        text: "Pouco apetite ou comer demais",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_6",
        text: "Sentir-se mal consigo mesmo ou achar que é um fracasso",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_7",
        text: "Dificuldade em concentrar-se nas coisas",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_8",
        text: "Movimentos ou fala lenta ou rápida demais",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "phq9_9",
        text: "Pensamentos de que seria melhor estar morto",
        type: "likert",
        scoreWeight: 1,
      },
    ],
    scoringSystem: {
      minScore: 0,
      maxScore: 27,
      interpretation: [
        {
          minScore: 0,
          maxScore: 4,
          level: "minimal",
          interpretation: "Depressão mínima",
        },
        {
          minScore: 5,
          maxScore: 9,
          level: "mild",
          interpretation: "Depressão leve",
        },
        {
          minScore: 10,
          maxScore: 14,
          level: "moderate",
          interpretation: "Depressão moderada",
        },
        {
          minScore: 15,
          maxScore: 19,
          level: "severe",
          interpretation: "Depressão moderadamente grave",
        },
        {
          minScore: 20,
          maxScore: 27,
          level: "severe",
          interpretation: "Depressão grave",
        },
      ],
    },
  },

  GAD7: {
    id: "gad7",
    name: "GAD-7",
    description: "Generalized Anxiety Disorder - Escala de Ansiedade",
    category: "screening",
    recommendedFrequency: "monthly",
    minDaysBetweenApplications: 7,
    questions: [
      {
        id: "gad7_1",
        text: "Sentir-se nervoso, ansioso ou no limite",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "gad7_2",
        text: "Não conseguir parar ou controlar a preocupação",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "gad7_3",
        text: "Preocupar-se muito com diferentes coisas",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "gad7_4",
        text: "Dificuldade em relaxar",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "gad7_5",
        text: "Estar tão inquieto que é difícil ficar sentado",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "gad7_6",
        text: "Ficar irritado ou irritável facilmente",
        type: "likert",
        scoreWeight: 1,
      },
      {
        id: "gad7_7",
        text: "Sentir medo de que algo terrível possa acontecer",
        type: "likert",
        scoreWeight: 1,
      },
    ],
    scoringSystem: {
      minScore: 0,
      maxScore: 21,
      interpretation: [
        {
          minScore: 0,
          maxScore: 4,
          level: "minimal",
          interpretation: "Ansiedade mínima",
        },
        {
          minScore: 5,
          maxScore: 9,
          level: "mild",
          interpretation: "Ansiedade leve",
        },
        {
          minScore: 10,
          maxScore: 14,
          level: "moderate",
          interpretation: "Ansiedade moderada",
        },
        {
          minScore: 15,
          maxScore: 21,
          level: "severe",
          interpretation: "Ansiedade grave",
        },
      ],
    },
  },
};

/**
 * Determina se paciente deve responder formulário
 */
export function shouldApplyForm(
  lastApplicationDate: Date | undefined,
  minDaysBetweenApplications: number
): boolean {
  if (!lastApplicationDate) return true;

  const daysSinceLastApplication = Math.floor(
    (Date.now() - lastApplicationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastApplication >= minDaysBetweenApplications;
}

/**
 * Calcula score total do formulário
 */
export function calculateFormScore(
  responses: FormAnswerData[],
  form: FormTemplate
): number {
  return responses.reduce((sum, response) => sum + response.score, 0);
}

/**
 * Obtém interpretação do score
 */
export function getScoreInterpretation(
  score: number,
  form: FormTemplate
): ScoreInterpretation | undefined {
  return form.scoringSystem.interpretation.find(
    (interp) => score >= interp.minScore && score <= interp.maxScore
  );
}

/**
 * Analisa evolução de respostas ao longo do tempo
 */
export function analyzeFormEvolution(
  responses: PatientFormResponse[]
): {
  trend: "improving" | "worsening" | "stable";
  averageScore: number;
  scoreChange: number;
  percentageChange: number;
} {
  if (responses.length < 2) {
    return {
      trend: "stable",
      averageScore: responses[0]?.totalScore || 0,
      scoreChange: 0,
      percentageChange: 0,
    };
  }

  const sortedResponses = [...responses].sort(
    (a, b) => a.completedAt.getTime() - b.completedAt.getTime()
  );

  const firstScore = sortedResponses[0].totalScore;
  const lastScore = sortedResponses[sortedResponses.length - 1].totalScore;
  const averageScore =
    sortedResponses.reduce((sum, r) => sum + r.totalScore, 0) /
    sortedResponses.length;

  const scoreChange = lastScore - firstScore;
  const percentageChange = (scoreChange / firstScore) * 100;

  let trend: "improving" | "worsening" | "stable";
  if (Math.abs(scoreChange) < 2) {
    trend = "stable";
  } else if (scoreChange < 0) {
    trend = "improving";
  } else {
    trend = "worsening";
  }

  return {
    trend,
    averageScore,
    scoreChange,
    percentageChange,
  };
}

/**
 * Recomenda próximo formulário a aplicar
 */
export function recommendNextForm(
  patientResponses: Map<string, PatientFormResponse[]>,
  sessionCount: number
): FormTemplate | undefined {
  // Aplicar PHQ-9 na primeira sessão
  if (sessionCount === 1) {
    return CLINICAL_FORMS.PHQ9;
  }

  // Aplicar GAD-7 na segunda sessão
  if (sessionCount === 2) {
    return CLINICAL_FORMS.GAD7;
  }

  // Depois, aplicar formulários baseado em padrão
  // Se depressão está piorando, aplicar PHQ-9 novamente
  const phq9Responses = patientResponses.get("phq9") || [];
  if (phq9Responses.length > 0) {
    const evolution = analyzeFormEvolution(phq9Responses);
    if (evolution.trend === "worsening") {
      return CLINICAL_FORMS.PHQ9;
    }
  }

  // Se ansiedade está piorando, aplicar GAD-7 novamente
  const gad7Responses = patientResponses.get("gad7") || [];
  if (gad7Responses.length > 0) {
    const evolution = analyzeFormEvolution(gad7Responses);
    if (evolution.trend === "worsening") {
      return CLINICAL_FORMS.GAD7;
    }
  }

  return undefined;
}

/**
 * Gera mensagem humanizada sobre resultado do formulário
 */
export function generateFormFeedback(
  form: FormTemplate,
  score: number,
  interpretation: ScoreInterpretation
): string {
  const feedbackMessages: Record<string, Record<string, string>> = {
    phq9: {
      minimal: `Seus sintomas de depressão estão mínimos. Continue mantendo os hábitos saudáveis!`,
      mild: `Você apresenta sintomas leves de depressão. Vamos trabalhar isso juntos na próxima sessão.`,
      moderate: `Seus sintomas de depressão são moderados. É importante continuarmos o tratamento regularmente.`,
      severe: `Seus sintomas de depressão são significativos. Vamos intensificar o trabalho terapêutico.`,
    },
    gad7: {
      minimal: `Seus níveis de ansiedade estão muito bons!`,
      mild: `Você apresenta ansiedade leve. Vamos trabalhar técnicas de relaxamento.`,
      moderate: `Sua ansiedade é moderada. Precisamos desenvolver estratégias de enfrentamento.`,
      severe: `Sua ansiedade está elevada. Vamos trabalhar intensivamente nisto.`,
    },
  };

  return (
    feedbackMessages[form.id]?.[interpretation.level] ||
    `Seu score no ${form.name} é ${score}. ${interpretation.interpretation}`
  );
}
