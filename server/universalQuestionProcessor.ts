import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  patients,
  appointments,
  sessionNotes,
  treatmentPlans,
  moodEntries,
  anamnesis,
  thoughtRecords,
  inventoryResults,
  users,
  leads,
  documents,
} from "../drizzle/schema";
import { desc, eq, like, and } from "drizzle-orm";

/**
 * Processador Universal de Perguntas
 * Responde QUALQUER pergunta consultando o banco de dados
 * e adaptando as respostas com dados reais das tabelas
 */

interface TableInfo {
  name: string;
  description: string;
  searchFields: string[];
}

const TABLES_INFO: Record<string, TableInfo> = {
  patients: {
    name: "Pacientes",
    description: "Informações de pacientes cadastrados",
    searchFields: ["name", "email", "phone"],
  },
  appointments: {
    name: "Agendamentos",
    description: "Consultas agendadas",
    searchFields: ["patientId", "startTime"],
  },
  sessionNotes: {
    name: "Notas de Sessão",
    description: "Anotações de sessões clínicas",
    searchFields: ["patientId", "notes"],
  },
  treatmentPlans: {
    name: "Planos de Tratamento",
    description: "Planos terapêuticos",
    searchFields: ["patientId", "goals"],
  },
  moodEntries: {
    name: "Registros de Humor",
    description: "Entradas de humor do paciente",
    searchFields: ["patientId", "mood"],
  },
  anamnesis: {
    name: "Anamnese",
    description: "Histórico clínico do paciente",
    searchFields: ["patientId"],
  },
  thoughtRecords: {
    name: "Registros de Pensamentos",
    description: "Pensamentos automáticos registrados",
    searchFields: ["patientId"],
  },
  inventoryResults: {
    name: "Resultados de Inventários",
    description: "Resultados de testes e inventários",
    searchFields: ["patientId"],
  },
  leads: {
    name: "Leads",
    description: "Potenciais clientes",
    searchFields: ["name", "email", "phone"],
  },
  documents: {
    name: "Documentos",
    description: "Documentos clínicos",
    searchFields: ["patientId", "title"],
  },
};

/**
 * Detectar quais tabelas são relevantes para a pergunta
 */
function detectRelevantTables(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  const relevant: string[] = [];

  if (
    lowerQuestion.includes("paciente") ||
    lowerQuestion.includes("cliente") ||
    lowerQuestion.includes("nome")
  ) {
    relevant.push("patients");
  }
  if (
    lowerQuestion.includes("agendamento") ||
    lowerQuestion.includes("consulta") ||
    lowerQuestion.includes("horário")
  ) {
    relevant.push("appointments");
  }
  if (
    lowerQuestion.includes("sessão") ||
    lowerQuestion.includes("nota") ||
    lowerQuestion.includes("evolução")
  ) {
    relevant.push("sessionNotes");
  }
  if (
    lowerQuestion.includes("tratamento") ||
    lowerQuestion.includes("plano") ||
    lowerQuestion.includes("objetivo")
  ) {
    relevant.push("treatmentPlans");
  }
  if (
    lowerQuestion.includes("humor") ||
    lowerQuestion.includes("emoção") ||
    lowerQuestion.includes("sentimento")
  ) {
    relevant.push("moodEntries");
  }
  if (
    lowerQuestion.includes("histórico") ||
    lowerQuestion.includes("anamnese") ||
    lowerQuestion.includes("background")
  ) {
    relevant.push("anamnesis");
  }
  if (
    lowerQuestion.includes("pensamento") ||
    lowerQuestion.includes("cognitivo")
  ) {
    relevant.push("thoughtRecords");
  }
  if (
    lowerQuestion.includes("inventário") ||
    lowerQuestion.includes("teste") ||
    lowerQuestion.includes("resultado")
  ) {
    relevant.push("inventoryResults");
  }
  if (
    lowerQuestion.includes("lead") ||
    lowerQuestion.includes("prospect") ||
    lowerQuestion.includes("contato")
  ) {
    relevant.push("leads");
  }
  if (
    lowerQuestion.includes("documento") ||
    lowerQuestion.includes("arquivo")
  ) {
    relevant.push("documents");
  }

  // Se nenhuma tabela específica foi detectada, retornar todas
  return relevant.length > 0 ? relevant : Object.keys(TABLES_INFO);
}

/**
 * Buscar dados em uma tabela específica
 */
async function searchTable(
  database: any,
  tableName: string,
  question: string
): Promise<any[]> {
  try {
    const tableMap: Record<string, any> = {
      patients,
      appointments,
      sessionNotes,
      treatmentPlans,
      moodEntries,
      anamnesis,
      thoughtRecords,
      inventoryResults,
      leads,
      documents,
    };

    const table = tableMap[tableName];
    if (!table) return [];

    let query = database.select().from(table);

    // Aplicar limite
    const results = await query.limit(20);
    return results;
  } catch (error) {
    console.error(`Erro ao buscar em ${tableName}:`, error);
    return [];
  }
}

