import { createConnection } from 'mysql2/promise';
import { URL } from 'url';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const url = new URL(dbUrl);
  const connection = await createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true },
  });

  try {
    console.log('Starting database population...\n');

    // Get the user ID (assuming first user exists)
    const [users] = await connection.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.error('No users found. Please create a user first.');
      process.exit(1);
    }
    const userId = users[0].id;
    console.log(`Using user ID: ${userId}\n`);

    // Clear existing data (except João Silva)
    await connection.query('DELETE FROM session_notes WHERE patient_id NOT IN (SELECT id FROM patients WHERE name = "João Silva")');
    await connection.query('DELETE FROM mood_entries WHERE patient_id NOT IN (SELECT id FROM patients WHERE name = "João Silva")');
    await connection.query('DELETE FROM anamnesis WHERE patient_id NOT IN (SELECT id FROM patients WHERE name = "João Silva")');
    await connection.query('DELETE FROM cognitive_concepts WHERE patient_id NOT IN (SELECT id FROM patients WHERE name = "João Silva")');
    await connection.query('DELETE FROM inventory_results WHERE patient_id NOT IN (SELECT id FROM patients WHERE name = "João Silva")');
    await connection.query('DELETE FROM treatment_plans WHERE patient_id NOT IN (SELECT id FROM patients WHERE name = "João Silva")');
    await connection.query('DELETE FROM appointments WHERE patient_id NOT IN (SELECT id FROM patients WHERE name = "João Silva")');
    await connection.query('DELETE FROM patients WHERE name != "João Silva"');

    console.log('✓ Cleared old data\n');

    // Create patients
    const patients = [
      {
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        phone: '(11) 98765-4321',
        birthDate: '1990-05-15',
        gender: 'F',
        occupation: 'Engenheira',
        origin: 'indication',
        status: 'active',
        notes: 'Paciente com histórico de ansiedade',
        emergencyContact: JSON.stringify({ name: 'João Silva', phone: '(11) 99999-9999', relation: 'Cônjuge' }),
      },
      {
        name: 'Carlos Santos',
        email: 'carlos.santos@email.com',
        phone: '(11) 97654-3210',
        birthDate: '1985-08-22',
        gender: 'M',
        occupation: 'Advogado',
        origin: 'site',
        status: 'active',
        notes: 'Encaminhado por colega',
        emergencyContact: JSON.stringify({ name: 'Ana Santos', phone: '(11) 98888-8888', relation: 'Irmã' }),
      },
      {
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        phone: '(11) 96543-2109',
        birthDate: '1992-03-10',
        gender: 'F',
        occupation: 'Professora',
        origin: 'instagram',
        status: 'active',
        notes: 'Paciente com depressão leve',
        emergencyContact: JSON.stringify({ name: 'Pedro Costa', phone: '(11) 97777-7777', relation: 'Pai' }),
      },
      {
        name: 'Roberto Oliveira',
        email: 'roberto.oliveira@email.com',
        phone: '(11) 95432-1098',
        birthDate: '1988-11-30',
        gender: 'M',
        occupation: 'Empresário',
        origin: 'whatsapp',
        status: 'active',
        notes: 'Paciente com estresse ocupacional',
        emergencyContact: JSON.stringify({ name: 'Fernanda Oliveira', phone: '(11) 96666-6666', relation: 'Esposa' }),
      },
      {
        name: 'Juliana Ferreira',
        email: 'juliana.ferreira@email.com',
        phone: '(11) 94321-0987',
        birthDate: '1995-07-18',
        gender: 'F',
        occupation: 'Psicóloga',
        origin: 'indication',
        status: 'active',
        notes: 'Paciente com transtorno de pânico',
        emergencyContact: JSON.stringify({ name: 'Lucas Ferreira', phone: '(11) 95555-5555', relation: 'Irmão' }),
      },
    ];

    const patientIds = [];
    for (const patient of patients) {
      const [result] = await connection.query(
        'INSERT INTO patients (user_id, name, email, phone, birth_date, gender, occupation, origin, status, notes, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, patient.name, patient.email, patient.phone, patient.birthDate, patient.gender, patient.occupation, patient.origin, patient.status, patient.notes, patient.emergencyContact]
      );
      patientIds.push(result.insertId);
      console.log(`✓ Created patient: ${patient.name} (ID: ${result.insertId})`);
    }

    console.log(`\n✓ Created ${patients.length} patients\n`);

    // Create anamnesis for each patient
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      const anamnesisData = {
        mainComplaint: ['Ansiedade generalizada', 'Depressão', 'Insônia', 'Estresse', 'Transtorno de pânico'][i],
        history: 'Paciente relata sintomas há aproximadamente 2 anos',
        familyHistory: 'Mãe com histórico de depressão',
        medicalHistory: 'Sem comorbidades significativas',
        medications: JSON.stringify(['Sem medicações', 'Sertalina 50mg', 'Alprazolam 0.5mg'][i % 3]),
        previousTherapy: i % 2 === 0,
        previousTherapyDetails: i % 2 === 0 ? 'Terapia cognitivo-comportamental por 6 meses' : null,
        sleepPattern: 'Dificuldade em adormecer, acorda durante a noite',
        exerciseHabits: 'Sedentário, sem exercícios regulares',
        substanceUse: 'Nega uso de substâncias',
        socialSupport: 'Suporte familiar presente',
        workSituation: 'Trabalho estressante com muitas demandas',
        completed: true,
      };

      await connection.query(
        'INSERT INTO anamnesis (patient_id, main_complaint, history, family_history, medical_history, medications, previous_therapy, previous_therapy_details, sleep_pattern, exercise_habits, substance_use, social_support, work_situation, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [patientId, anamnesisData.mainComplaint, anamnesisData.history, anamnesisData.familyHistory, anamnesisData.medicalHistory, anamnesisData.medications, anamnesisData.previousTherapy, anamnesisData.previousTherapyDetails, anamnesisData.sleepPattern, anamnesisData.exerciseHabits, anamnesisData.substanceUse, anamnesisData.socialSupport, anamnesisData.workSituation, anamnesisData.completed]
      );
    }
    console.log(`✓ Created anamnesis for ${patientIds.length} patients\n`);

    // Create cognitive concepts for each patient
    for (const patientId of patientIds) {
      const cognitiveData = {
        coreBeliefs: JSON.stringify(['Sou incapaz', 'Ninguém me ama', 'O mundo é perigoso']),
        intermediateBeliefs: JSON.stringify(['Se eu falhar, sou um fracasso', 'Se as pessoas souberem meus problemas, me rejeitarão']),
        automaticThoughts: JSON.stringify(['Vou desmaiar', 'Algo ruim vai acontecer', 'Não consigo lidar com isso']),
        compensatoryStrategies: JSON.stringify(['Evitar situações sociais', 'Procrastinação', 'Uso de álcool']),
        triggers: JSON.stringify(['Ambientes fechados', 'Multidões', 'Críticas']),
      };

      await connection.query(
        'INSERT INTO cognitive_concepts (patient_id, core_beliefs, intermediate_beliefs, automatic_thoughts, compensatory_strategies, triggers) VALUES (?, ?, ?, ?, ?, ?)',
        [patientId, cognitiveData.coreBeliefs, cognitiveData.intermediateBeliefs, cognitiveData.automaticThoughts, cognitiveData.compensatoryStrategies, cognitiveData.triggers]
      );
    }
    console.log(`✓ Created cognitive concepts for ${patientIds.length} patients\n`);

    // Create inventory results for each patient
    const inventoryTypes = ['BDI-II', 'BAI', 'PHQ-9', 'GAD-7', 'DASS-21'];
    for (let i = 0; i < patientIds.length; i++) {
      for (let j = 0; j < 2; j++) {
        const patientId = patientIds[i];
        const type = inventoryTypes[j % inventoryTypes.length];
        const totalScore = Math.floor(Math.random() * 50) + 10;
        const severity = totalScore > 30 ? 'Grave' : totalScore > 20 ? 'Moderado' : 'Leve';

        await connection.query(
          'INSERT INTO inventory_results (patient_id, type, answers, total_score, severity, interpretation) VALUES (?, ?, ?, ?, ?, ?)',
          [patientId, type, JSON.stringify({ q1: 2, q2: 3, q3: 1 }), totalScore, severity, `Paciente apresenta sintomas ${severity.toLowerCase()} de ${type}`]
        );
      }
    }
    console.log(`✓ Created inventory results for ${patientIds.length} patients\n`);

    // Create mood entries for each patient
    const emotions = ['Ansioso', 'Triste', 'Irritado', 'Calmo', 'Feliz'];
    for (const patientId of patientIds) {
      for (let i = 0; i < 5; i++) {
        const score = Math.floor(Math.random() * 10) + 1;
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        const recordedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

        await connection.query(
          'INSERT INTO mood_entries (patient_id, score, emotion, notes, recorded_at) VALUES (?, ?, ?, ?, ?)',
          [patientId, score, emotion, `Registro de humor: ${emotion}`, recordedAt]
        );
      }
    }
    console.log(`✓ Created mood entries for ${patientIds.length} patients\n`);

    // Create appointments for each patient
    for (const patientId of patientIds) {
      for (let i = 0; i < 3; i++) {
        const startTime = new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
        const status = i === 0 ? 'scheduled' : 'done';

        await connection.query(
          'INSERT INTO appointments (patient_id, user_id, title, start_time, end_time, status, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [patientId, userId, `Sessão ${i + 1} - Acompanhamento`, startTime.toISOString(), endTime.toISOString(), status, 'presential', `Sessão ${i + 1} - Acompanhamento regular`]
        );
      }
    }
    console.log(`✓ Created appointments for ${patientIds.length} patients\n`);

    // Create treatment plans for each patient
    for (const patientId of patientIds) {
      const goals = JSON.stringify([{ goal: 'Reduzir ansiedade em 50%', achieved: false }, { goal: 'Melhorar qualidade do sono', achieved: false }]);
      const techniques = JSON.stringify(['Terapia cognitivo-comportamental', 'Técnicas de relaxamento', 'Exposição gradual']);

      await connection.query(
        'INSERT INTO treatment_plans (patient_id, goals, approach, techniques, estimated_sessions, frequency, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patientId, goals, 'CBT', techniques, 12, 'Semanal', true]
      );
    }
    console.log(`✓ Created treatment plans for ${patientIds.length} patients\n`);

    // Create session notes for each patient
    for (const patientId of patientIds) {
      const transcript = 'Paciente relata melhora nos sintomas de ansiedade. Discutimos estratégias de enfrentamento e técnicas de respiração.';
      const summary = 'Sessão produtiva com progresso notável no tratamento.';
      const keyThemes = JSON.stringify(['Ansiedade', 'Técnicas de relaxamento', 'Progresso terapêutico']);
      const interventions = JSON.stringify(['Respiração diafragmática', 'Reestruturação cognitiva']);
      const aiSuggestions = JSON.stringify(['Continuar com exercícios de respiração', 'Aumentar atividades físicas']);
      const fullAnalysis = 'Análise completa da sessão com recomendações para próximas sessões.';

      await connection.query(
        'INSERT INTO session_notes (patient_id, user_id, transcript, summary, key_themes, interventions, ai_suggestions, full_analysis, session_type, session_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [patientId, userId, transcript, summary, keyThemes, interventions, aiSuggestions, fullAnalysis, 'session_notes', new Date().toISOString()]
      );
    }
    console.log(`✓ Created session notes for ${patientIds.length} patients\n`);

    console.log('✅ Database population completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Patients: ${patientIds.length}`);
    console.log(`- Anamnesis: ${patientIds.length}`);
    console.log(`- Cognitive Concepts: ${patientIds.length}`);
    console.log(`- Inventory Results: ${patientIds.length * 2}`);
    console.log(`- Mood Entries: ${patientIds.length * 5}`);
    console.log(`- Appointments: ${patientIds.length * 3}`);
    console.log(`- Treatment Plans: ${patientIds.length}`);
    console.log(`- Session Notes: ${patientIds.length}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
