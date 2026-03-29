/**
 * Sistema de Reconhecimento de Intenção
 * Detecta a intenção da pergunta para otimizar busca em banco de dados
 */

export type IntentType = 
  | "patient_info"      // Perguntas sobre pacientes
  | "appointment_info"  // Perguntas sobre agendamentos
  | "session_info"      // Perguntas sobre sessões
  | "general_info"      // Perguntas gerais
  | "statistics"        // Perguntas sobre estatísticas
  | "unknown";

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  keywords: string[];
  suggestedTables: string[];
}

const INTENT_PATTERNS: Record<IntentType, { keywords: string[]; tables: string[] }> = {
  patient_info: {
    keywords: ["paciente", "cliente", "pessoa", "nome", "telefone", "contato", "dados", "informação"],
    tables: ["patients", "sessions"],
  },
  appointment_info: {
    keywords: ["agendamento", "consulta", "horário", "data", "hora", "marcado", "disponível", "bloqueado"],
    tables: ["appointments", "schedule_blocks"],
  },
  session_info: {
    keywords: ["sessão", "atendimento", "consulta", "evolução", "progresso", "notas", "histórico"],
    tables: ["sessions", "session_notes"],
  },
  statistics: {
    keywords: ["total", "quantidade", "quantos", "quanto", "estatística", "média", "máximo", "mínimo"],
    tables: ["patients", "appointments", "sessions"],
  },
  general_info: {
    keywords: ["qual", "como", "onde", "quando", "por que", "o que", "informação", "dados"],
    tables: ["patients", "appointments"],
  },
  unknown: {
    keywords: [],
    tables: [],
  },
};

export class IntentRecognizer {
  /**
   * Reconhecer intenção da pergunta
   */
  static recognize(question: string): IntentResult {
    const normalized = question.toLowerCase();
    const words = normalized.split(/\s+/);

    // Contar correspondências por intenção
    const intentScores: Record<IntentType, number> = {
      patient_info: 0,
      appointment_info: 0,
      session_info: 0,
      general_info: 0,
      statistics: 0,
      unknown: 0,
    };

    const matchedKeywords: string[] = [];

    // Calcular score para cada intenção
    for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
      for (const keyword of pattern.keywords) {
        if (normalized.includes(keyword)) {
          intentScores[intent as IntentType]++;
          matchedKeywords.push(keyword);
        }
      }
    }

    // Encontrar intenção com maior score
    let bestIntent: IntentType = "unknown";
    let maxScore = 0;

    for (const [intent, score] of Object.entries(intentScores)) {
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent as IntentType;
      }
    }

    // Se nenhuma correspondência, usar padrão
    if (maxScore === 0) {
      bestIntent = "general_info";
      maxScore = 1;
    }

    // Calcular confiança (0-1)
    const confidence = Math.min(maxScore / 3, 1); // Normalizar por 3 (máximo de keywords)

    return {
      intent: bestIntent,
      confidence,
      keywords: matchedKeywords,
      suggestedTables: INTENT_PATTERNS[bestIntent].tables,
    };
  }

  /**
   * Otimizar query baseado na intenção
   */
  static optimizeQuery(question: string, intent: IntentType): Record<string, any> {
    const optimization: Record<string, any> = {};

    switch (intent) {
      case "patient_info":
        optimization.searchFields = ["name", "phone", "email"];
        optimization.limit = 10;
        optimization.priority = "patients";
        break;

      case "appointment_info":
        optimization.searchFields = ["notes", "status"];
        optimization.limit = 20;
        optimization.priority = "appointments";
        optimization.sortBy = "date";
        break;

      case "session_info":
        optimization.searchFields = ["notes", "status"];
        optimization.limit = 15;
        optimization.priority = "sessions";
        optimization.sortBy = "date";
        break;

      case "statistics":
        optimization.aggregation = true;
        optimization.groupBy = null;
        optimization.limit = 100;
        break;

      case "general_info":
      default:
        optimization.searchFields = ["name", "notes"];
        optimization.limit = 10;
        break;
    }

    return optimization;
  }

  /**
   * Formatar resposta baseado na intenção
   */
  static formatResponse(intent: IntentType, data: any): string {
    switch (intent) {
      case "patient_info":
        if (Array.isArray(data) && data.length > 0) {
          return `Encontrei ${data.length} paciente(s): ${data.map((p: any) => p.name).join(", ")}.`;
        }
        return "Nenhum paciente encontrado com esses critérios.";

      case "appointment_info":
        if (Array.isArray(data) && data.length > 0) {
          return `Existem ${data.length} agendamento(s) relacionado(s) a essa busca.`;
        }
        return "Nenhum agendamento encontrado.";

      case "session_info":
        if (Array.isArray(data) && data.length > 0) {
          return `Encontrei ${data.length} sessão(ões) no histórico.`;
        }
        return "Nenhuma sessão encontrada.";

      case "statistics":
        return `Estatísticas: Total de ${data.length} registros encontrados.`;

      case "general_info":
      default:
        return "Processando sua pergunta...";
    }
  }

  /**
   * Sugerir pergunta de acompanhamento
   */
  static suggestFollowUp(intent: IntentType): string {
    const suggestions: Record<IntentType, string> = {
      patient_info: "Quer saber mais detalhes sobre algum paciente?",
      appointment_info: "Deseja bloquear ou liberar algum horário?",
      session_info: "Quer ver a evolução de um paciente?",
      statistics: "Quer filtrar por período específico?",
      general_info: "Posso ajudar com mais informações?",
      unknown: "Reformule sua pergunta, por favor.",
    };

    return suggestions[intent];
  }
}
