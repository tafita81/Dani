/**
 * Filtros Avançados - Perguntas e Respostas Possíveis
 * Sistema completo de análise e insights para o Assistente Carro
 */

import * as db from "../core_logic/db";
import { eq, and, gte, desc, asc } from "drizzle-orm";
import { appointments, sessionNotes } from "../../drizzle/schema";

interface AdvancedFilterResult {
  question: string;
  answer: string;
  data: any;
  category: string;
}

/**
 * Obter data/hora atual
 */
function getCurrentDateTime() {
  const now = new Date();
  return {
    timestamp: now.getTime(),
    date: now.toLocaleDateString('pt-BR'),
    time: now.toLocaleTimeString('pt-BR'),
    dayOfWeek: now.toLocaleDateString('pt-BR', { weekday: 'long' }),
    iso: now.toISOString(),
  };
}

/**
 * Formatar timestamp Unix para data/hora legivel
 */
function formatUnixTimestamp(unixMs: number): string {
  const date = new Date(unixMs);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Processar pergunta com filtros avançados
 */
export async function processAdvancedFilter(question: string): Promise<AdvancedFilterResult | null> {
  const q = question.toLowerCase();

  // ===== PERGUNTAS SOBRE PACIENTES SEM SESSÃO =====
  if (q.includes("sem sessão") || q.includes("sem acompanhamento") || q.includes("inativo") || q.includes("parado")) {
    return await handlePatientsWithoutSession(question);
  }

  // ===== PERGUNTAS SOBRE EFETIVIDADE =====
  if (q.includes("efetiv") || q.includes("qual abordagem") || q.includes("melhor resultado")) {
    return await handleApproachEffectiveness(question);
  }

  // ===== PERGUNTAS SOBRE PROGRESSO =====
  if (q.includes("progresso") || q.includes("maior progresso") || q.includes("mais ativo") || q.includes("mais assíduo")) {
    return await handleProgressAnalysis(question);
  }

  // ===== PERGUNTAS SOBRE RETENÇÃO =====
  if (q.includes("retenção") || q.includes("taxa de retenção") || q.includes("quantos continuam")) {
    return await handleRetentionAnalysis(question);
  }

  // ===== PERGUNTAS SOBRE AGENDAMENTOS =====
  if (q.includes("agendamento") || q.includes("sessao") || q.includes("proximo") || q.includes("hoje") || q.includes("amanha") || q.includes("quantos agendamento")) {
    return await handleAppointmentAnalysis(question);
  }

  // ===== PERGUNTAS SOBRE ABORDAGENS =====
  if (q.includes("abordagem") || q.includes("terapia") || q.includes("tcc") || q.includes("gestalt") || q.includes("esquema")) {
    return await handleApproachAnalysis(question);
  }

  // ===== PERGUNTAS SOBRE NOVOS PACIENTES =====
  if (q.includes("novo") || q.includes("recente") || q.includes("últimos")) {
    return await handleNewPatientsAnalysis(question);
  }

  // ===== PERGUNTAS SOBRE ESTATÍSTICAS GERAIS =====
  if (q.includes("estatística") || q.includes("resumo") || q.includes("visão geral") || q.includes("dashboard")) {
    return await handleGeneralStatistics(question);
  }

  // ===== PERGUNTAS SOBRE SESSÕES =====
  if (q.includes("sessão") && (q.includes("total") || q.includes("média") || q.includes("mais"))) {
    return await handleSessionAnalysis(question);
  }

  // ===== PERGUNTAS SOBRE PACIENTES ESPECÍFICOS =====
  if (q.includes("paciente") && (q.includes("detalhes") || q.includes("informação") || q.includes("histórico"))) {
    return await handlePatientDetails(question);
  }

  return null;
}

// ===== IMPLEMENTAÇÕES =====

async function handlePatientsWithoutSession(question: string): Promise<AdvancedFilterResult> {
  const days = extractNumber(question) || 30;
  const patients = await db.getPatientsWithoutSessionInDays(days);
  
  let answer = `Encontrei ${patients.length} paciente(s) sem sessão há ${days} dias:\n\n`;
  patients.forEach((p: any) => {
    answer += `• **${p.name}** (${p.totalSessions} sessões) - Status: ${p.status === 'active' ? '🟢 Ativo' : '🔴 Inativo'}\n`;
  });
  
  if (patients.length === 0) {
    answer = `Excelente! Todos os seus pacientes tiveram sessão nos últimos ${days} dias.`;
  }

  return {
    question,
    answer,
    data: { patients, days },
    category: "Pacientes Inativos"
  };
}

async function handleApproachEffectiveness(question: string): Promise<AdvancedFilterResult> {
  const effectiveness = await db.getApproachEffectiveness();
  
  let answer = `**Efetividade por Abordagem Terapêutica:**\n\n`;
  
  const sorted = Object.entries(effectiveness)
    .sort((a: any, b: any) => b[1].retentionRate - a[1].retentionRate);
  
  sorted.forEach(([approach, data]: any) => {
    const emoji = data.retentionRate > 80 ? '⭐' : data.retentionRate > 60 ? '✅' : '⚠️';
    answer += `${emoji} **${formatApproachName(approach)}**\n`;
    answer += `   • Pacientes: ${data.totalPatients} (${data.activePatientsCount} ativos)\n`;
    answer += `   • Sessões: ${data.totalSessions} (média: ${data.avgSessionsPerPatient.toFixed(1)})\n`;
    answer += `   • Taxa de Retenção: ${data.retentionRate.toFixed(1)}%\n\n`;
  });

  return {
    question,
    answer,
    data: effectiveness,
    category: "Efetividade"
  };
}

async function handleProgressAnalysis(question: string): Promise<AdvancedFilterResult> {
  const mostProgressive = await db.getMostProgressivePatient();
  const highestStreak = await db.getPatientsWithHighestStreak();
  
  let answer = `**Análise de Progresso:**\n\n`;
  answer += `🏆 **Paciente com Maior Progresso:** ${mostProgressive.name}\n`;
  answer += `   • Total de Sessões: ${mostProgressive.totalSessions}\n`;
  answer += `   • Streak: ${mostProgressive.sessionStreak || 0} sessões consecutivas\n`;
  answer += `   • Abordagem: ${formatApproachName(mostProgressive.primaryApproach)}\n\n`;
  
  answer += `**Top 5 - Maior Streak de Sessões:**\n`;
  highestStreak.forEach((p: any, i: number) => {
    answer += `${i + 1}. ${p.name} - ${p.sessionStreak || 0} sessões consecutivas\n`;
  });

  return {
    question,
    answer,
    data: { mostProgressive, highestStreak },
    category: "Progresso"
  };
}

async function handleRetentionAnalysis(question: string): Promise<AdvancedFilterResult> {
  const retention = await db.getRetentionRate();
  
  const retentionEmoji = retention.retentionRate > 80 ? '⭐' : retention.retentionRate > 60 ? '✅' : '⚠️';
  
  let answer = `${retentionEmoji} **Taxa de Retenção: ${retention.retentionRate.toFixed(1)}%**\n\n`;
  answer += `• Pacientes Ativos: ${retention.activePatients}\n`;
  answer += `• Pacientes Inativos: ${retention.inactivePatients}\n`;
  answer += `• Total: ${retention.totalPatients}\n\n`;
  
  if (retention.retentionRate > 80) {
    answer += `🎉 Excelente taxa de retenção! Seus pacientes estão muito engajados.`;
  } else if (retention.retentionRate > 60) {
    answer += `✅ Boa taxa de retenção. Continue acompanhando os pacientes inativos.`;
  } else {
    answer += `⚠️ Taxa de retenção baixa. Considere estratégias de re-engajamento.`;
  }

  return {
    question,
    answer,
    data: retention,
    category: "Retenção"
  };
}

async function handleAppointmentAnalysis(question: string): Promise<AdvancedFilterResult> {
  const now = getCurrentDateTime();
  const q = question.toLowerCase();
  
  const allAppointments = await db.getAllAppointments();
  let answer = "";
  let data: any = { currentDateTime: now, appointments: [], totalAppointments: allAppointments.length };
  
  if (q.includes("quantos agendamento") || (q.includes("quantos") && q.includes("agendamento"))) {
    answer = `Na base de dados ha ${allAppointments.length} agendamentos cadastrados no total.`;
    data.appointments = allAppointments;
  }
  else if (q.includes("proximo") || q.includes("agenda")) {
    const futureAppointments = allAppointments
      .filter((a: any) => a.startTime > now.timestamp)
      .sort((a: any, b: any) => a.startTime - b.startTime)
      .slice(0, 5);
    
    if (futureAppointments.length > 0) {
      answer = `**Proximos Agendamentos** (Agora: ${now.date} ${now.time}):\n\n`;
      futureAppointments.forEach((a: any, i: number) => {
        const startDate = formatUnixTimestamp(a.startTime);
        answer += `${i + 1}. **${a.title}** - ${startDate}\n`;
        if (a.description) answer += `   ${a.description}\n`;
      });
      data.appointments = futureAppointments;
    } else {
      answer = `Nenhum agendamento futuro encontrado. Data/hora atual: ${now.date} ${now.time}`;
    }
  } else if (q.includes("hoje")) {
    const todayStart = new Date(now.iso);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now.iso);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayAppointments = allAppointments
      .filter((a: any) => a.startTime >= todayStart.getTime() && a.startTime <= todayEnd.getTime())
      .sort((a: any, b: any) => a.startTime - b.startTime);
    
    if (todayAppointments.length > 0) {
      answer = `**Agendamentos de Hoje** (${now.date}):\n\n`;
      todayAppointments.forEach((a: any, i: number) => {
        const startDate = formatUnixTimestamp(a.startTime);
        answer += `${i + 1}. **${a.title}** - ${startDate}\n`;
        if (a.description) answer += `   ${a.description}\n`;
      });
      data.appointments = todayAppointments;
    } else {
      answer = `Nenhum agendamento para hoje (${now.date})`;
    }
  } else {
    const mostAppointments = await db.getPatientsWithMostAppointments(5);
    answer = `**Pacientes com Mais Agendamentos** (Agora: ${now.date} ${now.time}):\n\n`;
    mostAppointments.forEach((p: any, i: number) => {
      answer += `${i + 1}. **${p.name}** - ${p.appointmentCount} agendamentos\n`;
    });
    data.appointments = mostAppointments;
  }

  return {
    question,
    answer,
    data,
    category: "Agendamentos"
  };
}

