import { describe, it, expect } from "vitest";
import {
  generateNewsletterTemplate,
  generateNewsletterHTML,
  generateNewsletterText,
  getNextNewsletterDate,
  shouldSendNewsletter,
  calculateNewsletterStats,
  generateSubscriptionConfirmationEmail,
  generateUnsubscribeConfirmationEmail,
  trackEmailOpen,
  trackEmailClick,
  unsubscribeEmail,
  resubscribeEmail,
} from "./newsletterService";

describe("Newsletter Service", () => {
  describe("generateNewsletterTemplate", () => {
    it("deve gerar template com posts", () => {
      const posts = [
        {
          id: "1",
          title: "TCC Básico",
          excerpt: "Introdução à TCC",
          slug: "tcc-basico",
          category: "tcc",
          readingTime: 5,
        },
      ];

      const template = generateNewsletterTemplate(posts);
      expect(template.subject).toContain("Newsletter");
      expect(template.posts).toHaveLength(1);
      expect(template.posts[0].title).toBe("TCC Básico");
    });

    it("deve limitar a 5 posts", () => {
      const posts = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `Post ${i}`,
        excerpt: `Excerpt ${i}`,
        slug: `post-${i}`,
        category: "geral",
        readingTime: 5,
      }));

      const template = generateNewsletterTemplate(posts);
      expect(template.posts).toHaveLength(5);
    });
  });

  describe("generateNewsletterHTML", () => {
    it("deve gerar HTML válido", () => {
      const posts = [
        {
          id: "1",
          title: "TCC Básico",
          excerpt: "Introdução à TCC",
          slug: "tcc-basico",
          category: "tcc",
          readingTime: 5,
        },
      ];

      const template = generateNewsletterTemplate(posts);
      const html = generateNewsletterHTML(template);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("TCC Básico");
      expect(html).toContain("tcc-basico");
      expect(html).toContain("Desinscrever-se");
    });

    it("deve incluir links para artigos", () => {
      const posts = [
        {
          id: "1",
          title: "Post 1",
          excerpt: "Excerpt 1",
          slug: "post-1",
          category: "geral",
          readingTime: 5,
        },
      ];

      const template = generateNewsletterTemplate(posts);
      const html = generateNewsletterHTML(template);

      expect(html).toContain("https://assistente-clinico.com/blog/post-1");
    });
  });

  describe("generateNewsletterText", () => {
    it("deve gerar texto plano", () => {
      const posts = [
        {
          id: "1",
          title: "TCC Básico",
          excerpt: "Introdução à TCC",
          slug: "tcc-basico",
          category: "tcc",
          readingTime: 5,
        },
      ];

      const template = generateNewsletterTemplate(posts);
      const text = generateNewsletterText(template);

      expect(text).toContain("TCC Básico");
      expect(text).toContain("Introdução à TCC");
      expect(text).toContain("tcc-basico");
    });
  });

  describe("getNextNewsletterDate", () => {
    it("deve retornar data válida", () => {
      const date = getNextNewsletterDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.getHours()).toBe(9);
      expect(date.getMinutes()).toBe(0);
    });

    it("deve ser no primeiro dia do mês", () => {
      const date = getNextNewsletterDate();
      expect(date.getDate()).toBe(1);
    });
  });

  describe("shouldSendNewsletter", () => {
    it("deve retornar true se nunca foi enviado", () => {
      expect(shouldSendNewsletter()).toBe(true);
      expect(shouldSendNewsletter(undefined)).toBe(true);
    });

    it("deve retornar true se passou 30 dias", () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

      expect(shouldSendNewsletter(thirtyDaysAgo)).toBe(true);
    });

    it("deve retornar false se foi enviado há menos de 30 dias", () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      expect(shouldSendNewsletter(tenDaysAgo)).toBe(false);
    });
  });

  describe("calculateNewsletterStats", () => {
    it("deve calcular estatísticas corretamente", () => {
      const emails = [
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          subscribedAt: new Date(),
          status: "subscribed" as const,
          openCount: 5,
          clickCount: 2,
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          subscribedAt: new Date(),
          status: "unsubscribed" as const,
          openCount: 0,
          clickCount: 0,
          unsubscribedAt: new Date(),
        },
      ];

      const stats = calculateNewsletterStats(emails);
      expect(stats.totalSubscribers).toBe(2);
      expect(stats.activeSubscribers).toBe(1);
      expect(stats.unsubscribedCount).toBe(1);
      expect(stats.totalOpens).toBe(5);
      expect(stats.totalClicks).toBe(2);
    });
  });

  describe("generateSubscriptionConfirmationEmail", () => {
    it("deve incluir nome do usuário", () => {
      const email = generateSubscriptionConfirmationEmail("Maria");
      expect(email).toContain("Maria");
      expect(email).toContain("Obrigado");
    });
  });

  describe("generateUnsubscribeConfirmationEmail", () => {
    it("deve gerar email de desinscrição", () => {
      const email = generateUnsubscribeConfirmationEmail();
      expect(email).toContain("desinscrito");
      expect(email).toContain("newsletter");
    });
  });

  describe("trackEmailOpen", () => {
    it("deve incrementar contador de aberturas", () => {
      const emails = [
        {
          id: "1",
          email: "user@example.com",
          name: "User",
          subscribedAt: new Date(),
          status: "subscribed" as const,
          openCount: 0,
          clickCount: 0,
        },
      ];

      const updated = trackEmailOpen("1", emails);
      expect(updated[0].openCount).toBe(1);
    });
  });

  describe("trackEmailClick", () => {
    it("deve incrementar contador de cliques", () => {
      const emails = [
        {
          id: "1",
          email: "user@example.com",
          name: "User",
          subscribedAt: new Date(),
          status: "subscribed" as const,
          openCount: 0,
          clickCount: 0,
        },
      ];

      const updated = trackEmailClick("1", emails);
      expect(updated[0].clickCount).toBe(1);
    });
  });

  describe("unsubscribeEmail", () => {
    it("deve desinscrever usuário", () => {
      const emails = [
        {
          id: "1",
          email: "user@example.com",
          name: "User",
          subscribedAt: new Date(),
          status: "subscribed" as const,
          openCount: 0,
          clickCount: 0,
        },
      ];

      const updated = unsubscribeEmail("user@example.com", emails);
      expect(updated[0].status).toBe("unsubscribed");
      expect(updated[0].unsubscribedAt).toBeDefined();
    });
  });

  describe("resubscribeEmail", () => {
    it("deve reinscrever usuário", () => {
      const emails = [
        {
          id: "1",
          email: "user@example.com",
          name: "User",
          subscribedAt: new Date(),
          status: "unsubscribed" as const,
          openCount: 0,
          clickCount: 0,
          unsubscribedAt: new Date(),
        },
      ];

      const updated = resubscribeEmail("user@example.com", emails);
      expect(updated[0].status).toBe("subscribed");
      expect(updated[0].unsubscribedAt).toBeUndefined();
    });
  });
});
