import React, { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "../lib/trpc";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Mic, MicOff, CheckCircle, Brain, User, FileText, Activity, Clock, Search } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface TranscriptionEntry {
  id: string;
  role: "patient" | "therapist" | "assistant";
  content: string;
  timestamp: Date;
  type?: "transcription" | "analysis" | "summary";
}

export default function Assistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [entries, setEntries] = useState<TranscriptionEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [patientId, setPatientId] = useState<number | null>(null);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queries e Mutations
  const { data: patients, isLoading: loadingPatients } = trpc.clinicalAssistant.listPatients.useQuery();
  const analyzeMutation = trpc.clinicalAssistant.analyzeTranscript.useMutation();
  const endSessionMutation = trpc.clinicalAssistant.endSession.useMutation();

  const selectedPatient = patients?.find(p => p.id === patientId);

  // ─── Captura de Voz Contínua ───
  const startRecording = useCallback(() => {
    if (!patientId) {
      toast.error("Selecione um paciente antes de iniciar a consulta");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API não suportada neste navegador");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = async (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        const userEntry: TranscriptionEntry = {
          id: `trans-${Date.now()}`,
          role: "patient",
          content: finalTranscript,
          timestamp: new Date(),
          type: "transcription",
        };
        setEntries((prev) => [...prev, userEntry]);

        // Enviar para análise técnica silenciosa com contexto histórico
        try {
          const response = await analyzeMutation.mutateAsync({
            transcript: finalTranscript,
            patientId: patientId,
          });

          const aiEntry: TranscriptionEntry = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: response.response,
            timestamp: new Date(),
            type: "analysis",
          };
          setEntries((prev) => [...prev, aiEntry]);
        } catch (e) {
          console.error("Erro na análise técnica:", e);
        }
      }
      setCurrentTranscript(interimTranscript);
    };

    recognition.onend = () => {
      if (isRecording) recognition.start();
    };

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      if (event.error !== "no-speech") toast.error("Erro no microfone");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    if (!sessionStartTime) setSessionStartTime(new Date());
    toast.success("Consulta iniciada - Capturando histórico...");
  }, [isRecording, patientId, sessionStartTime]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.info("Captura pausada");
    }
  }, []);

  // ─── Encerramento de Consulta ───
  const handleEndSession = async () => {
    if (!patientId) return;
    setIsEndingSession(true);
    stopRecording();

    const fullTranscript = entries
      .filter(e => e.type === "transcription")
      .map(e => `${e.role === "patient" ? "Paciente" : "Terapeuta"}: ${e.content}`)
      .join("\n");

    try {
      const response = await endSessionMutation.mutateAsync({
        patientId,
        fullTranscript,
      });

      const summaryEntry: TranscriptionEntry = {
        id: `summary-${Date.now()}`,
        role: "assistant",
        content: response.summary,
        timestamp: new Date(),
        type: "summary",
      };
      setEntries((prev) => [...prev, summaryEntry]);
      toast.success("Consulta encerrada e prontuário atualizado!");
    } catch (e) {
      toast.error("Erro ao encerrar consulta");
    } finally {
      setIsEndingSession(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, currentTranscript]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 p-4 md:p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Estrategista Clínico Conectado</h1>
            <p className="text-sm text-slate-500">Sessão em Tempo Real - Psi. Daniela Coelho</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Paciente */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <Select 
              onValueChange={(val) => setPatientId(Number(val))} 
              disabled={isRecording || isEndingSession}
              value={patientId?.toString()}
            >
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder="Selecionar Paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sessionStartTime && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <Clock className="w-3 h-3" />
              Início: {sessionStartTime.toLocaleTimeString()}
            </div>
          )}

          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            className="flex gap-2"
            disabled={!patientId || isEndingSession}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? "Pausar" : "Começar Consulta"}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleEndSession} 
            disabled={isEndingSession || entries.length === 0}
            className="flex gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isEndingSession ? "Processando..." : "Encerrar e Salvar"}
          </Button>
        </div>
      </header>

      {/* Contexto do Paciente Selecionado */}
      {selectedPatient && (
        <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
          <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 flex gap-2 shrink-0">
            <User className="w-3 h-3" /> Paciente: {selectedPatient.name}
          </Badge>
          <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 flex gap-2 shrink-0">
            Abordagem: {selectedPatient.primaryApproach || "TCC"}
          </Badge>
          <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 flex gap-2 shrink-0">
            Sessões: {selectedPatient.totalSessions || 0}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Painel de Transcrição Bruta */}
        <Card className="flex flex-col overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b py-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Transcrição em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {entries.filter(e => e.type === "transcription").map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="mt-1">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                      <span className="text-[10px] text-slate-400">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
                {currentTranscript && (
                  <div className="flex gap-3 opacity-50">
                    <User className="w-4 h-4 text-slate-300" />
                    <p className="text-sm text-slate-400 italic">{currentTranscript}...</p>
                  </div>
                )}
                {!isRecording && entries.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 mt-20">
                    <Mic className="w-12 h-12 opacity-10" />
                    <p className="text-sm italic">Selecione o paciente e clique em "Começar Consulta"</p>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel de Insights Estratégicos */}
        <Card className="flex flex-col overflow-hidden border-indigo-100 shadow-md ring-1 ring-indigo-50">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 py-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
              <Brain className="w-3 h-3" />
              Análise Histórica e Sugestões Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {entries.filter(e => e.type === "analysis" || e.type === "summary").map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`p-4 rounded-lg border ${
                      entry.type === "summary" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-900" 
                        : "bg-indigo-50/30 border-indigo-100 text-indigo-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        {entry.type === "summary" ? "RESUMO FINAL E EVOLUÇÃO" : "INSIGHT ESTRATÉGICO"}
                      </span>
                      <span className="text-[10px] text-slate-400">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                      {entry.content}
                    </div>
                  </div>
                ))}
                {entries.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 mt-20">
                    <Brain className="w-12 h-12 opacity-20" />
                    <p className="text-sm italic">Aguardando fala para processar com histórico...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-6 flex items-center justify-between text-[10px] text-slate-400 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Data: {new Date().toLocaleDateString()}</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle className="w-3 h-3" /> Conectado ao Prontuário do Paciente</span>
        </div>
        <p>Estrategista Clínico v5.0 - Inteligência Integrada ao Histórico</p>
      </footer>
    </div>
  );
}
