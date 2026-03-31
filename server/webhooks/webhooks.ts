/**
 * Express routes for external webhooks:
 * - WhatsApp Business Cloud API webhook
 * - Telegram Bot webhook
 * - Google Calendar OAuth callback
 */

import type { Express, Request, Response } from "express";
import * as whatsapp from "../integrations/whatsapp";
import * as telegram from "../integrations/telegram";
import * as gcal from "../integrations/googleCalendar";
import * as ocal from "../integrations/outlookCalendar";
import * as db from "../core_logic/db";
import { invokeLLM } from "../_core/llm";
import { generateAudioUrl } from "../ai/ttsSimple";

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
                [{ text: "📅 Agendar Consulta", callback_data: "schedule_appointment" }],
                [{ text: "❓ Fazer Pergunta", callback_data: "ask_question" }],
                [{ text: "📋 Ver Agendamentos", callback_data: "list_appointments" }],
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
  app.get("/api/gcal-callback", async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

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
      res.redirect("/#/settings?gcal=pending");
    } catch (error) {
      console.error("[Google Calendar] OAuth callback error:", error);
      res.redirect("/#/settings?gcal=error");
    }
  });

  // ─── Text-to-Speech API ───
  app.post("/api/tts", async (req: Request, res: Response) => {
    try {
      const { text, language = "pt-BR" } = req.body;

      if (!text) {
        res.status(400).json({ error: "Texto é obrigatório" });
        return;
      }

      console.log("[TTS] Gerando áudio para:", text.substring(0, 50));
      const audioUrl = await generateAudioUrl(text, language);

      if (!audioUrl) {
        console.error("[TTS] Falha ao gerar áudio para:", text.substring(0, 50));
        res.status(500).json({ error: "Falha ao gerar áudio" });
        return;
      }

      res.json({
        success: true,
        audioUrl,
      });
    } catch (error) {
      console.error("[TTS] Erro:", error);
      res.status(500).json({ error: "Erro ao gerar áudio" });
    }
  });

  // ─── Car Assistant API (Assistente Carro) ───
  app.post("/api/assistente-carro/pergunta", async (req: Request, res: Response) => {
    try {
      const { question } = req.body;

      if (!question) {
        res.status(400).json({ error: "question is required" });
        return;
      }

      // Disable cache completely
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store",
      });

      // Buscar TODOS os pacientes, agendamentos e sessões do banco
      const allPatients = await db.getAllPatients();
      const allAppointments = await db.getAllAppointments();
      const allSessions = await db.getAllSessionNotes();

      // Usar IA para entender a pergunta
      
      const patientsData = allPatients.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        status: p.status,
        totalSessions: p.totalSessions,
      }));

      let answer = "";
      let dataUsed: any = {};

      try {
        // Importar filtros avançados
        const { processAdvancedFilter } = await import("./advancedFilters");
        
        // Tentar processar com filtros avançados primeiro
        const advancedResult = await processAdvancedFilter(question);
        
        if (advancedResult) {
          answer = advancedResult.answer;
          dataUsed = {
            totalPatients: allPatients.length,
            patients: patientsData,
            usedAdvancedFilters: true,
            category: advancedResult.category,
            data: advancedResult.data
          };
        } else {
          // Se não for filtro avançado, usar LLM
          const llmResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Você é um assistente clínico inteligente. Responda perguntas sobre pacientes, agendamentos e sessões de forma clara e natural em português brasileiro."
              },
              {
                role: "user",
                content: `Pergunta: "${question}"\n\nDados disponíveis:\n- Total de pacientes: ${allPatients.length}\n- Pacientes: ${JSON.stringify(patientsData, null, 2)}\n- Total de agendamentos: ${allAppointments.length}\n- Total de sessões: ${allSessions.length}\n\nResponda APENAS com a resposta final, sem explicações adicionais.`
              }
            ]
          });

          const llmContent = llmResponse.choices[0]?.message?.content;
          answer = typeof llmContent === 'string' ? llmContent : `Você tem ${allPatients.length} pacientes cadastrados.`;
          dataUsed = {
            totalPatients: allPatients.length,
            patients: patientsData,
            usedAI: true
          };
        }
      } catch (llmError) {
        console.error('[Car Assistant] Erro ao processar:', llmError);
        // Fallback simples
        const activeCount = allPatients.filter((p: any) => p.status === "active").length;
        const inactiveCount = allPatients.filter((p: any) => p.status === "inactive").length;
        answer = `Você tem ${allPatients.length} pacientes cadastrados no total. Sendo ${activeCount} ativos e ${inactiveCount} inativos.`;
        dataUsed = {
          totalPatients: allPatients.length,
          activePatients: activeCount,
          inactivePatients: inactiveCount,
          patients: allPatients,
        };
      }

      const result = {
        success: true,
        question: question,
        answer: answer,
        dataSource: "database",
        dataUsed: dataUsed,
        timestamp: new Date(),
      };

      res.json(result);
    } catch (error) {
      console.error("[Car Assistant] Error:", error);
      res.status(500).json({
        success: false,
        answer: "Desculpe, ocorreu um erro ao processar sua pergunta.",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
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
