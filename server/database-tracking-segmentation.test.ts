import { describe, it, expect, beforeEach } from "vitest";
import { getEmailTrackingService, EmailTrackingService } from "./emailTrackingService";
import { getSegmentationService, SegmentationService } from "./segmentationService";

describe("Email Tracking Service", () => {
  let trackingService: EmailTrackingService;

  beforeEach(() => {
    trackingService = getEmailTrackingService();
  });

  describe("Pixel de Rastreamento", () => {
    it("deve gerar pixel de rastreamento", () => {
      const pixelUrl = trackingService.generateTrackingPixel("email-123", "subscriber-456");
      expect(pixelUrl).toContain("/api/tracking/pixel/");
      expect(pixelUrl).toContain("email-123");
    });

    it("deve gerar link rastreável", () => {
      const originalUrl = "https://example.com/article";
      const trackableUrl = trackingService.generateTrackableLink("email-123", "subscriber-456", originalUrl);
      expect(trackableUrl).toContain("/api/tracking/click/");
      expect(trackableUrl).toContain("email-123");
    });
  });

  describe("Registro de Aberturas", () => {
    it("deve registrar abertura de email", () => {
      trackingService.recordOpen("email-123", "subscriber-456", "Mozilla/5.0", "192.168.1.1");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.opened).toBe(true);
      expect(stats?.openCount).toBe(1);
    });

    it("deve contar múltiplas aberturas", () => {
      trackingService.recordOpen("email-123", "subscriber-456");
      trackingService.recordOpen("email-123", "subscriber-456");
      trackingService.recordOpen("email-123", "subscriber-456");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.openCount).toBe(3);
    });

    it("deve registrar data de abertura", () => {
      trackingService.recordOpen("email-123", "subscriber-456");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.openedAt).toBeDefined();
      expect(stats?.openedAt).toBeInstanceOf(Date);
    });
  });

  describe("Registro de Cliques", () => {
    it("deve registrar clique em link", () => {
      trackingService.recordClick(
        "email-123",
        "subscriber-456",
        "https://example.com/article",
        "Mozilla/5.0",
        "192.168.1.1"
      );
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.clickCount).toBe(1);
    });

    it("deve contar múltiplos cliques", () => {
      trackingService.recordClick("email-123", "subscriber-456", "https://example.com/article");
      trackingService.recordClick("email-123", "subscriber-456", "https://example.com/article");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.clickCount).toBe(2);
    });

    it("deve rastrear diferentes links", () => {
      trackingService.recordClick("email-123", "subscriber-456", "https://example.com/article1");
      trackingService.recordClick("email-123", "subscriber-456", "https://example.com/article2");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.clicks.length).toBe(2);
    });
  });

  describe("Score de Engajamento", () => {
    it("deve calcular score com abertura", () => {
      trackingService.recordOpen("email-123", "subscriber-456");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.engagementScore).toBeGreaterThanOrEqual(50);
    });

    it("deve calcular score com cliques", () => {
      trackingService.recordClick("email-123", "subscriber-456", "https://example.com/article");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.engagementScore).toBeGreaterThanOrEqual(50);
    });

    it("deve calcular score máximo de 100", () => {
      trackingService.recordOpen("email-123", "subscriber-456");
      trackingService.recordOpen("email-123", "subscriber-456");
      trackingService.recordClick("email-123", "subscriber-456", "https://example.com/article");
      trackingService.recordClick("email-123", "subscriber-456", "https://example.com/article");
      const stats = trackingService.getTrackingStats("email-123");
      expect(stats?.engagementScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Relatório de Engajamento", () => {
    it("deve gerar relatório de engajamento", () => {
      trackingService.recordOpen("email-1", "subscriber-1");
      trackingService.recordClick("email-1", "subscriber-1", "https://example.com/article");
      trackingService.recordOpen("email-2", "subscriber-2");

      const report = trackingService.generateEngagementReport(["email-1", "email-2"]);
      expect(report.totalEmails).toBe(2);
      expect(report.openedEmails).toBe(2);
      expect(report.totalClicks).toBeGreaterThanOrEqual(1);
    });

    it("deve listar links mais clicados", () => {
      trackingService.recordClick("email-1", "subscriber-1", "https://example.com/article1");
      trackingService.recordClick("email-1", "subscriber-1", "https://example.com/article1");
      trackingService.recordClick("email-1", "subscriber-1", "https://example.com/article2");

      const report = trackingService.generateEngagementReport(["email-1"]);
      expect(report.topLinks.length).toBeGreaterThan(0);
      expect(report.topLinks[0].url).toBe("https://example.com/article1");
    });
  });
});

