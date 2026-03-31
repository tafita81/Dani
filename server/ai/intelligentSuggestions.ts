/**
 * Sistema de Sugestões Inteligentes
 * Fornece sugestões de perguntas relacionadas baseado na intenção detectada
 */

import { IntentType } from "./intentRecognizer";

export interface Suggestion {
  text: string;
  icon: string;
  category: string;
  relevance: number; // 0-1
}

export class IntelligentSuggestions {
  private static readonly SUGGESTIONS_BY_INTENT: Record<IntentType, Suggestion[]> = {
    patient_info: [
      {
        text: "Ver evolução de um paciente",
        icon: "📈",
        category: "patient",
        relevance: 0.9,
      },
      {
        text: "Listar pacientes inativos",
        icon: "😴",
        category: "patient",
        relevance: 0.8,
      },
      {
        text: "Buscar paciente por telefone",
        icon: "📱",
        category: "patient",
        relevance: 0.85,
      },
      {
        text: "Ver histórico de sessões",
        icon: "📋",
        category: "session",
        relevance: 0.7,
      },
    ],
    appointment_info: [
      {
        text: "Bloquear horário",
        icon: "🔒",
        category: "appointment",
        relevance: 0.9,
      },
      {
        text: "Liberar horário bloqueado",
        icon: "🔓",
        category: "appointment",
        relevance: 0.85,
      },
      {
        text: "Ver próximos agendamentos",
        icon: "📅",
        category: "appointment",
        relevance: 0.95,
      },
      {
        text: "Sincronizar com Outlook",
        icon: "☁️",
        category: "calendar",
        relevance: 0.7,
      },
    ],
    session_info: [
      {
        text: "Ver notas da última sessão",
        icon: "📝",
        category: "session",
        relevance: 0.9,
      },
      {
        text: "Comparar evolução de sessões",
        icon: "📊",
        category: "session",
        relevance: 0.85,
      },
      {
        text: "Gerar relatório de sessões",
        icon: "📄",
        category: "report",
        relevance: 0.8,
      },
      {
        text: "Ver pacientes com mais sessões",
        icon: "🏆",
        category: "patient",
        relevance: 0.75,
      },
    ],
    statistics: [
      {
        text: "Total de pacientes ativos",
        icon: "👥",
        category: "statistics",
        relevance: 0.95,
      },
      {
        text: "Agendamentos este mês",
        icon: "📈",
        category: "statistics",
        relevance: 0.9,
      },
      {
        text: "Taxa de comparecimento",
        icon: "✅",
        category: "statistics",
        relevance: 0.85,
      },
      {
        text: "Pacientes por tipo de terapia",
        icon: "🎯",
        category: "statistics",
        relevance: 0.8,
      },
    ],
    general_info: [
      {
        text: "Listar todos os pacientes",
        icon: "📋",
        category: "patient",
        relevance: 0.8,
      },
      {
        text: "Ver agendamentos de hoje",
        icon: "📅",
        category: "appointment",
        relevance: 0.9,
      },
      {
        text: "Buscar informação específica",
        icon: "🔍",
        category: "general",
        relevance: 0.7,
      },
    ],
    unknown: [
      {
        text: "Reformule sua pergunta",
        icon: "❓",
        category: "help",
        relevance: 0.5,
      },
      {
        text: "Ver ajuda disponível",
        icon: "❓",
        category: "help",
        relevance: 0.6,
      },
    ],
  };

  /**
   * Obter sugestões para uma intenção específica
   */
  static getSuggestions(intent: IntentType, limit: number = 3): Suggestion[] {
    const suggestions = this.SUGGESTIONS_BY_INTENT[intent] || [];
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  /**
   * Obter sugestões contextualizadas baseado em histórico
   */
  static getContextualSuggestions(
    intent: IntentType,
    recentQuestions: string[],
    limit: number = 3
  ): Suggestion[] {
    const baseSuggestions = this.SUGGESTIONS_BY_INTENT[intent] || [];

    // Filtrar sugestões que não foram perguntadas recentemente
    const recentTopics = recentQuestions
      .map((q) => q.toLowerCase())
      .join(" ");

    const filtered = baseSuggestions.filter(
      (s) => !recentTopics.includes(s.text.toLowerCase())
    );

    // Se todas foram perguntadas, retornar as mais relevantes
    const suggestions = filtered.length > 0 ? filtered : baseSuggestions;

    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  /**
   * Formatar sugestões para exibição
   */
  static formatSuggestionsForDisplay(suggestions: Suggestion[]): string {
    return suggestions
      .map((s) => `${s.icon} ${s.text}`)
      .join("\n");
  }

  /**
   * Obter próxima sugestão recomendada
   */
  static getNextRecommendedSuggestion(
    intent: IntentType,
    currentAnswer: string
  ): Suggestion | null {
    const suggestions = this.SUGGESTIONS_BY_INTENT[intent];
    if (!suggestions || suggestions.length === 0) return null;

    // Retornar sugestão com maior relevância
    return suggestions.reduce((prev, current) =>
      prev.relevance > current.relevance ? prev : current
    );
  }
}
