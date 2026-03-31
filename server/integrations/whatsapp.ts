/**
 * whatsapp.ts — Integração WhatsApp Business API
 * Envio de mensagens, lembretes e automação de respostas
 */

import { db } from "../core_logic/db.js";
import { messageLog, patients, leads } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

const WA_TOKEN   = process.env.WHATSAPP_BUSINESS_API_TOKEN ?? "";
const PHONE_ID   = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
const BASE_URL   = `https://graph.facebook.com/v18.0/${PHONE_ID}`;

// ── Enviar mensagem de texto ──────────────────────────────────
export async function sendTextMessage(to: string, text: string): Promise<boolean> {
  if (!WA_TOKEN || !PHONE_ID) {
    console.warn("[WhatsApp] Credenciais não configuradas");
    return false;
  }

  try {
    const res = await fetch(`${BASE_URL}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body: text },
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("[WhatsApp] Erro ao enviar:", err);
    return false;
  }
}

// ── Enviar template (lembrete de consulta) ────────────────────
export async function sendAppointmentReminder(
  phone: string,
  patientName: string,
  dateStr: string,
  timeStr: string
): Promise<boolean> {
  const text = `Olá ${patientName}! 🌸
Lembrete da sua consulta com a Dra. Daniela Coelho:

📅 Data: ${dateStr}
🕐 Horário: ${timeStr}

Para confirmar, responda SIM. Para cancelar, responda NÃO.

Em caso de dúvidas: https://wa.me/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;

  return sendTextMessage(phone, text);
}

// ── Enviar CTA para lead de alta intenção ─────────────────────
export async function sendHighIntentCTA(phone: string, name: string): Promise<boolean> {
  const text = `Olá ${name}! 😊
Vi que você demonstrou interesse em iniciar sua jornada terapêutica.

A Dra. Daniela Coelho tem disponibilidade para uma consulta inicial.
Clique no link para escolher o melhor horário:

👉 ${process.env.FRONTEND_URL}/agendar

Qualquer dúvida, estou aqui! 💜`;

  return sendTextMessage(phone, text);
}

// ── Processar mensagem recebida (webhook) ─────────────────────
export async function processInboundMessage(payload: any): Promise<void> {
  const entry   = payload?.entry?.[0];
  const changes = entry?.changes?.[0];
  const value   = changes?.value;
  const message = value?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const text = message.text?.body ?? "";
  const waId = message.id;

  // Registrar no log
  await db.insert(messageLog).values({
    channel:    "whatsapp",
    direction:  "inbound",
    content:    text,
    externalId: waId,
  }).onDuplicateKeyUpdate({ set: { content: text } });

  // Detectar intenção e responder
  const lower = text.toLowerCase().trim();

  if (["sim", "confirmar", "confirmo", "ok"].includes(lower)) {
    await sendTextMessage(from, "✅ Consulta confirmada! Até lá. 😊");
    return;
  }

  if (["não", "nao", "cancelar", "cancela"].includes(lower)) {
    await sendTextMessage(from,
      "Entendido! Sua consulta foi cancelada. Para reagendar, acesse:\n" +
      `${process.env.FRONTEND_URL}/agendar`
    );
    return;
  }

  if (lower.includes("agendar") || lower.includes("consulta") || lower.includes("horário")) {
    await sendTextMessage(from,
      `Para agendar uma consulta com a Dra. Daniela Coelho, acesse:\n` +
      `👉 ${process.env.FRONTEND_URL}/agendar\n\n` +
      `Ou responda com sua disponibilidade e entraremos em contato! 💜`
    );
    return;
  }

  // Resposta padrão
  await sendTextMessage(from,
    `Olá! 👋 Sou a assistente da Dra. Daniela Coelho.\n` +
    `Para agendar ou tirar dúvidas, acesse: ${process.env.FRONTEND_URL}\n\n` +
    `Em breve entraremos em contato! 💜`
  );
}

// ── Verificar webhook (GET de validação do Meta) ──────────────
export function verifyWebhook(mode: string, token: string, challenge: string): string | null {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "";
  if (mode === "subscribe" && token === verifyToken) return challenge;
  return null;
}
