import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
} from "recharts";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  TrendingUp,
  RefreshCw,
  Download,
} from "lucide-react";

export default function InstagramRealTimeAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - será substituído por dados reais do Instagram API
  const [metrics, setMetrics] = useState({
    followers: 15420,
    engagement: 8.5,
    reach: 125000,
    impressions: 250000,
    posts: 42,
  });

  const [engagementData] = useState([
    { name: "Seg", likes: 450, comments: 120, shares: 45 },
    { name: "Ter", likes: 520, comments: 150, shares: 60 },
    { name: "Qua", likes: 480, comments: 140, shares: 55 },
    { name: "Qui", likes: 610, comments: 180, shares: 75 },
    { name: "Sex", likes: 720, comments: 210, shares: 95 },
    { name: "Sab", likes: 850, comments: 250, shares: 120 },
    { name: "Dom", likes: 950, comments: 280, shares: 140 },
  ]);

  const [growthData] = useState([
    { date: "1 semana atrás", followers: 14200 },
    { date: "5 dias atrás", followers: 14600 },
    { date: "3 dias atrás", followers: 15100 },
    { date: "Ontem", followers: 15300 },
    { date: "Hoje", followers: 15420 },
  ]);

  const [topPosts] = useState([
    {
      id: 1,
      caption: "Dica de Psicologia: Como lidar com ansiedade",
      likes: 2450,
      comments: 320,
      engagement: 12.5,
    },
    {
      id: 2,
      caption: "Quiz: Qual é seu tipo de personalidade?",
      likes: 1850,
      comments: 280,
      engagement: 10.2,
    },
    {
      id: 3,
      caption: "Técnica de respiração para relaxar",
      likes: 1620,
      comments: 210,
      engagement: 8.9,
    },
  ]);

  const [contentTypeData] = useState([
    { name: "Reels", value: 35, color: "#FF6B6B" },
    { name: "Posts", value: 40, color: "#4ECDC4" },
    { name: "Stories", value: 20, color: "#45B7D1" },
    { name: "Carrosséis", value: 5, color: "#FFA07A" },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular atualização de dados
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setMetrics({
      followers: metrics.followers + Math.floor(Math.random() * 50),
      engagement: 8.5 + (Math.random() * 2 - 1),
      reach: metrics.reach + Math.floor(Math.random() * 5000),
      impressions: metrics.impressions + Math.floor(Math.random() * 10000),
      posts: metrics.posts,
    });
    setIsRefreshing(false);
  };

  const handleExportReport = () => {
    const report = `
RELATÓRIO DE ANALYTICS INSTAGRAM
Data: ${new Date().toLocaleString("pt-BR")}

MÉTRICAS PRINCIPAIS
- Seguidores: ${metrics.followers.toLocaleString("pt-BR")}
- Taxa de Engajamento: ${metrics.engagement.toFixed(2)}%
- Alcance: ${metrics.reach.toLocaleString("pt-BR")}
- Impressões: ${metrics.impressions.toLocaleString("pt-BR")}
- Total de Posts: ${metrics.posts}

TOP 3 POSTS
${topPosts
  .map(
    (post, i) =>
      `${i + 1}. ${post.caption}
   Likes: ${post.likes} | Comentários: ${post.comments} | Engajamento: ${post.engagement}%`
  )
  .join("\n")}
    `;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(report)
    );
    element.setAttribute("download", "instagram-analytics.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              📊 Analytics Instagram em Tempo Real
            </h1>
            <p className="text-slate-600">
              Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <Button
              onClick={handleExportReport}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.followers.toLocaleString("pt-BR")}
              </div>
              <p className="text-slate-600 text-sm">Seguidores</p>
              <p className="text-green-600 text-xs mt-1">↑ +120 esta semana</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.engagement.toFixed(1)}%
              </div>
              <p className="text-slate-600 text-sm">Engajamento</p>
              <p className="text-green-600 text-xs mt-1">↑ +0.5% esta semana</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {(metrics.reach / 1000).toFixed(0)}K
              </div>
              <p className="text-slate-600 text-sm">Alcance</p>
              <p className="text-green-600 text-xs mt-1">↑ +5K esta semana</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {(metrics.impressions / 1000).toFixed(0)}K
              </div>
              <p className="text-slate-600 text-sm">Impressões</p>
              <p className="text-green-600 text-xs mt-1">↑ +20K esta semana</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {metrics.posts}
              </div>
              <p className="text-slate-600 text-sm">Posts</p>
              <p className="text-green-600 text-xs mt-1">↑ +3 esta semana</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {["overview", "growth", "content", "top-posts"].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "outline"}
              className={activeTab === tab ? "bg-blue-600" : ""}
            >
              {tab === "overview" && "📊 Visão Geral"}
              {tab === "growth" && "📈 Crescimento"}
              {tab === "content" && "🎨 Conteúdo"}
              {tab === "top-posts" && "⭐ Top Posts"}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Engajamento por Dia
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#FF6B6B" />
                  <Bar dataKey="comments" fill="#4ECDC4" />
                  <Bar dataKey="shares" fill="#45B7D1" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Tipos de Conteúdo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === "growth" && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Crescimento de Seguidores
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {activeTab === "content" && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Distribuição de Conteúdo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contentTypeData.map((item) => (
                <div
                  key={item.name}
                  className="p-4 rounded-lg border-2"
                  style={{ borderColor: item.color, backgroundColor: item.color + "10" }}
                >
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                  <p className="text-slate-600 text-sm">{item.name}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "top-posts" && (
          <div className="space-y-4">
            {topPosts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-900">
                    {post.caption}
                  </h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {post.engagement}% engajamento
                  </span>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="font-semibold">
                      {post.likes.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">
                      {post.comments.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Compartilhado</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
