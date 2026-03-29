import { describe, it, expect, beforeEach } from "vitest";
import {
  analyzeComment,
  generateAutoResponse,
  processBatchComments,
  generateAutomationReport,
  validateConfig,
  defaultConfig,
  type Comment,
  type AutoResponse,
} from "./commentAutomationSystem";
import {
  syncContentAcrossPlatforms,
  fetchCrossPlatformMetrics,
  generateCrossPlatformReport,
  validatePlatformConfigs,
  type CrossPlatformPost,
  type PlatformConfig,
} from "./multiPlatformIntegration";

describe("Comment Automation System", () => {
  let testComment: Comment;

  beforeEach(() => {
    testComment = {
      id: "comment-123",
      username: "usuario_teste",
      text: "Adorei o vídeo! Pode fazer mais sobre ansiedade?",
      timestamp: new Date(),
      postId: "post-456",
    };
  });

  it("deve analisar comentário corretamente", async () => {
    const analysis = await analyzeComment(testComment);
    expect(analysis).toBeDefined();
    expect(["greeting", "question", "complaint", "interest", "other"]).toContain(
      analysis.type
    );
    expect(["positive", "neutral", "negative"]).toContain(analysis.sentiment);
  });

  it("deve gerar resposta automática", async () => {
    const analysis = {
      type: "interest" as const,
      sentiment: "positive" as const,
      hasInterest: true,
      shouldRespond: true,
      confidence: 0.95,
    };

    const response = await generateAutoResponse(testComment, analysis);
    expect(response).toBeTruthy();
    expect(response.length).toBeGreaterThan(0);
    expect(response.length).toBeLessThanOrEqual(300);
  });

  it("deve processar lote de comentários", async () => {
    const comments: Comment[] = [
      testComment,
      {
        id: "comment-124",
        username: "usuario_2",
        text: "Qual é o seu CRP?",
        timestamp: new Date(),
        postId: "post-456",
      },
    ];

    const responses = await processBatchComments(comments);
    expect(Array.isArray(responses)).toBe(true);
    expect(responses.length).toBeGreaterThanOrEqual(0);
  });

  it("deve gerar relatório de automação", async () => {
    const responses: AutoResponse[] = [
      {
        commentId: "c1",
        response: "Obrigada!",
        type: "greeting",
        confidence: 0.9,
        sent: true,
      },
      {
        commentId: "c2",
        response: "Ótima pergunta!",
        type: "question",
        confidence: 0.85,
        sent: false,
      },
    ];

    const report = generateAutomationReport(responses);
    expect(report).toContain("RELATÓRIO");
    expect(report).toContain("Total de Respostas: 2");
    expect(report).toContain("Confiança Média");
  });

  it("deve validar configuração de automação", () => {
    expect(validateConfig(defaultConfig)).toBe(true);

    const invalidConfig = { ...defaultConfig, minConfidence: 1.5 };
    expect(validateConfig(invalidConfig)).toBe(false);
  });
});

describe("Multi-Platform Integration", () => {
  let testPost: CrossPlatformPost;
  let testConfigs: PlatformConfig[];

  beforeEach(() => {
    testPost = {
      id: "post-123",
      title: "Dicas de Psicologia",
      description: "5 dicas para melhorar sua saúde mental",
      content: "Conteúdo completo do post...",
      platforms: ["instagram", "youtube", "tiktok"],
      scheduledTime: new Date(),
      status: "draft",
    };

    testConfigs = [
      {
        platform: "instagram",
        accessToken: "token-ig",
        accountId: "account-ig",
        enabled: true,
      },
      {
        platform: "youtube",
        accessToken: "token-yt",
        accountId: "account-yt",
        enabled: true,
      },
      {
        platform: "tiktok",
        accessToken: "token-tt",
        accountId: "account-tt",
        enabled: false,
      },
    ];
  });

  it("deve sincronizar conteúdo entre plataformas", async () => {
    const results = await syncContentAcrossPlatforms(testPost, testConfigs);
    expect(results).toBeDefined();
    expect(Object.keys(results)).toContain("instagram");
    expect(Object.keys(results)).toContain("youtube");
  });

  it("deve buscar métricas de todas as plataformas", async () => {
    const metrics = await fetchCrossPlatformMetrics(testConfigs);
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThan(0);

    for (const metric of metrics) {
      expect(metric.followers).toBeGreaterThanOrEqual(0);
      expect(metric.engagement).toBeGreaterThanOrEqual(0);
      expect(metric.reach).toBeGreaterThanOrEqual(0);
      expect(metric.impressions).toBeGreaterThanOrEqual(0);
    }
  });

  it("deve gerar relatório multi-plataforma", async () => {
    const metrics = await fetchCrossPlatformMetrics(testConfigs);
    const report = generateCrossPlatformReport(metrics);

    expect(report).toContain("RELATÓRIO");
    expect(report).toContain("Total de Seguidores");
    expect(report).toContain("Engajamento Médio");
  });

  it("deve validar configurações de plataformas", () => {
    const errors = validatePlatformConfigs(testConfigs);
    expect(Array.isArray(errors)).toBe(true);

    const invalidConfigs: PlatformConfig[] = [
      {
        platform: "instagram",
        accessToken: "",
        accountId: "",
        enabled: true,
      },
    ];

    const invalidErrors = validatePlatformConfigs(invalidConfigs);
    expect(invalidErrors.length).toBeGreaterThan(0);
  });

  it("deve detectar plataformas desabilitadas", async () => {
    const disabledConfigs: PlatformConfig[] = [
      { ...testConfigs[0], enabled: false },
      { ...testConfigs[1], enabled: false },
    ];

    const metrics = await fetchCrossPlatformMetrics(disabledConfigs);
    expect(metrics.length).toBe(0);
  });
});

describe("Integration Tests", () => {
  it("deve processar fluxo completo de comentário até resposta", async () => {
    const comment: Comment = {
      id: "test-comment",
      username: "test_user",
      text: "Adorei! Pode fazer mais conteúdo sobre isso?",
      timestamp: new Date(),
      postId: "test-post",
    };

    const analysis = await analyzeComment(comment);
    expect(analysis.shouldRespond).toBeDefined();

    if (analysis.shouldRespond) {
      const response = await generateAutoResponse(comment, analysis);
      expect(response).toBeTruthy();
    }
  });

  it("deve sincronizar post e coletar métricas", async () => {
    const post: CrossPlatformPost = {
      id: "sync-test",
      title: "Test Post",
      description: "Test Description",
      content: "Test Content",
      platforms: ["instagram", "youtube"],
      scheduledTime: new Date(),
      status: "draft",
    };

    const configs: PlatformConfig[] = [
      {
        platform: "instagram",
        accessToken: "test-token",
        accountId: "test-account",
        enabled: true,
      },
      {
        platform: "youtube",
        accessToken: "test-token",
        accountId: "test-account",
        enabled: true,
      },
    ];

    const syncResults = await syncContentAcrossPlatforms(post, configs);
    expect(syncResults).toBeDefined();

    const metrics = await fetchCrossPlatformMetrics(configs);
    expect(metrics.length).toBeGreaterThan(0);
  });
});
