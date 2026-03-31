/**
 * Patient Matcher - Sistema Inteligente de Busca de Pacientes
 * Encontra pacientes por características, histórico, abordagem, etc
 */

import * as db from "../core_logic/db";
import { invokeLLM } from "../_core/llm";

interface PatientMatch {
  userId: number;
  confidence: number;
  matchReasons: string[];
  fullData: any;
}

/**
 * Buscar paciente por referência vaga/indireta
 * Ex: "aquele que faz TCC", "o paciente que tem mais sessões", "aquela de gestalt"
 */
export async function findPatientByReference(reference: string): Promise<PatientMatch | null> {
  const allPatients = await db.getAllPatients();
  
  if (allPatients.length === 0) return null;

  // Busca exata por nome
  const exactMatch = allPatients.find((p: any) => 
    p.name.toLowerCase().includes(reference.toLowerCase())
  );
  
  if (exactMatch) {
    return {
      userId: exactMatch.userId,
      confidence: 100,
      matchReasons: [`Nome exato: ${exactMatch.name}`],
      fullData: exactMatch
    };
  }

  // Busca por telefone
  const phoneMatch = allPatients.find((p: any) => 
    p.phone && p.phone.includes(reference.replace(/\D/g, ''))
  );
  
  if (phoneMatch) {
    return {
      userId: phoneMatch.userId,
      confidence: 95,
      matchReasons: [`Telefone: ${phoneMatch.phone}`],
      fullData: phoneMatch
    };
  }

  // Busca por email
  const emailMatch = allPatients.find((p: any) => 
    p.email && p.email.toLowerCase().includes(reference.toLowerCase())
  );
  
  if (emailMatch) {
    return {
      userId: emailMatch.userId,
      confidence: 90,
      matchReasons: [`Email: ${emailMatch.email}`],
      fullData: emailMatch
    };
  }

  // Busca por características (abordagem, status, etc)
  const characteristicMatch = await findByCharacteristics(reference, allPatients);
  if (characteristicMatch) {
    return characteristicMatch;
  }

  // Busca por histórico (mais sessões, mais agendamentos, etc)
  const historyMatch = await findByHistory(reference, allPatients);
  if (historyMatch) {
    return historyMatch;
  }

  // Busca com IA como último recurso
  const aiMatch = await findWithAI(reference, allPatients);
  return aiMatch;
}

/**
 * Buscar paciente por características
 */
async function findByCharacteristics(reference: string, patients: any[]): Promise<PatientMatch | null> {
  const ref = reference.toLowerCase();

  // Abordagens
  if (ref.includes("tcc") || ref.includes("cognitivo")) {
    const matches = patients.filter((p: any) => p.primaryApproach === "tcc");
    if (matches.length === 1) {
      return {
        userId: matches[0].userId,
        confidence: 85,
        matchReasons: ["Abordagem TCC"],
        fullData: matches[0]
      };
    }
  }

  if (ref.includes("gestalt")) {
    const matches = patients.filter((p: any) => p.primaryApproach === "gestalt");
    if (matches.length === 1) {
      return {
        userId: matches[0].userId,
        confidence: 85,
        matchReasons: ["Abordagem Gestalt"],
        fullData: matches[0]
      };
    }
  }

  if (ref.includes("esquema")) {
    const matches = patients.filter((p: any) => p.primaryApproach === "terapia_esquema");
    if (matches.length === 1) {
      return {
        userId: matches[0].userId,
        confidence: 85,
        matchReasons: ["Abordagem Terapia do Esquema"],
        fullData: matches[0]
      };
    }
  }

  // Status
  if (ref.includes("ativo")) {
    const matches = patients.filter((p: any) => p.status === "active");
    if (matches.length === 1) {
      return {
        userId: matches[0].userId,
        confidence: 70,
        matchReasons: ["Status: Ativo"],
        fullData: matches[0]
      };
    }
  }

  if (ref.includes("inativo")) {
    const matches = patients.filter((p: any) => p.status === "inactive");
    if (matches.length === 1) {
      return {
        userId: matches[0].userId,
        confidence: 70,
        matchReasons: ["Status: Inativo"],
        fullData: matches[0]
      };
    }
  }

  return null;
}

