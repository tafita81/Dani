import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Instagram, TrendingUp, Zap, Calendar, BarChart3, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function InstagramManager() {
  const [activeTab, setActiveTab] = useState("posts");
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video" | "carousel" | "reel" | "story">("image");
  const [contentType, setContentType] = useState<"educational" | "testimonial" | "promotional" | "behind_the_scenes" | "interactive" | "motivational">("educational");
  const [hashtags, setHashtags] = useState("");
  const [theme, setTheme] = useState("");

  const createPost = trpc.instagram.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post criado com sucesso!");
      setCaption("");
      setContent("");
      setMediaUrls([]);
      setHashtags("");
    },
    onError: (error) => toast.error(`Erro: ${error.message}`),
  });

  const syncAnalytics = trpc.instagram.analytics.sync.useMutation({
    onSuccess: () => toast.success("Analytics sincronizados!"),
    onError: (error) => toast.error(`Erro: ${error.message}`),
  });

  const getGrowthStrategy = trpc.instagram.analytics.growthStrategy.useQuery();
  const getContentIdeas = trpc.instagram.contentIdeas.useQuery({ theme }, { enabled: !!theme });
  const scheduleWeek = trpc.instagram.scheduleWeek.useMutation({
    onSuccess: () => toast.success("Posts agendados para a semana!"),
    onError: (error) => toast.error(`Erro: ${error.message}`),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2">
            <Instagram className="h-6 w-6 text-pink-500" /> Gestão Instagram
          </h1>
          <p className="text-muted-foreground mt-1">Crie, edite, otimize e automatize seu Instagram com IA</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="posts"><Zap className="h-3.5 w-3.5 mr-1.5" />Posts</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Analytics</TabsTrigger>
          <TabsTrigger value="strategy"><TrendingUp className="h-3.5 w-3.5 mr-1.5" />Estratégia</TabsTrigger>
          <TabsTrigger value="ideas"><Lightbulb className="h-3.5 w-3.5 mr-1.5" />Ideias</TabsTrigger>
          <TabsTrigger value="schedule"><Calendar className="h-3.5 w-3.5 mr-1.5" />Agenda</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Criar Novo Post</CardTitle>
              <CardDescription>Crie posts otimizados com sugestões de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Mídia</Label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                    <option value="carousel">Carrossel</option>
                    <option value="reel">Reel</option>
                    <option value="story">Story</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Conteúdo</Label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="educational">Educacional</option>
                    <option value="testimonial">Testemunho</option>
                    <option value="promotional">Promocional</option>
                    <option value="behind_the_scenes">Bastidores</option>
                    <option value="interactive">Interativo</option>
                    <option value="motivational">Motivacional</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escreva o caption do seu post..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Conteúdo Adicional</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Informações adicionais, contexto, etc."
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <Input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#psicologia #terapia #bemestar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Input
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ex: Ansiedade, TCC, Relacionamentos"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-xs text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">💡 Dica de IA</p>
                <p>Seu caption será analisado por IA para otimizar engagement, hashtags e melhor horário de publicação.</p>
              </div>

              <Button
                onClick={() => {
                  createPost.mutate({
                    caption,
                    content,
                    mediaUrls,
                    mediaType,
                    contentType,
                    hashtags,
                    theme,
                  });
                }}
                disabled={createPost.isPending || !caption}
                className="w-full"
              >
                {createPost.isPending ? "Criando..." : "Criar Post"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Analytics</CardTitle>
              <CardDescription>Sincronize e visualize seus dados de Instagram</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => syncAnalytics.mutate()}
                disabled={syncAnalytics.isPending}
                className="w-full"
              >
                {syncAnalytics.isPending ? "Sincronizando..." : "Sincronizar Analytics"}
              </Button>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Seguidores</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Engagement Médio</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Alcance Total</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Estratégia de Crescimento</CardTitle>
              <CardDescription>Recomendações de IA para crescimento do seu Instagram</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => getGrowthStrategy.refetch()}
                disabled={getGrowthStrategy.isLoading}
                className="w-full"
              >
                {getGrowthStrategy.isLoading ? "Gerando..." : "Gerar Estratégia"}
              </Button>

              {getGrowthStrategy.data && (
                <div className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap">
                  {typeof getGrowthStrategy.data === 'string' ? getGrowthStrategy.data : JSON.stringify(getGrowthStrategy.data)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ideas Tab */}
        <TabsContent value="ideas">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Gerador de Ideias</CardTitle>
              <CardDescription>Gere ideias de conteúdo com IA baseadas em um tema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Ansiedade, Relacionamentos, Produtividade"
                />
              </div>

              {getContentIdeas.data && (
                <div className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {typeof getContentIdeas.data === 'string' ? getContentIdeas.data : JSON.stringify(getContentIdeas.data)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Agendamento Automático</CardTitle>
              <CardDescription>Agende posts para toda a semana automaticamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => scheduleWeek.mutate()}
                disabled={scheduleWeek.isPending}
                className="w-full"
              >
                {scheduleWeek.isPending ? "Agendando..." : "Agendar Posts da Semana"}
              </Button>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-xs text-green-900 dark:text-green-100">
                <p className="font-medium">✅ Automação Ativa</p>
                <p className="mt-1">Posts serão publicados nos melhores horários automaticamente.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
