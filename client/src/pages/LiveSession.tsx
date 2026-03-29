import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { Mic, MicOff, Radio, Save, Brain, FileText, Clock, Pause, Play, Square } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function LiveSession() {
  const { patientId } = useParams<{ patientId: string }>();
  const pid = parseInt(patientId || "0");
  const { data: patient } = trpc.patients.getById.useQuery({ id: pid }, { enabled: pid > 0 });
  const { data: evolutions } = trpc.clinical.getEvolutions.useQuery({ patientId: pid }, { enabled: pid > 0 });
  const saveEvolution = trpc.clinical.createEvolution.useMutation({ onSuccess: () => toast.success("Evolução salva!") });
  const aiSummary = trpc.assistant.chat.useMutation();
  const evolutionCount = evolutions?.length || 0;

  const [transcriptEntries, setTranscriptEntries] = useState<Array<{ time: string; text: string }>>([]);
  const [notes, setNotes] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const voice = useVoiceRecognition((text) => {
    const entry = { time: format(new Date(), "HH:mm:ss"), text };
    setTranscriptEntries(prev => [...prev, entry]);
  });

  useEffect(() => {
    if (sessionStarted && !isPaused) {
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionStarted, isPaused]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptEntries]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const startSession = () => {
    setSessionStarted(true);
    voice.startListening();
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      voice.startListening();
    } else {
      setIsPaused(true);
      voice.stopListening();
    }
  };

  const endSession = () => {
    voice.stopListening();
    setSessionStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const generateInsight = async () => {
    setIsGeneratingInsight(true);
    const fullTranscript = transcriptEntries.map(e => `[${e.time}] ${e.text}`).join("\n");
    try {
      const result = await aiSummary.mutateAsync({
        message: `Analise esta transcrição de sessão do paciente ${patient?.name || ""}. Gere: 1) Resumo da sessão 2) Temas principais abordados 3) Padrões cognitivos/emocionais identificados 4) Sugestões para próxima sessão. Transcrição:\n${fullTranscript}\n\nNotas do terapeuta:\n${notes}`,
      });
      setAiInsight(result.response);
    } catch {
      toast.error("Erro ao gerar insight");
    }
    setIsGeneratingInsight(false);
  };

  const saveSessionEvolution = () => {
    const fullTranscript = transcriptEntries.map(e => `[${e.time}] ${e.text}`).join("\n");
    saveEvolution.mutate({
      patientId: pid,
      data: {
        sessionNumber: evolutionCount + 1,
        mainThemes: notes,
        techniques: "Transcrição ao vivo",
        observations: fullTranscript,
        aiSummary: aiInsight || undefined,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-serif tracking-tight flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" /> Sessão ao Vivo
          </h1>
          <p className="text-sm text-muted-foreground">{patient?.name || "Paciente"} — {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-3">
          {sessionStarted && (
            <Badge variant="outline" className="text-sm font-mono gap-1.5">
              <div className={`h-2 w-2 rounded-full ${isPaused ? "bg-amber-500" : "bg-red-500 animate-pulse"}`} />
              {formatTime(sessionTime)}
            </Badge>
          )}
          {!sessionStarted ? (
            <Button onClick={startSession} className="gap-2">
              <Mic className="h-4 w-4" /> Iniciar Sessão
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={togglePause}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button variant="destructive" size="sm" onClick={endSession}>
                <Square className="h-4 w-4 mr-1" /> Encerrar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Transcript */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Transcrição em Tempo Real
              {voice.isListening && (
                <Badge variant="outline" className="text-[10px] gap-1 text-red-600 border-red-200">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Gravando
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4" ref={scrollRef as any}>
              {transcriptEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Mic className="h-12 w-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {sessionStarted ? "Aguardando fala..." : "Inicie a sessão para começar a transcrição"}
                  </p>
                  {voice.interimTranscript && (
                    <p className="text-sm text-primary/60 mt-2 italic">{voice.interimTranscript}...</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {transcriptEntries.map((entry, i) => (
                    <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 mt-0.5">{entry.time}</span>
                      <p className="text-sm">{entry.text}</p>
                    </div>
                  ))}
                  {voice.interimTranscript && (
                    <div className="flex gap-3 p-2 rounded-lg bg-primary/5">
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 mt-0.5">...</span>
                      <p className="text-sm text-primary/70 italic">{voice.interimTranscript}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Notes */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Anotações do Terapeuta</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6} placeholder="Observações, insights, pontos importantes..." className="text-sm" />
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Insight IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-sm" onClick={generateInsight} disabled={isGeneratingInsight || transcriptEntries.length === 0}>
                <Brain className="h-4 w-4 mr-2" />
                {isGeneratingInsight ? "Analisando..." : "Gerar Análise IA"}
              </Button>
              {aiInsight && (
                <ScrollArea className="h-[200px]">
                  <div className="text-xs whitespace-pre-wrap leading-relaxed">{aiInsight}</div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Save */}
          <Button className="w-full" onClick={saveSessionEvolution} disabled={saveEvolution.isPending || transcriptEntries.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            {saveEvolution.isPending ? "Salvando..." : "Salvar Evolução"}
          </Button>
        </div>
      </div>
    </div>
  );
}
