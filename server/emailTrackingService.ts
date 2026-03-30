/**
 * Serviço de Rastreamento de Aberturas e Cliques em Emails
 * Implementa pixel de rastreamento e webhooks para capturar engajamento
 */

interface TrackingPixel {
  id: string;
  emailId: string;
  subscriberId: string;
  url: string;
  timestamp: Date;
}

interface ClickTrack {
  id: string;
  emailId: string;
  subscriberId: string;
  linkUrl: string;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
}

interface EmailTrackingData {
  emailId: string;
  subscriberId: string;
  opened: boolean;
  openedAt?: Date;
  openCount: number;
  clicks: ClickTrack[];
  clickCount: number;
  lastOpenedAt?: Date;
  lastClickedAt?: Date;
}

class EmailTrackingService {
  private trackingData: Map<string, EmailTrackingData> = new Map();

  /**
   * Gerar pixel de rastreamento
   * Retorna URL do pixel que será incluída no email
   */
  generateTrackingPixel(emailId: string, subscriberId: string): string {
    const pixelId = `${emailId}-${subscriberId}`;
    const pixelUrl = `${process.env.VITE_FRONTEND_FORGE_API_URL || "https://api.example.com"}/api/tracking/pixel/${pixelId}`;

    // Inicializar dados de rastreamento
    if (!this.trackingData.has(emailId)) {
      this.trackingData.set(emailId, {
        emailId,
        subscriberId,
        opened: false,
        openCount: 0,
        clicks: [],
        clickCount: 0,
      });
    }

    return pixelUrl;
  }

  /**
   * Gerar links rastreáveis
   * Substitui URLs normais por URLs que rastreiam cliques
   */
  generateTrackableLink(emailId: string, subscriberId: string, originalUrl: string): string {
    const trackingId = `${emailId}-${subscriberId}`;
    const encodedUrl = Buffer.from(originalUrl).toString("base64");
    const trackableUrl = `${process.env.VITE_FRONTEND_FORGE_API_URL || "https://api.example.com"}/api/tracking/click/${trackingId}/${encodedUrl}`;

    return trackableUrl;
  }

  /**
   * Registrar abertura de email
   */
  recordOpen(emailId: string, subscriberId: string, userAgent?: string, ipAddress?: string): void {
    const key = emailId;
    const data = this.trackingData.get(key);

    if (data) {
      data.opened = true;
      data.openedAt = new Date();
      data.openCount++;
      data.lastOpenedAt = new Date();

      console.log(`[Email Tracking] Email ${emailId} aberto por ${subscriberId}`);
      console.log(`  - User Agent: ${userAgent}`);
      console.log(`  - IP: ${ipAddress}`);
      console.log(`  - Total de aberturas: ${data.openCount}`);
    }
  }

  /**
   * Registrar clique em link
   */
  recordClick(
    emailId: string,
    subscriberId: string,
    linkUrl: string,
    userAgent?: string,
    ipAddress?: string
  ): void {
    const key = emailId;
    const data = this.trackingData.get(key);

    if (data) {
      const click: ClickTrack = {
        id: `${emailId}-click-${Date.now()}`,
        emailId,
        subscriberId,
        linkUrl,
        timestamp: new Date(),
        userAgent: userAgent || "unknown",
        ipAddress: ipAddress || "unknown",
      };

      data.clicks.push(click);
      data.clickCount++;
      data.lastClickedAt = new Date();

      console.log(`[Email Tracking] Clique registrado em ${emailId}`);
      console.log(`  - Link: ${linkUrl}`);
      console.log(`  - Total de cliques: ${data.clickCount}`);
    }
  }

  /**
   * Obter dados de rastreamento
   */
  getTrackingData(emailId: string): EmailTrackingData | undefined {
    return this.trackingData.get(emailId);
  }

  /**
   * Obter estatísticas de rastreamento
   */
  getTrackingStats(emailId: string) {
    const data = this.trackingData.get(emailId);

    if (!data) {
      return null;
    }

    return {
      emailId,
      subscriberId: data.subscriberId,
      opened: data.opened,
      openedAt: data.openedAt,
      openCount: data.openCount,
      clickCount: data.clickCount,
      clicks: data.clicks.map((c) => ({
        linkUrl: c.linkUrl,
        timestamp: c.timestamp,
        ipAddress: c.ipAddress,
      })),
      engagementScore: this.calculateEngagementScore(data),
      lastActivity: data.lastClickedAt || data.lastOpenedAt,
    };
  }

