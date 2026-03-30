import { describe, it, expect } from "vitest";
import {
  shouldApplyForm,
  calculateFormScore,
  getScoreInterpretation,
  analyzeFormEvolution,
  recommendNextForm,
  generateFormFeedback,
  CLINICAL_FORMS,
  type PatientFormResponse,
} from "./dynamicForms";

describe("Dynamic Forms System", () => {
  describe("shouldApplyForm", () => {
    it("deve retornar true se nunca foi aplicado", () => {
      const result = shouldApplyForm(undefined, 7);
      expect(result).toBe(true);
    });

    it("deve retornar true se passou tempo mínimo", () => {
      const lastDate = new Date();
      lastDate.setDate(lastDate.getDate() - 8); // 8 dias atrás

      const result = shouldApplyForm(lastDate, 7);
      expect(result).toBe(true);
    });

    it("deve retornar false se não passou tempo mínimo", () => {
      const lastDate = new Date();
      lastDate.setDate(lastDate.getDate() - 3); // 3 dias atrás

      const result = shouldApplyForm(lastDate, 7);
      expect(result).toBe(false);
    });
  });

  describe("calculateFormScore", () => {
    it("deve calcular score total corretamente", () => {
      const responses = [
        { questionId: "q1", answer: 1, score: 1 },
        { questionId: "q2", answer: 2, score: 2 },
        { questionId: "q3", answer: 3, score: 3 },
      ];

      const score = calculateFormScore(responses, CLINICAL_FORMS.PHQ9);
      expect(score).toBe(6);
    });

    it("deve retornar 0 para respostas vazias", () => {
      const score = calculateFormScore([], CLINICAL_FORMS.PHQ9);
      expect(score).toBe(0);
    });
  });

  describe("getScoreInterpretation", () => {
    it("deve retornar interpretação correta para PHQ-9", () => {
      const interp = getScoreInterpretation(5, CLINICAL_FORMS.PHQ9);
      expect(interp?.level).toBe("mild");
      expect(interp?.interpretation).toContain("leve");
    });

    it("deve retornar depressão grave para score alto", () => {
      const interp = getScoreInterpretation(25, CLINICAL_FORMS.PHQ9);
      expect(interp?.level).toBe("severe");
    });

    it("deve retornar depressão mínima para score baixo", () => {
      const interp = getScoreInterpretation(2, CLINICAL_FORMS.PHQ9);
      expect(interp?.level).toBe("minimal");
    });

    it("deve retornar interpretação correta para GAD-7", () => {
      const interp = getScoreInterpretation(8, CLINICAL_FORMS.GAD7);
      expect(interp?.level).toBe("mild");
    });
  });

  describe("analyzeFormEvolution", () => {
    it("deve retornar stable para uma única resposta", () => {
      const responses: PatientFormResponse[] = [
        {
          id: "r1",
          patientId: "p1",
          formId: "phq9",
          responses: [],
          totalScore: 10,
          scoreLevel: "mild",
          completedAt: new Date(),
        },
      ];

      const analysis = analyzeFormEvolution(responses);
      expect(analysis.trend).toBe("stable");
      expect(analysis.averageScore).toBe(10);
    });

    it("deve detectar melhora quando score diminui", () => {
      const now = new Date();
      const responses: PatientFormResponse[] = [
        {
          id: "r1",
          patientId: "p1",
          formId: "phq9",
          responses: [],
          totalScore: 15,
          scoreLevel: "moderate",
          completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "r2",
          patientId: "p1",
          formId: "phq9",
          responses: [],
          totalScore: 10,
          scoreLevel: "mild",
          completedAt: now,
        },
      ];

      const analysis = analyzeFormEvolution(responses);
      expect(analysis.trend).toBe("improving");
      expect(analysis.scoreChange).toBe(-5);
    });

    it("deve detectar piora quando score aumenta", () => {
      const now = new Date();
      const responses: PatientFormResponse[] = [
        {
          id: "r1",
          patientId: "p1",
          formId: "phq9",
          responses: [],
          totalScore: 8,
          scoreLevel: "mild",
          completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "r2",
          patientId: "p1",
          formId: "phq9",
          responses: [],
          totalScore: 16,
          scoreLevel: "moderate",
          completedAt: now,
        },
      ];

      const analysis = analyzeFormEvolution(responses);
      expect(analysis.trend).toBe("worsening");
      expect(analysis.scoreChange).toBe(8);
    });
  });

  describe("recommendNextForm", () => {
    it("deve recomendar PHQ-9 na primeira sessão", () => {
      const responses = new Map();
      const form = recommendNextForm(responses, 1);
      expect(form?.id).toBe("phq9");
    });

    it("deve recomendar GAD-7 na segunda sessão", () => {
      const responses = new Map();
      const form = recommendNextForm(responses, 2);
      expect(form?.id).toBe("gad7");
    });

    it("deve recomendar PHQ-9 novamente se depressão piora", () => {
      const now = new Date();
      const phq9Responses: PatientFormResponse[] = [
        {
          id: "r1",
          patientId: "p1",
          formId: "phq9",
          responses: [],
          totalScore: 8,
          scoreLevel: "mild",
          completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "r2",
          patientId: "p1",
          formId: "phq9",
          responses: [],
          totalScore: 18,
          scoreLevel: "moderate",
          completedAt: now,
        },
      ];

      const responses = new Map([["phq9", phq9Responses]]);
      const form = recommendNextForm(responses, 5);
      expect(form?.id).toBe("phq9");
    });
  });

  describe("generateFormFeedback", () => {
    it("deve gerar feedback para depressão mínima", () => {
      const interp = getScoreInterpretation(2, CLINICAL_FORMS.PHQ9)!;
      const feedback = generateFormFeedback(CLINICAL_FORMS.PHQ9, 2, interp);
      expect(feedback).toContain("mínimos");
    });

    it("deve gerar feedback para ansiedade leve", () => {
      const interp = getScoreInterpretation(8, CLINICAL_FORMS.GAD7)!;
      const feedback = generateFormFeedback(CLINICAL_FORMS.GAD7, 8, interp);
      expect(feedback).toContain("leve");
    });

    it("deve gerar feedback para depressão grave", () => {
      const interp = getScoreInterpretation(25, CLINICAL_FORMS.PHQ9)!;
      const feedback = generateFormFeedback(CLINICAL_FORMS.PHQ9, 25, interp);
      expect(feedback).toContain("intensificar");
    });
  });

  describe("Clinical Forms Database", () => {
    it("deve conter PHQ-9 com 9 questões", () => {
      expect(CLINICAL_FORMS.PHQ9.questions.length).toBe(9);
    });

    it("deve conter GAD-7 com 7 questões", () => {
      expect(CLINICAL_FORMS.GAD7.questions.length).toBe(7);
    });

    it("PHQ-9 deve ter scoring correto", () => {
      expect(CLINICAL_FORMS.PHQ9.scoringSystem.minScore).toBe(0);
      expect(CLINICAL_FORMS.PHQ9.scoringSystem.maxScore).toBe(27);
    });

    it("GAD-7 deve ter scoring correto", () => {
      expect(CLINICAL_FORMS.GAD7.scoringSystem.minScore).toBe(0);
      expect(CLINICAL_FORMS.GAD7.scoringSystem.maxScore).toBe(21);
    });

    it("PHQ-9 deve ter 5 níveis de interpretação", () => {
      expect(CLINICAL_FORMS.PHQ9.scoringSystem.interpretation.length).toBe(5);
    });

    it("GAD-7 deve ter 4 níveis de interpretação", () => {
      expect(CLINICAL_FORMS.GAD7.scoringSystem.interpretation.length).toBe(4);
    });
  });
});