async function handleApproachAnalysis(question: string): Promise<AdvancedFilterResult> {
  const approaches = await db.getPatientsByApproach();
  
  let answer = `**Pacientes por Abordagem Terapêutica:**\n\n`;
  
  Object.entries(approaches).forEach(([approach, patients]: any) => {
    if (patients.length > 0) {
      answer += `**${formatApproachName(approach)}** (${patients.length} pacientes)\n`;
      patients.slice(0, 3).forEach((p: any) => {
        answer += `  • ${p.name} - ${p.totalSessions} sessões\n`;
      });
      if (patients.length > 3) {
        answer += `  • ... e mais ${patients.length - 3}\n`;
      }
      answer += `\n`;
    }
  });

  return {
    question,
    answer,
    data: approaches,
    category: "Abordagens"
  };
}

async function handleNewPatientsAnalysis(question: string): Promise<AdvancedFilterResult> {
  const days = extractNumber(question) || 30;
  const newPatients = await db.getNewPatients(days);
  
  let answer = `**Novos Pacientes (últimos ${days} dias):** ${newPatients.length}\n\n`;
  
  if (newPatients.length > 0) {
    newPatients.forEach((p: any) => {
      const createdDate = new Date(p.createdAt).toLocaleDateString('pt-BR');
      answer += `• **${p.name}** (cadastrado em ${createdDate})\n`;
      answer += `  - Abordagem: ${formatApproachName(p.primaryApproach)}\n`;
      answer += `  - Sessões: ${p.totalSessions}\n`;
    });
  } else {
    answer = `Nenhum novo paciente nos últimos ${days} dias.`;
  }

  return {
    question,
    answer,
    data: newPatients,
    category: "Novos Pacientes"
  };
}

