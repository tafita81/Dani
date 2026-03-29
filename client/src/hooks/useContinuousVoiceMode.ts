/**
 * Hook para Modo de Voz Contínuo
 * Permite múltiplas perguntas sem parar entre elas
 */

import { useEffect, useRef, useState, useCallback } from "react";

export interface ContinuousVoiceConfig {
  language: string;
  silenceTimeout: number; // ms
  minConfidence: number; // 0-1
  maxSilenceDuration: number; // ms
}

export interface VoiceSegment {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

const DEFAULT_CONFIG: ContinuousVoiceConfig = {
  language: "pt-BR",
  silenceTimeout: 2000,
  minConfidence: 0.5,
  maxSilenceDuration: 3000,
};

export const useContinuousVoiceMode = (config: Partial<ContinuousVoiceConfig> = {}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimeRef = useRef<number>(Date.now());

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<VoiceSegment[]>([]);
  const [isSilent, setIsSilent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detectar fim de frase por silêncio
  const detectEndOfSentence = useCallback((text: string): boolean => {
    const endMarkers = [".", "!", "?", "…"];
    const lastChar = text.trim().slice(-1);
    return endMarkers.includes(lastChar);
  }, []);

  // Detectar silêncio prolongado
  const detectSilence = useCallback(() => {
    const now = Date.now();
    const silenceDuration = now - lastSoundTimeRef.current;

    if (silenceDuration > mergedConfig.maxSilenceDuration) {
      setIsSilent(true);
      return true;
    }
    return false;
  }, [mergedConfig.maxSilenceDuration]);

  // Inicializar reconhecimento de voz
  const initializeRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech Recognition não suportado neste navegador");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.language = mergedConfig.language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      lastSoundTimeRef.current = Date.now();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        const isFinal = event.results[i].isFinal;

        if (isFinal && confidence >= mergedConfig.minConfidence) {
          finalTranscript += transcript + " ";

          // Registrar segmento final
          const segment: VoiceSegment = {
            text: transcript,
            confidence,
            isFinal: true,
            timestamp: new Date(),
          };

          setSegments((prev) => [...prev, segment]);

          // Verificar fim de frase
          if (detectEndOfSentence(transcript)) {
            // Emitir evento de pergunta completa
            const event = new CustomEvent("questionComplete", {
              detail: { text: finalTranscript.trim() },
            });
            window.dispatchEvent(event);
          }
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      lastSoundTimeRef.current = Date.now();

      // Resetar timer de silêncio
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        if (detectSilence()) {
          // Emitir evento de silêncio detectado
          const event = new CustomEvent("silenceDetected", {
            detail: { duration: mergedConfig.maxSilenceDuration },
          });
          window.dispatchEvent(event);
        }
      }, mergedConfig.silenceTimeout);
    };

    recognition.onerror = (event: any) => {
      setError(`Erro de reconhecimento: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    return recognition;
  }, [mergedConfig, detectEndOfSentence, detectSilence]);

  // Iniciar modo contínuo
  const startContinuousMode = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }

    if (recognitionRef.current) {
      recognitionRef.current.start();
      setSegments([]);
      setTranscript("");
      setIsSilent(false);
    }
  }, [initializeRecognition]);

  // Parar modo contínuo
  const stopContinuousMode = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  }, []);

  // Limpar recursos
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    segments,
    isSilent,
    error,
    startContinuousMode,
    stopContinuousMode,
    clearSegments: () => setSegments([]),
  };
};
