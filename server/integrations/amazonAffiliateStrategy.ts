/**
 * Estratégia de Monetização com Programa de Afiliados Amazon
 * Recomendações de E-books, Livros e Produtos de Psicologia
 */

export interface AmazonAffiliateProduct {
  id: string;
  title: string;
  category: string;
  author: string;
  price: number;
  commission: number;
  affiliateLink: string;
  description: string;
  psychologyTopic: string;
  recommendedFor: string[];
  engagementPotential: number; // 0-100
}

export interface AffiliateContentIdea {
  contentType: string;
  platform: string;
  topic: string;
  products: string[];
  expectedEngagement: number;
  expectedCommission: number;
  timeToCreate: string;
}

export interface AffiliateMonthlyProjection {
  month: number;
  recommendedProducts: number;
  expectedClicks: number;
  conversionRate: number;
  expectedSales: number;
  averageCommission: number;
  monthlyRevenue: number;
}

/**
 * 1. PRODUTOS RECOMENDADOS (E-BOOKS E LIVROS)
 */
export function getRecommendedAmazonProducts(): AmazonAffiliateProduct[] {
  return [
    {
      id: "1",
      title: "Terapia Cognitivo-Comportamental: Guia Prático",
      category: "E-book",
      author: "David D. Clark",
      price: 49.9,
      commission: 0.05,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description:
        "Guia prático sobre TCC com técnicas aplicáveis para ansiedade e depressão",
      psychologyTopic: "Terapia Cognitivo-Comportamental",
      recommendedFor: ["Ansiedade", "Depressão", "Relacionamentos"],
      engagementPotential: 85,
    },
    {
      id: "2",
      title: "Inteligência Emocional: Por Que Importa Mais Que QI",
      category: "Livro",
      author: "Daniel Goleman",
      price: 89.9,
      commission: 0.1,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Clássico sobre inteligência emocional e desenvolvimento pessoal",
      psychologyTopic: "Inteligência Emocional",
      recommendedFor: ["Liderança", "Desenvolvimento Pessoal", "Relacionamentos"],
      engagementPotential: 90,
    },
    {
      id: "3",
      title: "Mindfulness para Iniciantes",
      category: "E-book",
      author: "Jon Kabat-Zinn",
      price: 29.9,
      commission: 0.05,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Guia prático de mindfulness com exercícios diários",
      psychologyTopic: "Mindfulness e Meditação",
      recommendedFor: ["Ansiedade", "Estresse", "Bem-estar"],
      engagementPotential: 88,
    },
    {
      id: "4",
      title: "Comunicação Não-Violenta",
      category: "Livro",
      author: "Marshall B. Rosenberg",
      price: 79.9,
      commission: 0.1,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Técnicas de comunicação para relacionamentos saudáveis",
      psychologyTopic: "Comunicação e Relacionamentos",
      recommendedFor: ["Relacionamentos", "Comunicação", "Conflitos"],
      engagementPotential: 87,
    },
    {
      id: "5",
      title: "Hábitos Atômicos",
      category: "Livro",
      author: "James Clear",
      price: 89.9,
      commission: 0.1,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Guia sobre formação de hábitos e mudança de comportamento",
      psychologyTopic: "Comportamento e Hábitos",
      recommendedFor: ["Produtividade", "Desenvolvimento Pessoal", "Mudança"],
      engagementPotential: 92,
    },
    {
      id: "6",
      title: "O Poder do Hábito",
      category: "Livro",
      author: "Charles Duhigg",
      price: 79.9,
      commission: 0.1,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Psicologia dos hábitos e como mudá-los",
      psychologyTopic: "Psicologia do Comportamento",
      recommendedFor: ["Hábitos", "Mudança", "Desenvolvimento"],
      engagementPotential: 89,
    },
    {
      id: "7",
      title: "Pense e Enriqueça",
      category: "Livro",
      author: "Napoleon Hill",
      price: 59.9,
      commission: 0.1,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Clássico sobre mentalidade de sucesso e riqueza",
      psychologyTopic: "Mentalidade e Sucesso",
      recommendedFor: ["Empreendedorismo", "Sucesso", "Mentalidade"],
      engagementPotential: 84,
    },
    {
      id: "8",
      title: "Mulheres que Correm com Lobos",
      category: "Livro",
      author: "Clarissa Pinkola Estés",
      price: 99.9,
      commission: 0.1,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Psicologia feminina e empoderamento",
      psychologyTopic: "Psicologia Feminina",
      recommendedFor: ["Mulheres", "Empoderamento", "Autoestima"],
      engagementPotential: 86,
    },
    {
      id: "9",
      title: "Terapia do Esquema: Guia Prático",
      category: "E-book",
      author: "Jeffrey Young",
      price: 49.9,
      commission: 0.05,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Guia sobre terapia do esquema e padrões emocionais",
      psychologyTopic: "Terapia do Esquema",
      recommendedFor: ["Padrões Emocionais", "Relacionamentos", "Autoconhecimento"],
      engagementPotential: 82,
    },
    {
      id: "10",
      title: "Gestalt-Terapia: Aqui e Agora",
      category: "Livro",
      author: "Fritz Perls",
      price: 69.9,
      commission: 0.1,
      affiliateLink: "https://amazon.com/dp/XXXXX?tag=SEUAFILIADO",
      description: "Princípios da gestalt-terapia e presença",
      psychologyTopic: "Gestalt-Terapia",
      recommendedFor: ["Presença", "Consciência", "Crescimento Pessoal"],
      engagementPotential: 81,
    },
  ];
}