/**
 * Buscar paciente por histórico
 */
async function findByHistory(reference: string, patients: any[]): Promise<PatientMatch | null> {
  const ref = reference.toLowerCase();

  // Mais sessões
  if (ref.includes("mais sessões") || ref.includes("mais ativo") || ref.includes("mais assíduo")) {
    const sorted = [...patients].sort((a: any, b: any) => (b.totalSessions || 0) - (a.totalSessions || 0));
    if (sorted.length > 0) {
      return {
        userId: sorted[0].userId,
        confidence: 80,
        matchReasons: [`Paciente com mais sessões (${sorted[0].totalSessions})`],
        fullData: sorted[0]
      };
    }
  }

  // Menos sessões
  if (ref.includes("menos sessões") || ref.includes("menos ativo")) {
    const sorted = [...patients].sort((a: any, b: any) => (a.totalSessions || 0) - (b.totalSessions || 0));
    if (sorted.length > 0) {
      return {
        userId: sorted[0].userId,
        confidence: 75,
        matchReasons: [`Paciente com menos sessões (${sorted[0].totalSessions})`],
        fullData: sorted[0]
      };
    }
  }

  // Novo paciente
  if (ref.includes("novo") || ref.includes("recente")) {
    const sorted = [...patients].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (sorted.length > 0) {
      return {
        userId: sorted[0].userId,
        confidence: 80,
        matchReasons: [`Paciente mais recente`],
        fullData: sorted[0]
      };
    }
  }

  // Sem sessão
  if (ref.includes("sem sessão") || ref.includes("nunca teve")) {
    const matches = patients.filter((p: any) => (p.totalSessions || 0) === 0);
    if (matches.length === 1) {
      return {
        userId: matches[0].userId,
        confidence: 85,
        matchReasons: ["Paciente sem sessão"],
        fullData: matches[0]
      };
    }
  }

  return null;
}

/**
 * Buscar paciente com IA
 */
async function findWithAI(reference: string, patients: any[]): Promise<PatientMatch | null> {
  try {
    const patientsInfo = patients.map((p: any) => ({
      userId: p.userId,
      name: p.name,
      approach: p.primaryApproach,
      status: p.status,
      sessions: p.totalSessions,
      email: p.email,
      phone: p.phone,
      createdAt: new Date(p.createdAt).toLocaleDateString('pt-BR')
    }));

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente que identifica pacientes baseado em descrições vagas. Retorne APENAS o userId do paciente mais provável em formato JSON: {\"userId\": number, \"confidence\": number, \"reason\": string}"
        },
        {
          role: "user",
          content: `Referência: "${reference}"\n\nPacientes disponíveis:\n${JSON.stringify(patientsInfo, null, 2)}\n\nQual paciente você acha que é? Retorne APENAS JSON.`
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === 'string') {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const patient = patients.find((p: any) => p.userId === result.userId);
        
        if (patient) {
          return {
            userId: result.userId,
            confidence: result.confidence || 60,
            matchReasons: [result.reason || "Identificado por IA"],
            fullData: patient
          };
        }
      }
    }
  } catch (error) {
    console.error('[PatientMatcher] Erro ao usar IA:', error);
  }

  return null;
}

/**
 * Buscar múltiplos pacientes por critérios
 */
export async function findPatientsByFilter(filter: {
  approach?: string;
  status?: string;
  minSessions?: number;
  maxSessions?: number;
  namePattern?: string;
}): Promise<any[]> {
  const allPatients = await db.getAllPatients();

  return allPatients.filter((p: any) => {
    if (filter.approach && p.primaryApproach !== filter.approach) return false;
    if (filter.status && p.status !== filter.status) return false;
    if (filter.minSessions && (p.totalSessions || 0) < filter.minSessions) return false;
    if (filter.maxSessions && (p.totalSessions || 0) > filter.maxSessions) return false;
    if (filter.namePattern && !p.name.toLowerCase().includes(filter.namePattern.toLowerCase())) return false;
    return true;
  });
}

