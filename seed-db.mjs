import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import * as schema from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seedDatabase() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  try {
    // 1. Criar usuário (Psi. Daniela Coelho)
    console.log("📝 Criando usuário...");
    const userId = "user-daniela-coelho";
    
    // Verificar se usuário já existe
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!existingUser) {
      await db.insert(schema.users).values({
        id: userId,
        email: "daniela@clinica.com.br",
        name: "Psi. Daniela Coelho",
        role: "admin",
        createdAt: new Date(),
      });
      console.log("✅ Usuário criado\n");
    } else {
      console.log("⏭️  Usuário já existe\n");
    }

    // 2. Criar pacientes
    console.log("👥 Criando pacientes...");
    const patients = [
      {
        id: "patient-001",
        userId,
        name: "Maria Silva",
        email: "maria@email.com",
        phone: "11999887766",
        status: "active",
        primaryApproach: "TCC",
        notes: "Primeira sessão em 15/03/2026",
        createdAt: new Date(),
      },
      {
        id: "patient-002",
        userId,
        name: "João Santos",
        email: "joao@email.com",
        phone: "11988776655",
        status: "active",
        primaryApproach: "Gestalt",
        notes: "Paciente em acompanhamento há 6 meses",
        createdAt: new Date(),
      },
      {
        id: "patient-003",
        userId,
        name: "Ana Costa",
        email: "ana@email.com",
        phone: "11977665544",
        status: "active",
        primaryApproach: "Terapia do Esquema",
        notes: "Sessões semanais às terças",
        createdAt: new Date(),
      },
      {
        id: "patient-004",
        userId,
        name: "Carlos Oliveira",
        email: "carlos@email.com",
        phone: "11966554433",
        status: "inactive",
        primaryApproach: "TCC",
        notes: "Paciente em pausa",
        createdAt: new Date(),
      },
      {
        id: "patient-005",
        userId,
        name: "Beatriz Ferreira",
        email: "beatriz@email.com",
        phone: "11955443322",
        status: "active",
        primaryApproach: "Gestalt",
        notes: "Novo paciente",
        createdAt: new Date(),
      },
    ];

    for (const patient of patients) {
      const existing = await db.query.patients.findFirst({
        where: eq(schema.patients.id, patient.id),
      });
      if (!existing) {
        await db.insert(schema.patients).values(patient);
      }
    }
    console.log(`✅ ${patients.length} pacientes criados/verificados\n`);

    // 3. Criar consultas agendadas
    console.log("📅 Criando consultas agendadas...");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const appointments = [
      {
        id: "apt-001",
        userId,
        patientId: "patient-001",
        title: "Sessão - Maria Silva",
        description: "Continuação do tratamento TCC",
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 09:00
        endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00
        status: "scheduled",
        createdAt: new Date(),
      },
      {
        id: "apt-002",
        userId,
        patientId: "patient-002",
        title: "Sessão - João Santos",
        description: "Trabalho com emoções",
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00
        status: "scheduled",
        createdAt: new Date(),
      },
      {
        id: "apt-003",
        userId,
        patientId: "patient-003",
        title: "Sessão - Ana Costa",
        description: "Terapia do Esquema - Sessão 12",
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 14:00
        endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 15:00
        status: "scheduled",
        createdAt: new Date(),
      },
      {
        id: "apt-004",
        userId,
        patientId: "patient-005",
        title: "Avaliação Inicial - Beatriz",
        description: "Primeira sessão",
        startTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 15:00
        endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 16:00
        status: "scheduled",
        createdAt: new Date(),
      },
      // Próximos dias
      {
        id: "apt-005",
        userId,
        patientId: "patient-001",
        title: "Sessão - Maria Silva",
        description: "Continuação",
        startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        status: "scheduled",
        createdAt: new Date(),
      },
    ];

    for (const apt of appointments) {
      const existing = await db.query.appointments.findFirst({
        where: eq(schema.appointments.id, apt.id),
      });
      if (!existing) {
        await db.insert(schema.appointments).values(apt);
      }
    }
    console.log(`✅ ${appointments.length} consultas criadas/verificadas\n`);

    // 4. Criar alertas
    console.log("🔔 Criando alertas...");
    const alerts = [
      {
        id: "alert-001",
        userId,
        title: "Novo paciente agendado",
        message: "Beatriz Ferreira agendou sua primeira sessão",
        type: "info",
        read: false,
        createdAt: new Date(),
      },
      {
        id: "alert-002",
        userId,
        title: "Sessão em 1 hora",
        message: "Maria Silva tem sessão em 1 hora",
        type: "warning",
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: "alert-003",
        userId,
        title: "Novo lead de vendas",
        message: "Novo contato via Instagram",
        type: "success",
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];

    for (const alert of alerts) {
      const existing = await db.query.alerts.findFirst({
        where: eq(schema.alerts.id, alert.id),
      });
      if (!existing) {
        await db.insert(schema.alerts).values(alert);
      }
    }
    console.log(`✅ ${alerts.length} alertas criados/verificados\n`);

    // 5. Criar leads/CRM
    console.log("💼 Criando leads de vendas...");
    const leads = [
      {
        id: "lead-001",
        userId,
        name: "Pedro Alves",
        email: "pedro@email.com",
        phone: "11944332211",
        source: "instagram",
        status: "new",
        notes: "Interessado em TCC",
        createdAt: new Date(),
      },
      {
        id: "lead-002",
        userId,
        name: "Juliana Rocha",
        email: "juliana@email.com",
        phone: "11933221100",
        source: "website",
        status: "contacted",
        notes: "Primeira conversa realizada",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "lead-003",
        userId,
        name: "Roberto Lima",
        email: "roberto@email.com",
        phone: "11922110099",
        source: "referral",
        status: "qualified",
        notes: "Pronto para agendar",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const lead of leads) {
      const existing = await db.query.leads.findFirst({
        where: eq(schema.leads.id, lead.id),
      });
      if (!existing) {
        await db.insert(schema.leads).values(lead);
      }
    }
    console.log(`✅ ${leads.length} leads criados/verificados\n`);

    // 6. Criar mensagens
    console.log("💬 Criando mensagens...");
    const messages = [
      {
        id: "msg-001",
        userId,
        patientId: "patient-001",
        senderType: "patient",
        content: "Oi Dani, tudo bem? Confirmo presença na sessão de hoje.",
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "msg-002",
        userId,
        patientId: "patient-002",
        senderType: "therapist",
        content: "Oi João! Até logo às 10h. Não esqueça de trazer o diário de emoções.",
        read: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: "msg-003",
        userId,
        patientId: "patient-005",
        senderType: "patient",
        content: "Olá! Estou um pouco nervosa para a primeira sessão. É normal?",
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ];

    for (const msg of messages) {
      const existing = await db.query.messages.findFirst({
        where: eq(schema.messages.id, msg.id),
      });
      if (!existing) {
        await db.insert(schema.messages).values(msg);
      }
    }
    console.log(`✅ ${messages.length} mensagens criadas/verificadas\n`);

    // 7. Criar posts do Instagram
    console.log("📸 Criando posts do Instagram...");
    const instagramPosts = [
      {
        id: "insta-001",
        userId,
        caption: "Ansiedade é um sinal de que você se importa. Vamos trabalhar isso juntos? 💙 #SaúdeMental #TCC",
        likes: 45,
        comments: 8,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "insta-002",
        userId,
        caption: "Gestalt-terapia: aqui e agora. Estar presente é o primeiro passo para a transformação. 🌱",
        likes: 62,
        comments: 12,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "insta-003",
        userId,
        caption: "Terapia do Esquema: entender padrões para mudar comportamentos. Você está pronto? 🔑",
        likes: 38,
        comments: 5,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const post of instagramPosts) {
      const existing = await db.query.instagramPosts.findFirst({
        where: eq(schema.instagramPosts.id, post.id),
      });
      if (!existing) {
        await db.insert(schema.instagramPosts).values(post);
      }
    }
    console.log(`✅ ${instagramPosts.length} posts do Instagram criados/verificados\n`);

    console.log("✨ Seed concluído com sucesso!\n");
    console.log("📊 Resumo dos dados criados:");
    console.log(`   - 1 usuário (Psi. Daniela Coelho)`);
    console.log(`   - ${patients.length} pacientes`);
    console.log(`   - ${appointments.length} consultas agendadas`);
    console.log(`   - ${alerts.length} alertas`);
    console.log(`   - ${leads.length} leads de vendas`);
    console.log(`   - ${messages.length} mensagens`);
    console.log(`   - ${instagramPosts.length} posts do Instagram\n`);

  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
}

seedDatabase().then(() => {
  console.log("🎉 Banco de dados pronto para testes!");
  process.exit(0);
});