/**
 * 2. IDEIAS DE CONTEÚDO COM AFILIADOS
 */
export function getAffiliateContentIdeas(): AffiliateContentIdea[] {
  return [
    {
      contentType: "Vídeo: Top 5 Livros sobre Ansiedade",
      platform: "YouTube",
      topic: "Ansiedade",
      products: ["1", "3", "4"],
      expectedEngagement: 0.25,
      expectedCommission: 150,
      timeToCreate: "30 minutos",
    },
    {
      contentType: "Post Instagram: Livro da Semana",
      platform: "Instagram",
      topic: "Desenvolvimento Pessoal",
      products: ["2", "5", "7"],
      expectedEngagement: 0.15,
      expectedCommission: 100,
      timeToCreate: "15 minutos",
    },
    {
      contentType: "Reel: Resumo de Livro em 60s",
      platform: "Instagram Reels",
      topic: "Hábitos",
      products: ["5", "6"],
      expectedEngagement: 0.3,
      expectedCommission: 120,
      timeToCreate: "20 minutos",
    },
    {
      contentType: "TikTok: Dica do Livro",
      platform: "TikTok",
      topic: "Psicologia",
      products: ["1", "2", "3"],
      expectedEngagement: 0.35,
      expectedCommission: 80,
      timeToCreate: "10 minutos",
    },
    {
      contentType: "Story: Recomendação Rápida",
      platform: "Instagram Stories",
      topic: "Bem-estar",
      products: ["3", "4"],
      expectedEngagement: 0.2,
      expectedCommission: 50,
      timeToCreate: "5 minutos",
    },
    {
      contentType: "Carrossel: Livros por Tema",
      platform: "Instagram",
      topic: "Relacionamentos",
      products: ["4", "8"],
      expectedEngagement: 0.22,
      expectedCommission: 110,
      timeToCreate: "25 minutos",
    },
    {
      contentType: "YouTube Shorts: Citação do Livro",
      platform: "YouTube",
      topic: "Motivação",
      products: ["7", "2"],
      expectedEngagement: 0.28,
      expectedCommission: 90,
      timeToCreate: "15 minutos",
    },
    {
      contentType: "Blog Post: Análise Completa",
      platform: "Blog",
      topic: "Terapia",
      products: ["1", "9", "10"],
      expectedEngagement: 0.18,
      expectedCommission: 200,
      timeToCreate: "90 minutos",
    },
  ];
}

/**
 * 3. PROJEÇÃO DE RECEITA (90 DIAS)
 */
export function getAffiliateMonthlyProjection(): AffiliateMonthlyProjection[] {
  return [
    {
      month: 1,
      recommendedProducts: 10,
      expectedClicks: 500,
      conversionRate: 0.05,
      expectedSales: 25,
      averageCommission: 75,
      monthlyRevenue: 1875,
    },
    {
      month: 2,
      recommendedProducts: 20,
      expectedClicks: 2000,
      conversionRate: 0.08,
      expectedSales: 160,
      averageCommission: 75,
      monthlyRevenue: 12000,
    },
    {
      month: 3,
      recommendedProducts: 30,
      expectedClicks: 5000,
      conversionRate: 0.1,
      expectedSales: 500,
      averageCommission: 75,
      monthlyRevenue: 37500,
    },
  ];
}

/**
 * 4. ESTRATÉGIA DE INTEGRAÇÃO
 */
export function getIntegrationStrategy(): {
  platform: string;
  method: string;
  placement: string;
  expectedCTR: number;
}[] {
  return [
    {
      platform: "Instagram",
      method: "Link na bio",
      placement: "Bio com Linktree",
      expectedCTR: 0.05,
    },
    {
      platform: "Instagram",
      method: "Stickers em Stories",
      placement: "Stories com link direto",
      expectedCTR: 0.12,
    },
    {
      platform: "YouTube",
      method: "Descrição do vídeo",
      placement: "Primeiras linhas da descrição",
      expectedCTR: 0.08,
    },
    {
      platform: "YouTube",
      method: "Cards e End Screens",
      placement: "Final do vídeo",
      expectedCTR: 0.06,
    },
    {
      platform: "TikTok",
      method: "Bio com link",
      placement: "Bio com Linktree",
      expectedCTR: 0.04,
    },
    {
      platform: "TikTok",
      method: "Descrição do vídeo",
      placement: "Descrição com hashtags",
      expectedCTR: 0.07,
    },
    {
      platform: "Blog/Website",
      method: "Links contextuais",
      placement: "Dentro do conteúdo",
      expectedCTR: 0.15,
    },
    {
      platform: "Email",
      method: "Newsletter",
      placement: "Recomendação semanal",
      expectedCTR: 0.1,
    },
  ];
}

