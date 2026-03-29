/**
 * Sistema de Funil Viral Integrado
 * Implementa referral viral, automação de marketing e analytics
 */

import { invokeLLM } from "./_core/llm";

export interface ReferralLink {
  id: string;
  patientId: string;
  code: string;
  url: string;
  createdAt: Date;
  expiresAt?: Date;
  clicks: number;
  conversions: number;
  reward: "discount" | "free_session" | "badge";
  rewardValue: number;
  status: "active" | "expired" | "claimed";
}

export interface LeadScore {
  leadId: string;
  score: number; // 0-100
  factors: {
    messageCount: number;
    visitCount: number;
    clickCount: number;
    timeSpent: number;
    engagementRate: number;
    lastInteraction: Date;
  };
  temperature: "cold" | "warm" | "hot"; // Baseado no score
  nextAction: string;
  priority: number; // 1-10
}

export interface MarketingAutomation {
  id: string;
  leadId: string;
  type: "welcome" | "nurture" | "urgency" | "re_engagement" | "conversion";
  status: "scheduled" | "sent" | "opened" | "clicked" | "converted";
  scheduledFor: Date;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  content: string;
  channel: "whatsapp" | "email" | "sms" | "push";
}

export interface SocialProof {
  id: string;
  type: "testimonial" | "review" | "case_study" | "stat";
  content: string;
  author: string;
  rating?: number; // 1-5
  imageUrl?: string;
  verified: boolean;
  impressions: number;
  conversions: number;
}

/**
 * Gera código de referral único
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calcula lead score baseado em interações
 */
export function calculateLeadScore(factors: {
  messageCount: number;
  visitCount: number;
  clickCount: number;
  timeSpent: number; // em segundos
  lastInteractionDaysAgo: number;
}): LeadScore {
  let score = 0;

  // Mensagens (máx 30 pontos)
  score += Math.min(factors.messageCount * 3, 30);

  // Visitas (máx 25 pontos)
  score += Math.min(factors.visitCount * 2.5, 25);

  // Cliques (máx 20 pontos)
  score += Math.min(factors.clickCount * 2, 20);

  // Tempo gasto (máx 15 pontos)
  const minutesSpent = factors.timeSpent / 60;
  score += Math.min(minutesSpent * 0.5, 15);

  // Recência (máx 10 pontos)
  if (factors.lastInteractionDaysAgo === 0) score += 10;
  else if (factors.lastInteractionDaysAgo === 1) score += 8;
  else if (factors.lastInteractionDaysAgo <= 3) score += 5;
  else if (factors.lastInteractionDaysAgo <= 7) score += 2;

  // Determinar temperatura
  let temperature: "cold" | "warm" | "hot" = "cold";
  if (score >= 70) temperature = "hot";
  else if (score >= 40) temperature = "warm";

  // Próxima ação recomendada
  let nextAction = "";
  if (temperature === "hot") {
    nextAction = "Enviar proposta de agendamento imediato";
  } else if (temperature === "warm") {
    nextAction = "Enviar conteúdo de valor e case study";
  } else {
    nextAction = "Enviar mensagem de boas-vindas e educação";
  }

  // Prioridade (1-10)
  const priority = Math.ceil(score / 10);

  return {
    leadId: "",
    score: Math.round(score),
    factors: {
      messageCount: factors.messageCount,
      visitCount: factors.visitCount,
      clickCount: factors.clickCount,
      timeSpent: factors.timeSpent,
      engagementRate:
        (factors.messageCount + factors.visitCount + factors.clickCount) / 3,
      lastInteraction: new Date(Date.now() - factors.lastInteractionDaysAgo * 24 * 60 * 60 * 1000),
    },
    temperature,
    nextAction,
    priority,
  };
}

/**
 * Gera sequência de automação de marketing
 */
export async function generateMarketingSequence(
  leadName: string,
  leadInterests: string[]
): Promise<string[]> {
  try {
    const systemPrompt = `Você é um especialista em marketing de consultórios psicológicos.
Crie uma sequência de 5 mensagens de marketing automático para um lead, progressivamente mais persuasivas.
Cada mensagem deve ser humanizada, não robótica, e focada em benefícios clínicos.
Retorne um JSON array com as 5 mensagens.`;

    const userPrompt = `Crie sequência para: ${leadName}
Interesses: ${leadInterests.join(", ")}

Retorne JSON: ["mensagem1", "mensagem2", "mensagem3", "mensagem4", "mensagem5"]`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "marketing_sequence",
          strict: true,
          schema: {
            type: "array",
            items: { type: "string" },
            minItems: 5,
            maxItems: 5,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return parsed;
  } catch (error) {
    console.error("Erro ao gerar sequência de marketing:", error);
    return [
      "Olá! Bem-vindo ao consultório da Psicóloga Daniela Coelho.",
      "Conheça nossas abordagens terapêuticas personalizadas.",
      "Veja como nossos pacientes evoluem com nosso tratamento.",
      "Agende sua primeira consulta com 20% de desconto.",
      "Não perca! Vagas limitadas para este mês.",
    ];
  }
}

/**
 * Calcula taxa de conversão por canal
 */
export function calculateConversionRate(
  channel: string,
  leads: number,
  conversions: number
): number {
  if (leads === 0) return 0;
  return (conversions / leads) * 100;
}

/**
 * Gera recomendação de otimização de funil
 */
export async function generateFunnelOptimization(
  metrics: {
    channel: string;
    leads: number;
    conversions: number;
    avgTimeToConvert: number;
  }[]
): Promise<string[]> {
  try {
    const systemPrompt = `Você é um especialista em otimização de funil de vendas para consultórios.
Analise as métricas e gere 3-5 recomendações específicas e acionáveis.
Retorne um JSON array com as recomendações.`;

    const userPrompt = `Métricas do funil:
${metrics.map((m) => `${m.channel}: ${m.leads} leads, ${m.conversions} conversões, ${m.avgTimeToConvert}h médio`).join("\n")}

Retorne JSON: ["recomendação1", "recomendação2", "recomendação3"]`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "funnel_optimization",
          strict: true,
          schema: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return parsed;
  } catch (error) {
    console.error("Erro ao gerar otimizações:", error);
    return [
      "Aumentar frequência de conteúdo educativo",
      "Implementar retargeting para leads que visitaram mas não converteram",
      "Criar oferta especial para leads warm",
    ];
  }
}

/**
 * Gera social proof baseado em dados reais
 */
export function generateSocialProof(
  patientName: string,
  testimonial: string,
  rating: number
): SocialProof {
  return {
    id: `sp_${Date.now()}`,
    type: "testimonial",
    content: testimonial,
    author: patientName,
    rating,
    verified: true,
    impressions: 0,
    conversions: 0,
  };
}

/**
 * Calcula impacto de referral viral
 */
export function calculateViralImpact(
  initialLeads: number,
  referralRate: number, // 0-1
  conversionRate: number // 0-1
): {
  month1: number;
  month2: number;
  month3: number;
  totalGrowth: number;
} {
  let month1 = initialLeads * conversionRate;
  let month2 = month1 + initialLeads * referralRate * conversionRate;
  let month3 =
    month2 +
    (initialLeads + month1 + month2) * referralRate * conversionRate;

  return {
    month1: Math.round(month1),
    month2: Math.round(month2),
    month3: Math.round(month3),
    totalGrowth: Math.round(month1 + month2 + month3),
  };
}
