import { useState, useRef, useEffect } from "react";
import { useDarkModeAuto } from "@/hooks/useDarkModeAuto";
import { Volume2, VolumeX, Mic, MicOff, Settings, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpeakResponse, useTextToSpeech } from "@/hooks/useTextToSpeech";
import { trpc } from "@/lib/trpc";


interface ConversationMessage {
  id: string;
  type: "question" | "answer";
  text: string;
  timestamp: number;
  duration?: number;
}

export default function CarAssistant() {
  const [volume, setVolume] = useState({
    isEnabled: true,
    micLevel: 0,
    isMuted: false,
    siriActive: false,
    listeningActive: false,
    capturingMic: false,
  });

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [micHistory, setMicHistory] = useState<number[]>([]);
  const [maxMicLevel, setMaxMicLevel] = useState(0);
  const [avgMicLevel, setAvgMicLevel] = useState(0);
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  const [isTurboMode, setIsTurboMode] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(256));
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartRef = useRef<number | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const playAudioWithFallback = (text: string, onComplete?: () => void) => {
    console.log('[CarAssistant] playAudioWithFallback chamado com texto:', text.substring(0, 50));
    
    if (!window.speechSynthesis) {
      console.error('[CarAssistant] SpeechSynthesis não disponível no navegador');
      onComplete?.();
      return;
    }
    
    // Respeitar o estado de mudo e volume da interface
    if (volume.isMuted) {
      console.log('[CarAssistant] Áudio ignorado (MUDO ativo)');
      onComplete?.();
      return;
    }
    
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error('[CarAssistant] Erro ao cancelar fala anterior:', e);
    }
    
    // Limpar markdown e quebras de linha para uma fala mais fluida
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/#/g, "")
      .replace(/\n+/g, " ")
      .trim();
    
    const speakAction = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1;
        // Sincronizar volume da interface (0-100) com SpeechSynthesis (0-1)
        utterance.volume = 1; 
        
        const voices = window.speechSynthesis.getVoices();
        const ptBrVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt-PT') || v.lang.includes('pt'));
        if (ptBrVoice) {
          utterance.voice = ptBrVoice;
        }
        
        utterance.onstart = () => console.log('[CarAssistant] SpeechSynthesis INICIADO');
        utterance.onend = () => {
          console.log('[CarAssistant] SpeechSynthesis CONCLUÍDO');
          onComplete?.();
        };
        utterance.onerror = (event) => {
          console.error('[CarAssistant] SpeechSynthesis ERRO:', event.error);
          onComplete?.();
        };
        
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('[CarAssistant] Erro ao executar speak():', e);
        onComplete?.();
      }
    };

    // Pequeno delay para garantir que o cancel() anterior foi processado
    setTimeout(speakAction, 150);
  };

  const handleQuestionDetected = async (question: string) => {
    if (!question.trim()) return;

    const startTime = Date.now();
    setIsProcessing(true);
    setIsSearching(true);
    setSearchProgress(0);
    setTranscript("🔍 Buscando nos dados...");
    
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => Math.min(prev + Math.random() * 30, 90));
    }, 100);

    let result: any = null;
    
    try {
      // NUNCA usar cache - SEMPRE fazer requisição fresh
      try {
        console.log(`[CarAssistant] Chamando API REST com pergunta: "${question}"`);
        
        // Chamar API REST com headers anti-cache e timestamp único
        const fullResponse = await fetch(`/api/assistente-carro/pergunta?t=${Date.now()}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({ question: question }),
          cache: 'no-store'
        });
        
        if (!fullResponse.ok) {
          throw new Error(`HTTP ${fullResponse.status}`);
        }
        
        const responseData = await fullResponse.json();
        console.log('[CarAssistant] Raw response:', JSON.stringify(responseData).substring(0, 500));
        
        result = responseData || {
          success: false,
          question: question,
          answer: 'Nenhum resultado encontrado.',
        };
        console.log('[CarAssistant] Resposta processada:', result);
      } catch (error: any) {
        console.error('[CarAssistant] Erro ao chamar API REST:', error);
        result = {
          success: false,
          question: question,
          answer: `Desculpe, ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        };
      }
      
      clearInterval(progressInterval);
      setSearchProgress(100);

      const elapsedTime = Date.now() - startTime;
      console.log(`[CarAssistant] Resposta recebida em ${elapsedTime}ms`);
      
      setIsSearching(false);
      setSearchProgress(0);

      let answer = result.answer || "Desculpe, não consegui processar sua pergunta.";
      
      if (isTurboMode && answer.length > 100) {
        const firstSentence = answer.split(/[.!?]/)[0];
        answer = firstSentence.length > 0 ? firstSentence + "." : answer.substring(0, 100) + "...";
      }

      const answerId = `answer-${Date.now()}`;
      setConversationHistory(prev => [
        ...prev,
        {
          id: `question-${Date.now()}`,
          type: "question",
          text: question,
          timestamp: Date.now(),
          duration: elapsedTime,
        },
        {
          id: answerId,
          type: "answer",
          text: answer,
          timestamp: Date.now(),
        },
      ]);

      setTranscript(answer);
      
      // Regra: Só ler após a resposta aparecer na tela (delay para renderização do React)
      setTimeout(() => {
        console.log('[CarAssistant] Resposta na tela, iniciando leitura...');
        playAudioWithFallback(answer, () => {
          console.log('[CarAssistant] Áudio concluído - Abrindo microfone automaticamente');
          // Abrir microfone automaticamente após áudio terminar
          setTimeout(() => {
            if (recognitionRef.current && !isListening) {
              console.log('[CarAssistant] Iniciando reconhecimento automático');
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error('[CarAssistant] Erro ao reiniciar microfone:', e);
              }
            }
          }, 500);
        });
      }, 300);

    } catch (error) {
      console.error("[CarAssistant] Erro geral:", error);
      setTranscript("Desculpe, ocorreu um erro ao processar sua pergunta.");
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition não suportado");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("[CarAssistant] Reconhecimento iniciado");
      setIsListening(true);
      setTranscript("");
      recordingStartRef.current = Date.now();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          console.log("[CarAssistant] Resultado final:", transcript);
          setTranscript(transcript);
          handleQuestionDetected(transcript);
        } else {
          interimTranscript += transcript;
        }
      }
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[CarAssistant] Erro no reconhecimento:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("[CarAssistant] Reconhecimento finalizado - Mantendo som ativo");
      setIsListening(false);
      // Reiniciar reconhecimento automaticamente para manter som ativo
      setTimeout(() => {
        if (recognitionRef.current && !isProcessing) {
          console.log("[CarAssistant] Reiniciando reconhecimento para manter som ativo");
          recognitionRef.current.start();
        }
      }, 100);
    };

    recognitionRef.current = recognition;
  };

  useEffect(() => {
    initializeSpeechRecognition();
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  useDarkModeAuto();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚗</span>
              <div>
                <CardTitle>Assistente Carro</CardTitle>
                <p className="text-sm text-blue-100">Conversa com IA em Português Brasileiro</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Página carregada</span>
                  <span className="text-green-600 dark:text-green-400">✓ Ativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Captura de Microfone</span>
                  <span className={isListening ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                    {isListening ? "✓ Ativo" : "Inativa"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reconhecimento de voz</span>
                  <span className={isListening ? "text-orange-600 dark:text-orange-400 animate-pulse" : "text-gray-400"}>
                    {isListening ? "🎤 Ouvindo..." : "Inativo"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Idioma</span>
                  <span className="text-blue-600 dark:text-blue-400">Português Brasileiro</span>
                </div>
              </CardContent>
            </Card>

            {transcript && (
              <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <p className="text-blue-900 dark:text-blue-100">✓{transcript}</p>
                </CardContent>
              </Card>
            )}

            {conversationHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Histórico de Conversa</h3>
                {conversationHistory.map((msg) => (
                  <Card key={msg.id} className={msg.type === "question" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"}>
                    <CardContent className="p-4">
                      <div className="flex gap-2">
                        <span className="text-lg">{msg.type === "question" ? "❓" : "✓"}</span>
                        <div className="flex-1">
                          <p className={msg.type === "question" ? "text-blue-900 dark:text-blue-100" : "text-green-900 dark:text-green-100"}>
                            {msg.type === "question" ? "Pergunta" : "Resposta"}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">{msg.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                            {msg.duration && ` • ${msg.duration}ms`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Sugestões</h3>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start" onClick={() => handleQuestionDetected("Ver evolução de paciente")}>
                  📈 Ver evolução de paciente
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleQuestionDetected("Listar pacientes inativos")}>
                  😴 Listar pacientes inativos
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={stopListening}>
                <MicOff className="mr-2" /> Parar
              </Button>
              <Button size="lg" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={startListening} disabled={isListening}>
                <Mic className="mr-2" /> Som
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <span className="text-sm font-medium">Modo Turbo</span>
              <Button variant="ghost" size="sm" onClick={() => setIsTurboMode(!isTurboMode)}>
                {isTurboMode ? "✓ Ativo" : "Inativo"}
              </Button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>📋 Como Usar:</p>
              <p>1. Clique em "Capturando" para ativar o microfone</p>
              <p>2. Clique em "Escutar" para começar a ouvir</p>
              <p>3. Faça sua pergunta</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
