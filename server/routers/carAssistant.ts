import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  users,
  patients,
  appointments,
  sessionNotes,
  leads,
  treatmentPlans,
  leadInteractions,
} from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";

/**
 * Car Assistant Router - Intelligent Data Analysis
 * Hands-free mode for psychologists to consult their internal data while driving
 * - Analyze ALL databases with intelligent queries
 * - Answer ANY question with counts, sums, percentages, calculations
 * - Know current date/time and calendar data
 * - Real-time analysis of all registered data
 */

export const carAssistantRouter = router({
  /**
   * Process voice question with intelligent analysis of ALL databases
   * Analyzes: patients, appointments, sessions, leads, treatment plans, time blocks
   * Performs: counts, sums, percentages, calculations, date/time analysis
   */
  processVoiceQuestion: publicProcedure
    .input(z.object({ question: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          response: "Banco de dados indisponível",
        };
      }

      const psychologistId = 1; // TODO: Get from context

      try {
        // Get current date/time
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get psychologist info
        const psychologist = await db
          .select()
          .from(users)
          .where(eq(users.id, psychologistId))
          .limit(1);

        if (!psychologist.length) {
          return {
            success: false,
            response: "Psicólogo não encontrado",
          };
        }

        // Get ALL data from database for comprehensive analysis
      const allPatients = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, psychologistId));

      const allAppointments = await db
        .select()
        .from(appointments)
        .where(eq(appointments.userId, psychologistId));

        const todayAppointments = allAppointments.filter((a) => {
          const aptDate = new Date(a.startTime);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });

      const allSessions = await db
        .select()
        .from(sessionNotes)
        .where(eq(sessionNotes.userId, psychologistId));

      const allLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.userId, psychologistId));

      const allTreatmentPlans = await db
        .select()
        .from(treatmentPlans);

      const allInteractions = await db
        .select()
        .from(leadInteractions);

        // Calculate statistics
        const patientStats = {
          total: allPatients.length,
        active: allPatients.filter((p) => p.status === "active").length,
        inactive: allPatients.filter((p) => p.status === "inactive").length,
        waitlist: allPatients.filter((p) => p.status === "waitlist").length,
        };

        const appointmentStats = {
          total: allAppointments.length,
          today: todayAppointments.length,
        confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
        scheduled: allAppointments.filter((a) => a.status === "scheduled").length,
        done: allAppointments.filter((a) => a.status === "done").length,
          confirmationRate:
            allAppointments.length > 0
              ? Math.round(
                  (allAppointments.filter((a) => a.status === "done").length /
                    allAppointments.length) *
                    100
                )
              : 0,
        };

        const leadStats = {
          total: allLeads.length,
        prospect: allLeads.filter((l) => l.stage === "prospect").length,
        converted: allLeads.filter((l) => l.stage === "converted").length,
        conversionRate:
          allLeads.length > 0
            ? Math.round(
                (allLeads.filter((l) => l.stage === "converted").length /
                    allLeads.length) *
                    100
                )
              : 0,
          bySource: {
            whatsapp: allLeads.filter((l) => l.source === "whatsapp").length,
            instagram: allLeads.filter((l) => l.source === "instagram").length,
            site: allLeads.filter((l) => l.source === "site").length,
            telegram: allLeads.filter((l) => l.source === "telegram").length,
          },
        };

        const sessionStats = {
          total: allSessions.length,
          thisMonth: allSessions.filter((s) => {
            const sDate = new Date(s.createdAt);
            return (
              sDate.getMonth() === now.getMonth() &&
              sDate.getFullYear() === now.getFullYear()
            );
          }).length,
        };

        // Find next appointment
        const nextAppointment = allAppointments
          .filter((a) => new Date(a.startTime) > now)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 1)[0];

        // Build comprehensive context for LLM
        const context = `
CONTEXTO COMPLETO - ${new Date().toLocaleString("pt-BR")}

ESTATÍSTICAS DE PACIENTES:
- Total: ${patientStats.total}
- Ativos: ${patientStats.active}
- Inativos: ${patientStats.inactive}
- Aguardando: ${patientStats.waitlist}

ESTATÍSTICAS DE CONSULTAS:
- Total: ${appointmentStats.total}
- Hoje: ${appointmentStats.today}
- Agendadas: ${appointmentStats.scheduled}
- Concluídas: ${appointmentStats.done}
- Confirmadas: ${appointmentStats.confirmed}
- Taxa de conclusão: ${appointmentStats.confirmationRate}%

PRÓXIMA CONSULTA:
${
  nextAppointment
    ? `- ${nextAppointment.title} em ${new Date(nextAppointment.startTime).toLocaleString("pt-BR")}`
    : "- Nenhuma consulta agendada"
}

ESTATÍSTICAS DE LEADS:
- Total: ${leadStats.total}
- Prospects: ${leadStats.prospect}
- Convertidos: ${leadStats.converted}
- Taxa de conversão: ${leadStats.conversionRate}%
- Por fonte: WhatsApp (${leadStats.bySource.whatsapp}), Instagram (${leadStats.bySource.instagram}), Site (${leadStats.bySource.site}), Telegram (${leadStats.bySource.telegram})

SESSÕES:
- Total: ${sessionStats.total}
- Este mês: ${sessionStats.thisMonth}

PLANOS DE TRATAMENTO:
- Total: ${allTreatmentPlans.length}

INTERAÇÕES COM LEADS:
- Total: ${allInteractions.length}

PACIENTES RECENTES:
${allPatients
  .slice(0, 5)
  .map((p) => `- ${p.name} (${p.status}): ${p.phone}`)
  .join("\n")}

PERGUNTA DO USUÁRIO: ${input.question}

IMPORTANTE: Responda APENAS com os dados solicitados. NAO mencione nomes de pessoas ou personalizacoes. Seja breve e objetivo. Exemplo: Se perguntarem 'Quantos pacientes?', responda apenas '14 pacientes.'
Se a pergunta pedir contagens, somas, percentuais ou cálculos, use os dados fornecidos.
Se pedir informações sobre data/hora, use: ${now.toLocaleString("pt-BR")}
`;

        // Call LLM with comprehensive context
        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: context,
            },
          ],
        });

        const responseText =
          response.choices[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";

        return {
          success: true,
          response: responseText,
        };
      } catch (error) {
        console.error("Error processing voice question:", error);
        return {
          success: false,
          response: "Desculpe, houve um erro ao processar sua pergunta. Tente novamente.",
        };
      }
    }),

  /**
   * Get voice summary for dashboard
   */
  getVoiceSummary: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const psychologistId = 1; // TODO: Get from context

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayApts = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, psychologistId),
          gte(appointments.startTime, today),
          lte(appointments.startTime, tomorrow)
        )
      )
      .orderBy(appointments.startTime);

    const recentPatients = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, psychologistId))
      .limit(5);

    const activeLeads = await db
      .select()
      .from(leads)
      .where(and(eq(leads.userId, psychologistId), eq(leads.stage, "prospect")))
      .limit(5);

    return {
      todayAppointments: todayApts.length,
      totalPatients: recentPatients.length,
      activeLeads: activeLeads.length,
    };
  }),

  /**
   * Get today's appointments
   */
  getTodayAppointments: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const psychologistId = 1; // TODO: Get from context

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const results = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, psychologistId),
          gte(appointments.startTime, today),
          lte(appointments.startTime, tomorrow)
        )
      )
      .orderBy(appointments.startTime);

    return {
      count: results.length,
      appointments: results.map((a) => ({
        id: a.id,
        title: a.title,
        time: new Date(a.startTime).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: a.type,
        status: a.status,
      })),
    };
  }),

  /**
   * Get next appointment
   */
  getNextAppointment: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const psychologistId = 1; // TODO: Get from context

    const now = new Date();
    const results = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, psychologistId),
          gte(appointments.startTime, now)
        )
      )
      .orderBy(appointments.startTime)
      .limit(1);

    if (!results.length) {
      return {
        found: false,
        appointment: null,
      };
    }

    const apt = results[0];
    return {
      found: true,
      appointment: {
        id: apt.id,
        title: apt.title,
        startTime: apt.startTime.toLocaleString("pt-BR"),
        type: apt.type,
        status: apt.status,
      },
    };
  }),

  /**
   * Get lead interactions
   */
  getLeadInteractions: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select()
      .from(leadInteractions)
      .orderBy(desc(leadInteractions.createdAt))
      .limit(10);

    return {
      count: results.length,
      interactions: results.map((i) => ({
        id: i.id,
        type: i.type,
        content: i.content,
        createdAt: new Date(i.createdAt).toLocaleString("pt-BR"),
      })),
    };
  }),
});
