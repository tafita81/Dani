/**
 * Estratégia de Monetização Focada no Nicho Brasil de Alto Valor
 * Psicologia para Executivos, Empreendedores e Profissionais Liberais
 */

export interface TargetNiche {
  name: string;
  description: string;
  avgIncome: string;
  psychologyNeeds: string[];
  consultationPrice: { min: number; max: number };
  estimatedMarketSize: number;
  conversionRate: number;
  lifetimeValue: number;
}

export interface MonetizationChannel {
  name: string;
  description: string;
  monthlyRevenue: number;
  initialInvestment: number;
  roi: number;
  timeToProfit: string;
}

export interface InvestmentPlan {
  month: number;
  investment: number;
  expectedLeads: number;
  expectedConversions: number;
  expectedRevenue: number;
  cumulativeRevenue: number;
  roi: number;
}

/**
 * 1. NICHOS DE ALTO VALOR NO BRASIL
 */
export function getTargetNiches(): TargetNiche[] {
  return [
    {
      name: "Executivos e CEOs",
      description:
        "Profissionais em posições de liderança com alta renda e demanda por gestão de estresse",
      avgIncome: "R$ 15.000-50.000/mês",
      psychologyNeeds: [
        "Gestão de estresse e burnout",
        "Liderança e inteligência emocional",
        "Tomada de decisão sob pressão",
        "Relacionamentos profissionais",
      ],
      consultationPrice: { min: 800, max: 1500 },
      estimatedMarketSize: 50000,
      conversionRate: 0.15,
      lifetimeValue: 12000,
    },
    {
      name: "Empreendedores e Startupeiros",
      description:
        "Donos de negócios com desafios de crescimento, pressão e incerteza",
      avgIncome: "R$ 10.000-40.000/mês",
      psychologyNeeds: [
        "Ansiedade e incerteza",
        "Síndrome do impostor",
        "Gestão de equipe",
        "Resiliência e motivação",
      ],
      consultationPrice: { min: 600, max: 1200 },
      estimatedMarketSize: 100000,
      conversionRate: 0.12,
      lifetimeValue: 10000,
    },
    {
      name: "Profissionais Liberais (Advogados, Médicos, Engenheiros)",
      description:
        "Profissionais com demanda por excelência, perfeccionismo e equilíbrio",
      avgIncome: "R$ 8.000-30.000/mês",
      psychologyNeeds: [
        "Perfeccionismo e autoexigência",
        "Equilíbrio trabalho-vida",
        "Relacionamentos pessoais",
        "Carreira e desenvolvimento",
      ],
      consultationPrice: { min: 500, max: 1000 },
      estimatedMarketSize: 200000,
      conversionRate: 0.1,
      lifetimeValue: 8000,
    },
    {
      name: "Mulheres 25-45 anos (Renda Alta)",
      description:
        "Mulheres profissionais e independentes com foco em desenvolvimento pessoal",
      avgIncome: "R$ 5.000-25.000/mês",
      psychologyNeeds: [
        "Autoestima e confiança",
        "Relacionamentos saudáveis",
        "Carreira e ambição",
        "Maternidade e equilíbrio",
      ],
      consultationPrice: { min: 300, max: 800 },
      estimatedMarketSize: 500000,
      conversionRate: 0.08,
      lifetimeValue: 5000,
    },
    {
      name: "Casais em Crise (Renda Alta)",
      description:
        "Casais com recursos para investir em relacionamento e terapia",
      avgIncome: "R$ 10.000-40.000/mês (casal)",
      psychologyNeeds: [
        "Comunicação e conflitos",
        "Intimidade e conexão",
        "Infidelidade e confiança",
        "Planejamento familiar",
      ],
      consultationPrice: { min: 400, max: 1000 },
      estimatedMarketSize: 150000,
      conversionRate: 0.1,
      lifetimeValue: 8000,
    },
    {
      name: "Profissionais em Transição de Carreira",
      description:
        "Pessoas mudando de carreira com demanda por clareza e direção",
      avgIncome: "R$ 5.000-20.000/mês",
      psychologyNeeds: [
        "Clareza de propósito",
        "Medo e incerteza",
        "Autoconhecimento",
        "Decisão de carreira",
      ],
      consultationPrice: { min: 300, max: 700 },
      estimatedMarketSize: 100000,
      conversionRate: 0.12,
      lifetimeValue: 6000,
    },
  ];
}

