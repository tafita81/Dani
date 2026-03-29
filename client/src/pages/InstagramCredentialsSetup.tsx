import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Key, Copy, ExternalLink } from "lucide-react";

export default function InstagramCredentialsSetup() {
  const [credentials, setCredentials] = useState({
    accessToken: "",
    businessAccountId: "",
    userId: "",
  });

  const [isConfigured, setIsConfigured] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCredentials({ ...credentials, [field]: value });
  };

  const handleSaveCredentials = () => {
    if (
      credentials.accessToken &&
      credentials.businessAccountId &&
      credentials.userId
    ) {
      setIsConfigured(true);
      alert("✅ Credenciais salvas com sucesso!");
    } else {
      alert("❌ Preencha todos os campos");
    }
  };

  const handleCopyField = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
  };

  const credentialsGuide = `
# 📱 GUIA: COMO OBTER CREDENCIAIS DO INSTAGRAM

## Passo 1: Criar App no Facebook Developers
1. Acesse https://developers.facebook.com/
2. Clique em "Meus Apps" → "Criar App"
3. Escolha "Negócios" como tipo
4. Preencha os dados e crie

## Passo 2: Configurar Instagram Graph API
1. No seu app, clique em "Adicionar Produto"
2. Procure por "Instagram Graph API"
3. Clique em "Configurar"

## Passo 3: Obter Access Token
1. Vá para "Ferramentas" → "Explorador de Gráfico"
2. Selecione seu app
3. Clique em "Gerar Token de Acesso"
4. Copie o token

## Passo 4: Obter Business Account ID
1. No Explorador de Gráfico, execute:
   GET /me/instagram_business_accounts
2. Copie o "id" retornado

## Passo 5: Obter User ID
1. No Explorador de Gráfico, execute:
   GET /me
2. Copie o "id" retornado
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🔐 Configuração de Credenciais Instagram
          </h1>
          <p className="text-slate-600">
            Adicione suas credenciais para começar a postar automaticamente
          </p>
        </div>

        {/* Status */}
        <Card className={`mb-8 p-6 border-2 ${isConfigured ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}>
          <div className="flex items-center gap-4">
            {isConfigured ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    ✅ Credenciais Configuradas
                  </h3>
                  <p className="text-sm text-green-700">
                    Você pode agora postar conteúdo automaticamente no Instagram
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    ⚠️ Credenciais Não Configuradas
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Preencha os campos abaixo para conectar com Instagram
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Credentials Form */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Adicionar Credenciais
          </h2>

          <div className="space-y-6 mb-6">
            {/* Access Token */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Instagram Access Token
              </label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={credentials.accessToken}
                  onChange={(e) =>
                    handleInputChange("accessToken", e.target.value)
                  }
                  placeholder="Seu token de acesso do Instagram..."
                  className="flex-1"
                />
                <Button
                  onClick={() => handleCopyField(credentials.accessToken)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Obtido via Facebook Developers → Explorador de Gráfico
              </p>
            </div>

            {/* Business Account ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Business Account ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={credentials.businessAccountId}
                  onChange={(e) =>
                    handleInputChange("businessAccountId", e.target.value)
                  }
                  placeholder="Seu ID de conta de negócios..."
                  className="flex-1"
                />
                <Button
                  onClick={() =>
                    handleCopyField(credentials.businessAccountId)
                  }
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Obtido via GET /me/instagram_business_accounts
              </p>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                User ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={credentials.userId}
                  onChange={(e) => handleInputChange("userId", e.target.value)}
                  placeholder="Seu ID de usuário..."
                  className="flex-1"
                />
                <Button
                  onClick={() => handleCopyField(credentials.userId)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Obtido via GET /me
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSaveCredentials}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              💾 Salvar Credenciais
            </Button>
            <Button
              onClick={() => setShowGuide(!showGuide)}
              variant="outline"
              className="flex-1"
            >
              📖 {showGuide ? "Ocultar" : "Ver"} Guia
            </Button>
          </div>
        </Card>

        {/* Guide */}
        {showGuide && (
          <Card className="mb-8 p-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              📱 Como Obter Credenciais
            </h3>
            <div className="space-y-4 text-sm text-blue-900">
              <div>
                <h4 className="font-semibold mb-2">1️⃣ Criar App no Facebook Developers</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Acesse https://developers.facebook.com/</li>
                  <li>Clique em "Meus Apps" → "Criar App"</li>
                  <li>Escolha "Negócios" como tipo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2️⃣ Configurar Instagram Graph API</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>No seu app, clique em "Adicionar Produto"</li>
                  <li>Procure por "Instagram Graph API"</li>
                  <li>Clique em "Configurar"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3️⃣ Obter Tokens</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Vá para "Ferramentas" → "Explorador de Gráfico"</li>
                  <li>Execute: GET /me/instagram_business_accounts</li>
                  <li>Execute: GET /me</li>
                </ul>
              </div>
            </div>
            <Button
              onClick={() =>
                window.open("https://developers.facebook.com/", "_blank")
              }
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ir para Facebook Developers
            </Button>
          </Card>
        )}

        {/* Info */}
        <Card className="p-6 bg-slate-50 border-2 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">
            ℹ️ O que você pode fazer com essas credenciais
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✅ Postar conteúdo automaticamente no Instagram</li>
            <li>✅ Agendar posts para horários ótimos</li>
            <li>✅ Coletar dados de engajamento em tempo real</li>
            <li>✅ Capturar leads de comentários e DMs</li>
            <li>✅ Monitorar performance de posts</li>
            <li>✅ Analisar crescimento de seguidores</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
