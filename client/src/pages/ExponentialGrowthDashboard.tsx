import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
} from "recharts";
import {
  TrendingUp,
  Target,
  Zap,
  Users,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GrowthProjection {
  day: number;
  followers: number;
  growth: number;
  reach: number;
  engagement: number;
}

export default function ExponentialGrowthDashboard() {
  const [period, setPeriod] = useState<"30" | "60" | "90">("90");

  // Dados de projeção de crescimento exponencial
  const generateProjection = (days: number): GrowthProjection[] => {
    const data: GrowthProjection[] = [];
    const startFollowers = 15420;
    const targetFollowers = 1000000;
    const dailyRate = Math.pow(targetFollowers / startFollowers, 1 / days) - 1;

    for (let day = 0; day <= days; day++) {
      const followers = Math.floor(startFollowers * Math.pow(1 + dailyRate, day));
      const growth = followers - startFollowers;
      const reach = followers * 30; // 30 impressões por seguidor
      const engagement = Math.floor(reach * 0.08); // 8% de engajamento

      data.push({
        day,
        followers,
        growth,
        reach,
        engagement,
      });
    }

    return data;
  };

  const projectionData = generateProjection(parseInt(period));

  // KPIs principais
  const currentFollowers = 15420;
  const targetFollowers = 1000000;
  const progressPercentage = (currentFollowers / targetFollowers) * 100;
  const daysRemaining = parseInt(period);
  const dailyGrowthNeeded = Math.floor((targetFollowers - currentFollowers) / daysRemaining);

  // Dados de performance por plataforma
  const platformData = [
    { platform: "Instagram", followers: 15420, growth: 2.5, target: 400000 },
    { platform: "TikTok", followers: 3200, growth: 8.5, target: 300000 },
    { platform: "YouTube", followers: 2100, growth: 1.8, target: 200000 },
    { platform: "Pinterest", followers: 1850, growth: 3.2, target: 100000 },
  ];

  // Dados de viral loops
  const viralLoopsData = [
    { name: "Referral Program", amplification: 3, newFollowers: 45000, cost: 5000 },
    { name: "Challenge Viral", amplification: 4.5, newFollowers: 67500, cost: 8000 },
    { name: "Share & Earn", amplification: 2.8, newFollowers: 42000, cost: 4000 },
    { name: "Community Invite", amplification: 3.5, newFollowers: 52500, cost: 6000 },
    { name: "Ranking Competition", amplification: 2.2, newFollowers: 33000, cost: 3000 },
  ];

  // Dados de influenciadores
  const influencerImpact = [
    { tier: "Mega", count: 3, followers: 50000000, expectedReach: 2000000, cost: 150000 },
    { tier: "Macro", count: 15, followers: 5000000, expectedReach: 500000, cost: 75000 },
    { tier: "Micro", count: 100, followers: 500000, expectedReach: 150000, cost: 50000 },
    { tier: "Nano", count: 500, followers: 100000, expectedReach: 50000, cost: 25000 },
  ];

  const handleExportReport = () => {
    const report = `
RELATÓRIO DE CRESCIMENTO EXPONENCIAL - 3 MESES
Data: ${new Date().toLocaleDateString("pt-BR")}

OBJETIVO: 1 MILHÃO DE SEGUIDORES

PROJEÇÃO ATUAL:
- Seguidores Atuais: ${currentFollowers.toLocaleString("pt-BR")}
- Seguidores Alvo: ${targetFollowers.toLocaleString("pt-BR")}
- Crescimento Necessário: ${dailyGrowthNeeded.toLocaleString("pt-BR")} por dia
- Período: ${daysRemaining} dias

PLATAFORMAS:
${platformData.map((p) => `- ${p.platform}: ${p.followers.toLocaleString("pt-BR")} → ${p.target.toLocaleString("pt-BR")} (${p.growth}% crescimento diário)`).join("\n")}

VIRAL LOOPS:
${viralLoopsData.map((v) => `- ${v.name}: ${v.amplification}x amplificação, ${v.newFollowers.toLocaleString("pt-BR")} novos seguidores`).join("\n")}

INFLUENCIADORES:
${influencerImpact.map((i) => `- ${i.tier}: ${i.count} influenciadores, ${i.followers.toLocaleString("pt-BR")} seguidores totais`).join("\n")}

ESTRATÉGIA:
1. Conteúdo Ultra-Viral (6 posts/dia)
2. Automação 24/7 com Respostas IA
3. Multi-Plataforma (Instagram, TikTok, YouTube, Pinterest)
4. Rede de Influenciadores
5. Viral Loops (Referral, Challenges, Compartilhamento)
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crescimento-exponencial-report.txt";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Crescimento Exponencial</h1>
          <p className="text-muted-foreground mt-2">Meta: 1 Milhão de Seguidores em 3 Meses</p>
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
              Seguidores Atuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentFollowers.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground mt-1">{progressPercentage.toFixed(2)}% da meta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Crescimento Diário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dailyGrowthNeeded.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Seguidores/dia necessários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dias Restantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{daysRemaining}</div>
            <p className="text-xs text-muted-foreground mt-1">Até atingir a meta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">ON TRACK</div>
            <p className="text-xs text-green-600 mt-1">✓ Estratégia ativa</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Visualizações */}
      <Tabs defaultValue="projection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projection">Projeção</TabsTrigger>
          <TabsTrigger value="platforms">Plataformas</TabsTrigger>
          <TabsTrigger value="loops">Viral Loops</TabsTrigger>
          <TabsTrigger value="influencers">Influenciadores</TabsTrigger>
        </TabsList>

        {/* Projeção de Crescimento */}
        <TabsContent value="projection" className="space-y-4">
          <div className="flex gap-2 mb-4">
            {(["30", "60", "90"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                onClick={() => setPeriod(p)}
              >
                {p} dias
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projeção de Crescimento Exponencial</CardTitle>
              <CardDescription>Crescimento de seguidores ao longo de {period} dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: "Dias", position: "insideBottomRight", offset: -5 }} />
                  <YAxis label={{ value: "Seguidores", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value: any) => value.toLocaleString("pt-BR")}
                    labelFormatter={(label) => `Dia ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorFollowers)"
                    name="Seguidores"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reach e Engajamento Projetado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={projectionData.filter((_, i) => i % 5 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="reach" fill="#10b981" name="Reach" />
                  <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#f59e0b" name="Engajamento" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance por Plataforma */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Plataforma</CardTitle>
              <CardDescription>Crescimento e alvo por plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => value.toLocaleString("pt-BR")} />
                  <Legend />
                  <Bar dataKey="followers" fill="#3b82f6" name="Seguidores Atuais" />
                  <Bar dataKey="target" fill="#10b981" name="Alvo" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformData.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <CardTitle className="text-lg">{platform.platform}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seguidores:</span>
                    <span className="font-bold">{platform.followers.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crescimento Diário:</span>
                    <span className="font-bold text-green-600">{platform.growth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alvo:</span>
                    <span className="font-bold">{platform.target.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(platform.followers / platform.target) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Viral Loops */}
        <TabsContent value="loops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viral Loops - Amplificação Exponencial</CardTitle>
              <CardDescription>Mecanismos de crescimento automático</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={viralLoopsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="amplification" name="Amplificação" />
                  <YAxis dataKey="newFollowers" name="Novos Seguidores" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Viral Loops" data={viralLoopsData} fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viralLoopsData.map((loop) => (
              <Card key={loop.name}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    {loop.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amplificação:</span>
                    <span className="font-bold text-purple-600">{loop.amplification}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Novos Seguidores:</span>
                    <span className="font-bold">{loop.newFollowers.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investimento:</span>
                    <span className="font-bold">R$ {loop.cost.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo/Seguidor:</span>
                    <span className="font-bold text-green-600">
                      R$ {(loop.cost / loop.newFollowers).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Influenciadores */}
        <TabsContent value="influencers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rede de Influenciadores</CardTitle>
              <CardDescription>Impacto por tier de influenciador</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={influencerImpact}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => value.toLocaleString("pt-BR")} />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Quantidade" />
                  <Bar dataKey="expectedReach" fill="#10b981" name="Reach Esperado" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {influencerImpact.map((tier) => (
              <Card key={tier.tier}>
                <CardHeader>
                  <CardTitle className="text-lg">{tier.tier}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="font-bold">{tier.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seguidores Totais:</span>
                    <span className="font-bold">{tier.followers.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reach Esperado:</span>
                    <span className="font-bold text-green-600">{tier.expectedReach.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investimento:</span>
                    <span className="font-bold">R$ {tier.cost.toLocaleString("pt-BR")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recomendações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Recomendações Estratégicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Aumentar investimento em Viral Loops (ROI 300%+)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Focar em TikTok e YouTube Shorts (crescimento 8.5% e 1.8% diários)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Expandir rede de micro e nano influenciadores (melhor custo-benefício)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Manter automação 24/7 com 6 posts/dia para máximo alcance</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
