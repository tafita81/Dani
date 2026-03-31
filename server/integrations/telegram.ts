/**
 * telegram.ts — Bot Telegram com inline keyboards para agendamento
 */

const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN ?? "";
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL ?? "";
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegramPost(method: string, body: object) {
  const res = await fetch(`${BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── Registrar webhook ─────────────────────────────────────────
export async function registerWebhook(): Promise<void> {
  if (!BOT_TOKEN || !WEBHOOK_URL) return;
  await telegramPost("setWebhook", { url: `${WEBHOOK_URL}/api/webhooks/telegram` });
  console.log("✅ Telegram webhook registrado");
}

// ── Enviar mensagem ───────────────────────────────────────────
export async function sendMessage(chatId: number | string, text: string) {
  return telegramPost("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
}

// ── Enviar inline keyboard de horários ───────────────────────
export async function sendScheduleKeyboard(
  chatId: number | string,
  slots: Array<{ label: string; value: string }>
) {
  const buttons = slots.map(s => [{ text: s.label, callback_data: `schedule:${s.value}` }]);
  return telegramPost("sendMessage", {
    chat_id: chatId,
    text: "🗓️ Escolha um horário disponível:",
    reply_markup: { inline_keyboard: buttons },
  });
}

// ── Processar update recebido ─────────────────────────────────
export async function processUpdate(update: any): Promise<void> {
  // Callback de botão inline
  if (update.callback_query) {
    const { id, data, from, message } = update.callback_query;
    await telegramPost("answerCallbackQuery", { callback_query_id: id });

    if (data?.startsWith("schedule:")) {
      const slot = data.replace("schedule:", "");
      await sendMessage(message.chat.id,
        `✅ Horário <b>${slot}</b> selecionado!\n` +
        `Acesse o link para confirmar: ${process.env.FRONTEND_URL}/agendar`
      );
    }
    return;
  }

  // Mensagem de texto
  const msg  = update.message;
  if (!msg) return;
  const chatId = msg.chat.id;
  const text   = (msg.text ?? "").toLowerCase().trim();

  if (text === "/start") {
    await sendMessage(chatId,
      `👋 Olá! Sou a assistente da <b>Dra. Daniela Coelho</b>.\n\n` +
      `Use os comandos:\n` +
      `/agendar — Ver horários disponíveis\n` +
      `/sobre — Sobre a Dra. Daniela\n` +
      `/site — Link do site`
    );
    return;
  }

  if (text === "/agendar" || text.includes("agendar")) {
    await sendMessage(chatId,
      `Para agendar, acesse:\n👉 ${process.env.FRONTEND_URL}/agendar\n\nOu aguarde que enviarei os horários disponíveis! 😊`
    );
    return;
  }

  if (text === "/site") {
    await sendMessage(chatId, `🌐 ${process.env.FRONTEND_URL}`);
    return;
  }

  await sendMessage(chatId,
    `Recebi sua mensagem! Em breve entraremos em contato. 💜\nPara agendar: ${process.env.FRONTEND_URL}/agendar`
  );
}
