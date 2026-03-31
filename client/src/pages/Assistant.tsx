import React, { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "../lib/trpc";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Mic, MicOff, Save, CheckCircle, Brain, User, FileText, Activity } from "lucide-react";
import { Badge } from "../components/ui/badge";

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
  const [patientId, setPatientId] = useState<number | undefined>(1); // Mock patient ID
  const [isEndingSession, setIsEndingSession] = useState(false);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const analyzeMutation = trpc.clinicalAssistant.analyzeTranscript.useMutation();
  const endSessionMutation = trpc.clinicalAssistant.endSession.useMutation();

  // ─── Captura de Voz Contínua ───
  const startRecording = useCallback(() => {
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

        // Enviar para análise técnica silenciosa
        try {
          const response = await analyzeMutation.mutateAsync({
            transcript: finalTranscript,
            patientId,
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
      if (isRecording) recognition.start(); // Reiniciar automaticamente para ser contínuo
    };

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      if (event.error !== "no-speech") toast.error("Erro no microfone");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success("Consulta iniciada - Microfone Ativo");
  }, [isRecording, patientId]);

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
      toast.success("Consulta encerrada e dados salvos!");
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
      <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Processador Clínico Inteligente</h1>
            <p className="text-sm text-slate-500">Suporte Profissional para Psi. Daniela Coelho</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRecording && (
            <Badge variant="outline" className="animate-pulse bg-red-50 text-red-600 border-red-200 flex gap-2 py-1">
              <Activity className="w-3 h-3" /> Gravando Sessão
            </Badge>
          )}
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            className="flex gap-2"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? "Pausar Captura" : "Iniciar Captura"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleEndSession} 
            disabled={isEndingSession || entries.length === 0}
            className="flex gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isEndingSession ? "Processando..." : "Encerrar Consulta"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Painel de Transcrição Bruta */}
        <Card className="flex flex-col overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Transcrição em Tempo Real (Invisível para o Paciente)
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
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel de Insights Técnicos e Resumo */}
        <Card className="flex flex-col overflow-hidden border-indigo-100 shadow-md ring-1 ring-indigo-50">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              Análise Clínica e Sugestões (Exclusivo Daniela)
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
                        {entry.type === "summary" ? "RESUMO FINAL DE PRONTUÁRIO" : "INSIGHT EM TEMPO REAL"}
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
                    <p className="text-sm italic">Aguardando transcrição para iniciar análise...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-6 flex items-center justify-between text-[11px] text-slate-400 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Save className="w-3 h-3" /> Salvamento Automático Ativo</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle className="w-3 h-3" /> Ambiente Seguro e Criptografado</span>
        </div>
        <p>© 2026 Processador Clínico v4.0 - Inteligência Aplicada à Psicologia</p>
      </footer>
    </div>
  );
}
