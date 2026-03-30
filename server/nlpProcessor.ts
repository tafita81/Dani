/**
 * Processador de Linguagem Natural (NLP)
 * 
 * Converte perguntas em linguagem natural para ações específicas
 * Usa IA para entender intenção e extrair entidades
 * 
 * Data: 29/03/2026
 */

import { invokeLLM } from "./_core/llm";

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface NLPResult {
  intent: string;
  action: string;
  entities: Record<string, any>;
  confidence: number;
  followUpQuestions?: string[];
  suggestedActions?: string[];
}

export interface IntentMapping {
  pattern: RegExp;
  intent: string;
  action: string;
  extractor: (text: string, match: RegExpMatchArray) => Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAPEAMENTO DE INTENÇÕES
// ═══════════════════════════════════════════════════════════════════════════

const intentMappings: IntentMapping[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // CONSULTAS SOBRE PACIENTES
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /como\s+está\s+(?:o|a)?\s*(\w+)/i,
    intent: "patient_status",
    action: "analyzePatientComprehensive",
    extractor: (text, match) => ({
      patientName: match[1],
      aspect: "geral",
    }),
  },

  {
    pattern: /qual\s+(?:é|eh)\s+(?:o|a)?\s*(?:humor|mood|estado|sentimento)\s+(?:do|da)?\s*(\w+)/i,
    intent: "patient_mood",
    action: "getPatientMood",
    extractor: (text, match) => ({
      patientName: match[1],
    }),
  },

