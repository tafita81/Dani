/**
 * Newsletter Job com Segmentação
 * Envia newsletters personalizadas para segmentos específicos
 * Agendado para o 1º dia de cada mês às 9h
 */

import cron from "node-cron";
import { getSegmentationService } from "../segmentationService";
import { getEmailTrackingService } from "../emailTrackingService";
import { emailService } from "../services/emailService";
import { getDb } from "../core_logic/db";

interface NewsletterConfig {
  segmentId: string;
  subject: string;
  content: string;
  fromName: string;
  fromEmail: string;
  trackingEnabled: boolean;
}

class NewsletterJobWithSegmentation {
  private segmentationService = getSegmentationService();
  private trackingService = getEmailTrackingService();
  private isRunning = false;
  private lastRunTime: Date | null = null;
  private successCount = 0;
  private failureCount = 0;

  /**
   * Iniciar job de newsletter
   * Agendado para 1º dia do mês às 9h
   */
  start(): void {
    // Cron: 0 9 1 * * (9h do 1º dia de cada mês)
    cron.schedule("0 9 1 * *", () => {
      console.log("[Newsletter Job] Iniciando envio de newsletters...");
      this.sendMonthlyNewsletter();
    });

    console.log("[Newsletter Job] Job agendado para 1º dia do mês às 9h");
  }

  /**
   * Enviar newsletter mensal
   */
  async sendMonthlyNewsletter(): Promise<void> {
    if (this.isRunning) {
      console.warn("[Newsletter Job] Job já está em execução");
      return;
    }

    this.isRunning = true;
    this.lastRunTime = new Date();
    this.successCount = 0;
    this.failureCount = 0;

    try {
      console.log("[Newsletter Job] Iniciando envio de newsletters segmentadas");

      // Obter todos os segmentos
      const segments = this.segmentationService.listSegments();

      if (segments.length === 0) {
        console.warn("[Newsletter Job] Nenhum segmento encontrado");
        this.isRunning = false;
        return;
      }

      // Enviar newsletter para cada segmento
      for (const segment of segments) {
        await this.sendNewsletterToSegment(segment.id);
      }

      console.log(
        `[Newsletter Job] Envio concluído. Sucesso: ${this.successCount}, Falhas: ${this.failureCount}`
      );

      // Gerar relatório
      await this.generateReport();
    } catch (error) {
      console.error("[Newsletter Job] Erro ao enviar newsletters:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Enviar newsletter para um segmento específico
   */
  async sendNewsletterToSegment(segmentId: string): Promise<void> {
    try {
      const subscribers = this.segmentationService.getSegmentSubscribers(segmentId);

      if (subscribers.length === 0) {
        console.log(`[Newsletter Job] Segmento ${segmentId} vazio`);
        return;
      }

      console.log(`[Newsletter Job] Enviando para ${subscribers.length} inscritos do segmento ${segmentId}`);

      // Preparar conteúdo do email
      const emailContent = this.prepareEmailContent(segmentId, subscribers);

      // Enviar para cada inscrito
      for (const subscriber of subscribers) {
        try {
          await this.sendEmailToSubscriber(subscriber, emailContent, segmentId);
          this.successCount++;
        } catch (error) {
          console.error(
            `[Newsletter Job] Erro ao enviar para ${subscriber.email}:`,
            error
          );
          this.failureCount++;
        }
      }
    } catch (error) {
      console.error(`[Newsletter Job] Erro ao processar segmento ${segmentId}:`, error);
    }
  }

  /**
   * Enviar email para um inscrito
   */
  async sendEmailToSubscriber(subscriber: any, emailContent: string, segmentId: string): Promise<void> {
    const emailId = `newsletter-${Date.now()}-${subscriber.id}`;

    // Gerar links rastreáveis
    let trackedContent = emailContent;

    if (true) {
      // Gerar pixel de rastreamento
      const pixelUrl = this.trackingService.generateTrackingPixel(emailId, subscriber.id);

      // Adicionar pixel ao final do email
      trackedContent += `<img src="${pixelUrl}" width="1" height="1" style="display:none;" />`;

      // Substituir links por links rastreáveis
      trackedContent = trackedContent.replace(/href="([^"]+)"/g, (match, url) => {
        const trackableUrl = this.trackingService.generateTrackableLink(emailId, subscriber.id, url);
        return `href="${trackableUrl}"`;
      });
    }

    // Enviar email
    await emailService.send({
      to: subscriber.email,
      subject: `Newsletter - ${new Date().toLocaleDateString("pt-BR")}`,
      html: trackedContent,
      metadata: {
        emailId,
        subscriberId: subscriber.id,
        segmentId,
        type: "newsletter",
      },
    });

    console.log(`[Newsletter Job] Email enviado para ${subscriber.email}`);
  }

