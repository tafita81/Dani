import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, TrendingUp, Heart, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const [, setLocation] = useLocation();

  // Buscar dados do paciente
  const { data: patient, isLoading: patientLoading } = trpc.patients.getById.useQuery(
    { id: parseInt(patientId || "0") },
    { enabled: !!patientId }
  );

  // Buscar histórico de humor
  const { data: moodHistory } = trpc.patients.getMoodHistory.useQuery(
    { patientId: parseInt(patientId || "0") },
    { enabled: !!patientId }
  );

  // Buscar sessões do paciente
  const { data: sessions } = trpc.patients.getSessionHistory.useQuery(
    { patientId: parseInt(patientId || "0") },
    { enabled: !!patientId }
  );

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Paciente não encontrado</p>
          <Button onClick={() => setLocation("/patients")}>Voltar para Pacientes</Button>
        </div>
      </div>
    );
  }

  // Preparar dados para gráfico de humor
  const moodChartData = moodHistory?.map((entry: any) => ({
    date: new Date(entry.recordedAt).toLocaleDateString("pt-BR"),
    score: entry.score,
    emotion: entry.emotion,
  })) || [];

  // Preparar dados para timeline de sessões
  const sessionTimeline = sessions?.map((session: any) => ({
    id: session.id,
    date: new Date(session.createdAt).toLocaleDateString("pt-BR"),
    time: new Date(session.createdAt).toLocaleTimeString("pt-BR"),
    summary: session.summary?.substring(0, 100) + "..." || "Sem resumo",
    themes: session.keyThemes || [],
  })) || [];

  // Calcular estatísticas
  const avgMood = moodHistory && moodHistory.length > 0
    ? (moodHistory.reduce((sum: number, entry: any) => sum + entry.score, 0) / moodHistory.length).toFixed(1)
    : 0;

  const totalSessions = sessions?.length || 0;

  // Dados para gráfico de distribuição de emoções
  const emotionDistribution = moodHistory?.reduce((acc: any, entry: any) => {
    const existing = acc.find((e: any) => e.name === entry.emotion);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: entry.emotion || "Não especificada", value: 1 });
    }
    return acc;
  }, []) || [];

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#06b6d4"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/patients")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground mt-1">
              Paciente desde {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Button className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório PDF
          </Button>
        </div>
      </div>

      {/* Informações do Paciente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{patient.email || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Telefone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{patient.phone || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={patient.status === "active" ? "default" : "secondary"}>
              {patient.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Humor Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgMood}/10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tipo de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {patient.attendanceType === "presencial" ? "Presencial" :
               patient.attendanceType === "online" ? "Online" : "Híbrido"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tipo de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {patient.paymentType === "particular" ? "Particular" :
               patient.paymentType === "plano_saude" ? "Plano de Saúde" : "Convênio"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de Evolução de Humor */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Humor</CardTitle>
            <CardDescription>Histórico de humor nos últimos registros</CardDescription>
          </CardHeader>
          <CardContent>
            {moodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444" }}
                    name="Pontuação"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados de humor registrados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição de Emoções */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Emoções</CardTitle>
            <CardDescription>Frequência de emoções registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {emotionDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emotionDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados de emoções registrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
          <CardDescription>Últimas sessões registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionTimeline.length > 0 ? (
            <div className="space-y-4">
              {sessionTimeline.map((session: any, index: number) => (
                <div key={session.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mt-1.5"></div>
                    {index < sessionTimeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-border my-2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">Sessão #{session.id}</p>
                      <span className="text-sm text-muted-foreground">
                        {session.date} às {session.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{session.summary}</p>
                    {session.themes && session.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {session.themes.slice(0, 3).map((theme: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                        {session.themes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{session.themes.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Nenhuma sessão registrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      {patient.detailedObservations && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Observações Clínicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{patient.detailedObservations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
