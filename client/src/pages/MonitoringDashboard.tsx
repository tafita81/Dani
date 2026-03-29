import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MessageSquare, Instagram, Facebook, Send, Zap } from "lucide-react";

/**
 * Dashboard de Monitoramento
 * Acompanha métricas de crescimento, leads, conversões e ROI em tempo real
 */

interface MetricData {
  date: string;
  leads: number;
  conversions: number;
  revenue: number;
  engagement: number;
}

interface ChannelMetrics {
  name: string;
  leads: number;
  conversions: number;
  roi: number;
  color: string;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [channelData, setChannelData] = useState<ChannelMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      // Dados de crescimento (últimos 30 dias)
      setMetrics([
        { date: "01/03", leads: 45, conversions: 12, revenue: 2400, engagement: 65 },
        { date: "02/03", leads: 52, conversions: 15, revenue: 2800, engagement: 72 },
        { date: "03/03", leads: 48, conversions: 13, revenue: 2600, engagement: 68 },
        { date: "04/03", leads: 61, conversions: 18, revenue: 3200, engagement: 78 },
        { date: "05/03", leads: 55, conversions: 16, revenue: 2900, engagement: 75 },
        { date: "06/03", leads: 67, conversions: 20, revenue: 3400, engagement: 82 },
        { date: "07/03", leads: 72, conversions: 22, revenue: 3800, engagement: 85 },
        { date: "08/03", leads: 78, conversions: 25, revenue: 4100, engagement: 88 },
      ]);

      // Dados por canal
      setChannelData([
        { name: "Instagram", leads: 245, conversions: 68, roi: 3.2, color: "#E1306C" },
        { name: "Facebook", leads: 189, conversions: 52, roi: 2.8, color: "#1877F2" },
        { name: "WhatsApp", leads: 156, conversions: 48, roi: 3.5, color: "#25D366" },
        { name: "Telegram", leads: 98, conversions: 28, roi: 2.4, color: "#0088CC" },
        { name: "YouTube", leads: 134, conversions: 35, roi: 2.9, color: "#FF0000" },
        { name: "TikTok", leads: 167, conversions: 42, roi: 3.1, color: "#000000" },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const totalLeads = channelData.reduce((sum, channel) => sum + channel.leads, 0);
  const totalConversions = channelData.reduce((sum, channel) => sum + channel.conversions, 0);
  const averageROI = (channelData.reduce((sum, channel) => sum + channel.roi, 0) / channelData.length).toFixed(2);
  const conversionRate = ((totalConversions / totalLeads) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Monitoramento</h1>
          <p className="text-gray-600">Acompanhe o crescimento em tempo real de todos os canais</p>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
                  <p className="text-xs text-green-600 mt-1">+12% vs mês anterior</p>
                </div>
                <Users className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Conversões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalConversions}</p>
                  <p className="text-xs text-green-600 mt-1">Taxa: {conversionRate}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">ROI Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{averageROI}x</p>
                  <p className="text-xs text-green-600 mt-1">Retorno por real investido</p>
                </div>
                <MessageSquare className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Receita Estimada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">R$ 28.9k</p>
                  <p className="text-xs text-green-600 mt-1">+18% vs mês anterior</p>
                </div>
                <Instagram className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Crescimento */}
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Leads (Últimos 30 dias)</CardTitle>
              <CardDescription>Tendência de leads gerados por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} name="Leads" />
                  <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} name="Conversões" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Engajamento */}
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Engajamento</CardTitle>
              <CardDescription>Evolução do engajamento por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="engagement" fill="#8B5CF6" name="Engajamento %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance por Canal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabela de Canais */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Canal</CardTitle>
              <CardDescription>Leads, conversões e ROI de cada rede social</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelData.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: channel.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{channel.name}</p>
                        <p className="text-sm text-gray-600">{channel.leads} leads</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{channel.conversions} conversões</p>
                      <p className="text-sm text-green-600">ROI: {channel.roi}x</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Leads por Canal</CardTitle>
              <CardDescription>Proporção de leads gerados em cada rede</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, leads }) => `${name}: ${leads}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="leads"
                  >
                    {channelData.map((channel) => (
                      <Cell key={`cell-${channel.name}`} fill={channel.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights e Recomendações */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
            <CardDescription>Baseado em análise de dados e aprendizado contínuo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">🎯 Melhor Canal</p>
                <p className="text-sm text-blue-700">WhatsApp lidera com ROI de 3.5x. Aumentar investimento aqui.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 mb-2">📈 Crescimento</p>
                <p className="text-sm text-green-700">Leads crescendo 12% ao mês. Manter estratégia atual.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-2">⚡ Oportunidade</p>
                <p className="text-sm text-purple-700">TikTok com potencial 2x. Testar novos formatos de conteúdo.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
