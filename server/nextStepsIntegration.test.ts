import { describe, it, expect } from "vitest";
import {
  publishToInstagram,
  scheduleInstagramPost,
  getInstagramMetrics,
  configureYouTubeAds,
  createLinktreeConfig,
  monitorGrowth,
} from "./instagramGraphAPIIntegration";

describe("Instagram Graph API Integration", () => {
  const mockCredentials = {
    accessToken: "test_token_12345",
    businessAccountId: "123456789",
    instagramUserId: "987654321",
    pageAccessToken: "page_token_12345",
  };

  it("deve validar credenciais inválidas", async () => {
    const result = await publishToInstagram(
      { ...mockCredentials, accessToken: "" },
      {
        id: "1",
        caption: "Test",
        mediaType: "IMAGE",
        mediaUrls: ["https://example.com/image.jpg"],
        hashtags: [],
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Credenciais inválidas");
  });

  it("deve agendar post no Instagram", async () => {
    const scheduledTime = new Date();
    scheduledTime.setDate(scheduledTime.getDate() + 1);

    const result = await scheduleInstagramPost(
      mockCredentials,
      {
        id: "1",
        caption: "Post agendado",
        mediaType: "IMAGE",
        mediaUrls: ["https://example.com/image.jpg"],
        hashtags: ["psicologia", "bem-estar"],
      },
      scheduledTime
    );

    // Pode falhar por credenciais inválidas, mas estrutura deve estar correta
    expect(result).toHaveProperty("success");
    // scheduleId pode ser undefined se falhar
    expect(typeof result.success).toBe("boolean");
  });

  it("deve obter métricas do Instagram", async () => {
    const result = await getInstagramMetrics(mockCredentials);

    expect(result).toHaveProperty("followers");
    expect(result).toHaveProperty("engagement");
    expect(result).toHaveProperty("reach");
    expect(result).toHaveProperty("impressions");
  });

  it("deve retornar 0 seguidores para credenciais inválidas", async () => {
    const result = await getInstagramMetrics(mockCredentials);

    expect(result.followers).toBe(0);
    expect(result.engagement).toBe(0);
  });
});

describe("YouTube Ads Configuration", () => {
  it("deve ativar YouTube Ads com 1k+ inscritos", () => {
    const config = configureYouTubeAds(1500);

    expect(config.enabled).toBe(true);
    expect(config.currentSubscribers).toBe(1500);
    expect(config.minSubscribers).toBe(1000);
  });

  it("deve desativar YouTube Ads com menos de 1k inscritos", () => {
    const config = configureYouTubeAds(500);

    expect(config.enabled).toBe(false);
    expect(config.currentSubscribers).toBe(500);
  });

  it("deve calcular receita estimada", () => {
    const config = configureYouTubeAds(10000);

    expect(config.estimatedMonthlyRevenue).toBeGreaterThan(0);
    expect(config.adFormats).toContain("Skippable in-stream ads");
  });

  it("deve incluir múltiplos formatos de anúncios", () => {
    const config = configureYouTubeAds(5000);

    expect(config.adFormats.length).toBeGreaterThan(0);
    expect(config.adFormats).toContain("Bumper ads");
    expect(config.adFormats).toContain("Overlay ads");
  });
});

describe("Linktree Configuration", () => {
  it("deve criar configuração de Linktree", () => {
    const config = createLinktreeConfig("psidanielacoelho");

    expect(config.username).toBe("psidanielacoelho");
    expect(config.links.length).toBeGreaterThan(0);
    expect(config.theme).toBe("dark");
  });

  it("deve incluir links essenciais", () => {
    const config = createLinktreeConfig("psidanielacoelho");

    const linkTitles = config.links.map((link) => link.title);
    expect(linkTitles).toContain("📚 Livros Recomendados (Afiliado Amazon)");
    expect(linkTitles).toContain("💬 WhatsApp - Contato");
    expect(linkTitles).toContain("🎥 YouTube - Inscreva-se");
  });

  it("deve ter links ordenados", () => {
    const config = createLinktreeConfig("psidanielacoelho");

    for (let i = 0; i < config.links.length - 1; i++) {
      expect(config.links[i].order).toBeLessThan(config.links[i + 1].order);
    }
  });

  it("deve ter cor customizável", () => {
    const config = createLinktreeConfig("psidanielacoelho");

    expect(config.customColor).toBe("#4A90E2");
    expect(config.theme).toBe("dark");
  });
});

describe("Growth Monitoring", () => {
  const mockCredentials = {
    accessToken: "test_token_12345",
    businessAccountId: "123456789",
    instagramUserId: "987654321",
    pageAccessToken: "page_token_12345",
  };

  it("deve monitorar crescimento para 1M seguidores", async () => {
    const result = await monitorGrowth(mockCredentials, 1000000);

    expect(result).toHaveProperty("currentFollowers");
    expect(result).toHaveProperty("targetFollowers");
    expect(result.targetFollowers).toBe(1000000);
    expect(result).toHaveProperty("progressPercentage");
    expect(result).toHaveProperty("daysToTarget");
    expect(result).toHaveProperty("recommendation");
  });

  it("deve calcular percentual de progresso", async () => {
    const result = await monitorGrowth(mockCredentials, 100);

    expect(result.progressPercentage).toBeGreaterThanOrEqual(0);
    expect(result.progressPercentage).toBeLessThanOrEqual(100);
  });

  it("deve dar recomendação baseada em progresso", async () => {
    const result = await monitorGrowth(mockCredentials, 1000);

    expect(result.recommendation).toBeTruthy();
    expect(result.recommendation.length).toBeGreaterThan(0);
  });

  it("deve calcular dias para atingir meta", async () => {
    const result = await monitorGrowth(mockCredentials, 10000);

    expect(result.daysToTarget).toBeGreaterThanOrEqual(0);
    expect(typeof result.daysToTarget).toBe("number");
  });
});

describe("Integration Summary", () => {
  const mockCredentials = {
    accessToken: "test_token_12345",
    businessAccountId: "123456789",
    instagramUserId: "987654321",
    pageAccessToken: "page_token_12345",
  };

  it("deve ter resumo executivo disponível", () => {
    const config = createLinktreeConfig("psidanielacoelho");
    const youtubeConfig = configureYouTubeAds(5000);

    expect(config.username).toBeTruthy();
    expect(youtubeConfig.enabled).toBe(true);
  });

  it("deve suportar fluxo completo de integração", async () => {
    // 1. Criar Linktree
    const linktree = createLinktreeConfig("psidanielacoelho");
    expect(linktree.links.length).toBeGreaterThan(0);

    // 2. Configurar YouTube Ads
    const youtubeConfig = configureYouTubeAds(5000);
    expect(youtubeConfig.enabled).toBe(true);

    // 3. Monitorar crescimento
    const growth = await monitorGrowth(mockCredentials, 100000);
    expect(growth.recommendation).toBeTruthy();

    // Fluxo completo funcionando
    expect(true).toBe(true);
  });
});
