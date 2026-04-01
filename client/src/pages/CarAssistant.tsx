import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Volume2, Lock, Unlock, Users, Calendar, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function CarAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedTab, setSelectedTab] = useState<"summary" | "patients" | "appointments" | "blocks">("summary");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Queries
  const voiceSummaryQuery = trpc.carAssistant.getVoiceSummary.useQuery();
  const todayApptsQuery = trpc.carAssistant.getTodayAppointments.useQuery();
  const nextAptQuery = trpc.carAssistant.getNextAppointment.useQuery();
  const blockedSlotsQuery = trpc.carAssistant.getBlockedSlots.useQuery();

  // Mutations
  const processVoiceQuestionMutation = trpc.carAssistant.processVoiceQuestion.useMutation();
  const blockTimeSlotMutation = trpc.carAssistant.blockTimeSlot.useMutation();
  const unblockTimeSlotMutation = trpc.carAssistant.unblockTimeSlot.useMutation();

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API não suportado neste navegador");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";

    let interimTranscript = "";
    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setAiResponse("");
    };

    recognition.onresult = (event: any) => {
      interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + " ";
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      // Clear previous silence timeout
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
      }

      // Set new silence timeout - when user stops talking for 2 seconds, process the question
      if (finalTranscript.trim()) {
        const timeout = setTimeout(() => {
          if (finalTranscript.trim()) {
            handleProcessQuestion(finalTranscript.trim());
            finalTranscript = "";
          }
        }, 2000);

        setSilenceTimeout(timeout);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
      }
    };
  }, [silenceTimeout]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setAiResponse("");
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsListening(false);
  };

  // Auto-speak response when it appears
  useEffect(() => {
    if (aiResponse && isListening && !isSpeaking) {
      console.log('Triggering TTS for response:', aiResponse);
      // Speak immediately when response arrives
      speakText(aiResponse);
    }
  }, [aiResponse, isListening, isSpeaking]);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-Speech não suportado");
      return;
    }

    console.log('Speaking text:', text);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.7; // Mais lento para melhor compreensão
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Volume máximo

    // Try to select Portuguese Brazilian voice
    const voices = window.speechSynthesis.getVoices();
    const ptBrVoice = voices.find(
      (voice) => voice.lang.startsWith("pt") && voice.lang.includes("BR")
    ) || voices.find((voice) => voice.lang.startsWith("pt"));
    
    if (ptBrVoice) {
      utterance.voice = ptBrVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      // Restart listening immediately after response is spoken
      if (recognitionRef.current && isListening) {
        console.log('Restarting listening after TTS');
        recognitionRef.current.start();
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleProcessQuestion = async (question: string) => {
    if (!question.trim()) return;

    setIsProcessing(true);
    try {
      const result = await processVoiceQuestionMutation.mutateAsync({
        question: question,
      });

      if (result.success) {
        setAiResponse(result.response);
        // Response will be automatically spoken via useEffect
      } else {
        toast.error(result.response);
        // Restart listening on error (only if still in listening mode)
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      // Restart listening on error (only if still in listening mode)
      setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.start();
        }
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assistente de Carro</h1>
              <p className="text-sm text-gray-600">Modo mãos-livres para psicólogos</p>
            </div>
            <div className="flex gap-2">
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  🎤 Ouvindo...
                </Badge>
              )}
              {isSpeaking && (
                <Badge variant="default" className="animate-pulse bg-green-600">
                  🔊 Falando...
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="default" className="animate-pulse bg-yellow-600">
                  ⚙️ Processando...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Voice Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Input */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                  Controle de Voz - Automático
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button
                    size="lg"
                    onClick={startListening}
                    disabled={isListening}
                    className="w-full gap-2 text-lg h-16 bg-green-600 hover:bg-green-700"
                  >
                    <Mic className="w-5 h-5" />
                    Iniciar Escuta
                  </Button>
                  <Button
                    size="lg"
                    onClick={stopListening}
                    disabled={!isListening}
                    variant="destructive"
                    className="w-full gap-2 text-lg h-16"
                  >
                    Parar
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Sua fala:</p>
                  <p className="text-lg font-medium text-gray-900 min-h-20">
                    {transcript || "Aguardando entrada... Fale sua pergunta naturalmente"}
                  </p>
                </div>

                {aiResponse && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                    <p className="text-sm text-gray-600 font-medium">Resposta da IA:</p>
                    <p className="text-base text-gray-900 leading-relaxed">{aiResponse}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => speakText(aiResponse)}
                        disabled={isSpeaking}
                        variant="outline"
                        className="flex-1 gap-2"
                        size="sm"
                      >
                        {isSpeaking ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Falando...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            Ouvir Novamente
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                    <p className="text-sm text-gray-700">Processando sua pergunta...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
              {(["summary", "patients", "appointments", "blocks"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                    selectedTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "summary" && "📊 Resumo"}
                  {tab === "patients" && "👥 Pacientes"}
                  {tab === "appointments" && "📅 Agenda"}
                  {tab === "blocks" && "🔒 Bloqueios"}
                </button>
              ))}
            </div>

            {/* Summary Tab */}
            {selectedTab === "summary" && voiceSummaryQuery.data && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Dia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Consultas Hoje</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {voiceSummaryQuery.data.todayAppointments}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Leads Ativos</p>
                      <p className="text-3xl font-bold text-green-600">
                        {voiceSummaryQuery.data.activeLeads}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Pacientes</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {voiceSummaryQuery.data.totalPatients}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => speakText(`Você tem ${voiceSummaryQuery.data.todayAppointments} consultas hoje, ${voiceSummaryQuery.data.totalPatients} pacientes e ${voiceSummaryQuery.data.activeLeads} leads ativos.`)}
                    disabled={isSpeaking}
                    className="w-full gap-2"
                  >
                    {isSpeaking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Falando...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Ouvir Resumo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Patients Tab */}
            {selectedTab === "patients" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Pacientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Pergunte sobre seus pacientes usando a voz</p>
                </CardContent>
              </Card>
            )}

            {/* Appointments Tab */}
            {selectedTab === "appointments" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Próximas Consultas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nextAptQuery.data?.found && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-medium">{nextAptQuery.data.appointment?.title}</p>
                       <p className="text-sm text-gray-600">
                        {nextAptQuery.data.appointment?.startTime}
                      </p>
                    </div>
                  )}

                  {todayApptsQuery.data && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Hoje ({todayApptsQuery.data.count})</p>
                      {todayApptsQuery.data.appointments.map((apt: any) => (
                        <div key={apt.id} className="p-2 bg-gray-50 rounded">
                          <p className="text-sm font-medium">{apt.title}</p>
                          <p className="text-xs text-gray-600">{apt.time}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Blocks Tab */}
            {selectedTab === "blocks" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Horários Bloqueados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {blockedSlotsQuery.data && blockedSlotsQuery.data.count > 0 ? (
                    <div className="space-y-2">
                      {blockedSlotsQuery.data.slots.map((slot: any) => (
                        <div key={slot.id} className="p-3 bg-red-50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{slot.reason}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(slot.startTime).toLocaleTimeString("pt-BR")} -{" "}
                              {new Date(slot.endTime).toLocaleTimeString("pt-BR")}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unblockTimeSlotMutation.mutateAsync({ appointmentId: slot.id })}
                            disabled={unblockTimeSlotMutation.isPending}
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhum horário bloqueado</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Info */}
          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">💡 Como Usar</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-gray-700">
                <p>• Clique em "Iniciar Escuta"</p>
                <p>• Fale sua pergunta naturalmente</p>
                <p>• Aguarde 2 segundos de silêncio</p>
                <p>• A IA processa automaticamente</p>
                <p>• A resposta aparece na tela</p>
                <p>• A IA fala a resposta</p>
                <p>• Escuta reinicia automaticamente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Próxima Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nextAptQuery.data?.found ? (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">{nextAptQuery.data.appointment?.title}</p>
                    <p className="text-xs text-gray-600">
                      {nextAptQuery.data.appointment?.startTime}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Nenhuma consulta agendada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
