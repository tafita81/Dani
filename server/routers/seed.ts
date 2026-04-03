import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  patients,
  appointments,
  leads,
  sessionNotes,
  treatmentPlans,
  anamnesis,
  inventoryResults,
  cognitiveConcepts,
  moodEntries,
  leadInteractions,
  sessionEvolutions,
} from "../../drizzle/schema";
import { z } from "zod";

const firstNames = [
  "Ana", "Bruno", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena",
  "Igor", "Julia", "Kevin", "Laura", "Marcelo", "Natalia", "Oscar", "Patricia",
  "Quentin", "Rafaela", "Samuel", "Tania", "Ulisses", "Vanessa", "Wagner", "Ximena",
  "Yuri", "Zelia", "Adriano", "Beatriz", "Camila", "Diego", "Elisa", "Felipe",
  "Gabriela", "Henrique", "Iris", "Joao", "Karina", "Leonardo", "Mariana", "Nicolas",
  "Olivia", "Paulo", "Quintino", "Rosana", "Sandra", "Thiago", "Ursula", "Vinicius",
  "Wanda", "Xavier", "Yasmin", "Zoe", "Alessandra", "Bernardo", "Cecilia", "Danilo",
  "Emilia", "Fabio", "Giancarlo", "Humberto", "Ivana", "Julio", "Katia", "Leandro",
  "Miriam", "Norberto", "Otavio", "Priscila", "Quirino", "Ronaldo", "Silvia", "Tarciso",
  "Ubaldo", "Viviane", "Waldemar", "Ximenes", "Yara", "Zelia",
];

const lastNames = [
  "Silva", "Santos", "Oliveira", "Souza", "Costa", "Ferreira", "Rodrigues", "Martins",
  "Pereira", "Gomes", "Alves", "Carvalho", "Ribeiro", "Rocha", "Mendes", "Dias",
  "Barbosa", "Neves", "Campos", "Lopes", "Monteiro", "Freitas", "Teixeira", "Pinto",
  "Machado", "Cavalcanti", "Medeiros", "Moreira", "Vieira", "Correia",
];

const genders = ["M", "F", "other"];
const statuses = ["active", "inactive", "waitlist"];
const leadStages = ["lead", "prospect", "scheduled", "converted", "lost"];
const sources = ["instagram", "whatsapp", "telegram", "site", "tiktok", "other"];
const approaches = ["CBT", "ACT", "Psychodynamic", "Humanistic", "Systemic", "Gestalt"];
const techniques = [
  "Cognitive Restructuring",
  "Exposure Therapy",
  "Mindfulness",
  "Behavioral Activation",
  "Thought Records",
  "Values Clarification",
  "Acceptance",
  "Metaphors",
];

// Realistic session transcripts in Portuguese
const sessionTranscripts = [
  `Paciente: Oi, como vai? Tive uma semana difícil. Meu chefe me criticou bastante no trabalho.
Terapeuta: Entendo. Como você se sentiu com essa crítica?
Paciente: Muito mal. Achei que tinha feito um bom trabalho, mas parece que não. Agora estou pensando que sou incompetente.
Terapeuta: Vamos explorar esse pensamento. Qual é a evidência de que você é incompetente?
Paciente: Bem, quando penso assim... na verdade, tenho vários projetos bem-sucedidos. Talvez tenha sido só um feedback.
Terapeuta: Exatamente. Parece que você está generalizando uma crítica específica para sua competência geral.`,

  `Paciente: Tenho tido muita ansiedade à noite. Fico pensando em coisas ruins que podem acontecer.
Terapeuta: Que tipo de coisas você imagina?
Paciente: Acidentes, doenças, problemas financeiros. É como se meu cérebro procurasse por perigos.
Terapeuta: Vamos tentar uma técnica de exposição. Você pode imaginar um desses cenários e observar o que acontece com a ansiedade?
Paciente: Tudo bem... estou imaginando um acidente de carro. Meu coração está acelerado.
Terapeuta: Ótimo. Agora apenas observe. A ansiedade vai aumentar, atingir um pico e depois diminuir naturalmente.`,

  `Paciente: Meu relacionamento está em crise. Meu parceiro diz que sou muito controladora.
Terapeuta: Como você reage quando ele diz isso?
Paciente: Fico defensiva. Acho que é porque tenho medo de que ele me deixe.
Terapeuta: Interessante. Parece que o comportamento controlador é uma tentativa de evitar o abandono. Isso é verdade?
Paciente: Sim, acho que é. Quando criança, meu pai saiu de casa. Acho que desde então tenho medo de perder as pessoas.
Terapeuta: Vamos trabalhar em aceitar essa incerteza e desenvolver confiança no relacionamento.`,

  `Paciente: Estou tendo dificuldade para dormir. Fico acordado até 3 da manhã pensando em trabalho.
Terapeuta: Qual é o seu padrão de sono ideal?
Paciente: Eu gostaria de dormir 7-8 horas, mas estou conseguindo apenas 4-5.
Terapeuta: Vamos fazer uma higiene do sono. Primeiro, vamos estabelecer um horário regular de dormir.
Paciente: Tudo bem. Vou tentar ir para a cama às 22h e acordar às 6h.`,

  `Paciente: Tenho me sentido muito deprimido ultimamente. Perdi a vontade de fazer as coisas que gosto.
Terapeuta: Quanto tempo isso está acontecendo?
Paciente: Uns 3 meses. Comecei a me isolar, não saio mais com amigos.
Terapeuta: Vamos fazer ativação comportamental. Você pode escolher uma atividade pequena para fazer hoje?
Paciente: Acho que posso ligar para um amigo e marcar um café.
Terapeuta: Excelente. Isso é um passo importante.`,
];