/**
 * 5. CONFORMIDADE CRP
 */
export function getCRPCompliance(): {
  rule: string;
  status: string;
  description: string;
}[] {
  return [
    {
      rule: "Recomendação de livros educativos",
      status: "✅ PERMITIDO",
      description:
        "Recomendações de livros sobre psicologia e desenvolvimento pessoal são permitidas",
    },
    {
      rule: "Links de afiliado",
      status: "✅ PERMITIDO",
      description:
        "Links de afiliado são permitidos desde que seja claro que é recomendação",
    },
    {
      rule: "Disclosure de afiliado",
      status: "✅ OBRIGATÓRIO",
      description:
        "Deve deixar claro que é link de afiliado e você ganha comissão",
    },
    {
      rule: "Conteúdo educativo",
      status: "✅ PERMITIDO",
      description:
        "Conteúdo educativo sobre livros e psicologia é permitido",
    },
    {
      rule: "Diagnóstico ou tratamento",
      status: "❌ NÃO PERMITIDO",
      description: "Não pode oferecer diagnóstico ou tratamento via afiliados",
    },
    {
      rule: "Promessas de cura",
      status: "❌ NÃO PERMITIDO",
      description:
        "Não pode prometer cura através de livros ou produtos recomendados",
    },
  ];
}

/**
 * 6. TEMPLATE DE DISCLOSURE
 */
export function getDisclosureTemplates(): Record<string, string> {
  return {
    instagram:
      "📚 Recomendação de livro (link de afiliado - ganho comissão) | Este livro é educativo e não substitui atendimento profissional",
    youtube:
      "🔗 Link de afiliado na descrição - ganho comissão se você comprar | Livro recomendado para educação",
    tiktok: "📖 Link de afiliado na bio | Recomendação educativa",
    email:
      "Recomendação de livro (link de afiliado) - Ganho comissão se você comprar. Este é conteúdo educativo.",
    blog: "Nota: Este post contém links de afiliado. Ganho comissão se você comprar através desses links. Isso não afeta o preço para você.",
  };
}

/**
 * 7. RESUMO EXECUTIVO
 */
export function getAmazonAffiliateStrategy(): string {
  const products = getRecommendedAmazonProducts();
  const ideas = getAffiliateContentIdeas();
  const projection = getAffiliateMonthlyProjection();
  const compliance = getCRPCompliance();

  let summary = `# 📚 ESTRATÉGIA DE MONETIZAÇÃO COM AFILIADOS AMAZON\n\n`;

  summary += `## 🎯 OBJETIVO\n`;
  summary += `Monetizar com recomendações de livros e produtos educativos via programa de afiliados Amazon\n\n`;

  summary += `## 📊 PROJEÇÃO DE RECEITA (90 DIAS)\n`;
  summary += `| Mês | Cliques | Vendas | Receita |\n`;
  summary += `|-----|---------|--------|----------|\n`;
  for (const month of projection) {
    summary += `| ${month.month} | ${month.expectedClicks} | ${month.expectedSales} | R$ ${month.monthlyRevenue.toLocaleString()} |\n`;
  }
  summary += `\n**Total 90 dias: R$ ${projection.reduce((a, b) => a + b.monthlyRevenue, 0).toLocaleString()}**\n\n`;

  summary += `## 📚 PRODUTOS RECOMENDADOS\n`;
  summary += `${products.length} livros e e-books selecionados sobre psicologia e desenvolvimento pessoal\n\n`;

  summary += `## 💡 IDEIAS DE CONTEÚDO\n`;
  summary += `${ideas.length} ideias de conteúdo para diferentes plataformas\n\n`;

  summary += `## ✅ CONFORMIDADE CRP\n`;
  for (const rule of compliance) {
    summary += `- ${rule.status} ${rule.rule}\n`;
  }

  summary += `\n## 🔗 PRÓXIMOS PASSOS\n`;
  summary += `1. Configurar links de afiliado para cada produto\n`;
  summary += `2. Criar conteúdo com recomendações\n`;
  summary += `3. Adicionar disclosure em cada recomendação\n`;
  summary += `4. Monitorar cliques e conversões\n`;
  summary += `5. Otimizar produtos com melhor performance\n`;

  return summary;
}
