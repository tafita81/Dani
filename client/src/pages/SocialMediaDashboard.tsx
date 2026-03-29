import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ScatterChart,
  Scatter,
} from "recharts";
import { Instagram, Youtube, MessageCircle, TrendingUp, Users, Heart, MessageSquare, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialMetrics {
  platform: string;
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
  posts: number;
}

interface LeadMetrics {
  region: string;
  leads: number;
  qualified: number;
  converted: number;
  conversionRate: number;
}

export default function SocialMediaDashboard() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

  // Dados de performance por plataforma
  const platformMetrics: SocialMetrics[] = [
    {
      platform: "Instagram",
      followers: 15420,
      engagement: 8.5,
      reach: 125000,
      impressions: 450000,
      posts: 24,
    },
    {
      platform: "YouTube",
      followers: 3250,
      engagement: 12.3,
      reach: 45000,
      impressions: 180000,
      posts: 8,
    },
    {
      platform: "WhatsApp",
      followers: 2100,
      engagement: 35.2,
      reach: 2100,
      impressions: 2100,
      posts: 0,
    },
  ];

  // Dados de leads por região
  const leadsByRegion: LeadMetrics[] = [
    { region: "São Paulo", leads: 450, qualified: 135, converted: 27, conversionRate: 6 },
    { region: "Rio de Janeiro", leads: 320, qualified: 96, converted: 19, conversionRate: 5.9 },
    { region: "Minas Gerais", leads: 280, qualified: 84, converted: 17, conversionRate: 6.1 },
    { region: "Bahia", leads: 210, qualified: 63, converted: 13, conversionRate: 6.2 },
    { region: "Santa Catarina", leads: 180, qualified: 54, converted: 11, conversionRate: 6.1 },
  ];

  // Dados de crescimento
  const growthData = [
    { week: "Sem 1", instagram: 14800, youtube: 3100, whatsapp: 1800 },
    { week: "Sem 2", instagram: 15050, youtube: 3150, whatsapp: 1900 },
    { week: "Sem 3", instagram: 15200, youtube: 3200, whatsapp: 2000 },
    { week: "Sem 4", instagram: 15420, youtube: 3250, whatsapp: 2100 },
  ];

  // Dados de engajamento
  const engagementData = [
    { day: "Seg", likes: 850, comments: 120, shares: 45 },
    { day: "Ter", likes: 920, comments: 145, shares: 52 },
    { day: "Qua", likes: 1050, comments: 180, shares: 68 },
    { day: "Qui", likes: 780, comments: 95, shares: 38 },
    { day: "Sex", likes: 1200, comments: 210, shares: 85 },
    { day: "Sab", likes: 1450, comments: 280, shares: 120 },
    { day: "Dom", likes: 1100, comments: 160, shares: 70 },
  ];

  // Dados de conteúdo mais performático
  const topPosts = [
    { title: "5 sinais de que você precisa de terapia", engagement: 2850, reach: 45000 },
    { title: "Como lidar com ansiedade", engagement: 2120, reach: 38000 },
    { title: "Relacionamentos saudáveis", engagement: 1890, reach: 32000 },
    { title: "Autoestima: como construir", engagement: 1650, reach: 28000 },
    { title: "Mindfulness para iniciantes", engagement: 1420, reach: 24000 },
  ];

  const handleExportReport = () => {
    const report = `
RELATÓRIO DE REDES SOCIAIS E LEADS
Data: ${new Date().toLocaleDateString("pt-BR")}

MÉTRICAS POR PLATAFORMA:
${platformMetrics.map((p) => `- ${p.platform}: ${p.followers} seguidores, ${p.engagement}% engajamento`).join("\n")}

LEADS POR REGIÃO:
${leadsByRegion.map((r) => `- ${r.region}: ${r.leads} leads (${r.conversionRate}% conversão)`).join("\n")}

TOP POSTS:
${topPosts.map((p, i) => `${i + 1}. ${p.title} - ${p.engagement} engajamentos`).join("\n")}
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social-media-report.txt";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Redes Sociais</h1>
          <p className="text-muted-foreground mt-2">Monitoramento de Instagram, YouTube e WhatsApp</p>
        </div>
        <Button onClick={handleExportReport} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total de Seguidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">20.770</div>
            <p className="text-xs text-green-600 mt-1">↑ 12.5% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Engajamento Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18.7%</div>
            <p className="text-xs text-muted-foreground mt-1">Acima da média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Leads Capturados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.440</div>
            <p className="text-xs text-green-600 mt-1">↑ 28% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6.1%</div>
            <p className="text-xs text-muted-foreground mt-1">Leads → Clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Visualizações */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leads">Leads por Região</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
        </TabsList>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Seguidores</CardTitle>
              <CardDescription>Últimas 4 semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="instagram" stroke="#E1306C" name="Instagram" />
                  <Line type="monotone" dataKey="youtube" stroke="#FF0000" name="YouTube" />
                  <Line type="monotone" dataKey="whatsapp" stroke="#25D366" name="WhatsApp" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platformMetrics.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {platform.platform === "Instagram" && <Instagram className="w-5 h-5" />}
                    {platform.platform === "YouTube" && <Youtube className="w-5 h-5" />}
                    {platform.platform === "WhatsApp" && <MessageCircle className="w-5 h-5" />}
                    {platform.platform}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seguidores:</span>
                    <span className="font-bold">{platform.followers.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engajamento:</span>
                    <span className="font-bold">{platform.engagement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reach:</span>
                    <span className="font-bold">{platform.reach.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posts:</span>
                    <span className="font-bold">{platform.posts}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leads por Região */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Leads por Região</CardTitle>
              <CardDescription>Brasil todo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={leadsByRegion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="Total de Leads" />
                  <Bar dataKey="qualified" fill="#10b981" name="Qualificados" />
                  <Bar dataKey="converted" fill="#f59e0b" name="Convertidos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leadsByRegion.map((region) => (
                  <div key={region.region} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{region.region}</span>
                      <span className="text-sm text-green-600">{region.conversionRate}% conversão</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>📊 {region.leads} leads</span>
                      <span>✅ {region.qualified} qualificados</span>
                      <span>🎯 {region.converted} convertidos</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engajamento */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engajamento Semanal</CardTitle>
              <CardDescription>Likes, comentários e compartilhamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="likes"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorLikes)"
                    name="Likes"
                  />
                  <Area
                    type="monotone"
                    dataKey="comments"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorComments)"
                    name="Comentários"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Posts</CardTitle>
              <CardDescription>Conteúdo mais performático</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                        <p className="font-semibold">{post.title}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {post.engagement} engajamentos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {post.reach.toLocaleString("pt-BR")} reach
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(post.engagement / 3000) * 100}%` }}
                      ></div>
                    </div>
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
