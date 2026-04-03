import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "dani",
});

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

const origins = [
  "Plano de Saúde", "Google", "Indicação", "Instagram", "LinkedIn", "Site", "Indicação médica"
];

const genders = ["M", "F", "O"];

const statuses = ["active", "inactive", "waitlist"];
const leadStatuses = ["novo", "contato", "proposta", "convertido"];

function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
}

function generatePhone() {
  const areaCode = String(Math.floor(Math.random() * 90) + 10);
  const firstPart = String(Math.floor(Math.random() * 90000) + 10000);
  const secondPart = String(Math.floor(Math.random() * 9000) + 1000);
  return `(${areaCode}) ${firstPart}-${secondPart}`;
}

function generateCPF() {
  const part1 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const part2 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const part3 = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${part1}.${part2}.${part3}-${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando população do banco de dados...");

    // Get the user ID (assuming there's already a user)
    const [users] = await connection.query("SELECT id FROM users LIMIT 1");
    if (users.length === 0) {
      console.error("❌ Nenhum usuário encontrado. Execute a autenticação primeiro.");
      process.exit(1);
    }
    const userId = users[0].id;
    console.log(`✅ Usando userId: ${userId}`);

    // Clear existing data
    console.log("🗑️  Limpando dados existentes...");
    await connection.query("DELETE FROM patients WHERE user_id = ?", [userId]);
    await connection.query("DELETE FROM appointments WHERE user_id = ?", [userId]);
    await connection.query("DELETE FROM leads WHERE user_id = ?", [userId]);

    // Insert 84 patients
    console.log("👥 Inserindo 84 pacientes...");
    const patients = [];
    for (let i = 0; i < 84; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = generateEmail(firstName, lastName);
      const phone = generatePhone();
      const cpf = generateCPF();
      const gender = randomElement(genders);
      const origin = randomElement(origins);
      const status = randomElement(statuses);

      const birthYear = Math.floor(Math.random() * 50) + 1960;
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
      const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

      const occupations = ["Engenheiro", "Professor", "Médico", "Advogado", "Empresário", "Desenvolvedor", "Contador", "Psicólogo", "Enfermeiro", "Arquiteto"];
      const occupation = randomElement(occupations);

      await connection.query(
        "INSERT INTO patients (user_id, name, email, phone, birth_date, gender, occupation, origin, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, `${firstName} ${lastName}`, email, phone, birthDate, gender, occupation, origin, status]
      );

      patients.push({ name: `${firstName} ${lastName}`, id: i + 1 });
    }
    console.log(`✅ ${patients.length} pacientes inseridos`);

    // Get inserted patient IDs
    const [insertedPatients] = await connection.query("SELECT id FROM patients WHERE user_id = ? ORDER BY id DESC LIMIT 84", [userId]);

    // Insert 35 appointments
    console.log("📅 Inserindo 35 agendamentos...");
    for (let i = 0; i < 35; i++) {
      const patientId = insertedPatients[i % insertedPatients.length].id;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
      startDate.setHours(Math.floor(Math.random() * 12) + 9, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 50);

      const types = ["online", "presential"];
      const type = randomElement(types);

      const statuses = ["scheduled", "confirmed", "done", "cancelled", "no_show"];
      const status = randomElement(statuses);

      await connection.query(
        "INSERT INTO appointments (user_id, patient_id, title, start_time, end_time, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, patientId, "Sessão Individual", startDate, endDate, type, status]
      );
    }
    console.log("✅ 35 agendamentos inseridos");

    // Insert 18 leads
    console.log("🎯 Inserindo 18 leads...");
    for (let i = 0; i < 18; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = generateEmail(firstName, lastName);
      const phone = generatePhone();
      const status = randomElement(leadStatuses);
      const source = randomElement(["Google", "Instagram", "LinkedIn", "Indicação", "Site"]);

      await connection.query(
        "INSERT INTO leads (user_id, name, email, phone, status, source) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, `${firstName} ${lastName}`, email, phone, status, source]
      );
    }
    console.log("✅ 18 leads inseridos");

    console.log("\n✨ População do banco de dados concluída com sucesso!");
    console.log("📊 Resumo:");
    console.log("  • 84 pacientes");
    console.log("  • 35 agendamentos");
    console.log("  • 18 leads");

    await connection.end();
  } catch (error) {
    console.error("❌ Erro ao popular banco de dados:", error);
    process.exit(1);
  }
}

seedDatabase();
