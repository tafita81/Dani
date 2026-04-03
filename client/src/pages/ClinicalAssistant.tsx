import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, MicOff, Save, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ClinicalAssistant() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState("");
  const recognitionRef = useRef<any>(null);

  // Fetch patients
  const patientsQuery = trpc.patients.list.useQuery();

  // Get selected patient details
  const selectedPatient = patientsQuery.data?.find((p: any) => p.id === selectedPatientId);

  // Fetch suggestions
  const suggestionsQuery = trpc.clinicalAssistant.getSuggestions.useQuery(
    { patientId: selectedPatientId || 0, currentContext: transcript },
    { enabled: selectedPatientId !== null && !!transcript }
  );

  // Analyze speech mutation
  const analyzeMutation = trpc.clinicalAssistant.analyzeSpeech.useMutation();
  const generateNotesMutation = trpc.clinicalAssistant.generateSessionNotes.useMutation();

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

  const toggleListening = () => {
    if (!recognitionRef.current) return;

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
      toast.success("Análise concluída com sucesso");
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
      toast.success("Notas de sessão geradas com sucesso");
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
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedPatientId?.toString() || ""}
                  onValueChange={async (value) => {
                    const patientId = parseInt(value);
                    setSelectedPatientId(patientId);
                    toast.success("Paciente selecionado");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patientsQuery.data?.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Voice Input */}
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

            {/* Transcript */}
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

            {/* Actions */}
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
          </div>

          {/* Right Panel - Suggestions & Analysis */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            {suggestionsQuery.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sugestões de IA</CardTitle>
                  {selectedPatient && (
                    <CardDescription>
                      Paciente: {selectedPatient.name} | Email: {selectedPatient.email}
                    </CardDescription>
                  )}
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
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    <div className="text-sm text-foreground whitespace-pre-wrap">
                      {analysis}
                    </div>

                    {suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Sugestões de Intervenção:</p>
                        <ul className="space-y-1">
                          {suggestions.map((sugg, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              • {sugg}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
