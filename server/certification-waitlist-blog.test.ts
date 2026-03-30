import { describe, it, expect } from "vitest";
import {
  validateWaitlistEntry,
  generateWelcomeMessage,
  generateActivationNotification,
  calculateWaitlistStats,
  checkEmailExists,
  generateWaitlistId,
  detectInterestPatterns,
} from "./waitlistService";
import {
  calculateReadingTime,
  generateSlug,
  validateBlogPost,
  calculateBlogStats,
  filterPostsByCategory,
  searchPostsByTag,
  searchPostsByText,
  extractUniqueTags,
  sortPostsByDate,
  sortPostsByViews,
  sortPostsByLikes,
  DEFAULT_BLOG_POSTS,
} from "./blogService";

describe("Waitlist Service", () => {
  describe("validateWaitlistEntry", () => {
    it("deve validar entrada válida", () => {
      const entry = {
        name: "João Silva",
        email: "joao@example.com",
        interest: "ambos" as const,
      };
      const result = validateWaitlistEntry(entry);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("deve rejeitar email inválido", () => {
      const entry = {
        name: "João Silva",
        email: "email-invalido",
        interest: "ambos" as const,
      };
      const result = validateWaitlistEntry(entry);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Email inválido");
    });

    it("deve rejeitar nome muito curto", () => {
      const entry = {
        name: "Jo",
        email: "joao@example.com",
        interest: "ambos" as const,
      };
      const result = validateWaitlistEntry(entry);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Nome deve ter pelo menos 3 caracteres");
    });

    it("deve rejeitar interesse inválido", () => {
      const entry = {
        name: "João Silva",
        email: "joao@example.com",
        interest: "invalido" as any,
      };
      const result = validateWaitlistEntry(entry);
      expect(result.valid).toBe(false);
    });
  });

  describe("generateWelcomeMessage", () => {
    it("deve gerar mensagem para interesse em consultas", () => {
      const message = generateWelcomeMessage("Maria", "consultas");
      expect(message).toContain("Maria");
      expect(message).toContain("consultas");
      expect(message).toContain("2027");
    });

    it("deve gerar mensagem para interesse em informações", () => {
      const message = generateWelcomeMessage("Pedro", "informacoes");
      expect(message).toContain("Pedro");
      expect(message).toContain("blog");
    });

    it("deve gerar mensagem para interesse em ambos", () => {
      const message = generateWelcomeMessage("Ana", "ambos");
      expect(message).toContain("Ana");
      expect(message).toContain("ambos");
    });
  });

  describe("generateActivationNotification", () => {
    it("deve gerar notificação de ativação", () => {
      const notification = generateActivationNotification("Carlos");
      expect(notification).toContain("Carlos");
      expect(notification).toContain("disponível");
      expect(notification).toContain("agora");
    });
  });

  describe("calculateWaitlistStats", () => {
    it("deve calcular estatísticas corretamente", () => {
      const entries = [
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          interest: "consultas" as const,
          createdAt: new Date(),
          status: "active" as const,
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          interest: "ambos" as const,
          createdAt: new Date(),
          status: "notified" as const,
        },
      ];

      const stats = calculateWaitlistStats(entries);
      expect(stats.totalSubscribers).toBe(2);
      expect(stats.activeSubscribers).toBe(1);
      expect(stats.notifiedSubscribers).toBe(1);
    });
  });

  describe("checkEmailExists", () => {
    it("deve encontrar email existente", () => {
      const entries = [
        {
          id: "1",
          email: "test@example.com",
          name: "Test",
          interest: "ambos" as const,
          createdAt: new Date(),
          status: "active" as const,
        },
      ];

      const exists = checkEmailExists("test@example.com", entries);
      expect(exists).toBe(true);
    });

    it("deve retornar false para email não existente", () => {
      const entries = [
        {
          id: "1",
          email: "test@example.com",
          name: "Test",
          interest: "ambos" as const,
          createdAt: new Date(),
          status: "active" as const,
        },
      ];

      const exists = checkEmailExists("outro@example.com", entries);
      expect(exists).toBe(false);
    });

    it("deve ser case-insensitive", () => {
      const entries = [
        {
          id: "1",
          email: "Test@Example.com",
          name: "Test",
          interest: "ambos" as const,
          createdAt: new Date(),
          status: "active" as const,
        },
      ];

      const exists = checkEmailExists("test@example.com", entries);
      expect(exists).toBe(true);
    });
  });

  describe("generateWaitlistId", () => {
    it("deve gerar ID único", () => {
      const id1 = generateWaitlistId();
      const id2 = generateWaitlistId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^waitlist_/);
      expect(id2).toMatch(/^waitlist_/);
    });
  });

  describe("detectInterestPatterns", () => {
    it("deve detectar padrão de interesse primário", () => {
      const entries = [
        {
          id: "1",
          email: "user1@example.com",
          name: "User 1",
          interest: "ambos" as const,
          createdAt: new Date(),
          status: "active" as const,
        },
        {
          id: "2",
          email: "user2@example.com",
          name: "User 2",
          interest: "ambos" as const,
          createdAt: new Date(),
          status: "active" as const,
        },
        {
          id: "3",
          email: "user3@example.com",
          name: "User 3",
          interest: "consultas" as const,
          createdAt: new Date(),
          status: "active" as const,
        },
      ];

      const patterns = detectInterestPatterns(entries);
      expect(patterns.primaryInterest).toBe("ambos");
    });
  });
});

