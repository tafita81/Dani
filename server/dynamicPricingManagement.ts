/**
 * Sistema de Gestão de Preços Dinâmicos
 * Alteração manual de valores de consultas e serviços
 */

export interface ServicePrice {
  id: string;
  serviceType: "online" | "presencial" | "programa" | "curso" | "grupo" | "custom";
  serviceName: string;
  description: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  duration?: number; // minutos
  maxClients?: number;
  status: "active" | "inactive" | "archived";
  createdAt: Date;
  lastModifiedAt: Date;
}

export interface PriceHistory {
  id: string;
  serviceId: string;
  previousPrice: number;
  newPrice: number;
  changeReason: string;
  changedBy: string;
  changeDate: Date;
  percentageChange: number;
  notes?: string;
}

export interface PriceAdjustment {
  id: string;
  serviceId: string;
  adjustmentType: "percentage" | "fixed" | "multiplier";
  adjustmentValue: number;
  startDate: Date;
  endDate?: Date;
  reason: string;
  status: "pending" | "active" | "expired";
}

export interface PriceAnalytics {
  serviceId: string;
  serviceName: string;
  currentPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceChanges: number;
  lastChangeDate: Date;
  clientsAtCurrentPrice: number;
  projectedMonthlyRevenue: number;
  priceElasticity: number; // -1 a 0
}

export interface BulkPriceUpdate {
  id: string;
  updateDate: Date;
  updates: Array<{
    serviceId: string;
    oldPrice: number;
    newPrice: number;
  }>;
  totalServicesUpdated: number;
  totalRevenueImpact: number;
}

/**
 * Cria serviço com preço inicial
 */
export async function createServiceWithPrice(
  serviceType: "online" | "presencial" | "programa" | "curso" | "grupo" | "custom",
  serviceName: string,
  description: string,
  price: number,
  duration?: number,
  maxClients?: number
): Promise<ServicePrice | null> {
  try {
    const service: ServicePrice = {
      id: `service_${Date.now()}`,
      serviceType,
      serviceName,
      description,
      currentPrice: price,
      originalPrice: price,
      currency: "BRL",
      duration,
      maxClients,
      status: "active",
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    };

    console.log(`✓ Serviço criado: ${serviceName} - R$ ${price.toLocaleString("pt-BR")}`);
    return service;
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return null;
  }
}

/**
 * Altera preço manualmente
 */
export async function updateServicePrice(
  service: ServicePrice,
  newPrice: number,
  changeReason: string,
  changedBy: string = "admin",
  notes?: string
): Promise<{ service: ServicePrice; history: PriceHistory } | null> {
  try {
    const previousPrice = service.currentPrice;
    const percentageChange = ((newPrice - previousPrice) / previousPrice) * 100;

    // Atualizar serviço
    service.currentPrice = newPrice;
    service.lastModifiedAt = new Date();

    // Criar histórico
    const history: PriceHistory = {
      id: `history_${Date.now()}`,
      serviceId: service.id,
      previousPrice,
      newPrice,
      changeReason,
      changedBy,
      changeDate: new Date(),
      percentageChange,
      notes,
    };

    console.log(
      `✓ Preço atualizado: ${service.serviceName} - R$ ${previousPrice.toLocaleString("pt-BR")} → R$ ${newPrice.toLocaleString("pt-BR")} (${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}%)`
    );

    return { service, history };
  } catch (error) {
    console.error("Erro ao atualizar preço:", error);
    return null;
  }
}

/**
 * Aumenta preço por percentual
 */
export async function increasePriceByPercentage(
  service: ServicePrice,
  percentage: number,
  reason: string,
  changedBy: string = "admin"
): Promise<{ service: ServicePrice; history: PriceHistory } | null> {
  try {
    const newPrice = service.currentPrice * (1 + percentage / 100);
    return await updateServicePrice(service, Math.round(newPrice), reason, changedBy);
  } catch (error) {
    console.error("Erro ao aumentar preço:", error);
    return null;
  }
}

/**
 * Diminui preço por percentual
 */
export async function decreasePriceByPercentage(
  service: ServicePrice,
  percentage: number,
  reason: string,
  changedBy: string = "admin"
): Promise<{ service: ServicePrice; history: PriceHistory } | null> {
  try {
    const newPrice = service.currentPrice * (1 - percentage / 100);
    return await updateServicePrice(service, Math.round(newPrice), reason, changedBy);
  } catch (error) {
    console.error("Erro ao diminuir preço:", error);
    return null;
  }
}

/**
 * Aplica multiplicador de preço
 */