/**
 * 2. CANAIS DE MONETIZAÇÃO
 */
export function getMonetizationChannels(): MonetizationChannel[] {
  return [
    {
      name: "Consultas Online Premium",
      description: "Sessões de 60 minutos com psicóloga especializada",
      monthlyRevenue: 40000,
      initialInvestment: 0,
      roi: 400,
      timeToProfit: "1-2 meses",
    },
    {
      name: "Programa de Transformação 12 Semanas",
      description: "Programa intensivo com 12 sessões + materiais + grupo",
      monthlyRevenue: 30000,
      initialInvestment: 5000,
      roi: 500,
      timeToProfit: "1 mês",
    },
    {
      name: "Grupo VIP Exclusivo",
      description: "Comunidade mensal com 50 membros a R$ 200-500/mês",
      monthlyRevenue: 15000,
      initialInvestment: 2000,
      roi: 650,
      timeToProfit: "2 semanas",
    },
    {
      name: "Masterclass e Workshops",
      description: "Eventos online com 100-500 participantes",
      monthlyRevenue: 10000,
      initialInvestment: 3000,
      roi: 233,
      timeToProfit: "1 mês",
    },
    {
      name: "Cursos Online",
      description: "Cursos autônomos sobre temas específicos",
      monthlyRevenue: 8000,
      initialInvestment: 5000,
      roi: 60,
      timeToProfit: "3 meses",
    },
    {
      name: "Coaching Executivo",
      description: "Sessões de coaching para liderança e performance",
      monthlyRevenue: 25000,
      initialInvestment: 2000,
      roi: 1150,
      timeToProfit: "1 semana",
    },
    {
      name: "Consultoria Organizacional",
      description: "Consultoria para empresas sobre saúde mental",
      monthlyRevenue: 20000,
      initialInvestment: 3000,
      roi: 567,
      timeToProfit: "2 semanas",
    },
    {
      name: "Programa de Afiliados",
      description: "Indicação de outros profissionais com comissão",
      monthlyRevenue: 5000,
      initialInvestment: 1000,
      roi: 400,
      timeToProfit: "1 mês",
    },
  ];
}

/**
 * 3. PLANO DE INVESTIMENTO 6 MESES
 */
export function getInvestmentPlan(): InvestmentPlan[] {
  return [
    {
      month: 1,
      investment: 5000,
      expectedLeads: 200,
      expectedConversions: 20,
      expectedRevenue: 15000,
      cumulativeRevenue: 15000,
      roi: 200,
    },
    {
      month: 2,
      investment: 8000,
      expectedLeads: 400,
      expectedConversions: 50,
      expectedRevenue: 35000,
      cumulativeRevenue: 50000,
      roi: 338,
    },
    {
      month: 3,
      investment: 10000,
      expectedLeads: 600,
      expectedConversions: 90,
      expectedRevenue: 65000,
      cumulativeRevenue: 115000,
      roi: 550,
    },
    {
      month: 4,
      investment: 12000,
      expectedLeads: 800,
      expectedConversions: 130,
      expectedRevenue: 95000,
      cumulativeRevenue: 210000,
      roi: 692,
    },
    {
      month: 5,
      investment: 15000,
      expectedLeads: 1000,
      expectedConversions: 170,
      expectedRevenue: 125000,
      cumulativeRevenue: 335000,
      roi: 737,
    },
    {
      month: 6,
      investment: 15000,
      expectedLeads: 1200,
      expectedConversions: 210,
      expectedRevenue: 155000,
      cumulativeRevenue: 490000,
      roi: 1167,
    },
  ];
}

/**
 * 4. ESTRATÉGIA DE PUBLICIDADE
 */