// AI Analysis suggestions
const aiAnalyses = [
  "Paciente apresenta padrão de generalização cognitiva. Recomenda-se trabalhar com reestruturação cognitiva e registro de pensamentos. Progresso: moderado. Próximo passo: técnicas de mindfulness para observação de pensamentos.",

  "Ansiedade significativa com sintomas de catastrofização. Exposição gradual está sendo eficaz. Recomenda-se continuar com exposição e adicionar técnicas de relaxamento. Progresso: bom. Próximo passo: exposição a situações reais.",

  "Dinâmica relacional com padrão de apego inseguro. Trabalho com aceitação e confiança é essencial. Recomenda-se terapia de casal se parceiro concordar. Progresso: em andamento. Próximo passo: sessão com casal.",

  "Insônia relacionada a estresse ocupacional. Higiene do sono e técnicas de relaxamento recomendadas. Recomenda-se manter rotina consistente. Progresso: bom. Próximo passo: avaliação de meditação guiada.",

  "Depressão moderada com anedonia. Ativação comportamental está mostrando resultados. Recomenda-se aumentar frequência de atividades prazerosas. Progresso: moderado. Próximo passo: avaliação de medicação com psiquiatra.",
];

// AI Suggestions for next sessions
const aiSuggestions = [
  [
    "Continuar reestruturação cognitiva com foco em pensamentos automáticos",
    "Introduzir técnicas de mindfulness para observação de padrões cognitivos",
    "Trabalhar com aceitação de incerteza",
  ],
  [
    "Aumentar exposição gradual a situações ansiogênicas",
    "Praticar técnicas de respiração diafragmática",
    "Manter registro de ansiedade e gatilhos",
  ],
  [
    "Explorar padrão de apego e origem do medo de abandono",
    "Trabalhar com comunicação assertiva no relacionamento",
    "Considerar terapia de casal",
  ],
  [
    "Manter rotina de sono consistente",
    "Praticar relaxamento progressivo antes de dormir",
    "Avaliar necessidade de meditação guiada",
  ],
  [
    "Aumentar atividades prazerosas e sociais",
    "Monitorar sintomas depressivos com PHQ-9",
    "Avaliar necessidade de medicação com psiquiatra",
  ],
];

// Key themes identified
const keyThemes = [
  ["Generalização cognitiva", "Autocrítica", "Perfeccionismo"],
  ["Ansiedade antecipatória", "Catastrofização", "Intolerância à incerteza"],
  ["Medo de abandono", "Padrão de apego inseguro", "Controle como mecanismo de defesa"],
  ["Insônia", "Estresse ocupacional", "Ruminação noturna"],
  ["Depressão", "Anedonia", "Isolamento social"],
];

function generateEmail(firstName: string, lastName: string) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
}

function generatePhone() {
  const areaCode = String(Math.floor(Math.random() * 90) + 10);
  const firstPart = String(Math.floor(Math.random() * 90000) + 10000);
  const secondPart = String(Math.floor(Math.random() * 9000) + 1000);
  return `(${areaCode}) ${firstPart}-${secondPart}`;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(randomElement(array));
  }
  return result;
}

