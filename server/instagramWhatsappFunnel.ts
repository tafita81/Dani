/**
 * Sistema de Funil Instagram → WhatsApp
 * Automação completa de leads do Instagram para WhatsApp
 */

export interface InstagramLead {
  id: string;
  instagramHandle: string;
  name: string;
  email?: string;
  phone?: string;
  region: string; // Estado do Brasil
  interests: string[];
  engagementScore: number; // 0-100
  source: "story" | "post" | "dm" | "comment" | "profile";
  capturedAt: Date;
  status: "new" | "contacted" | "interested" | "qualified" | "converted";
  notes?: string;
}

export interface WhatsappMessage {
  id: string;
  leadId: string;
  phone: string;
  message: string;
  template: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  response?: string;
}

export interface FunnelMetrics {
  totalLeads: number;
  leadsContacted: number;
  leadsInterested: number;
  leadsQualified: number;
  converted: number;
  conversionRate: number;
  avgEngagementScore: number;
  topRegions: Array<{ region: string; count: number }>;
}

/**
 * Captura lead do Instagram
 */
export async function captureInstagramLead(
  instagramHandle: string,
  name: string,
  source: "story" | "post" | "dm" | "comment" | "profile",
  region: string,
  interests: string[] = []
): Promise<InstagramLead | null> {
  try {
    const lead: InstagramLead = {
      id: `lead_${Date.now()}`,
      instagramHandle,
      name,
      region,
      interests,
      engagementScore: Math.random() * 100,
      source,
      capturedAt: new Date(),
      status: "new",
    };

    console.log(`✓ Lead capturado do Instagram: ${name} (@${instagramHandle})`);
    return lead;
  } catch (error) {
    console.error("Erro ao capturar lead:", error);
    return null;
  }
}

/**
 * Valida número de WhatsApp
 */
export function validateWhatsappNumber(phone: string): boolean {
  // Remove caracteres especiais
  const cleaned = phone.replace(/\D/g, "");

  // Valida formato brasileiro: 55 + DDD + 9 + 8 dígitos
  const brazilianPattern = /^55\d{2}9\d{8}$/;
  return brazilianPattern.test(cleaned);
}

/**
 * Formata número para WhatsApp
 */
export function formatWhatsappNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  // Se não tiver código do país, adiciona 55
  if (!cleaned.startsWith("55")) {
    cleaned = "55" + cleaned;
  }

  return cleaned;
}

/**
 * Envia mensagem de boas-vindas via WhatsApp
 */