export function getAdvertisingStrategy(): {
  platform: string;
  budget: number;
  targetAudience: string;
  expectedCPC: number;
  expectedCTR: number;
  expectedConversionRate: number;
}[] {
  return [
    {
      platform: "Google Ads (Search)",
      budget: 3000,
      targetAudience: "Palavras-chave: psicólogo online, terapia, coaching",
      expectedCPC: 5,
      expectedCTR: 0.08,
      expectedConversionRate: 0.15,
    },
    {
      platform: "Instagram/Facebook Ads",
      budget: 3000,
      targetAudience:
        "Executivos, empreendedores, mulheres 25-45, renda alta, Brasil",
      expectedCPC: 2,
      expectedCTR: 0.05,
      expectedConversionRate: 0.12,
    },
    {
      platform: "LinkedIn Ads",
      budget: 2000,
      targetAudience:
        "Executivos, profissionais liberais, decisores, Brasil",
      expectedCPC: 8,
      expectedCTR: 0.06,
      expectedConversionRate: 0.18,
    },
    {
      platform: "YouTube Ads",
      budget: 1000,
      targetAudience: "Vídeos sobre psicologia, desenvolvimento pessoal",
      expectedCPC: 0.5,
      expectedCTR: 0.03,
      expectedConversionRate: 0.08,
    },
    {
      platform: "Influenciadores (Micro)",
      budget: 2000,
      targetAudience:
        "Influenciadores em psicologia, desenvolvimento, bem-estar",
      expectedCPC: 1,
      expectedCTR: 0.1,
      expectedConversionRate: 0.2,
    },
  ];
}

/**
 * 5. COPY E MESSAGING POR NICHO
 */
export function getMessagingByNiche(): Record<
  string,
  { headline: string; subheadline: string; cta: string; pain: string }
> {
  return {
    executives: {
      headline: "Liderança sem Burnout",
      subheadline:
        "Executivos que dominam a pressão e lideram com inteligência emocional",
      cta: "Agende sua sessão de diagnóstico",
      pain: "Você está no topo, mas se sente vazio. Pressão constante, insônia, relacionamentos abalados.",
    },
    entrepreneurs: {
      headline: "Do Caos à Clareza",
      subheadline:
        "Empreendedores que transformam ansiedade em ação estratégica",
      cta: "Descubra seu padrão de sabotagem",
      pain: "Seu negócio cresce, mas você não. Medo, insegurança, síndrome do impostor.",
    },
    professionals: {
      headline: "Excelência sem Sacrifício",
      subheadline:
        "Profissionais que alcançam sucesso mantendo equilíbrio pessoal",
      cta: "Comece sua transformação hoje",
      pain: "Você é bom no que faz, mas se sente preso. Perfeccionismo, medo de falhar.",
    },
    women: {
      headline: "Mulher, Ambição e Equilíbrio",
      subheadline:
        "Mulheres que conquistam carreira, relacionamentos e felicidade",
      cta: "Inicie seu programa de transformação",
      pain: "Você quer tudo, mas sente que não consegue. Culpa, esgotamento, insegurança.",
    },
    couples: {
      headline: "Reconstruir o Amor",
      subheadline:
        "Casais que transformam crise em conexão profunda e duradoura",
      cta: "Agende sua sessão de casal",
      pain: "Você se ama, mas não se entendem. Comunicação quebrada, intimidade perdida.",
    },
    transition: {
      headline: "Sua Próxima Carreira",
      subheadline:
        "Profissionais que encontram propósito e fazem transições com confiança",
      cta: "Descubra sua verdadeira vocação",
      pain: "Você quer mudar, mas tem medo. Incerteza, dúvida, falta de direção.",
    },
  };
}

/**
 * 6. FUNIL DE VENDAS OTIMIZADO
 */
export function getSalesFunnel(): {
  stage: string;
  objective: string;
  tactic: string;
  conversionRate: number;
}[] {
  return [
    {
      stage: "Awareness (Consciência)",
      objective: "Atrair 1000+ pessoas/mês",
      tactic:
        "Conteúdo viral no Instagram, Google Ads, LinkedIn, YouTube, Influenciadores",
      conversionRate: 0.2,
    },
    {
      stage: "Interest (Interesse)",
      objective: "Gerar 200+ leads/mês",
      tactic:
        "Lead magnet: Guia grátis, Quiz, Webinar, Diagnóstico personalizado",
      conversionRate: 0.25,
    },
    {
      stage: "Consideration (Consideração)",
      objective: "Qualificar 50+ leads/mês",
      tactic:
        "Email sequence, Consulta de diagnóstico 15min (paga R$ 50), Testimoniais",
      conversionRate: 0.4,
    },
    {
      stage: "Decision (Decisão)",
      objective: "Converter 20+ clientes/mês",
      tactic:
        "Proposta personalizada, Programa de transformação, Garantia de satisfação",
      conversionRate: 0.6,
    },
    {
      stage: "Retention (Retenção)",
      objective: "Manter 90%+ de clientes",
      tactic:
        "Acompanhamento, Programa de fidelização, Upsell de serviços premium",
      conversionRate: 0.9,
    },
  ];
}

