/**
 * Sistema de Canal Secreto de Psicologia
 * Canal sem divulgar que Daniela é psicóloga até ter CRP
 */

export interface SecretChannel {
  id: string;
  name: string;
  description: string;
  platform: "instagram" | "youtube" | "telegram" | "whatsapp";
  handle: string;
  status: "active" | "paused" | "archived";
  crpRequired: boolean;
  crpStatus: "pending" | "approved" | "rejected";
  createdAt: Date;
  followers?: number;
  engagement?: number;
}

export interface ContentGuideline {
  id: string;
  title: string;
  rules: string[];
  keywords: string[];
  avoidKeywords: string[];
  tone: string;
  targetAudience: string;
}

export interface ChannelPost {
  id: string;
  channelId: string;
  title: string;
  content: string;
  category: string;
  status: "draft" | "scheduled" | "published";
  mentionsCRP: boolean;
  mentionsProfessional: boolean;
  publishedAt?: Date;
  engagement?: number;
}

/**
 * Cria canal secreto
 */
export async function createSecretChannel(
  name: string,
  description: string,
  platform: "instagram" | "youtube" | "telegram" | "whatsapp",
  handle: string
): Promise<SecretChannel | null> {
  try {
    const channel: SecretChannel = {
      id: `secret_${Date.now()}`,
      name,
      description,
      platform,
      handle,
      status: "active",
      crpRequired: true,
      crpStatus: "pending",
      createdAt: new Date(),
    };

    console.log(`✓ Canal secreto criado: ${name} (@${handle})`);
    return channel;
  } catch (error) {
    console.error("Erro ao criar canal:", error);
    return null;
  }
}

/**
 * Define diretrizes de conteúdo
 */
export async function createContentGuideline(
  title: string,
  tone: string,
  targetAudience: string
): Promise<ContentGuideline | null> {
  try {
    const guideline: ContentGuideline = {
      id: `guide_${Date.now()}`,
      title,
      rules: [
        "Não mencionar que é psicóloga até ter CRP",
        "Usar termos como 'especialista em bem-estar' ou 'orientadora de saúde mental'",
        "Focar em educação e autoajuda",
        "Não fazer diagnósticos",
        "Sempre recomendar procurar profissional quando necessário",
        "Manter tom acessível e amigável",
        "Evitar jargão técnico excessivo",
      ],
      keywords: [
        "bem-estar",
        "saúde mental",
        "autoconhecimento",
        "desenvolvimento pessoal",
        "relacionamentos",
        "emoções",
      ],
      avoidKeywords: [
        "psicóloga",
        "psicologia clínica",
        "diagnóstico",
        "transtorno",
        "patologia",
        "tratamento",
      ],
      tone,
      targetAudience,
    };

    console.log(`✓ Diretrizes de conteúdo criadas: ${title}`);
    return guideline;
  } catch (error) {
    console.error("Erro ao criar diretrizes:", error);
    return null;
  }
}

/**
 * Valida conteúdo antes de publicar
 */
export async function validateChannelContent(
  content: string,
  guideline: ContentGuideline
): Promise<{
  isValid: boolean;
  violations: string[];
  warnings: string[];
  score: number;
}> {
  try {
    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Verificar keywords proibidas
    guideline.avoidKeywords.forEach((keyword) => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        violations.push(`Contém palavra proibida: "${keyword}"`);
        score -= 20;
      }
    });

    // Verificar se menciona CRP
    if (
      content.toLowerCase().includes("crp") ||
      content.toLowerCase().includes("psicóloga")
    ) {
      violations.push("Menciona CRP ou profissão de psicóloga");
      score -= 30;
    }

    // Verificar se faz diagnóstico
    if (
      content.toLowerCase().includes("você tem") &&
      content.toLowerCase().includes("transtorno")
    ) {
      violations.push("Pode estar fazendo diagnóstico");
      score -= 25;
    }

    // Avisos
    if (content.length < 50) {
      warnings.push("Conteúdo muito curto");
    }

    if (!guideline.keywords.some((kw) => content.toLowerCase().includes(kw))) {
      warnings.push("Não contém keywords recomendadas");
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      score: Math.max(0, score),
    };
  } catch (error) {
    console.error("Erro ao validar conteúdo:", error);
    return {
      isValid: false,
      violations: ["Erro ao validar"],
      warnings: [],
      score: 0,
    };
  }
}

/**
 * Cria post para canal secreto
 */
export async function createSecretChannelPost(
  channelId: string,
  title: string,
  content: string,
  category: string,
  guideline: ContentGuideline
): Promise<ChannelPost | null> {
  try {
    // Validar conteúdo
    const validation = await validateChannelContent(content, guideline);

    if (!validation.isValid) {
      console.error("Conteúdo não passou na validação:", validation.violations);
      return null;
    }

    const post: ChannelPost = {
      id: `post_secret_${Date.now()}`,
      channelId,
      title,
      content,
      category,
      status: "draft",
      mentionsCRP: false,
      mentionsProfessional: false,
    };

    console.log(`✓ Post criado para canal secreto: ${title}`);
    return post;
  } catch (error) {
    console.error("Erro ao criar post:", error);
    return null;
  }
}

