import { describe, it, expect } from "vitest";
import {
  createServiceWithPrice,
  updateServicePrice,
  increasePriceByPercentage,
  decreasePriceByPercentage,
  applyPriceMultiplier,
  bulkUpdatePrices,
  generatePriceAnalytics,
  recommendOptimalPrice,
  validatePrice,
  createTemporaryPriceAdjustment,
} from "./dynamicPricingManagement";

describe("Sistema de Gestão de Preços Dinâmicos", () => {
  describe("Criação de Serviços", () => {
    it("deve criar serviço com preço inicial", async () => {
      const service = await createServiceWithPrice(
        "online",
        "Consulta Online Premium",
        "Sessão de 60 minutos",
        600,
        60
      );

      expect(service).toBeDefined();
      expect(service?.serviceName).toBe("Consulta Online Premium");
      expect(service?.currentPrice).toBe(600);
      expect(service?.originalPrice).toBe(600);
      expect(service?.status).toBe("active");
    });

    it("deve criar múltiplos serviços", async () => {
      const services = await Promise.all([
        createServiceWithPrice("online", "Consulta Online", "60 min", 600, 60),
        createServiceWithPrice("presencial", "Sessão Presencial", "90 min", 1000, 90),
        createServiceWithPrice("programa", "Programa 90 Dias", "12 sessões", 12000),
      ]);

      expect(services).toHaveLength(3);
      expect(services.every((s) => s !== null)).toBe(true);
    });
  });

  describe("Alteração de Preços", () => {
    it("deve atualizar preço manualmente", async () => {
      let service = await createServiceWithPrice("online", "Teste", "Descrição", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        const result = await updateServicePrice(service, 600, "Aumento de demanda", "admin");
        expect(result).toBeDefined();
        expect(result?.service.currentPrice).toBe(600);
        expect(result?.history.percentageChange).toBe(20);
      }
    });

    it("deve aumentar preço por percentual", async () => {
      let service = await createServiceWithPrice("online", "Teste", "Descrição", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        const result = await increasePriceByPercentage(service, 20, "Aumento premium", "admin");
        expect(result).toBeDefined();
        expect(result?.service.currentPrice).toBe(600);
        expect(result?.history.percentageChange).toBe(20);
      }
    });

    it("deve diminuir preço por percentual", async () => {
      let service = await createServiceWithPrice("online", "Teste", "Descrição", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        const result = await decreasePriceByPercentage(service, 10, "Promoção", "admin");
        expect(result).toBeDefined();
        expect(result?.service.currentPrice).toBe(450);
        expect(result?.history.percentageChange).toBe(-10);
      }
    });

    it("deve aplicar multiplicador de preço", async () => {
      let service = await createServiceWithPrice("online", "Teste", "Descrição", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        const result = await applyPriceMultiplier(service, 2, "Posicionamento premium", "admin");
        expect(result).toBeDefined();
        expect(result?.service.currentPrice).toBe(1000);
      }
    });
  });

  describe("Atualização em Lote", () => {
    it("deve atualizar múltiplos preços em lote", async () => {
      const services = await Promise.all([
        createServiceWithPrice("online", "Consulta", "60 min", 500, 60),
        createServiceWithPrice("presencial", "Sessão", "90 min", 800, 90),
        createServiceWithPrice("programa", "Programa", "12 sessões", 10000),
      ]);

      const validServices = services.filter((s) => s !== null) as any[];

      if (validServices.length === 3) {
        const result = await bulkUpdatePrices(validServices, "percentage", 20, "Aumento pós-CRP", "admin");

        expect(result).toBeDefined();
        expect(result?.totalServicesUpdated).toBe(3);
        expect(result?.updates[0].newPrice).toBe(600); // 500 * 1.2
        expect(result?.updates[1].newPrice).toBe(960); // 800 * 1.2
        expect(result?.updates[2].newPrice).toBe(12000); // 10000 * 1.2
      }
    });
  });

  describe("Análise de Preços", () => {
    it("deve gerar análise de preço", async () => {
      let service = await createServiceWithPrice("online", "Teste", "Descrição", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        const priceHistory = [
          {
            id: "1",
            serviceId: service.id,
            previousPrice: 400,
            newPrice: 500,
            changeReason: "Aumento inicial",
            changedBy: "admin",
            changeDate: new Date(),
            percentageChange: 25,
          },
        ];

        const analytics = await generatePriceAnalytics(service, priceHistory, 50);
        expect(analytics).toBeDefined();
        expect(analytics?.currentPrice).toBe(500);
        expect(analytics?.priceChanges).toBe(1);
        expect(analytics?.clientsAtCurrentPrice).toBe(50);
        expect(analytics?.projectedMonthlyRevenue).toBe(25000);
      }
    });

    it("deve recomendar preço ótimo", async () => {
      let service = await createServiceWithPrice("online", "Teste", "Descrição", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        const recommendation = await recommendOptimalPrice(service, 0.3, 1.2, "high");
        expect(recommendation).toBeDefined();
        expect(recommendation.recommendedPrice).toBeGreaterThan(service.currentPrice);
        expect(recommendation.projectedImpact.revenueIncrease).toBeGreaterThan(0);
      }
    });
  });

  describe("Validação de Preços", () => {
    it("deve validar preço dentro dos limites", async () => {
      const validation = await validatePrice(600, 500, 100, 10000, 50);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("deve rejeitar preço abaixo do mínimo", async () => {
      const validation = await validatePrice(50, 500, 100, 10000, 50);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("deve rejeitar preço acima do máximo", async () => {
      const validation = await validatePrice(15000, 500, 100, 10000, 50);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("deve rejeitar mudança de preço muito grande", async () => {
      const validation = await validatePrice(1500, 500, 100, 10000, 50);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Ajustes Temporários", () => {
    it("deve criar ajuste temporário de preço", async () => {
      const adjustment = await createTemporaryPriceAdjustment(
        "service_1",
        "percentage",
        20,
        new Date(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        "Promoção de lançamento"
      );

      expect(adjustment).toBeDefined();
      expect(adjustment?.adjustmentType).toBe("percentage");
      expect(adjustment?.adjustmentValue).toBe(20);
      expect(adjustment?.status).toBe("pending");
    });
  });

  describe("Cenários de Posicionamento Premium Pós-CRP", () => {
    it("deve simular transição para preços premium", async () => {
      // Preços antes do CRP
      const consultaOnline = await createServiceWithPrice("online", "Consulta Online", "60 min", 150, 60);
      const sessaoPresencial = await createServiceWithPrice(
        "presencial",
        "Sessão Presencial",
        "60 min",
        200,
        60
      );

      expect(consultaOnline).toBeDefined();
      expect(sessaoPresencial).toBeDefined();

      if (consultaOnline && sessaoPresencial) {
        // Aplicar multiplicador 4x (posicionamento premium)
        const consultaResult = await applyPriceMultiplier(
          consultaOnline,
          4,
          "Posicionamento premium pós-CRP",
          "admin"
        );
        const sessaoResult = await applyPriceMultiplier(
          sessaoPresencial,
          5,
          "Posicionamento premium pós-CRP",
          "admin"
        );

        expect(consultaResult?.service.currentPrice).toBe(600); // 150 * 4
        expect(sessaoResult?.service.currentPrice).toBe(1000); // 200 * 5
      }
    });

    it("deve calcular impacto financeiro de aumento de preço", async () => {
      let service = await createServiceWithPrice("online", "Consulta", "60 min", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        const priceHistory = [
          {
            id: "1",
            serviceId: service.id,
            previousPrice: 150,
            newPrice: 500,
            changeReason: "Aumento pós-CRP",
            changedBy: "admin",
            changeDate: new Date(),
            percentageChange: 233,
          },
        ];

        const analytics = await generatePriceAnalytics(service, priceHistory, 100);
        expect(analytics).toBeDefined();
        expect(analytics?.projectedMonthlyRevenue).toBe(50000); // 500 * 100
      }
    });
  });

  describe("Integração Completa", () => {
    it("deve suportar fluxo completo de gestão de preços", async () => {
      // 1. Criar serviço
      let service = await createServiceWithPrice("online", "Consulta Premium", "60 min", 500, 60);
      expect(service).toBeDefined();

      if (service) {
        // 2. Aumentar preço
        const result1 = await increasePriceByPercentage(service, 20, "Aumento 1", "admin");
        expect(result1).toBeDefined();
        service = result1!.service;

        // 3. Aplicar multiplicador
        const result2 = await applyPriceMultiplier(service, 1.25, "Aumento 2", "admin");
        expect(result2).toBeDefined();
        service = result2!.service;

        // 4. Validar preço final
        const validation = await validatePrice(service.currentPrice, 500, 100, 10000, 100);
        expect(validation.valid).toBe(true);

        // 5. Gerar análise
        const priceHistory = [
          {
            id: "1",
            serviceId: service.id,
            previousPrice: 500,
            newPrice: 600,
            changeReason: "Aumento 1",
            changedBy: "admin",
            changeDate: new Date(),
            percentageChange: 20,
          },
          {
            id: "2",
            serviceId: service.id,
            previousPrice: 600,
            newPrice: 750,
            changeReason: "Aumento 2",
            changedBy: "admin",
            changeDate: new Date(),
            percentageChange: 25,
          },
        ];

        const analytics = await generatePriceAnalytics(service, priceHistory, 50);
        expect(analytics).toBeDefined();
        expect(analytics?.currentPrice).toBe(750);
        expect(analytics?.priceChanges).toBe(2);
      }
    });
  });
});
