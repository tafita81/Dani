import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Mic, MicOff, CheckCircle, Brain, User, FileText, Activity, Clock, Search, Lock, Unlock, UserPlus } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isPatientConfirmed, setIsPatientConfirmed] = useState(false);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queries e Mutations
  const { data: patients, isLoading: loadingPatients } = trpc.clinicalAssistant.listPatients.useQuery();
  const analyzeMutation = trpc.clinicalAssistant.analyzeTranscript.useMutation();
  const endSessionMutation = trpc.clinicalAssistant.endSession.useMutation();

  // Filtro de pacientes por nome
  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const selectedPatient = patients?.find(p => p.id === patientId);

  // ─── Captura de Voz Contínua ───
  const startRecording = useCallback(() => {
    if (!isPatientConfirmed) {
      toast.error("Confirme o paciente antes de iniciar a captura");
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

        try {
          const response = await analyzeMutation.mutateAsync({
            transcript: finalTranscript,
            patientId: patientId!,
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

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success("Captura de áudio ativa");
  }, [isRecording, patientId, isPatientConfirmed]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.info("Captura pausada");
    }
  }, []);

  // ─── Confirmar Paciente e Iniciar Sessão ───
  const confirmPatient = () => {
    if (!patientId) {
      toast.error("Selecione um paciente");
      return;
    }
    setIsPatientConfirmed(true);
    setSessionStartTime(new Date());
    toast.success(`Consulta com ${selectedPatient?.name} confirmada!`);
  };

  const resetSelection = () => {
    if (isRecording) {
      toast.error("Pare a captura antes de trocar de paciente");
      return;
    }
    setIsPatientConfirmed(false);
    setSessionStartTime(null);
    setEntries([]);
  };

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
      toast.success("Prontuário salvo com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar consulta");
    } finally {
      setIsEndingSession(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, currentTranscript]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 p-4 md:p-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Estrategista Clínico V5.0</h1>
            <p className="text-sm text-slate-500">Inteligência Profissional - Psi. Daniela Coelho</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isPatientConfirmed ? (
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <div className="relative w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar paciente..."
                  className="pl-8 h-9 border-none bg-transparent focus-visible:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                onValueChange={(val) => setPatientId(Number(val))} 
                value={patientId?.toString()}
              >
                <SelectTrigger className="w-48 h-9 border-none bg-white shadow-none">
                  <SelectValue placeholder="Escolher..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPatients.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                  {filteredPatients.length === 0 && (
                    <div className="p-2 text-xs text-slate-400 text-center">Nenhum encontrado</div>
                  )}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={confirmPatient} disabled={!patientId} className="h-8 gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Iniciar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-sm font-semibold text-indigo-700">{selectedPatient?.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-400 hover:text-indigo-600" onClick={resetSelection} disabled={isRecording}>
                <Unlock className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {isPatientConfirmed && (
            <>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <Clock className="w-3.5 h-3.5" />
                {sessionStartTime?.toLocaleTimeString()}
              </div>
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                className="flex gap-2"
                disabled={isEndingSession}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? "Pausar" : "Gravar Áudio"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEndSession} 
                disabled={isEndingSession || entries.length === 0}
                className="flex gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                <Save className="w-4 h-4" />
                Encerrar Consulta
              </Button>
            </>
          )}
        </div>
      </header>

      {isPatientConfirmed && selectedPatient && (
        <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
          <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 flex gap-2 shrink-0 shadow-sm">
            <User className="w-3 h-3 text-indigo-500" /> {selectedPatient.name}
          </Badge>
          <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 flex gap-2 shrink-0 shadow-sm">
            Abordagem: {selectedPatient.primaryApproach || "Integrativa"}
          </Badge>
          <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1 flex gap-2 shrink-0 shadow-sm">
            Histórico: {selectedPatient.totalSessions || 0} sessões
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Painel de Transcrição */}
        <Card className="flex flex-col overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Registro de Transcrição Contínua
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {entries.filter(e => e.type === "transcription").map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="mt-1">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 leading-relaxed">{entry.content}</p>
                      <span className="text-[9px] text-slate-400 font-medium">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
                {currentTranscript && (
                  <div className="flex gap-3 opacity-40">
                    <User className="w-4 h-4 text-slate-300" />
                    <p className="text-sm text-slate-400 italic">{currentTranscript}...</p>
                  </div>
                )}
                {!isPatientConfirmed && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3 mt-20">
                    <UserPlus className="w-16 h-16 opacity-10" />
                    <p className="text-sm font-medium">Busque e confirme o paciente para começar</p>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel de Inteligência Clínica */}
        <Card className="flex flex-col overflow-hidden border-indigo-100 shadow-lg ring-1 ring-indigo-50/50">
          <CardHeader className="bg-indigo-50/30 border-b border-indigo-100 py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
              <Brain className="w-3 h-3" />
              Insights Estratégicos e Análise de Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {entries.filter(e => e.type === "analysis" || e.type === "summary").map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`p-5 rounded-xl border ${
                      entry.type === "summary" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-sm" 
                        : "bg-white border-indigo-50 text-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={entry.type === "summary" ? "default" : "outline"} className={entry.type === "summary" ? "bg-emerald-600" : "text-indigo-500 border-indigo-100"}>
                        {entry.type === "summary" ? "EVOLUÇÃO FINAL" : "ANÁLISE EM TEMPO REAL"}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                      {entry.content}
                    </div>
                  </div>
                ))}
                {isPatientConfirmed && entries.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 mt-20">
                    <Activity className="w-12 h-12 opacity-10 animate-pulse" />
                    <p className="text-sm italic">Ouvindo e comparando com histórico...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-6 flex items-center justify-between text-[10px] text-slate-400 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Sessão: {new Date().toLocaleDateString()}</span>
          <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle className="w-3 h-3" /> Prontuário Digital Conectado</span>
        </div>
        <p className="font-medium">Processador Clínico Profissional v5.0 - Dra. Daniela Coelho</p>
      </footer>
    </div>
  );
}