export async function applyPriceMultiplier(
  service: ServicePrice,
  multiplier: number,
  reason: string,
  changedBy: string = "admin"
): Promise<{ service: ServicePrice; history: PriceHistory } | null> {
  try {
    const newPrice = service.currentPrice * multiplier;
    const percentage = (multiplier - 1) * 100;
    return await updateServicePrice(
      service,
      Math.round(newPrice),
      `${reason} (Multiplicador: ${multiplier}x)`,
      changedBy
    );
  } catch (error) {
    console.error("Erro ao aplicar multiplicador:", error);
    return null;
  }
}

/**
 * Cria ajuste de preço temporário
 */
export async function createTemporaryPriceAdjustment(
  serviceId: string,
  adjustmentType: "percentage" | "fixed" | "multiplier",
  adjustmentValue: number,
  startDate: Date,
  endDate: Date,
  reason: string
): Promise<PriceAdjustment | null> {
  try {
    const adjustment: PriceAdjustment = {
      id: `adjustment_${Date.now()}`,
      serviceId,
      adjustmentType,
      adjustmentValue,
      startDate,
      endDate,
      reason,
      status: "pending",
    };

    console.log(`✓ Ajuste temporário criado: ${reason}`);
    return adjustment;
  } catch (error) {
    console.error("Erro ao criar ajuste:", error);
    return null;
  }
}

/**
 * Atualiza múltiplos preços em lote
 */
export async function bulkUpdatePrices(
  services: ServicePrice[],
  adjustmentType: "percentage" | "fixed" | "multiplier",
  adjustmentValue: number,
  reason: string,
  changedBy: string = "admin"
): Promise<BulkPriceUpdate | null> {
  try {
    const updates = [];
    let totalRevenueImpact = 0;

    for (const service of services) {
      const oldPrice = service.currentPrice;
      let newPrice = oldPrice;

      if (adjustmentType === "percentage") {
        newPrice = oldPrice * (1 + adjustmentValue / 100);
      } else if (adjustmentType === "fixed") {
        newPrice = oldPrice + adjustmentValue;
      } else if (adjustmentType === "multiplier") {
        newPrice = oldPrice * adjustmentValue;
      }

      newPrice = Math.round(newPrice);
      const revenueImpact = newPrice - oldPrice;
      totalRevenueImpact += revenueImpact;

      updates.push({
        serviceId: service.id,
        oldPrice,
        newPrice,
      });

      // Atualizar serviço
      service.currentPrice = newPrice;
      service.lastModifiedAt = new Date();
    }

    const bulkUpdate: BulkPriceUpdate = {
      id: `bulk_${Date.now()}`,
      updateDate: new Date(),
      updates,
      totalServicesUpdated: services.length,
      totalRevenueImpact,
    };

    console.log(
      `✓ ${services.length} preços atualizados em lote. Impacto: R$ ${totalRevenueImpact.toLocaleString("pt-BR")}`
    );

    return bulkUpdate;
  } catch (error) {
    console.error("Erro ao atualizar preços em lote:", error);
    return null;
  }
}

/**
 * Gera análise de preço
 */
export async function generatePriceAnalytics(
  service: ServicePrice,
  priceHistory: PriceHistory[],
  clientsAtCurrentPrice: number = 50
): Promise<PriceAnalytics | null> {
  try {
    const prices = [service.originalPrice, ...priceHistory.map((h) => h.newPrice)];
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calcular elasticidade de preço (simplificado)
    const priceChange = ((service.currentPrice - service.originalPrice) / service.originalPrice) * 100;
    const demandChange = -2; // Assumir 2% de queda de demanda por 1% de aumento
    const priceElasticity = demandChange / (priceChange || 1);

    const analytics: PriceAnalytics = {
      serviceId: service.id,
      serviceName: service.serviceName,
      currentPrice: service.currentPrice,
      averagePrice: Math.round(averagePrice),
      minPrice,
      maxPrice,
      priceChanges: priceHistory.length,
      lastChangeDate: priceHistory[priceHistory.length - 1]?.changeDate || service.createdAt,
      clientsAtCurrentPrice,
      projectedMonthlyRevenue: service.currentPrice * clientsAtCurrentPrice,
      priceElasticity,
    };

    console.log(`✓ Análise de preço gerada: ${service.serviceName}`);
    return analytics;
  } catch (error) {
    console.error("Erro ao gerar análise:", error);
    return null;
  }
}

/**
 * Recomenda preço ótimo baseado em dados
 */
