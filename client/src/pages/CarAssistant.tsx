"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Clock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function CarAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; time: string }>>([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  const recognitionRef = useRef<any>(null);
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // tRPC mutations for AI agent
  const processQueryMutation = trpc.agent.processQuery.useMutation();
  
  // Check for quick voice commands
  const checkQuickCommand = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('próxima consulta')) return 'Sua próxima consulta está marcada para amanhã às 14:00 com o paciente João Silva.';
    if (lowerText.includes('pacientes hoje')) return 'Você tem 6 consultas agendadas para hoje, começando às 9:00 da manhã.';
    if (lowerText.includes('novo lead')) return 'Você tem 3 novos leads aguardando contato. Gostaria de saber mais sobre algum deles?';
    if (lowerText.includes('quantos pacientes')) return 'Você tem 100 pacientes ativos em seu banco de dados.';
    if (lowerText.includes('próximos agendamentos')) return 'Seus próximos 5 agendamentos são: 14:00 com João, 15:00 com Maria, 16:00 com Pedro, 17:00 com Ana e 18:00 com Carlos.';
    // Patient analysis questions go to full agent processing
    return null;
  };
  
  // Speak response automatically
  const speakResponse = (text: string) => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    const ptVoice = voicesList.find((v) => v.lang.includes('pt') || v.lang.includes('PT'));
    if (ptVoice) utterance.voice = ptVoice;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('[CarAssistant] TTS error:', e);
      setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Update time every second (to show real-time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setCurrentTime(time);
    };
    
    // Update immediately
    updateTime();
    
    // Update every 100ms for smooth updates
    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoicesList(voices);
      console.log(`[CarAssistant] Loaded ${voices.length} voices`);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // Initialize Web Speech API - CONTINUOUS MODE
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API não suportado neste navegador");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // SEMPRE ATIVO
    recognition.interimResults = true;
    recognition.lang = "pt-BR";
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    let interimTranscript = "";

    recognition.onstart = () => {
      console.log("[CarAssistant] Recognition started - CONTINUOUS MODE");
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + " ";
          console.log("[CarAssistant] Final transcript:", transcriptSegment);

          // Clear silence timeout when new final result
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Set timeout to process after 2 seconds of silence
          silenceTimeoutRef.current = setTimeout(() => {
            if (finalTranscript.trim() && !isProcessingRef.current) {
              console.log("[CarAssistant] Processing after silence:", finalTranscript.trim());
              processTranscript(finalTranscript.trim());
              finalTranscript = ""; // Reset for next query
            }
          }, 2000);
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      // Display both final and interim
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("[CarAssistant] Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        toast.error(`Erro: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("[CarAssistant] Recognition ended - restarting (continuous mode)");
      // Restart recognition to keep it continuous
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.log("[CarAssistant] Recognition already started");
        }
      }
    };

    recognitionRef.current = recognition;

    // Start listening on mount
    try {
      recognition.start();
    } catch (e) {
      console.log("[CarAssistant] Recognition already started");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      console.log("[CarAssistant] Stopping recognition");
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    } else {
      console.log("[CarAssistant] Starting recognition - CONTINUOUS MODE");
      setTranscript("");
      setResponse("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;

    console.log("[CarAssistant] Processing transcript:", text);
    isProcessingRef.current = true;
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // Check for quick commands first
      const quickResponse = checkQuickCommand(text);
      if (quickResponse) {
        console.log("[CarAssistant] Quick command matched:", quickResponse);
        setResponse(quickResponse);
        const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        setMessages((prev) => [
          ...prev,
          { role: "user", content: text, time },
          { role: "assistant", content: quickResponse, time },
        ]);
        // Speak response automatically
        speakResponse(quickResponse);
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      console.log("[CarAssistant] Calling agent.processQuery with COMPLETE database context");

      // Get client's current date and time (NOT server time)
      const clientNow = new Date();
      const clientTimestamp = clientNow.toISOString();
      const clientTime = clientNow.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const clientDate = clientNow.toISOString().split("T")[0]; // YYYY-MM-DD
      const clientHours = clientNow.getHours();
      const clientMinutes = clientNow.getMinutes();
      const clientSeconds = clientNow.getSeconds();
      console.log("[CarAssistant] Client time:", clientTime, "Date:", clientDate, "Hours:", clientHours, "Minutes:", clientMinutes);

      // Call AI agent with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Agent timeout after 15s")), 15000)
      );

      const result = await Promise.race([
        processQueryMutation.mutateAsync({
          query: text,
          context: "Psychologist driving - provide brief, safe response in Portuguese. Access ALL database tables for comprehensive answers.",
          clientTimestamp: clientTimestamp,
          clientDate: clientDate,
          clientHours: clientHours,
          clientMinutes: clientMinutes,
          clientSeconds: clientSeconds,
        }),
        timeoutPromise,
      ]);

      const responseText = (result as any).text;
      console.log("[CarAssistant] Agent response received:", responseText.substring(0, 100));
      setResponse(responseText);

      // Add to messages
      const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, time },
        { role: "assistant", content: responseText, time },
      ]);

      // Speak response automatically in Portuguese (pt-BR)
      speakResponse(responseText);
      
      if ((result as any).shouldSpeak) {
        console.log("[CarAssistant] Speaking response");
        speakResponse(responseText);
      }

      toast.success("Resposta processada");
    } catch (error: any) {
      console.error("[CarAssistant] Error processing transcript:", error);

      // Fallback response
      const fallbackResponse = "Desculpe, não consegui processar sua solicitação. Tente novamente.";
      setResponse(fallbackResponse);

      const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, time },
        { role: "assistant", content: fallbackResponse, time },
      ]);

      speakResponse(fallbackResponse);
      toast.error("Erro ao processar pergunta");
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      const duration = Date.now() - startTime;
      console.log(`[CarAssistant] Processing completed in ${duration}ms`);
    }
  };

  // speakResponse moved to top of component to avoid duplication

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md bg-slate-800 border-green-500 border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-green-500" />
            <CardTitle className="text-green-500 text-4xl font-bold font-mono">{currentTime}</CardTitle>
          </div>
          <h1 className="text-2xl font-bold text-white">Dani Drive</h1>
          <p className="text-gray-300 text-sm mt-2">Assistente mãos-livres</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Microphone Button */}
          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              className={`w-32 h-32 rounded-full transition-all ${
                isListening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isListening ? (
                <Mic className="w-16 h-16" />
              ) : (
                <MicOff className="w-16 h-16" />
              )}
            </Button>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              className={`px-6 py-2 text-lg font-bold ${
                isProcessing
                  ? "bg-yellow-600"
                  : isListening
                    ? "bg-green-600"
                    : "bg-red-600"
              }`}
            >
              {isProcessing ? "PROCESSANDO" : isListening ? "ESCUTANDO" : "INATIVO"}
            </Badge>
          </div>

          {/* Stop Button */}
          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              className="bg-red-600 hover:bg-red-700 px-8 py-2 rounded-full font-bold"
            >
              {isListening ? "Toque para parar" : "Toque para iniciar"}
            </Button>
          </div>

          {/* Transcription */}
          {transcript && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Transcrição em tempo real</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200">{transcript}</p>
              </CardContent>
            </Card>
          )}

          {/* Response */}
          {response && (
            <Card className="bg-slate-700 border-green-500 border-2">
              <CardHeader>
                <CardTitle className="text-green-500 text-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Resposta da Dani
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200">{response}</p>
              </CardContent>
            </Card>
          )}

          {/* Conversation History */}
          {messages.length > 0 && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Histórico de Conversas</CardTitle>
              </CardHeader>
              <CardContent className="max-h-48 overflow-y-auto space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="text-gray-400">{msg.time}</p>
                    <p
                      className={`${
                        msg.role === "user"
                          ? "text-blue-300 font-semibold"
                          : "text-green-300"
                      }`}
                    >
                      {msg.role === "user" ? "Você: " : "Dani: "}
                      {msg.content}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
