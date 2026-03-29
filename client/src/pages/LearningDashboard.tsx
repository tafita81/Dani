/**
 * Learning Dashboard — Visualização de aprendizado contínuo e evolução
 */

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Brain, Target, Zap, GitBranch, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function LearningDashboard() {
  const [selectedDays, setSelectedDays] = useState(30);

  // Queries
  const dailyReport = useQuery({
    queryKey: ["learning", "daily-report"],
    queryFn: async () => trpc.learning.generateDailyReport.query(),
  });

  const evolution = useQuery({
    queryKey: ["learning", "evolution", selectedDays],
    queryFn: async () => trpc.learning.analyzeEvolution.query({ days: selectedDays }),
  });

  const syncHistory = useQuery({
    queryKey: ["learning", "sync-history"],
    queryFn: async () => trpc.learning.getSyncHistory.query({ limit: 20 }),
  });

  // Mutations
  const calculateMetrics = useMutation({
    mutationFn: async () => trpc.learning.calculateDailyMetrics.mutate(),
  });

  const discoverInsights = useMutation({
    mutationFn: async () => trpc.learning.discoverInsights.mutate(),
  });

  const generateOptimizations = useQuery({
    queryKey: ["learning", "optimizations"],
    queryFn: async () => trpc.learning.generateOptimizationSuggestions.query(),
  });

  // Loading states
  if (dailyReport.isLoading || evolution.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Analisando aprendizados...</p>
        </div>
      </div>
    );
  }

  const report = dailyReport.data;
  const evo = evolution.data;

  // Preparar dados para gráficos
  const metricsData = evo?.metrics?.map((m: any) => ({
    date: new Date(m.periodDate).toLocaleDateString("pt-BR"),
    successRate: parseFloat(m.successRate || "0"),
    engagement: m.totalEngagement,
    satisfaction: parseFloat(m.satisfactionScore || "0"),
  })) || [];

  const insightTypes = report?.insights?.reduce((acc: any, insight: any) => {
    const existing = acc.find((i: any) => i.name === insight.title);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: insight.title, value: 1 });
    }
    return acc;
  }, []) || [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🧠 Aprendizado Contínuo</h1>
          <p className="text-gray-600 mt-2">Evolução quantitativa e otimização automática do sistema</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => calculateMetrics.mutate()} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Calcular Métricas
          </Button>
          <Button onClick={() => discoverInsights.mutate()} variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Descobrir Insights
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Success Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report?.metrics?.successRate?.toFixed(1) || "0"}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  {report?.metrics?.successfulActions}/{report?.metrics?.totalActionsExecuted} ações
                </p>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report?.metrics?.totalEngagement || "0"}</div>
                <p className="text-xs text-gray-600 mt-1">Interações totais</p>
              </CardContent>
            </Card>

            {/* Conversões */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report?.metrics?.totalConversions || "0"}</div>
                <p className="text-xs text-gray-600 mt-1">{report?.metrics?.conversionRate?.toFixed(1) || "0"}% taxa</p>
              </CardContent>
            </Card>

            {/* Satisfação */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report?.metrics?.satisfactionScore?.toFixed(1) || "0"}%</div>
                <p className="text-xs text-gray-600 mt-1">Feedback positivo</p>
              </CardContent>
            </Card>
          </div>

          {/* Planos de Melhoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Planos de Melhoria Contínua
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report?.improvementPlans?.map((plan: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{plan.objective}</p>
                      <p className="text-sm text-gray-600">Status: {plan.status}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{plan.progress}%</div>
                      <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                        <div className="h-full bg-blue-500 rounded" style={{ width: `${plan.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* METRICS */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="flex gap-2 mb-4">
            {[7, 14, 30, 90].map((days) => (
              <Button key={days} variant={selectedDays === days ? "default" : "outline"} onClick={() => setSelectedDays(days)}>
                {days}d
              </Button>
            ))}
          </div>

          {/* Gráfico de Evolução */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Métricas</CardTitle>
              <CardDescription>Taxa de sucesso, engajamento e satisfação ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="successRate" stroke="#3b82f6" name="Taxa de Sucesso %" />
                  <Line type="monotone" dataKey="satisfaction" stroke="#10b981" name="Satisfação %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Estatísticas de Tendência */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${evo?.successRateChange > 0 ? "text-green-500" : "text-red-500"}`} />
                  <span className="text-2xl font-bold">{evo?.successRateChange}%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Mudança em {evo?.period}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${evo?.engagementChange > 0 ? "text-green-500" : "text-red-500"}`} />
                  <span className="text-2xl font-bold">{evo?.engagementChange}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Interações adicionais</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${evo?.satisfactionChange > 0 ? "text-green-500" : "text-red-500"}`} />
                  <span className="text-2xl font-bold">{evo?.satisfactionChange}%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Feedback positivo</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INSIGHTS */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Insights Descobertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report?.insights?.map((insight: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Confiança: {insight.confidence}%</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recomendações:</p>
                      <ul className="text-sm space-y-1">
                        {insight.recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sugestões de Otimização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Sugestões de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{generateOptimizations.data || "Carregando sugestões..."}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Histórico de Sincronizações GitHub
              </CardTitle>
              <CardDescription>Commits automáticos com aprendizados e otimizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {syncHistory.data?.map((sync: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-gray-600">{sync.commitHash?.substring(0, 8)}</p>
                      <p className="text-sm font-medium">{sync.commitMessage}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(sync.syncedAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{sync.triggerReason}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LearningDashboard;
