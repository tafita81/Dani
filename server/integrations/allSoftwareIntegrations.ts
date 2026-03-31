import axios from "axios";

// ============ TikTok Integration ============
export class TikTokAPI {
  private accessToken: string;
  private baseUrl = "https://open-api.tiktok.com/v1";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getVideoComments(videoId: string) {
    const response = await axios.get(`${this.baseUrl}/video/comments/list`, {
      params: {
        video_id: videoId,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async replyToComment(commentId: string, text: string) {
    const response = await axios.post(
      `${this.baseUrl}/video/comment/reply`,
      {
        comment_id: commentId,
        content: text,
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }

  async publishVideo(videoUrl: string, caption: string) {
    const response = await axios.post(
      `${this.baseUrl}/video/upload`,
      {
        video_url: videoUrl,
        caption: caption,
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }
}

// ============ Telegram Integration ============
export class TelegramAPI {
  private botToken: string;
  private baseUrl = "https://api.telegram.org/bot";

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async sendMessage(chatId: string, text: string) {
    const response = await axios.post(
      `${this.baseUrl}${this.botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }
    );
    return response.data;
  }

  async sendPhoto(chatId: string, photoUrl: string, caption?: string) {
    const response = await axios.post(
      `${this.baseUrl}${this.botToken}/sendPhoto`,
      {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
      }
    );
    return response.data;
  }

  async getUpdates() {
    const response = await axios.get(
      `${this.baseUrl}${this.botToken}/getUpdates`
    );
    return response.data;
  }

  async setWebhook(webhookUrl: string) {
    const response = await axios.post(
      `${this.baseUrl}${this.botToken}/setWebhook`,
      {
        url: webhookUrl,
      }
    );
    return response.data;
  }
}

// ============ WhatsApp Integration ============
export class WhatsAppAPI {
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl = "https://graph.instagram.com/v18.0";

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  async sendMessage(to: string, message: string) {
    const response = await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }

  async sendTemplate(to: string, templateName: string, parameters?: any[]) {
    const response = await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "pt_BR",
          },
          parameters: parameters,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }

  async markAsRead(messageId: string) {
    const response = await axios.post(
      `${this.baseUrl}/${messageId}`,
      {
        status: "read",
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }
}

// ============ Pipedrive Integration ============
export class PipedriveAPI {
  private apiToken: string;
  private baseUrl = "https://api.pipedrive.com/v1";

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async createDeal(title: string, value: number, pipelineId: string) {
    const response = await axios.post(`${this.baseUrl}/deals`, {
      title: title,
      value: value,
      pipeline_id: pipelineId,
      api_token: this.apiToken,
    });
    return response.data;
  }

  async createPerson(name: string, email?: string, phone?: string) {
    const response = await axios.post(`${this.baseUrl}/persons`, {
      name: name,
      email: email,
      phone: phone,
      api_token: this.apiToken,
    });
    return response.data;
  }

  async addActivity(dealId: string, type: string, subject: string) {
    const response = await axios.post(`${this.baseUrl}/activities`, {
      deal_id: dealId,
      type: type,
      subject: subject,
      api_token: this.apiToken,
    });
    return response.data;
  }

  async getDeals() {
    const response = await axios.get(`${this.baseUrl}/deals`, {
      params: {
        api_token: this.apiToken,
      },
    });
    return response.data;
  }

  async updateDealStage(dealId: string, stageId: string) {
    const response = await axios.put(
      `${this.baseUrl}/deals/${dealId}`,
      {
        stage_id: stageId,
        api_token: this.apiToken,
      }
    );
    return response.data;
  }
}

// ============ HubSpot Integration ============
export class HubSpotAPI {
  private accessToken: string;
  private baseUrl = "https://api.hubapi.com";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createContact(email: string, firstName?: string, lastName?: string) {
    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/contacts`,
      {
        properties: {
          email: email,
          firstname: firstName,
          lastname: lastName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }

  async createDeal(dealName: string, amount: number, dealStage: string) {
    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/deals`,
      {
        properties: {
          dealname: dealName,
          amount: amount,
          dealstage: dealStage,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }

  async associateContactToDeal(contactId: string, dealId: string) {
    const response = await axios.put(
      `${this.baseUrl}/crm/v3/objects/contacts/${contactId}/associations/deals/${dealId}`,
      {
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationType: "contact_to_deal",
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }

  async createTask(title: string, description?: string, contactId?: string) {
    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/tasks`,
      {
        properties: {
          hs_task_subject: title,
          hs_task_body: description,
        },
        associations:
          contactId ?
            [
              {
                id: contactId,
                type: "task_to_contact",
              },
            ]
          : [],
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }

  async getContacts() {
    const response = await axios.get(
      `${this.baseUrl}/crm/v3/objects/contacts`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    return response.data;
  }
}

// ============ Unified Integration Manager ============
export class UnifiedIntegrationManager {
  private tiktok?: TikTokAPI;
  private telegram?: TelegramAPI;
  private whatsapp?: WhatsAppAPI;
  private pipedrive?: PipedriveAPI;
  private hubspot?: HubSpotAPI;

  constructor(config: {
    tiktokToken?: string;
    telegramBotToken?: string;
    whatsappToken?: string;
    whatsappPhoneId?: string;
    pipedriveToken?: string;
    hubspotToken?: string;
  }) {
    if (config.tiktokToken) this.tiktok = new TikTokAPI(config.tiktokToken);
    if (config.telegramBotToken)
      this.telegram = new TelegramAPI(config.telegramBotToken);
    if (config.whatsappToken && config.whatsappPhoneId)
      this.whatsapp = new WhatsAppAPI(config.whatsappToken, config.whatsappPhoneId);
    if (config.pipedriveToken)
      this.pipedrive = new PipedriveAPI(config.pipedriveToken);
    if (config.hubspotToken) this.hubspot = new HubSpotAPI(config.hubspotToken);
  }

  getTikTok(): TikTokAPI | undefined {
    return this.tiktok;
  }

  getTelegram(): TelegramAPI | undefined {
    return this.telegram;
  }

  getWhatsApp(): WhatsAppAPI | undefined {
    return this.whatsapp;
  }

  getPipedrive(): PipedriveAPI | undefined {
    return this.pipedrive;
  }

  getHubSpot(): HubSpotAPI | undefined {
    return this.hubspot;
  }

  /**
   * Sincronizar lead entre plataformas
   */
  async syncLeadAcrossPlatforms(
    leadData: {
      name: string;
      email: string;
      phone: string;
      source: string;
    }
  ) {
    const results: Record<string, any> = {};

    // Criar contato no HubSpot
    if (this.hubspot) {
      try {
        results.hubspot = await this.hubspot.createContact(
          leadData.email,
          leadData.name
        );
      } catch (error) {
        console.error("Erro ao criar contato no HubSpot:", error);
      }
    }

    // Criar pessoa no Pipedrive
    if (this.pipedrive) {
      try {
        results.pipedrive = await this.pipedrive.createPerson(
          leadData.name,
          leadData.email,
          leadData.phone
        );
      } catch (error) {
        console.error("Erro ao criar pessoa no Pipedrive:", error);
      }
    }

    // Enviar mensagem no WhatsApp
    if (this.whatsapp) {
      try {
        results.whatsapp = await this.whatsapp.sendMessage(
          leadData.phone,
          `Olá ${leadData.name}! Bem-vindo ao nosso canal de psicoeducação. 🧠`
        );
      } catch (error) {
        console.error("Erro ao enviar mensagem no WhatsApp:", error);
      }
    }

    return results;
  }

  /**
   * Obter status de todas as integrações
   */
  getIntegrationStatus(): Record<string, boolean> {
    return {
      tiktok: !!this.tiktok,
      telegram: !!this.telegram,
      whatsapp: !!this.whatsapp,
      pipedrive: !!this.pipedrive,
      hubspot: !!this.hubspot,
    };
  }
}