  {
    pattern: /qual\s+paciente\s+(?:precisa|necessita)\s+(?:de\s+)?mais\s+atenção/i,
    intent: "critical_patients",
    action: "getCriticalRiskPatients",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:o|os)?\s*(?:padrão|padrões)\s+(?:de|do)?\s*(\w+)/i,
    intent: "behavior_patterns",
    action: "analyzeBehaviorPatterns",
    extractor: (text, match) => ({
      patientName: match[1],
    }),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:o|os)?\s*(?:progresso|evolução)\s+(?:do|da)?\s*(\w+)/i,
    intent: "patient_progress",
    action: "analyzePatientEvolution",
    extractor: (text, match) => ({
      patientName: match[1],
    }),
  },

  {
    pattern: /(?:quem|qual\s+paciente)\s+(?:não|nao)\s+compareceu/i,
    intent: "no_show_patients",
    action: "getNoShowPatients",
    extractor: () => ({}),
  },

  {
    pattern: /(?:histórico|historia|histórico completo)\s+(?:do|da)?\s*(\w+)/i,
    intent: "patient_history",
    action: "getCompletePatientHistory",
    extractor: (text, match) => ({
      patientName: match[1],
    }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONSULTAS SOBRE DISPONIBILIDADE
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /(?:qual|quais)\s+(?:horário|horarios|horário|hora|horas)\s+(?:tenho|tem)\s+(?:disponível|disponivel)/i,
    intent: "availability_week",
    action: "getAvailableSlotsThisWeek",
    extractor: () => ({}),
  },

  {
    pattern: /(?:tenho|tem)\s+tempo\s+(?:para|pra)\s+(?:uma\s+)?(?:sessão|sessao|consulta)\s+(?:extra\s+)?(\w+)/i,
    intent: "availability_specific",
    action: "checkAvailabilityOnDate",
    extractor: (text, match) => ({
      day: match[1],
    }),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|eh)\s+(?:o|a)?\s*(?:melhor|próximo)\s+(?:horário|hora)/i,
    intent: "best_time",
    action: "findBestTimeForNewAppointment",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|eh)\s+(?:a\s+)?(?:próxima|próximas)\s+(?:consulta|consultas|sessão|sessões)/i,
    intent: "upcoming_appointments",
    action: "getUpcomingAppointments",
    extractor: () => ({}),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AÇÕES DE BLOQUEIO/LIBERAÇÃO
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /bloqueia?\s+(?:meu|minha)?\s*(?:horário|hora)\s+(?:de\s+)?(?:almoço|almoco)/i,
    intent: "block_lunch",
    action: "blockLunchHourAutomatically",
    extractor: () => ({}),
  },

  {
    pattern: /bloqueia?\s+(?:o\s+)?horário\s+(?:de\s+)?(\d{1,2}):(\d{2})\s+(?:a|até|ate)\s+(\d{1,2}):(\d{2})/i,
    intent: "block_specific_time",
    action: "blockTimeSlot",
    extractor: (text, match) => ({
      startTime: `${match[1]}:${match[2]}`,
      endTime: `${match[3]}:${match[4]}`,
    }),
  },

  {
    pattern: /libera?\s+(?:o\s+)?horário/i,
    intent: "unblock_time",
    action: "unblockTimeSlot",
    extractor: () => ({}),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AÇÕES DE AGENDAMENTO
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /(?:marca|agenda|agende)\s+(?:uma\s+)?(?:sessão|consulta)\s+(?:com\s+)?(?:o|a)?\s*(\w+)/i,
    intent: "schedule_appointment",
    action: "suggestTimesForPatient",
    extractor: (text, match) => ({
      patientName: match[1],
    }),
  },

  {
    pattern: /(?:cancela|cancele)\s+(?:o\s+)?(?:agendamento|consulta|sessão)\s+(?:de\s+)?(\w+)/i,
    intent: "cancel_appointment",
    action: "cancelAppointment",
    extractor: (text, match) => ({
      patientName: match[1],
    }),
  },

  {
    pattern: /(?:remarque|remarca)\s+(?:a\s+)?(?:consulta|sessão)\s+(?:de\s+)?(\w+)/i,
    intent: "reschedule_appointment",
    action: "rescheduleAppointment",
    extractor: (text, match) => ({
      patientName: match[1],
    }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONSULTAS FINANCEIRAS
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /(?:quanto|quantos)\s+(?:ganhei|ganho|faturei|faturamento)\s+(?:esse\s+)?(?:mês|mes)/i,
    intent: "monthly_revenue",
    action: "getMonthlyRevenue",
    extractor: () => {
      const now = new Date();
      return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      };
    },
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:a|as)?\s*(?:receita|receitas|faturamento)/i,
    intent: "revenue_analysis",
    action: "getMonthlyRevenue",
    extractor: () => {
      const now = new Date();
      return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      };
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONSULTAS DE ANÁLISE
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:a|as)?\s*(?:próxima|próximas)\s+(?:ação|ações)/i,
    intent: "next_actions",
    action: "predictNextActions",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:a|as)?\s*(?:recomendação|recomendações)/i,
    intent: "recommendations",
    action: "getAutomaticRecommendations",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:o|os)?\s*(?:tema|temas)\s+(?:mais\s+)?(?:recorrente|recorrentes)/i,
    intent: "recurring_themes",
    action: "getRecurringThemes",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:o|os)?\s*(?:padrão|padrões)\s+(?:de\s+)?(?:cancelamento|cancelamentos)/i,
    intent: "cancellation_patterns",
    action: "getCancellationPatterns",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:a|as)?\s*(?:efetividade|efetividades)\s+(?:do|da)?\s*(?:tratamento|técnica)/i,
    intent: "treatment_effectiveness",
    action: "getTreatmentEffectiveness",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:a|as)?\s*(?:tendência|tendências)\s+(?:de\s+)?(?:humor|mood)/i,
    intent: "mood_trends",
    action: "getMoodTrendAnalysis",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:a|as)?\s*(?:estatística|estatísticas|stats)/i,
    intent: "statistics",
    action: "getGeneralStatistics",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:o|os)?\s*(?:dashboard|painel|resumo)/i,
    intent: "dashboard",
    action: "getExecutiveDashboard",
    extractor: () => ({}),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:o|os)?\s*(?:insight|insights|análise|analise)/i,
    intent: "insights",
    action: "getAIInsights",
    extractor: () => ({}),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONSULTAS DE BUSCA
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /(?:busca|procura|pesquisa)\s+(?:por\s+)?(\w+)/i,
    intent: "search",
    action: "searchPatientsBySymptoms",
    extractor: (text, match) => ({
      keyword: match[1],
    }),
  },

  {
    pattern: /(?:qual|quais)\s+(?:é|são)\s+(?:o|os)?\s*(?:paciente|pacientes)\s+(?:com|sem)\s+(\w+)/i,
    intent: "search_by_characteristic",
    action: "searchPatientsBySymptoms",
    extractor: (text, match) => ({
      keyword: match[1],
    }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AÇÕES DE REGISTRO
  // ─────────────────────────────────────────────────────────────────────────

  {
    pattern: /(?:registra|registre)\s+(?:o\s+)?(?:humor|mood)\s+(?:do|da)?\s*(\w+)\s+(?:como|em)\s+(\d+)/i,
    intent: "record_mood",
    action: "recordPatientMood",
    extractor: (text, match) => ({
      patientName: match[1],
      moodScore: parseInt(match[2]),
    }),
  },

  {
    pattern: /(?:marca|marque)\s+(?:como|de)\s+(?:comparecido|realizado)/i,
    intent: "mark_attended",
    action: "markAsAttended",
    extractor: () => ({}),
  },

  {
    pattern: /(?:marca|marque)\s+(?:como|de)\s+(?:não\s+)?(?:comparecimento|no_show)/i,
    intent: "mark_no_show",
    action: "markAsNoShow",
    extractor: () => ({}),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Processa pergunta em linguagem natural
 */
export async function processNaturalLanguageQuestion(
  question: string
): Promise<NLPResult> {
  // Normalizar texto
  const normalized = question.toLowerCase().trim();

  // Tentar match com padrões conhecidos
  for (const mapping of intentMappings) {
    const match = normalized.match(mapping.pattern);
    if (match) {
      const entities = mapping.extractor(normalized, match);

      return {
        intent: mapping.intent,
        action: mapping.action,
        entities,
        confidence: 0.95,
      };
    }
  }

  // Se não encontrar padrão, usar IA para análise
  return await analyzeWithAI(question);
}

/**
 * Analisa pergunta com IA quando não há padrão conhecido
 */
async function analyzeWithAI(question: string): Promise<NLPResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um analisador de intenção clínica. Analise a pergunta do terapeuta e retorne um JSON com:
          - intent: tipo de pergunta (patient_status, availability, analysis, action, etc)
          - action: ação a executar (nomeAction)
          - entities: dados extraídos (patientName, date, value, etc)
          - confidence: confiança (0-1)
          - suggestedActions: ações sugeridas
          
          Responda APENAS com JSON válido, sem markdown.`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "nlp_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              intent: { type: "string" },
              action: { type: "string" },
              entities: { type: "object" },
              confidence: { type: "number" },
              suggestedActions: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["intent", "action", "entities", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content as string);
  } catch (error) {
    console.error("Erro ao analisar com IA:", error);
    return {
      intent: "unknown",
      action: "unknown",
      entities: {},
      confidence: 0,
    };
  }
}

/**
 * Extrai entidade de paciente por nome
 */
export function extractPatientName(text: string): string | null {
  const match = text.match(/(?:do|da|de|com|para)\s+(\w+)/i);
  return match ? match[1] : null;
}

/**
 * Extrai data de texto
 */
export function extractDate(text: string): Date | null {
  // Padrões: "amanhã", "próxima segunda", "15 de março", etc
  const today = new Date();

  if (/amanhã|amanha/.test(text)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  if (/próxima\s+segunda|proxima\s+segunda/.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7));
    return date;
  }

  if (/próxima\s+terça|proxima\s+terca/.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() + ((2 + 7 - date.getDay()) % 7));
    return date;
  }

  const dateMatch = text.match(/(\d{1,2})\s+(?:de\s+)?(\w+)/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const monthName = dateMatch[2];
    const months: Record<string, number> = {
      janeiro: 0,
      fevereiro: 1,
      março: 2,
      março: 2,
      abril: 3,
      maio: 4,
      junho: 5,
      julho: 6,
      agosto: 7,
      setembro: 8,
      outubro: 9,
      novembro: 10,
      dezembro: 11,
    };

    const month = months[monthName.toLowerCase()];
    if (month !== undefined) {
      const date = new Date(today.getFullYear(), month, day);
      if (date < today) {
        date.setFullYear(date.getFullYear() + 1);
      }
      return date;
    }
  }

  return null;
}

/**
 * Extrai número de texto
 */
export function extractNumber(text: string): number | null {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extrai período de tempo
 */
export function extractTimePeriod(text: string): { days: number } | null {
  if (/semana/.test(text)) return { days: 7 };
  if (/mês|mes/.test(text)) return { days: 30 };
  if (/ano/.test(text)) return { days: 365 };

  const match = text.match(/(\d+)\s+(?:dias?|semanas?|meses?|anos?)/i);
  if (match) {
    const number = parseInt(match[1]);
    if (/dias?/.test(match[0])) return { days: number };
    if (/semanas?/.test(match[0])) return { days: number * 7 };
    if (/meses?/.test(match[0])) return { days: number * 30 };
    if (/anos?/.test(match[0])) return { days: number * 365 };
  }

  return null;
}

/**
 * Gera sugestões de follow-up
 */
export function generateFollowUpSuggestions(intent: string): string[] {
  const suggestions: Record<string, string[]> = {
    patient_status: [
      "Quer ver o histórico completo?",
      "Deseja registrar o mood?",
      "Quer agendar próxima sessão?",
    ],
    availability_week: [
      "Quer bloquear o horário de almoço?",
      "Quer sugerir horários para um paciente?",
      "Quer marcar uma sessão?",
    ],
    monthly_revenue: [
      "Quer comparar com mês anterior?",
      "Quer ver taxa de comparecimento?",
      "Quer análise de ROI?",
    ],
    critical_patients: [
      "Quer enviar notificação?",
      "Quer agendar sessão urgente?",
      "Quer ver histórico?",
    ],
  };

  return suggestions[intent] || [
    "Quer fazer outra pergunta?",
    "Precisa de mais informações?",
  ];
}

/**
 * Valida resultado do NLP
 */
export function validateNLPResult(result: NLPResult): boolean {
  return (
    result.intent !== "unknown" &&
    result.confidence > 0.5 &&
    result.action !== "unknown"
  );
}