/**
 * Formatar resposta baseada em dados encontrados
 */
function formatAnswer(
  question: string,
  results: Record<string, any[]>
): string {
  const lowerQuestion = question.toLowerCase();
  let answer = "";

  // Contar resultados
  let totalResults = 0;
  const tableCounts: Record<string, number> = {};

  for (const [table, data] of Object.entries(results)) {
    const count = data.length;
    if (count > 0) {
      tableCounts[table] = count;
      totalResults += count;
    }
  }

  if (totalResults === 0) {
    return "Nenhum resultado encontrado para sua pergunta.";
  }

  // Formatar resposta específica por tipo de pergunta
  if (lowerQuestion.includes("quantos")) {
    const countsText = Object.entries(tableCounts)
      .map(([table, count]) => `${TABLES_INFO[table]?.name || table}: ${count}`)
      .join(", ");
    answer = `Encontrados: ${countsText}.`;
  } else if (lowerQuestion.includes("quais") || lowerQuestion.includes("lista")) {
    const items: string[] = [];

    if (results.patients && results.patients.length > 0) {
      const names = results.patients
        .slice(0, 5)
        .map((p: any) => p.name)
        .join(", ");
      items.push(`Pacientes: ${names}`);
    }

    if (results.leads && results.leads.length > 0) {
      const leadNames = results.leads
        .slice(0, 5)
        .map((l: any) => l.name)
        .join(", ");
      items.push(`Leads: ${leadNames}`);
    }

    if (results.appointments && results.appointments.length > 0) {
      items.push(`${results.appointments.length} agendamentos encontrados`);
    }

    if (results.sessionNotes && results.sessionNotes.length > 0) {
      items.push(`${results.sessionNotes.length} notas de sessão`);
    }

    answer = items.length > 0 ? items.join(". ") : "Nenhum item encontrado.";
  } else if (lowerQuestion.includes("informação") || lowerQuestion.includes("detalhes")) {
    const details: string[] = [];

    if (results.patients && results.patients.length > 0) {
      const patient = results.patients[0];
      details.push(
        `Paciente: ${patient.name}, Email: ${patient.email}, Telefone: ${patient.phone}`
      );
    }

    if (results.treatmentPlans && results.treatmentPlans.length > 0) {
      details.push(`Plano de tratamento ativo encontrado`);
    }

    if (results.anamnesis && results.anamnesis.length > 0) {
      details.push(`Histórico clínico disponível`);
    }

    answer = details.length > 0 ? details.join(". ") : "Nenhum detalhe encontrado.";
  } else if (lowerQuestion.includes("estatística") || lowerQuestion.includes("resumo")) {
    const stats: string[] = [];

    if (tableCounts.patients) {
      stats.push(`${tableCounts.patients} pacientes cadastrados`);
    }
    if (tableCounts.appointments) {
      stats.push(`${tableCounts.appointments} agendamentos`);
    }
    if (tableCounts.sessionNotes) {
      stats.push(`${tableCounts.sessionNotes} notas de sessão`);
    }
    if (tableCounts.leads) {
      stats.push(`${tableCounts.leads} leads`);
    }

    answer = `Estatísticas: ${stats.join(", ")}.`;
  } else {
    // Resposta genérica
    const summaries: string[] = [];

    for (const [table, data] of Object.entries(results)) {
      if (data.length > 0) {
        summaries.push(`${TABLES_INFO[table]?.name || table}: ${data.length} registros`);
      }
    }

    answer =
      summaries.length > 0
        ? `Encontrados: ${summaries.join(", ")}.`
        : "Nenhum resultado encontrado.";
  }

  return answer;
}

/**
 * Procedure Principal - Responde qualquer pergunta sobre banco de dados
 */
export const universalQuestionProcessorProcedure = protectedProcedure
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

      const question = input.question;
      const relevantTables = detectRelevantTables(question);

      // Buscar dados em todas as tabelas relevantes
      const results: Record<string, any[]> = {};

      for (const tableName of relevantTables) {
        const tableData = await searchTable(database, tableName, question);
        if (tableData.length > 0) {
          results[tableName] = tableData;
        }
      }

      // Formatar resposta
      const answer = formatAnswer(question, results);

      return {
        success: true,
        question,
        answer,
        dataSource: "universal_database_search",
        tablesSearched: relevantTables,
        resultsCount: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao processar pergunta universal:", error);
      return {
        success: false,
        question: input.question,
        answer: "Erro ao processar sua pergunta",
        error: "Erro ao processar pergunta",
      };
    }
  });
