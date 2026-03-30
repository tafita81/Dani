/**
 * Serviço de Newsletter Automática
 * Envia novos posts do blog para inscritos da waitlist
 */

interface NewsletterEmail {
  id: string;
  email: string;
  name: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  status: "subscribed" | "unsubscribed";
  lastEmailSentAt?: Date;
  openCount: number;
  clickCount: number;
}

interface NewsletterPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  featuredImage?: string;
  readingTime: number;
}

interface NewsletterTemplate {
  subject: string;
  previewText: string;
  posts: NewsletterPost[];
  sendDate: Date;
  senderId: string;
}

/**
 * Gera template de email para newsletter
 */
export function generateNewsletterTemplate(
  posts: NewsletterPost[]
): NewsletterTemplate {
  const now = new Date();
  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(now);
  const year = now.getFullYear();

  return {
    subject: `📚 Newsletter ${monthName} ${year} - Novos artigos no blog`,
    previewText: `Confira ${posts.length} novos artigos sobre psicologia clínica`,
    posts: posts.slice(0, 5), // Máximo 5 posts por newsletter
    sendDate: now,
    senderId: "newsletter@assistente-clinico.com",
  };
}

/**
 * Gera HTML do email da newsletter
 */
export function generateNewsletterHTML(template: NewsletterTemplate): string {
  const postsHTML = template.posts
    .map(
      (post) => `
    <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">
        <a href="https://assistente-clinico.com/blog/${post.slug}" style="color: #0066cc; text-decoration: none;">
          ${post.title}
        </a>
      </h3>
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        <span style="background: #f0f0f0; padding: 2px 8px; border-radius: 3px; margin-right: 10px;">
          ${post.category}
        </span>
        <span style="color: #999;">⏱️ ${post.readingTime} min de leitura</span>
      </p>
      <p style="margin: 0 0 15px 0; color: #555; line-height: 1.6;">
        ${post.excerpt}
      </p>
      <a href="https://assistente-clinico.com/blog/${post.slug}" style="color: #0066cc; text-decoration: none; font-weight: bold;">
        Ler artigo completo →
      </a>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #0066cc; font-size: 24px;">
            📚 Newsletter do Blog
          </h1>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">
            Conteúdo educativo sobre psicologia clínica
          </p>
        </div>

        <!-- Introdução -->
        <p style="margin: 0 0 20px 0; color: #555;">
          Olá! 👋
        </p>
        <p style="margin: 0 0 20px 0; color: #555; line-height: 1.8;">
          Preparamos uma seleção especial de artigos para você este mês. Confira as novidades sobre TCC, Terapia do Esquema, Gestalt e bem-estar mental.
        </p>

        <!-- Posts -->
        <div style="margin: 30px 0;">
          ${postsHTML}
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          <p style="margin: 0 0 10px 0;">
            © 2026 Assistente Clínico - Psi. Daniela Coelho
          </p>
          <p style="margin: 0;">
            <a href="https://assistente-clinico.com/unsubscribe" style="color: #0066cc; text-decoration: none;">
              Desinscrever-se
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Gera texto plano do email
 */
export function generateNewsletterText(template: NewsletterTemplate): string {
  const postsText = template.posts
    .map(
      (post) =>
        `${post.title}\n${post.excerpt}\nLer mais: https://assistente-clinico.com/blog/${post.slug}\n`
    )
    .join("\n---\n\n");

  return `
Newsletter do Blog - Novos Artigos

Olá!

Preparamos uma seleção especial de artigos para você este mês. Confira as novidades sobre TCC, Terapia do Esquema, Gestalt e bem-estar mental.

${postsText}

---

© 2026 Assistente Clínico - Psi. Daniela Coelho
Desinscrever-se: https://assistente-clinico.com/unsubscribe
  `.trim();
}

/**
 * Calcula próxima data de envio de newsletter
 */
export function getNextNewsletterDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Enviar no primeiro dia do mês às 9h da manhã
  nextMonth.setHours(9, 0, 0, 0);

  return nextMonth;
}

/**
 * Valida se é hora de enviar newsletter
 */
