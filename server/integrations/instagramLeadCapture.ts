/**
 * Instagram Lead Capture System
 * Coleta automaticamente leads de comentários, DMs e cliques em bio
 */

export interface InstagramLead {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  source: "comment" | "dm" | "bio_click" | "story_mention";
  message?: string;
  postId?: string;
  timestamp: Date;
  qualified: boolean;
  score: number; // 0-100
}

export interface LeadQualificationResult {
  qualified: boolean;
  score: number;
  reason: string;
  suggestedAction: string;
}

/**
 * 1. CAPTURAR LEADS DE COMENTÁRIOS
 */
export async function captureCommentLeads(
  postId: string,
  comments: Array<{ username: string; text: string; timestamp: Date }>
): Promise<InstagramLead[]> {
  const leads: InstagramLead[] = [];

  for (const comment of comments) {
    // Detectar keywords de interesse
    const hasInterest = detectInterestKeywords(comment.text);
    if (!hasInterest) continue;

    // Extrair email ou telefone se disponível
    const email = extractEmail(comment.text);
    const phone = extractPhone(comment.text);

    // Qualificar lead
    const qualification = qualifyLead(comment.text, email, phone);

    leads.push({
      id: `comment_${postId}_${comment.username}`,
      username: comment.username,
      email,
      phone,
      source: "comment",
      message: comment.text,
      postId,
      timestamp: comment.timestamp,
      qualified: qualification.qualified,
      score: qualification.score,
    });
  }

  return leads;
}

/**
 * 2. CAPTURAR LEADS DE DMs
 */
export async function captureDMLeads(
  messages: Array<{ username: string; text: string; timestamp: Date }>
): Promise<InstagramLead[]> {
  const leads: InstagramLead[] = [];

  for (const message of messages) {
    // Extrair informações de contato
    const email = extractEmail(message.text);
    const phone = extractPhone(message.text);

    // Qualificar lead
    const qualification = qualifyLead(message.text, email, phone);

    leads.push({
      id: `dm_${message.username}`,
      username: message.username,
      email,
      phone,
      source: "dm",
      message: message.text,
      timestamp: message.timestamp,
      qualified: qualification.qualified,
      score: qualification.score,
    });
  }

  return leads;
}

/**
 * 3. CAPTURAR CLIQUES NO LINK DA BIO
 */
export async function captureBioClickLeads(
  clicks: Array<{ username: string; timestamp: Date; referrer: string }>
): Promise<InstagramLead[]> {
  const leads: InstagramLead[] = [];

  for (const click of clicks) {
    leads.push({
      id: `bio_${click.username}`,
      username: click.username,
      source: "bio_click",
      timestamp: click.timestamp,
      qualified: true, // Clique na bio já é qualificação
      score: 60, // Score base para bio clicks
    });
  }

  return leads;
}

/**
 * 4. DETECTAR KEYWORDS DE INTERESSE
 */