  /**
   * Preparar conteúdo do email
   */
  private prepareEmailContent(segmentId: string, subscribers: any[]): string {
    const segment = this.segmentationService.listSegments().find((s) => s.id === segmentId);
    const avgEngagement =
      subscribers.reduce((sum, s) => sum + s.engagementScore, 0) / subscribers.length || 0;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a90e2; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px 0; }
            .footer { color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            .cta { background-color: #4a90e2; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Assistente Clínico</h1>
              <p>Newsletter ${new Date().toLocaleDateString("pt-BR")}</p>
            </div>

            <div class="content">
              <h2>Olá!</h2>
              <p>Bem-vindo à nossa newsletter de ${new Date().toLocaleDateString("pt-BR", { month: "long" })}.</p>

              <h3>Segmento: ${segment?.name || "Geral"}</h3>
              <p>Esta newsletter foi personalizada para você com base em seus interesses e engajamento.</p>

              <h3>Conteúdo Destacado</h3>
              <ul>
                <li><a href="https://example.com/article1" class="cta">Artigo 1: Psicologia Clínica</a></li>
                <li><a href="https://example.com/article2" class="cta">Artigo 2: Terapia do Esquema</a></li>
                <li><a href="https://example.com/article3" class="cta">Artigo 3: Gestalt-terapia</a></li>
              </ul>

              <h3>Estatísticas do Segmento</h3>
              <p>
                <strong>Inscritos:</strong> ${subscribers.length}<br>
                <strong>Engajamento Médio:</strong> ${avgEngagement.toFixed(1)}/100<br>
                <strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}
              </p>

              <p>
                <a href="https://example.com/unsubscribe?email={{email}}" style="color: #999; font-size: 12px;">
                  Desinscrever
                </a>
              </p>
            </div>

            <div class="footer">
              <p>© 2026 Assistente Clínico. Todos os direitos reservados.</p>
              <p>
                <a href="https://example.com/privacy" style="color: #999;">Política de Privacidade</a> |
                <a href="https://example.com/terms" style="color: #999;">Termos de Uso</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Gerar relatório de envio
   */
  async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date(),
      totalSent: this.successCount,
      totalFailed: this.failureCount,
      successRate: ((this.successCount / (this.successCount + this.failureCount)) * 100).toFixed(2),
      segments: this.segmentationService.listSegments().length,
    };

    console.log("[Newsletter Job] Relatório de Envio:");
    console.log(JSON.stringify(report, null, 2));

    // TODO: Salvar relatório no banco de dados
    // await db.insert(newsletterReports).values(report);
  }

  /**
   * Obter status do job
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      successCount: this.successCount,
      failureCount: this.failureCount,
      totalProcessed: this.successCount + this.failureCount,
    };
  }

  /**
   * Executar newsletter manualmente (para testes)
   */
  async runManually(): Promise<void> {
    console.log("[Newsletter Job] Executando manualmente...");
    await this.sendMonthlyNewsletter();
  }

  /**
   * Parar job
   */
  stop(): void {
    console.log("[Newsletter Job] Job parado");
    // Nota: cron.stop() não é suportado, então apenas marcamos como parado
  }
}

// Instância global
let newsletterJob: NewsletterJobWithSegmentation | null = null;

/**
 * Obter instância do job de newsletter
 */
export function getNewsletterJob(): NewsletterJobWithSegmentation {
  if (!newsletterJob) {
    newsletterJob = new NewsletterJobWithSegmentation();
  }
  return newsletterJob;
}

/**
 * Iniciar job na inicialização do servidor
 */
export function initializeNewsletterJob(): void {
  const job = getNewsletterJob();
  job.start();
}

export { NewsletterJobWithSegmentation };
