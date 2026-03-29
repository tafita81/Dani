import express, { Express, Request, Response } from "express";
import crypto from "crypto";

export interface WebhookEvent {
  id: string;
  platform: "instagram" | "youtube" | "tiktok";
  type: "comment" | "like" | "follow" | "message";
  data: Record<string, any>;
  timestamp: Date;
  processed: boolean;
}

export interface WebhookConfig {
  verifyToken: string;
  webhookUrl: string;
  platform: string;
}

export class WebhookManager {
  private app: Express;
  private webhookConfigs: Map<string, WebhookConfig> = new Map();
  private eventQueue: WebhookEvent[] = [];
  private eventHandlers: Map<string, (event: WebhookEvent) => Promise<void>> =
    new Map();

  constructor(app: Express) {
    this.app = app;
    this.setupRoutes();
  }

  /**
   * Configurar rotas de webhook
   */
  private setupRoutes() {
    // Webhook do Instagram
    this.app.post("/webhooks/instagram", (req: Request, res: Response) => {
      this.handleInstagramWebhook(req, res);
    });

    // Webhook do YouTube
    this.app.post("/webhooks/youtube", (req: Request, res: Response) => {
      this.handleYouTubeWebhook(req, res);
    });

    // Webhook do TikTok
    this.app.post("/webhooks/tiktok", (req: Request, res: Response) => {
      this.handleTikTokWebhook(req, res);
    });

    // Verificação de webhook (GET)
    this.app.get("/webhooks/:platform", (req: Request, res: Response) => {
      this.verifyWebhook(req, res);
    });
  }

  /**
   * Registrar handler para evento
   */
  registerEventHandler(
    eventType: string,
    handler: (event: WebhookEvent) => Promise<void>
  ) {
    this.eventHandlers.set(eventType, handler);
  }

  /**
   * Processar webhook do Instagram
   */
  private async handleInstagramWebhook(req: Request, res: Response) {
    try {
      const body = req.body;

      // Validar assinatura
      if (!this.validateInstagramSignature(req)) {
        res.status(401).send("Unauthorized");
        return;
      }

      // Processar eventos
      if (body.entry && body.entry[0].changes) {
        for (const change of body.entry[0].changes) {
          const event: WebhookEvent = {
            id: `ig-${Date.now()}`,
            platform: "instagram",
            type: this.mapInstagramEventType(change.field),
            data: change.value,
            timestamp: new Date(),
            processed: false,
          };

          await this.processEvent(event);
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro ao processar webhook Instagram:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Processar webhook do YouTube
   */
  private async handleYouTubeWebhook(req: Request, res: Response) {
    try {
      const body = req.body;

      // YouTube usa PubSubHubbub
      if (body.feed) {
        const entries = body.feed.entry || [];

        for (const entry of entries) {
          const event: WebhookEvent = {
            id: `yt-${Date.now()}`,
            platform: "youtube",
            type: "comment",
            data: {
              videoId: entry["yt:videoid"]?.[0],
              authorName: entry.author?.[0]?.name?.[0],
              content: entry.content?.[0]?.["_"],
              published: entry.published?.[0],
            },
            timestamp: new Date(),
            processed: false,
          };

          await this.processEvent(event);
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro ao processar webhook YouTube:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Processar webhook do TikTok
   */
  private async handleTikTokWebhook(req: Request, res: Response) {
    try {
      const body = req.body;

      // Validar assinatura do TikTok
      if (!this.validateTikTokSignature(req)) {
        res.status(401).send("Unauthorized");
        return;
      }

      if (body.data && body.data.event) {
        const event: WebhookEvent = {
          id: `tt-${Date.now()}`,
          platform: "tiktok",
          type: this.mapTikTokEventType(body.data.event),
          data: body.data,
          timestamp: new Date(),
          processed: false,
        };

        await this.processEvent(event);
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro ao processar webhook TikTok:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Verificar webhook (desafio de verificação)
   */
  private verifyWebhook(req: Request, res: Response) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const config = this.webhookConfigs.get(req.params.platform);

    if (mode === "subscribe" && token === config?.verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
  }

  /**
   * Processar evento
   */
  private async processEvent(event: WebhookEvent) {
    this.eventQueue.push(event);

    const eventKey = `${event.platform}:${event.type}`;
    const handler = this.eventHandlers.get(eventKey);

    if (handler) {
      try {
        await handler(event);
        event.processed = true;
      } catch (error) {
        console.error(`Erro ao processar evento ${eventKey}:`, error);
      }
    }
  }

  /**
   * Validar assinatura do Instagram
   */
  private validateInstagramSignature(req: Request): boolean {
    const signature = req.get("x-hub-signature-256");
    if (!signature) return false;

    const config = this.webhookConfigs.get("instagram");
    if (!config) return false;

    const hash = crypto
      .createHmac("sha256", config.verifyToken)
      .update(JSON.stringify(req.body))
      .digest("hex");

    return signature === `sha256=${hash}`;
  }

  /**
   * Validar assinatura do TikTok
   */
  private validateTikTokSignature(req: Request): boolean {
    const signature = req.get("x-tiktok-signature");
    if (!signature) return false;

    const config = this.webhookConfigs.get("tiktok");
    if (!config) return false;

    // TikTok usa HMAC-SHA256
    const hash = crypto
      .createHmac("sha256", config.verifyToken)
      .update(JSON.stringify(req.body))
      .digest("hex");

    return signature === hash;
  }

  /**
   * Mapear tipo de evento Instagram
   */
  private mapInstagramEventType(field: string): WebhookEvent["type"] {
    const typeMap: Record<string, WebhookEvent["type"]> = {
      "comments": "comment",
      "likes": "like",
      "follow": "follow",
      "messages": "message",
    };
    return typeMap[field] || "comment";
  }

  /**
   * Mapear tipo de evento TikTok
   */
  private mapTikTokEventType(eventType: string): WebhookEvent["type"] {
    const typeMap: Record<string, WebhookEvent["type"]> = {
      "comment.create": "comment",
      "like.create": "like",
      "follow.create": "follow",
      "message.create": "message",
    };
    return typeMap[eventType] || "comment";
  }

  /**
   * Registrar configuração de webhook
   */
  registerWebhookConfig(platform: string, config: WebhookConfig) {
    this.webhookConfigs.set(platform, config);
  }

  /**
   * Obter fila de eventos
   */
  getEventQueue(): WebhookEvent[] {
    return this.eventQueue;
  }

  /**
   * Limpar fila de eventos processados
   */
  clearProcessedEvents() {
    this.eventQueue = this.eventQueue.filter((event) => !event.processed);
  }

  /**
   * Obter estatísticas de webhooks
   */
  getWebhookStats(): Record<string, any> {
    const stats = {
      totalEvents: this.eventQueue.length,
      processedEvents: this.eventQueue.filter((e) => e.processed).length,
      pendingEvents: this.eventQueue.filter((e) => !e.processed).length,
      eventsByPlatform: {} as Record<string, number>,
      eventsByType: {} as Record<string, number>,
    };

    for (const event of this.eventQueue) {
      stats.eventsByPlatform[event.platform] =
        (stats.eventsByPlatform[event.platform] || 0) + 1;
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Factory para criar gerenciador de webhooks
 */
export function createWebhookManager(app: Express): WebhookManager {
  return new WebhookManager(app);
}