export const seedRouter = router({
  populate: protectedProcedure
    .input(z.object({
      patientCount: z.number().default(50),
      appointmentCount: z.number().default(150),
      leadCount: z.number().default(20),
      sessionsPerPatient: z.number().default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        console.log("[Seed] Starting population with comprehensive data...");

        // Insert patients
        const patientIds: number[] = [];
        for (let i = 0; i < input.patientCount; i++) {
          const firstName = randomElement(firstNames);
          const lastName = randomElement(lastNames);
          const email = generateEmail(firstName, lastName);
          const phone = generatePhone();
          const gender = randomElement(genders) as "M" | "F" | "other";
          const status = randomElement(statuses) as "active" | "inactive" | "waitlist";

          const birthYear = Math.floor(Math.random() * 50) + 1960;
          const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
          const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
          const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

          const occupations = ["Engenheiro", "Professor", "Médico", "Advogado", "Empresário", "Desenvolvedor", "Contador", "Psicólogo", "Enfermeiro", "Arquiteto", "Gerente", "Consultor"];
          const occupation = randomElement(occupations);

          const result = await (db as any).insert(patients).values({
            userId: ctx.user.id,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            birthDate,
            gender,
            occupation,
            status,
            notes: `Paciente ${status}. Origem: indicação. Primeira consulta: ${new Date().toLocaleDateString("pt-BR")}`,
          });

          const patientId = (result as any)[0];
          patientIds.push(patientId);

          // Insert anamnesis for each patient
          await (db as any).insert(anamnesis).values({
            patientId,
            mainComplaint: randomElement([
              "Ansiedade generalizada",
              "Depressão",
              "Problemas de relacionamento",
              "Insônia",
              "Estresse ocupacional",
              "Baixa autoestima",
            ]),
            history: "Paciente relata sintomas há aproximadamente 6 meses. Sem histórico de tratamento anterior.",
            familyHistory: "Mãe com histórico de ansiedade. Pai falecido há 10 anos.",
            medicalHistory: "Sem doenças crônicas. Alergias: nenhuma conhecida.",
            medications: [],
            previousTherapy: Math.random() > 0.5,
            previousTherapyDetails: "Terapia anterior com psicólogo há 2 anos, duração de 6 meses.",
            sleepPattern: randomElement(["6-7 horas", "7-8 horas", "5-6 horas", "Irregular"]),
            exerciseHabits: randomElement(["Sedentário", "1-2x por semana", "3-4x por semana", "Diário"]),
            substanceUse: "Café: 2-3 xícaras por dia. Álcool: ocasional.",
            socialSupport: "Família presente. Amigos próximos. Relacionamento estável.",
            workSituation: "Empregado. Trabalho estressante. Satisfação moderada.",
            completed: true,
          });

          // Insert cognitive concepts
          await (db as any).insert(cognitiveConcepts).values({
            patientId,
            coreBeliefs: [
              "Sou inadequado",
              "As pessoas vão me abandonar",
              "O mundo é perigoso",
            ],
            intermediateBeliefs: [
              "Se eu não for perfeito, serei rejeitado",
              "Devo sempre estar no controle",
            ],
            automaticThoughts: [
              "Vou fracassar",
              "Ninguém gosta de mim",
              "Algo ruim vai acontecer",
            ],
            compensatoryStrategies: [
              "Perfeccionismo",
              "Evitação",
              "Controle",
            ],
            triggers: [
              "Crítica",
              "Incerteza",
              "Separação",
            ],
          });

          // Insert treatment plan
          await (db as any).insert(treatmentPlans).values({
            patientId,
            goals: [
              { goal: "Reduzir ansiedade em 50%", achieved: false },
              { goal: "Melhorar qualidade do sono", achieved: false },
              { goal: "Aumentar atividades prazerosas", achieved: false },
            ],
            approach: randomElement(approaches),
            techniques: randomElements(techniques, 3),
            estimatedSessions: 12,
            frequency: "Semanal",
            active: true,
          });

          // Insert inventory results (psychological tests)
          const inventoryTypes = ["BDI-II", "BAI", "PHQ-9", "GAD-7"];
          for (const type of inventoryTypes) {
            const answers: Record<string, number> = {};
            for (let j = 0; j < 21; j++) {
              answers[`q${j + 1}`] = Math.floor(Math.random() * 4);
            }
            const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);

            await (db as any).insert(inventoryResults).values({
              patientId,
              type: type as any,
              answers,
              totalScore,
              interpretation: totalScore > 20 ? "Moderado a Grave" : "Leve a Moderado",
              administeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            });
          }

          // Insert mood entries
          for (let j = 0; j < 10; j++) {
            await (db as any).insert(moodEntries).values({
              patientId,
              score: Math.floor(Math.random() * 10) + 1,
              emotion: randomElement(["Ansioso", "Triste", "Calmo", "Feliz", "Irritado", "Neutro"]),
              notes: "Registro diário de humor",
              recordedAt: new Date(Date.now() - j * 24 * 60 * 60 * 1000),
            });
          }
        }

        console.log(`[Seed] Created ${patientIds.length} patients with anamnesis, cognitive concepts, treatment plans, and mood entries`);

        // Insert appointments
        for (let i = 0; i < input.appointmentCount; i++) {
          const patientId = patientIds[i % patientIds.length];
          const startDate = new Date();
          startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
          startDate.setHours(Math.floor(Math.random() * 12) + 9, 0, 0, 0);

          const endDate = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + 50);

          const type = randomElement(["online", "presential"]) as "online" | "presential";
          const status = randomElement(["scheduled", "confirmed", "done", "cancelled"]) as "scheduled" | "confirmed" | "done" | "cancelled";

          await (db as any).insert(appointments).values({
            userId: ctx.user.id,
            patientId,
            title: "Sessão Individual",
            startTime: startDate,
            endTime: endDate,
            type,
            status,
            notes: "Sessão de psicoterapia individual",
          });
        }

        console.log(`[Seed] Created ${input.appointmentCount} appointments`);

        // Insert session notes with transcripts and AI analysis
        let sessionCount = 0;
        for (const patientId of patientIds) {
          for (let j = 0; j < input.sessionsPerPatient; j++) {
            const appointmentDate = new Date();
            appointmentDate.setDate(appointmentDate.getDate() - (input.sessionsPerPatient - j) * 7);

            const transcriptIdx = j % sessionTranscripts.length;
            const analysisIdx = j % aiAnalyses.length;

            await (db as any).insert(sessionNotes).values({
              userId: ctx.user.id,
              patientId,
              transcript: sessionTranscripts[transcriptIdx],
              summary: aiAnalyses[analysisIdx],
              keyThemes: keyThemes[analysisIdx],
              interventions: randomElements(techniques, 2),
              homework: randomElement([
                "Realizar 3 registros de pensamentos automáticos",
                "Praticar respiração diafragmática 2x por dia",
                "Aumentar atividades prazerosas em 30 minutos",
                "Manter diário de humor",
                "Ler capítulo do livro recomendado",
              ]),
              nextSession: "Continuar com as técnicas iniciadas. Avaliar progresso.",
              aiSuggestions: aiSuggestions[analysisIdx],
              createdAt: appointmentDate,
            });

            sessionCount++;

            // Insert session evolution
            if (j > 0) {
              await (db as any).insert(sessionEvolutions).values({
                patientId,
                period: `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, "0")}`,
                progressScore: Math.floor(Math.random() * 40) + 60,
                observations: "Paciente apresentando progresso consistente. Aderência ao tratamento é boa.",
              });
            }
          }
        }

        console.log(`[Seed] Created ${sessionCount} session notes with transcripts and AI analysis`);

        // Insert leads
        for (let i = 0; i < input.leadCount; i++) {
          const firstName = randomElement(firstNames);
          const lastName = randomElement(lastNames);
          const email = generateEmail(firstName, lastName);
          const phone = generatePhone();
          const stage = randomElement(leadStages) as "lead" | "prospect" | "scheduled" | "converted" | "lost";
          const source = randomElement(sources) as "instagram" | "whatsapp" | "telegram" | "site" | "tiktok" | "other";

          const result = await (db as any).insert(leads).values({
            userId: ctx.user.id,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            stage,
            source,
            notes: `Lead originário de ${source}. Interesse em psicoterapia.`,
          });

          const leadId = (result as any)[0];

          // Insert lead interactions
          for (let j = 0; j < 3; j++) {
            await (db as any).insert(leadInteractions).values({
              leadId,
              type: randomElement(["call", "email", "whatsapp", "meeting"]) as any,
              notes: "Contato realizado. Lead mostrou interesse.",
              interactedAt: new Date(Date.now() - j * 24 * 60 * 60 * 1000),
            });
          }
        }

        console.log(`[Seed] Created ${input.leadCount} leads with interactions`);

        return {
          success: true,
          message: `✅ Banco populado com dados completos:
- ${patientIds.length} pacientes com anamnese, conceitos cognitivos, planos de tratamento
- ${sessionCount} sessões com transcrições completas e análises de IA
- ${input.appointmentCount} agendamentos
- ${input.leadCount} leads com interações
- Todas as tabelas interligadas por patientId`,
          stats: {
            patients: patientIds.length,
            sessions: sessionCount,
            appointments: input.appointmentCount,
            leads: input.leadCount,
          },
        };
      } catch (error) {
        console.error("[Seed] Error:", error);
        throw new Error(`Erro ao popular banco de dados: ${error}`);
      }
    }),
});
