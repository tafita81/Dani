import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleWhatsAppWebhook, verifyWhatsAppWebhook } from "./whatsappWebhook";
import { Request, Response } from "express";

describe("WhatsApp Webhook", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe("verifyWhatsAppWebhook", () => {
    it("deve verificar webhook com token válido", () => {
      process.env.WHATSAPP_VERIFY_TOKEN = "test-token";
      mockReq.query = {
        "hub.mode": "subscribe",
        "hub.verify_token": "test-token",
        "hub.challenge": "challenge123",
      };

      verifyWhatsAppWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("challenge123");
    });

    it("deve rejeitar webhook com token inválido", () => {
      process.env.WHATSAPP_VERIFY_TOKEN = "test-token";
      mockReq.query = {
        "hub.mode": "subscribe",
        "hub.verify_token": "invalid-token",
        "hub.challenge": "challenge123",
      };

      verifyWhatsAppWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });
  });

  describe("handleWhatsAppWebhook", () => {
    it("deve retornar erro para payload inválido", async () => {
      mockReq.body = {};

      await handleWhatsAppWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid webhook payload",
      });
    });

    it("deve processar webhook com sucesso", async () => {
      mockReq.body = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "5511987654321",
                      text: { body: "Sim, confirmo!" },
                      timestamp: "1234567890",
                    },
                  ],
                  contacts: [{ wa_id: "5511987654321", profile: { name: "Maria" } }],
                },
              },
            ],
          },
        ],
      };

      await handleWhatsAppWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it("deve retornar sucesso para webhook sem mensagens", async () => {
      mockReq.body = {
        entry: [
          {
            changes: [
              {
                value: {
                  contacts: [{ wa_id: "5511987654321" }],
                },
              },
            ],
          },
        ],
      };

      await handleWhatsAppWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it("deve processar múltiplas mensagens", async () => {
      mockReq.body = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "5511987654321",
                      text: { body: "Sim" },
                      timestamp: "1234567890",
                    },
                    {
                      from: "5511987654322",
                      text: { body: "Não" },
                      timestamp: "1234567891",
                    },
                  ],
                  contacts: [
                    { wa_id: "5511987654321", profile: { name: "Maria" } },
                    { wa_id: "5511987654322", profile: { name: "João" } },
                  ],
                },
              },
            ],
          },
        ],
      };

      await handleWhatsAppWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
