import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Vibrate, X } from "lucide-react";
import { useLocation } from "wouter";

interface Suggestion {
  id: string;
  text: string;
  timestamp: Date;
  priority: "high" | "medium" | "low";
}

export default function CarAssistant() {
  const [, setLocation] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(true);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const sessionIdRef = useRef<string>("");

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API não suportada neste navegador");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";

    recognition.onstart = () => {
      console.log("Escuta iniciada");
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Frase completa - enviar para análise
          handleFinalTranscript(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Erro de reconhecimento:", event.error);
    };

    recognition.onend = () => {
      console.log("Escuta finalizada");
      if (isListening) {
        // Reiniciar se ainda deve estar escutando
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Suporte para Siri Shortcuts
  useEffect(() => {
    const handleSiriCommand = (command: string) => {
      const cmd = command.toLowerCase();
      if (cmd.includes("ativar") || cmd.includes("iniciar")) {
        if (!isListening) {
          toggleListening();
          vibrate([100, 50, 100, 50, 100]); // Padrao de ativacao
        }
      } else if (cmd.includes("desativar") || cmd.includes("parar")) {
        if (isListening) {
          toggleListening();
          vibrate([200, 100, 200]); // Padrao de desativacao
        }
      }
    };

    // Escutar comandos via URL params (Siri Shortcuts)
    const params = new URLSearchParams(window.location.search);
    const siriCmd = params.get("siri_command");
    if (siriCmd) {
      handleSiriCommand(siriCmd);
      // Limpar URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isListening]);

  // Iniciar/parar escuta
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Gerar ID de sessão
      sessionIdRef.current = `session_${Date.now()}`;
      recognitionRef.current?.start();
      setIsListening(true);
      setTranscript("");
      setSuggestions([]);
    }
  };

  // Processar transcrição final
  const handleFinalTranscript = async (text: string) => {
    console.log("Transcrição final:", text);

    // Adicionar sugestão simulada
    const newSuggestion: Suggestion = {
      id: `sugg_${Date.now()}`,
      text: `Análise: "${text}"`,
      timestamp: new Date(),
      priority: "medium",
    };

    setSuggestions((prev) => [newSuggestion, ...prev].slice(0, 5));

    // Ler sugestão em voz alta
    if (isTextToSpeechEnabled) {
      speakSuggestion(newSuggestion.text);
    }

    // Vibração de análise
    vibrate([100, 50, 100]); // Padrão de análise
  };

  // Text-to-Speech com feedback
  const speakSuggestion = (text: string) => {
    // Cancelar fala anterior se houver
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.85; // Mais lento para clareza
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      console.log("Iniciando leitura de sugestão");
    };
    
    utterance.onend = () => {
      console.log("Leitura concluída");
      // Vibração de conclusão
      if (isVibrationEnabled && navigator.vibrate) {
        navigator.vibrate([50, 30, 50]); // Padrão de conclusão
      }
    };
    
    utterance.onerror = (event) => {
      console.error("Erro ao falar:", event.error);
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  // Vibracao com padroes diferentes
  const vibrate = (pattern: number | number[]) => {
    if (isVibrationEnabled && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
  
  // Carregar Siri Shortcuts config
  useEffect(() => {
    const loadSiriConfig = async () => {
      try {
        const response = await fetch("/siri-shortcuts.json");
        const config = await response.json();
        console.log("Siri Shortcuts config carregado:", config);
      } catch (error) {
        console.error("Erro ao carregar Siri config:", error);
      }
    };
    loadSiriConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center border-b border-blue-100">
          <CardTitle className="text-2xl text-blue-900">
            Assistente Carro
          </CardTitle>
          <p className="text-xs text-gray-500 mt-2">
            Modo Hands-Free - Escuta Contínua
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Status */}
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 text-white" />
              ) : (
                <MicOff className="w-10 h-10 text-white" />
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {isListening ? "🎤 Escutando..." : "⏸️ Parado"}
            </p>
          </div>

          {/* Transcrição em Tempo Real */}
          {transcript && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 min-h-12">
              <p className="text-sm text-gray-700 italic">{transcript}</p>
            </div>
          )}

          {/* Botão Principal - Ativar/Desativar */}
          <Button
            onClick={toggleListening}
            className={`w-full h-14 text-lg font-bold transition-all ${
              isListening
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isListening ? "🛑 Desativar" : "▶️ Ativar"}
          </Button>

          {/* Controles */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTextToSpeechEnabled(!isTextToSpeechEnabled)}
              className={`flex-1 ${
                isTextToSpeechEnabled
                  ? "bg-blue-100 border-blue-300"
                  : "bg-gray-100"
              }`}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Som
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
              className={`flex-1 ${
                isVibrationEnabled
                  ? "bg-blue-100 border-blue-300"
                  : "bg-gray-100"
              }`}
            >
              <Vibrate className="w-4 h-4 mr-2" />
              Vibração
            </Button>
          </div>

          {/* Sugestões */}
          {suggestions.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Sugestões em Tempo Real
              </p>
              {suggestions.map((sugg) => (
                <div
                  key={sugg.id}
                  className="bg-amber-50 p-3 rounded border border-amber-200 text-sm text-gray-700"
                >
                  <p>{sugg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {sugg.timestamp.toLocaleTimeString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Botão Fechar */}
          <Button
            variant="ghost"
            onClick={() => setLocation("/assistente-ia")}
            className="w-full text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>

      {/* Dica para Siri */}
      {isListening && (
        <div className="fixed bottom-4 left-4 right-4 bg-black/80 text-white text-xs p-3 rounded text-center animate-pulse">
          💡 Dica: Diga "Ativar Assistente de Carro" para Siri ativar
        </div>
      )}
    </div>
  );
}
