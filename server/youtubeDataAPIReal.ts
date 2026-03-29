import axios, { AxiosInstance } from "axios";

export interface YouTubeCredentials {
  apiKey: string;
  channelId: string;
  refreshToken?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: Date;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  thumbnailUrl: string;
}

export interface YouTubeChannelMetrics {
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  engagementRate: number;
  averageViewDuration: number;
}

export interface YouTubeComment {
  id: string;
  authorName: string;
  text: string;
  likes: number;
  publishedAt: Date;
  replyCount: number;
}

export class YouTubeDataAPIClient {
  private client: AxiosInstance;
  private credentials: YouTubeCredentials;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor(credentials: YouTubeCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: this.baseUrl,
      params: {
        key: credentials.apiKey,
      },
    });
  }

  /**
   * Buscar informações do canal
   */
  async getChannelInfo(): Promise<YouTubeChannelMetrics> {
    try {
      const response = await this.client.get("/channels", {
        params: {
          part: "statistics,contentDetails",
          id: this.credentials.channelId,
        },
      });

      const stats = response.data.items[0].statistics;
      return {
        subscribers: parseInt(stats.subscriberCount || "0"),
        totalViews: parseInt(stats.viewCount || "0"),
        totalVideos: parseInt(stats.videoCount || "0"),
        engagementRate: 0, // Calcular baseado em dados
        averageViewDuration: 0, // Requer YouTube Analytics API
      };
    } catch (error) {
      console.error("Erro ao buscar informações do canal:", error);
      throw error;
    }
  }

  /**
   * Buscar vídeos recentes
   */
  async getRecentVideos(limit = 10): Promise<YouTubeVideo[]> {
    try {
      // Primeiro, buscar IDs dos vídeos recentes
      const searchResponse = await this.client.get("/search", {
        params: {
          part: "id",
          channelId: this.credentials.channelId,
          order: "date",
          maxResults: limit,
          type: "video",
        },
      });

      const videoIds = searchResponse.data.items
        .map((item: any) => item.id.videoId)
        .join(",");

      // Depois, buscar detalhes dos vídeos
      const videosResponse = await this.client.get("/videos", {
        params: {
          part: "snippet,statistics,contentDetails",
          id: videoIds,
        },
      });

      return videosResponse.data.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: new Date(video.snippet.publishedAt),
        views: parseInt(video.statistics.viewCount || "0"),
        likes: parseInt(video.statistics.likeCount || "0"),
        comments: parseInt(video.statistics.commentCount || "0"),
        duration: video.contentDetails.duration,
        thumbnailUrl: video.snippet.thumbnails.high.url,
      }));
    } catch (error) {
      console.error("Erro ao buscar vídeos recentes:", error);
      throw error;
    }
  }

  /**
   * Buscar comentários de um vídeo
   */
  async getVideoComments(videoId: string, limit = 20): Promise<YouTubeComment[]> {
    try {
      const response = await this.client.get("/commentThreads", {
        params: {
          part: "snippet",
          videoId: videoId,
          maxResults: limit,
          textFormat: "plainText",
          order: "relevance",
        },
      });

      return response.data.items.map((thread: any) => {
        const comment = thread.snippet.topLevelComment.snippet;
        return {
          id: thread.id,
          authorName: comment.authorDisplayName,
          text: comment.textDisplay,
          likes: comment.likeCount,
          publishedAt: new Date(comment.publishedAt),
          replyCount: thread.snippet.totalReplyCount,
        };
      });
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      throw error;
    }
  }

  /**
   * Responder comentário
   */
  async replyToComment(
    parentId: string,
    message: string
  ): Promise<{ id: string; status: string }> {
    try {
      const response = await this.client.post("/comments", {
        part: "snippet",
        requestBody: {
          snippet: {
            parentId: parentId,
            textOriginal: message,
          },
        },
      });

      return {
        id: response.data.id,
        status: "posted",
      };
    } catch (error) {
      console.error("Erro ao responder comentário:", error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas de vídeo específico
   */
  async getVideoStats(videoId: string): Promise<Record<string, number>> {
    try {
      const response = await this.client.get("/videos", {
        params: {
          part: "statistics",
          id: videoId,
        },
      });

      const stats = response.data.items[0].statistics;
      return {
        views: parseInt(stats.viewCount || "0"),
        likes: parseInt(stats.likeCount || "0"),
        comments: parseInt(stats.commentCount || "0"),
        favorites: parseInt(stats.favoriteCount || "0"),
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas do vídeo:", error);
      throw error;
    }
  }

  /**
   * Validar credenciais
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.client.get("/channels", {
        params: {
          part: "id",
          id: this.credentials.channelId,
        },
      });

      return response.data.items.length > 0;
    } catch (error) {
      console.error("Credenciais inválidas:", error);
      return false;
    }
  }

  /**
   * Buscar trending videos
   */
  async getTrendingVideos(regionCode = "BR", limit = 10): Promise<YouTubeVideo[]> {
    try {
      const response = await this.client.get("/videos", {
        params: {
          part: "snippet,statistics",
          chart: "mostPopular",
          regionCode: regionCode,
          maxResults: limit,
          videoCategoryId: "27", // Educação
        },
      });

      return response.data.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: new Date(video.snippet.publishedAt),
        views: parseInt(video.statistics.viewCount || "0"),
        likes: parseInt(video.statistics.likeCount || "0"),
        comments: parseInt(video.statistics.commentCount || "0"),
        duration: "",
        thumbnailUrl: video.snippet.thumbnails.high.url,
      }));
    } catch (error) {
      console.error("Erro ao buscar vídeos em trending:", error);
      throw error;
    }
  }

  /**
   * Buscar playlists do canal
   */
  async getChannelPlaylists(limit = 10): Promise<Array<{ id: string; title: string }>> {
    try {
      const response = await this.client.get("/playlists", {
        params: {
          part: "snippet",
          channelId: this.credentials.channelId,
          maxResults: limit,
        },
      });

      return response.data.items.map((playlist: any) => ({
        id: playlist.id,
        title: playlist.snippet.title,
      }));
    } catch (error) {
      console.error("Erro ao buscar playlists:", error);
      throw error;
    }
  }
}

/**
 * Factory para criar cliente YouTube
 */
export function createYouTubeClient(
  credentials: YouTubeCredentials
): YouTubeDataAPIClient {
  return new YouTubeDataAPIClient(credentials);
}
