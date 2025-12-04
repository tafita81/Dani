import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Users, Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function UseCases() {
  const useCases = [
    {
      title: "Psicóloga Corporativa - Daniela",
      role: "Especialista em Saúde Mental de Executivos",
      image: "🎯",
      background: "Psicóloga em formação com 20 anos de experiência em RH corporativo",
      challenge: "Precisava construir autoridade e monetizar antes de obter o CRP, enquanto respeitava as normas éticas do CFP.",
      solution: "Utilizou o sistema para publicar conteúdo educativo sobre burnout e liderança em Instagram e LinkedIn, criou e-books de psicoeducação e ofereceu coaching acadêmico.",
      results: [
        "5.000+ seguidores em 6 meses",
        "R$ 12.000/mês em vendas de produtos digitais",
        "50+ leads qualificados por mês",
        "Autoridade estabelecida no nicho de executivos",
      ],
      metrics: [
        { label: "Crescimento de Audiência", value: "5.000+" },
        { label: "Receita Mensal (Produtos)", value: "R$ 12k" },
        { label: "Taxa de Conversão", value: "8%" },
        { label: "Tempo Economizado", value: "20h/mês" },
      ],
    },
    {
      title: "Coach de Desenvolvimento Pessoal - Roberto",
      role: "Especialista em Transição de Carreira",
      image: "🚀",
      background: "Coach certificado com foco em profissionais de tecnologia em transição de carreira",
      challenge: "Precisava escalar seu negócio sem contratar uma equipe de marketing, mantendo a qualidade do conteúdo.",
      solution: "Implementou automação para publicar conteúdo em 5 plataformas simultaneamente, criou funil de email marketing com n8n e vendeu cursos online sobre transição de carreira.",
      results: [
        "1.000+ alunos em cursos online",
        "R$ 25.000/mês em receita de cursos",
        "300+ contatos qualificados por mês",
        "Redução de 80% no tempo de marketing",
      ],
      metrics: [
        { label: "Alunos em Cursos", value: "1.000+" },
        { label: "Receita Mensal", value: "R$ 25k" },
        { label: "Tempo Economizado", value: "20h/mês" },
        { label: "Satisfação (NPS)", value: "85" },
      ],
    },
    {
      title: "Psicóloga Clínica - Marina",
      role: "Especialista em Terapia de Trauma (EMDR)",
      image: "💚",
      background: "Psicóloga clínica com especialização em trauma e EMDR buscando expandir sua prática",
      challenge: "Tinha muitos clientes interessados mas não conseguia gerenciar agendamentos e acompanhamento pós-sessão manualmente.",
      solution: "Usou o sistema para automatizar agendamento via Calendly, enviar lembretes via WhatsApp, e criar um funil de pós-atendimento com questionários de feedback.",
      results: [
        "Consultório 100% preenchido",
        "R$ 35.000/mês em honorários",
        "Redução de 90% em tempo administrativo",
        "Satisfação de clientes aumentou em 40%",
      ],
      metrics: [
        { label: "Taxa de Ocupação", value: "100%" },
        { label: "Receita Mensal", value: "R$ 35k" },
        { label: "Tempo Administrativo", value: "-90%" },
        { label: "Retenção de Clientes", value: "95%" },
      ],
    },
  ];

  const testimonials = [
    {
      name: "Daniela Coelho",
      role: "Psicóloga em Formação",
      text: "O sistema foi revolucionário para mim. Consegui construir autoridade respeitando as normas do CFP e já estou gerando receita com produtos digitais. A automação me economizou horas de trabalho manual.",
      rating: 5,
    },
    {
      name: "Roberto Silva",
      role: "Coach de Carreira",
      text: "Passei de 2 para 5 plataformas de redes sociais sem aumentar minha carga de trabalho. O ROI foi imediato - em 3 meses já tinha recuperado o investimento em cursos e ferramentas.",
      rating: 5,
    },
    {
      name: "Marina Santos",
      role: "Psicóloga Clínica",
      text: "A automação de agendamento e pós-atendimento transformou meu consultório. Agora tenho tempo para focar no que realmente importa: o atendimento de qualidade aos meus clientes.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Casos de Uso</span>
          </a>
          <a href="/" className="text-foreground hover:text-primary transition">
            ← Voltar
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="container">
          <h1 className="text-4xl font-bold text-primary mb-4">Histórias de Sucesso</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Veja como psicólogos e profissionais de saúde mental estão usando o sistema para escalar seus negócios e impactar mais vidas.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12">
        <div className="container">
          <div className="space-y-12">
            {useCases.map((useCase, index) => (
              <Card key={index} className="overflow-hidden border border-border hover:shadow-lg transition">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left Side - Content */}
                  <div className="p-8 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-4xl">{useCase.image}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{useCase.title}</h3>
                        <p className="text-sm text-accent font-semibold">{useCase.role}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">
                      <strong>Perfil:</strong> {useCase.background}
                    </p>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="font-semibold text-foreground mb-1">Desafio</p>
                        <p className="text-sm text-muted-foreground">{useCase.challenge}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Solução</p>
                        <p className="text-sm text-muted-foreground">{useCase.solution}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-2">Resultados</p>
                        <ul className="space-y-1">
                          {useCase.results.map((result, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Metrics */}
                  <div className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-l border-border">
                    <h4 className="font-bold text-foreground mb-6">Métricas de Sucesso</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {useCase.metrics.map((metric, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                          <p className="text-2xl font-bold text-accent">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-white border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">O Que Dizem Nossos Usuários</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Feedback real de profissionais que transformaram seus negócios com o sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border border-border hover:shadow-lg transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-accent">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary to-accent">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para Transformar Seu Negócio?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Comece agora com o sistema de automação de redes sociais. Todos os arquivos e documentação estão prontos para download.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold">
              Voltar para Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
