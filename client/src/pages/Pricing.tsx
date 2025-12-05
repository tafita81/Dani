import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export default function Pricing() {
  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfeito para profissionais iniciando",
      price: "R$ 297",
      period: "único",
      icon: "🚀",
      features: [
        "Acesso ao sistema de automação completo",
        "Suporte por email",
        "Documentação completa",
        "Atualização de 1 ano",
        "Comunidade online",
      ],
      notIncluded: [
        "Suporte prioritário",
        "Consultoria personalizada",
        "Templates premium",
      ],
      cta: "Começar Agora",
      highlighted: false,
    },
    {
      name: "Professional",
      description: "Para profissionais escalando",
      price: "R$ 997",
      period: "único",
      icon: "⭐",
      features: [
        "Tudo do Starter +",
        "Suporte prioritário (chat)",
        "Templates premium de conteúdo",
        "Consultoria 1:1 (2 horas/mês)",
        "Acesso a webinars exclusivos",
        "Integração com n8n",
        "Análise de performance",
      ],
      notIncluded: [
        "Implementação completa",
        "Treinamento em grupo",
      ],
      cta: "Escolher Plano",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "Para agências e consultores",
      price: "R$ 2.997",
      period: "único",
      icon: "🏆",
      features: [
        "Tudo do Professional +",
        "Suporte 24/7 por telefone",
        "Implementação completa",
        "Consultoria 1:1 (10 horas/mês)",
        "Treinamento em grupo (até 10 pessoas)",
        "Customização do sistema",
        "Relatórios mensais detalhados",
        "Acesso a beta features",
      ],
      notIncluded: [],
      cta: "Falar com Vendas",
      highlighted: false,
    },
  ];

  const additionalServices = [
    {
      title: "Consultoria Estratégica",
      description: "Sessão de 1 hora para definir sua estratégia de crescimento",
      price: "R$ 500",
      icon: "📊",
    },
    {
      title: "Implementação Completa",
      description: "Configuração e setup completo do sistema no seu Replit",
      price: "R$ 1.500",
      icon: "⚙️",
    },
    {
      title: "Treinamento Personalizado",
      description: "Treinamento 1:1 para sua equipe (até 5 pessoas)",
      price: "R$ 2.000",
      icon: "🎓",
    },
    {
      title: "Suporte Mensal",
      description: "Suporte contínuo e otimização do sistema",
      price: "R$ 500/mês",
      icon: "🛟",
    },
  ];

  const faqs = [
    {
      question: "Qual plano devo escolher?",
      answer: "Escolha Starter se está começando, Professional se já tem audiência e quer escalar, e Enterprise se é agência ou quer implementação completa.",
    },
    {
      question: "Posso fazer upgrade depois?",
      answer: "Sim! Você pode fazer upgrade a qualquer momento. O valor pago no plano anterior será descontado.",
    },
    {
      question: "Há reembolso?",
      answer: "Oferecemos garantia de 30 dias. Se não ficar satisfeito, devolvemos 100% do seu dinheiro.",
    },
    {
      question: "Como funciona o suporte?",
      answer: "Starter: email. Professional: chat prioritário. Enterprise: telefone 24/7.",
    },
    {
      question: "Preciso de conhecimento técnico?",
      answer: "Não! O sistema é plug-and-play. Mas oferecemos treinamento para quem quiser aprender mais.",
    },
    {
      question: "Posso usar em múltiplas contas?",
      answer: "Sim! Todos os planos permitem usar em quantas contas quiser.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <span className="text-xl font-bold text-primary">Preços</span>
          </a>
          <a href="/" className="text-foreground hover:text-primary transition">
            ← Voltar
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Planos Simples e Transparentes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano perfeito para sua jornada de crescimento. Sem taxas ocultas, sem surpresas.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`overflow-hidden border transition ${
                  plan.highlighted
                    ? "border-accent shadow-2xl scale-105 md:scale-100 md:ring-2 md:ring-accent"
                    : "border-border hover:shadow-lg"
                }`}
              >
                <div className={`p-8 ${plan.highlighted ? "bg-gradient-to-br from-primary/10 to-accent/10" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-primary">{plan.name}</h3>
                    <span className="text-3xl">{plan.icon}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-accent">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full mb-8 ${
                      plan.highlighted
                        ? "bg-accent hover:bg-accent/90 text-white"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  <div className="space-y-3 mb-6">
                    <p className="font-semibold text-foreground text-sm">Inclui:</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.notIncluded.length > 0 && (
                    <div className="border-t border-border pt-6 space-y-2">
                      <p className="font-semibold text-foreground text-sm text-muted-foreground">Não inclui:</p>
                      {plan.notIncluded.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <span className="text-muted-foreground text-sm">✗ {item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Popular Badge */}
          <div className="text-center mt-8">
            <span className="text-sm font-semibold text-accent bg-accent/10 px-4 py-2 rounded-full">
              ⭐ Professional é o mais popular
            </span>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-12 bg-white border-t border-border">
        <div className="container">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">Serviços Adicionais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <Card key={index} className="p-6 border border-border hover:shadow-lg transition">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-primary mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <p className="text-lg font-bold text-accent">{service.price}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">Perguntas Frequentes</h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 border border-border">
                <h3 className="text-lg font-bold text-primary mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary to-accent">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para Começar?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Escolha seu plano agora e comece a escalar sua presença digital com automação ética e estratégia comprovada.
          </p>
          <Button size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
            Ver Planos
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 bg-white border-t border-border">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            Todos os preços em BRL. Garantia de 30 dias de satisfação. Sem taxas ocultas.
          </p>
        </div>
      </section>
    </div>
  );
}
