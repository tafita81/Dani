import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface FeedbackMetrics {
  totalResponses: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageRating: number;
  satisfactionRate: number;
  trends: {
    byIntent: Record<string, number>;
    byHour: Record<number, number>;
    byDay: Record<string, number>;
  };
}

export default function FeedbackDashboard() {
  const [metrics, setMetrics] = useState<FeedbackMetrics>({
    totalResponses: 0,
    positiveCount: 0,
    negativeCount: 0,
    neutralCount: 0,
    averageRating: 0,
    satisfactionRate: 0,
    trends: {
      byIntent: {},
      byHour: {},
      byDay: {},
    },
  });

  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d">("24h");

  // Simular dados de feedback
  useEffect(() => {
    const mockMetrics: FeedbackMetrics = {
      totalResponses: 45,
      positiveCount: 32,
      negativeCount: 5,
      neutralCount: 8,
      averageRating: 4.2,
      satisfactionRate: 0.89,
      trends: {
        byIntent: {
          patient_info: 15,
          appointment_info: 18,
          session_info: 10,
          statistics: 2,
        },
        byHour: {
          8: 5,
          9: 8,
          10: 7,
          11: 6,
          12: 4,
          13: 3,
          14: 2,
          15: 3,
          16: 4,
          17: 3,
        },
        byDay: {
          "2026-03-27": 12,
          "2026-03-28": 18,
          "2026-03-29": 15,
        },
      },
    };
    setMetrics(mockMetrics);
  }, [selectedPeriod]);

  const feedbackData = [
    { name: "Positivo", value: metrics.positiveCount, color: "#10b981" },
    { name: "Neutro", value: metrics.neutralCount, color: "#6b7280" },
    { name: "Negativo", value: metrics.negativeCount, color: "#ef4444" },
  ];

  const intentData = Object.entries(metrics.trends.byIntent).map(([intent, count]) => ({
    name: intent.replace("_", " "),
    value: count,
  }));

  const hourData = Object.entries(metrics.trends.byHour).map(([hour, count]) => ({
    hour: `${hour}h`,
    responses: count,
  }));

  const dayData = Object.entries(metrics.trends.byDay).map(([day, count]) => ({
    day: new Date(day).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
    responses: count,
  }));

  const insights = [
    metrics.satisfactionRate > 0.8 ? "✅ Taxa de satisfação excelente (>80%)" : "⚠️ Taxa de satisfação moderada",
    metrics.averageRating > 4 ? `⭐ Rating médio excelente: ${metrics.averageRating.toFixed(1)}/5` : `⭐ Rating médio: ${metrics.averageRating.toFixed(1)}/5`,
    metrics.negativeCount > metrics.positiveCount ? "❌ Mais respostas negativas que positivas" : "✅ Mais respostas positivas",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">📊 Dashboard de Feedback</h1>
          <p className="text-gray-600">Análise de satisfação e performance do Assistente Carro</p>
        </div>

        {/* Filtro de Período */}
        <div className="flex gap-2 justify-center">
          {(["24h", "7d", "30d"] as const).map((period) => (
            <Button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              variant={selectedPeriod === period ? "default" : "outline"}
              className={selectedPeriod === period ? "bg-blue-600" : ""}
            >
              {period === "24h" ? "Últimas 24h" : period === "7d" ? "Últimos 7 dias" : "Últimos 30 dias"}
            </Button>
          ))}
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.totalResponses}</div>
              <p className="text-xs text-gray-500 mt-1">Respostas processadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taxa de Satisfação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{(metrics.satisfactionRate * 100).toFixed(0)}%</div>
              <p className="text-xs text-gray-500 mt-1">Positivos + Neutros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rating Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{metrics.averageRating.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">Escala 1-5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resposta Positiva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{metrics.positiveCount}</div>
              <p className="text-xs text-gray-500 mt-1">Feedback positivo</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição de Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feedbackData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feedbackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Respostas por Intenção */}
          <Card>
            <CardHeader>
              <CardTitle>Respostas por Tipo de Pergunta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={intentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Respostas por Hora */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade por Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responses" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Respostas por Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responses" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Insights e Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">{insight}</p>
                </div>
              ))}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900">🎯 Recomendação:</p>
                <p className="text-sm text-yellow-800 mt-1">
                  {metrics.satisfactionRate < 0.6
                    ? "Revise a qualidade das respostas e implemente melhorias no reconhecimento de intenção."
                    : metrics.negativeCount > metrics.positiveCount
                    ? "Aumente o treinamento do modelo para reduzir respostas negativas."
                    : "Desempenho satisfatório! Continue monitorando o feedback dos usuários."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
