import { describe, it, expect } from "vitest";
import {
  validateCRPCompliance,
  validateBatchCRPCompliance,
  generateCRPComplianceReport,
  suggestCRPCompliantAlternative,
  canPublishContent,
  createCRPComplianceChecklist,
} from "./crpComplianceValidator";

describe("Sistema de Validação de Conformidade CRP", () => {
  describe("Validação de Termos Proibidos", () => {
    it("deve detectar 'cura garantida'", async () => {
      const content = "Cura garantida para ansiedade com nosso método";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(false);
      expect(validation.riskLevel).toBe("critical");
      expect(validation.violations.length).toBeGreaterThan(0);
      expect(validation.violations[0].type).toBe("prohibited_term");
    });

    it("deve detectar 'psicóloga daniela'", async () => {
      const content = "Consulte a psicóloga Daniela para transformação";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(false);
      expect(validation.violations.some((v) => v.type === "direct_promotion")).toBe(true);
    });

    it("deve detectar 'melhor psicóloga'", async () => {
      const content = "Sou a melhor psicóloga do Brasil";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(false);
      expect(validation.violations.some((v) => v.type === "aggressive_promotion")).toBe(true);
    });

    it("deve detectar 'diagnóstico'", async () => {
      const content = "Faço diagnóstico de ansiedade em 5 minutos";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(false);
      expect(validation.violations.some((v) => v.type === "diagnosis")).toBe(true);
    });

    it("deve detectar promessas de cura", async () => {
      const content = "Cure sua depressão em 30 dias com garantia";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(false);
      expect(validation.violations.some((v) => v.type === "cure_promise")).toBe(true);
    });
  });

  describe("Validação de Conteúdo Conforme", () => {
    it("deve aceitar conteúdo educativo", async () => {
      const content =
        "Dicas de psicologia: 5 técnicas de mindfulness para reduzir ansiedade. Este conteúdo é apenas informativo e não substitui atendimento profissional.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(true);
      expect(validation.riskLevel).toBe("low");
      expect(validation.score).toBeGreaterThan(80);
    });

    it("deve aceitar conteúdo com disclaimer", async () => {
      const content =
        "Técnicas de relaxamento para bem-estar. Para diagnóstico ou tratamento, procure um psicólogo credenciado.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(true);
    });

    it("deve aceitar chamada para consulta apropriada", async () => {
      const content =
        "Interessado em explorar técnicas terapêuticas? Agende uma consulta com um psicólogo credenciado.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(true);
    });
  });

  describe("Score de Conformidade", () => {
    it("deve dar score 100 para conteúdo perfeitamente conforme", async () => {
      const content =
        "Conheça as técnicas de TCC. Este conteúdo é informativo. Para atendimento, procure um psicólogo.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.score).toBeGreaterThanOrEqual(80);
    });

    it("deve reduzir score para conteúdo com violações", async () => {
      const content = "Cura garantida para depressão";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.score).toBeLessThan(50);
    });

    it("deve ter score 0 para conteúdo muito violador", async () => {
      const content =
        "Sou a melhor psicóloga, curo ansiedade 100%, diagnóstico grátis, psicóloga Daniela";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.score).toBeLessThan(30);
    });
  });

  describe("Nível de Risco", () => {
    it("deve marcar como crítico para violações graves", async () => {
      const content = "Cura garantida para depressão com meu método único";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.riskLevel).toBe("critical");
      expect(validation.canPublish).toBe(false);
    });

    it("deve marcar como médio para violações moderadas", async () => {
      const content = "Técnicas de psicologia. Procure um psicólogo para diagnóstico.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.riskLevel).toMatch(/low|medium/);
    });
  });

  describe("Validação em Lote", () => {
    it("deve validar múltiplos conteúdos", async () => {
      const contents = [
        {
          id: "1",
          text: "Dicas de psicologia educativas",
          type: "caption" as const,
        },
        {
          id: "2",
          text: "Cura garantida para ansiedade",
          type: "caption" as const,
        },
        {
          id: "3",
          text: "Técnicas de mindfulness. Para atendimento, procure um psicólogo.",
          type: "caption" as const,
        },
      ];

      const validations = await validateBatchCRPCompliance(contents);

      expect(validations).toHaveLength(3);
      expect(validations[0].isCompliant).toBe(true);
      expect(validations[1].isCompliant).toBe(false);
      expect(validations[2].isCompliant).toBe(true);
    });
  });

  describe("Sugestões de Melhoria", () => {
    it("deve sugerir alternativa conforme", async () => {
      const original = "Cura garantida para ansiedade";
      const improved = await suggestCRPCompliantAlternative(original);

      expect(improved).not.toContain("cura garantida");
      expect(improved).toContain("suporte");
    });

    it("deve substituir termos proibidos", async () => {
      const original = "Eliminar depressão com meu método único";
      const improved = await suggestCRPCompliantAlternative(original);

      expect(improved).not.toContain("eliminar");
      expect(improved).toContain("lidar");
    });

    it("deve adicionar disclaimer quando necessário", async () => {
      const original = "Oferecemos consultas de psicologia";
      const improved = await suggestCRPCompliantAlternative(original);

      expect(improved).toContain("procure um psicólogo");
    });
  });

  describe("Permissão de Publicação", () => {
    it("deve permitir publicação de conteúdo conforme", async () => {
      const content = "Dicas de psicologia. Para atendimento, procure um psicólogo.";
      const validation = await validateCRPCompliance(content, "caption");
      const permission = await canPublishContent(validation);

      expect(permission.canPublish).toBe(true);
    });

    it("deve bloquear publicação de conteúdo com violações críticas", async () => {
      const content = "Cura garantida para depressão";
      const validation = await validateCRPCompliance(content, "caption");
      const permission = await canPublishContent(validation);

      expect(permission.canPublish).toBe(false);
      expect(permission.reason).toContain("críticas");
    });

    it("deve bloquear publicação com score baixo", async () => {
      const content = "Sou a melhor, curo tudo, diagnóstico grátis";
      const validation = await validateCRPCompliance(content, "caption");
      const permission = await canPublishContent(validation);

      expect(permission.canPublish).toBe(false);
    });
  });

  describe("Relatórios", () => {
    it("deve gerar relatório de conformidade", async () => {
      const contents = [
        {
          id: "1",
          text: "Dicas de psicologia",
          type: "caption" as const,
        },
        {
          id: "2",
          text: "Cura garantida",
          type: "caption" as const,
        },
      ];

      const validations = await validateBatchCRPCompliance(contents);
      const report = await generateCRPComplianceReport(validations);

      expect(report).toContain("Relatório de Conformidade CRP");
      expect(report).toContain("Total de conteúdos");
      expect(report).toContain("Score médio");
    });
  });

  describe("Checklist CRP", () => {
    it("deve gerar checklist de conformidade", async () => {
      const checklist = await createCRPComplianceChecklist();

      expect(checklist).toContain("Checklist de Conformidade CRP");
      expect(checklist).toContain("Proibições");
      expect(checklist).toContain("Permitido");
      expect(checklist).toContain("Antes de Publicar");
      expect(checklist).toContain("Daniela");
      expect(checklist).toContain("diagnósticos");
    });
  });

  describe("Cenários Reais", () => {
    it("deve validar conteúdo de reel viral conforme", async () => {
      const content =
        "Você estava fazendo isso errado! 😱 5 técnicas de psicologia para melhorar sua ansiedade. Salva esse vídeo! 📌 Este conteúdo é informativo. Para diagnóstico, procure um psicólogo.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(true);
    });

    it("deve validar carrossel conforme", async () => {
      const content =
        "5 Sinais de Ansiedade: 1. Falta de ar 2. Tremor 3. Sudoração 4. Aceleração cardíaca 5. Insônia. Este conteúdo é educativo. Para diagnóstico, procure um psicólogo credenciado.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(true);
    });

    it("deve rejeitar conteúdo com autopromoção agressiva", async () => {
      const content =
        "Sou a psicóloga mais buscada do Brasil. Curo ansiedade em 1 sessão. Psicóloga Daniela - melhor do mercado!";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(false);
      expect(validation.riskLevel).toBe("critical");
    });

    it("deve aceitar conteúdo educativo sem menção direta", async () => {
      const content =
        "Conheça a Terapia Cognitivo-Comportamental (TCC): uma abordagem baseada em evidências. Este conteúdo é informativo e não substitui atendimento profissional. Para consulta, procure um psicólogo credenciado.";
      const validation = await validateCRPCompliance(content, "caption");

      expect(validation.isCompliant).toBe(true);
      expect(validation.score).toBeGreaterThan(80);
    });
  });

  describe("Integração com Sistema de Publicação", () => {
    it("deve bloquear publicação de conteúdo não conforme", async () => {
      const content = "Cura garantida para depressão";
      const validation = await validateCRPCompliance(content, "caption");
      const permission = await canPublishContent(validation);

      expect(permission.canPublish).toBe(false);
      expect(validation.canPublish).toBe(false);
    });

    it("deve permitir publicação de conteúdo conforme", async () => {
      const content =
        "Técnicas de relaxamento para bem-estar. Para atendimento profissional, procure um psicólogo.";
      const validation = await validateCRPCompliance(content, "caption");
      const permission = await canPublishContent(validation);

      expect(permission.canPublish).toBe(true);
      expect(validation.canPublish).toBe(true);
    });
  });
});