/**
 * Agenda transição para canal público
 */
export async function scheduleChannelTransition(
  channel: SecretChannel,
  crpApprovalDate: Date
): Promise<{
  status: string;
  message: string;
  transitionDate: Date;
  actions: string[];
}> {
  try {
    const actions = [
      "Atualizar bio do Instagram com 'Psicóloga - CRP XXXXX'",
      "Publicar post anunciando profissão",
      "Atualizar descrição do YouTube",
      "Enviar comunicado aos seguidores",
      "Ativar agendamento de consultas",
      "Integrar com sistema de pagamento",
    ];

    return {
      status: "scheduled",
      message: `Canal será transicionado para público em ${crpApprovalDate.toLocaleDateString("pt-BR")}`,
      transitionDate: crpApprovalDate,
      actions,
    };
  } catch (error) {
    console.error("Erro ao agendar transição:", error);
    return {
      status: "error",
      message: "Erro ao agendar transição",
      transitionDate: new Date(),
      actions: [],
    };
  }
}

/**
 * Gera relatório de conformidade
 */
export async function generateComplianceReport(posts: ChannelPost[]): Promise<string> {
  try {
    let report = "# Relatório de Conformidade do Canal Secreto\n\n";

    const totalPosts = posts.length;
    const crpMentions = posts.filter((p) => p.mentionsCRP).length;
    const professionalMentions = posts.filter((p) => p.mentionsProfessional).length;

    report += `## Resumo\n`;
    report += `- Total de Posts: ${totalPosts}\n`;
    report += `- Menções de CRP: ${crpMentions}\n`;
    report += `- Menções de Profissão: ${professionalMentions}\n`;
    report += `- Taxa de Conformidade: ${((1 - (crpMentions + professionalMentions) / totalPosts) * 100).toFixed(2)}%\n\n`;

    if (crpMentions > 0 || professionalMentions > 0) {
      report += `## ⚠️ Avisos\n`;
      if (crpMentions > 0) {
        report += `- ${crpMentions} posts mencionam CRP\n`;
      }
      if (professionalMentions > 0) {
        report += `- ${professionalMentions} posts mencionam profissão\n`;
      }
    } else {
      report += `## ✓ Tudo em conformidade\n`;
      report += `- Nenhuma menção de CRP ou profissão detectada\n`;
      report += `- Canal está pronto para operação\n`;
    }

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}

/**
 * Monitora menções de CRP
 */
export async function monitorCRPMentions(posts: ChannelPost[]): Promise<{
  totalMentions: number;
  posts: Array<{ id: string; title: string; mentions: number }>;
  recommendation: string;
}> {
  try {
    let totalMentions = 0;
    const mentionedPosts: Array<{ id: string; title: string; mentions: number }> = [];

    posts.forEach((post) => {
      if (post.mentionsCRP) {
        totalMentions++;
        mentionedPosts.push({
          id: post.id,
          title: post.title,
          mentions: 1,
        });
      }
    });

    let recommendation = "";
    if (totalMentions === 0) {
      recommendation = "Excelente! Nenhuma menção de CRP detectada.";
    } else if (totalMentions <= 2) {
      recommendation = "Atenção: Alguns posts mencionam CRP. Revise antes de publicar.";
    } else {
      recommendation = "Aviso: Muitas menções de CRP. Revisar estratégia de conteúdo.";
    }

    return {
      totalMentions,
      posts: mentionedPosts,
      recommendation,
    };
  } catch (error) {
    console.error("Erro ao monitorar menções:", error);
    return {
      totalMentions: 0,
      posts: [],
      recommendation: "Erro ao monitorar",
    };
  }
}

/**
 * Cria plano de transição
 */
export async function createTransitionPlan(
  channel: SecretChannel,
  crpApprovalDate: Date
): Promise<{
  phase: string;
  timeline: Array<{ date: Date; action: string; priority: string }>;
  risks: string[];
  opportunities: string[];
}> {
  try {
    const timeline = [
      {
        date: new Date(crpApprovalDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        action: "Preparar anúncio de transição",
        priority: "high",
      },
      {
        date: crpApprovalDate,
        action: "Publicar anúncio oficial",
        priority: "high",
      },
      {
        date: new Date(crpApprovalDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        action: "Atualizar bio com CRP",
        priority: "high",
      },
      {
        date: new Date(crpApprovalDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        action: "Ativar agendamento de consultas",
        priority: "medium",
      },
      {
        date: new Date(crpApprovalDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        action: "Lançar promoção de primeira consulta",
        priority: "medium",
      },
    ];

    return {
      phase: "Transição de Canal Secreto para Público",
      timeline,
      risks: [
        "Perda de seguidores após revelar profissão",
        "Mudança de tom de conteúdo",
        "Aumento de demanda por consultas",
      ],
      opportunities: [
        "Monetização através de consultas",
        "Credibilidade profissional",
        "Expansão de serviços",
        "Parcerias com outros profissionais",
      ],
    };
  } catch (error) {
    console.error("Erro ao criar plano:", error);
    return {
      phase: "Erro",
      timeline: [],
      risks: [],
      opportunities: [],
    };
  }
}
