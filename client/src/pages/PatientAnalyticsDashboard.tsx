import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PatientAnalytics {
  patientId: number;
  patientName: string;
  totalSessions: number;
  attendanceRate: number;
  moodProgression: Array<{ date: string; mood: number }>;
  therapyApproach: string;
  clinicalProgress: number;
  sessionsByMonth: Array<{ month: string; count: number }>;
  engagementLevel: "very_low" | "low" | "moderate" | "high" | "very_high";
}

const MOOD_COLORS = {
  very_low: "#ef4444",
  low: "#f97316",
  moderate: "#eab308",
  high: "#84cc16",
  very_high: "#22c55e",
};

const ENGAGEMENT_COLORS = {
  very_low: "#ef4444",
  low: "#f97316",
  moderate: "#eab308",
  high: "#84cc16",
  very_high: "#22c55e",
};

export function PatientAnalyticsDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<PatientAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<"30" | "90" | "180" | "365">("90");

  // Dados de exemplo
  const mockPatients: PatientAnalytics[] = [
    {
      patientId: 1,
      patientName: "Maria Silva",
      totalSessions: 24,
      attendanceRate: 95,
      therapyApproach: "TCC",
      clinicalProgress: 75,
      engagementLevel: "high",
      moodProgression: [
        { date: "Semana 1", mood: 3 },
        { date: "Semana 2", mood: 3.5 },
        { date: "Semana 3", mood: 4 },
        { date: "Semana 4", mood: 4.5 },
        { date: "Semana 5", mood: 5 },
        { date: "Semana 6", mood: 5.5 },
      ],
      sessionsByMonth: [
        { month: "Janeiro", count: 4 },
        { month: "Fevereiro", count: 4 },
        { month: "Março", count: 4 },
      ],
    },
    {
      patientId: 2,
      patientName: "João Santos",
      totalSessions: 18,
      attendanceRate: 88,
      therapyApproach: "Terapia do Esquema",
      clinicalProgress: 65,
      engagementLevel: "moderate",
      moodProgression: [
        { date: "Semana 1", mood: 2.5 },
        { date: "Semana 2", mood: 3 },
        { date: "Semana 3", mood: 3.5 },
        { date: "Semana 4", mood: 4 },
        { date: "Semana 5", mood: 4.2 },
        { date: "Semana 6", mood: 4.5 },
      ],
      sessionsByMonth: [
        { month: "Janeiro", count: 3 },
        { month: "Fevereiro", count: 3 },
        { month: "Março", count: 3 },
      ],
    },
  ];

  const selectedPatientData = selectedPatient || mockPatients[0];

  const stats = useMemo(() => {
    return {
      avgMood: (
        selectedPatientData.moodProgression.reduce((sum, item) => sum + item.mood, 0) /
        selectedPatientData.moodProgression.length
      ).toFixed(1),
      moodTrend:
        selectedPatientData.moodProgression[selectedPatientData.moodProgression.length - 1].mood -
        selectedPatientData.moodProgression[0].mood,
      totalSessions: selectedPatientData.totalSessions,
      attendanceRate: selectedPatientData.attendanceRate,
    };
  }, [selectedPatientData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics de Pacientes</h1>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Seleção de Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {mockPatients.map((patient) => (
              <Button
                key={patient.patientId}
                variant={selectedPatientData.patientId === patient.patientId ? "default" : "outline"}
                onClick={() => setSelectedPatient(patient)}
                className="w-full"
              >
                {patient.patientName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mood Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgMood}/10</div>
            <p className={`text-xs mt-1 ${stats.moodTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.moodTrend >= 0 ? "↑" : "↓"} {Math.abs(stats.moodTrend).toFixed(1)} desde início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sessões Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-gray-500 mt-1">Consultadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Comparecimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Presença</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Progresso Clínico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{selectedPatientData.clinicalProgress}%</div>
            <p className="text-xs text-gray-500 mt-1">Evolução</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="mood" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mood">Evolução de Mood</TabsTrigger>
          <TabsTrigger value="sessions">Sessões por Mês</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="approach">Abordagem Terapêutica</TabsTrigger>
        </TabsList>

        <TabsContent value="mood">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Mood ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedPatientData.moodProgression}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Mood (0-10)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sessões por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={selectedPatientData.sessionsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Sessões" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Nível de Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{
                      backgroundColor:
                        ENGAGEMENT_COLORS[selectedPatientData.engagementLevel],
                    }}
                  >
                    {selectedPatientData.engagementLevel.toUpperCase()}
                  </div>
                  <p className="mt-4 text-gray-600">
                    Nível de engajamento do paciente nas sessões
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approach">
          <Card>
            <CardHeader>
              <CardTitle>Abordagem Terapêutica Utilizada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {selectedPatientData.therapyApproach}
                  </div>
                  <p className="text-gray-600">
                    Abordagem principal utilizada neste tratamento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Clínico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700">Paciente</h4>
            <p className="text-gray-600">{selectedPatientData.patientName}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Abordagem Terapêutica</h4>
            <p className="text-gray-600">{selectedPatientData.therapyApproach}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Progresso Geral</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${selectedPatientData.clinicalProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPatientData.clinicalProgress}% de progresso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
