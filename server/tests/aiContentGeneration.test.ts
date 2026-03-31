import { describe, it, expect } from "vitest";
import {
  generateBannerWithAI,
  generateVideoWithAI,
  generateViralReelWithAI,
  generateCarouselWithAI,
  createDailyContentPlan,
  publishToInstagram,
  publishToYouTube,
  publishToAllPlatforms,
  scheduleAutomaticPublication,
  executeBatchPublication,
  monitorContentPerformance,
  generateContentReport,
} from "./aiContentGenerationEngine";

describe("Sistema de Geração Automática de Conteúdo com IA", () => {
  describe("Geração de Banners", () => {
    it("deve gerar banner com IA", async () => {
      const banner = await generateBannerWithAI("Ansiedade", "modern");

      expect(banner).toBeDefined();
      expect(banner.type).toBe("banner");
      expect(banner.platform).toBe("instagram");
      expect(banner.topic).toBe("Ansiedade");
      expect(banner.contentUrl).toBeDefined();
      expect(banner.estimatedEngagement).toBeGreaterThan(0);
      expect(banner.hashtags.length).toBeGreaterThan(0);
      expect(banner.status).toBe("scheduled");
    });

    it("deve gerar banner com diferentes estilos", async () => {
      const styles = ["modern", "minimalist", "colorful", "professional"] as const;

      for (const style of styles) {
        const banner = await generateBannerWithAI("Teste", style);
        expect(banner.format).toContain(style);
      }
    });
  });

  describe("Geração de Vídeos", () => {
    it("deve gerar vídeo curto (reel)", async () => {
      const video = await generateVideoWithAI("Relacionamentos", "short");

      expect(video).toBeDefined();
      expect(video.type).toBe("reel");
      expect(video.duration).toBe(30);
      expect(video.contentUrl).toBeDefined();
      expect(video.estimatedEngagement).toBeGreaterThan(0);
    });

    it("deve gerar vídeo médio", async () => {
      const video = await generateVideoWithAI("Autoestima", "medium");

      expect(video).toBeDefined();
      expect(video.type).toBe("video");
      expect(video.duration).toBe(60);
    });

    it("deve gerar vídeo longo", async () => {
      const video = await generateVideoWithAI("Mindfulness", "long");

      expect(video).toBeDefined();
      expect(video.type).toBe("video");
      expect(video.duration).toBe(120);
    });
  });

  describe("Geração de Reels Virais", () => {
    it("deve gerar reel viral com hook impactante", async () => {
      const reel = await generateViralReelWithAI("Técnicas de Relaxamento");

      expect(reel).toBeDefined();
      expect(reel.type).toBe("reel");
      expect(reel.duration).toBe(30);
      expect(reel.platform).toBe("instagram");
      expect(reel.caption).toContain("errado");
      expect(reel.estimatedEngagement).toBeGreaterThan(20000);
      expect(reel.hashtags).toContain("#Viral");
    });

    it("deve ter engagement maior que outros formatos", async () => {
      const reel = await generateViralReelWithAI("Teste");
      const banner = await generateBannerWithAI("Teste", "modern");

      expect(reel.estimatedEngagement).toBeGreaterThan(banner.estimatedEngagement);
    });
  });

  describe("Geração de Carrosséis", () => {
    it("deve gerar carrossel com múltiplos slides", async () => {
      const carousel = await generateCarouselWithAI("Sinais de Ansiedade", 5);

      expect(carousel).toBeDefined();
      expect(carousel.type).toBe("carousel");
      expect(carousel.format).toContain("5 Slides");
      expect(carousel.contentUrl).toBeDefined();
      expect(carousel.estimatedEngagement).toBeGreaterThan(0);
    });

    it("deve gerar carrossel com diferentes números de slides", async () => {
      for (let slides = 3; slides <= 10; slides++) {
        const carousel = await generateCarouselWithAI("Teste", slides);
        expect(carousel.format).toContain(slides.toString());
      }
    });
  });

  describe("Plano de Conteúdo Diário", () => {
    it("deve criar plano com múltiplos formatos", async () => {
      const today = new Date();
      const plan = await createDailyContentPlan(today);

      expect(plan).toBeDefined();
      expect(plan.length).toBe(4); // Reel, Carrossel, Vídeo, Banner
      expect(plan.some((c) => c.type === "reel")).toBe(true);
      expect(plan.some((c) => c.type === "carousel")).toBe(true);
      expect(plan.some((c) => c.type === "video")).toBe(true);
      expect(plan.some((c) => c.type === "banner")).toBe(true);
    });

    it("deve ter horários diferentes para cada conteúdo", async () => {
      const today = new Date();
      const plan = await createDailyContentPlan(today);

      const times = plan.map((c) => c.scheduledFor.getHours());
      const uniqueTimes = new Set(times);

      expect(uniqueTimes.size).toBe(plan.length); // Todos em horários diferentes
    });

    it("deve ter conteúdo para ambas as plataformas", async () => {
      const today = new Date();
      const plan = await createDailyContentPlan(today);

      const hasInstagram = plan.some((c) => c.platform === "instagram");
      const hasYouTube = plan.some((c) => c.platform === "youtube");

      expect(hasInstagram).toBe(true);
      expect(hasYouTube).toBe(true);
    });
  });

  describe("Publicação no Instagram", () => {
    it("deve publicar reel no Instagram", async () => {
      const reel = await generateViralReelWithAI("Teste");
      const result = await publishToInstagram(reel);

      expect(result.success).toBe(true);
      expect(result.postId).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.url).toContain("instagram.com");
    });

    it("deve publicar carrossel no Instagram", async () => {
      const carousel = await generateCarouselWithAI("Teste", 5);
      const result = await publishToInstagram(carousel);

      expect(result.success).toBe(true);
      expect(result.postId).toContain("carousel");
    });

    it("deve publicar banner no Instagram", async () => {
      const banner = await generateBannerWithAI("Teste", "modern");
      const result = await publishToInstagram(banner);

      expect(result.success).toBe(true);
      expect(result.postId).toContain("post");
    });
  });

  describe("Publicação no YouTube", () => {
    it("deve publicar vídeo no YouTube", async () => {
      const video = await generateVideoWithAI("Teste", "medium");
      const result = await publishToYouTube(video);

      expect(result.success).toBe(true);
      expect(result.videoId).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.url).toContain("youtube.com");
    });

    it("deve publicar reel no YouTube", async () => {
      const reel = await generateViralReelWithAI("Teste");
      const result = await publishToYouTube(reel);

      expect(result.success).toBe(true);
      expect(result.videoId).toBeDefined();
    });
  });

  describe("Publicação Multi-Plataforma", () => {
    it("deve publicar em ambas as plataformas", async () => {
      const video = await generateVideoWithAI("Teste", "medium");
      video.platform = "both";

      const result = await publishToAllPlatforms(video);

      expect(result.totalSuccess).toBe(true);
      expect(result.instagram).toBeDefined();
      expect(result.youtube).toBeDefined();
      expect(result.instagram?.success).toBe(true);
      expect(result.youtube?.success).toBe(true);
    });

    it("deve publicar apenas no Instagram se configurado", async () => {
      const banner = await generateBannerWithAI("Teste", "modern");
      const result = await publishToAllPlatforms(banner);

      expect(result.instagram).toBeDefined();
      expect(result.youtube).toBeUndefined();
    });
  });

  describe("Agendamento Automático", () => {
    it("deve agendar múltiplos conteúdos", async () => {
      const today = new Date();
      const contents = await createDailyContentPlan(today);

      const schedule = await scheduleAutomaticPublication(contents);

      expect(schedule).toBeDefined();
      expect(schedule.contentIds.length).toBe(contents.length);
      expect(schedule.status).toBe("pending");
      expect(schedule.priority).toBe("high");
    });
  });

  describe("Publicação em Lote", () => {
    it("deve publicar múltiplos conteúdos em lote", async () => {
      const today = new Date();
      const contents = await createDailyContentPlan(today);

      const result = await executeBatchPublication(contents);

      expect(result).toBeDefined();
      expect(result.totalContents).toBe(contents.length);
      expect(result.successfulPublications).toBeGreaterThan(0);
      expect(result.results.length).toBe(contents.length);
    });

    it("deve rastrear sucesso e falhas", async () => {
      const today = new Date();
      const contents = await createDailyContentPlan(today);

      const result = await executeBatchPublication(contents);

      expect(result.successfulPublications + result.failedPublications).toBe(
        result.totalContents
      );
      expect(result.results.every((r) => r.contentId)).toBe(true);
    });
  });

  describe("Monitoramento de Performance", () => {
    it("deve monitorar performance de conteúdo", async () => {
      const reel = await generateViralReelWithAI("Teste");
      const performance = await monitorContentPerformance(reel.id);

      expect(performance).toBeDefined();
      expect(performance.contentId).toBe(reel.id);
      expect(performance.views).toBeGreaterThan(0);
      expect(performance.likes).toBeGreaterThan(0);
      expect(performance.comments).toBeGreaterThan(0);
      expect(performance.engagementRate).toBeGreaterThan(0);
      expect(performance.performanceScore).toBeGreaterThanOrEqual(0);
      expect(performance.performanceScore).toBeLessThanOrEqual(100);
    });

    it("deve calcular engagement rate corretamente", async () => {
      const reel = await generateViralReelWithAI("Teste");
      const performance = await monitorContentPerformance(reel.id);

      const expectedEngagement =
        ((performance.likes + performance.comments + performance.shares) /
          performance.views) *
        100;

      expect(Math.abs(performance.engagementRate - expectedEngagement)).toBeLessThan(
        0.01
      );
    });
  });

  describe("Relatórios", () => {
    it("deve gerar relatório de conteúdo", async () => {
      const today = new Date();
      const report = await generateContentReport(today);

      expect(report).toBeDefined();
      expect(report).toContain("Relatório de Conteúdo");
      expect(report).toContain("Conteúdo Gerado");
      expect(report).toContain("Plataformas de Publicação");
      expect(report).toContain("Horários de Publicação");
      expect(report).toContain("Métricas Esperadas");
    });
  });

  describe("Fluxo Completo Diário", () => {
    it("deve executar fluxo completo: gerar → agendar → publicar → monitorar", async () => {
      // 1. Gerar conteúdo
      const today = new Date();
      const contents = await createDailyContentPlan(today);
      expect(contents.length).toBeGreaterThan(0);

      // 2. Agendar publicação
      const schedule = await scheduleAutomaticPublication(contents);
      expect(schedule.contentIds.length).toBe(contents.length);

      // 3. Publicar em lote
      const publicationResult = await executeBatchPublication(contents);
      expect(publicationResult.successfulPublications).toBeGreaterThan(0);

      // 4. Monitorar performance
      const performance = await monitorContentPerformance(contents[0].id);
      expect(performance.engagementRate).toBeGreaterThan(0);

      // 5. Gerar relatório
      const report = await generateContentReport(today);
      expect(report).toContain("Relatório");

      // Validar fluxo completo
      expect(contents).toBeDefined();
      expect(schedule).toBeDefined();
      expect(publicationResult).toBeDefined();
      expect(performance).toBeDefined();
      expect(report).toBeDefined();
    });
  });

  describe("Automação Contínua", () => {
    it("deve suportar múltiplos dias de automação", async () => {
      const results = [];

      for (let day = 0; day < 3; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        const contents = await createDailyContentPlan(date);
        const publication = await executeBatchPublication(contents);

        results.push(publication);
      }

      expect(results.length).toBe(3);
      expect(results.every((r) => r.totalContents > 0)).toBe(true);
    });
  });
});
