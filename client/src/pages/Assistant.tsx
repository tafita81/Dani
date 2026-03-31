import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  BotMessageSquare,
  User,
  Loader2,
  Mic,
  MicOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  type?: "suggestion" | "analysis" | "recommendation" | "sentiment";
  sentiment?: {
    overallSentiment: string;
    emotionalStates: Array<{ emotion: string; intensity: number }>;
    riskIndicators: Array<{ indicator: string; severity: string }>;
  };
}

/**
 * ASSISTENTE IA - DURANTE CONSULTA
 * 
 * Funcionalidades:
 * ✅ Captura voz do paciente e da psicóloga
 * ✅ Transcrição silenciosa em tempo real
 * ✅ Análise com IA
 * ✅ Respostas APENAS em TEXTO (nunca áudio)
 * ✅ Invisível para o paciente (não vê na tela)
 * ✅ Apenas Daniela vê as sugestões
 * ✅ Sugestões clínicas em tempo real
 * ✅ Recomendações de técnicas
 * ✅ Análise de padrões
 */
export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "🤖 Assistente IA Ativo\n\nCapturando áudio da consulta...\nAnalisando em tempo real...\n\n(Invisível para o paciente)",
      timestamp: new Date(),
      type: "suggestion",
    },
  ]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [showToPatient, setShowToPatient] = useState(false); // Controle de visibilidade
  const [recordingTime, setRecordingTime] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clinicalMutation = trpc.clinicalAssistant.analyzeSession.useMutation();

  // Iniciar captura contínua de áudio (Web Speech API)
  const startRecording = useCallback(async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Web Speech API não suportada neste navegador");
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "pt-BR";

      let interimTranscript = "";

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((t) => t + 1);
        }, 1000);
        toast.success("🎤 Captura de áudio iniciada (silenciosa)");
      };

      recognition.onresult = (event: any) => {
        interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            // Frase completa - enviar para análise
            handleFinalTranscript(transcript);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscription(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Erro de reconhecimento:", event.error);
        toast.error(`Erro: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        toast.info("Captura de áudio finalizada");
      };

      recognition.start();
    } catch (error) {
      toast.error("Erro ao iniciar captura de áudio");
      console.error(error);
    }
  }, []);

  // Parar captura de áudio
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setTranscription("");
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, []);

  // Processar frase completa transcrita
  const handleFinalTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    try {
      setIsProcessing(true);

      // Adicionar transcrição ao chat (visível apenas para Daniela)
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: transcript,
        timestamp: new Date(),
        isVoice: true,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Enviar para análise silenciosa com IA (Daniela vê, paciente não)
      const response = await clinicalMutation.mutateAsync({
        transcript: transcript,
        history: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
      });

      // Adicionar INSIGHT da IA (APENAS TEXTO, SILENCIOSO, TÉCNICO)
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        type: "analysis", // Mudado para análise para destacar visualmente
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Scroll automático
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Erro ao processar transcrição:", error);
      toast.error("Erro ao analisar áudio");
    } finally {
      setIsProcessing(false);
    }
  }, [chatMutation]);

  // Scroll automático para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 h-full p-4">
      {/* CHAT - Área Principal */}
      <div className="flex-1 flex flex-col order-2 lg:order-1 min-h-0">
        <Card className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BotMessageSquare className="w-5 h-5 text-blue-600" />
              Assistente IA - Consulta
              <span className={`text-xs px-2 py-1 rounded-full ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-300 text-gray-700"}`}>
                {isRecording ? `🎤 Gravando (${recordingTime}s)` : "Parado"}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {/* Transcrição em Tempo Real */}
            {transcription && (
              <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-gray-700">
                <p className="font-semibold text-blue-900">Transcrevendo:</p>
                <p className="italic">{transcription}</p>
              </div>
            )}

            {/* Chat Messages */}
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : `${
                              msg.type === "suggestion"
                                ? "bg-green-100 text-green-900 border-l-4 border-green-500"
                                : msg.type === "analysis"
                                ? "bg-purple-100 text-purple-900 border-l-4 border-purple-500"
                                : "bg-orange-100 text-orange-900 border-l-4 border-orange-500"
                            } rounded-bl-none`
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-100" : "opacity-70"}`}>
                        {msg.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg rounded-bl-none">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Controles */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-1 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isProcessing}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Parar Captura
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Iniciar Captura
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowToPatient(!showToPatient)}
                variant="outline"
                className={showToPatient ? "bg-yellow-100 border-yellow-500" : ""}
              >
                {showToPatient ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Visível
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Invisível
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aviso de Privacidade */}
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
          <p>🔒 <strong>Privacidade:</strong> Este assistente é invisível para o paciente. Apenas você (Daniela) vê as análises e sugestões. Nenhum áudio é reproduzido.</p>
        </div>
      </div>

      {/* INFORMAÇÕES - Painel Lateral (Desktop) */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 gap-4 order-1">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">📊 Status da Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Duração:</span>
              <span className="font-bold">{recordingTime}s</span>
            </div>
            <div className="flex justify-between">
              <span>Mensagens:</span>
              <span className="font-bold">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-bold ${isRecording ? "text-red-600" : "text-green-600"}`}>
                {isRecording ? "🎤 Gravando" : "⏹️ Parado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Visibilidade:</span>
              <span className={`font-bold ${showToPatient ? "text-yellow-600" : "text-green-600"}`}>
                {showToPatient ? "👁️ Visível" : "🔒 Invisível"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">💡 Dicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-700">
            <p>✅ Clique em "Iniciar Captura" para começar</p>
            <p>✅ O assistente transcreve automaticamente</p>
            <p>✅ Análises aparecem em tempo real</p>
            <p>✅ Paciente nunca vê as sugestões</p>
            <p>✅ Nenhum áudio é reproduzido</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
