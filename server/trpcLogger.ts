/**
 * Sistema de logging detalhado para requisições tRPC
 * Rastreia todas as chamadas, tempo de resposta, erros e dados
 */

interface TRPCLogEntry {
  timestamp: Date;
  procedure: string;
  input: any;
  output?: any;
  error?: string;
  duration: number;
  status: "success" | "error";
}

class TRPCLogger {
  private logs: TRPCLogEntry[] = [];
  private maxLogs = 1000;

  /**
   * Registrar uma chamada tRPC bem-sucedida
   */
  logSuccess(procedure: string, input: any, output: any, duration: number) {
    const entry: TRPCLogEntry = {
      timestamp: new Date(),
      procedure,
      input,
      output,
      duration,
      status: "success",
    };

    this.addLog(entry);
    console.log(`[tRPC] ✓ ${procedure} (${duration}ms)`, { input, output });
  }

  /**
   * Registrar um erro em chamada tRPC
   */
  logError(procedure: string, input: any, error: Error, duration: number) {
    const entry: TRPCLogEntry = {
      timestamp: new Date(),
      procedure,
      input,
      error: error.message,
      duration,
      status: "error",
    };

    this.addLog(entry);
    console.error(`[tRPC] ✗ ${procedure} (${duration}ms)`, {
      input,
      error: error.message,
    });
  }

  /**
   * Adicionar entrada ao log (com limite de tamanho)
   */
  private addLog(entry: TRPCLogEntry) {
    this.logs.push(entry);

    // Manter apenas os últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Obter todos os logs
   */
  getLogs(): TRPCLogEntry[] {
    return [...this.logs];
  }

  /**
   * Obter logs de uma procedure específica
   */
  getLogsForProcedure(procedure: string): TRPCLogEntry[] {
    return this.logs.filter((log) => log.procedure === procedure);
  }

  /**
   * Obter logs de erros
   */
  getErrorLogs(): TRPCLogEntry[] {
    return this.logs.filter((log) => log.status === "error");
  }

  /**
   * Obter estatísticas de performance
   */
  getStats(procedure?: string) {
    const relevantLogs = procedure
      ? this.getLogsForProcedure(procedure)
      : this.logs;

    if (relevantLogs.length === 0) {
      return null;
    }

    const durations = relevantLogs.map((log) => log.duration);
    const avgDuration =
      durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    const errorCount = relevantLogs.filter(
      (log) => log.status === "error"
    ).length;

    return {
      totalCalls: relevantLogs.length,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      errorCount,
      errorRate: ((errorCount / relevantLogs.length) * 100).toFixed(2) + "%",
    };
  }

  /**
   * Limpar logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Exportar logs como JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância global
export const trpcLogger = new TRPCLogger();

/**
 * Middleware para logging automático de requisições tRPC
 */
export function createLoggingMiddleware() {
  return async (opts: any) => {
    const startTime = Date.now();
    const { path, type, input } = opts;

    try {
      const result = await opts.next();
      const duration = Date.now() - startTime;

      trpcLogger.logSuccess(path, input, result, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      trpcLogger.logError(
        path,
        input,
        error instanceof Error ? error : new Error(String(error)),
        duration
      );

      throw error;
    }
  };
}