async function handleGeneralStatistics(question: string): Promise<AdvancedFilterResult> {
  const stats = await db.getGeneralStatistics();
  
  if (!stats) {
    return {
      question,
      answer: "Erro ao carregar estatísticas.",
      data: null,
      category: "Estatísticas"
    };
  }
  
  let answer = `📊 **Resumo Geral - Dashboard**\n\n`;
  answer += `**Pacientes:**\n`;
  answer += `• Total: ${stats.totalPatients}\n`;
  answer += `• Ativos: ${stats.activePatients} (${((stats.activePatients / stats.totalPatients) * 100).toFixed(1)}%)\n`;
  answer += `• Inativos: ${stats.inactivePatients}\n\n`;
  
  answer += `**Sessões:**\n`;
  answer += `• Total: ${stats.totalSessions}\n`;
  answer += `• Média por Paciente: ${stats.avgSessionsPerPatient.toFixed(1)}\n\n`;
  
  answer += `**Agendamentos:** ${stats.totalAppointments}\n\n`;
  
  answer += `**Taxa de Retenção:** ${stats.retentionRate.toFixed(1)}%\n\n`;
  
  answer += `**Distribuição por Abordagem:**\n`;
  stats.approachesSummary.forEach((a: any) => {
    answer += `• ${formatApproachName(a.name)}: ${a.count} (${a.percentage.toFixed(1)}%)\n`;
  });

  return {
    question,
    answer,
    data: stats,
    category: "Estatísticas"
  };
}

