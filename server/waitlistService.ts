/**
 * Serviço de Waitlist de Interessados
 * Gerencia cadastro de pessoas interessadas em usar o sistema quando certificação for obtida
 */

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  phone?: string;
  interest: "consultas" | "informacoes" | "ambos";
  createdAt: Date;
  notifiedAt?: Date;
  status: "active" | "notified" | "unsubscribed";
}

export interface WaitlistStats {
  totalSubscribers: number;
  activeSubscribers: number;
  notifiedSubscribers: number;
  interestBreakdown: {
    consultas: number;
    informacoes: number;
    ambos: number;
  };
  lastSubscriber: WaitlistEntry | null;
  subscriptionGrowth: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * Valida dados de cadastro na waitlist
 */
export function validateWaitlistEntry(entry: Partial<WaitlistEntry>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!entry.email) {
    errors.push("Email é obrigatório");
  } else if (!isValidEmail(entry.email)) {
    errors.push("Email inválido");
  }

  if (!entry.name || entry.name.trim().length < 3) {
    errors.push("Nome deve ter pelo menos 3 caracteres");
  }

  if (entry.phone && !isValidPhone(entry.phone)) {
    errors.push("Telefone inválido");
  }

  if (!entry.interest || !["consultas", "informacoes", "ambos"].includes(entry.interest)) {
    errors.push("Interesse deve ser: consultas, informacoes ou ambos");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de telefone
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?(\d{2})\)?[\s-]?(\d{4,5})[\s-]?(\d{4})$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * Gera mensagem de boas-vindas para novo inscrito
 */
export function generateWelcomeMessage(name: string, interest: string): string {
  const messages: { [key: string]: string } = {
    consultas: `Olá ${name}! 👋

Obrigada por se interessar em agendar consultas conosco! Você foi adicionado à nossa lista de espera e receberá uma notificação assim que o sistema estiver disponível em 2027.

Enquanto isso, você pode:
• Ler nossos artigos sobre psicologia clínica no blog
• Responder formulários de autoavaliação (PHQ-9, GAD-7)
• Nos contatar via WhatsApp para dúvidas

Até breve! 💙`,

    informacoes: `Olá ${name}! 👋

Obrigada por se interessar em receber informações sobre nossos serviços! Você foi adicionado à nossa lista de espera e receberá atualizações sobre novidades e conteúdo educativo.

Fique atento ao nosso blog para artigos sobre:
• Terapia Cognitivo-Comportamental (TCC)
• Terapia do Esquema (TE)
• Gestalt-Terapia
• Saúde mental e bem-estar

Até breve! 💙`,

    ambos: `Olá ${name}! 👋

Obrigada por se interessar em nossos serviços! Você foi adicionado à nossa lista de espera e receberá notificações sobre:
• Disponibilidade de agendamento de consultas (2027)
• Novos artigos e conteúdo educativo
• Atualizações sobre nossos serviços

Enquanto isso, explore nosso blog e conheça mais sobre as abordagens terapêuticas que utilizamos.

Até breve! 💙`,
  };

  return messages[interest] || messages["ambos"];
}

/**
 * Gera mensagem de notificação de ativação do sistema
 */
export function generateActivationNotification(name: string): string {
  return `Olá ${name}! 🎉

Excelente notícia! O sistema de agendamento de consultas está agora disponível!

Você pode agora:
✅ Agendar consultas online
✅ Escolher entre planos de inscrição
✅ Acessar seu portal de paciente
✅ Acompanhar seu progresso clínico

Clique no link abaixo para fazer seu primeiro agendamento:
[LINK DE AGENDAMENTO]

Qualquer dúvida, entre em contato conosco via WhatsApp.

Esperamos por você! 💙`;
}

/**
 * Calcula estatísticas da waitlist
 */
export function calculateWaitlistStats(entries: WaitlistEntry[]): WaitlistStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const activeEntries = entries.filter((e) => e.status === "active");
  const notifiedEntries = entries.filter((e) => e.status === "notified");

