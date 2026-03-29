import { z } from "zod";
import { publicProcedure } from "./routers";

export const getSuggestionsProcedure = publicProcedure
  .input(
    z.object({
      intent: z.enum(["patient_info", "appointment_info", "session_info", "statistics"]),
      userId: z.string().optional(),
    })
  )
  .query(async ({ input }: any) => {
    const suggestions: Record<string, Array<{ text: string; icon: string; description: string }>> = {
      patient_info: [
        {
          text: "Ver evolução de paciente",
          icon: "📈",
          description: "Acompanhe o progresso clínico do paciente",
        },
        {
          text: "Listar pacientes inativos",
          icon: "😴",
          description: "Identifique pacientes sem sessões recentes",
        },
        {
          text: "Buscar por telefone",
          icon: "📱",
          description: "Localize paciente pelo número de contato",
        },
        {
          text: "Pacientes com atraso",
          icon: "⏰",
          description: "Veja quem não compareceu às consultas",
        },
      ],
      appointment_info: [
        {
          text: "Ver próximos agendamentos",
          icon: "📅",
          description: "Consulte agenda dos próximos dias",
        },
        {
          text: "Bloquear horário",
          icon: "🔒",
          description: "Marque horários como indisponíveis",
        },
        {
          text: "Liberar horário",
          icon: "🔓",
          description: "Desbloqueie horários previamente marcados",
        },
        {
          text: "Agendamentos de hoje",
          icon: "📍",
          description: "Veja consultas agendadas para hoje",
        },
      ],
      session_info: [
        {
          text: "Ver notas da sessão",
          icon: "📝",
          description: "Acesse anotações da última sessão",
        },
        {
          text: "Comparar evolução",
          icon: "📊",
          description: "Analise progresso entre sessões",
        },
        {
          text: "Gerar relatório",
          icon: "📄",
          description: "Crie relatório de progresso clínico",
        },
        {
          text: "Histórico de sessões",
          icon: "📚",
          description: "Consulte todas as sessões anteriores",
        },
      ],
      statistics: [
        {
          text: "Total de pacientes ativos",
          icon: "👥",
          description: "Quantidade de pacientes em acompanhamento",
        },
        {
          text: "Agendamentos este mês",
          icon: "📈",
          description: "Estatísticas de agendamentos do mês",
        },
        {
          text: "Taxa de comparecimento",
          icon: "✅",
          description: "Percentual de pacientes que compareceram",
        },
        {
          text: "Receita do mês",
          icon: "💰",
          description: "Total de receita gerada este mês",
        },
      ],
    };

    return {
      success: true,
      suggestions: suggestions[input.intent] || [],
      intent: input.intent,
      timestamp: new Date(),
    };
  });
