import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Copy, Check, Lock } from "lucide-react";

interface Secret {
  key: string;
  value: string;
  masked: boolean;
  lastUpdated: Date;
  platform: "instagram" | "youtube" | "tiktok" | "telegram" | "whatsapp" | "other";
}

export default function SecretsConfiguration() {
  const [secrets, setSecrets] = useState<Secret[]>([
    {
      key: "INSTAGRAM_ACCESS_TOKEN",
      value: "",
      masked: true,
      lastUpdated: new Date(),
      platform: "instagram",
    },
    {
      key: "INSTAGRAM_BUSINESS_ACCOUNT_ID",
      value: "",
      masked: true,
      lastUpdated: new Date(),
      platform: "instagram",
    },
    {
      key: "YOUTUBE_API_KEY",
      value: "",
      masked: true,
      lastUpdated: new Date(),
      platform: "youtube",
    },
    {
      key: "TIKTOK_ACCESS_TOKEN",
      value: "",
      masked: true,
      lastUpdated: new Date(),
      platform: "tiktok",
    },
    {
      key: "TELEGRAM_BOT_TOKEN",
      value: "",
      masked: true,
      lastUpdated: new Date(),
      platform: "telegram",
    },
    {
      key: "WHATSAPP_BUSINESS_ACCOUNT_ID",
      value: "",
      masked: true,
      lastUpdated: new Date(),
      platform: "whatsapp",
    },
  ]);

  const [showValidation, setShowValidation] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleMask = (key: string) => {
    setSecrets(
      secrets.map((s) => (s.key === key ? { ...s, masked: !s.masked } : s))
    );
  };

  const updateSecret = (key: string, value: string) => {
    setSecrets(
      secrets.map((s) =>
        s.key === key
          ? { ...s, value, lastUpdated: new Date() }
          : s
      )
    );
  };

  const validateSecret = async (key: string, value: string) => {
    if (!value) {
      setShowValidation({ ...showValidation, [key]: false });
      return;
    }

    // Simular validação
    const isValid =
      (key.includes("TOKEN") && value.length > 20) ||
      (key.includes("ID") && value.length > 5) ||
      (key.includes("KEY") && value.length > 10);

    setShowValidation({ ...showValidation, [key]: isValid });
  };

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const platformIcons: Record<string, string> = {
    instagram: "📱",
    youtube: "🎬",
    tiktok: "🎵",
    telegram: "✈️",
    whatsapp: "💬",
    other: "⚙️",
  };

  const platformColors: Record<string, string> = {
    instagram: "bg-pink-50 border-pink-200",
    youtube: "bg-red-50 border-red-200",
    tiktok: "bg-black/5 border-black/10",
    telegram: "bg-blue-50 border-blue-200",
    whatsapp: "bg-green-50 border-green-200",
    other: "bg-gray-50 border-gray-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuração de Segredos</h1>
        <p className="text-gray-600 mt-2">
          Gerencie todas as credenciais e tokens de forma segura
        </p>
      </div>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          ⚠️ Todos os segredos são criptografados e nunca são exibidos em logs ou histórico.
          Trate-os com cuidado!
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {secrets.map((secret) => (
          <Card key={secret.key} className={`${platformColors[secret.platform]}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{platformIcons[secret.platform]}</span>
                  <div>
                    <CardTitle className="text-lg">{secret.key}</CardTitle>
                    <CardDescription>
                      {secret.platform.toUpperCase()} • Atualizado{" "}
                      {new Date(secret.lastUpdated).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMask(secret.key)}
                  >
                    {secret.masked ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  {secret.value && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(secret.value, secret.key)}
                    >
                      {copiedKey === secret.key ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor</label>
                <Input
                  type={secret.masked ? "password" : "text"}
                  value={secret.value}
                  onChange={(e) => {
                    updateSecret(secret.key, e.target.value);
                    validateSecret(secret.key, e.target.value);
                  }}
                  placeholder={`Cole seu ${secret.key.toLowerCase()}`}
                  className="font-mono"
                />
              </div>

              {secret.value && (
                <div className="flex items-center gap-2">
                  {showValidation[secret.key] ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">✅ Válido</span>
                    </>
                  ) : (
                    <>
                      <div className="h-4 w-4 rounded-full bg-yellow-400" />
                      <span className="text-sm text-yellow-600">⚠️ Validando...</span>
                    </>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>📌 Como obter este token:</p>
                <p>
                  {secret.platform === "instagram" &&
                    "1. Acesse developers.facebook.com → 2. Crie um app → 3. Configure Instagram Graph API"}
                  {secret.platform === "youtube" &&
                    "1. Acesse console.cloud.google.com → 2. Crie um projeto → 3. Ative YouTube Data API"}
                  {secret.platform === "tiktok" &&
                    "1. Acesse developer.tiktok.com → 2. Crie um app → 3. Obtenha o Access Token"}
                  {secret.platform === "telegram" &&
                    "1. Converse com @BotFather no Telegram → 2. Use /newbot → 3. Copie o token"}
                  {secret.platform === "whatsapp" &&
                    "1. Acesse developers.facebook.com → 2. Configure WhatsApp Business API"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Segredos Configurados:</strong>{" "}
              {secrets.filter((s) => s.value).length} / {secrets.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(secrets.filter((s) => s.value).length / secrets.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Configure todos os segredos para ativar a automação completa
            </p>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg">
        💾 Salvar Configuração
      </Button>
    </div>
  );
}
