import { describe, it, expect } from "vitest";
import {
  captureInstagramLead,
  validateWhatsappNumber,
  formatWhatsappNumber,
  sendWelcomeMessage,
  calculateFunnelMetrics,
  processFunnelAutomationQueue,
} from "./instagramWhatsappFunnel";
import {
  createSocialPost,
  schedulePost,
  publishPost,
  createContentCalendar,
  generateContentSuggestions,
  optimizeCaption,
  analyzePostPerformance,
} from "./socialMediaManagement";
import {
  createAutomatedPost,
  calculateNextPostingTime,
  processAutomatedPostingQueue,
  createPostingSchedule,
  generatePsychologyContent,
  createThematicSeries,
} from "./automatedPostingScheduler";
import {
  captureBrazilianLead,
  identifyRegion,
  calculateLeadScore,
  segmentLeadsByRegion,
  calculateRegionalMetrics,
  identifyRegionalOpportunities,
} from "./brazilLeadCapture";
import {
  createSecretChannel,
  createContentGuideline,
  validateChannelContent,
  createSecretChannelPost,
  monitorCRPMentions,
} from "./secretPsychologyChannel";

describe("Funil Instagram → WhatsApp", () => {
  it("deve capturar lead do Instagram", async () => {
    const lead = await captureInstagramLead(
      "usuario_teste",
      "João Silva",
      "post",
      "SP",
      ["ansiedade", "relacionamentos"]
    );

    expect(lead).toBeDefined();
    expect(lead?.name).toBe("João Silva");
    expect(lead?.status).toBe("new");
  });

  it("deve validar número de WhatsApp", () => {
    expect(validateWhatsappNumber("11999999999")).toBe(true);
    expect(validateWhatsappNumber("5511999999999")).toBe(true);
    expect(validateWhatsappNumber("123")).toBe(false);
  });

  it("deve formatar número para WhatsApp", () => {
    const formatted = formatWhatsappNumber("11999999999");
    expect(formatted).toBe("5511999999999");
  });

  it("deve enviar mensagem de boas-vindas", async () => {
    const lead = await captureInstagramLead(
      "usuario_teste",
      "Maria Santos",
      "story",
      "RJ",
      ["bem-estar"]
    );

    if (lead) {
      const message = await sendWelcomeMessage(lead, "11999999999");
      expect(message).toBeDefined();
      expect(message?.status).toBe("pending");
    }
  });

  it("deve calcular métricas do funil", async () => {
    const leads = [
      {
        id: "lead_1",
        instagramHandle: "user1",
        name: "User 1",
        region: "SP",
        interests: ["psicologia"],
        engagementScore: 75,
        source: "post" as const,
        capturedAt: new Date(),
        status: "contacted" as const,
      },
    ];

    const metrics = await calculateFunnelMetrics(leads);

    expect(metrics).toBeDefined();
    expect(metrics.totalLeads).toBe(1);
  });
});

