import { describe, it, expect } from "vitest";
import {
  generateOutlookAuthUrl,
  detectSchedulingConflicts,
  fetchOutlookCalendarEvents,
  createOutlookCalendarEvent,
  syncEventWithOutlook,
} from "./outlookOAuth";
import {
  defineFunnelStages,
  calculateFunnelMetrics,
  generateHeatmapData,
  identifyBottlenecks,
  generateOptimizationRecommendations,
  calculateOptimizationImpact,
  generateFunnelAnalyticsReport,
  exportFunnelAnalyticsCSV,
} from "./funnelAnalytics";

describe("Integração Outlook OAuth2", () => {
  it("deve gerar URL de autorização OAuth2", () => {
    const config = {
      clientId: "test_client_id",
      clientSecret: "test_secret",
      redirectUri: "http://localhost:3000/callback",
      tenantId: "common",
    };

    const url = generateOutlookAuthUrl(config);

    expect(url).toContain("login.microsoftonline.com");
    expect(url).toContain("client_id=test_client_id");
    expect(url).toContain("Calendars.ReadWrite");
  });

  it("deve detectar conflitos de horário", async () => {
    const existingEvents = [
      {
        id: "event_1",
        subject: "Consulta 1",
        start: new Date("2026-04-01T10:00:00"),
        end: new Date("2026-04-01T11:00:00"),
        organizer: "therapist@example.com",
        attendees: ["patient@example.com"],
        isOnlineMeeting: false,
        categories: [],
      },
    ];

    const proposedStart = new Date("2026-04-01T10:30:00");
    const proposedEnd = new Date("2026-04-01T11:30:00");

    const result = await detectSchedulingConflicts(
      "mock_token",
      proposedStart,
      proposedEnd,
      existingEvents
    );

    expect(result.hasConflict).toBe(true);
    expect(result.conflictingEvents.length).toBe(1);
    expect(result.severity).toBe("medium");
    expect(result.suggestedAlternativeSlots.length).toBeGreaterThan(0);
  });

  it("deve sincronizar evento com Outlook", async () => {
    const appointmentData = {
      patientName: "João Silva",
      therapistEmail: "therapist@example.com",
      patientEmail: "patient@example.com",
      startTime: new Date("2026-04-01T10:00:00"),
      endTime: new Date("2026-04-01T11:00:00"),
      description: "Consulta psicológica",
    };

    const result = await syncEventWithOutlook("mock_token", appointmentData);

    expect(typeof result.success).toBe("boolean");
    expect(typeof result.conflictDetected).toBe("boolean");
  });
});

describe("Analytics de Conversão do Funil", () => {
  it("deve definir estágios do funil", () => {
    const stages = defineFunnelStages();

    expect(stages.length).toBe(5);
    expect(stages[0].name).toBe("Descoberta");
    expect(stages[stages.length - 1].name).toBe("Retenção");
    expect(stages.every((s) => s.order > 0)).toBe(true);
  });

  it("deve calcular métricas do funil", () => {
    const stages = defineFunnelStages();
    const metrics = calculateFunnelMetrics(stages);

    expect(metrics.totalUsers).toBe(10000);
    expect(metrics.overallConversionRate).toBeGreaterThan(0);
    expect(metrics.overallConversionRate).toBeLessThanOrEqual(100);
    expect(metrics.stageMetrics.length).toBe(5);
  });

  it("deve gerar dados de heatmap", () => {
    const stages = defineFunnelStages();
    const heatmap = generateHeatmapData(stages);

    expect(heatmap.length).toBe(5);
    heatmap.forEach((data) => {
      expect(["cold", "warm", "hot", "very_hot"]).toContain(data.heatIntensity);
      expect(data.conversionRate).toBeGreaterThanOrEqual(0);
      expect(data.conversionRate).toBeLessThanOrEqual(100);
    });
  });

  it("deve identificar gargalos", () => {
    const stages = defineFunnelStages();
    const bottlenecks = identifyBottlenecks(stages);

    expect(Array.isArray(bottlenecks)).toBe(true);
    bottlenecks.forEach((bn) => {
      expect(bn.dropoffRate).toBeGreaterThan(50);
    });
  });

  it("deve gerar recomendações de otimização", () => {
    const stages = defineFunnelStages();
    const recommendations = generateOptimizationRecommendations(stages);

    expect(Array.isArray(recommendations)).toBe(true);
    recommendations.forEach((rec) => {
      expect(rec.stageId).toBeDefined();
      expect(rec.stageName).toBeDefined();
      expect(rec.recommendation).toBeDefined();
      expect(["low", "medium", "high"]).toContain(rec.priority);
      expect(rec.estimatedImpact).toBeGreaterThan(0);
      expect(rec.actionItems.length).toBeGreaterThan(0);
    });
  });

  it("deve calcular impacto de otimizações", () => {
    const stages = defineFunnelStages();
    const metrics = calculateFunnelMetrics(stages);
    const recommendations = generateOptimizationRecommendations(stages);
    const impact = calculateOptimizationImpact(metrics, recommendations);

    expect(impact.currentConversion).toBeGreaterThan(0);
    expect(impact.projectedConversion).toBeGreaterThanOrEqual(impact.currentConversion);
    expect(impact.potentialGain).toBeGreaterThanOrEqual(0);
    expect(impact.additionalLeads).toBeGreaterThanOrEqual(0);
  });

  it("deve gerar relatório completo de analytics", () => {
    const stages = defineFunnelStages();
    const report = generateFunnelAnalyticsReport(stages);

    expect(report.metrics).toBeDefined();
    expect(report.heatmap).toBeDefined();
    expect(report.bottlenecks).toBeDefined();
    expect(report.recommendations).toBeDefined();
    expect(report.impact).toBeDefined();
  });

  it("deve exportar dados em CSV", () => {
    const stages = defineFunnelStages();
    const report = generateFunnelAnalyticsReport(stages);
    const csv = exportFunnelAnalyticsCSV(report);

    expect(csv).toContain("Estágio");
    expect(csv).toContain("Descoberta");
    expect(csv).toContain("Recomendações");
    expect(csv.split("\n").length).toBeGreaterThanOrEqual(10);
  });
});

describe("Integração Completa: Outlook + Notificações + Analytics", () => {
  it("deve ter todos os sistemas funcionando", () => {
    // Outlook OAuth
    const config = {
      clientId: "test",
      clientSecret: "test",
      redirectUri: "http://localhost",
      tenantId: "common",
    };
    const authUrl = generateOutlookAuthUrl(config);
    expect(authUrl).toBeDefined();

    // Funil Analytics
    const stages = defineFunnelStages();
    const metrics = calculateFunnelMetrics(stages);
    expect(metrics.overallConversionRate).toBeGreaterThan(0);

    // Recomendações
    const recommendations = generateOptimizationRecommendations(stages);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it("deve calcular ROI de otimizações", () => {
    const stages = defineFunnelStages();
    const metrics = calculateFunnelMetrics(stages);
    const recommendations = generateOptimizationRecommendations(stages);
    const impact = calculateOptimizationImpact(metrics, recommendations);

    const roi = (impact.additionalLeads * 500) / 1000; // Assumindo R$500 por lead
    expect(roi).toBeGreaterThan(0);
  });
});