function detectInterestKeywords(text: string): boolean {
  const keywords = [
    "consulta",
    "terapia",
    "psicologia",
    "ajuda",
    "depressão",
    "ansiedade",
    "relacionamento",
    "trauma",
    "sessão",
    "psicólogo",
    "interessado",
    "quero",
    "preciso",
    "como",
    "onde",
    "quando",
  ];

  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * 5. EXTRAIR EMAIL
 */
function extractEmail(text: string): string | undefined {
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  const match = text.match(emailRegex);
  return match ? match[0] : undefined;
}

/**
 * 6. EXTRAIR TELEFONE
 */
function extractPhone(text: string): string | undefined {
  const phoneRegex = /(\+?55)?[\s]?(\d{2})[\s]?9?[\s]?(\d{4})[\s]?(\d{4})/;
  const match = text.match(phoneRegex);
  return match ? match[0].replace(/\s/g, "") : undefined;
}

/**
 * 7. QUALIFICAR LEAD
 */
function qualifyLead(
  text: string,
  email?: string,
  phone?: string
): LeadQualificationResult {
  let score = 0;
  const reasons: string[] = [];

  // Ter email ou telefone
  if (email) {
    score += 30;
    reasons.push("Email fornecido");
  }
  if (phone) {
    score += 30;
    reasons.push("Telefone fornecido");
  }

  // Ter keywords de interesse
  if (detectInterestKeywords(text)) {
    score += 20;
    reasons.push("Keywords de interesse detectadas");
  }

  // Comprimento da mensagem
  if (text.length > 50) {
    score += 10;
    reasons.push("Mensagem detalhada");
  }

  // Urgência
  if (
    text.toLowerCase().includes("urgente") ||
    text.toLowerCase().includes("rápido")
  ) {
    score += 10;
    reasons.push("Urgência detectada");
  }

  const qualified = score >= 50;
  const suggestedAction = qualified
    ? "Enviar proposta de consulta"
    : "Enviar conteúdo educativo";

  return {
    qualified,
    score: Math.min(score, 100),
    reason: reasons.join(" + "),
    suggestedAction,
  };
}

/**
 * 8. PROCESSAR LOTE DE LEADS
 */
export async function processBatchLeads(
  leads: InstagramLead[]
): Promise<{
  total: number;
  qualified: number;
  unqualified: number;
  avgScore: number;
}> {
  const qualified = leads.filter((l) => l.qualified).length;
  const unqualified = leads.length - qualified;
  const avgScore =
    leads.reduce((sum, l) => sum + l.score, 0) / Math.max(leads.length, 1);

  return {
    total: leads.length,
    qualified,
    unqualified,
    avgScore: Math.round(avgScore),
  };
}

/**
 * 9. ENVIAR LEAD PARA FUNIL DE VENDAS
 */
export async function sendLeadToFunnel(lead: InstagramLead): Promise<{
  success: boolean;
  message: string;
  funnelId?: string;
}> {
  try {
    // Validar lead
    if (!lead.qualified || lead.score < 50) {
      return {
        success: false,
        message: "Lead não qualificado para funil",
      };
    }

    // Enviar para WhatsApp se tiver telefone
    if (lead.phone) {
      await sendWhatsAppMessage(lead.phone, lead.username);
    }

    // Enviar para email se tiver email
    if (lead.email) {
      await sendEmailMessage(lead.email, lead.username);
    }

    return {
      success: true,
      message: "Lead enviado para funil com sucesso",
      funnelId: `funnel_${lead.id}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao enviar lead: ${error instanceof Error ? error.message : "Desconhecido"}`,
    };
  }
}

/**
 * 10. ENVIAR MENSAGEM WHATSAPP
 */
async function sendWhatsAppMessage(
  phone: string,
  username: string
): Promise<void> {
  console.log(`📱 Enviando WhatsApp para ${phone} (${username})`);
  // Implementar integração real com WhatsApp API
}

/**
 * 11. ENVIAR MENSAGEM EMAIL
 */
async function sendEmailMessage(
  email: string,
  username: string
): Promise<void> {
  console.log(`📧 Enviando email para ${email} (${username})`);
  // Implementar integração real com Email API
}

/**
 * 12. GERAR RELATÓRIO DE LEADS
 */
export function generateLeadReport(leads: InstagramLead[]): string {
  const qualified = leads.filter((l) => l.qualified);
  const bySource = leads.reduce(
    (acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return `
# 📊 RELATÓRIO DE LEADS INSTAGRAM

**Data:** ${new Date().toLocaleString("pt-BR")}

## Resumo
- Total de Leads: ${leads.length}
- Leads Qualificados: ${qualified.length} (${Math.round((qualified.length / leads.length) * 100)}%)
- Score Médio: ${Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)}

## Por Fonte
${Object.entries(bySource)
  .map(([source, count]) => `- ${source}: ${count}`)
  .join("\n")}

## Leads Qualificados
${qualified
  .map(
    (l) =>
      `- @${l.username} (Score: ${l.score}) - ${l.email || l.phone || "Sem contato"}`
  )
  .join("\n")}
  `;
}
