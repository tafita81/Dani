import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isContinuousMode: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
}

export interface VoiceRecognitionActions {
  startListening: () => void;
  stopListening: () => void;
  toggleContinuousMode: () => void;
  clearTranscript: () => void;
}

const SILENCE_TIMEOUT_MS = 2000; // 2 seconds of silence triggers send

export function useVoiceRecognition(
  onFinalTranscript?: (text: string) => void
): VoiceRecognitionState & VoiceRecognitionActions {
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const continuousModeRef = useRef(false);
  const isListeningRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      // Silence detected - send accumulated transcript
      const finalText = accumulatedTranscriptRef.current.trim();
      if (finalText && onFinalTranscript) {
        onFinalTranscript(finalText);
        accumulatedTranscriptRef.current = "";
        setTranscript("");
        setInterimTranscript("");
      }
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer, onFinalTranscript]);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        accumulatedTranscriptRef.current += " " + final;
        setTranscript(accumulatedTranscriptRef.current.trim());
        // Reset silence timer on new final result
        startSilenceTimer();
      }

      setInterimTranscript(interim);

      if (interim) {
        // Speech is happening, clear silence timer
        clearSilenceTimer();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // Not a real error, just no speech detected
        return;
      }
      if (event.error === "aborted") {
        return;
      }
      console.warn("[Voice] Recognition error:", event.error);
      setError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;

      // If continuous mode is on, restart recognition
      if (continuousModeRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            // Already started or other error
          }
        }, 100);
      }
    };

    return recognition;
  }, [isSupported, startSilenceTimer, clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    accumulatedTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");

    try {
      recognition.start();
    } catch (e) {
      setError("Não foi possível iniciar o reconhecimento de voz");
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    continuousModeRef.current = false;
    setIsContinuousMode(false);
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // Send any remaining transcript
    const finalText = accumulatedTranscriptRef.current.trim();
    if (finalText && onFinalTranscript) {
      onFinalTranscript(finalText);
      accumulatedTranscriptRef.current = "";
      setTranscript("");
      setInterimTranscript("");
    }

    setIsListening(false);
    isListeningRef.current = false;
  }, [clearSilenceTimer, onFinalTranscript]);

  const toggleContinuousMode = useCallback(() => {
    if (continuousModeRef.current) {
      // Turn off continuous mode
      stopListening();
    } else {
      // Turn on continuous mode
      continuousModeRef.current = true;
      setIsContinuousMode(true);
      startListening();
    }
  }, [startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    accumulatedTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        continuousModeRef.current = false;
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    isContinuousMode,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleContinuousMode,
    clearTranscript,
  };
}
