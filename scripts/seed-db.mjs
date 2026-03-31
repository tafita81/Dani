import { db } from "./server/db.ts";
import * as schema from "./drizzle/schema.ts";

async function seedDatabase() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // 1. Criar psicóloga (owner)
    const psychologist = await db.insert(schema.users).values({
      id: "psi-daniela-001",
      email: "daniela@clinica.com",
      name: "Psicóloga Daniela Coelho",
      role: "admin",
      createdAt: new Date(),
    }).returning();

    console.log("✅ Psicóloga criada:", psychologist[0].name);

    // 2. Criar pacientes de teste
    const patients = await db.insert(schema.patients).values([
      {
        id: "pac-001",
        therapistId: psychologist[0].id,
        name: "João Silva",
        email: "joao@email.com",
        phone: "11999999999",
        status: "active",
        createdAt: new Date(),
      },
      {
        id: "pac-002",
        therapistId: psychologist[0].id,
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "11988888888",
        status: "active",
        createdAt: new Date(),
      },
      {
        id: "pac-003",
        therapistId: psychologist[0].id,
        name: "Carlos Oliveira",
        email: "carlos@email.com",
        phone: "11977777777",
        status: "active",
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Pacientes criados:", patients.length);

    // 3. Criar agendamentos
    const appointments = await db.insert(schema.appointments).values([
      {
        id: "apt-001",
        patientId: patients[0].id,
        therapistId: psychologist[0].id,
        date: new Date(Date.now() + 86400000), // amanhã
        time: "10:00",
        status: "scheduled",
        createdAt: new Date(),
      },
      {
        id: "apt-002",
        patientId: patients[1].id,
        therapistId: psychologist[0].id,
        date: new Date(Date.now() + 172800000), // em 2 dias
        time: "14:00",
        status: "scheduled",
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Agendamentos criados:", appointments.length);

    // 4. Criar avaliações (TCC)
    const thoughtRecords = await db.insert(schema.thoughtRecords).values([
      {
        id: "tr-001",
        patientId: patients[0].id,
        therapistId: psychologist[0].id,
        situation: "Apresentação no trabalho",
        automaticThought: "Vou falhar e todos vão me julgar",
        emotion: "Ansiedade",
        emotionIntensity: 8,
        evidence: "Já fiz apresentações bem antes",
        alternativeThought: "Tenho experiência e posso fazer bem",
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Registros de Pensamento (TCC) criados:", thoughtRecords.length);

    // 5. Criar avaliações de Esquema
    const schemaAssessments = await db.insert(schema.schemaAssessments).values([
      {
        id: "schema-001",
        patientId: patients[0].id,
        therapistId: psychologist[0].id,
        yqsScore: 245,
        dominantSchemas: ["Abandono", "Desconfiança"],
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Avaliações de Esquema criadas:", schemaAssessments.length);

    // 6. Criar inventários (BDI, BAI, etc)
    const inventoryResults = await db.insert(schema.inventoryResults).values([
      {
        id: "inv-001",
        patientId: patients[0].id,
        therapistId: psychologist[0].id,
        inventoryType: "BDI-II",
        score: 18,
        interpretation: "Depressão leve",
        createdAt: new Date(),
      },
      {
        id: "inv-002",
        patientId: patients[0].id,
        therapistId: psychologist[0].id,
        inventoryType: "BAI",
        score: 22,
        interpretation: "Ansiedade moderada",
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Inventários criados:", inventoryResults.length);

    // 7. Criar planos de tratamento
    const treatmentPlans = await db.insert(schema.treatmentPlans).values([
      {
        id: "tp-001",
        patientId: patients[0].id,
        therapistId: psychologist[0].id,
        objectives: "Reduzir ansiedade em 50%",
        techniques: "TCC, Respiração diafragmática",
        duration: "12 sessões",
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Planos de Tratamento criados:", treatmentPlans.length);

    // 8. Criar evolução de sessões
    const sessionEvolutions = await db.insert(schema.sessionEvolutions).values([
      {
        id: "se-001",
        patientId: patients[0].id,
        therapistId: psychologist[0].id,
        sessionDate: new Date(),
        presentation: "Paciente apresentou melhora no humor",
        themes: "Ansiedade, trabalho",
        techniquesUsed: "TCC, Respiração",
        evolution: "Progresso significativo",
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Evoluções de Sessão criadas:", sessionEvolutions.length);

    // 9. Criar rastreamento de humor
    const moodEntries = await db.insert(schema.moodEntries).values([
      {
        id: "mood-001",
        patientId: patients[0].id,
        date: new Date(),
        mood: "Ansioso",
        intensity: 7,
        notes: "Preocupado com apresentação",
        createdAt: new Date(),
      },
      {
        id: "mood-002",
        patientId: patients[1].id,
        date: new Date(),
        mood: "Triste",
        intensity: 6,
        notes: "Dia difícil no trabalho",
        createdAt: new Date(),
      },
    ]).returning();

    console.log("✅ Rastreamentos de Humor criados:", moodEntries.length);

    console.log("\n✨ Seed concluído com sucesso!");
    console.log(`📊 Total de registros criados: ${
      patients.length + appointments.length + thoughtRecords.length + 
      schemaAssessments.length + inventoryResults.length + 
      treatmentPlans.length + sessionEvolutions.length + moodEntries.length
    }`);

  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
}

seedDatabase();