/**
 * Obter perfil completo de um paciente por referência
 */
export async function getPatientProfileByReference(reference: string): Promise<any> {
  const match = await findPatientByReference(reference);
  
  if (!match) {
    return {
      found: false,
      message: `Paciente não encontrado para referência: "${reference}"`
    };
  }

  // Obter histórico completo
  const history = await db.getCompletePatientHistory(match.userId);
  const indicators = await db.calculatePatientIndicators(match.userId);
  const report = await db.getPatientCompleteReport(match.userId);

  return {
    found: true,
    match,
    history,
    indicators,
    report,
    summary: {
      name: match.fullData.name,
      approach: match.fullData.primaryApproach,
      status: match.fullData.status,
      totalSessions: match.fullData.totalSessions,
      matchConfidence: `${match.confidence}%`,
      matchReasons: match.matchReasons
    }
  };
}

/**
 * Processar pergunta sobre paciente específico
 */
export async function processPatientQuestion(question: string): Promise<any> {
  // Extrair referência do paciente da pergunta
  const referencePatterns = [
    /(?:o|a)\s+(?:paciente\s+)?(?:que\s+)?(.+?)(?:\s+(?:tem|faz|é|está|com))?/i,
    /(?:aquele|aquela|esse|essa)\s+(?:paciente\s+)?(.+)/i,
    /(?:do|da)\s+(.+?)(?:\s+(?:tem|faz|é|está))?/i
  ];

  let reference = null;
  for (const pattern of referencePatterns) {
    const match = question.match(pattern);
    if (match) {
      reference = match[1];
      break;
    }
  }

  if (!reference) {
    // Se não conseguir extrair referência, tentar buscar nome direto
    const allPatients = await db.getAllPatients();
    for (const patient of allPatients) {
      if (question.toLowerCase().includes(patient.name.toLowerCase())) {
        reference = patient.name;
        break;
      }
    }
  }

  if (!reference) {
    return {
      success: false,
      message: "Não consegui identificar qual paciente você está perguntando."
    };
  }

  // Buscar paciente
  const profile = await getPatientProfileByReference(reference);

  if (!profile.found) {
    return {
      success: false,
      message: profile.message
    };
  }

  // Responder pergunta sobre o paciente
  let answer = `📋 **Informações sobre ${profile.summary.name}**\n\n`;
  answer += `**Identificação:** ${profile.match.matchReasons.join(", ")}\n`;
  answer += `**Confiança:** ${profile.summary.matchConfidence}\n\n`;
  
  answer += `**Perfil Clínico:**\n`;
  answer += `• Abordagem: ${profile.summary.approach}\n`;
  answer += `• Status: ${profile.summary.status === 'active' ? '🟢 Ativo' : '🔴 Inativo'}\n`;
  answer += `• Total de Sessões: ${profile.summary.totalSessions}\n\n`;
  
  if (profile.indicators) {
    answer += `**Indicadores:**\n`;
    answer += `• Frequência: ${profile.indicators.indicators.sessionFrequency}\n`;
    answer += `• Taxa de Comparecimento: ${profile.indicators.indicators.attendanceRate}\n`;
    answer += `• Adesão: ${profile.indicators.indicators.adherence}\n`;
    answer += `• Dias desde última sessão: ${profile.indicators.indicators.daysSinceLastSession || 'N/A'}\n\n`;
  }

  if (profile.report) {
    answer += `**Progresso do Tratamento:**\n`;
    answer += `• Sessões Completadas: ${profile.report.report.treatmentProgress.sessionsCompleted}\n`;
    answer += `• Agendamentos: ${profile.report.report.treatmentProgress.appointmentsScheduled}\n`;
    answer += `• Protocolos Preenchidos: ${profile.report.report.treatmentProgress.protocolsCompleted}\n`;
    answer += `• Registros de Evolução: ${profile.report.report.treatmentProgress.evolutionRecords}\n`;
  }

  return {
    success: true,
    question,
    answer,
    patientData: profile
  };
}
