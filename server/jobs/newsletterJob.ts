/**
 * Job de Newsletter Automática
 * Envia newsletter no primeiro dia de cada mês às 9h da manhã
 */

import cron from "node-cron";
import { generateNewsletterTemplate, generateNewsletterHTML, generateNewsletterText } from "../newsletterService";

interface NewsletterJobConfig {
  enabled: boolean;
  cronExpression: string; // Padrão: "0 9 1 * *" (1º dia do mês às 9h)
  maxRetries: number;
  retryDelay: number; // em ms
}

interface NewsletterJobLog {
  id: string;
  timestamp: Date;
  status: "pending" | "sending" | "success" | "failed";
  totalSubscribers: number;
  successCount: number;
  failureCount: number;
  error?: string;
  duration: number; // em ms
}

class NewsletterJob {
  private config: NewsletterJobConfig;
  private task?: cron.ScheduledTask;
  private logs: NewsletterJobLog[] = [];
  private isRunning = false;

  constructor(config: Partial<NewsletterJobConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      cronExpression: config.cronExpression ?? "0 9 1 * *", // 1º dia do mês às 9h
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 5000, // 5 segundos
    };
  }

  /**
   * Inicia o job de newsletter
   */
  start(): void {
    if (!this.config.enabled) {
      console.log("[Newsletter Job] Desativado");
      return;
    }

    if (this.task) {
      console.log("[Newsletter Job] Já está em execução");
      return;
    }

    this.task = cron.schedule(this.config.cronExpression, async () => {
      await this.execute();
    });

    console.log(`[Newsletter Job] Iniciado com expressão: ${this.config.cronExpression}`);
  }

  /**
   * Para o job de newsletter
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = undefined;
      console.log("[Newsletter Job] Parado");
    }
  }

  /**
   * Executa o job de newsletter
   */
  private async execute(): Promise<void> {
    if (this.isRunning) {
      console.log("[Newsletter Job] Já está em execução, ignorando");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    const logEntry: NewsletterJobLog = {
      id: `newsletter-${Date.now()}`,
      timestamp: new Date(),
      status: "pending",
      totalSubscribers: 0,
      successCount: 0,
      failureCount: 0,
      duration: 0,
    };

    try {
      console.log("[Newsletter Job] Iniciando envio de newsletter");
      logEntry.status = "sending";

      // Aqui você conectaria ao banco de dados
      // const db = getDb();
      // const posts = await db.select().from(blogPost).where(eq(blogPost.published, true)).orderBy(desc(blogPost.createdAt)).limit(5);
      // const subscribers = await db.select().from(waitlist).where(eq(waitlist.status, 'active'));

      // Simulação
      const posts = [];
      const subscribers = [];

      logEntry.totalSubscribers = subscribers.length;

      if (posts.length === 0) {
        console.log("[Newsletter Job] Nenhum post para enviar");
        logEntry.status = "success";
        logEntry.duration = Date.now() - startTime;
        this.logs.push(logEntry);
        this.isRunning = false;
        return;
      }

      // Gerar template
      const template = generateNewsletterTemplate(posts);
      const html = generateNewsletterHTML(template);
      const text = generateNewsletterText(template);

      // Enviar para cada inscrito
      for (const subscriber of subscribers) {
        try {
          // Aqui você conectaria ao emailService
          // await emailService.send({
          //   to: subscriber.email,
          //   subject: template.subject,
          //   html,
          //   text
          // });

          logEntry.successCount++;
          console.log(`[Newsletter Job] Email enviado para ${subscriber.email}`);
        } catch (error) {
          logEntry.failureCount++;
          console.error(`[Newsletter Job] Erro ao enviar para ${subscriber.email}:`, error);

          // Retry
          for (let i = 0; i < this.config.maxRetries; i++) {
            try {
              await this.delay(this.config.retryDelay);
              // await emailService.send({...});
              logEntry.successCount++;
              logEntry.failureCount--;
              console.log(`[Newsletter Job] Email reenviado com sucesso para ${subscriber.email}`);
              break;
            } catch (retryError) {
              if (i === this.config.maxRetries - 1) {
                console.error(
                  `[Newsletter Job] Falha final ao enviar para ${subscriber.email}:`,
                  retryError
                );
              }
            }
          }
        }
      }

      logEntry.status = "success";
      console.log(
        `[Newsletter Job] Concluído: ${logEntry.successCount}/${logEntry.totalSubscribers} enviados`
      );
    } catch (error) {
      logEntry.status = "failed";
      logEntry.error = error instanceof Error ? error.message : String(error);
      console.error("[Newsletter Job] Erro durante execução:", error);
    } finally {
      logEntry.duration = Date.now() - startTime;
      this.logs.push(logEntry);

      // Manter apenas os últimos 100 logs
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(-100);
      }

      this.isRunning = false;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obter logs
   */
  getLogs(limit: number = 10): NewsletterJobLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Obter status
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      running: this.isRunning,
      cronExpression: this.config.cronExpression,
      lastLog: this.logs[this.logs.length - 1] || null,
      totalLogs: this.logs.length,
    };
  }

  /**
   * Executar manualmente
   */
  async runNow(): Promise<void> {
    console.log("[Newsletter Job] Executando manualmente");
    await this.execute();
  }

  /**
   * Atualizar configuração
   */
  updateConfig(config: Partial<NewsletterJobConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("[Newsletter Job] Configuração atualizada:", this.config);

    // Reiniciar se mudou a expressão cron
    if (config.cronExpression) {
      this.stop();
      this.start();
    }
  }

  /**
   * Limpar logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log("[Newsletter Job] Logs limpos");
  }
}

// Instância global
let newsletterJob: NewsletterJob | null = null;

/**
 * Inicializar job de newsletter
 */
export function initializeNewsletterJob(config?: Partial<NewsletterJobConfig>): NewsletterJob {
  if (!newsletterJob) {
    newsletterJob = new NewsletterJob(config);
    newsletterJob.start();
  }
  return newsletterJob;
}

/**
 * Obter instância do job
 */
export function getNewsletterJob(): NewsletterJob {
  if (!newsletterJob) {
    newsletterJob = new NewsletterJob();
    newsletterJob.start();
  }
  return newsletterJob;
}

/**
 * Parar job de newsletter
 */
export function stopNewsletterJob(): void {
  if (newsletterJob) {
    newsletterJob.stop();
    newsletterJob = null;
  }
}

export { NewsletterJob, NewsletterJobLog, NewsletterJobConfig };
