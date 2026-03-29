import { useState, useCallback, useRef } from "react";

interface TTSOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Hook para converter texto em fala (Text-to-Speech)
 * Usa Web Speech API do navegador
 */
export function useTextToSpeech(options: TTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    language = "pt-BR",
    rate = 1,
    pitch = 1,
    volume = 1,
  } = options;

  // Inicializar Speech Synthesis
  const initSynthesis = useCallback(() => {
    if (!synthRef.current) {
      const synth = window.speechSynthesis;
      if (!synth) {
        setError("Web Speech API não suportada neste navegador");
        return false;
      }
      synthRef.current = synth;
    }
    return true;
  }, []);

  // Falar texto
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!initSynthesis()) {
        return;
      }

      // Cancelar fala anterior
      if (synthRef.current?.speaking) {
        synthRef.current.cancel();
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setError(null);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          onEnd?.();
        };

        utterance.onerror = (event) => {
          setError(`Erro ao falar: ${event.error}`);
          setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        synthRef.current?.speak(utterance);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
      }
    },
    [initSynthesis, language, rate, pitch, volume]
  );

  // Pausar fala
  const pause = useCallback(() => {
    if (synthRef.current?.speaking && !synthRef.current?.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  // Retomar fala
  const resume = useCallback(() => {
    if (synthRef.current?.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  // Parar fala
  const stop = useCallback(() => {
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  // Obter vozes disponíveis
  const getVoices = useCallback(() => {
    if (!initSynthesis()) {
      return [];
    }

    const voices = synthRef.current?.getVoices() || [];
    // Filtrar vozes em Português Brasileiro
    return voices.filter(
      (voice) =>
        voice.lang.startsWith("pt-BR") ||
        voice.lang.startsWith("pt_BR") ||
        voice.name.toLowerCase().includes("portuguese")
    );
  }, [initSynthesis]);

  // Definir voz
  const setVoice = useCallback((voiceName: string) => {
    const voices = getVoices();
    const voice = voices.find((v) => v.name === voiceName);

    if (voice && utteranceRef.current) {
      utteranceRef.current.voice = voice;
    }
  }, [getVoices]);

  return {
    isSpeaking,
    isPaused,
    error,
    speak,
    pause,
    resume,
    stop,
    getVoices,
    setVoice,
  };
}

/**
 * Hook para falar resposta com feedback visual
 */
export function useSpeakResponse() {
  const tts = useTextToSpeech({
    language: "pt-BR",
    rate: 0.95,
    pitch: 1,
    volume: 1,
  });

  const speakResponse = useCallback(
    (text: string, onComplete?: () => void) => {
      // Limpar pontuação extra
      const cleanText = text
        .replace(/\*\*/g, "") // Remove **
        .replace(/\n+/g, " ") // Remove quebras de linha
        .trim();

      tts.speak(cleanText, onComplete);
    },
    [tts]
  );

  return {
    ...tts,
    speakResponse,
  };
}