  /**
   * Calcular score de engajamento
   */
  private calculateEngagementScore(data: EmailTrackingData): number {
    let score = 0;

    // Abertura: 50 pontos
    if (data.opened) {
      score += 50;
    }

    // Cliques: 50 pontos (máximo)
    if (data.clickCount > 0) {
      score += Math.min(50, data.clickCount * 10);
    }

    // Múltiplas aberturas: bônus de 10 pontos
    if (data.openCount > 1) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Gerar relatório de engajamento
   */
  generateEngagementReport(emailIds: string[]) {
    const report = {
      totalEmails: emailIds.length,
      openedEmails: 0,
      totalOpens: 0,
      totalClicks: 0,
      avgEngagementScore: 0,
      topLinks: new Map<string, number>(),
      devices: new Map<string, number>(),
    };

    let totalScore = 0;

    for (const emailId of emailIds) {
      const data = this.trackingData.get(emailId);

      if (data) {
        if (data.opened) {
          report.openedEmails++;
        }

        report.totalOpens += data.openCount;
        report.totalClicks += data.clickCount;
        totalScore += this.calculateEngagementScore(data);

        // Contar links mais clicados
        for (const click of data.clicks) {
          const count = report.topLinks.get(click.linkUrl) || 0;
          report.topLinks.set(click.linkUrl, count + 1);
        }

        // Contar dispositivos
        for (const click of data.clicks) {
          const device = this.extractDevice(click.userAgent);
          const count = report.devices.get(device) || 0;
          report.devices.set(device, count + 1);
        }
      }
    }

    report.avgEngagementScore = Math.round(totalScore / emailIds.length);

    return {
      ...report,
      topLinks: Array.from(report.topLinks.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, count]) => ({ url, count })),
      devices: Array.from(report.devices.entries()).map(([device, count]) => ({
        device,
        count,
      })),
    };
  }

  /**
   * Extrair tipo de dispositivo do User Agent
   */
  private extractDevice(userAgent: string): string {
    if (!userAgent) return "unknown";

    if (userAgent.includes("Mobile")) return "mobile";
    if (userAgent.includes("Tablet")) return "tablet";
    if (userAgent.includes("iPad")) return "tablet";
    if (userAgent.includes("iPhone")) return "mobile";
    if (userAgent.includes("Android")) return "mobile";

    return "desktop";
  }

  /**
   * Limpar dados antigos (mais de 30 dias)
   */
  cleanupOldData(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const [key, data] of this.trackingData.entries()) {
      if (data.openedAt && data.openedAt < cutoffDate && data.lastClickedAt && data.lastClickedAt < cutoffDate) {
        this.trackingData.delete(key);
        deletedCount++;
      }
    }

    console.log(`[Email Tracking] Limpeza concluída: ${deletedCount} registros deletados`);

    return deletedCount;
  }

  /**
   * Exportar dados para banco de dados
   */
  exportToDatabase() {
    const records = [];

    for (const [emailId, data] of this.trackingData.entries()) {
      records.push({
        emailId: data.emailId,
        subscriberId: data.subscriberId,
        opened: data.opened,
        openedAt: data.openedAt,
        openCount: data.openCount,
        clickCount: data.clickCount,
        clicks: data.clicks,
        engagementScore: this.calculateEngagementScore(data),
        lastUpdated: new Date(),
      });
    }

    return records;
  }

  /**
   * Limpar todos os dados (cuidado!)
   */
  clearAll(): void {
    this.trackingData.clear();
    console.log("[Email Tracking] Todos os dados foram limpos");
  }
}

// Instância global
let trackingService: EmailTrackingService | null = null;

/**
 * Obter instância do serviço de rastreamento
 */
export function getEmailTrackingService(): EmailTrackingService {
  if (!trackingService) {
    trackingService = new EmailTrackingService();
  }
  return trackingService;
}

export { EmailTrackingService, TrackingPixel, ClickTrack, EmailTrackingData };
