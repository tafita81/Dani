/**
 * Sistema de Cache de Respostas
 * Cacheia respostas frequentes para melhorar performance
 * Usa Memory (não requer Redis)
 */

interface CacheEntry {
  question: string;
  answer: string;
  dataSource: string;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 3600000; // 1 hora em ms
  private readonly MAX_CACHE_SIZE = 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Limpar cache expirado a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Gerar chave de cache normalizada
   */
  private generateKey(question: string): string {
    return question
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .substring(0, 200);
  }

  /**
   * Obter resposta do cache
   */
  get(question: string): CacheEntry | null {
    const key = this.generateKey(question);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Incrementar contador de hits
    entry.hitCount++;
    return entry;
  }

  /**
   * Salvar resposta no cache
   */
  set(
    question: string,
    answer: string,
    dataSource: string,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const key = this.generateKey(question);

    // Se cache está cheio, remover entrada menos usada
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      question,
      answer,
      dataSource,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      hitCount: 0,
    };

    this.cache.set(key, entry);
  }

  /**
   * Limpar cache expirado
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: ${expiredKeys.length} entradas removidas`);
    }
  }

  /**
   * Remover entrada menos usada (LRU)
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let minHits = Infinity;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.hitCount < minHits || (entry.hitCount === minHits && entry.timestamp < oldestTime)) {
        lruKey = key;
        minHits = entry.hitCount;
        oldestTime = entry.timestamp;
      }
    });

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`Cache eviction: entrada removida (hits: ${minHits})`);
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      question: string;
      hitCount: number;
      age: number;
    }>;
  } {
    const allEntries: CacheEntry[] = [];
    this.cache.forEach((entry) => {
      allEntries.push(entry);
    });

    const entries = allEntries
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10)
      .map((entry) => ({
        question: entry.question.substring(0, 50),
        hitCount: entry.hitCount,
        age: Date.now() - entry.timestamp,
      }));

    let totalHits = 0;
    this.cache.forEach((entry) => {
      totalHits += entry.hitCount;
    });

    const totalQueries = this.cache.size + totalHits;
    const hitRate = totalQueries > 0 ? (totalHits / totalQueries) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: Math.round(hitRate * 100) / 100,
      entries,
    };
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
    console.log("Cache limpo completamente");
  }

  /**
   * Destruir cache e parar limpeza automática
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Instância global do cache
export const responseCache = new ResponseCache();

/**
 * Middleware para cachear respostas de procedures
 */
export function withCache<T extends { question: string; answer: string; dataSource: string }>(
  ttl: number = 3600000
) {
  return (result: T): T => {
    responseCache.set(result.question, result.answer, result.dataSource, ttl);
    return result;
  };
}

/**
 * Obter resposta do cache ou null
 */
export function getCachedResponse(question: string): CacheEntry | null {
  return responseCache.get(question);
}

/**
 * Salvar resposta no cache
 */
export function cacheResponse(
  question: string,
  answer: string,
  dataSource: string,
  ttl?: number
): void {
  responseCache.set(question, answer, dataSource, ttl);
}

/**
 * Obter estatísticas do cache
 */
export function getCacheStats() {
  return responseCache.getStats();
}
