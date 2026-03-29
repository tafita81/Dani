import { useState, useEffect, useRef, useCallback } from "react";

interface SiriVoiceState {
  isListening: boolean;
  transcript: string;
  isFinal: boolean;
  confidence: number;
  error: string | null;
  siriActive: boolean;
}

interface VoiceCommand {
  command: string;
  action: () => void;
  aliases: string[];
}

export function useSiriVoiceControl() {
  const [state, setState] = useState<SiriVoiceState>({
    isListening: false,
    transcript: "",
    isFinal: false,
    confidence: 0,
    error: null,
    siriActive: false,
  });

  const recognitionRef = useRef<any>(null);
  const commandsRef = useRef<VoiceCommand[]>([]);

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState((prev) => ({
        ...prev,
        error: "Web Speech API não suportada neste navegador",
      }));
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "pt-BR";

    // Evento: Começou a ouvir
    recognitionRef.current.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
        transcript: "",
      }));
    };

    // Evento: Resultado de reconhecimento
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        maxConfidence = Math.max(maxConfidence, confidence);

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        transcript: finalTranscript || interimTranscript,
        isFinal: finalTranscript.length > 0,
        confidence: Math.round(maxConfidence * 100),
      }));

      // Processar comando se final
      if (finalTranscript) {
        processCommand(finalTranscript.toLowerCase().trim());
      }
    };

    // Evento: Parou de ouvir
    recognitionRef.current.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
      }));
    };

    // Evento: Erro
    recognitionRef.current.onerror = (event: any) => {
      setState((prev) => ({
        ...prev,
        error: `Erro de voz: ${event.error}`,
      }));
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Registrar comando de voz
  const registerCommand = useCallback(
    (command: string, action: () => void, aliases: string[] = []) => {
      commandsRef.current.push({
        command: command.toLowerCase(),
        action,
        aliases: aliases.map((a) => a.toLowerCase()),
      });
    },
    []
  );

  // Processar comando de voz
  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();

    for (const cmd of commandsRef.current) {
      if (
        lowerTranscript.includes(cmd.command) ||
        cmd.aliases.some((alias) => lowerTranscript.includes(alias))
      ) {
        cmd.action();
        return;
      }
    }
  }, []);

  // Iniciar escuta
  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      recognitionRef.current.start();
      setState((prev) => ({ ...prev, siriActive: true }));
    }
  }, [state.isListening]);

  // Parar escuta
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState((prev) => ({ ...prev, siriActive: false }));
    }
  }, []);

  // Alternar escuta
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Ativar Siri (simular com escuta contínua)
  const activateSiri = useCallback(() => {
    if (!state.siriActive) {
      startListening();
    }
  }, [state.siriActive, startListening]);

  // Limpar transcrição
  const clearTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: "",
      isFinal: false,
    }));
  }, []);

  return {
    state,
    registerCommand,
    startListening,
    stopListening,
    toggleListening,
    activateSiri,
    clearTranscript,
  };
}

/**
 * Hook para controle de volume do dispositivo
 */
export function useDeviceVolumeControl() {
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  // Detectar botões de volume do dispositivo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Botões de volume (simulado com setas)
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setVolume((prev) => Math.min(prev + 10, 100));
        setIsMuted(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setVolume((prev) => Math.max(prev - 10, 0));
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Detectar mudanças de volume do dispositivo (iOS)
  useEffect(() => {
    const handleVolumeChange = (e: any) => {
      if (e.detail && e.detail.volume !== undefined) {
        setVolume(Math.round(e.detail.volume * 100));
      }
    };

    window.addEventListener("volumechange", handleVolumeChange);
    return () => window.removeEventListener("volumechange", handleVolumeChange);
  }, []);

  const setDeviceVolume = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    volume,
    isMuted,
    setDeviceVolume,
    toggleMute,
  };
}

/**
 * Hook para integração completa de voz e volume
 */
export function useCarVoiceAssistant() {
  const voice = useSiriVoiceControl();
  const deviceVolume = useDeviceVolumeControl();

  // Registrar comandos padrão de volume
  useEffect(() => {
    voice.registerCommand(
      "ativar volume",
      () => deviceVolume.setDeviceVolume(70),
      ["ligar som", "aumentar volume", "som ligado"]
    );

    voice.registerCommand(
      "desativar volume",
      () => deviceVolume.toggleMute(),
      ["desligar som", "mudo", "silenciar", "som desligado"]
    );

    voice.registerCommand(
      "volume máximo",
      () => deviceVolume.setDeviceVolume(100),
      ["máximo", "volume alto", "som alto"]
    );

    voice.registerCommand(
      "volume mínimo",
      () => deviceVolume.setDeviceVolume(10),
      ["mínimo", "volume baixo", "som baixo"]
    );
  }, [voice, deviceVolume]);

  return {
    voice,
    deviceVolume,
  };
}
