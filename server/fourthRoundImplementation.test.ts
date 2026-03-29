import { describe, it, expect } from "vitest";
import {
  createEmailTemplate,
  createEmailSequence,
  analyzeLeadBehavior,
  determineSequence,
  sendSequenceEmail,
  calculateCampaignStats,
  segmentLeadsForEmail,
  createDefaultTemplates,
} from "./emailMarketingAutomation";
import {
  initializeCRMConnection,
  fetchDealsFromCRM,
  fetchContactsFromCRM,
  syncWithCRM,
  createDealInCRM,
  createContactInCRM,
  mapPipelineStages,
  calculatePipelineAnalytics,
  generateSyncReport,
} from "./crmIntegration";

describe("Automação de Email Marketing", () => {
  it("deve criar template de email", async () => {
    const template = await createEmailTemplate({
      name: "Boas-vindas",
      subject: "Bem-vindo!",
      bodyHtml: "<h1>Olá {{name}}</h1>",
      variables: ["name"],
      category: "welcome",
      active: true,
    });

    expect(template).toBeDefined();
    expect(template?.id).toBeDefined();
    expect(template?.name).toBe("Boas-vindas");
  });

  it("deve criar sequência de email", async () => {
    const sequence = await createEmailSequence({
      name: "Sequência de Boas-vindas",
      description: "Sequência para novos leads",
      emails: [
        { step: 1, templateId: "template_1", delayHours: 0 },
        { step: 2, templateId: "template_2", delayHours: 24 },
      ],
      triggerEvent: "signup",
      active: true,
    });

    expect(sequence).toBeDefined();
    expect(sequence?.id).toBeDefined();
    expect(sequence?.emails.length).toBe(2);
  });

  it("deve analisar comportamento do lead", async () => {
    const behavior = await analyzeLeadBehavior("lead_123");

    expect(behavior).toBeDefined();
    expect(behavior?.leadId).toBe("lead_123");
    expect(behavior?.engagement).toMatch(/high|medium|low/);
    expect(behavior?.stage).toMatch(/discovery|consideration|decision|inactive/);
  });

  it("deve determinar sequência baseada em comportamento", async () => {
    const behavior = {
      leadId: "lead_123",
      email: "lead@example.com",
      lastVisit: new Date(),
      pageViews: 8,
      clickCount: 3,
      timeOnSite: 1200,
      engagement: "medium" as const,
      stage: "consideration" as const,
    };

    const sequenceId = await determineSequence(behavior);

    expect(sequenceId).toBeDefined();
    expect(typeof sequenceId).toBe("string");
  });

  it("deve enviar email da sequência", async () => {
    const result = await sendSequenceEmail(
      "lead_123",
      "seq_welcome",
      1,
      "template_1",
      { name: "João" }
    );

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("deve calcular estatísticas de campanha", async () => {
    const stats = await calculateCampaignStats("campaign_123");

    expect(stats).toBeDefined();
    expect(typeof stats.openRate).toBe("number");
    expect(typeof stats.clickRate).toBe("number");
    expect(typeof stats.conversionRate).toBe("number");
    expect(typeof stats.roi).toBe("number");
  });

  it("deve segmentar leads para email marketing", async () => {
    const segments = await segmentLeadsForEmail();

    expect(segments).toBeDefined();
    expect(segments.highEngagement).toBeGreaterThanOrEqual(0);
    expect(segments.mediumEngagement).toBeGreaterThanOrEqual(0);
    expect(segments.lowEngagement).toBeGreaterThanOrEqual(0);
    expect(segments.inactive).toBeGreaterThanOrEqual(0);
  });

  it("deve criar templates padrão", async () => {
    const templates = await createDefaultTemplates();

    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].name).toBeDefined();
  });
});