/**
 * 7. MÉTRICAS E KPIs
 */
export function getKPIs(): Record<
  string,
  { metric: string; target: number; unit: string }
> {
  return {
    leads: { metric: "Leads por mês", target: 200, unit: "leads" },
    conversionRate: { metric: "Taxa de conversão", target: 0.15, unit: "%" },
    averageTicket: { metric: "Ticket médio", target: 800, unit: "R$" },
    monthlyRevenue: { metric: "Receita mensal", target: 40000, unit: "R$" },
    customerLifetimeValue: {
      metric: "Valor de vida do cliente",
      target: 8000,
      unit: "R$",
    },
    customerAcquisitionCost: {
      metric: "Custo de aquisição",
      target: 100,
      unit: "R$",
    },
    roi: { metric: "ROI", target: 400, unit: "%" },
    netPromoterScore: { metric: "NPS", target: 70, unit: "pontos" },
  };
}

/**
 * 8. RELATÓRIO DE MONETIZAÇÃO
 */
export function generateMonetizationReport(): string {
  const niches = getTargetNiches();
  const channels = getMonetizationChannels();
  const plan = getInvestmentPlan();
  const kpis = getKPIs();

  let report = `# 💰 ESTRATÉGIA DE MONETIZAÇÃO - BRASIL\n\n`;

  report += `## 🎯 NICHOS DE ALTO VALOR\n\n`;
  for (const niche of niches) {
    report += `### ${niche.name}\n`;
    report += `- **Renda:** ${niche.avgIncome}\n`;
    report += `- **Preço de Consulta:** R$ ${niche.consultationPrice.min} - R$ ${niche.consultationPrice.max}\n`;
    report += `- **Mercado Potencial:** ${niche.estimatedMarketSize.toLocaleString()} pessoas\n`;
    report += `- **Valor de Vida:** R$ ${niche.lifetimeValue.toLocaleString()}\n`;
    report += `- **Necessidades:** ${niche.psychologyNeeds.join(", ")}\n\n`;
  }

  report += `## 💼 CANAIS DE MONETIZAÇÃO\n\n`;
  report += `| Canal | Receita/Mês | Investimento | ROI |\n`;
  report += `|-------|-------------|--------------|-----|\n`;
  for (const channel of channels) {
    report += `| ${channel.name} | R$ ${channel.monthlyRevenue.toLocaleString()} | R$ ${channel.initialInvestment.toLocaleString()} | ${channel.roi}% |\n`;
  }

  report += `\n**Receita Total Potencial:** R$ ${channels.reduce((a, b) => a + b.monthlyRevenue, 0).toLocaleString()}/mês\n\n`;

  report += `## 📈 PLANO DE INVESTIMENTO 6 MESES\n\n`;
  report += `| Mês | Investimento | Leads | Conversões | Receita | Acumulado | ROI |\n`;
  report += `|-----|--------------|-------|-----------|---------|-----------|-----|\n`;
  for (const month of plan) {
    report += `| ${month.month} | R$ ${month.investment.toLocaleString()} | ${month.expectedLeads} | ${month.expectedConversions} | R$ ${month.expectedRevenue.toLocaleString()} | R$ ${month.cumulativeRevenue.toLocaleString()} | ${month.roi}% |\n`;
  }

  report += `\n## 🎯 METAS E KPIs\n\n`;
  for (const [key, kpi] of Object.entries(kpis)) {
    report += `- **${kpi.metric}:** ${kpi.target} ${kpi.unit}\n`;
  }

  report += `\n## ✅ PRÓXIMOS PASSOS\n\n`;
  report += `1. Escolher 2-3 nichos prioritários\n`;
  report += `2. Criar copy e landing pages por nicho\n`;
  report += `3. Lançar campanha de publicidade (R$ 5k/mês)\n`;
  report += `4. Implementar funil de vendas\n`;
  report += `5. Monitorar KPIs e otimizar\n`;
  report += `6. Escalar investimento conforme ROI\n`;

  return report;
}
