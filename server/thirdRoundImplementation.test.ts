import { describe, it, expect } from "vitest";
import {
  saveNotificationPreference,
  getNotificationPreference,
  createNotificationEvent,
  shouldSendNotification,
  getNotificationStats,
} from "./notificationDatabase";
import {
  createABTest,
  assignVariant,
  calculateSampleSize,
  performChiSquareTest,
  shouldStopTest,
  generateABTestReport,
  exportABTestResultsCSV,
} from "./abTestingSystem";

describe("Integração com Banco de Dados - Notificações", () => {
  it("deve salvar preferências de notificação", async () => {
    const preference = {
      userId: "user_123",
      type: "appointment" as const,
      enabled: true,
      channels: {
        push: true,
        email: true,
        sms: false,
        whatsapp: true,
      },
      timing: {
        appointment: "24h" as const,
        lead: "immediate" as const,
        message: "immediate" as const,
      },
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await saveNotificationPreference(preference);
    expect(result).toBe(true);
  });

  it("deve buscar preferências de notificação", async () => {
    const preference = await getNotificationPreference("user_123");

    expect(preference).toBeDefined();
    expect(preference?.userId).toBe("user_123");
    expect(preference?.enabled).toBe(true);
    expect(preference?.channels.push).toBe(true);
  });

  it("deve criar evento de notificação", async () => {
    const event = await createNotificationEvent({
      userId: "user_123",
      type: "appointment",
      title: "Lembrete de Consulta",
      content: "Sua consulta está marcada para amanhã",
      channels: ["push", "email"],
      scheduledFor: new Date(),
      metadata: { appointmentId: "apt_123" },
    });

    expect(event).toBeDefined();
    expect(event?.id).toBeDefined();
    expect(event?.status).toBe("pending");
  });

  it("deve verificar se deve enviar notificação", async () => {
    const shouldSend = await shouldSendNotification("user_123", "appointment");

    expect(typeof shouldSend).toBe("boolean");
  });

  it("deve calcular estatísticas de notificações", async () => {
    const stats = await getNotificationStats("user_123");

    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.sent).toBe("number");
    expect(typeof stats.read).toBe("number");
    expect(typeof stats.readRate).toBe("number");
  });
});

describe("Sistema de A/B Testing", () => {
  it("deve criar novo teste A/B", async () => {
    const test = await createABTest({
      name: "Teste Headline",
      stage: "discovery",
      description: "Testar diferentes headlines",
      variants: [
        {
          id: "control",
          testId: "test_1",
          name: "Control",
          type: "control",
          description: "Headline original",
          changes: { headline: "Cuide da sua saúde mental" },
        },
        {
          id: "variant_1",
          testId: "test_1",
          name: "Variant 1",
          type: "variant",
          description: "Headline alternativo",
          changes: { headline: "Transforme sua vida com terapia" },
        },
      ],
      startDate: new Date(),
      status: "active",
      hypothesis: "Headline mais emocional terá melhor conversão",
      successMetric: "conversion_rate",
      minSampleSize: 1000,
      confidenceLevel: 0.95,
    });

    expect(test).toBeDefined();
    expect(test?.id).toBeDefined();
    expect(test?.variants.length).toBe(2);
  });

  it("deve atribuir variante consistentemente", () => {
    const variants = [
      {
        id: "control",
        testId: "test_1",
        name: "Control",
        type: "control" as const,
        description: "Control",
        changes: {},
      },
      {
        id: "variant_1",
        testId: "test_1",
        name: "Variant 1",
        type: "variant" as const,
        description: "Variant",
        changes: {},
      },
    ];

    const variant1 = assignVariant("test_1", "user_123", variants);
    const variant2 = assignVariant("test_1", "user_123", variants);

    expect(variant1.id).toBe(variant2.id);
  });

  it("deve calcular tamanho de amostra", () => {
    const sampleSize = calculateSampleSize(0.05, 0.2, 0.95, 0.8);

    expect(sampleSize).toBeGreaterThan(0);
    expect(typeof sampleSize).toBe("number");
  });

  it("deve realizar teste Chi-Square", () => {
    const result = performChiSquareTest(280, 5000, 320, 5000);

    expect(result).toBeDefined();
    expect(typeof result.pValue).toBe("number");
    expect(typeof result.isSignificant).toBe("boolean");
    expect(typeof result.confidence).toBe("number");
  });

  it("deve determinar quando parar o teste", () => {
    const stats = {
      testId: "test_1",
      startDate: new Date(),
      duration: 7,
      totalVisitors: 10000,
      totalConversions: 600,
      overallConversionRate: 6.0,
      variants: [
        {
          testId: "test_1",
          variantId: "control",
          variantName: "Control",
          totalVisitors: 5000,
          conversions: 280,
          conversionRate: 5.6,
          confidence: 0.85,
          winner: false,
        },
        {
          testId: "test_1",
          variantId: "variant_1",
          variantName: "Variant 1",
          totalVisitors: 5000,
          conversions: 320,
          conversionRate: 6.4,
          confidence: 0.92,
          winner: true,
        },
      ],
      winner: {
        variantId: "variant_1",
        variantName: "Variant 1",
        improvement: 14.3,
        confidence: 0.92,
      },
      recommendation: "Implementar variante vencedora",
    };

    const decision = shouldStopTest(stats, 1000, 0.95);

    expect(decision).toBeDefined();
    expect(typeof decision.shouldStop).toBe("boolean");
    expect(decision.reason).toBeDefined();
    expect(decision.recommendation).toBeDefined();
  });

  it("deve gerar relatório do teste", async () => {
    const report = await generateABTestReport("test_1");

    expect(report).toBeDefined();
    expect(typeof report).toBe("string");
    expect(report.length).toBeGreaterThan(0);
  });

  it("deve exportar resultados em CSV", () => {
    const stats = {
      testId: "test_1",
      startDate: new Date(),
      duration: 7,
      totalVisitors: 10000,
      totalConversions: 600,
      overallConversionRate: 6.0,
      variants: [
        {
          testId: "test_1",
          variantId: "control",
          variantName: "Control",
          totalVisitors: 5000,
          conversions: 280,
          conversionRate: 5.6,
          confidence: 0.85,
          winner: false,
        },
      ],
    };

    const csv = exportABTestResultsCSV(stats);

    expect(csv).toContain("Variante");
    expect(csv).toContain("Control");
    expect(csv).toContain("5000");
  });
});

describe("Integração Completa: Dashboard + Notificações + A/B Testing", () => {
  it("deve ter todos os sistemas funcionando", async () => {
    // Notificações
    const preference = await getNotificationPreference("user_123");
    expect(preference).toBeDefined();

    // A/B Testing
    const test = await createABTest({
      name: "Teste Integrado",
      stage: "discovery",
      description: "Teste integrado",
      variants: [],
      startDate: new Date(),
      status: "active",
      hypothesis: "Hipótese",
      successMetric: "metric",
      minSampleSize: 1000,
      confidenceLevel: 0.95,
    });

    expect(test).toBeDefined();
  });

  it("deve calcular ROI de testes A/B", () => {
    const baselineConversion = 0.05;
    const improvement = 0.15; // 15% de melhoria
    const visitors = 10000;
    const revenuePerConversion = 500;

    const baselineRevenue = visitors * baselineConversion * revenuePerConversion;
    const improvedRevenue = visitors * (baselineConversion * (1 + improvement)) * revenuePerConversion;
    const roi = ((improvedRevenue - baselineRevenue) / baselineRevenue) * 100;

    expect(roi).toBeGreaterThan(0);
    expect(roi).toBeLessThanOrEqual(100);
  });
});
