/**
 * Dashboard de Métricas de Engajamento de Newsletter
 * Visualiza taxa de abertura, clique, desinscrições e inscritos mais engajados
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

interface MetricsData {
  totalSubscribers: number;
  activeSubscribers: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  avgEngagement: number;
  trendData: Array<{
    date: string;
    opens: number;
    clicks: number;
    unsubscribes: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    opens: number;
    clicks: number;
    rate: number;
  }>;
  topEngagedSubscribers: Array<{
    id: string;
    email: string;
    opens: number;
    clicks: number;
    engagement: number;
  }>;
  unsubscribeReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

// Dados de exemplo
const mockMetricsData: MetricsData = {
  totalSubscribers: 245,
  activeSubscribers: 198,
  openRate: 42.3,
  clickRate: 18.7,
  unsubscribeRate: 2.1,
  avgEngagement: 61.0,
  trendData: [
    { date: "Jan", opens: 156, clicks: 42, unsubscribes: 3 },
    { date: "Fev", opens: 189, clicks: 58, unsubscribes: 2 },
    { date: "Mar", opens: 201, clicks: 71, unsubscribes: 5 },
    { date: "Abr", opens: 234, clicks: 89, unsubscribes: 4 },
    { date: "Mai", opens: 267, clicks: 103, unsubscribes: 6 },
    { date: "Jun", opens: 298, clicks: 127, unsubscribes: 8 },
  ],
  channelPerformance: [
    { channel: "E-mail", opens: 245, clicks: 89, rate: 36.3 },
    { channel: "WhatsApp", opens: 198, clicks: 76, rate: 38.4 },
    { channel: "SMS", opens: 89, clicks: 28, rate: 31.5 },
  ],
  topEngagedSubscribers: [
    { id: "1", email: "maria@example.com", opens: 12, clicks: 8, engagement: 100 },
    { id: "2", email: "joao@example.com", opens: 11, clicks: 7, engagement: 95 },
    { id: "3", email: "ana@example.com", opens: 10, clicks: 6, engagement: 88 },
    { id: "4", email: "carlos@example.com", opens: 9, clicks: 5, engagement: 82 },
    { id: "5", email: "lucia@example.com", opens: 8, clicks: 4, engagement: 75 },
  ],
  unsubscribeReasons: [
    { reason: "Muitos emails", count: 8, percentage: 42.1 },
    { reason: "Conteúdo não relevante", count: 5, percentage: 26.3 },
    { reason: "Mudança de email", count: 4, percentage: 21.1 },
    { reason: "Outro", count: 2, percentage: 10.5 },
  ],
};

export function EngagementMetricsDashboard() {
  const [metrics] = useState<MetricsData>(mockMetricsData);
  const [dateRange] = useState("6months");

  const handleExportPDF = () => {
    console.log("Exportando relatório em PDF");
    // Implementar exportação em PDF
  };

  const handleRefresh = () => {
    console.log("Atualizando métricas");
    // Implementar atualização de dados
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Métricas de Engajamento</h1>
          <p className="text-gray-600 mt-1">Análise de performance da newsletter</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Inscritos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSubscribers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.activeSubscribers} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Abertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.openRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">↑ 2.3% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Clique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">↑ 1.8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Desinscrição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.unsubscribeRate.toFixed(1)}%</div>
            <p className="text-xs text-red-600 mt-1">↑ 0.3% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Engajamento Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgEngagement.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">Score de 0-100</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Engajamento</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="opens" stroke="#3b82f6" name="Aberturas" />
                <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Cliques" />
                <Line type="monotone" dataKey="unsubscribes" stroke="#ef4444" name="Desinscrições" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Canal */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
            <CardDescription>Taxa de engajamento por canal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="opens" fill="#3b82f6" name="Aberturas" />
                <Bar dataKey="clicks" fill="#10b981" name="Cliques" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Razões de Desinscrição */}
        <Card>
          <CardHeader>
            <CardTitle>Razões de Desinscrição</CardTitle>
            <CardDescription>Feedback dos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.unsubscribeReasons}
                  dataKey="count"
                  nameKey="reason"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {metrics.unsubscribeReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#ef4444", "#f97316", "#eab308", "#6b7280"][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inscritos Mais Engajados */}
        <Card>
          <CardHeader>
            <CardTitle>Inscritos Mais Engajados</CardTitle>
            <CardDescription>Top 5 por engajamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topEngagedSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium text-sm">{subscriber.email}</p>
                    <p className="text-xs text-gray-500">
                      {subscriber.opens} aberturas • {subscriber.clicks} cliques
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{subscriber.engagement}</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${subscriber.engagement}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 list-disc list-inside">
            <li>Taxa de abertura acima da média (42.3%). Continue com o timing atual (9h da manhã).</li>
            <li>Considere aumentar frequência de newsletters - o engajamento está crescendo.</li>
            <li>Personalize conteúdo para inscritos com baixo engajamento (&lt;30).</li>
            <li>Revise conteúdo sobre "Muitos emails" - principal razão de desinscrição.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
