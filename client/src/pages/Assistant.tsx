import { trpc } from "@/lib/trpc";
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
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import TherapistSuggestions from "@/components/TherapistSuggestions";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o Assistente Clínico da Psi. Daniela Coelho. Posso ajudar você a:\n\n- Consultar sua agenda de hoje\n- Verificar horários vagos\n- Resumir sessões de pacientes\n- Gerenciar agendamentos\n\nVocê pode digitar ou usar o botão de microfone para falar!",
      timestamp: new Date(),
    },
  ]);
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const chatMutation = trpc.assistant.chat.useMutation();

  // Iniciar gravação de áudio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Gravação iniciada. Fale agora!");
    } catch (error) {
      toast.error("Erro ao acessar microfone");
      console.error(error);
    }
  }, []);

  // Parar gravação
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Transcrever áudio
  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        setIsProcessing(true);
        
        // Converter blob para base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          // Aqui você pode enviar para um serviço de transcrição
          // Por enquanto, vamos simular com uma mensagem
          const transcribedText = "Transcrição de áudio recebida";
          setTextInput(transcribedText);
          toast.success("Áudio transcrito!");
        };
        reader.readAsDataURL(audioBlob);
      } catch (error) {
        toast.error("Erro ao transcrever áudio");
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setTextInput("");
      setIsProcessing(true);

      try {
        const result = await chatMutation.mutateAsync({ message: text });

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        // Gerar sugestões baseadas na resposta (apenas para Dani ver)
        const newSuggestions = [
          {
            type: "technique" as const,
            title: "Técnica Recomendada",
            description: "TCC pode ser efetiva para este padrão de pensamento",
            priority: "high" as const,
            timestamp: new Date(),
          },
          {
            type: "question" as const,
            title: "Pergunta de Acompanhamento",
            description: "Explorar mais sobre as emoções relacionadas",
            priority: "medium" as const,
            timestamp: new Date(),
          },
        ];
        setSuggestions(newSuggestions);
      } catch (error) {
        toast.error("Erro ao processar mensagem");
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [chatMutation]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex h-full gap-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5" />
            Assistente Clínico com Voz
          </CardTitle>

        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <BotMessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                  </div>
                  {msg.role === "user" && (
                    <User className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <BotMessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="bg-muted px-4 py-2 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Digite sua pergunta ou use o microfone..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isProcessing) {
                  handleSendMessage(textInput);
                }
              }}
              disabled={isProcessing || isRecording}
            />
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              title={isRecording ? "Parar gravação" : "Iniciar gravação"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => handleSendMessage(textInput)}
              disabled={isProcessing || !textInput.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <TherapistSuggestions suggestions={suggestions} isVisible={showSuggestions} />
    </div>
  );
}