  const interestBreakdown = {
    consultas: entries.filter((e) => e.interest === "consultas").length,
    informacoes: entries.filter((e) => e.interest === "informacoes").length,
    ambos: entries.filter((e) => e.interest === "ambos").length,
  };

  const todaySubscribers = entries.filter((e) => e.createdAt >= today).length;
  const weekSubscribers = entries.filter((e) => e.createdAt >= weekAgo).length;
  const monthSubscribers = entries.filter((e) => e.createdAt >= monthAgo).length;

  const sortedByDate = [...entries].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return {
    totalSubscribers: entries.length,
    activeSubscribers: activeEntries.length,
    notifiedSubscribers: notifiedEntries.length,
    interestBreakdown,
    lastSubscriber: sortedByDate[0] || null,
    subscriptionGrowth: {
      today: todaySubscribers,
      thisWeek: weekSubscribers,
      thisMonth: monthSubscribers,
    },
  };
}

/**
 * Gera relatório de waitlist
 */
export function generateWaitlistReport(stats: WaitlistStats): string {
  const lines: string[] = [
    "=== RELATÓRIO DE WAITLIST ===",
    "",
    `Total de Inscritos: ${stats.totalSubscribers}`,
    `Inscritos Ativos: ${stats.activeSubscribers}`,
    `Notificados: ${stats.notifiedSubscribers}`,
    "",
    "Interesse por Categoria:",
    `  • Consultas: ${stats.interestBreakdown.consultas}`,
    `  • Informações: ${stats.interestBreakdown.informacoes}`,
    `  • Ambos: ${stats.interestBreakdown.ambos}`,
    "",
    "Crescimento de Inscrições:",
    `  • Hoje: ${stats.subscriptionGrowth.today}`,
    `  • Esta Semana: ${stats.subscriptionGrowth.thisWeek}`,
    `  • Este Mês: ${stats.subscriptionGrowth.thisMonth}`,
  ];

  if (stats.lastSubscriber) {
    lines.push("");
    lines.push("Último Inscrito:");
    lines.push(`  • Nome: ${stats.lastSubscriber.name}`);
    lines.push(`  • Email: ${stats.lastSubscriber.email}`);
    lines.push(`  • Interesse: ${stats.lastSubscriber.interest}`);
    lines.push(`  • Data: ${stats.lastSubscriber.createdAt.toLocaleDateString("pt-BR")}`);
  }

  return lines.join("\n");
}

/**
 * Detecta padrões de interesse
 */
export function detectInterestPatterns(entries: WaitlistEntry[]): {
  primaryInterest: string;
  secondaryInterest: string;
  insights: string[];
} {
  const stats = calculateWaitlistStats(entries);

  const interests = [
    { name: "consultas", count: stats.interestBreakdown.consultas },
    { name: "informacoes", count: stats.interestBreakdown.informacoes },
    { name: "ambos", count: stats.interestBreakdown.ambos },
  ];

  interests.sort((a, b) => b.count - a.count);

  const primaryInterest = interests[0]?.name || "ambos";
  const secondaryInterest = interests[1]?.name || "ambos";

  const insights: string[] = [];

  if (stats.interestBreakdown.ambos > stats.interestBreakdown.consultas) {
    insights.push("Maioria dos inscritos tem interesse em ambos os serviços");
  }

  if (stats.subscriptionGrowth.today > 5) {
    insights.push("Crescimento significativo de inscrições hoje");
  }

  if (stats.activeSubscribers > stats.totalSubscribers * 0.9) {
    insights.push("Taxa de retenção muito alta");
  }

  return {
    primaryInterest,
    secondaryInterest,
    insights,
  };
}

/**
 * Valida se email já existe na waitlist
 */
export function checkEmailExists(email: string, entries: WaitlistEntry[]): boolean {
  return entries.some((e) => e.email.toLowerCase() === email.toLowerCase());
}

/**
 * Gera ID único para entrada
 */
export function generateWaitlistId(): string {
  return `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
