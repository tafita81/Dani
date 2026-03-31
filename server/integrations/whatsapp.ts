/**
 * WhatsApp Business Cloud API integration.
 * Handles sending messages, templates, and interactive buttons.
 */

const WHATSAPP_API = "https://graph.facebook.com/v21.0";

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
  businessAccountId?: string;
}

export interface WhatsAppMessage {
  from: string;
  text?: string;
  type: string;
  timestamp: string;
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

// ─── Send text message ───
export async function sendTextMessage(config: WhatsAppConfig, to: string, text: string) {
  const url = `${WHATSAPP_API}/${config.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp send failed: ${error}`);
  }
  return response.json();
}

// ─── Send interactive buttons ───
export async function sendButtonMessage(
  config: WhatsAppConfig,
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  const url = `${WHATSAPP_API}/${config.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.slice(0, 3).map(b => ({
            type: "reply",
            reply: { id: b.id, title: b.title.slice(0, 20) },
          })),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp button send failed: ${error}`);
  }
  return response.json();
}

// ─── Send interactive list ───
export async function sendListMessage(
  config: WhatsAppConfig,
  to: string,
  bodyText: string,
  buttonText: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
) {
  const url = `${WHATSAPP_API}/${config.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonText.slice(0, 20),
          sections,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp list send failed: ${error}`);
  }
  return response.json();
}

// ─── Send document (for .ics files) ───
export async function sendDocumentMessage(
  config: WhatsAppConfig,
  to: string,
  documentUrl: string,
  filename: string,
  caption?: string
) {
  const url = `${WHATSAPP_API}/${config.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: {
        link: documentUrl,
        filename,
        caption,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp document send failed: ${error}`);
  }
  return response.json();
}

// ─── Send template message (for notifications) ───
export async function sendTemplateMessage(
  config: WhatsAppConfig,
  to: string,
  templateName: string,
  languageCode: string,
  components?: any[]
) {
  const url = `${WHATSAPP_API}/${config.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp template send failed: ${error}`);
  }
  return response.json();
}

// ─── Parse incoming webhook ───
export function parseWebhookMessage(body: any): WhatsAppMessage | null {
  try {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    if (!message) return null;

    return {
      from: message.from,
      text: message.text?.body,
      type: message.type,
      timestamp: message.timestamp,
      interactive: message.interactive,
    };
  } catch {
    return null;
  }
}

// ─── Verify webhook ───
export function verifyWebhook(query: any, verifyToken: string): string | null {
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    return challenge;
  }
  return null;
}
