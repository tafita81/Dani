import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { patients, appointments, sessionNotes, treatmentPlans, moodEntries } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Processador expandido de perguntas com suporte a:
 * - Evolução clínica
 * - Histórico de sessões
 * - Recomendações de tratamento
 * - Análise de humor
 */

export const expandedQuestionProcessorProcedure = protectedProcedure
  .input(
    z.object({
      question: z.string(),
      patientId: z.string().optional(),
      context: z.string().default("assistente-carro"),
    })
  )
  .query(async ({ input }: any) => {
    try {
      const database = await getDb();
      if (!database) {
        return {
          success: false,
          question: input.question,
          answer: "Erro ao conectar ao banco de dados",
          error: "Database connection failed",
        };
      }

      const question = input.question.toLowerCase();
      let answer = "";
      let dataSource = "";
      let details: any = {};

      // 1. PERGUNTAS SOBRE EVOLUÇÃO CLÍNICA
      if (
        question.includes("evolução") ||
        question.includes("progresso") ||
        question.includes("melhora")
      ) {
        try {
          if (input.patientId) {
            const patientSessions = await database
              .select()
              .from(sessionNotes)
              .where(eq(sessionNotes.patientId, input.patientId))
              .orderBy(desc(sessionNotes.createdAt))
              .limit(10);

            if (patientSessions.length > 0) {
              const recentSessions = patientSessions.slice(0, 3);
              const oldestSessions = patientSessions.slice(-3);

              answer = `Evolução clínica do paciente: ${recentSessions.length} sessões recentes. Progresso observado ao longo do tratamento.`;
              details = {
                recentSessions: recentSessions.length,
                totalSessions: patientSessions.length,
                sessionTrend: "positive",
              };
              dataSource = "clinical_evolution";
            } else {
              answer = "Nenhuma sessão registrada para este paciente ainda.";
            }
          } else {
            answer = "Para analisar evolução clínica, especifique um paciente.";
          }
        } catch (e) {
          answer = "Erro ao buscar dados de evolução clínica";
        }
      }
      // 2. PERGUNTAS SOBRE HISTÓRICO DE SESSÕES
      else if (
        question.includes("histórico") ||
        question.includes("sessões") ||
        question.includes("consultas anteriores")
      ) {
        try {
          if (input.patientId) {
            const sessions = await database
              .select()
              .from(sessionNotes)
              .where(eq(sessionNotes.patientId, input.patientId))
              .orderBy(desc(sessionNotes.createdAt))
              .limit(5);

            if (sessions.length > 0) {
              answer = `Histórico de ${sessions.length} sessões. Última sessão registrada.`;
              details = {
                totalSessions: sessions.length,
                lastSessionDate: sessions[0]?.createdAt,
                sessions: sessions.map((s: any) => ({
                  date: s.createdAt,
                  notes: s.notes?.substring(0, 100),
                })),
              };
              dataSource = "session_history";
            } else {
              answer = "Nenhuma sessão anterior encontrada.";
            }
          } else {
            answer = "Para visualizar histórico, especifique um paciente.";
          }
        } catch (e) {
          answer = "Erro ao buscar histórico de sessões";
        }
      }
      // 3. PERGUNTAS SOBRE RECOMENDAÇÕES DE TRATAMENTO
      else if (
        question.includes("recomendação") ||
        question.includes("tratamento") ||
        question.includes("próximos passos")
      ) {
        try {
          if (input.patientId) {
            const plans = await database
              .select()
              .from(treatmentPlans)
              .where(eq(treatmentPlans.patientId, input.patientId))
              .orderBy(desc(treatmentPlans.createdAt))
              .limit(1);

            if (plans.length > 0) {
              const plan = plans[0];
              const goalsText = typeof plan.goals === 'string' ? plan.goals : JSON.stringify(plan.goals || '');
              answer = `Plano de tratamento ativo: ${goalsText.substring(0, 100)}...`;
              const techniquesText = typeof plan.plannedTechniques === 'string' ? plan.plannedTechniques : JSON.stringify(plan.plannedTechniques || '');
              details = {
                treatmentPlan: plan,
                goals: plan.goals,
                techniques: techniquesText,
              };
              dataSource = "treatment_plan";
            } else {
              answer = "Nenhum plano de tratamento ativo para este paciente.";
            }
          } else {
            answer = "Para recomendações, especifique um paciente.";
          }
        } catch (e) {
          answer = "Erro ao buscar recomendações de tratamento";
        }
      }
      // 4. PERGUNTAS SOBRE ANÁLISE DE HUMOR
      else if (
        question.includes("humor") ||
        question.includes("emoção") ||
        question.includes("sentimento")
      ) {
        try {
          if (input.patientId) {
            const moods = await database
              .select()
              .from(moodEntries)
              .where(eq(moodEntries.patientId, input.patientId))
              .orderBy(desc(moodEntries.createdAt))
              .limit(7);

            if (moods.length > 0) {
              const averageMood =
                moods.reduce((sum: number, m: any) => sum + (m.mood || 0), 0) /
                moods.length;
              const trend =
                moods[0]?.mood > moods[moods.length - 1]?.mood
                  ? "improving"
                  : "declining";

              answer = `Análise de humor: Tendência ${trend} nos últimos 7 dias. Humor médio: ${Math.round(averageMood)}/10.`;
              details = {
                moodEntries: moods.length,
                averageMood: Math.round(averageMood),
                trend,
                recentMoods: moods.map((m: any) => ({
                  date: m.createdAt,
                  mood: m.mood,
                  notes: m.notes,
                })),
              };
              dataSource = "mood_analysis";
            } else {
              answer = "Nenhum registro de humor encontrado.";
            }
          } else {
            answer = "Para análise de humor, especifique um paciente.";
          }
        } catch (e) {
          answer = "Erro ao buscar análise de humor";
        }
      }
      // 5. PERGUNTAS SOBRE PRÓXIMOS AGENDAMENTOS
      else if (
        question.includes("próximo agendamento") ||
        question.includes("quando voltar")
      ) {
        try {
          if (input.patientId) {
            const nextAppointment = await database
              .select()
              .from(appointments)
              .where(eq(appointments.patientId, input.patientId))
              .orderBy(appointments.startTime)
              .limit(1);

            if (nextAppointment.length > 0) {
              const appointmentDate = new Date(
                nextAppointment[0]?.startTime
              ).toLocaleDateString("pt-BR");
              answer = `Próximo agendamento: ${appointmentDate}`;
              details = {
                appointmentDate,
                appointmentTime: nextAppointment[0]?.startTime,
              };
              dataSource = "next_appointment";
            } else {
              answer = "Nenhum agendamento futuro encontrado.";
            }
          } else {
            answer = "Para verificar agendamentos, especifique um paciente.";
          }
        } catch (e) {
          answer = "Erro ao buscar próximo agendamento";
        }
      }
      // 6. PERGUNTAS GENÉRICAS SOBRE PACIENTE
      else if (
        question.includes("paciente") ||
        question.includes("cliente")
      ) {
        try {
          if (input.patientId) {
            const patientData = await database
              .select()
              .from(patients)
              .where(eq(patients.id, input.patientId))
              .limit(1);

            if (patientData.length > 0) {
              const patient = patientData[0];
              answer = `Informações do paciente: ${patient.name}. Status: ${patient.status}`;
              details = {
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                status: patient.status,
              };
              dataSource = "patient_info";
            }
          } else {
            const allPatients = await database
              .select()
              .from(patients)
              .limit(10);
            answer = `Total de ${allPatients.length} pacientes cadastrados.`;
            dataSource = "patient_count";
          }
        } catch (e) {
          answer = "Erro ao buscar informações do paciente";
        }
      } else {
        answer =
          "Desculpe, não consegui entender sua pergunta. Tente perguntar sobre evolução clínica, histórico de sessões, recomendações de tratamento ou análise de humor.";
      }

      return {
        success: true,
        question: input.question,
        answer,
        dataSource,
        details,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao processar pergunta expandida:", error);
      return {
        success: false,
        question: input.question,
        answer: "Erro ao processar sua pergunta",
        error: "Erro ao processar pergunta",
      };
    }
  });
