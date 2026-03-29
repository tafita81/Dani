import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { TrendingUp, Download, AlertCircle, CheckCircle, Zap } from "lucide-react";

interface FunnelStage {
  name: string;
  users: number;
  converted: number;
  conversionRate: number;
  dropoffRate: number;
}

interface HeatmapCell {
  stage: string;
  element: string;
  intensity: "cold" | "warm" | "hot" | "very_hot";
  conversionRate: number;
}

export default function FunnelAnalyticsDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<"conversion" | "dropoff" | "time">(
    "conversion"
  );

  // Dados do funil
  const funnelData: FunnelStage[] = [
    {
      name: "Descoberta",
      users: 10000,
      converted: 4500,
      conversionRate: 45,
      dropoffRate: 55,
    },
    {
      name: "Engajamento",
      users: 4500,
      converted: 2700,
      conversionRate: 60,
      dropoffRate: 40,
    },
    {
      name: "Consideração",
      users: 2700,
      converted: 1620,
      conversionRate: 60,
      dropoffRate: 40,
    },
    {
      name: "Conversão",
      users: 1620,
      converted: 972,
      conversionRate: 60,
      dropoffRate: 40,
    },
    {
      name: "Retenção",
      users: 972,
      converted: 632,
      conversionRate: 65,
      dropoffRate: 35,
    },
  ];

  // Dados de heatmap
  const heatmapData: HeatmapCell[] = [
    { stage: "Descoberta", element: "CTA Principal", intensity: "warm", conversionRate: 45 },
    { stage: "Engajamento", element: "CTA Principal", intensity: "hot", conversionRate: 60 },
    { stage: "Consideração", element: "CTA Principal", intensity: "hot", conversionRate: 60 },
    { stage: "Conversão", element: "CTA Principal", intensity: "hot", conversionRate: 60 },
    { stage: "Retenção", element: "CTA Principal", intensity: "very_hot", conversionRate: 65 },
  ];

  // Dados de tendência
  const trendData = [
    { week: "Sem 1", conversion: 42, dropoff: 58 },
    { week: "Sem 2", conversion: 45, dropoff: 55 },
    { week: "Sem 3", conversion: 48, dropoff: 52 },
    { week: "Sem 4", conversion: 50, dropoff: 50 },
  ];

  // Recomendações
  const recommendations = [
    {
      id: 1,
      stage: "Descoberta",
      issue: "Alto abandono (55%)",
      recommendation: "Simplificar fluxo e melhorar copywriting",
      impact: 15,
      priority: "high",
    },
    {
      id: 2,
      stage: "Engajamento",
      issue: "Tempo médio alto (120s)",
      recommendation: "Dividir em etapas menores",
      impact: 12,
      priority: "medium",
    },
    {
      id: 3,
      stage: "Consideração",
      issue: "Falta de prova social",
      recommendation: "Adicionar avaliações e testimoniais",
      impact: 10,
      priority: "medium",
    },
  ];

  // Cores para heatmap
  const heatmapColors = {
    cold: "#3b82f6",
    warm: "#f59e0b",
    hot: "#ef4444",
    very_hot: "#dc2626",
  };

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalUsers = funnelData[0].users;
    const totalConverted = funnelData[funnelData.length - 1].converted;
    const overallConversion = (totalConverted / totalUsers) * 100;

    return {
      totalUsers,
      totalConverted,
      overallConversion: overallConversion.toFixed(1),
      avgConversionRate: (
        funnelData.reduce((sum, s) => sum + s.conversionRate, 0) / funnelData.length
      ).toFixed(1),
    };
  }, []);

  const handleExportCSV = () => {
    const csv = [
      ["Estágio", "Usuários", "Convertidos", "Taxa de Conversão", "Taxa de Abandono"],
      ...funnelData.map((s) => [
        s.name,
        s.users,
        s.converted,
        `${s.conversionRate}%`,
        `${s.dropoffRate}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "funel-analytics.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics do Funil de Conversão</h1>
        <p className="text-muted-foreground mt-2">
          Análise detalhada de cada etapa do funil com recomendações de otimização
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">No topo do funil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConverted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pacientes/Leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overallConversion}%</div>
            <p className="text-xs text-muted-foreground">Geral do funil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgConversionRate}%</div>
            <p className="text-xs text-muted-foreground">Por estágio</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Visualizações */}
      <Tabs defaultValue="funel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funel">Funil</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="tendencia">Tendência</TabsTrigger>
          <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
        </TabsList>

        {/* Visualização do Funil */}
        <TabsContent value="funel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
              <CardDescription>Usuários em cada etapa do funil</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#3b82f6" name="Usuários Entrantes" />
                  <Bar dataKey="converted" fill="#10b981" name="Convertidos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão por Estágio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conversionRate"
                    stroke="#f59e0b"
                    name="Taxa de Conversão (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="dropoffRate"
                    stroke="#ef4444"
                    name="Taxa de Abandono (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heatmap */}
        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heatmap de Conversão</CardTitle>
              <CardDescription>Intensidade de conversão por elemento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {heatmapData.map((cell, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cell.stage}</p>
                      <p className="text-sm text-muted-foreground">{cell.element}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded"
                        style={{
                          backgroundColor: heatmapColors[cell.intensity],
                          opacity: 0.7,
                        }}
                      />
                      <div className="text-right">
                        <p className="font-bold">{cell.conversionRate}%</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {cell.intensity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tendência */}
        <TabsContent value="tendencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Conversão (4 Semanas)</CardTitle>
              <CardDescription>Evolução das taxas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversion" fill="#10b981" name="Conversão (%)" />
                  <Line
                    type="monotone"
                    dataKey="conversion"
                    stroke="#f59e0b"
                    name="Tendência"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recomendações */}
        <TabsContent value="recomendacoes" className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {rec.priority === "high" ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Zap className="w-5 h-5 text-yellow-500" />
                      )}
                      {rec.stage}
                    </CardTitle>
                    <CardDescription>{rec.issue}</CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rec.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {rec.priority === "high" ? "Alta Prioridade" : "Média Prioridade"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Recomendação:</p>
                  <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Impacto Estimado</p>
                    <p className="text-2xl font-bold text-green-600">+{rec.impact}%</p>
                  </div>
                  <Button>Implementar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Botão de Exportação */}
      <div className="flex gap-3">
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
        <Button variant="outline">Gerar Relatório PDF</Button>
      </div>
    </div>
  );
}
