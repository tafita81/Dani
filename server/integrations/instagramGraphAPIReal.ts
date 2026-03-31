import axios, { AxiosInstance } from "axios";

export interface InstagramCredentials {
  accessToken: string;
  businessAccountId: string;
  pageId?: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL";
  mediaUrl: string;
  timestamp: Date;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: Date;
  likes: number;
  replies: number;
}

export interface InstagramMetrics {
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
  profileViews: number;
  websiteClicks: number;
}

export class InstagramGraphAPIClient {
  private client: AxiosInstance;
  private credentials: InstagramCredentials;
  private baseUrl = "https://graph.instagram.com/v18.0";

  constructor(credentials: InstagramCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: this.baseUrl,
      params: {
        access_token: credentials.accessToken,
      },
    });
  }

  /**
   * Publicar imagem no Instagram
   */
  async publishImage(
    caption: string,
    imageUrl: string
  ): Promise<{ id: string; status: string }> {
    try {
      const response = await this.client.post(
        `/${this.credentials.businessAccountId}/media`,
        {
          image_url: imageUrl,
          caption: caption,
          media_type: "IMAGE",
        }
      );

      // Publicar o media criado
      await this.client.post(
        `/${this.credentials.businessAccountId}/media_publish`,
        {
          creation_id: response.data.id,
        }
      );

      return {
        id: response.data.id,
        status: "published",
      };
    } catch (error) {
      console.error("Erro ao publicar imagem no Instagram:", error);
      throw error;
    }
  }

  /**
   * Publicar vídeo no Instagram
   */
  async publishVideo(
    caption: string,
    videoUrl: string,
    thumbnailUrl?: string
  ): Promise<{ id: string; status: string }> {
    try {
      const response = await this.client.post(
        `/${this.credentials.businessAccountId}/media`,
        {
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          caption: caption,
          media_type: "VIDEO",
        }
      );

      // Publicar o media criado
      await this.client.post(
        `/${this.credentials.businessAccountId}/media_publish`,
        {
          creation_id: response.data.id,
        }
      );

      return {
        id: response.data.id,
        status: "published",
      };
    } catch (error) {
      console.error("Erro ao publicar vídeo no Instagram:", error);
      throw error;
    }
  }

  /**
   * Buscar comentários recentes
   */
  async getRecentComments(limit = 25): Promise<InstagramComment[]> {
    try {
      const response = await this.client.get(
        `/${this.credentials.businessAccountId}/comments`,
        {
          params: {
            fields:
              "id,text,username,timestamp,like_count,replies_count",
            limit: limit,
          },
        }
      );

      return response.data.data.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        username: comment.username,
        timestamp: new Date(comment.timestamp),
        likes: comment.like_count || 0,
        replies: comment.replies_count || 0,
      }));
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      throw error;
    }
  }

  /**
   * Responder comentário
   */
  async replyToComment(
    commentId: string,
    message: string
  ): Promise<{ id: string; status: string }> {
    try {
      const response = await this.client.post(`/${commentId}/replies`, {
        message: message,
      });

      return {
        id: response.data.id,
        status: "sent",
      };
    } catch (error) {
      console.error("Erro ao responder comentário:", error);
      throw error;
    }
  }

  /**
   * Buscar métricas de negócio
   */
  async getBusinessMetrics(): Promise<InstagramMetrics> {
    try {
      const response = await this.client.get(
        `/${this.credentials.businessAccountId}`,
        {
          params: {
            fields:
              "followers_count,engagement_rate,reach,impressions,profile_views,website_clicks",
          },
        }
      );

      const data = response.data;
      return {
        followers: data.followers_count || 0,
        engagement: data.engagement_rate || 0,
        reach: data.reach || 0,
        impressions: data.impressions || 0,
        profileViews: data.profile_views || 0,
        websiteClicks: data.website_clicks || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
      throw error;
    }
  }

  /**
   * Buscar posts recentes
   */
  async getRecentPosts(limit = 10): Promise<InstagramPost[]> {
    try {
      const response = await this.client.get(
        `/${this.credentials.businessAccountId}/media`,
        {
          params: {
            fields:
              "id,caption,media_type,media_url,timestamp,like_count,comments_count,reach,impressions",
            limit: limit,
          },
        }
      );

      return response.data.data.map((post: any) => ({
        id: post.id,
        caption: post.caption || "",
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        timestamp: new Date(post.timestamp),
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        reach: post.reach || 0,
        impressions: post.impressions || 0,
      }));
    } catch (error) {
      console.error("Erro ao buscar posts recentes:", error);
      throw error;
    }
  }

  /**
   * Agendar publicação
   */
  async schedulePost(
    caption: string,
    mediaUrl: string,
    mediaType: "IMAGE" | "VIDEO",
    scheduledTime: Date
  ): Promise<{ id: string; status: string }> {
    try {
      const response = await this.client.post(
        `/${this.credentials.businessAccountId}/media`,
        {
          image_url: mediaType === "IMAGE" ? mediaUrl : undefined,
          video_url: mediaType === "VIDEO" ? mediaUrl : undefined,
          caption: caption,
          media_type: mediaType,
          scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000),
        }
      );

      return {
        id: response.data.id,
        status: "scheduled",
      };
    } catch (error) {
      console.error("Erro ao agendar publicação:", error);
      throw error;
    }
  }

  /**
   * Validar credenciais
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.client.get(
        `/${this.credentials.businessAccountId}`,
        {
          params: {
            fields: "id,username",
          },
        }
      );

      return !!response.data.id;
    } catch (error) {
      console.error("Credenciais inválidas:", error);
      return false;
    }
  }

  /**
   * Buscar insights detalhados
   */
  async getDetailedInsights(): Promise<Record<string, any>> {
    try {
      const response = await this.client.get(
        `/${this.credentials.businessAccountId}/insights`,
        {
          params: {
            metric:
              "impressions,reach,profile_views,website_clicks,follower_count,get_directions_clicks,phone_clicks,text_message_clicks,email_clicks",
            period: "day",
          },
        }
      );

      return response.data.data.reduce(
        (acc: any, item: any) => {
          acc[item.name] = item.values[0]?.value || 0;
          return acc;
        },
        {}
      );
    } catch (error) {
      console.error("Erro ao buscar insights:", error);
      throw error;
    }
  }
}

/**
 * Factory para criar cliente Instagram
 */
export function createInstagramClient(
  credentials: InstagramCredentials
): InstagramGraphAPIClient {
  return new InstagramGraphAPIClient(credentials);
}
