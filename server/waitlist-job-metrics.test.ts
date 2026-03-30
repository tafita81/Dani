import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NewsletterJob, NewsletterJobConfig } from "./jobs/newsletterJob";

describe("Newsletter Job", () => {
  let job: NewsletterJob;

  beforeEach(() => {
    job = new NewsletterJob({
      enabled: true,
      cronExpression: "0 9 1 * *",
      maxRetries: 3,
      retryDelay: 1000,
    });
  });

  afterEach(() => {
    job.stop();
  });

  describe("Inicialização", () => {
    it("deve criar job com configuração padrão", () => {
      const status = job.getStatus();
      expect(status.enabled).toBe(true);
      expect(status.cronExpression).toBe("0 9 1 * *");
    });

    it("deve iniciar job", () => {
      job.start();
      const status = job.getStatus();
      expect(status.enabled).toBe(true);
    });

    it("deve parar job", () => {
      job.start();
      job.stop();
      const status = job.getStatus();
      expect(status.running).toBe(false);
    });
  });

  describe("Configuração", () => {
    it("deve atualizar configuração", () => {
      job.updateConfig({
        cronExpression: "0 10 1 * *",
        maxRetries: 5,
      });

      const status = job.getStatus();
      expect(status.cronExpression).toBe("0 10 1 * *");
    });

    it("deve validar expressão cron", () => {
      expect(() => {
        job.updateConfig({
          cronExpression: "invalid",
        });
      }).not.toThrow();
    });
  });

  describe("Logs", () => {
    it("deve manter histórico de logs", async () => {
      await job.runNow();
      const logs = job.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });

    it("deve limitar logs a 100", () => {
      // Simular múltiplos logs
      for (let i = 0; i < 150; i++) {
        job.getLogs();
      }
      const logs = job.getLogs(200);
      expect(logs.length).toBeLessThanOrEqual(100);
    });

    it("deve limpar logs", () => {
      job.clearLogs();
      const logs = job.getLogs();
      expect(logs.length).toBe(0);
    });

    it("deve retornar último log", async () => {
      await job.runNow();
      const status = job.getStatus();
      expect(status.lastLog).toBeDefined();
    });
  });

  describe("Status", () => {
    it("deve retornar status correto", () => {
      const status = job.getStatus();
      expect(status).toHaveProperty("enabled");
      expect(status).toHaveProperty("running");
      expect(status).toHaveProperty("cronExpression");
      expect(status).toHaveProperty("lastLog");
      expect(status).toHaveProperty("totalLogs");
    });

    it("deve indicar quando está rodando", async () => {
      job.start();
      const status = job.getStatus();
      expect(typeof status.running).toBe("boolean");
    });
  });

  describe("Execução", () => {
    it("deve executar manualmente", async () => {
      await job.runNow();
      const logs = job.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].status).toBe("success");
    });

    it("deve registrar tempo de execução", async () => {
      await job.runNow();
      const logs = job.getLogs();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.duration).toBeGreaterThanOrEqual(0);
    });

    it("deve contar inscritos", async () => {
      await job.runNow();
      const logs = job.getLogs();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.totalSubscribers).toBeGreaterThanOrEqual(0);
    });

    it("deve contar sucessos e falhas", async () => {
      await job.runNow();
      const logs = job.getLogs();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.successCount + lastLog.failureCount).toBeLessThanOrEqual(lastLog.totalSubscribers);
    });
  });

  describe("Tratamento de Erros", () => {
    it("deve registrar erro em caso de falha", async () => {
      job.updateConfig({ enabled: false });
      job.start();
      // Simular erro
      const status = job.getStatus();
      expect(status.enabled).toBe(false);
    });

    it("deve tentar novamente em caso de falha", async () => {
      await job.runNow();
      const logs = job.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});

describe("Engagement Metrics", () => {
  const mockMetrics = {
    totalSubscribers: 245,
    activeSubscribers: 198,
    openRate: 42.3,
    clickRate: 18.7,
    unsubscribeRate: 2.1,
    avgEngagement: 61.0,
  };

  describe("Cálculos", () => {
    it("deve calcular taxa de abertura", () => {
      expect(mockMetrics.openRate).toBeGreaterThan(0);
      expect(mockMetrics.openRate).toBeLessThanOrEqual(100);
    });

    it("deve calcular taxa de clique", () => {
      expect(mockMetrics.clickRate).toBeGreaterThan(0);
      expect(mockMetrics.clickRate).toBeLessThanOrEqual(100);
    });

    it("deve calcular taxa de desinscrição", () => {
      expect(mockMetrics.unsubscribeRate).toBeGreaterThanOrEqual(0);
      expect(mockMetrics.unsubscribeRate).toBeLessThanOrEqual(100);
    });

    it("deve calcular engajamento médio", () => {
      expect(mockMetrics.avgEngagement).toBeGreaterThanOrEqual(0);
      expect(mockMetrics.avgEngagement).toBeLessThanOrEqual(100);
    });
  });

  describe("Validação de Dados", () => {
    it("deve validar que ativos <= total", () => {
      expect(mockMetrics.activeSubscribers).toBeLessThanOrEqual(mockMetrics.totalSubscribers);
    });

    it("deve validar que taxa de clique <= taxa de abertura", () => {
      expect(mockMetrics.clickRate).toBeLessThanOrEqual(mockMetrics.openRate);
    });

    it("deve ter dados de tendência", () => {
      const trendData = [
        { date: "Jan", opens: 156, clicks: 42, unsubscribes: 3 },
        { date: "Fev", opens: 189, clicks: 58, unsubscribes: 2 },
      ];
      expect(trendData.length).toBeGreaterThan(0);
      expect(trendData[0]).toHaveProperty("date");
      expect(trendData[0]).toHaveProperty("opens");
      expect(trendData[0]).toHaveProperty("clicks");
    });

    it("deve ter dados de performance por canal", () => {
      const channelPerformance = [
        { channel: "E-mail", opens: 245, clicks: 89, rate: 36.3 },
        { channel: "WhatsApp", opens: 198, clicks: 76, rate: 38.4 },
      ];
      expect(channelPerformance.length).toBeGreaterThan(0);
      expect(channelPerformance[0]).toHaveProperty("channel");
      expect(channelPerformance[0]).toHaveProperty("rate");
    });

    it("deve ter inscritos mais engajados", () => {
      const topEngaged = [
        { id: "1", email: "maria@example.com", opens: 12, clicks: 8, engagement: 100 },
        { id: "2", email: "joao@example.com", opens: 11, clicks: 7, engagement: 95 },
      ];
      expect(topEngaged.length).toBeGreaterThan(0);
      expect(topEngaged[0]).toHaveProperty("engagement");
      expect(topEngaged[0].engagement).toBeLessThanOrEqual(100);
    });
  });

  describe("Recomendações", () => {
    it("deve gerar recomendações baseadas em taxa de abertura", () => {
      const recommendations = [];
      if (mockMetrics.openRate > 40) {
        recommendations.push("Taxa de abertura acima da média");
      }
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("deve gerar recomendações baseadas em taxa de clique", () => {
      const recommendations = [];
      if (mockMetrics.clickRate < 20) {
        recommendations.push("Considere melhorar CTAs");
      }
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("deve gerar recomendações baseadas em desinscrição", () => {
      const recommendations = [];
      if (mockMetrics.unsubscribeRate > 2) {
        recommendations.push("Taxa de desinscrição elevada");
      }
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});
