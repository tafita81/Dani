import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, MessageSquare, Zap, Target } from "lucide-react";

interface PerformanceMetric {
  timestamp: Date;
  totalComments: number;
  respondedComments: number;
  responseTime: number;
  successRate: number;
  engagement: number;
}

interface PlatformStats {
  platform: string;
  comments: number;
  responses: number;
  successRate: number;
  avgResponseTime: number;
}

export default function AutomationPerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados de performance
    const simulatedMetrics: PerformanceMetric[] = [
      {
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        totalComments: 45,
        respondedComments: 42,
        responseTime: 2.3,
        successRate: 93.3,
        engagement: 87,
      },
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        totalComments: 62,
        respondedComments: 58,
        responseTime: 2.1,
        successRate: 93.5,
        engagement: 89,
      },
      {
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        totalComments: 58,
        respondedComments: 55,
        responseTime: 2.4,
        successRate: 94.8,
        engagement: 91,
      },
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        totalComments: 71,
        respondedComments: 68,
        responseTime: 1.9,
        successRate: 95.8,
        engagement: 93,
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        totalComments: 84,
        respondedComments: 81,
        responseTime: 1.8,
        successRate: 96.4,
        engagement: 95,
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        totalComments: 92,
        respondedComments: 89,
        responseTime: 1.7,
        successRate: 96.7,
        engagement: 96,
      },
      {
        timestamp: new Date(),
        totalComments: 105,
        respondedComments: 102,
        responseTime: 1.6,
        successRate: 97.1,
        engagement: 97,
      },
    ];

    const simulatedPlatformStats: PlatformStats[] = [
      {
        platform: "Instagram",
        comments: 285,
        responses: 278,
        successRate: 97.5,
        avgResponseTime: 1.8,
      },
      {
        platform: "YouTube",
        comments: 156,
        responses: 149,
        successRate: 95.5,
        avgResponseTime: 2.1,
      },
      {
        platform: "TikTok",
        comments: 98,
        responses: 92,
        successRate: 93.9,
        avgResponseTime: 2.4,
      },
    ];

    setMetrics(simulatedMetrics);
    setPlatformStats(simulatedPlatformStats);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const totalComments = metrics.reduce((sum, m) => sum + m.totalComments, 0);
  const totalResponses = metrics.reduce((sum, m) => sum + m.respondedComments, 0);
  const avgSuccessRate =
    metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
  const avgResponseTime =
    metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;

  const chartData = metrics.map((m) => ({
    date: m.timestamp.toLocaleDateString("pt-BR"),
    respondidos: m.respondedComments,
    total: m.totalComments,
    taxa: m.successRate,
    tempo: m.responseTime,
  }));

  const platformColors = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Comentários</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respondidos</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              {((totalResponses / totalComments) * 100).toFixed(1)}% de taxa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média de 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">Resposta automática</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comentários Respondidos (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="respondidos" fill="#3b82f6" name="Respondidos" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Sucesso (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="taxa"
                  stroke="#10b981"
                  name="Taxa (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platformStats.map((stat, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{stat.platform}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comentários:</span>
                    <span className="font-medium">{stat.comments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Respondidos:</span>
                    <span className="font-medium">{stat.responses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de Sucesso:</span>
                    <span className="font-medium text-green-600">
                      {stat.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo Médio:</span>
                    <span className="font-medium">{stat.avgResponseTime.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Comentários por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformStats}
                dataKey="comments"
                nameKey="platform"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {platformStats.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={platformColors[idx]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
