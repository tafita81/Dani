import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Code2, Settings, Terminal, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Documentation() {
  const [expandedSection, setExpandedSection] = useState<string | null>("instalacao");

  const sections = [
    {
      id: "instalacao",
      title: "Instalação no Replit",
      icon: Terminal,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Passo 1: Criar um novo Replit</h4>
            <p className="text-muted-foreground mb-3">
              Acesse <a href="https://replit.com" className="text-accent hover:underline">replit.com</a> e crie um novo projeto Python.
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <p className="text-muted-foreground">Selecione: Python (ou Python + Flask)</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Passo 2: Fazer upload dos arquivos</h4>
            <p className="text-muted-foreground mb-3">
              Faça upload dos seguintes arquivos para o seu repositório Replit:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li><code className="bg-muted px-2 py-1 rounded">automacao_social.py</code></li>
              <li><code className="bg-muted px-2 py-1 rounded">main.py</code></li>
              <li><code className="bg-muted px-2 py-1 rounded">requirements.txt</code></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Passo 3: Criar a estrutura de pastas</h4>
            <p className="text-muted-foreground mb-3">
              No terminal do Replit, execute:
            </p>
            <div className="bg-primary/10 p-4 rounded-lg font-mono text-sm border border-primary/20">
              <p className="text-foreground">$ mkdir -p conteudos/exemplo_post</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Passo 4: Instalar dependências</h4>
            <p className="text-muted-foreground mb-3">
              Execute no terminal:
            </p>
            <div className="bg-primary/10 p-4 rounded-lg font-mono text-sm border border-primary/20">
              <p className="text-foreground">$ pip install -r requirements.txt</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "configuracao",
      title: "Configuração de Variáveis de Ambiente",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Importante</p>
              <p className="text-sm text-amber-800">
                Você precisa de credenciais reais das APIs das redes sociais para que o sistema funcione. As variáveis de ambiente devem ser configuradas no painel "Secrets" do Replit.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Variáveis Obrigatórias</h4>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <p className="font-mono text-sm text-accent mb-2">INSTAGRAM_ACCESS_TOKEN</p>
                <p className="text-sm text-muted-foreground mb-2">Token de acesso do Instagram via Facebook Graph API</p>
                <p className="text-xs text-muted-foreground">Obtenha em: <a href="https://developers.facebook.com" className="text-accent hover:underline">developers.facebook.com</a></p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="font-mono text-sm text-accent mb-2">INSTAGRAM_BUSINESS_ID</p>
                <p className="text-sm text-muted-foreground mb-2">ID do usuário de negócios do Instagram</p>
                <p className="text-xs text-muted-foreground">Encontre no Facebook Business Manager</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="font-mono text-sm text-accent mb-2">FACEBOOK_PAGE_ID</p>
                <p className="text-sm text-muted-foreground mb-2">ID da página do Facebook</p>
                <p className="text-xs text-muted-foreground">Disponível nas configurações da página</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="font-mono text-sm text-accent mb-2">FACEBOOK_ACCESS_TOKEN</p>
                <p className="text-sm text-muted-foreground mb-2">Token de acesso do Facebook</p>
                <p className="text-xs text-muted-foreground">Gerado no Facebook Developers</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="font-mono text-sm text-accent mb-2">LINKEDIN_ACCESS_TOKEN</p>
                <p className="text-sm text-muted-foreground mb-2">Token OAuth 2.0 do LinkedIn</p>
                <p className="text-xs text-muted-foreground">Obtenha em: <a href="https://www.linkedin.com/developers" className="text-accent hover:underline">linkedin.com/developers</a></p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="font-mono text-sm text-accent mb-2">LINKEDIN_AUTHOR_URN</p>
                <p className="text-sm text-muted-foreground mb-2">URN do autor (pessoa ou organização)</p>
                <p className="text-xs text-muted-foreground">Exemplo: <code className="bg-muted px-1 rounded">urn:li:person:12345</code></p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <p className="font-mono text-sm text-accent mb-2">SCHEDULE_CONFIG</p>
                <p className="text-sm text-muted-foreground mb-2">JSON com agendamento CRON para cada plataforma</p>
                <div className="bg-muted p-3 rounded mt-2 font-mono text-xs">
                  <p className="text-foreground">{"{"}</p>
                  <p className="text-foreground ml-4">"instagram": "0 8 * * *",</p>
                  <p className="text-foreground ml-4">"facebook": "30 8 * * *",</p>
                  <p className="text-foreground ml-4">"linkedin": "0 9 * * 1-5"</p>
                  <p className="text-foreground">{"}"}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Variáveis Opcionais</h4>
            <div className="border border-border rounded-lg p-4">
              <p className="font-mono text-sm text-accent mb-2">SLACK_WEBHOOK_URL</p>
              <p className="text-sm text-muted-foreground">Webhook do Slack para receber notificações de erros e logs</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "execucao",
      title: "Executar o Sistema",
      icon: Code2,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Passo 1: Preparar o conteúdo</h4>
            <p className="text-muted-foreground mb-3">
              Crie subpastas dentro de <code className="bg-muted px-2 py-1 rounded">conteudos/</code> com a seguinte estrutura:
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <p className="text-foreground">conteudos/</p>
              <p className="text-foreground ml-4">├── post_1/</p>
              <p className="text-foreground ml-8">│   ├── media.png (ou .jpg ou .mp4)</p>
              <p className="text-foreground ml-8">│   └── metadata.json</p>
              <p className="text-foreground ml-4">├── post_2/</p>
              <p className="text-foreground ml-8">│   ├── media.png</p>
              <p className="text-foreground ml-8">│   └── metadata.json</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Passo 2: Estrutura do metadata.json</h4>
            <p className="text-muted-foreground mb-3">
              Cada pasta deve conter um arquivo <code className="bg-muted px-2 py-1 rounded">metadata.json</code> com:
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <p className="text-foreground">{"{"}</p>
              <p className="text-foreground ml-4">"title": "Título do Post",</p>
              <p className="text-foreground ml-4">"caption": "Legenda com hashtags",</p>
              <p className="text-foreground ml-4">"description": "Descrição detalhada",</p>
              <p className="text-foreground ml-4">"link": "https://seu-link.com"</p>
              <p className="text-foreground">{"}"}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Passo 3: Executar o agendador</h4>
            <p className="text-muted-foreground mb-3">
              No terminal do Replit, execute:
            </p>
            <div className="bg-primary/10 p-4 rounded-lg font-mono text-sm border border-primary/20">
              <p className="text-foreground">$ python main.py</p>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              O agendador será iniciado e fará postagens conforme a programação definida no <code className="bg-muted px-2 py-1 rounded">SCHEDULE_CONFIG</code>.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 mb-1">Sucesso!</p>
              <p className="text-sm text-green-800">
                Se tudo estiver configurado corretamente, você verá logs indicando que o agendador foi iniciado e as postagens serão feitas automaticamente.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting e Erros Comuns",
      icon: AlertCircle,
      content: (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">❌ Erro: "Defina INSTAGRAM_ACCESS_TOKEN nas variáveis de ambiente"</h4>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Causa:</strong> A variável de ambiente não foi configurada no painel de Secrets do Replit.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Solução:</strong> Acesse o painel "Secrets" do Replit (ícone de chave), adicione a variável com o nome exato e o valor do token.
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">❌ Erro: "SCHEDULE_CONFIG inválido"</h4>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Causa:</strong> O JSON da variável <code className="bg-muted px-2 py-1 rounded">SCHEDULE_CONFIG</code> está malformado.
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Solução:</strong> Verifique se o JSON é válido. Use aspas duplas e não deixe vírgulas extras. Exemplo correto:
            </p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              <p className="text-foreground">{"{"}"instagram": "0 8 * * *", "facebook": "30 8 * * *"{"}"}</p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">❌ Erro: "Nenhum conteúdo encontrado"</h4>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Causa:</strong> A pasta <code className="bg-muted px-2 py-1 rounded">conteudos/</code> está vazia ou não tem a estrutura correta.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Solução:</strong> Crie subpastas com <code className="bg-muted px-2 py-1 rounded">metadata.json</code> e arquivos de mídia (media.png, media.jpg, ou video.mp4).
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">❌ Erro: "Falha ao criar mídia no Instagram"</h4>
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Causa:</strong> O token de acesso expirou ou não tem permissões suficientes.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Solução:</strong> Gere um novo token no Facebook Developers com as permissões <code className="bg-muted px-2 py-1 rounded">instagram_business_basic</code> e <code className="bg-muted px-2 py-1 rounded">instagram_business_content_publish</code>.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Documentação</span>
          </a>
          <a href="/" className="text-foreground hover:text-primary transition">
            ← Voltar
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container py-12 flex-1">
        <div className="max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">Guia de Instalação e Configuração</h1>
            <p className="text-lg text-muted-foreground">
              Siga os passos abaixo para instalar e configurar o sistema de automação de redes sociais no Replit ou em seu ambiente Python local.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;

              return (
                <Card
                  key={section.id}
                  className="border border-border overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                >
                  <div className="p-6 flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="flex items-center gap-4">
                      <Icon className="w-6 h-6 text-accent flex-shrink-0" />
                      <h2 className="text-xl font-bold text-primary">{section.title}</h2>
                    </div>
                    <div className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && <div className="p-6 border-t border-border bg-white">{section.content}</div>}
                </Card>
              );
            })}
          </div>

          <div className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-4">Precisa de Ajuda?</h3>
            <p className="text-muted-foreground mb-6">
              Se encontrar problemas não listados aqui, verifique os logs no terminal do Replit ou entre em contato através do formulário de contato.
            </p>
            <a href="/contato">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Enviar uma Mensagem
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