describe("Segmentation Service", () => {
  let segmentationService: SegmentationService;

  beforeEach(() => {
    segmentationService = getSegmentationService();
    segmentationService.clearSegments();
  });

  describe("Criação de Segmentos", () => {
    it("deve criar novo segmento", () => {
      const segment = segmentationService.createSegment(
        "Teste",
        "Segmento de teste",
        { minEngagementScore: 80 }
      );
      expect(segment.name).toBe("Teste");
      expect(segment.id).toBeDefined();
    });

    it("deve criar segmentos padrão", () => {
      segmentationService.createDefaultSegments();
      const segments = segmentationService.listSegments();
      expect(segments.length).toBeGreaterThan(0);
    });
  });

  describe("Filtro de Inscritos", () => {
    beforeEach(() => {
      segmentationService.loadSubscribers([
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          interest: "consultas",
          status: "active",
          createdAt: new Date(),
          openRate: 50,
          clickRate: 20,
          engagementScore: 85,
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          interest: "informacoes",
          status: "active",
          createdAt: new Date(),
          openRate: 30,
          clickRate: 10,
          engagementScore: 45,
        },
      ]);
    });

    it("deve filtrar por interesse", () => {
      const filtered = segmentationService.filterSubscribers({ interest: "consultas" });
      expect(filtered.length).toBe(1);
      expect(filtered[0].interest).toBe("consultas");
    });

    it("deve filtrar por score de engajamento", () => {
      const filtered = segmentationService.filterSubscribers({ minEngagementScore: 80 });
      expect(filtered.length).toBe(1);
      expect(filtered[0].engagementScore).toBeGreaterThanOrEqual(80);
    });

    it("deve filtrar por status", () => {
      const filtered = segmentationService.filterSubscribers({ status: "active" });
      expect(filtered.length).toBe(2);
    });

    it("deve filtrar por múltiplos critérios", () => {
      const filtered = segmentationService.filterSubscribers({
        interest: "consultas",
        minEngagementScore: 80,
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].interest).toBe("consultas");
      expect(filtered[0].engagementScore).toBeGreaterThanOrEqual(80);
    });
  });

  describe("Gerenciamento de Segmentos", () => {
    it("deve listar segmentos", () => {
      segmentationService.createSegment("Seg1", "Descrição 1", {});
      segmentationService.createSegment("Seg2", "Descrição 2", {});
      const segments = segmentationService.listSegments();
      expect(segments.length).toBe(2);
    });

    it("deve atualizar segmento", () => {
      const segment = segmentationService.createSegment("Original", "Descrição", {});
      const updated = segmentationService.updateSegment(segment.id, { name: "Atualizado" });
      expect(updated?.name).toBe("Atualizado");
    });

    it("deve deletar segmento", () => {
      const segment = segmentationService.createSegment("Para Deletar", "Descrição", {});
      const deleted = segmentationService.deleteSegment(segment.id);
      expect(deleted).toBe(true);
      const segments = segmentationService.listSegments();
      expect(segments.length).toBe(0);
    });
  });

  describe("Análise de Segmentos", () => {
    beforeEach(() => {
      segmentationService.loadSubscribers([
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          interest: "consultas",
          status: "active",
          createdAt: new Date(),
          openRate: 60,
          clickRate: 30,
          engagementScore: 90,
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          interest: "informacoes",
          status: "active",
          createdAt: new Date(),
          openRate: 40,
          clickRate: 15,
          engagementScore: 50,
        },
      ]);
    });

    it("deve analisar segmentos", () => {
      segmentationService.createSegment("Altamente Engajados", "Score > 80", {
        minEngagementScore: 80,
      });
      const analysis = segmentationService.analyzeSegments();
      expect(analysis.totalSegments).toBe(1);
      expect(analysis.totalSubscribers).toBe(2);
    });

    it("deve gerar recomendações de segmentação", () => {
      const recommendations = segmentationService.generateSegmentationRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("deve exportar segmento para newsletter", () => {
      const segment = segmentationService.createSegment("Teste", "Descrição", {});
      const exported = segmentationService.exportSegmentForNewsletter(segment.id);
      expect(exported.segmentId).toBe(segment.id);
      expect(exported.subscribers).toBeDefined();
    });
  });

  describe("Recomendações", () => {
    it("deve gerar recomendações", () => {
      segmentationService.loadSubscribers([
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          interest: "consultas",
          status: "active",
          createdAt: new Date(),
          openRate: 20,
          clickRate: 5,
          engagementScore: 25,
        },
      ]);

      const recommendations = segmentationService.generateSegmentationRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty("type");
      expect(recommendations[0]).toHaveProperty("message");
      expect(recommendations[0]).toHaveProperty("action");
    });
  });
});
