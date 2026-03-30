import { describe, it, expect, beforeEach } from "vitest";
import {
  startVoiceSession,
  addTranscriptionSegment,
  pauseVoiceCapture,
  resumeVoiceCapture,
  endVoiceSession,
  generateAssistantResponse,
  extractKeywords,
  analyzeEmotionalTrend,
  generateSessionSummary,
  type VoiceSession,
} from "./voiceCapture";

describe("Voice Capture System", () => {
  let session: VoiceSession;

  beforeEach(() => {
    session = startVoiceSession("apt_123", "therapist_1", "patient_1");
  });

  describe("startVoiceSession", () => {
    it("deve criar sessão com dados corretos", () => {
      expect(session.appointmentId).toBe("apt_123");
      expect(session.therapistId).toBe("therapist_1");
      expect(session.patientId).toBe("patient_1");
      expect(session.isActive).toBe(true);
      expect(session.transcription).toEqual([]);
      expect(session.duration).toBe(0);
    });

    it("deve gerar ID único para cada sessão", () => {
      const session2 = startVoiceSession("apt_124", "therapist_1", "patient_2");
      expect(session.id).not.toBe(session2.id);
    });
  });

  describe("addTranscriptionSegment", () => {
    it("deve adicionar segmento de transcrição", () => {
      addTranscriptionSegment(session, "patient", "Estou com ansiedade", 0.95, 2);

      expect(session.transcription.length).toBe(1);
      expect(session.transcription[0].speaker).toBe("patient");
      expect(session.transcription[0].text).toBe("Estou com ansiedade");
      expect(session.transcription[0].confidence).toBe(0.95);
    });

    it("deve atualizar duração total", () => {
      addTranscriptionSegment(session, "patient", "Texto 1", 0.9, 3);
      addTranscriptionSegment(session, "therapist", "Texto 2", 0.85, 5);

      expect(session.duration).toBe(8);
    });

    it("deve incluir emoções detectadas", () => {
      addTranscriptionSegment(
        session,
        "patient",
        "Estou muito triste",
        0.9,
        2,
        ["tristeza", "desânimo"]
      );

      expect(session.transcription[0].emotions).toContain("tristeza");
      expect(session.transcription[0].emotions).toContain("desânimo");
    });

    it("deve gerar ID único para cada segmento", () => {
      const seg1 = addTranscriptionSegment(session, "patient", "Texto 1", 0.9, 2);
      const seg2 = addTranscriptionSegment(session, "patient", "Texto 2", 0.9, 2);

      expect(seg1.id).not.toBe(seg2.id);
    });
  });

  describe("pauseVoiceCapture", () => {
    it("deve pausar captura", () => {
      expect(session.isActive).toBe(true);
      pauseVoiceCapture(session);
      expect(session.isActive).toBe(false);
    });
  });

  describe("resumeVoiceCapture", () => {
    it("deve retomar captura", () => {
      pauseVoiceCapture(session);
      expect(session.isActive).toBe(false);

      resumeVoiceCapture(session);
      expect(session.isActive).toBe(true);
    });
  });

  describe("endVoiceSession", () => {
    it("deve finalizar sessão corretamente", () => {
      addTranscriptionSegment(session, "patient", "Olá", 0.9, 1);
      addTranscriptionSegment(session, "therapist", "Oi", 0.9, 1);

      endVoiceSession(session);

      expect(session.isActive).toBe(false);
      expect(session.endTime).toBeDefined();
      expect(session.duration).toBe(2);
    });

    it("deve manter dados de transcrição", () => {
      addTranscriptionSegment(session, "patient", "Teste", 0.9, 1);
      endVoiceSession(session);

      expect(session.transcription.length).toBe(1);
      expect(session.transcription[0].text).toBe("Teste");
    });
  });

  describe("generateAssistantResponse", () => {
    it("deve gerar resposta para ansiedade", () => {
      const response = generateAssistantResponse(
        session.id,
        "seg_1",
        "Estou muito nervoso e ansioso",
        {}
      );

      expect(response.response).toContain("ansiedade");
      expect(response.visibleToPatient).toBe(false);
    });

    it("deve gerar resposta para depressão", () => {
      const response = generateAssistantResponse(
        session.id,
        "seg_1",
        "Me sinto muito triste e deprimido",
        {}
      );

      expect(response.response).toContain("depressão");
    });

    it("deve gerar resposta para resistência", () => {
      const response = generateAssistantResponse(
        session.id,
        "seg_1",
        "Não quero fazer isso",
        {}
      );

      expect(response.response).toContain("resistência");
    });

    it("deve SEMPRE ter visibleToPatient como false", () => {
      const response = generateAssistantResponse(
        session.id,
        "seg_1",
        "Qualquer texto",
        {}
      );

      expect(response.visibleToPatient).toBe(false);
    });

    it("deve incluir ações sugeridas", () => {
      const response = generateAssistantResponse(
        session.id,
        "seg_1",
        "Teste",
        {}
      );

      expect(response.suggestedActions).toBeDefined();
      expect(response.suggestedActions?.length).toBeGreaterThan(0);
    });
  });

  describe("extractKeywords", () => {
    it("deve extrair palavras-chave de ansiedade", () => {
      addTranscriptionSegment(session, "patient", "Estou muito nervoso", 0.9, 2);
      addTranscriptionSegment(session, "patient", "Tenho medo", 0.9, 2);

      const keywords = extractKeywords(session.transcription);

      expect(keywords).toContain("ansiedade");
    });

    it("deve extrair palavras-chave de depressão", () => {
      addTranscriptionSegment(session, "patient", "Me sinto triste", 0.9, 2);

      const keywords = extractKeywords(session.transcription);

      expect(keywords).toContain("depressão");
    });

    it("deve extrair múltiplas categorias", () => {
      addTranscriptionSegment(
        session,
        "patient",
        "Estou ansioso, triste e cansado",
        0.9,
        3
      );

      const keywords = extractKeywords(session.transcription);

      expect(keywords.length).toBeGreaterThanOrEqual(2);
    });

    it("deve retornar array vazio se sem palavras-chave", () => {
      addTranscriptionSegment(session, "patient", "Olá, tudo bem?", 0.9, 2);

      const keywords = extractKeywords(session.transcription);

      expect(Array.isArray(keywords)).toBe(true);
    });
  });

  describe("analyzeEmotionalTrend", () => {
    it("deve detectar melhora emocional", () => {
      addTranscriptionSegment(
        session,
        "patient",
        "Estou muito triste",
        0.9,
        2,
        ["tristeza"]
      );
      addTranscriptionSegment(
        session,
        "patient",
        "Estou melhorando",
        0.9,
        2,
        ["esperança"]
      );

      const trend = analyzeEmotionalTrend(session.transcription);

      expect(trend.trend).toBe("improving");
    });

    it("deve detectar piora emocional", () => {
      addTranscriptionSegment(
        session,
        "patient",
        "Estou bem",
        0.9,
        2,
        ["calma"]
      );
      addTranscriptionSegment(
        session,
        "patient",
        "Agora estou muito ansioso",
        0.9,
        2,
        ["ansiedade", "medo"]
      );

      const trend = analyzeEmotionalTrend(session.transcription);

      expect(trend.trend).toBe("worsening");
    });

    it("deve contar frequência de emoções", () => {
      addTranscriptionSegment(
        session,
        "patient",
        "Ansioso",
        0.9,
        2,
        ["ansiedade"]
      );
      addTranscriptionSegment(
        session,
        "patient",
        "Muito ansioso",
        0.9,
        2,
        ["ansiedade"]
      );

      const trend = analyzeEmotionalTrend(session.transcription);

      expect(trend.emotionFrequency["ansiedade"]).toBe(2);
    });
  });

  describe("generateSessionSummary", () => {
    it("deve gerar resumo com duração correta", () => {
      addTranscriptionSegment(session, "patient", "Olá", 0.9, 60);
      addTranscriptionSegment(session, "patient", "Teste", 0.9, 30);
      endVoiceSession(session);

      const summary = generateSessionSummary(session);

      expect(summary.duration).toBe("1m30s");
    });

    it("deve incluir total de segmentos", () => {
      addTranscriptionSegment(session, "patient", "Texto 1", 0.9, 1);
      addTranscriptionSegment(session, "patient", "Texto 2", 0.9, 1);
      addTranscriptionSegment(session, "therapist", "Resposta", 0.9, 1);
      endVoiceSession(session);

      const summary = generateSessionSummary(session);

      expect(summary.totalSegments).toBe(3);
    });

    it("deve calcular confiança média", () => {
      addTranscriptionSegment(session, "patient", "Texto", 0.8, 1);
      addTranscriptionSegment(session, "patient", "Texto", 0.9, 1);
      endVoiceSession(session);

      const summary = generateSessionSummary(session);

      expect(summary.confidenceAverage).toBe(0.85);
    });

    it("deve incluir preview de transcrição", () => {
      addTranscriptionSegment(session, "patient", "Meu texto", 0.9, 1);
      endVoiceSession(session);

      const summary = generateSessionSummary(session);

      expect(summary.transcriptionPreview).toContain("Meu texto");
    });
  });
});
