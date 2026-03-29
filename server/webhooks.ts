/**
 * Express routes for external webhooks:
 * - WhatsApp Business Cloud API webhook
 * - Telegram Bot webhook
 * - Google Calendar OAuth callback
 */

import type { Express, Request, Response } from "express";
import * as whatsapp from "./whatsapp";
import * as telegram from "./telegram";
import * as gcal from "./googleCalendar";
import * as ocal from "./outlookCalendar";
import * as db from "./db";

export function registerWebhookRoutes(app: Express) {
  // ─── WhatsApp Webhook Verification (GET) ───
  app.get("/api/webhook/whatsapp", async (req: Request, res: Response) => {
    try {
      // Find any user with active WhatsApp integration to get verify token
      // In production, this should be more specific
      const verifyToken = req.query["hub.verify_token"] as string;
      const challenge = req.query["hub.challenge"] as string;
      const mode = req.query["hub.mode"] as string;

      if (mode === "subscribe" && verifyToken && challenge) {
        // We accept any verify token that matches a configured integration
        console.log("[WhatsApp] Webhook verified");
        res.status(200).send(challenge);
        return;
      }
      res.status(403).send("Forbidden");
    } catch (error) {
      console.error("[WhatsApp] Webhook verification error:", error);
      res.status(500).send("Error");
    }
  });

  // ─── WhatsApp Webhook Messages (POST) ───
  app.post("/api/webhook/whatsapp", async (req: Request, res: Response) => {
    try {
      // Always respond 200 quickly to WhatsApp
      res.status(200).send("EVENT_RECEIVED");

      const message = whatsapp.parseWebhookMessage(req.body);
      if (!message) return;

      console.log(`[WhatsApp] Received message from ${message.from}: ${message.text || message.type}`);

      // Log the message (find user by phone number matching)
      // This is a simplified version - in production, match the phone number to a specific therapist
      // For now, we log it and the therapist can see it in the dashboard

    } catch (error) {
      console.error("[WhatsApp] Webhook processing error:", error);
    }
  });

  // ─── Telegram Webhook (POST) ───
  app.post("/api/webhook/telegram", async (req: Request, res: Response) => {
    try {
      res.status(200).send("OK");

      const update = telegram.parseTelegramUpdate(req.body);
      console.log("[Telegram] Received update:", JSON.stringify(update).slice(0, 200));

      if (update.callback_query) {
        // Handle inline keyboard callback
        const data = update.callback_query.data;
        const chatId = update.callback_query.message.chat.id.toString();

        console.log(`[Telegram] Callback from ${chatId}: ${data}`);

        // Parse callback data (format: action:param1:param2)
        const parts = data.split(":");
        const action = parts[0];

        if (action === "confirm_slot") {
          // Slot confirmed by patient
          await telegram.answerCallbackQuery(
            { botToken: process.env.TELEGRAM_BOT_TOKEN || "" },
            update.callback_query.id,
            "Horário confirmado!"
          );
        }
      }

      if (update.message?.text) {
        const chatId = update.message.chat.id.toString();
        const text = update.message.text;

        console.log(`[Telegram] Message from ${chatId}: ${text}`);

        // Handle /start command
        if (text === "/start") {
          // Welcome message with inline keyboard
          const config: telegram.TelegramConfig = { botToken: process.env.TELEGRAM_BOT_TOKEN || "" };
          if (config.botToken) {
            await telegram.sendInlineKeyboard(config, chatId,
              "🏥 <b>Assistente Clínico</b>\n\nBem-vindo! Sou o assistente de agendamento.\n\nEscolha uma opção:",
              [
                [{ text: "📅 Agendar Consulta", callback_data: "schedule" }],
                [{ text: "📋 Minhas Consultas", callback_data: "my_appointments" }],
                [{ text: "❌ Cancelar Consulta", callback_data: "cancel" }],
              ]
            );
          }
        }
      }
    } catch (error) {
      console.error("[Telegram] Webhook processing error:", error);
    }
  });

  // ─── Google Calendar OAuth Callback ───
  app.get("/api/google-callback", async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string; // Contains userId and origin

      if (!code) {
        res.status(400).send("Missing authorization code");
        return;
      }

      // Parse state to get userId and config
      let stateData: { userId: number; clientId: string; clientSecret: string; calendarEmail: string; origin: string };
      try {
        stateData = JSON.parse(Buffer.from(state, "base64").toString());
      } catch {
        res.status(400).send("Invalid state parameter");
        return;
      }

      const redirectUri = `${stateData.origin}/api/google-callback`;
      const tokens = await gcal.exchangeCode(stateData.clientId, stateData.clientSecret, code, redirectUri);

      // Save the integration setting
      await db.upsertIntegrationSetting({
        userId: stateData.userId,
        provider: "google_calendar",
        config: {
          clientId: stateData.clientId,
          clientSecret: stateData.clientSecret,
          refreshToken: tokens.refresh_token,
          calendarEmail: stateData.calendarEmail,
          accessToken: tokens.access_token,
          tokenExpiry: Date.now() + (tokens.expires_in - 60) * 1000,
        },
        isActive: true,
      });

      // Redirect back to settings page
      res.redirect("/#/settings?gcal=success");
    } catch (error) {
      console.error("[Google Calendar] OAuth callback error:", error);
      res.redirect("/#/settings?gcal=error");
    }
  });

  // ─── Outlook Calendar OAuth Callback ───
  app.get("/api/outlook-callback", async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;
      const sessionState = req.query.state as string; // Microsoft sends state back

      if (!code) {
        res.status(400).send("Missing authorization code");
        return;
      }

      // For now, we'll use a simplified approach
      // In production, you'd need to:
      // 1. Store state in session/cache before redirect
      // 2. Retrieve it here to get userId
      // 3. Exchange code for tokens

      // TODO: Implement full OAuth2 flow with state validation
      // For now, redirect to settings with a message
      res.redirect("/#/settings?outlook=pending");
    } catch (error) {
      console.error("[Outlook Calendar] OAuth callback error:", error);
      res.redirect("/#/settings?outlook=error");
    }
  });
}
