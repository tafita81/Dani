import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Download, BookOpen, Code2, Zap, Target } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">AutoSocial</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#estrategia" className="text-foreground hover:text-primary transition">
              Estratégia
            </a>
            <a href="#recursos" className="text-foreground hover:text-primary transition">
              Recursos
            </a>
            <a href="#download" className="text-foreground hover:text-primary transition">
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
                Automação de Redes Sociais com Ética e Estratégia
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Um sistema completo e plug-and-play para psicólogos e profissionais construírem autoridade, monetizarem com ética e escalarem sua presença digital em múltiplas plataformas.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Começar Agora
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  Ver Documentação
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/strategy-illustration.png"
                alt="Estratégia de Automação"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Estratégia Section */}
      <section id="estrategia" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Estratégia de Crescimento 2025-2026</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma abordagem ética e progressiva para construir autoridade antes do CRP e monetizar com produtos digitais e serviços premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 border-l-4 border-l-accent hover:shadow-lg transition">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Fase 1: Construção (até Dez/2026)</h3>
              <p className="text-muted-foreground">
                Educar, construir audiência, vender produtos digitais de psicoeducação e oferecer coaching acadêmico respeitando as normas do CFP.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-l-primary hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Fase 2: Escalação (após CRP)</h3>
              <p className="text-muted-foreground">
                Consultório premium, coaching executivo, serviços de perícia, formação continuada e publicação de livros.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-l-accent hover:shadow-lg transition">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Automação Profissional</h3>
              <p className="text-muted-foreground">
                Sistema n8n + Replit para captura de leads, email marketing, agendamento e entrega automática de produtos.
              </p>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-primary mb-4">Projeção Financeira</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-2">Receita Potencial Mensal (Fase 2)</p>
                <p className="text-4xl font-bold text-accent">R$ 64.000+</p>
              </div>
              <div className="flex items-end">
                <img src="/images/growth-chart.png" alt="Crescimento" className="w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="py-20 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">O Que Você Recebe</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-white">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Relatório Estratégico Completo</h3>
                <p className="text-muted-foreground">
                  Documento em Markdown com análise de nichos lucrativos, regras éticas do CFP, plano de monetização progressivo e projeções financeiras.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-white">
                  <Code2 className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Sistema de Automação Python</h3>
                <p className="text-muted-foreground">
                  Módulo automacao_social.py com classes para Instagram, Facebook, LinkedIn, YouTube e Pinterest, agendador APScheduler e gerador de conteúdo.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-white">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Arquivo de Inicialização</h3>
                <p className="text-muted-foreground">
                  main.py pronto para rodar no Replit, configurável via variáveis de ambiente (Secrets), com suporte a agendamento CRON e logging em Slack.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-white">
                  <Download className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Exemplo de Conteúdo</h3>
                <p className="text-muted-foreground">
                  Pasta conteudos/ com estrutura pronta, metadata.json de exemplo e imagem 4K para testar o pipeline de postagem automática.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automação Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/automation-flow.png"
                alt="Fluxo de Automação"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">Automação Profissional com n8n</h2>
              <p className="text-lg text-muted-foreground mb-6">
                O sistema integra-se com n8n para criar workflows avançados de captura de leads, email marketing, agendamento e entrega de produtos.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-accent font-bold">1.</div>
                  <div>
                    <p className="font-semibold text-foreground">Captura de Leads</p>
                    <p className="text-sm text-muted-foreground">Webhooks para formulários de contato com validação automática.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-accent font-bold">2.</div>
                  <div>
                    <p className="font-semibold text-foreground">Email Marketing</p>
                    <p className="text-sm text-muted-foreground">Sequências automáticas de nutrição com conteúdo educativo.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-accent font-bold">3.</div>
                  <div>
                    <p className="font-semibold text-foreground">Venda de Produtos</p>
                    <p className="text-sm text-muted-foreground">Integração com Stripe/Mercado Pago para checkout automático.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-accent font-bold">4.</div>
                  <div>
                    <p className="font-semibold text-foreground">Agendamento de Sessões</p>
                    <p className="text-sm text-muted-foreground">Sincronização com Calendly e lembretes via WhatsApp/Slack.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">Comece Agora</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Todos os arquivos estão prontos para download. Siga as instruções para configurar no Replit ou em seu ambiente Python local.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <a
              href="/estrategia_crescimento.md"
              download
              className="block p-6 bg-white rounded-xl border border-border hover:shadow-lg transition"
            >
              <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-bold text-primary mb-2">Relatório Estratégico</h3>
              <p className="text-sm text-muted-foreground">estrategia_crescimento.md</p>
            </a>

            <a
              href="/automacao_social.py"
              download
              className="block p-6 bg-white rounded-xl border border-border hover:shadow-lg transition"
            >
              <Code2 className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-bold text-primary mb-2">Módulo de Automação</h3>
              <p className="text-sm text-muted-foreground">automacao_social.py</p>
            </a>

            <a
              href="/main.py"
              download
              className="block p-6 bg-white rounded-xl border border-border hover:shadow-lg transition"
            >
              <Zap className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-bold text-primary mb-2">Arquivo de Inicialização</h3>
              <p className="text-sm text-muted-foreground">main.py</p>
            </a>
          </div>

          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
            Baixar Todos os Arquivos
            <Download className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Sobre</h4>
              <p className="text-sm text-primary-foreground/80">
                Sistema de automação ética para psicólogos e profissionais construírem autoridade e escalarem sua presença digital.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Recursos</h4>
              <ul className="text-sm text-primary-foreground/80 space-y-2">
                <li><a href="#estrategia" className="hover:text-white transition">Estratégia</a></li>
                <li><a href="#recursos" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#download" className="hover:text-white transition">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Documentação</h4>
              <ul className="text-sm text-primary-foreground/80 space-y-2">
                <li><a href="#" className="hover:text-white transition">Guia de Instalação</a></li>
                <li><a href="#" className="hover:text-white transition">Configuração</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <p className="text-sm text-primary-foreground/80">
                Para dúvidas ou sugestões, entre em contato através do formulário de contato.
              </p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/80">
            <p>&copy; 2025 Estratégia de Automação Social. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
