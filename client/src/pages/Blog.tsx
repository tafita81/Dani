import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { useState } from "react";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");

  const articles = [
    {
      id: 1,
      title: "Psicologia da Produtividade: Como Evitar o Burnout",
      excerpt: "Explore as técnicas de psicologia cognitiva que ajudam a otimizar o foco e prevenir o esgotamento profissional.",
      author: "Daniela Coelho",
      date: "15 de Dezembro, 2025",
      category: "Psicologia",
      readTime: "8 min",
      image: "🧠",
      content: `A produtividade não é sobre trabalhar mais, mas sim sobre gerenciar sua energia de forma inteligente. Neste artigo, exploramos três técnicas fundamentais de psicologia cognitiva que podem transformar sua abordagem ao trabalho.

## 1. Técnica Pomodoro com Mindfulness

A técnica Pomodoro tradicional (25 minutos de trabalho + 5 minutos de pausa) é eficaz, mas quando combinada com mindfulness, torna-se ainda mais poderosa. Durante as pausas, em vez de verificar redes sociais, pratique respiração profunda ou meditação breve.

## 2. Gestão de Energia vs. Gestão de Tempo

Muitos profissionais focam em gerenciar o tempo, mas o que realmente importa é gerenciar a energia. Identifique seus picos de energia durante o dia e aloque as tarefas mais importantes para esses períodos.

## 3. Prevenção do Burnout

O burnout não acontece da noite para o dia. É um processo gradual que pode ser prevenido através de:
- Estabelecimento de limites claros entre trabalho e vida pessoal
- Prática regular de autocuidado
- Busca de apoio profissional quando necessário`,
    },
    {
      id: 2,
      title: "Automação Ética em Redes Sociais: O Futuro do Marketing",
      excerpt: "Descubra como usar automação de forma ética e responsável para escalar sua presença digital sem comprometer a autenticidade.",
      author: "Roberto Silva",
      date: "12 de Dezembro, 2025",
      category: "Automação",
      readTime: "10 min",
      image: "⚙️",
      content: `A automação em redes sociais é frequentemente vista com ceticismo, mas quando implementada corretamente, pode ser uma ferramenta poderosa para profissionais que desejam escalar seus negócios mantendo a autenticidade.

## Os Princípios da Automação Ética

1. **Transparência**: Sempre deixe claro que você está usando automação
2. **Qualidade**: Não comprometa a qualidade do conteúdo pela quantidade
3. **Engajamento Real**: Use automação para libertar tempo para interações genuínas
4. **Respeito**: Nunca spam ou manipule seus seguidores

## Ferramentas Recomendadas

- n8n: Automação de workflows complexos
- Buffer/Later: Agendamento de posts
- Zapier: Integração entre plataformas

## Casos de Sucesso

Profissionais que implementaram automação ética viram resultados impressionantes:
- Aumento de 300% em engajamento
- Redução de 70% em tempo administrativo
- Crescimento de 500% em leads qualificados`,
    },
    {
      id: 3,
      title: "Nichos Lucrativos para Psicólogos em 2025",
      excerpt: "Identifique os nichos mais promissores e rentáveis para psicólogos que desejam monetizar sua expertise.",
      author: "Marina Santos",
      date: "10 de Dezembro, 2025",
      category: "Estratégia",
      readTime: "12 min",
      image: "💰",
      content: `O mercado de psicologia está em transformação. Profissionais que conseguem identificar e servir nichos específicos conseguem cobrar prêmios significativamente maiores.

## Os Nichos Mais Lucrativos

### 1. Psicologia Corporativa (R$ 200-500/hora)
Executivos e empresas pagam bem por profissionais que entendem dinâmica organizacional, liderança e gestão de crises.

### 2. Coaching Executivo (R$ 300-1000/hora)
Combinando psicologia com desenvolvimento profissional, esse nicho atrai clientes de alto valor.

### 3. Psicologia Jurídica (R$ 150-400/hora)
Perícias, avaliações e consultoria para processos judiciais são serviços bem remunerados.

### 4. Psicoeducação Digital (R$ 50-200/curso)
Cursos online sobre saúde mental, relacionamentos e desenvolvimento pessoal têm demanda crescente.

## Estratégia de Posicionamento

Para ter sucesso em um nicho:
1. Desenvolva expertise real
2. Crie conteúdo educativo
3. Construa comunidade
4. Ofereça produtos digitais
5. Escale com automação`,
    },
    {
      id: 4,
      title: "Como Construir Autoridade Antes do CRP",
      excerpt: "Um guia prático para psicólogos em formação que desejam construir presença e monetizar eticamente antes de obter o registro profissional.",
      author: "Daniela Coelho",
      date: "8 de Dezembro, 2025",
      category: "Psicologia",
      readTime: "15 min",
      image: "🎓",
      content: `Muitos psicólogos em formação sentem-se presos, esperando pelo CRP para começar a construir sua carreira. Mas há muito que pode ser feito antes disso.

## O Que Você PODE Fazer Antes do CRP

### Educação e Psicoeducação
- Criar conteúdo educativo sobre saúde mental
- Oferecer workshops e webinars
- Vender e-books e cursos online
- Escrever artigos e publicações

### Coaching Acadêmico
- Orientação para estudantes de psicologia
- Preparação para provas e exames
- Desenvolvimento de habilidades de estudo
- Mentoria profissional

### Consultoria Organizacional
- Análise de dinâmica de grupos
- Consultoria em recursos humanos
- Treinamento de equipes
- Desenvolvimento organizacional

## O Que NÃO Pode Fazer

- Clínica (atendimento terapêutico individual)
- Diagnóstico clínico
- Prescrição de tratamentos
- Avaliação psicológica formal

## Estratégia Recomendada

1. Construa autoridade através de conteúdo educativo
2. Monetize com produtos digitais e cursos
3. Ofereça coaching e consultoria
4. Quando obter o CRP, você já terá audiência e receita estabelecidas`,
    },
    {
      id: 5,
      title: "Inteligência Artificial e Psicologia: O Futuro da Saúde Mental",
      excerpt: "Explore como IA está transformando o campo da psicologia e as oportunidades para profissionais que se adaptarem.",
      author: "Roberto Silva",
      date: "5 de Dezembro, 2025",
      category: "Tecnologia",
      readTime: "11 min",
      image: "🤖",
      content: `A inteligência artificial não vai substituir psicólogos, mas psicólogos que usam IA substituirão aqueles que não usam.

## Aplicações de IA em Psicologia

### 1. Chatbots Terapêuticos
Primeiros atendimentos, triagem e suporte emocional 24/7.

### 2. Análise de Padrões
IA pode identificar padrões em comportamento que humanos podem perder.

### 3. Personalização de Tratamento
Algoritmos podem recomendar abordagens terapêuticas baseadas em histórico.

### 4. Automação Administrativa
Agendamento, lembretes, documentação automática.

## Oportunidades para Profissionais

- Especialização em IA + Psicologia
- Desenvolvimento de ferramentas psicológicas com IA
- Consultoria para empresas de tech sobre saúde mental
- Pesquisa em IA e comportamento humano`,
    },
    {
      id: 6,
      title: "Redes Sociais e Saúde Mental: Um Guia para Profissionais",
      excerpt: "Como psicólogos podem usar redes sociais de forma saudável e ética para construir presença profissional.",
      author: "Marina Santos",
      date: "2 de Dezembro, 2025",
      category: "Estratégia",
      readTime: "9 min",
      image: "📱",
      content: `Redes sociais são ferramentas poderosas, mas também podem ser prejudiciais se não usadas corretamente. Como psicólogos, temos responsabilidade adicional.

## Princípios para Profissionais

1. **Autenticidade**: Seja genuíno em sua comunicação
2. **Responsabilidade**: Cuidado com diagnósticos online
3. **Privacidade**: Respeite a privacidade de clientes e colegas
4. **Educação**: Use plataformas para educar, não para vender
5. **Limite**: Mantenha limite entre pessoal e profissional

## Conteúdo que Funciona

- Dicas de saúde mental
- Desmentindo mitos sobre psicologia
- Histórias inspiradoras (anônimas)
- Educação sobre condições mentais
- Reflexões sobre comportamento humano

## Evite

- Diagnósticos de seguidores
- Conteúdo sensacionalista
- Exposição de clientes (mesmo anônima)
- Promessas de cura
- Comparações com outras profissões`,
    },
  ];

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-lg">📚</span>
            </div>
            <span className="text-xl font-bold text-primary">Blog</span>
          </a>
          <a href="/" className="text-foreground hover:text-primary transition">
            ← Voltar
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-accent/5">
        <div className="container">
          <h1 className="text-4xl font-bold text-primary mb-4">Blog de Estratégia e Psicologia</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Artigos, insights e estratégias para psicólogos que desejam construir autoridade, monetizar e escalar sua presença digital.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container">
          {selectedArticle ? (
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-accent hover:text-primary transition mb-6 flex items-center gap-2"
              >
                ← Voltar para artigos
              </button>

              <article className="bg-white rounded-xl border border-border p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-4xl">{selectedArticle.image}</span>
                  <div>
                    <h1 className="text-3xl font-bold text-primary">{selectedArticle.title}</h1>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedArticle.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {selectedArticle.date}
                      </span>
                      <span>{selectedArticle.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none mt-8">
                  {selectedArticle.content.split("\n").map((line, idx) => {
                    if (line.startsWith("##")) {
                      return (
                        <h2 key={idx} className="text-2xl font-bold text-primary mt-6 mb-3">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("###")) {
                      return (
                        <h3 key={idx} className="text-xl font-bold text-primary mt-4 mb-2">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("-")) {
                      return (
                        <li key={idx} className="text-muted-foreground ml-4">
                          {line.replace("- ", "")}
                        </li>
                      );
                    }
                    if (line.trim()) {
                      return (
                        <p key={idx} className="text-muted-foreground leading-relaxed mb-3">
                          {line}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </article>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden border border-border hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{article.image}</span>
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-primary mb-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {article.date}
                        </span>
                      </div>
                      <span>{article.readTime}</span>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full mt-4 text-accent hover:text-primary hover:bg-accent/10"
                    >
                      Ler Artigo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredArticles.length === 0 && !selectedArticle && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Nenhum artigo encontrado para sua busca.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