export async function recommendOptimalPrice(
  service: ServicePrice,
  targetMargin: number = 0.3, // 30%
  marketComparison: number = 1.2, // 20% acima da média
  demandLevel: "low" | "medium" | "high" = "high"
): Promise<{
  currentPrice: number;
  recommendedPrice: number;
  reasoning: string;
  projectedImpact: {
    revenueIncrease: number;
    clientRetention: number;
    marketPosition: string;
  };
}> {
  try {
    let recommendedPrice = service.currentPrice;
    let reasoning = "";

    // Ajustar baseado no nível de demanda
    if (demandLevel === "high") {
      recommendedPrice = service.currentPrice * 1.25; // Aumentar 25%
      reasoning = "Alta demanda detectada. Recomenda-se aumentar preço.";
    } else if (demandLevel === "medium") {
      recommendedPrice = service.currentPrice * 1.1; // Aumentar 10%
      reasoning = "Demanda média. Pequeno aumento recomendado.";
    } else {
      recommendedPrice = service.currentPrice * 0.95; // Diminuir 5%
      reasoning = "Demanda baixa. Redução de preço pode aumentar volume.";
    }

    // Aplicar comparação de mercado
    recommendedPrice = recommendedPrice * marketComparison;

    const revenueIncrease = ((recommendedPrice - service.currentPrice) / service.currentPrice) * 100;

    return {
      currentPrice: service.currentPrice,
      recommendedPrice: Math.round(recommendedPrice),
      reasoning,
      projectedImpact: {
        revenueIncrease: Math.round(revenueIncrease),
        clientRetention: demandLevel === "high" ? 95 : demandLevel === "medium" ? 85 : 75,
        marketPosition: demandLevel === "high" ? "Premium" : "Mid-Market",
      },
    };
  } catch (error) {
    console.error("Erro ao recomendar preço:", error);
    return {
      currentPrice: service.currentPrice,
      recommendedPrice: service.currentPrice,
      reasoning: "Erro ao gerar recomendação",
      projectedImpact: {
        revenueIncrease: 0,
        clientRetention: 0,
        marketPosition: "Unknown",
      },
    };
  }
}

/**
 * Gera relatório de histórico de preços
 */
export async function generatePriceHistoryReport(
  service: ServicePrice,
  priceHistory: PriceHistory[]
): Promise<string> {
  try {
    let report = `# Histórico de Preços - ${service.serviceName}\n\n`;

    report += `## Resumo\n`;
    report += `- Preço Atual: R$ ${service.currentPrice.toLocaleString("pt-BR")}\n`;
    report += `- Preço Original: R$ ${service.originalPrice.toLocaleString("pt-BR")}\n`;
    report += `- Total de Mudanças: ${priceHistory.length}\n`;
    report += `- Variação Total: ${(((service.currentPrice - service.originalPrice) / service.originalPrice) * 100).toFixed(1)}%\n\n`;

    report += `## Histórico de Mudanças\n`;
    priceHistory.forEach((history, index) => {
      report += `\n### Mudança ${index + 1}\n`;
      report += `- Data: ${history.changeDate.toLocaleDateString("pt-BR")}\n`;
      report += `- De: R$ ${history.previousPrice.toLocaleString("pt-BR")}\n`;
      report += `- Para: R$ ${history.newPrice.toLocaleString("pt-BR")}\n`;
      report += `- Variação: ${history.percentageChange > 0 ? "+" : ""}${history.percentageChange.toFixed(1)}%\n`;
      report += `- Motivo: ${history.changeReason}\n`;
      report += `- Alterado por: ${history.changedBy}\n`;
      if (history.notes) {
        report += `- Notas: ${history.notes}\n`;
      }
    });

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}

/**
 * Valida preço antes de aplicar
 */
export async function validatePrice(
  newPrice: number,
  currentPrice: number,
  minPrice: number = 100,
  maxPrice: number = 10000,
  maxChangePercent: number = 50
): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const errors: string[] = [];

    if (newPrice < minPrice) {
      errors.push(`Preço mínimo permitido: R$ ${minPrice.toLocaleString("pt-BR")}`);
    }

    if (newPrice > maxPrice) {
      errors.push(`Preço máximo permitido: R$ ${maxPrice.toLocaleString("pt-BR")}`);
    }

    const percentageChange = Math.abs(((newPrice - currentPrice) / currentPrice) * 100);
    if (percentageChange > maxChangePercent) {
      errors.push(`Mudança de preço não pode exceder ${maxChangePercent}% de uma vez`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error("Erro ao validar preço:", error);
    return {
      valid: false,
      errors: ["Erro ao validar preço"],
    };
  }
}