describe("Blog Service", () => {
  describe("calculateReadingTime", () => {
    it("deve calcular tempo de leitura corretamente", () => {
      const content = "palavra ".repeat(200);
      const time = calculateReadingTime(content);
      expect(time).toBe(1);
    });

    it("deve arredondar para cima", () => {
      const content = "palavra ".repeat(250);
      const time = calculateReadingTime(content);
      expect(time).toBe(2);
    });
  });

  describe("generateSlug", () => {
    it("deve gerar slug válido", () => {
      const slug = generateSlug("Introdução à Terapia Cognitivo-Comportamental");
      expect(slug).toBe("introducao-a-terapia-cognitivo-comportamental");
    });

    it("deve remover caracteres especiais", () => {
      const slug = generateSlug("Post! Com? Caracteres@Especiais#");
      expect(slug).not.toContain("!");
      expect(slug).not.toContain("?");
      expect(slug).not.toContain("@");
    });

    it("deve converter para minúsculas", () => {
      const slug = generateSlug("TEXTO EM MAIÚSCULAS");
      expect(slug).toBe(slug.toLowerCase());
    });
  });

  describe("validateBlogPost", () => {
    it("deve validar post válido", () => {
      const post = {
        title: "Título do Post",
        excerpt: "Este é um resumo do post",
        content: "Este é o conteúdo completo do post com mais de 100 caracteres",
        category: "tcc" as const,
        author: "Psi. Daniela",
      };
      const result = validateBlogPost(post);
      expect(result.valid).toBe(true);
    });

    it("deve rejeitar título muito curto", () => {
      const post = {
        title: "Tit",
        excerpt: "Este é um resumo do post",
        content: "Este é o conteúdo completo do post com mais de 100 caracteres",
        category: "tcc" as const,
        author: "Psi. Daniela",
      };
      const result = validateBlogPost(post);
      expect(result.valid).toBe(false);
    });
  });

  describe("calculateBlogStats", () => {
    it("deve calcular estatísticas do blog", () => {
      const stats = calculateBlogStats(DEFAULT_BLOG_POSTS);
      expect(stats.totalPosts).toBeGreaterThan(0);
      expect(stats.totalViews).toBeGreaterThan(0);
      expect(stats.averageReadingTime).toBeGreaterThan(0);
    });

    it("deve identificar post mais visualizado", () => {
      const stats = calculateBlogStats(DEFAULT_BLOG_POSTS);
      expect(stats.mostViewedPost).toBeDefined();
      expect(stats.mostViewedPost?.views).toBeGreaterThan(0);
    });
  });

  describe("filterPostsByCategory", () => {
    it("deve filtrar posts por categoria", () => {
      const tccPosts = filterPostsByCategory(DEFAULT_BLOG_POSTS, "tcc");
      expect(tccPosts.length).toBeGreaterThan(0);
      expect(tccPosts.every((p) => p.category === "tcc")).toBe(true);
    });
  });

  describe("searchPostsByTag", () => {
    it("deve buscar posts por tag", () => {
      const results = searchPostsByTag(DEFAULT_BLOG_POSTS, "psicologia");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("searchPostsByText", () => {
    it("deve buscar posts por texto", () => {
      const results = searchPostsByText(DEFAULT_BLOG_POSTS, "ansiedade");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("extractUniqueTags", () => {
    it("deve extrair tags únicas", () => {
      const tags = extractUniqueTags(DEFAULT_BLOG_POSTS);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags).toEqual([...new Set(tags)]);
    });
  });

  describe("sortPostsByDate", () => {
    it("deve ordenar posts por data (mais recentes primeiro)", () => {
      const sorted = sortPostsByDate(DEFAULT_BLOG_POSTS);
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          sorted[i + 1].createdAt.getTime()
        );
      }
    });
  });

  describe("sortPostsByViews", () => {
    it("deve ordenar posts por visualizações", () => {
      const sorted = sortPostsByViews(DEFAULT_BLOG_POSTS);
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].views).toBeGreaterThanOrEqual(sorted[i + 1].views);
      }
    });
  });

  describe("sortPostsByLikes", () => {
    it("deve ordenar posts por likes", () => {
      const sorted = sortPostsByLikes(DEFAULT_BLOG_POSTS);
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].likes).toBeGreaterThanOrEqual(sorted[i + 1].likes);
      }
    });
  });
});
