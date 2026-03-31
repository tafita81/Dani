import { describe, it, expect } from "vitest";
import {
  detectEmotions,
  generateEmotionBasedSuggestions,
  trackEmotionalEvolution,
} from "./emotionRealTimeAnalysis";

describe("Emotion Real-Time Analysis", () => {
  describe("detectEmotions", () => {
    it("should detect primary emotion from transcript", () => {
      const transcript = "Estou muito feliz e alegre com os resultados!";
      const result = detectEmotions(transcript);

      expect(result.primaryEmotion).toBe("alegria");
      expect(result.intensity).toBeGreaterThan(0);
    });

    it("should detect sadness emotion", () => {
      const transcript = "Me sinto triste e infeliz com tudo isso";
      const result = detectEmotions(transcript);

      expect(result.primaryEmotion).toBe("tristeza");
      expect(result.intensity).toBeGreaterThan(0);
    });

    it("should detect anxiety emotion", () => {
      const transcript = "Estou muito ansioso e nervoso sobre isso";
      const result = detectEmotions(transcript);

      expect(result.primaryEmotion).toBe("ansiedade");
    });

    it("should calculate intensity correctly", () => {
      const transcript =
        "Feliz, alegre, contente, animado, ótimo, maravilhoso!";
      const result = detectEmotions(transcript);

      expect(result.intensity).toBeGreaterThan(0);
      expect(result.intensity).toBeLessThanOrEqual(10);
    });

    it("should return neutral emotion for empty transcript", () => {
      const transcript = "";
      const result = detectEmotions(transcript);

      expect(result.primaryEmotion).toBe("neutra");
      expect(result.intensity).toBe(0);
    });

    it("should handle multiple emotions", () => {
      const transcript = "Estou feliz mas também ansioso sobre o futuro";
      const result = detectEmotions(transcript);

      expect(result.secondaryEmotions.length).toBeGreaterThan(0);
    });
  });

  describe("generateEmotionBasedSuggestions", () => {
    it("should generate TCC suggestions for happiness", async () => {
      const suggestions = await generateEmotionBasedSuggestions(
        "alegria",
        7,
        "TCC"
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain("pensamento");
    });

    it("should generate TCC suggestions for anxiety", async () => {
      const suggestions = await generateEmotionBasedSuggestions(
        "ansiedade",
        8,
        "TCC"
      );

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should generate Gestalt suggestions for sadness", async () => {
      const suggestions = await generateEmotionBasedSuggestions(
        "tristeza",
        6,
        "Gestalt"
      );

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should generate Schema therapy suggestions for anger", async () => {
      const suggestions = await generateEmotionBasedSuggestions(
        "raiva",
        7,
        "Esquema"
      );

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should return default suggestions for unknown emotion", async () => {
      const suggestions = await generateEmotionBasedSuggestions(
        "emoção_desconhecida",
        5,
        "Integrativa"
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain("emoção");
    });
  });

  describe("trackEmotionalEvolution", () => {
    it("should track emotional evolution over time", () => {
      const emotionHistory = [
        { emotion: "tristeza", timestamp: new Date(Date.now() - 30 * 60000) },
        { emotion: "tristeza", timestamp: new Date(Date.now() - 20 * 60000) },
        { emotion: "calma", timestamp: new Date(Date.now() - 10 * 60000) },
        { emotion: "esperança", timestamp: new Date() },
      ];

      const evolution = trackEmotionalEvolution(emotionHistory);

      expect(evolution.dominantEmotions).toContain("tristeza");
      expect(evolution.emotionalTrend).toBeDefined();
    });

  it("should detect emotional shifts", () => {
      const emotionHistory = [
        { emotion: "alegria", timestamp: new Date(Date.now() - 30 * 60000) },
        { emotion: "ansiedade", timestamp: new Date(Date.now() - 20 * 60000) },
        { emotion: "raiva", timestamp: new Date(Date.now() - 10 * 60000) },
        { emotion: "calma", timestamp: new Date() },
      ];

      const evolution = trackEmotionalEvolution(emotionHistory);

      expect(evolution.emotionalShifts.length).toBeGreaterThan(0);
      expect(evolution.emotionalShifts[0].from).toBe("alegria");
    });

    it("should identify stable emotional trend", () => {
      const emotionHistory = [
        { emotion: "calma", timestamp: new Date(Date.now() - 30 * 60000) },
        { emotion: "calma", timestamp: new Date(Date.now() - 20 * 60000) },
        { emotion: "calma", timestamp: new Date(Date.now() - 10 * 60000) },
        { emotion: "calma", timestamp: new Date() },
      ];

      const evolution = trackEmotionalEvolution(emotionHistory);

      expect(evolution.emotionalTrend).toBe("stable");
    });

    it("should handle empty emotion history", () => {
      const evolution = trackEmotionalEvolution([]);

      expect(evolution.dominantEmotions).toEqual([]);
      expect(evolution.emotionalTrend).toBe("stable");
    });
  });
});
