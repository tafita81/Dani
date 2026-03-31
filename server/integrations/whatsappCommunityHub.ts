import axios from "axios";

/**
 * Sistema Central de Integração com WhatsApp da Comunidade
 * Todos os eventos (comentários, leads, notificações) são centralizados aqui
 */

interface CommunityMessage {
  type: "comment" | "lead" | "notification" | "alert" | "engagement" | "milestone";
  platform: "instagram" | "youtube" | "tiktok" | "telegram";
  title: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  priority: "low" | "medium" | "high" | "urgent";
}

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  communityGroupId: string;
  communityGroupName: string;
}

export class WhatsAppCommunityHub {
  private accessToken: string;
  private phoneNumberId: string;
  private communityGroupId: string;
  private communityGroupName: string;
  private baseUrl = "https://graph.instagram.com/v18.0";
  private messageQueue: CommunityMessage[] = [];

  constructor(config: WhatsAppConfig) {
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.communityGroupId = config.communityGroupId;
    this.communityGroupName = config.communityGroupName;
  }

  /**
   * Enviar mensagem para o grupo da comunidade
   */
  async sendToCommunity(message: CommunityMessage): Promise<any> {
    const formattedMessage = this.formatMessage(message);

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "group",
          to: this.communityGroupId,
          type: "text",
          text: {
            preview_url: false,
            body: formattedMessage,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao enviar mensagem para comunidade:", error);
      // Adicionar à fila para retentar depois
      this.messageQueue.push(message);
      throw error;
    }
  }

  /**
   * Processar comentário do Instagram/YouTube e enviar para WhatsApp
   */
  async processInstagramComment(commentData: {
    videoId: string;
    username: string;
    text: string;
    likes: number;
  }): Promise<any> {
    const message: CommunityMessage = {
      type: "comment",
      platform: "instagram",
      title: `💬 Novo Comentário de @${commentData.username}`,
      content: `"${commentData.text}"\n\n❤️ ${commentData.likes} curtidas`,
      metadata: {
        videoId: commentData.videoId,
        username: commentData.username,
        likes: commentData.likes,
      },
      timestamp: new Date(),
      priority: commentData.likes > 10 ? "high" : "medium",
    };

    return this.sendToCommunity(message);
  }

  /**
   * Processar novo lead e enviar para WhatsApp
   */
  async processNewLead(leadData: {
    name: string;
    email: string;
    phone: string;
    source: string;
    score: number;
  }): Promise<any> {
    const message: CommunityMessage = {
      type: "lead",
      platform: "instagram",
      title: `🎯 Novo Lead: ${leadData.name}`,
      content: `📧 ${leadData.email}\n📱 ${leadData.phone}\n🔗 Origem: ${leadData.source}\n⭐ Score: ${leadData.score}/100`,
      metadata: leadData,
      timestamp: new Date(),
      priority: leadData.score > 70 ? "high" : "medium",
    };

    return this.sendToCommunity(message);
  }

  /**
   * Enviar notificação importante para comunidade
   */
  async sendNotification(notificationData: {
    title: string;
    content: string;
    type: "info" | "warning" | "success" | "error";
  }): Promise<any> {
    const icons: Record<string, string> = {
      info: "ℹ️",
      warning: "⚠️",
      success: "✅",
      error: "❌",
    };

    const message: CommunityMessage = {
      type: "notification",
      platform: "telegram",
      title: `${icons[notificationData.type]} ${notificationData.title}`,
      content: notificationData.content,
      metadata: { type: notificationData.type },
      timestamp: new Date(),
      priority: notificationData.type === "error" ? "urgent" : "medium",
    };

    return this.sendToCommunity(message);
  }

  /**
   * Enviar alerta de engajamento alto
   */
  async sendEngagementAlert(engagementData: {
    postTitle: string;
    platform: string;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  }): Promise<any> {
    const message: CommunityMessage = {
      type: "engagement",
      platform: engagementData.platform as any,
      title: `🚀 Post em Alta! ${engagementData.postTitle}`,
      content: `📊 Engajamento: ${engagementData.engagementRate.toFixed(1)}%\n❤️ ${engagementData.likes} curtidas\n💬 ${engagementData.comments} comentários\n🔄 ${engagementData.shares} compartilhamentos`,
      metadata: engagementData,
      timestamp: new Date(),
      priority: engagementData.engagementRate > 10 ? "high" : "medium",
    };

    return this.sendToCommunity(message);
  }