async function handleSessionAnalysis(question: string): Promise<AdvancedFilterResult> {
  const allPatients = await db.getAllPatients();
  const totalSessions = allPatients.reduce((sum: number, p: any) => sum + (p.totalSessions || 0), 0);
  const avgSessions = allPatients.length > 0 ? totalSessions / allPatients.length : 0;
  
  const maxSessions = Math.max(...allPatients.map((p: any) => p.totalSessions || 0));
  const minSessions = Math.min(...allPatients.map((p: any) => p.totalSessions || 0));
  
  let answer = `**Análise de Sessões:**\n\n`;
  answer += `• Total de Sessões: ${totalSessions}\n`;
  answer += `• Média por Paciente: ${avgSessions.toFixed(1)}\n`;
  answer += `• Máximo: ${maxSessions} sessões\n`;
  answer += `• Mínimo: ${minSessions} sessões\n`;

  return {
    question,
    answer,
    data: { totalSessions, avgSessions, maxSessions, minSessions },
    category: "Sessões"
  };
}

async function handlePatientDetails(question: string): Promise<AdvancedFilterResult> {
  const { processPatientQuestion } = await import("./patientMatcher");
  
  const result = await processPatientQuestion(question);
  
  if (!result.success) {
    return {
      question,
      answer: result.message,
      data: null,
      category: "Detalhes do Paciente"
    };
  }

  return {
    question,
    answer: result.answer,
    data: result.patientData,
    category: "Detalhes do Paciente"
  };
}

// ===== FUNÇÕES AUXILIARES =====

function extractNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function formatApproachName(approach: string): string {
  const names: Record<string, string> = {
    tcc: "TCC (Terapia Cognitivo-Comportamental)",
    terapia_esquema: "Terapia do Esquema",
    gestalt: "Gestalt",
    integrativa: "Integrativa"
  };
  return names[approach] || approach;
}
