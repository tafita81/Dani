import { Router, Request, Response } from "express";
import { verifyWebhook, processInboundMessage } from "../integrations/whatsapp.js";

const router = Router();

// GET — validação do webhook pelo Meta
router.get("/", (req: Request, res: Response) => {
  const mode      = req.query["hub.mode"] as string;
  const token     = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  const result = verifyWebhook(mode, token, challenge);
  if (result) return res.status(200).send(result);
  return res.status(403).send("Forbidden");
});

// POST — receber mensagens
router.post("/", async (req: Request, res: Response) => {
  try {
    res.status(200).send("OK"); // Responder imediatamente ao Meta
    await processInboundMessage(req.body);
  } catch (err) {
    console.error("[WhatsApp webhook]", err);
  }
});

export default router;