  /**
   * Enviar alerta de milestone (1k, 10k, 100k seguidores)
   */
  async sendMilestoneAlert(milestoneData: {
    platform: string;
    milestone: number;
    currentFollowers: number;
  }): Promise<any> {
    const message: CommunityMessage = {
      type: "milestone",
      platform: milestoneData.platform as any,
      title: `🎉 MARCO ALCANÇADO! ${milestoneData.milestone.toLocaleString()} seguidores!`,
      content: `🎊 Parabéns! Atingimos ${milestoneData.currentFollowers.toLocaleString()} seguidores no ${milestoneData.platform}!\n\nObrigado a todos que fazem parte dessa jornada! 🙏`,
      metadata: milestoneData,
      timestamp: new Date(),
      priority: "urgent",
    };

    return this.sendToCommunity(message);
  }

  /**
   * Enviar relatório diário para comunidade
   */
  async sendDailyReport(reportData: {
    date: Date;
    newFollowers: number;
    newLeads: number;
    engagementRate: number;
    topPost: string;
    topPostEngagement: number;
  }): Promise<any> {
    const message: CommunityMessage = {
      type: "notification",
      platform: "telegram",
      title: `📊 Relatório Diário - ${reportData.date.toLocaleDateString("pt-BR")}`,
      content: `👥 Novos Seguidores: +${reportData.newFollowers}\n🎯 Novos Leads: ${reportData.newLeads}\n📈 Taxa de Engajamento: ${reportData.engagementRate.toFixed(1)}%\n⭐ Top Post: "${reportData.topPost}"\n💪 Engajamento do Top: ${reportData.topPostEngagement.toFixed(1)}%`,
      metadata: reportData,
      timestamp: new Date(),
      priority: "medium",
    };

    return this.sendToCommunity(message);
  }

  /**
   * Enviar template de resposta automática para lead
   */
  async sendLeadResponse(leadPhone: string, leadName: string): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: leadPhone,
        type: "template",
        template: {
          name: "welcome_lead",
          language: {
            code: "pt_BR",
          },
          parameters: {
            body: {
              parameters: [
                {
                  type: "text",
                  text: leadName,
                },
              ],
            },
          },
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

  /**
   * Processar fila de mensagens não enviadas
   */
  async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          await this.sendToCommunity(message);
        } catch (error) {
          console.error("Erro ao processar fila:", error);
          this.messageQueue.push(message);
          break;
        }
      }
    }
  }

  /**
   * Formatar mensagem para WhatsApp
   */
  private formatMessage(message: CommunityMessage): string {
    const priorityEmoji: Record<string, string> = {
      low: "📌",
      medium: "📍",
      high: "🔴",
      urgent: "🚨",
    };

    return `${priorityEmoji[message.priority]} ${message.title}\n\n${message.content}\n\n_${message.timestamp.toLocaleTimeString("pt-BR")}_`;
  }

  /**
   * Obter status da comunidade
   */
  getStatus(): Record<string, any> {
    return {
      communityGroupId: this.communityGroupId,
      communityGroupName: this.communityGroupName,
      queuedMessages: this.messageQueue.length,
      status: this.messageQueue.length > 0 ? "warning" : "ok",
    };
  }
}

/**
 * Integração com todos os sistemas
 */
export class CommunityIntegrationManager {
  private whatsappHub: WhatsAppCommunityHub;

  constructor(whatsappConfig: WhatsAppConfig) {
    this.whatsappHub = new WhatsAppCommunityHub(whatsappConfig);
  }

  /**
   * Rotina de sincronização: Buscar dados de todas as plataformas e enviar para WhatsApp
   */
  async syncAllPlatforms(): Promise<void> {
    // Simular busca de dados
    console.log("Sincronizando todas as plataformas com WhatsApp...");

    // Processar comentários do Instagram
    await this.whatsappHub.processInstagramComment({
      videoId: "123",
      username: "usuario_teste",
      text: "Conteúdo excelente! Muito útil!",
      likes: 15,
    });

    // Processar novo lead
    await this.whatsappHub.processNewLead({
      name: "João Silva",
      email: "joao@email.com",
      phone: "+5511999999999",
      source: "Instagram",
      score: 85,
    });

    // Enviar notificação
    await this.whatsappHub.sendNotification({
      title: "Novo Conteúdo Publicado",
      content: "Post sobre ansiedade foi publicado com sucesso!",
      type: "success",
    });

    // Processar fila de mensagens
    await this.whatsappHub.processMessageQueue();
  }

  getWhatsAppHub(): WhatsAppCommunityHub {
    return this.whatsappHub;
  }
}
