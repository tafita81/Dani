import { Request, Response } from "express";
import * as db from "../db";
import { parseConfirmationResponse } from "../whatsappService";
import { notifyOwner } from "../_core/notification";

/**
 * Webhook para receber e processar respostas de WhatsApp
 * Integra com WhatsApp Business API
 */
export async function handleWhatsAppWebhook(req: Request, res: Response) {
  try {
    const { entry } = req.body;

    if (!entry || !entry[0]) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const changes = entry[0].changes;
    if (!changes || !changes[0]) {
      return res.status(200).json({ success: true });
    }

    const { value } = changes[0];
    if (!value || !value.messages) {
      return res.status(200).json({ success: true });
    }

    // Processar cada mensagem recebida
    for (const message of value.messages) {
      await processWhatsAppMessage(message, value.contacts[0]);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook WhatsApp:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Processa uma mensagem individual do WhatsApp
 */
async function processWhatsAppMessage(
  message: any,
  contact: any
) {
  try {
    const patientPhone = contact.wa_id;
    const messageText = message.text?.body || "";
    const timestamp = new Date(parseInt(message.timestamp) * 1000);

    console.log(`[WhatsApp] Mensagem recebida de ${patientPhone}: ${messageText}`);

    // TODO: Implementar busca de agendamento pendente
    // Por enquanto, apenas logamos a mensagem
    console.log(`[WhatsApp] Processando resposta de ${patientPhone}`);

    // Analisar resposta do paciente
    const parsedStatus = parseConfirmationResponse(messageText);
    const response = {
      confirmed: parsedStatus === "confirmed",
      cancelled: parsedStatus === "cancelled",
      rescheduled: parsedStatus === "rescheduled",
      maybe: parsedStatus === "unknown",
    };

    // Atualizar status do agendamento baseado na resposta
    let newStatus = "pending";
    let notificationMessage = "";

    if (response.confirmed) {
      newStatus = "confirmed";
      notificationMessage = `✅ Paciente confirmou a consulta`;
    } else if (response.cancelled) {
      newStatus = "cancelled";
      notificationMessage = `❌ Paciente cancelou a consulta`;
    } else if (response.rescheduled) {
      newStatus = "rescheduled";
      notificationMessage = `🔄 Paciente solicitou remarcação`;
    } else if (response.maybe) {
      newStatus = "maybe";
      notificationMessage = `❓ Paciente respondeu "talvez"`;
    }

    // Salvar resposta no banco de dados
    if (newStatus !== "pending") {
      // TODO: Atualizar status do agendamento no banco
      // await db.updateAppointment(appointment.id, { status: newStatus });

      // Criar log da resposta
      // Log de resposta (será implementado no schema)

      // Notificar terapeuta
      if (notificationMessage) {
        await notifyOwner({
          title: "Resposta WhatsApp Recebida",
          content: notificationMessage,
        });
      }

      console.log(`[WhatsApp] Resposta processada: ${newStatus}`);
    }
  } catch (error) {
    console.error("Erro ao processar mensagem WhatsApp:", error);
  }
}

/**
 * Webhook de verificação (GET) para validar o endpoint
 */
export function verifyWhatsAppWebhook(req: Request, res: Response) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "your-verify-token";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp] Webhook verificado com sucesso");
    res.status(200).send(challenge);
  } else {
    console.error("[WhatsApp] Token de verificação inválido");
    res.status(403).json({ error: "Forbidden" });
  }
}

/**
 * Interface para log de resposta WhatsApp
 */
export interface WhatsAppResponseLog {
  appointmentId: string;
  patientPhone: string;
  messageText: string;
  parsedResponse: {
    confirmed: boolean;
    cancelled: boolean;
    rescheduled: boolean;
    maybe: boolean;
  };
  status: string;
  receivedAt: Date;
}
