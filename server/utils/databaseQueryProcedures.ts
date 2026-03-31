import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../core_logic/db";
import { eq, like } from "drizzle-orm";
import { patients, appointments, sessionNotes } from "../../drizzle/schema";

/**
 * Procedures para buscar dados reais do banco de dados
 */

/**
 * Listar todos os pacientes cadastrados
 */
export const listPatientsProcedure = protectedProcedure.query(async () => {
  try {
    const database = await getDb();
    if (!database) {
      return {
        success: false,
        count: 0,
        patients: [],
        error: "Database connection failed",
      };
    }
    const allPatients = await database.select().from(patients).limit(100);

    return {
      success: true,
      count: allPatients.length,
      patients: allPatients.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        status: p.status,
      })),
    };
  } catch (error) {
    console.error("Erro ao listar pacientes:", error);
    return {
      success: false,
      count: 0,
      patients: [],
      error: "Erro ao listar pacientes",
    };
  }
});

/**
 * Processar pergunta e buscar resposta nos dados
 */
export const processQuestionWithDataProcedure = protectedProcedure
  .input(
    z.object({
      question: z.string(),
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

      // Detectar tipo de pergunta e buscar nos dados reais
      if (
        question.includes("quantos") &&
        (question.includes("paciente") || question.includes("cliente"))
      ) {
        // Pergunta sobre quantidade de pacientes
        try {
          const allPatients = await database.select().from(patients);
          const activePatients = allPatients.filter(
            (p: any) => p.status === "active"
          ).length;
          const totalPatients = allPatients.length;
          answer = `Existem ${totalPatients} pacientes cadastrados no total, sendo ${activePatients} ativos.`;
          dataSource = "statistics";
        } catch (e) {
          answer = "Erro ao buscar dados de pacientes";
        }
      } else if (
        question.includes("agendamento") ||
        question.includes("consulta")
      ) {
        // Pergunta sobre agendamentos
        try {
          const upcomingAppointments = await database
            .select()
            .from(appointments)
            .limit(20);
          const count = upcomingAppointments.length;
          answer = `Existem ${count} agendamentos cadastrados.`;
          dataSource = "appointments";
        } catch (e) {
          answer = "Erro ao buscar dados de agendamentos";
        }
      } else if (question.includes("paciente") && question.includes("nome")) {
        // Buscar paciente por nome
        try {
          const allPatients = await database
            .select()
            .from(patients)
            .limit(5);
          if (allPatients.length > 0) {
            const patientNames = allPatients
              .map((p: any) => p.name)
              .join(", ");
            answer = `Os pacientes cadastrados incluem: ${patientNames}`;
            dataSource = "patients";
          } else {
            answer = "Nenhum paciente encontrado";
          }
        } catch (e) {
          answer = "Erro ao buscar dados de pacientes";
        }
      } else if (question.includes("hoje")) {
        // Pergunta sobre hoje
        try {
          const allAppointments = await database
            .select()
            .from(appointments);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const appointmentsToday = allAppointments.filter((a: any) => {
            const appointmentDate = new Date(a.startTime);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate.getTime() === today.getTime();
          }).length;
          answer = `Hoje existem ${appointmentsToday} agendamentos.`;
          dataSource = "statistics";
        } catch (e) {
          answer = "Erro ao buscar dados";
        }
      } else if (question.includes("sessão") || question.includes("consulta")) {
        // Pergunta sobre sessões/notas
        try {
          const notes = await database.select().from(sessionNotes).limit(10);
          const count = notes.length;
          answer = `Existem ${count} notas de sessão cadastradas.`;
          dataSource = "sessions";
        } catch (e) {
          answer = "Erro ao buscar dados de sessões";
        }
      } else {
        // Resposta genérica
        answer =
          "Desculpe, não consegui encontrar informações sobre sua pergunta. Tente perguntar sobre pacientes, agendamentos ou consultas.";
      }

      return {
        success: true,
        question: input.question,
        answer,
        dataSource,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao processar pergunta:", error);
      return {
        success: false,
        question: input.question,
        answer: "Erro ao processar sua pergunta",
        error: "Erro ao processar pergunta",
      };
    }
  });
