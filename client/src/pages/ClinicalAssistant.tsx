"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Save, Copy, Check, History, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ClinicalAssistant() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSelectionSaved, setPatientSelectionSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterBirthDate, setFilterBirthDate] = useState("");
  const [filterOccupation, setFilterOccupation] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Fetch patients
  const patientsQuery = trpc.patients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch suggestions
  const suggestionsQuery = trpc.clinicalAssistant.getSuggestions.useQuery(
    { patientId: selectedPatientId || 0, currentContext: transcript },
    { enabled: isAuthenticated && selectedPatientId !== null && patientSelectionSaved }
  );

  // Fetch patient history
  const historyQuery = trpc.clinicalAssistant.getPatientHistory.useQuery(
    { patientId: selectedPatientId || 0 },
    { enabled: isAuthenticated && selectedPatientId !== null && patientSelectionSaved }
  );

  // Analyze speech mutation
  const analyzeMutation = trpc.clinicalAssistant.analyzeSpeech.useMutation();
  const generateNotesMutation = trpc.clinicalAssistant.generateSessionNotes.useMutation();

  // Filter patients based on criteria
  const filteredPatients = patientsQuery.data?.filter((patient) => {
    if (filterEmail && !patient.email?.toLowerCase().includes(filterEmail.toLowerCase())) return false;
    if (filterPhone && !patient.phone?.includes(filterPhone)) return false;
    if (filterBirthDate && patient.birthDate !== filterBirthDate) return false;
    if (filterOccupation && !patient.occupation?.toLowerCase().includes(filterOccupation.toLowerCase())) return false;
    return true;
  }) || [];

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

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment + " ");
        } else {
          interimTranscript += transcriptSegment;
        }
      }
    };

    recognition.onerror = (event: any) => {
      toast.error(`Erro de reconhecimento: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSavePatientSelection = () => {
    if (!selectedPatientId) {
      toast.error("Selecione um paciente");
      return;
    }
    setPatientSelectionSaved(true);
    toast.success("Paciente selecionado e salvo com sucesso");
  };

  const handleResetSelection = () => {
    setSelectedPatientId(null);
    setPatientSelectionSaved(false);
    setTranscript("");
    setAnalysis("");
    setSuggestions([]);
    setFilterEmail("");
    setFilterPhone("");
    setFilterBirthDate("");
    setFilterOccupation("");
    toast.info("Seleção resetada");
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (!patientSelectionSaved) {
      toast.error("Salve a seleção do paciente antes de iniciar a gravação");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId || !transcript.trim()) {
      toast.error("Selecione um paciente e adicione uma transcrição");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeMutation.mutateAsync({
        patientId: selectedPatientId,
        transcript,
        sessionContext: {
          mainThemes: suggestionsQuery.data?.successfulTechniques || [],
        },
      });

      setAnalysis(result.analysis);
      setSuggestions(result.suggestions);
      if (result.saved) {
        toast.success(`Análise salva com sucesso (ID: ${result.sessionId})`);
      } else {
        toast.success("Análise concluída com sucesso");
      }
    } catch (error) {
      toast.error("Erro ao analisar transcrição");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedPatientId || !transcript.trim()) {
      toast.error("Selecione um paciente e adicione uma transcrição");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await generateNotesMutation.mutateAsync({
        patientId: selectedPatientId,
        transcript,
        mainThemes: suggestionsQuery.data?.successfulTechniques || [],
      });

      setAnalysis(result.fullNotes);
      if (result.saved) {
        toast.success(`Notas salvas com sucesso (ID: ${result.sessionId})`);
      } else {
        toast.success("Notas de sessão geradas com sucesso");
      }
    } catch (error) {
      toast.error("Erro ao gerar notas");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis);
    toast.success("Copiado para a área de transferência");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Faça login para acessar o assistente clínico</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const selectedPatient = patientsQuery.data?.find((p) => p.id === selectedPatientId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Assistente Clínico IA</h1>
          <p className="text-sm text-muted-foreground">
            Transcrição em tempo real, análise de IA e geração automática de notas
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection with Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Paciente</CardTitle>
                <CardDescription>
                  {patientSelectionSaved && selectedPatient ? (
                    <div className="flex items-center gap-2 text-green-600 mt-2">
                      <Check className="w-4 h-4" />
                      Paciente selecionado: <strong>{selectedPatient.name}</strong>
                    </div>
                  ) : (
                    "Selecione e confirme o paciente antes de iniciar a gravação"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="Filtrar por email..."
                      value={filterEmail}
                      onChange={(e) => setFilterEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      disabled={patientSelectionSaved}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefone</label>
                    <input
                      type="tel"
                      placeholder="Filtrar por telefone..."
                      value={filterPhone}
                      onChange={(e) => setFilterPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      disabled={patientSelectionSaved}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data de Nascimento</label>
                    <input
                      type="date"
                      value={filterBirthDate}
                      onChange={(e) => setFilterBirthDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      disabled={patientSelectionSaved}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ocupação</label>
                    <input
                      type="text"
                      placeholder="Filtrar por ocupação..."
                      value={filterOccupation}
                      onChange={(e) => setFilterOccupation(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      disabled={patientSelectionSaved}
                    />
                  </div>
                </div>

                {/* Patient Selector */}
                <div>
                  <label className="text-sm font-medium">Paciente</label>
                  <Select
                    value={selectedPatientId?.toString() || ""}
                    onValueChange={(value) => setSelectedPatientId(parseInt(value))}
                    disabled={patientSelectionSaved}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          <div className="flex flex-col">
                            <span>{patient.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {patient.email} • {patient.phone}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Patient Details */}
                {selectedPatient && (
                  <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span> {selectedPatient.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedPatient.email || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {selectedPatient.phone || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Data de Nascimento:</span> {selectedPatient.birthDate || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Ocupação:</span> {selectedPatient.occupation || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge variant={selectedPatient.status === "active" ? "default" : "secondary"}>
                        {selectedPatient.status}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!patientSelectionSaved ? (
                    <Button
                      onClick={handleSavePatientSelection}
                      disabled={!selectedPatientId}
                      className="flex-1 gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Seleção
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleResetSelection} variant="outline" className="flex-1">
                        Alterar Paciente
                      </Button>
                      <Button
                        onClick={() => setShowHistory(true)}
                        variant="secondary"
                        className="flex-1 gap-2"
                      >
                        <History className="w-4 h-4" />
                        Ver Histórico
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Voice Input */}
            {patientSelectionSaved && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Entrada de Voz</span>
                    {isListening && (
                      <Badge variant="destructive" className="animate-pulse">
                        Gravando...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Use o reconhecimento de voz para transcrever a sessão em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    size="lg"
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "default"}
                    className="w-full gap-2"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        Parar Gravação
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Iniciar Gravação
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    Idioma: Português (Brasil)
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transcript */}
            {patientSelectionSaved && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="A transcrição aparecerá aqui ou você pode digitar manualmente..."
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {patientSelectionSaved && (
              <div className="flex gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedPatientId || !transcript.trim()}
                  className="flex-1 gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    "Analisar Sessão"
                  )}
                </Button>

                <Button
                  onClick={handleGenerateNotes}
                  disabled={isAnalyzing || !selectedPatientId || !transcript.trim()}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Gerar Notas
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* History Modal */}
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico do Paciente
                </DialogTitle>
                <DialogDescription>
                  Análises anteriores, temas recorrentes e estratégias recomendadas
                </DialogDescription>
              </DialogHeader>

              {historyQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : historyQuery.data ? (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total de Sessões</p>
                      <p className="text-2xl font-bold">{historyQuery.data.totalSessions}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Duração Total</p>
                      <p className="text-2xl font-bold">{Math.round(historyQuery.data.totalDuration / 60)}h</p>
                    </div>
                  </div>

                  {/* Recurring Themes */}
                  {historyQuery.data.recurringThemes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Temas Recorrentes</h4>
                      <div className="flex flex-wrap gap-2">
                        {historyQuery.data.recurringThemes.map((theme, idx) => (
                          <Badge key={idx} variant="secondary">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Effective Techniques */}
                  {historyQuery.data.effectiveTechniques.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Técnicas Efetivas</h4>
                      <div className="flex flex-wrap gap-2">
                        {historyQuery.data.effectiveTechniques.map((tech, idx) => (
                          <Badge key={idx} variant="default">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Emotions */}
                  {historyQuery.data.primaryEmotions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Estados Emocionais Frequentes</h4>
                      <div className="flex flex-wrap gap-2">
                        {historyQuery.data.primaryEmotions.map((emotion, idx) => (
                          <Badge key={idx} variant="outline">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Recomendações para Esta Sessão</h4>
                    <p className="text-sm text-foreground">{historyQuery.data.recommendations}</p>
                  </div>

                  {/* Recent Sessions */}
                  {historyQuery.data.recentSessions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Últimas Sessões</h4>
                      <div className="space-y-2">
                        {historyQuery.data.recentSessions.map((session) => (
                          <div key={session.id} className="bg-muted p-3 rounded-lg text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">Sessão #{session.id}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(session.date).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-muted-foreground mb-2">{session.summary}</p>
                            {session.themes.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {session.themes.slice(0, 3).map((theme, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum histórico disponível para este paciente</p>
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Fechar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Right Panel - Suggestions & Analysis */}
          {patientSelectionSaved && (
            <div className="space-y-6">
              {/* AI Suggestions */}
              {suggestionsQuery.data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sugestões de IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Técnicas anteriormente bem-sucedidas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestionsQuery.data.successfulTechniques.slice(0, 5).map((tech, idx) => (
                          <Badge key={idx} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground mt-4">
                        Sessões completadas: {suggestionsQuery.data.sessionCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Results */}
              {analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Análise</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyToClipboard}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{analysis}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