describe("Gestão de Redes Sociais", () => {
  it("deve criar post para redes sociais", async () => {
    const post = await createSocialPost(
      "instagram",
      "5 Sinais de Ansiedade",
      "Aprenda a identificar sinais de ansiedade",
      "https://example.com/image.jpg",
      "Você conhece esses sinais? #psicologia",
      ["#psicologia", "#saúde"],
      "psychology"
    );

    expect(post).toBeDefined();
    expect(post?.status).toBe("draft");
  });

  it("deve agendar post para publicação", async () => {
    const post = await createSocialPost(
      "instagram",
      "Teste",
      "Descrição",
      "url",
      "Caption",
      ["#test"],
      "tips"
    );

    if (post) {
      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const scheduled = await schedulePost(post, scheduledDate);

      expect(scheduled?.status).toBe("scheduled");
      expect(scheduled?.scheduledAt).toEqual(scheduledDate);
    }
  });

  it("deve gerar sugestões de conteúdo", async () => {
    const suggestions = await generateContentSuggestions("psychology", 3);

    expect(suggestions).toBeDefined();
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("deve otimizar caption com hashtags", async () => {
    const caption = "Dica importante sobre saúde mental";
    const optimized = await optimizeCaption(caption, "psychology", "instagram");

    expect(optimized).toContain("#");
    expect(optimized.length).toBeGreaterThan(caption.length);
  });
});

describe("Postagens Automáticas", () => {
  it("deve criar post automático", async () => {
    const post = await createAutomatedPost(
      "Dica Diária",
      "Conteúdo da dica",
      "tips",
      ["instagram"],
      "daily",
      19
    );

    expect(post).toBeDefined();
    expect(post?.frequency).toBe("daily");
    expect(post?.active).toBe(true);
  });

  it("deve calcular próximo horário de postagem", () => {
    const post = {
      id: "test",
      title: "Test",
      content: "Test",
      category: "tips",
      platforms: ["instagram"] as const,
      frequency: "daily" as const,
      hour: 19,
      minute: 0,
      active: true,
      createdAt: new Date(),
      successCount: 0,
      failureCount: 0,
    };

    const nextTime = calculateNextPostingTime(post);

    expect(nextTime).toBeInstanceOf(Date);
    expect(nextTime.getTime()).toBeGreaterThan(Date.now());
  });

  it("deve gerar conteúdo de psicologia", async () => {
    const content = await generatePsychologyContent("anxiety", "beginner");

    expect(content).toBeDefined();
    expect(content?.title).toBeDefined();
    expect(content?.content).toBeDefined();
  });

  it("deve criar série temática", async () => {
    const series = await createThematicSeries("7-dias-de-mindfulness", 3, ["instagram"]);

    expect(series).toBeDefined();
    expect(series.length).toBe(3);
  });
});

describe("Coleta de Leads do Brasil", () => {
  it("deve capturar lead brasileiro", async () => {
    const lead = await captureBrazilianLead(
      "Ana Silva",
      "ana@example.com",
      "11999999999",
      "SP",
      "São Paulo",
      ["ansiedade"],
      "instagram"
    );

    expect(lead).toBeDefined();
    expect(lead?.state).toBe("SP");
    expect(lead?.region).toBe("sudeste");
  });

  it("deve identificar região pelo estado", () => {
    expect(identifyRegion("SP")).toBe("sudeste");
    expect(identifyRegion("BA")).toBe("nordeste");
    expect(identifyRegion("AC")).toBe("norte");
  });

  it("deve calcular score do lead", () => {
    const score = calculateLeadScore({
      email: "test@example.com",
      phone: "11999999999",
      interests: ["psicologia", "bem-estar"],
    });

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("deve calcular métricas por região", async () => {
    const leads = [
      {
        id: "lead_1",
        name: "User 1",
        state: "SP",
        region: "sudeste" as const,
        interests: [],
        captureSource: "instagram" as const,
        capturedAt: new Date(),
        status: "new" as const,
        score: 75,
      },
    ];

    const metrics = await calculateRegionalMetrics(leads);

    expect(metrics).toBeDefined();
    expect(metrics.length).toBeGreaterThan(0);
  });
});

describe("Canal Secreto de Psicologia", () => {
  it("deve criar canal secreto", async () => {
    const channel = await createSecretChannel(
      "Bem-estar Mental",
      "Canal de orientação em saúde mental",
      "instagram",
      "bemestarmenta"
    );

    expect(channel).toBeDefined();
    expect(channel?.crpRequired).toBe(true);
    expect(channel?.crpStatus).toBe("pending");
  });

  it("deve criar diretrizes de conteúdo", async () => {
    const guideline = await createContentGuideline(
      "Diretrizes Secretas",
      "Amigável e educativo",
      "Pessoas interessadas em bem-estar"
    );

    expect(guideline).toBeDefined();
    expect(guideline?.rules.length).toBeGreaterThan(0);
  });

  it("deve validar conteúdo sem mencionar CRP", async () => {
    const guideline = await createContentGuideline(
      "Diretrizes",
      "Amigável",
      "Público geral"
    );

    if (guideline) {
      const validation = await validateChannelContent(
        "Dica importante sobre ansiedade",
        guideline
      );

      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(50);
    }
  });

  it("deve rejeitar conteúdo que menciona CRP", async () => {
    const guideline = await createContentGuideline(
      "Diretrizes",
      "Amigável",
      "Público geral"
    );

    if (guideline) {
      const validation = await validateChannelContent(
        "Sou psicóloga com CRP e posso ajudar",
        guideline
      );

      expect(validation.isValid).toBe(false);
      expect(validation.violations.length).toBeGreaterThan(0);
    }
  });

  it("deve monitorar menções de CRP", async () => {
    const posts = [
      {
        id: "post_1",
        channelId: "channel_1",
        title: "Bem-estar",
        content: "Conteúdo seguro",
        category: "tips",
        status: "published" as const,
        mentionsCRP: false,
        mentionsProfessional: false,
      },
    ];

    const monitoring = await monitorCRPMentions(posts);

    expect(monitoring.totalMentions).toBe(0);
    expect(monitoring.recommendation).toContain("Excelente");
  });
});

describe("Integração Completa: Instagram → Leads → Vendas", () => {
  it("deve ter todos os sistemas funcionando", async () => {
    // Capturar lead
    const lead = await captureInstagramLead(
      "usuario_teste",
      "João Silva",
      "post",
      "SP",
      ["ansiedade"]
    );
    expect(lead).toBeDefined();

    // Criar conteúdo
    const post = await createSocialPost(
      "instagram",
      "Teste",
      "Desc",
      "url",
      "Caption",
      ["#test"],
      "psychology"
    );
    expect(post).toBeDefined();

    // Criar canal secreto
    const channel = await createSecretChannel(
      "Teste",
      "Desc",
      "instagram",
      "teste"
    );
    expect(channel).toBeDefined();
  });

  it("deve calcular ROI do funil Instagram→WhatsApp→Vendas", () => {
    const instagramFollowers = 15420;
    const engagementRate = 0.085;
    const leadCaptureRate = 0.05;
    const conversionRate = 0.061;
    const avgTicket = 500;

    const impressions = instagramFollowers * 30; // 30 impressões por seguidor
    const engagements = impressions * engagementRate;
    const leads = engagements * leadCaptureRate;
    const customers = leads * conversionRate;
    const revenue = customers * avgTicket;

    const cost = 1000; // Custo mensal
    const roi = ((revenue - cost) / cost) * 100;

    expect(revenue).toBeGreaterThan(0);
    expect(roi).toBeGreaterThan(0);
  });
});
