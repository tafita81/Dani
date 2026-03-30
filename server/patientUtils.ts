/**
 * Calcula idade a partir da data de nascimento
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Detecta gênero provável pelo nome
 * Baseado em nomes comuns em português
 */
export function detectGenderByName(name: string): "male" | "female" | null {
  const nameLower = name.toLowerCase().trim();
  const parts = nameLower.split(" ");
  const firstName = parts[0];

  // Nomes femininos comuns em português
  const femaleNames = [
    "maria", "ana", "fernanda", "beatriz", "carolina", "daniela",
    "patricia", "paula", "sandra", "vanessa", "jessica", "amanda",
    "gabriela", "juliana", "cristina", "mariana", "laura", "sophia",
    "isabella", "camila", "natalia", "valentina", "helena", "rosa",
    "joana", "teresa", "rita", "gloria", "irene", "lucia", "monica",
    "silvia", "vera", "alice", "clara", "elisa", "nina", "sara",
    "tania", "simone", "denise", "adriana", "fabiana", "viviane"
  ];

  // Nomes masculinos comuns em português
  const maleNames = [
    "joao", "carlos", "diego", "roberto", "antonio", "francisco",
    "luis", "manuel", "paulo", "pedro", "jose", "miguel", "andre",
    "bruno", "ricardo", "sergio", "marcos", "rafael", "lucas",
    "gabriel", "mateus", "felipe", "gustavo", "leonardo", "fernando",
    "julio", "victor", "daniel", "andre", "thiago", "bruno",
    "alan", "alex", "andre", "arthur", "augusto", "cesar",
    "cristovao", "duarte", "edmundo", "ernesto", "eugenio"
  ];

  if (femaleNames.includes(firstName)) {
    return "female";
  }

  if (maleNames.includes(firstName)) {
    return "male";
  }

  // Se termina em 'a' é provavelmente feminino
  if (firstName.endsWith("a")) {
    return "female";
  }

  // Se termina em 'o' é provavelmente masculino
  if (firstName.endsWith("o")) {
    return "male";
  }

  return null;
}

/**
 * Formata data de nascimento para exibição
 */
export function formatDateOfBirth(dateOfBirth: Date | string): string {
  const date = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  return date.toLocaleDateString("pt-BR");
}

/**
 * Calcula quantos dias até o próximo aniversário
 */
export function daysUntilBirthday(dateOfBirth: Date | string): number {
  const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  const nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // Se o aniversário já passou este ano, calcular para o próximo ano
  if (nextBirthday < today) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }

  const timeDiff = nextBirthday.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se é aniversário hoje
 */
export function isBirthdayToday(dateOfBirth: Date | string): boolean {
  const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();

  return (
    birthDate.getMonth() === today.getMonth() &&
    birthDate.getDate() === today.getDate()
  );
}

/**
 * Gera mensagem de aniversário
 */
export function generateBirthdayMessage(patientName: string, age: number): string {
  const messages = [
    `🎉 Parabéns ${patientName}! Você está fazendo ${age} anos hoje!`,
    `🎂 Feliz aniversário ${patientName}! Desejamos um ótimo ano de ${age}!`,
    `🎈 ${patientName}, parabéns pelos seus ${age} anos! Que este seja um ano especial!`,
    `✨ Hoje é dia de celebrar ${patientName}! Muitos parabéns pelos ${age} anos!`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Calcula faixa etária
 */
export function getAgeGroup(age: number): string {
  if (age < 13) return "Criança";
  if (age < 18) return "Adolescente";
  if (age < 30) return "Adulto Jovem";
  if (age < 60) return "Adulto";
  return "Idoso";
}

/**
 * Formata informações do paciente para exibição
 */
export function formatPatientInfo(patient: any): string {
  const age = calculateAge(patient.dateOfBirth);
  const ageGroup = getAgeGroup(age);
  const gender = patient.gender === "female" ? "Feminino" : patient.gender === "male" ? "Masculino" : "Outro";
  const birthDate = formatDateOfBirth(patient.dateOfBirth);

  return `
**${patient.name}**
• Idade: ${age} anos (${ageGroup})
• Gênero: ${gender}
• Data de Nascimento: ${birthDate}
• Telefone: ${patient.phone || "N/A"}
• Email: ${patient.email || "N/A"}
• Status: ${patient.status}
• Abordagem Terapêutica: ${patient.primaryApproach}
• Total de Sessões: ${patient.totalSessions}
• Streak de Sessões: ${patient.sessionStreak}
  `.trim();
}
