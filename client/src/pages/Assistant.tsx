
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { Streamdown } from "streamdown";
import {
  Mic,
  MicOff,
  Send,
  BotMessageSquare,
  User,
  Radio,
  Loader2,
  Volume2,
  VolumeX,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o **Assistente Clínico**. Posso ajudar você a:\n\n- Consultar sua agenda de hoje\n- Verificar horários vagos\n- Resumir sessões de pacientes\n- Gerenciar agendamentos\n\nVocê pode digitar ou usar o **comando de voz**. Ative o modo **escuta contínua** para falar naturalmente enquanto dirige ou entre atendimentos.",
      timestamp: new Date(),
    },
  ]);
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.assistant.chat.useMutation();

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setTextInput("");
      setIsProcessing(true);

      try {
        const result = await chatMutation.mutateAsync({ message: text.trim() });

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Text-to-speech if enabled
        if (ttsEnabled && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(result.response.replace(/[*#_`]/g, ""));
          utterance.lang = "pt-BR";
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        toast.error("Erro ao processar sua mensagem. Tente novamente.");
        console.error("[Assistant] Error:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, chatMutation, ttsEnabled]
  );

  const voice = useVoiceRecognition(handleSendMessage);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, voice.transcript, voice.interimTranscript]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(textInput);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Chat limpo. Como posso ajudar?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assistente IA</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Fale ou digite para consultar agenda, resumir sessões e gerenciar horários
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="gap-1.5"
            >
              {ttsEnabled ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              <span className="hidden sm:inline text-xs">
                {ttsEnabled ? "Voz ativa" : "Voz muda"}
              </span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearChat} className="gap-1.5">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Limpar</span>
            </Button>
          </div>
        </div>

        {/* Voice Status Bar */}
        {voice.isListening && (
          <Card className="mb-3 border-primary/30 bg-primary/5 shadow-none">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="h-5 w-5 text-primary animate-pulse" />
                  <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">
                      {voice.isContinuousMode ? "Escuta contínua ativa" : "Ouvindo..."}
                    </span>
                    {voice.isContinuousMode && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        AUTO
                      </span>
                    )}
                  </div>
                  {(voice.transcript || voice.interimTranscript) && (
                    <p className="text-sm text-foreground truncate">
                      {voice.transcript}
                      {voice.interimTranscript && (
                        <span className="text-muted-foreground italic">
                          {" "}{voice.interimTranscript}
                        </span>
                      )}
                    </p>
                  )}
                  {!voice.transcript && !voice.interimTranscript && (
                    <p className="text-xs text-muted-foreground">
                      Fale agora... O comando será enviado após 2 segundos de silêncio.
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={voice.stopListening}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <MicOff className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="flex-1 border-0 shadow-sm overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            <div className="space-y-4 pb-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <BotMessageSquare className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-sm prose prose-sm max-w-none [&_p]:mb-1 [&_ul]:mb-1 [&_li]:mb-0">
                        <Streamdown>{msg.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BotMessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Processando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Input Area */}
        <div className="mt-3 space-y-2">
          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={voice.isContinuousMode ? "default" : "outline"}
              size="sm"
              onClick={voice.toggleContinuousMode}
              disabled={!voice.isSupported}
              className="gap-2"
            >
              <Radio className={`h-4 w-4 ${voice.isContinuousMode ? "animate-pulse" : ""}`} />
              {voice.isContinuousMode ? "Parar escuta contínua" : "Escuta contínua"}
            </Button>

            <Button
              variant={voice.isListening && !voice.isContinuousMode ? "destructive" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-full shadow-md"
              onClick={() => {
                if (voice.isListening && !voice.isContinuousMode) {
                  voice.stopListening();
                } else if (!voice.isListening) {
                  voice.startListening();
                }
              }}
              disabled={!voice.isSupported || voice.isContinuousMode}
            >
              {voice.isListening && !voice.isContinuousMode ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {!voice.isSupported && (
              <p className="text-xs text-muted-foreground">
                Voz não suportada neste navegador
              </p>
            )}
          </div>

          {/* Text Input */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Digite seu comando ou pergunta..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button type="submit" disabled={!textInput.trim() || isProcessing} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {voice.error && (
            <p className="text-xs text-destructive text-center">{voice.error}</p>
          )}
        </div>
      </div>
    </>
  );
}