export function shouldSendNewsletter(lastSentDate?: Date): boolean {
  if (!lastSentDate) return true;

  const now = new Date();
  const lastSent = new Date(lastSentDate);
  const daysSinceLastSend =
    (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24);

  // Enviar apenas uma vez por mês
  return daysSinceLastSend >= 30;
}

/**
 * Gera estatísticas de newsletter
 */
export function calculateNewsletterStats(emails: NewsletterEmail[]) {
  const subscribed = emails.filter((e) => e.status === "subscribed");
  const unsubscribed = emails.filter((e) => e.status === "unsubscribed");
  const totalOpens = subscribed.reduce((sum, e) => sum + e.openCount, 0);
  const totalClicks = subscribed.reduce((sum, e) => sum + e.clickCount, 0);

  return {
    totalSubscribers: emails.length,
    activeSubscribers: subscribed.length,
    unsubscribedCount: unsubscribed.length,
    unsubscribeRate: (
      (unsubscribed.length / emails.length) *
      100
    ).toFixed(2),
    totalOpens,
    averageOpenRate: subscribed.length
      ? ((totalOpens / subscribed.length) * 100).toFixed(2)
      : "0",
    totalClicks,
    averageClickRate: subscribed.length
      ? ((totalClicks / subscribed.length) * 100).toFixed(2)
      : "0",
    mostEngagedSubscribers: subscribed
      .sort((a, b) => b.openCount + b.clickCount - (a.openCount + a.clickCount))
      .slice(0, 5),
  };
}

/**
 * Segmenta subscribers por interesse
 */
export function segmentSubscribersByInterest(
  emails: NewsletterEmail[],
  interests: Record<string, string[]>
) {
  return {
    consultasInterested: emails.filter((e) =>
      interests["consultas"]?.includes(e.email)
    ),
    informationInterested: emails.filter((e) =>
      interests["informacoes"]?.includes(e.email)
    ),
    allInterested: emails.filter((e) =>
      interests["ambos"]?.includes(e.email)
    ),
  };
}

/**
 * Gera mensagem de confirmação de inscrição
 */
export function generateSubscriptionConfirmationEmail(name: string): string {
  return `
Olá ${name}!

Obrigado por se inscrever na nossa newsletter! 🎉

Você receberá atualizações mensais com:
- Novos artigos sobre psicologia clínica
- Dicas de bem-estar mental
- Informações sobre TCC, Terapia do Esquema e Gestalt
- Notícias sobre quando nosso sistema de agendamento estará disponível

Fique atento ao seu email para não perder nenhuma novidade!

Abraços,
Psi. Daniela Coelho
  `.trim();
}

/**
 * Gera mensagem de desinscrição
 */
export function generateUnsubscribeConfirmationEmail(): string {
  return `
Você foi desinscrito da nossa newsletter.

Sentiremos sua falta! Se mudar de ideia, pode se inscrever novamente em nosso site.

Abraços,
Psi. Daniela Coelho
  `.trim();
}

/**
 * Rastreia abertura de email
 */
export function trackEmailOpen(
  subscriberId: string,
  emails: NewsletterEmail[]
): NewsletterEmail[] {
  return emails.map((e) =>
    e.id === subscriberId
      ? { ...e, openCount: e.openCount + 1, lastEmailSentAt: new Date() }
      : e
  );
}

/**
 * Rastreia clique em link
 */
export function trackEmailClick(
  subscriberId: string,
  emails: NewsletterEmail[]
): NewsletterEmail[] {
  return emails.map((e) =>
    e.id === subscriberId
      ? { ...e, clickCount: e.clickCount + 1 }
      : e
  );
}

/**
 * Desinscreve usuário
 */
export function unsubscribeEmail(
  email: string,
  emails: NewsletterEmail[]
): NewsletterEmail[] {
  return emails.map((e) =>
    e.email === email
      ? { ...e, status: "unsubscribed", unsubscribedAt: new Date() }
      : e
  );
}

/**
 * Reinscreve usuário
 */
export function resubscribeEmail(
  email: string,
  emails: NewsletterEmail[]
): NewsletterEmail[] {
  return emails.map((e) =>
    e.email === email
      ? { ...e, status: "subscribed", unsubscribedAt: undefined }
      : e
  );
}
