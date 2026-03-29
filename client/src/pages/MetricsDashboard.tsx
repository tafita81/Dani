import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  Instagram,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

export default function MetricsDashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("month");

  // Dados de pacientes por origem
  const patientsByOrigin = [
    { name: "WhatsApp", value: 45, color: "#25D366" },
    { name: "Instagram", value: 28, color: "#E4405F" },
    { name: "Site", value: 18, color: "#3B82F6" },
    { name: "Referência", value: 9, color: "#F59E0B" },
  ];

  // Dados de taxa de conversão
  const conversionData = [
    { channel: "WhatsApp", leads: 150, conversions: 45, rate: 30 },
    { channel: "Instagram", leads: 200, conversions: 28, rate: 14 },
    { channel: "Site", leads: 120, conversions: 18, rate: 15 },
    { channel: "Telegram", leads: 80, conversions: 12, rate: 15 },
    { channel: "Referência", leads: 60, conversions: 9, rate: 15 },
  ];

  // Dados de engajamento Instagram
  const instagramEngagement = [
    { date: "Seg", followers: 2400, engagement: 240, reach: 2400 },
    { date: "Ter", followers: 2210, engagement: 221, reach: 2290 },
    { date: "Qua", followers: 2290, engagement: 229, reach: 2000 },
    { date: "Qui", followers: 2000, engagement: 200, reach: 2181 },
    { date: "Sex", followers: 2181, engagement: 218, reach: 2500 },
    { date: "Sab", followers: 2500, engagement: 250, reach: 2100 },
    { date: "Dom", followers: 2100, engagement: 210, reach: 2800 },
  ];

  // Dados de progresso clínico
  const clinicalProgress = [
    { technique: "TCC", patients: 32, improvement: 85, avgSessions: 12 },
    { technique: "Esquema", patients: 28, improvement: 78, avgSessions: 15 },
    { technique: "Gestalt", patients: 18, improvement: 82, avgSessions: 10 },
    { technique: "Integrativa", patients: 12, improvement: 88, avgSessions: 14 },
  ];

  // Dados de evolução temporal
  const timeSeriesData = [
    { month: "Jan", patients: 15, leads: 45, conversions: 8 },
    { month: "Fev", patients: 28, leads: 78, conversions: 15 },
    { month: "Mar", patients: 45, leads: 120, conversions: 25 },
    { month: "Abr", patients: 68, leads: 180, conversions: 38 },
    { month: "Mai", patients: 95, leads: 250, conversions: 52 },
    { month: "Jun", patients: 128, leads: 340, conversions: 72 },
  ];

  // Cards de resumo
  const summaryCards = [
    {
      title: "Total de Pacientes",
      value: "128",
      change: "+23%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Taxa de Conversão",
      value: "18.5%",
      change: "+4.2%",
      icon: Target,
      color: "text-green-500",
    },
    {
      title: "Seguidores Instagram",
      value: "2.5K",
      change: "+12%",
      icon: Instagram,
      color: "text-pink-500",
    },
    {
      title: "Leads Qualificados",
      value: "340",
      change: "+35%",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Métricas</h1>
          <p className="text-muted-foreground mt-2">
            Análise completa de performance e crescimento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {period}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-green-600 mt-1">{card.change} vs período anterior</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes por Origem */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes por Origem</CardTitle>
            <CardDescription>Distribuição de novos pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={patientsByOrigin}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {patientsByOrigin.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução Temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
            <CardDescription>Evolução de pacientes, leads e conversões</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorPatients)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes análises */}
      <Tabs defaultValue="conversion" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversion">Taxa de Conversão</TabsTrigger>
          <TabsTrigger value="instagram">Instagram Analytics</TabsTrigger>
          <TabsTrigger value="clinical">Progresso Clínico</TabsTrigger>
        </TabsList>

        {/* Taxa de Conversão */}
        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversão por Canal</CardTitle>
              <CardDescription>Taxa de conversão de leads para pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="leads" fill="#8884d8" name="Leads" />
                  <Bar yAxisId="left" dataKey="conversions" fill="#82ca9d" name="Conversões" />
                  <Bar yAxisId="right" dataKey="rate" fill="#ffc658" name="Taxa %" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-4">
                {conversionData.map((channel) => (
                  <div
                    key={channel.channel}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{channel.channel}</div>
                      <div className="text-sm text-muted-foreground">
                        {channel.conversions} de {channel.leads} leads
                      </div>
                    </div>
                    <Badge variant={channel.rate >= 20 ? "default" : "secondary"}>
                      {channel.rate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Analytics */}
        <TabsContent value="instagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Instagram</CardTitle>
              <CardDescription>Engajamento, alcance e crescimento de seguidores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={instagramEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke="#E4405F"
                    name="Seguidores"
                  />
                  <Line type="monotone" dataKey="engagement" stroke="#25D366" name="Engajamento" />
                  <Line type="monotone" dataKey="reach" stroke="#3B82F6" name="Alcance" />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Engajamento Médio</div>
                  <div className="text-2xl font-bold">23.5%</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Alcance Médio</div>
                  <div className="text-2xl font-bold">2.3K</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Taxa de Crescimento</div>
                  <div className="text-2xl font-bold">+12%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progresso Clínico */}
        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresso Clínico por Técnica</CardTitle>
              <CardDescription>Efetividade das abordagens terapêuticas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={clinicalProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="technique" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patients" fill="#8884d8" name="Pacientes" />
                  <Bar dataKey="improvement" fill="#82ca9d" name="Melhora %" />
                  <Bar dataKey="avgSessions" fill="#ffc658" name="Sessões Médias" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-4">
                {clinicalProgress.map((technique) => (
                  <div
                    key={technique.technique}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{technique.technique}</div>
                      <Badge>{technique.patients} pacientes</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${technique.improvement}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {technique.improvement}% de melhora | {technique.avgSessions} sessões em média
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Otimização</CardTitle>
          <CardDescription>Baseado na análise de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-bold">1</div>
              <div>
                <div className="font-semibold text-blue-900">Aumentar investimento em Instagram</div>
                <div className="text-sm text-blue-800">
                  Taxa de conversão 14% vs 30% do WhatsApp. Implementar mais conteúdo educativo.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-bold">2</div>
              <div>
                <div className="font-semibold text-green-900">Otimizar funil de WhatsApp</div>
                <div className="text-sm text-green-800">
                  Melhor canal com 30% de conversão. Criar automação de follow-up.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-bold">3</div>
              <div>
                <div className="font-semibold text-purple-900">Expandir programa de referência</div>
                <div className="text-sm text-purple-800">
                  Referências têm taxa de conversão 15%. Criar incentivos para pacientes indicarem.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
