import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Clock, Mail, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

interface NotificationPreference {
  id: string;
  type: "appointment" | "lead" | "message" | "alert";
  enabled: boolean;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  timing: {
    appointment: "24h" | "1h" | "15m";
    lead: "immediate" | "hourly" | "daily";
    message: "immediate" | "batch";
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference>({
    id: "notif_settings_1",
    type: "appointment",
    enabled: true,
    channels: {
      push: true,
      email: true,
      sms: false,
      whatsapp: true,
    },
    timing: {
      appointment: "24h",
      lead: "immediate",
      message: "immediate",
    },
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChannelToggle = (channel: keyof typeof preferences.channels) => {
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel],
      },
    });
  };

  const handleTimingChange = (type: string, value: string) => {
    setPreferences({
      ...preferences,
      timing: {
        ...preferences.timing,
        [type]: value,
      },
    });
  };

  const handleQuietHoursChange = (field: string, value: string | boolean) => {
    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
        <p className="text-muted-foreground mt-2">
          Personalize como você recebe notificações sobre consultas, leads e mensagens
        </p>
      </div>

      {/* Notificações de Consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Lembretes de Consultas
          </CardTitle>
          <CardDescription>
            Receba lembretes sobre suas consultas agendadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Ativar lembretes de consulta</Label>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, enabled: checked })
              }
            />
          </div>

          {preferences.enabled && (
            <>
              <div className="space-y-3">
                <Label>Canais de Notificação</Label>
                <div className="space-y-2">
                  {[
                    { key: "push", label: "Notificação Push", icon: Bell },
                    { key: "email", label: "Email", icon: Mail },
                    { key: "sms", label: "SMS", icon: MessageSquare },
                    { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-3">
                      <Switch
                        checked={preferences.channels[key as keyof typeof preferences.channels]}
                        onCheckedChange={() =>
                          handleChannelToggle(key as keyof typeof preferences.channels)
                        }
                      />
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <Label className="cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="appointment-timing">Quando enviar lembrete?</Label>
                <Select
                  value={preferences.timing.appointment}
                  onValueChange={(value) => handleTimingChange("appointment", value)}
                >
                  <SelectTrigger id="appointment-timing">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas antes</SelectItem>
                    <SelectItem value="1h">1 hora antes</SelectItem>
                    <SelectItem value="15m">15 minutos antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Leads Quentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alertas de Leads Quentes
          </CardTitle>
          <CardDescription>
            Receba notificações sobre leads com alta probabilidade de conversão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="lead-timing">Frequência de Alertas</Label>
            <Select
              value={preferences.timing.lead}
              onValueChange={(value) => handleTimingChange("lead", value)}
            >
              <SelectTrigger id="lead-timing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="hourly">A cada hora</SelectItem>
                <SelectItem value="daily">Diariamente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Canais para Alertas de Leads</Label>
            <div className="space-y-2">
              {[
                { key: "push", label: "Notificação Push" },
                { key: "email", label: "Email" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <Switch
                    checked={preferences.channels[key as keyof typeof preferences.channels]}
                    onCheckedChange={() =>
                      handleChannelToggle(key as keyof typeof preferences.channels)
                    }
                  />
                  <Label className="cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horas Silenciosas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horas Silenciosas
          </CardTitle>
          <CardDescription>
            Período do dia em que você não deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Ativar horas silenciosas</Label>
            <Switch
              checked={preferences.quietHours.enabled}
              onCheckedChange={(checked) =>
                handleQuietHoursChange("enabled", checked)
              }
            />
          </div>

          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Início</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">Fim</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Configurações */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Resumo das Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Lembretes de Consulta:</span>
            <span className="font-medium">
              {preferences.enabled ? `${preferences.timing.appointment} antes` : "Desativado"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Canais Ativos:</span>
            <span className="font-medium">
              {Object.values(preferences.channels).filter(Boolean).length} de 4
            </span>
          </div>
          <div className="flex justify-between">
            <span>Horas Silenciosas:</span>
            <span className="font-medium">
              {preferences.quietHours.enabled
                ? `${preferences.quietHours.start} - ${preferences.quietHours.end}`
                : "Desativado"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button onClick={handleSave} className="gap-2">
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Salvo com Sucesso!
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
        <Button variant="outline">Restaurar Padrões</Button>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Configure horas silenciosas para evitar notificações durante
          suas consultas. Você poderá revisar todas as notificações no seu painel.
        </p>
      </div>
    </div>
  );
}
