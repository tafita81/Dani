/**
 * Telegram Bot API integration.
 * Handles sending messages with inline keyboards for appointment booking.
 */

const TELEGRAM_API = "https://api.telegram.org";

export interface TelegramConfig {
  botToken: string;
  webhookUrl?: string;
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

// ─── Send text message ───
export async function sendMessage(config: TelegramConfig, chatId: string, text: string, parseMode = "HTML") {
  const url = `${TELEGRAM_API}/bot${config.botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram send failed: ${error}`);
  }
  return response.json();
}

// ─── Send message with inline keyboard ───
export async function sendInlineKeyboard(
  config: TelegramConfig,
  chatId: string,
  text: string,
  buttons: InlineButton[][],
  parseMode = "HTML"
) {
  const url = `${TELEGRAM_API}/bot${config.botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      reply_markup: {
        inline_keyboard: buttons,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram inline keyboard send failed: ${error}`);
  }
  return response.json();
}

// ─── Answer callback query ───
export async function answerCallbackQuery(config: TelegramConfig, callbackQueryId: string, text?: string) {
  const url = `${TELEGRAM_API}/bot${config.botToken}/answerCallbackQuery`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });
  return response.json();
}

// ─── Edit message text ───
export async function editMessageText(
  config: TelegramConfig,
  chatId: string,
  messageId: number,
  text: string,
  buttons?: InlineButton[][],
  parseMode = "HTML"
) {
  const url = `${TELEGRAM_API}/bot${config.botToken}/editMessageText`;
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: parseMode,
  };
  if (buttons) {
    body.reply_markup = { inline_keyboard: buttons };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

// ─── Send document ───
export async function sendDocument(
  config: TelegramConfig,
  chatId: string,
  documentUrl: string,
  filename: string,
  caption?: string
) {
  const url = `${TELEGRAM_API}/bot${config.botToken}/sendDocument`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      document: documentUrl,
      caption,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram document send failed: ${error}`);
  }
  return response.json();
}

// ─── Set webhook ───
export async function setWebhook(config: TelegramConfig, webhookUrl: string) {
  const url = `${TELEGRAM_API}/bot${config.botToken}/setWebhook`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram setWebhook failed: ${error}`);
  }
  return response.json();
}

// ─── Delete webhook ───
export async function deleteWebhook(config: TelegramConfig) {
  const url = `${TELEGRAM_API}/bot${config.botToken}/deleteWebhook`;
  const response = await fetch(url, { method: "POST" });
  return response.json();
}

// ─── Parse incoming update ───
export interface TelegramUpdate {
  message?: {
    message_id: number;
    chat: { id: number; first_name?: string; last_name?: string; username?: string };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    message: { message_id: number; chat: { id: number } };
    data: string;
    from: { id: number; first_name?: string; last_name?: string; username?: string };
  };
}

export function parseTelegramUpdate(body: any): TelegramUpdate {
  return body as TelegramUpdate;
}
