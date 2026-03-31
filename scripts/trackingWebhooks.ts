/**
 * Webhooks de Rastreamento de Emails
 * Endpoints para capturar aberturas e cliques em emails
 */

import { Router, Request, Response } from "express";
import { getEmailTrackingService } from "../emailTrackingService";
import { z } from "zod";

const trackingRouter = Router();
const trackingService = getEmailTrackingService();

/**
 * Validação de entrada
 */
const pixelSchema = z.object({
  pixelId: z.string().min(1),
});

const clickSchema = z.object({
  trackingId: z.string().min(1),
  encodedUrl: z.string().min(1),
});

/**
 * Middleware de validação de segurança
 */
function validateTrackingRequest(req: Request, res: Response, next: Function) {
  // Validar User-Agent
  const userAgent = req.headers["user-agent"] || "unknown";

  // Validar IP
  const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

  // Armazenar no request para uso posterior
  (req as any).userAgent = userAgent;
  (req as any).ipAddress = ipAddress;

  next();
}

/**
 * POST /api/tracking/pixel/:pixelId
 * Registra abertura de email
 */
trackingRouter.post("/pixel/:pixelId", validateTrackingRequest, (req: Request, res: Response) => {
  try {
    const { pixelId } = pixelSchema.parse({ pixelId: req.params.pixelId });

    // Decodificar pixelId (formato: emailId-subscriberId)
    const [emailId, subscriberId] = pixelId.split("-");

    if (!emailId || !subscriberId) {
      console.warn(`[Tracking] Pixel ID inválido: ${pixelId}`);
      return res.status(400).json({ error: "Invalid pixel ID" });
    }

    // Registrar abertura
    trackingService.recordOpen(emailId, subscriberId, (req as any).userAgent, (req as any).ipAddress);

    // Retornar pixel 1x1 transparente
    const pixel = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
      0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x0a, 0x00, 0x01, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
    ]);

    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Content-Length", pixel.length);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.send(pixel);

    console.log(`[Tracking] Abertura registrada: ${emailId} por ${subscriberId}`);
  } catch (error) {
    console.error("[Tracking] Erro ao registrar abertura:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/tracking/click/:trackingId/:encodedUrl
 * Registra clique em link e redireciona
 */
trackingRouter.post("/click/:trackingId/:encodedUrl", validateTrackingRequest, (req: Request, res: Response) => {
  try {
    const { trackingId, encodedUrl } = clickSchema.parse({
      trackingId: req.params.trackingId,
      encodedUrl: req.params.encodedUrl,
    });

    // Decodificar URL
    let originalUrl: string;
    try {
      originalUrl = Buffer.from(encodedUrl, "base64").toString("utf-8");
    } catch (error) {
      console.warn(`[Tracking] URL codificada inválida: ${encodedUrl}`);
      return res.status(400).json({ error: "Invalid encoded URL" });
    }

    // Validar URL
    try {
      new URL(originalUrl);
    } catch (error) {
      console.warn(`[Tracking] URL inválida: ${originalUrl}`);
      return res.status(400).json({ error: "Invalid URL" });
    }

    // Decodificar trackingId (formato: emailId-subscriberId)
    const [emailId, subscriberId] = trackingId.split("-");

    if (!emailId || !subscriberId) {
      console.warn(`[Tracking] Tracking ID inválido: ${trackingId}`);
      return res.status(400).json({ error: "Invalid tracking ID" });
    }

    // Registrar clique
    trackingService.recordClick(emailId, subscriberId, originalUrl, (req as any).userAgent, (req as any).ipAddress);

    // Redirecionar para URL original
    res.redirect(301, originalUrl);

    console.log(`[Tracking] Clique registrado: ${emailId} em ${originalUrl}`);
  } catch (error) {
    console.error("[Tracking] Erro ao registrar clique:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/tracking/stats/:emailId
 * Obter estatísticas de rastreamento
 */
trackingRouter.get("/stats/:emailId", (req: Request, res: Response) => {
  try {
    const { emailId } = req.params;

    if (!emailId) {
      return res.status(400).json({ error: "Email ID required" });
    }

    const stats = trackingService.getTrackingStats(emailId);

    if (!stats) {
      return res.status(404).json({ error: "No tracking data found" });
    }

    res.json(stats);
  } catch (error) {
    console.error("[Tracking] Erro ao obter estatísticas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/tracking/report
 * Obter relatório de engajamento
 */
trackingRouter.get("/report", (req: Request, res: Response) => {
  try {
    const emailIds = (req.query.emailIds as string)?.split(",") || [];

    if (emailIds.length === 0) {
      return res.status(400).json({ error: "Email IDs required" });
    }

    const report = trackingService.generateEngagementReport(emailIds);

    res.json(report);
  } catch (error) {
    console.error("[Tracking] Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/tracking/cleanup
 * Limpar dados antigos (admin only)
 */
trackingRouter.post("/cleanup", (req: Request, res: Response) => {
  try {
    // TODO: Adicionar verificação de admin

    const daysToKeep = req.body.daysToKeep || 30;
    const deletedCount = trackingService.cleanupOldData(daysToKeep);

    res.json({
      success: true,
      message: `${deletedCount} registros antigos deletados`,
      deletedCount,
    });

    console.log(`[Tracking] Limpeza concluída: ${deletedCount} registros deletados`);
  } catch (error) {
    console.error("[Tracking] Erro ao limpar dados:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { trackingRouter };
