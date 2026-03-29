/**
 * Serviço de cache offline para respostas do Assistente Carro
 * Permite funcionar sem conexão, sincronizando quando online
 */

interface CachedResponse {
  question: string;
  answer: string;
  timestamp: number;
  synced: boolean;
}

const CACHE_KEY = "carAssistant_responseCache";
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

export class OfflineCacheService {
  /**
   * Salvar resposta no cache local
   */
  static saveResponse(question: string, answer: string): void {
    try {
      const cache = this.getCache();
      
      const response: CachedResponse = {
        question,
        answer,
        timestamp: Date.now(),
        synced: false,
      };

      cache.push(response);

      // Limitar tamanho do cache
      if (cache.length > MAX_CACHE_SIZE) {
        cache.shift(); // Remove o mais antigo
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Erro ao salvar no cache:", error);
    }
  }

  /**
   * Buscar resposta no cache
   */
  static getResponse(question: string): CachedResponse | null {
    try {
      const cache = this.getCache();
      const normalized = question.toLowerCase().trim();

      // Buscar por similaridade (primeiras 50 caracteres)
      const cached = cache.find((item) => {
        const itemNormalized = item.question.toLowerCase().trim();
        return (
          itemNormalized === normalized ||
          itemNormalized.substring(0, 50) === normalized.substring(0, 50)
        );
      });

      return cached || null;
    } catch (error) {
      console.error("Erro ao buscar no cache:", error);
      return null;
    }
  }

  /**
   * Obter todo o cache
   */
  static getCache(): CachedResponse[] {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return [];

      const cache = JSON.parse(cached) as CachedResponse[];

      // Limpar itens expirados
      const now = Date.now();
      return cache.filter((item) => now - item.timestamp < CACHE_TTL);
    } catch (error) {
      console.error("Erro ao obter cache:", error);
      return [];
    }
  }

  /**
   * Limpar cache
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
    }
  }

  /**
   * Marcar respostas como sincronizadas
   */
  static markAsSynced(question: string): void {
    try {
      const cache = this.getCache();
      const item = cache.find(
        (item) =>
          item.question.toLowerCase().trim() ===
          question.toLowerCase().trim()
      );

      if (item) {
        item.synced = true;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.error("Erro ao marcar como sincronizado:", error);
    }
  }

  /**
   * Obter respostas não sincronizadas
   */
  static getUnsyncedResponses(): CachedResponse[] {
    try {
      const cache = this.getCache();
      return cache.filter((item) => !item.synced);
    } catch (error) {
      console.error("Erro ao obter respostas não sincronizadas:", error);
      return [];
    }
  }

  /**
   * Verificar se está online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Obter estatísticas do cache
   */
  static getStats() {
    const cache = this.getCache();
    return {
      totalItems: cache.length,
      syncedItems: cache.filter((item) => item.synced).length,
      unsyncedItems: cache.filter((item) => !item.synced).length,
      cacheSize: new Blob([JSON.stringify(cache)]).size,
      isOnline: this.isOnline(),
    };
  }
}