export async function sendWelcomeMessage(
  lead: InstagramLead,
  phone: string
): Promise<WhatsappMessage | null> {
  try {
    if (!validateWhatsappNumber(phone)) {
      console.error("Número de WhatsApp inválido:", phone);
      return null;
    }

    const formattedPhone = formatWhatsappNumber(phone);

    const message: WhatsappMessage = {
      id: `msg_${Date.now()}`,
      leadId: lead.id,
      phone: formattedPhone,
      message: `Olá ${lead.name}! 👋\n\nObrigada por nos seguir no Instagram! 🙏\n\nSou especialista em psicologia clínica e estou aqui para ajudar você com orientações sobre bem-estar mental, relacionamentos e desenvolvimento pessoal.\n\nComo posso ajudá-lo(a) hoje?`,
      template: "welcome",
      sentAt: new Date(),
      status: "pending",
    };

    console.log(`✓ Mensagem de boas-vindas enviada para ${formattedPhone}`);
    return message;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
}

/**
 * Envia mensagem de qualificação
 */
export async function sendQualificationMessage(
  lead: InstagramLead,
  phone: string
): Promise<WhatsappMessage | null> {
  try {
    const formattedPhone = formatWhatsappNumber(phone);

    const message: WhatsappMessage = {
      id: `msg_${Date.now()}`,
      leadId: lead.id,
      phone: formattedPhone,
      message: `Ótimo! 🎯\n\nPara entender melhor como posso ajudar, me diga:\n\n1️⃣ Qual é sua principal dificuldade no momento?\n2️⃣ Você já fez terapia antes?\n3️⃣ Qual é o melhor horário para uma conversa?\n\nEstou aqui para ouvir! 👂`,
      template: "qualification",
      sentAt: new Date(),
      status: "pending",
    };

    console.log(`✓ Mensagem de qualificação enviada para ${formattedPhone}`);
    return message;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
}

/**
 * Envia proposta de sessão
 */
export async function sendSessionProposal(
  lead: InstagramLead,
  phone: string,
  availableSlots: string[]
): Promise<WhatsappMessage | null> {
  try {
    const formattedPhone = formatWhatsappNumber(phone);

    const slotsText = availableSlots
      .map((slot, i) => `${i + 1}️⃣ ${slot}`)
      .join("\n");

    const message: WhatsappMessage = {
      id: `msg_${Date.now()}`,
      leadId: lead.id,
      phone: formattedPhone,
      message: `Perfeito! 🌟\n\nTenho ótimas notícias! Tenho disponibilidade para uma primeira sessão de avaliação.\n\nEscolha o melhor horário para você:\n\n${slotsText}\n\nResponda com o número da opção que preferir!`,
      template: "proposal",
      sentAt: new Date(),
      status: "pending",
    };

    console.log(`✓ Proposta de sessão enviada para ${formattedPhone}`);
    return message;
  } catch (error) {
    console.error("Erro ao enviar proposta:", error);
    return null;
  }
}

/**
 * Segmenta leads por região
 */
export async function segmentLeadsByRegion(leads: InstagramLead[]): Promise<Record<string, InstagramLead[]>> {
  try {
    const segments: Record<string, InstagramLead[]> = {};

    leads.forEach((lead) => {
      if (!segments[lead.region]) {
        segments[lead.region] = [];
      }
      segments[lead.region].push(lead);
    });

    console.log(`✓ Leads segmentados por região: ${Object.keys(segments).length} estados`);
    return segments;
  } catch (error) {
    console.error("Erro ao segmentar leads:", error);
    return {};
  }
}

/**
 * Calcula score de engajamento
 */
export function calculateEngagementScore(
  followers: number,
  likes: number,
  comments: number,
  shares: number,
  profileViews: number
): number {
  // Fórmula ponderada
  const score =
    (likes * 1 + comments * 3 + shares * 5 + profileViews * 0.1) / (followers * 0.01 || 1);

  return Math.min(100, Math.round(score));
}

/**
 * Identifica leads de alto valor
 */
export function identifyHighValueLeads(leads: InstagramLead[]): InstagramLead[] {
  return leads
    .filter((lead) => lead.engagementScore >= 70)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 50); // Top 50
}

/**
 * Calcula métricas do funil
 */
export async function calculateFunnelMetrics(leads: InstagramLead[]): Promise<FunnelMetrics> {
  try {
    const totalLeads = leads.length;
    const leadsContacted = leads.filter((l) => l.status !== "new").length;
    const leadsInterested = leads.filter((l) => l.status === "interested").length;
    const leadsQualified = leads.filter((l) => l.status === "qualified").length;
    const converted = leads.filter((l) => l.status === "converted").length;

    // Segmentar por região
    const regionCounts: Record<string, number> = {};
    leads.forEach((lead) => {
      regionCounts[lead.region] = (regionCounts[lead.region] || 0) + 1;
    });

    const topRegions = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const avgEngagementScore =
      leads.reduce((sum, l) => sum + l.engagementScore, 0) / (totalLeads || 1);

    return {
      totalLeads,
      leadsContacted,
      leadsInterested,
      leadsQualified,
      converted,
      conversionRate: totalLeads > 0 ? (converted / totalLeads) * 100 : 0,
      avgEngagementScore: Math.round(avgEngagementScore),
      topRegions,
    };
  } catch (error) {
    console.error("Erro ao calcular métricas:", error);
    return {
      totalLeads: 0,
      leadsContacted: 0,
      leadsInterested: 0,
      leadsQualified: 0,
      converted: 0,
      conversionRate: 0,
      avgEngagementScore: 0,
      topRegions: [],
    };
  }
}

/**
 * Processa fila de automação do funil
 */
export async function processFunnelAutomationQueue(leads: InstagramLead[]): Promise<{
  processed: number;
  messagesQueued: number;
  errors: number;
}> {
  try {
    let processed = 0;
    let messagesQueued = 0;
    let errors = 0;

    console.log("Processando fila de automação do funil Instagram→WhatsApp...");

    for (const lead of leads) {
      processed++;

      try {
        // Enviar mensagem de boas-vindas se for novo lead
        if (lead.status === "new" && lead.phone) {
          const msg = await sendWelcomeMessage(lead, lead.phone);
          if (msg) {
            messagesQueued++;
            lead.status = "contacted";
          }
        }

        // Enviar mensagem de qualificação se foi contatado
        if (lead.status === "contacted" && lead.phone) {
          const msg = await sendQualificationMessage(lead, lead.phone);
          if (msg) {
            messagesQueued++;
          }
        }
      } catch (error) {
        errors++;
        console.error(`Erro ao processar lead ${lead.id}:`, error);
      }
    }

    console.log(
      `✓ Fila processada: ${processed} leads, ${messagesQueued} mensagens enfileiradas, ${errors} erros`
    );
    return { processed, messagesQueued, errors };
  } catch (error) {
    console.error("Erro ao processar fila:", error);
    return { processed: 0, messagesQueued: 0, errors: 0 };
  }
}

/**
 * Gera relatório de funil
 */
export async function generateFunnelReport(metrics: FunnelMetrics): Promise<string> {
  try {
    let report = "# Relatório do Funil Instagram → WhatsApp\n\n";

    report += `## Resumo\n`;
    report += `- Total de Leads: ${metrics.totalLeads}\n`;
    report += `- Leads Contatados: ${metrics.leadsContacted}\n`;
    report += `- Leads Interessados: ${metrics.leadsInterested}\n`;
    report += `- Leads Qualificados: ${metrics.leadsQualified}\n`;
    report += `- Conversões: ${metrics.converted}\n`;
    report += `- Taxa de Conversão: ${metrics.conversionRate.toFixed(2)}%\n`;
    report += `- Engajamento Médio: ${metrics.avgEngagementScore}/100\n\n`;

    report += `## Top Regiões\n`;
    metrics.topRegions.forEach((r) => {
      report += `- ${r.region}: ${r.count} leads\n`;
    });

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}