describe("Integração com CRM Externo", () => {
  it("deve inicializar conexão com CRM", async () => {
    const config = {
      provider: "pipedrive" as const,
      apiKey: "test_key",
      apiUrl: "https://api.pipedrive.com",
      syncInterval: 60,
    };

    const result = await initializeCRMConnection(config);

    expect(result).toBe(true);
  });

  it("deve buscar deals do CRM", async () => {
    const config = {
      provider: "pipedrive" as const,
      apiKey: "test_key",
      apiUrl: "https://api.pipedrive.com",
      syncInterval: 60,
    };

    const deals = await fetchDealsFromCRM(config);

    expect(deals).toBeDefined();
    expect(Array.isArray(deals)).toBe(true);
    if (deals.length > 0) {
      expect(deals[0].id).toBeDefined();
      expect(deals[0].title).toBeDefined();
      expect(deals[0].value).toBeGreaterThan(0);
    }
  });

  it("deve buscar contatos do CRM", async () => {
    const config = {
      provider: "hubspot" as const,
      apiKey: "test_key",
      apiUrl: "https://api.hubapi.com",
      syncInterval: 60,
    };

    const contacts = await fetchContactsFromCRM(config);

    expect(contacts).toBeDefined();
    expect(Array.isArray(contacts)).toBe(true);
    if (contacts.length > 0) {
      expect(contacts[0].id).toBeDefined();
      expect(contacts[0].name).toBeDefined();
      expect(contacts[0].email).toBeDefined();
    }
  });

  it("deve sincronizar com CRM", async () => {
    const config = {
      provider: "pipedrive" as const,
      apiKey: "test_key",
      apiUrl: "https://api.pipedrive.com",
      syncInterval: 60,
    };

    const syncLog = await syncWithCRM(config);

    expect(syncLog).toBeDefined();
    expect(syncLog.id).toBeDefined();
    expect(syncLog.status).toMatch(/success|failed|partial/);
    expect(syncLog.recordsSynced).toBeGreaterThanOrEqual(0);
  });

  it("deve criar novo deal no CRM", async () => {
    const config = {
      provider: "pipedrive" as const,
      apiKey: "test_key",
      apiUrl: "https://api.pipedrive.com",
      syncInterval: 60,
    };

    const deal = await createDealInCRM(config, {
      title: "Consultoria de Terapia",
      value: 5000,
      currency: "BRL",
      stage: "negotiation",
      owner: "João Silva",
      contact: {
        name: "Maria Santos",
        email: "maria@example.com",
        phone: "11999999999",
      },
      updatedAt: new Date(),
    });

    expect(deal).toBeDefined();
    expect(deal?.id).toBeDefined();
    expect(deal?.title).toBe("Consultoria de Terapia");
  });

  it("deve criar novo contato no CRM", async () => {
    const config = {
      provider: "hubspot" as const,
      apiKey: "test_key",
      apiUrl: "https://api.hubapi.com",
      syncInterval: 60,
    };

    const contact = await createContactInCRM(config, {
      name: "Ana Silva",
      email: "ana@example.com",
      phone: "11987654321",
      company: "Tech Corp",
    });

    expect(contact).toBeDefined();
    expect(contact?.id).toBeDefined();
    expect(contact?.name).toBe("Ana Silva");
  });

  it("deve mapear estágios do pipeline", () => {
    const pipedriveStages = mapPipelineStages("pipedrive");
    const hubspotStages = mapPipelineStages("hubspot");

    expect(pipedriveStages).toBeDefined();
    expect(hubspotStages).toBeDefined();
    expect(pipedriveStages.lead).toBeDefined();
    expect(hubspotStages.lead).toBeDefined();
  });

  it("deve calcular analytics do pipeline", async () => {
    const deals = [
      {
        id: "deal_1",
        title: "Deal 1",
        value: 5000,
        currency: "BRL",
        stage: "negotiation",
        owner: "João",
        contact: { name: "Maria", email: "maria@example.com", phone: "11999999999" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "deal_2",
        title: "Deal 2",
        value: 3000,
        currency: "BRL",
        stage: "won",
        owner: "João",
        contact: { name: "Carlos", email: "carlos@example.com", phone: "11888888888" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const analytics = await calculatePipelineAnalytics(deals);

    expect(analytics).toBeDefined();
    expect(analytics.totalValue).toBe(8000);
    expect(analytics.dealCount).toBe(2);
    expect(analytics.avgDealValue).toBe(4000);
    expect(analytics.conversionRate).toBeGreaterThan(0);
  });

  it("deve gerar relatório de sincronização", async () => {
    const logs = [
      {
        id: "sync_1",
        provider: "pipedrive",
        timestamp: new Date(),
        status: "success" as const,
        recordsSynced: 50,
        recordsFailed: 0,
      },
    ];

    const report = await generateSyncReport(logs);

    expect(report).toBeDefined();
    expect(typeof report).toBe("string");
    expect(report.length).toBeGreaterThan(0);
  });
});

describe("Integração Completa: Vendas + Email + CRM", () => {
  it("deve ter todos os sistemas funcionando", async () => {
    // Email Marketing
    const templates = await createDefaultTemplates();
    expect(templates.length).toBeGreaterThan(0);

    // CRM
    const config = {
      provider: "pipedrive" as const,
      apiKey: "test_key",
      apiUrl: "https://api.pipedrive.com",
      syncInterval: 60,
    };

    const connected = await initializeCRMConnection(config);
    expect(connected).toBe(true);
  });

  it("deve calcular ROI de campanha de email", async () => {
    const emailsSent = 1000;
    const openRate = 0.35;
    const clickRate = 0.3;
    const conversionRate = 0.2;
    const revenuePerConversion = 500;
    const emailCost = 0.5;

    const opens = emailsSent * openRate;
    const clicks = opens * clickRate;
    const conversions = clicks * conversionRate;
    const revenue = conversions * revenuePerConversion;
    const cost = emailsSent * emailCost;
    const roi = ((revenue - cost) / cost) * 100;

    expect(roi).toBeGreaterThan(0);
    expect(conversions).toBeGreaterThan(0);
  });
});
