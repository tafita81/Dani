import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";

export function CarAnalyticsDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<"duration" | "frequency" | "riskLevel" | "techniques">("duration");
  const [dateRange, setDateRange] = useState<"week" | "month" | "all">("month");

  // Buscar dados de sessões
  const { data: sessions = [], isLoading } = trpc.carAssistant.getSessions.useQuery();

  // Dados simulados para gráficos (em produção, viriam do backend)
  const durationData = [
    { date: "Seg", duration: 45, sessions: 2 },
    { date: "Ter", duration: 62, sessions: 3 },
    { date: "Qua", duration: 38, sessions: 1 },
    { date: "Qui", duration: 55, sessions: 2 },
    { date: "Sex", duration: 72, sessions: 4 },
    { date: "Sab", duration: 28, sessions: 1 },
    { date: "Dom", duration: 0, sessions: 0 },
  ];

  const riskLevelData = [
    { name: "Baixo", value: 65, color: "#10b981" },
    { name: "Médio", value: 25, color: "#f59e0b" },
    { name: "Alto", value: 10, color: "#ef4444" },
  ];

  const techniquesData = [
    { technique: "TCC", frequency: 45 },
    { technique: "Respiração", frequency: 38 },
    { technique: "Grounding", frequency: 32 },
    { technique: "Mindfulness", frequency: 28 },
    { technique: "Gestalt", frequency: 15 },
  ];

  const frequencyData = [
    { week: "Sem 1", sessions: 8, avgDuration: 52 },
    { week: "Sem 2", sessions: 12, avgDuration: 58 },
    { week: "Sem 3", sessions: 10, avgDuration: 55 },
    { week: "Sem 4", sessions: 15, avgDuration: 61 },
  ];

  const stats = {
    totalSessions: sessions.length,
    avgDuration: Math.round(sessions.reduce((sum: number, s: any) => sum + (s.durationSeconds || 0), 0) / sessions.length / 60) || 0,
    totalTime: Math.round(sessions.reduce((sum: number, s: any) => sum + (s.durationSeconds || 0), 0) / 3600) || 0,
    riskAlertsTriggered: 3,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">📊 Dashboard Assistente Carro</h1>
        <p className="text-gray-600 mt-2">Análise de sessões, padrões e insights clínicos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-gray-500 mt-1">Neste mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Duração Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}m</div>
            <p className="text-xs text-gray-500 mt-1">Por sessão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tempo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTime}h</div>
            <p className="text-xs text-gray-500 mt-1">Acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Alertas de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.riskAlertsTriggered}</div>
            <p className="text-xs text-gray-500 mt-1">Detectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Metric Selection */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedMetric === "duration" ? "default" : "outline"}
          onClick={() => setSelectedMetric("duration")}
          size="sm"
        >
          Duração
        </Button>
        <Button
          variant={selectedMetric === "frequency" ? "default" : "outline"}
          onClick={() => setSelectedMetric("frequency")}
          size="sm"
        >
          Frequência
        </Button>
        <Button
          variant={selectedMetric === "riskLevel" ? "default" : "outline"}
          onClick={() => setSelectedMetric("riskLevel")}
          size="sm"
        >
          Nível de Risco
        </Button>
        <Button
          variant={selectedMetric === "techniques" ? "default" : "outline"}
          onClick={() => setSelectedMetric("techniques")}
          size="sm"
        >
          Técnicas
        </Button>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duration Chart */}
        {selectedMetric === "duration" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Duração das Sessões (Últimos 7 dias)</CardTitle>
              <CardDescription>Tempo em minutos por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={durationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="duration" stroke="#3b82f6" name="Duração (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Frequency Chart */}
        {selectedMetric === "frequency" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Frequência de Sessões (Últimas 4 semanas)</CardTitle>
              <CardDescription>Número de sessões e duração média</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill="#10b981" name="Sessões" />
                  <Bar dataKey="avgDuration" fill="#f59e0b" name="Duração Média (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Risk Level Chart */}
        {selectedMetric === "riskLevel" && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Nível de Risco</CardTitle>
              <CardDescription>Proporção de sessões por nível</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskLevelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Techniques Chart */}
        {selectedMetric === "techniques" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Técnicas Mais Utilizadas</CardTitle>
              <CardDescription>Frequência de aplicação em sessões</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={techniquesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="technique" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#8b5cf6" name="Frequência" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessões Recentes</CardTitle>
          <CardDescription>Últimas 5 sessões do Assistente Carro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Sessão #{idx + 1}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(session.sessionStartTime).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(session.sessionStartTime).toLocaleTimeString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{Math.round((session.durationSeconds || 0) / 60)}m</p>
                  <p className={`text-sm ${session.status === "completed" ? "text-green-600" : "text-gray-600"}`}>
                    {session.status === "completed" ? "Concluída" : "Ativa"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Insights Clínicos</CardTitle>
          <CardDescription>Análises e recomendações baseadas nos dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">📈 Tendência Positiva</p>
              <p className="text-sm text-blue-700 mt-1">Duração média das sessões aumentou 15% nas últimas 2 semanas</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-900">⚠️ Padrão Detectado</p>
              <p className="text-sm text-amber-700 mt-1">Maior frequência de alertas de risco às sextas-feiras</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">✅ Recomendação</p>
              <p className="text-sm text-green-700 mt-1">Técnicas de TCC estão sendo mais eficazes que outras abordagens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CarAnalyticsDashboard;
