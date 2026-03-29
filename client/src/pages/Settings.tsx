import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Calendar, MessageSquare, Send, Instagram, User, Globe, ExternalLink, Mail } from "lucide-react";

export default function Settings() {
  const { data: integrations, refetch: refetchIntegrations } = trpc.integrations.getAll.useQuery();
  const { data: profile, refetch: refetchProfile } = trpc.profile.get.useQuery();
  const saveSetting = trpc.integrations.save.useMutation({ onSuccess: () => { refetchIntegrations(); toast.success("Configuração salva!"); } });
  const saveProfile = trpc.profile.save.useMutation({ onSuccess: () => { refetchProfile(); toast.success("Perfil atualizado!"); } });

  // Google Calendar
  const [gcalClientId, setGcalClientId] = useState("");
  const [gcalClientSecret, setGcalClientSecret] = useState("");
  const [gcalEmail, setGcalEmail] = useState("");
  // Outlook Calendar
  const [outlookAccessToken, setOutlookAccessToken] = useState("");
  const [outlookRefreshToken, setOutlookRefreshToken] = useState("");
  // WhatsApp
  const [waToken, setWaToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waVerifyToken, setWaVerifyToken] = useState("");
  // Telegram
  const [tgBotToken, setTgBotToken] = useState("");
  // Instagram
  const [igToken, setIgToken] = useState("");
  const [igPageId, setIgPageId] = useState("");
  // Profile
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [crp, setCrp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setCrp(profile.crp || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
      setInstagramHandle(profile.instagramHandle || "");
      setWhatsappNumber(profile.whatsappNumber || "");
      setTagline(profile.tagline || "");
    }
  }, [profile]);

  useEffect(() => {
    if (integrations) {
      const gcal = integrations.find((i: any) => i.provider === "google_calendar");
      if (gcal?.config) {
        const c = gcal.config as any;
        setGcalClientId(c.clientId || "");
        setGcalClientSecret(c.clientSecret || "");
        setGcalEmail(c.calendarEmail || "");
      }
      const ocal = integrations.find((i: any) => i.provider === "outlook_calendar");
      if (ocal?.config) {
        const c = ocal.config as any;
        setOutlookAccessToken(c.accessToken || "");
        setOutlookRefreshToken(c.refreshToken || "");
      }
      const wa = integrations.find((i: any) => i.provider === "whatsapp");
      if (wa?.config) {
        const c = wa.config as any;
        setWaToken(c.accessToken || "");
        setWaPhoneId(c.phoneNumberId || "");
        setWaVerifyToken(c.verifyToken || "");
      }
      const tg = integrations.find((i: any) => i.provider === "telegram");
      if (tg?.config) {
        const c = tg.config as any;
        setTgBotToken(c.botToken || "");
      }
      const ig = integrations.find((i: any) => i.provider === "instagram");
      if (ig?.config) {
        const c = ig.config as any;
        setIgToken(c.accessToken || "");
        setIgPageId(c.pageId || "");
      }
    }
  }, [integrations]);

  const gcalActive = integrations?.find((i: any) => i.provider === "google_calendar")?.isActive || false;
  const ocalActive = integrations?.find((i: any) => i.provider === "outlook_calendar")?.isActive || false;
  const waActive = integrations?.find((i: any) => i.provider === "whatsapp")?.isActive || false;
  const tgActive = integrations?.find((i: any) => i.provider === "telegram")?.isActive || false;
  const igActive = integrations?.find((i: any) => i.provider === "instagram")?.isActive || false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" /> Configurações
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie integrações, perfil profissional e preferências</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="profile"><User className="h-3.5 w-3.5 mr-1.5" />Perfil</TabsTrigger>
          <TabsTrigger value="gcal"><Calendar className="h-3.5 w-3.5 mr-1.5" />Google</TabsTrigger>
          <TabsTrigger value="ocal"><Mail className="h-3.5 w-3.5 mr-1.5" />Outlook</TabsTrigger>
          <TabsTrigger value="whatsapp"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />WhatsApp</TabsTrigger>
          <TabsTrigger value="telegram"><Send className="h-3.5 w-3.5 mr-1.5" />Telegram</TabsTrigger>
          <TabsTrigger value="instagram"><Instagram className="h-3.5 w-3.5 mr-1.5" />Instagram</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Perfil Profissional</CardTitle>
              <CardDescription>Informações exibidas na landing page pública e no agendamento online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome de Exibição</Label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Psi. Daniela Coelho" />
                </div>
                <div className="space-y-2">
                  <Label>Título Profissional</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Psicóloga Clínica" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CRP</Label>
                  <Input value={crp} onChange={e => setCrp(e.target.value)} placeholder="CRP XX/XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Cuidando da sua saúde mental" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio / Sobre</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Conte sobre sua formação e abordagem..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail Profissional</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@exemplo.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instagram @</Label>
                  <Input value={instagramHandle} onChange={e => setInstagramHandle(e.target.value)} placeholder="@psidanielacoelho" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+55 XX XXXXX-XXXX" />
                </div>
              </div>
              <Button onClick={() => saveProfile.mutate({ displayName, title, bio, crp, phone, email, instagramHandle, whatsappNumber, tagline })} disabled={saveProfile.isPending}>
                {saveProfile.isPending ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Calendar Tab */}
        <TabsContent value="gcal">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Google Calendar
                    {gcalActive && <Badge className="text-[10px]">Conectado</Badge>}
                  </CardTitle>
                  <CardDescription>Sincronize sua agenda do Google para consultar e inserir eventos automaticamente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail do Google Calendar</Label>
                <Input value={gcalEmail} onChange={e => setGcalEmail(e.target.value)} placeholder="seu-email@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>Client ID (Google Cloud Console)</Label>
                <Input value={gcalClientId} onChange={e => setGcalClientId(e.target.value)} placeholder="xxxx.apps.googleusercontent.com" />
              </div>
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <Input type="password" value={gcalClientSecret} onChange={e => setGcalClientSecret(e.target.value)} placeholder="GOCSPX-..." />
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => {
                  saveSetting.mutate({
                    provider: "google_calendar",
                    config: { clientId: gcalClientId, clientSecret: gcalClientSecret, calendarEmail: gcalEmail },
                    isActive: true,
                  });
                }} disabled={saveSetting.isPending}>
                  Salvar e Conectar
                </Button>
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Google Cloud Console
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outlook Calendar Tab */}
        <TabsContent value="ocal">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Outlook Calendar
                    {ocalActive && <Badge className="text-[10px]">Conectado</Badge>}
                  </CardTitle>
                  <CardDescription>Sincronize sua agenda do Outlook/Microsoft 365 para consultar e inserir eventos automaticamente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-xs text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800">
                <p className="font-medium mb-2">🔐 Autenticação OAuth2 do Microsoft</p>
                <p className="mb-2">Você será redirecionado para fazer login com sua conta Microsoft/Outlook. Nenhuma senha será armazenada.</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => {
                  const clientId = "YOUR_AZURE_APP_ID"; // Será configurado depois
                  const redirectUri = `${window.location.origin}/api/outlook-callback`;
                  const params = new URLSearchParams({
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    response_type: "code",
                    scope: "Calendars.ReadWrite offline_access",
                    response_mode: "query",
                  });
                  window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
                }}>
                  Conectar com Outlook
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Access Token (opcional - para configuração manual)</Label>
                <Input type="password" value={outlookAccessToken} onChange={e => setOutlookAccessToken(e.target.value)} placeholder="Token de acesso do Microsoft Graph" />
              </div>
              <div className="space-y-2">
                <Label>Refresh Token (opcional - para configuração manual)</Label>
                <Input type="password" value={outlookRefreshToken} onChange={e => setOutlookRefreshToken(e.target.value)} placeholder="Token de atualização" />
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => {
                  saveSetting.mutate({
                    provider: "outlook_calendar",
                    config: { accessToken: outlookAccessToken, refreshToken: outlookRefreshToken },
                    isActive: true,
                  });
                }} disabled={saveSetting.isPending || !outlookAccessToken}>
                  Salvar Configuração
                </Button>
                <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Azure Portal
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> WhatsApp Business
                {waActive && <Badge className="text-[10px]">Ativo</Badge>}
              </CardTitle>
              <CardDescription>Configure o WhatsApp Business Cloud API para automação de mensagens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input type="password" value={waToken} onChange={e => setWaToken(e.target.value)} placeholder="Token de acesso do WhatsApp Business" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number ID</Label>
                <Input value={waPhoneId} onChange={e => setWaPhoneId(e.target.value)} placeholder="ID do número de telefone" />
              </div>
              <div className="space-y-2">
                <Label>Verify Token (Webhook)</Label>
                <Input value={waVerifyToken} onChange={e => setWaVerifyToken(e.target.value)} placeholder="Token de verificação do webhook" />
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <p className="font-medium mb-1">URL do Webhook:</p>
                <code className="text-primary">{window.location.origin}/api/webhook/whatsapp</code>
              </div>
              <Button onClick={() => {
                saveSetting.mutate({
                  provider: "whatsapp",
                  config: { accessToken: waToken, phoneNumberId: waPhoneId, verifyToken: waVerifyToken },
                  isActive: true,
                });
              }} disabled={saveSetting.isPending}>
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram Tab */}
        <TabsContent value="telegram">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" /> Telegram Bot
                {tgActive && <Badge className="text-[10px]">Ativo</Badge>}
              </CardTitle>
              <CardDescription>Configure seu bot do Telegram para agendamento automatizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bot Token</Label>
                <Input type="password" value={tgBotToken} onChange={e => setTgBotToken(e.target.value)} placeholder="Token do @BotFather" />
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <p className="font-medium mb-1">URL do Webhook:</p>
                <code className="text-primary">{window.location.origin}/api/webhook/telegram</code>
              </div>
              <Button onClick={() => {
                saveSetting.mutate({
                  provider: "telegram",
                  config: { botToken: tgBotToken },
                  isActive: true,
                });
              }} disabled={saveSetting.isPending}>
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Instagram className="h-4 w-4" /> Instagram
                {igActive && <Badge className="text-[10px]">Ativo</Badge>}
              </CardTitle>
              <CardDescription>Conecte o Instagram para rastrear interações e DMs de pacientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Access Token (Graph API)</Label>
                <Input type="password" value={igToken} onChange={e => setIgToken(e.target.value)} placeholder="Token de acesso do Instagram" />
              </div>
              <div className="space-y-2">
                <Label>Page ID</Label>
                <Input value={igPageId} onChange={e => setIgPageId(e.target.value)} placeholder="ID da página do Facebook/Instagram" />
              </div>
              <Button onClick={() => {
                saveSetting.mutate({
                  provider: "instagram",
                  config: { accessToken: igToken, pageId: igPageId },
                  isActive: true,
                });
              }} disabled={saveSetting.isPending}>
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
