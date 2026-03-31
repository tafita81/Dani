import { describe, it, expect } from "vitest";
import { recommendTechniques, calculateRelevanceScore, techniqueKnowledgeBase } from "./techniqueKnowledgeBase";

describe("Technique Recommendation System", () => {
  describe("calculateRelevanceScore", () => {
    it("deve calcular score baseado em indicações", () => {
      const tccTechnique = techniqueKnowledgeBase.find(t => t.id === "tcc_thought_record")!;
      const score = calculateRelevanceScore(
        tccTechnique,
        "Paciente com ansiedade e pensamentos automáticos",
        ["ansiedade", "depressão"],
        [],
        "Histórico de ansiedade generalizada"
      );
      expect(score).toBeGreaterThan(50);
    });

    it("deve penalizar se houver contraindições", () => {
      const exposureTechnique = techniqueKnowledgeBase.find(t => t.id === "tcc_exposure")!;
      const scoreWithoutContra = calculateRelevanceScore(
        exposureTechnique,
        "Paciente com fobia",
        ["fobias"],
        [],
        ""
      );
      const scoreWithContra = calculateRelevanceScore(
        exposureTechnique,
        "Paciente com psicose aguda",
        ["fobias"],
        [],
        "Psicose aguda"
      );
      expect(scoreWithContra).toBeLessThan(scoreWithoutContra);
    });

    it("deve aumentar score se técnica foi efetiva antes", () => {
      const technique = techniqueKnowledgeBase[0];
      const scoreWithoutPrevious = calculateRelevanceScore(
        technique,
        "Apresentação",
        ["tema"],
        [],
        ""
      );
      const scoreWithPrevious = calculateRelevanceScore(
        technique,
        "Apresentação",
        ["tema"],
        [{ technique: technique.id, effectiveness: 90 }],
        ""
      );
      expect(scoreWithPrevious).toBeGreaterThan(scoreWithoutPrevious);
    });
  });

  describe("recommendTechniques", () => {
    it("deve retornar array de recomendações", () => {
      const recommendations = recommendTechniques(
        "Paciente com ansiedade e pensamentos automáticos",
        ["ansiedade", "distorções cognitivas"],
        [],
        "Histórico de ansiedade generalizada",
        5
      );
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it("deve retornar recomendações ordenadas por relevância", () => {
      const recommendations = recommendTechniques(
        "Paciente com ansiedade",
        ["ansiedade"],
        [],
        "",
        5
      );
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].relevanceScore).toBeGreaterThanOrEqual(
          recommendations[i + 1].relevanceScore
        );
      }
    });

    it("deve incluir técnicas de TCC para ansiedade", () => {
      const recommendations = recommendTechniques(
        "Paciente com ansiedade generalizada",
        ["ansiedade"],
        [],
        "Ansiedade crônica",
        5
      );
      const tccTechniques = recommendations.filter(r => r.technique.approach === "TCC");
      expect(tccTechniques.length).toBeGreaterThan(0);
    });

    it("deve incluir técnicas de Gestalt para relacionamentos", () => {
      const recommendations = recommendTechniques(
        "Paciente com dificuldades de relacionamento",
        ["relacionamentos"],
        [],
        "Conflitos interpessoais",
        5
      );
      const gestaltTechniques = recommendations.filter(r => r.technique.approach === "Gestalt");
      expect(gestaltTechniques.length).toBeGreaterThan(0);
    });

    it("deve respeitar limite de recomendações", () => {
      const recommendations1 = recommendTechniques(
        "Apresentação",
        ["tema"],
        [],
        "",
        3
      );
      const recommendations5 = recommendTechniques(
        "Apresentação",
        ["tema"],
        [],
        "",
        5
      );
      expect(recommendations1.length).toBeLessThanOrEqual(3);
      expect(recommendations5.length).toBeLessThanOrEqual(5);
    });
  });

  describe("techniqueKnowledgeBase", () => {
    it("deve conter técnicas de múltiplas abordagens", () => {
      const approaches = new Set(techniqueKnowledgeBase.map(t => t.approach));
      expect(approaches.size).toBeGreaterThan(1);
      expect(approaches.has("TCC")).toBe(true);
      expect(approaches.has("Esquema")).toBe(true);
      expect(approaches.has("Gestalt")).toBe(true);
    });

    it("deve ter todas as técnicas com campos obrigatórios", () => {
      techniqueKnowledgeBase.forEach(technique => {
        expect(technique.id).toBeDefined();
        expect(technique.name).toBeDefined();
        expect(technique.approach).toBeDefined();
        expect(technique.description).toBeDefined();
        expect(technique.indications).toBeDefined();
        expect(Array.isArray(technique.indications)).toBe(true);
        expect(technique.effectiveness).toBeGreaterThanOrEqual(0);
        expect(technique.effectiveness).toBeLessThanOrEqual(100);
      });
    });

    it("deve ter técnicas com tempo realista", () => {
      techniqueKnowledgeBase.forEach(technique => {
        expect(technique.timeRequired).toBeGreaterThan(0);
        expect(technique.timeRequired).toBeLessThan(200); // Máximo 3+ horas
      });
    });
  });

  describe("Recomendação para casos específicos", () => {
    it("deve recomendar TCC para depressão", () => {
      const recommendations = recommendTechniques(
        "Paciente com sintomas depressivos",
        ["depressão", "apatia"],
        [],
        "Depressão maior",
        5
      );
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].relevanceScore).toBeGreaterThan(50);
    });

    it("deve recomendar Mindfulness para ansiedade", () => {
      const recommendations = recommendTechniques(
        "Paciente com ansiedade e insônia",
        ["ansiedade", "insônia"],
        [],
        "Transtorno de ansiedade",
        5
      );
      const mindfulnessTechniques = recommendations.filter(
        r => r.technique.approach === "Mindfulness"
      );
      expect(mindfulnessTechniques.length).toBeGreaterThan(0);
    });

    it("deve recomendar Esquema para padrões repetitivos", () => {
      const recommendations = recommendTechniques(
        "Paciente com padrões relacionais repetitivos",
        ["relacionamentos", "padrões repetitivos"],
        [],
        "Histórico de relacionamentos disfuncionais",
        5
      );
      const schemaTechniques = recommendations.filter(
        r => r.technique.approach === "Esquema"
      );
      expect(schemaTechniques.length).toBeGreaterThan(0);
    });

    it("deve incluir reasoning nas recomendações", () => {
      const recommendations = recommendTechniques(
        "Paciente com ansiedade",
        ["ansiedade"],
        [],
        "",
        1
      );
      expect(recommendations[0].reasoning).toBeDefined();
      expect(recommendations[0].reasoning.length).toBeGreaterThan(0);
    });

    it("deve incluir alternativas nas recomendações", () => {
      const recommendations = recommendTechniques(
        "Paciente com ansiedade",
        ["ansiedade"],
        [],
        "",
        1
      );
      expect(recommendations[0].alternativeTechniques).toBeDefined();
      expect(Array.isArray(recommendations[0].alternativeTechniques)).toBe(true);
    });
  });
});
