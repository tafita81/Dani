import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { patients, sessionNotes, appointments, moodEntries, anamnesis, treatmentPlans, sessionEvolutions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * LLM Agent para Assistente de Carro
 * Acessa TODAS as tabelas e fornece respostas contextualizadas como psicólogo experiente
 * Latência < 1 segundo
 */

export interface PatientContext {
  patient: any;
  sessions: any[];
  appointments: any[];
  moodHistory: any[];
  anamnesis: any[];
  treatmentPlan: any;
  sessionEvolutions: any[];
}

/**
 * Busca contexto completo do paciente
 */
async function getPatientContext(patientId: number): Promise<PatientContext> {
  const startTime = Date.now();

  // Buscar dados em paralelo para minimizar latência
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [patient, sessions, appointmentsList, moodHistory, anamnesisData, treatmentPlan, evolutions] = await Promise.all([
    db.select().from(patients).where(eq(patients.id, patientId)).limit(1).then(r => r[0]),
    db.select().from(sessionNotes).where(eq(sessionNotes.patientId, patientId)).limit(10),
    db.select().from(appointments).where(eq(appointments.patientId, patientId)).limit(5),
    db.select().from(moodEntries).where(eq(moodEntries.patientId, patientId)).limit(20),
    db.select().from(anamnesis).where(eq(anamnesis.patientId, patientId)).limit(1),
    db.select().from(treatmentPlans).where(eq(treatmentPlans.patientId, patientId)).limit(1).then(r => r[0]),
    db.select().from(sessionEvolutions).where(eq(sessionEvolutions.patientId, patientId)).limit(5),
  ]);

  const latency = Date.now() - startTime;
  console.log(`✓ Patient context loaded in ${latency}ms`);

  return {
    patient,
    sessions,
    appointments: appointmentsList,
    moodHistory,
    anamnesis: anamnesisData,
    treatmentPlan,
    sessionEvolutions: evolutions,
  };
}

/**
 * Formata contexto do paciente para o LLM
 */
function formatPatientContext(context: PatientContext): string {
  const patient = context.patient;
  const latestSession = context.sessions?.[0];
  const latestMood = context.moodHistory?.[0];
  const treatmentPlan = context.treatmentPlan;

  return `
CONTEXTO DO PACIENTE:
=====================

DADOS PESSOAIS:
- Nome: ${patient?.name}
- Email: ${patient?.email}
- Telefone: ${patient?.phone}
- Data de Nascimento: ${patient?.birthDate}
- Gênero: ${patient?.gender}
- Ocupação: ${patient?.occupation}
- Estado Civil: ${patient?.maritalStatus}
- Filhos: ${patient?.children}
- Educação: ${patient?.educationLevel}
- Renda: ${patient?.income}

ENDEREÇO:
- Rua: ${patient?.addressStreet}
- Número: ${patient?.addressNumber}
- Complemento: ${patient?.addressComplement}
- Cidade: ${patient?.addressCity}
- Estado: ${patient?.addressState}
- CEP: ${patient?.addressZip}

TIPO DE ATENDIMENTO:
- Modalidade: ${patient?.attendanceType}
- Pagamento: ${patient?.paymentType}
- Plano de Saúde: ${patient?.healthPlan}

HISTÓRICO MÉDICO:
- Histórico Médico: ${patient?.medicalHistory}
- Medicações: ${JSON.stringify(patient?.medications)}
- Alergias: ${JSON.stringify(patient?.allergies)}
- Terapias Anteriores: ${JSON.stringify(patient?.previousTherapies)}
- Histórico Psiquiátrico: ${patient?.psychiatricHistory}
- Histórico Familiar: ${patient?.familyHistory}
- Histórico Social: ${patient?.socialHistory}
- Uso de Substâncias: ${JSON.stringify(patient?.substanceUse)}
- Risco de Suicídio: ${patient?.suicideRisk}

ÚLTIMA SESSÃO:
${latestSession ? `
- Data: ${latestSession.createdAt}
- Resumo: ${latestSession.summary}
- Temas: ${latestSession.keyThemes}
- Análise Emocional: ${latestSession.emotionalAnalysis}
- Sugestões: ${latestSession.aiSuggestions}
` : "Nenhuma sessão registrada"}

HUMOR ATUAL:
${latestMood ? `
- Score: ${latestMood.score}/10
- Emoção: ${latestMood.emotion}
- Notas: ${latestMood.notes}
` : "Nenhum registro de humor"}

PLANO DE TRATAMENTO:
${treatmentPlan ? `
- Objetivo: ${treatmentPlan.goal}
- Duração: ${treatmentPlan.duration}
- Técnicas: ${treatmentPlan.techniques}
- Progresso: ${treatmentPlan.progress}
` : "Nenhum plano ativo"}

HISTÓRICO DE EVOLUÇÃO:
${context.sessionEvolutions?.length > 0 ? context.sessionEvolutions.map(e => `- ${e.createdAt}: ${e.notes}`).join('\n') : "Nenhuma evolução registrada"}
`;
}

/**
 * LLM Agent que responde perguntas sobre o paciente
 */
export async function queryPatientAssistant(patientId: number, question: string): Promise<string> {
  const startTime = Date.now();

  try {
    // Buscar contexto do paciente
    const context = await getPatientContext(patientId);
    const formattedContext = formatPatientContext(context);

    // Chamar LLM com contexto completo
    const response = await invokeLLM({
      messages: [
      {
        role: "system",
        content: `Você é um psicólogo clínico altamente experiente e compassivo. 
Você tem acesso ao histórico completo do paciente e deve fornecer respostas contextualizadas, 
baseadas em dados reais e em técnicas psicológicas comprovadas.

Instruções:
1. Responda com base no contexto do paciente
2. Cite dados específicos quando relevante
3. Forneça sugestões práticas e técnicas baseadas no histórico
4. Seja empático e profissional
5. Se não tiver informação, seja honesto sobre isso
6. Sugira próximos passos quando apropriado

${formattedContext}`,
      },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const latency = Date.now() - startTime;
    console.log(`✓ LLM response generated in ${latency}ms`);

    const answer = response.choices?.[0]?.message?.content;
    const answerText = typeof answer === 'string' ? answer : "Desculpe, não consegui gerar uma resposta.";
    return answerText;
  } catch (error) {
    console.error("Erro no LLM Agent:", error);
    throw error;
  }
}

/**
 * Análise rápida do paciente para sugestões em tempo real
 */
export async function getRealtimeSuggestions(patientId: number): Promise<string> {
  const context = await getPatientContext(patientId);
  const formattedContext = formatPatientContext(context);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um psicólogo clínico experiente. Com base no histórico do paciente, 
forneça 3-5 sugestões práticas e específicas para a sessão de hoje.

${formattedContext}

Formato: Lista numerada com sugestões concretas e acionáveis.`,
      },
      {
        role: "user",
        content: "Quais são as melhores técnicas e abordagens para esta sessão?",
      },
    ],
  });

  const answer = response.choices?.[0]?.message?.content;
  return typeof answer === 'string' ? answer : "";
}
