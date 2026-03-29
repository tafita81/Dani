import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, DollarSign, Users, Target, Download, Calendar } from "lucide-react";

interface SalesMetric {
  period: string;
  revenue: number;
  conversions: number;
  avgTicket: number;
  conversionRate: number;
}

interface ChannelPerformance {
  channel: string;
  revenue: number;
  conversions: number;
  roi: number;
  color: string;
}

export default function SalesDashboard() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month");

  // Dados de receita
  const revenueData: SalesMetric[] = [
    {
      period: "Sem 1",
      revenue: 15000,
      conversions: 30,
      avgTicket: 500,
      conversionRate: 3.5,
    },
    {
      period: "Sem 2",
      revenue: 18500,
      conversions: 37,
      avgTicket: 500,
      conversionRate: 4.2,
    },
    {
      period: "Sem 3",
      revenue: 22000,
      conversions: 44,
      avgTicket: 500,
      conversionRate: 4.8,
    },
    {
      period: "Sem 4",
      revenue: 28000,
      conversions: 56,
      avgTicket: 500,
      conversionRate: 5.6,
    },
  ];

  // Performance por canal
  const channelData: ChannelPerformance[] = [
    { channel: "Instagram", revenue: 35000, conversions: 70, roi: 450, color: "#E1306C" },
    { channel: "WhatsApp", revenue: 28000, conversions: 56, roi: 380, color: "#25D366" },
    { channel: "Google Ads", revenue: 22000, conversions: 44, roi: 320, color: "#4285F4" },
    { channel: "Referral", revenue: 18000, conversions: 36, roi: 280, color: "#FF6B6B" },
  ];

  // Forecast
  const forecastData = [
    { month: "Jan", atual: 15000, forecast: 15000 },
    { month: "Fev", atual: 18500, forecast: 18500 },
    { month: "Mar", atual: 22000, forecast: 22000 },
    { month: "Abr", atual: 28000, forecast: 28000 },
    { month: "Mai", atual: null, forecast: 35000 },
    { month: "Jun", atual: null, forecast: 42000 },
    { month: "Jul", atual: null, forecast: 50000 },
  ];

  // KPIs
  const kpis = {
    totalRevenue: 83500,
    totalConversions: 167,
    avgTicket: 500,
    conversionRate: 4.5,
    monthlyGrowth: 28.5,
    forecastedRevenue: 245000,
  };

  const handleExportReport = () => {
    const report = `
RELATÓRIO DE PERFORMANCE DE VENDAS
Data: ${new Date().toLocaleDateString("pt-BR")}

KPIs PRINCIPAIS:
- Receita Total: R$ ${kpis.totalRevenue.toLocaleString("pt-BR")}
- Total de Conversões: ${kpis.totalConversions}
- Ticket Médio: R$ ${kpis.avgTicket.toLocaleString("pt-BR")}
- Taxa de Conversão: ${kpis.conversionRate}%
- Crescimento Mensal: ${kpis.monthlyGrowth}%
- Receita Prevista (6 meses): R$ ${kpis.forecastedRevenue.toLocaleString("pt-BR")}

PERFORMANCE POR CANAL:
${channelData.map((c) => `- ${c.channel}: R$ ${c.revenue.toLocaleString("pt-BR")} (ROI: ${c.roi}%)`).join("\n")}
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-report.txt";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance de Vendas</h1>
          <p className="text-muted-foreground mt-2">Análise de KPIs, receita e previsões</p>
        </div>
        <Button onClick={handleExportReport} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {kpis.totalRevenue.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-green-600 mt-1">↑ {kpis.monthlyGrowth}% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalConversions}</div>
            <p className="text-xs text-muted-foreground mt-1">Pacientes/Leads convertidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {kpis.avgTicket.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Valor médio por conversão</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Visualizações */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="forecast">Previsão</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Receita */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Receita</CardTitle>
              <CardDescription>Receita semanal com tendência</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conversionRate"
                    stroke="#f59e0b"
                    name="Taxa de Conversão (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Canais */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Canal</CardTitle>
              <CardDescription>Distribuição de receita entre canais</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Receita" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channelData.map((channel) => (
              <Card key={channel.channel}>
                <CardHeader>
                  <CardTitle className="text-lg">{channel.channel}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receita:</span>
                    <span className="font-bold">R$ {channel.revenue.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversões:</span>
                    <span className="font-bold">{channel.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI:</span>
                    <span className="font-bold text-green-600">{channel.roi}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Previsão */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Receita (6 Meses)</CardTitle>
              <CardDescription>Com machine learning baseado em histórico</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => (value ? `R$ ${value.toLocaleString("pt-BR")}` : "N/A")} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="atual"
                    stroke="#3b82f6"
                    name="Receita Atual"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#f59e0b"
                    name="Previsão"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Previsão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Receita Prevista (6 meses)</span>
                <span className="text-2xl font-bold text-green-600">
                  R$ {kpis.forecastedRevenue.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Crescimento Estimado</span>
                <span className="text-2xl font-bold text-blue-600">+195%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Conversões Previstas</span>
                <span className="text-2xl font-bold text-purple-600">490</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center mb-4">{kpis.conversionRate}%</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta:</span>
                    <span>5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(kpis.conversionRate / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center mb-4 text-green-600">
                  +{kpis.monthlyGrowth}%
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Comparado ao mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Receita por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ channel, revenue }) =>
                      `${channel}: R$ ${(revenue / 1000).toFixed(0)}k`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
