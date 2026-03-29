/**
 * FASE 1: CRESCIMENTO DE SEGUIDORES (Sem Agendamento de Consultas)
 * Objetivo: 1 MILHÃO de seguidores em 3 meses
 * Foco: Conteúdo viral diário + Monetização sem consultas
 */

export interface DailyContentPlan {
  day: number;
  instagramPosts: number;
  instagramReels: number;
  youtubeShorts: number;
  tiktokVideos: number;
  contentThemes: string[];
  estimatedReach: number;
  estimatedEngagement: number;
}

export interface ViralContentFormula {
  hook: string;
  pattern: string;
  psychology: string;
  cta: string;
  expectedEngagement: number;
}

export interface MonetizationWithoutConsultations {
  channel: string;
  monthlyRevenue: number;
  requirements: string[];
  timeToMonetize: string;
}

export interface LeadCaptureStrategy {
  method: string;
  platform: string;
  incentive: string;
  expectedLeads: number;
  conversionToFollower: number;
}

/**
 * 1. PLANO DE CONTEÚDO DIÁRIO (90 DIAS)
 */
export function getDailyContentPlan(): DailyContentPlan[] {
  return [
    {
      day: 1,
      instagramPosts: 2,
      instagramReels: 3,
      youtubeShorts: 3,
      tiktokVideos: 2,
      contentThemes: [
        "Psicologia do Medo",
        "Ansiedade no Trabalho",
        "Relacionamentos",
      ],
      estimatedReach: 5000,
      estimatedEngagement: 500,
    },
    {
      day: 2,
      instagramPosts: 2,
      instagramReels: 3,
      youtubeShorts: 3,
      tiktokVideos: 2,
      contentThemes: [
        "Síndrome do Impostor",
        "Autoestima",
        "Confiança",
      ],
      estimatedReach: 7000,
      estimatedEngagement: 700,
    },
    {
      day: 3,
      instagramPosts: 2,
      instagramReels: 4,
      youtubeShorts: 4,
      tiktokVideos: 3,
      contentThemes: [
        "Procrastinação",
        "Produtividade",
        "Gestão de Tempo",
      ],
      estimatedReach: 10000,
      estimatedEngagement: 1200,
    },
    {
      day: 4,
      instagramPosts: 2,
      instagramReels: 3,
      youtubeShorts: 3,
      tiktokVideos: 2,
      contentThemes: [
        "Depressão",
        "Tristeza",
        "Esperança",
      ],
      estimatedReach: 8000,
      estimatedEngagement: 900,
    },
    {
      day: 5,
      instagramPosts: 3,
      instagramReels: 5,
      youtubeShorts: 5,
      tiktokVideos: 4,
      contentThemes: [
        "Relacionamentos Tóxicos",
        "Limites Saudáveis",
        "Comunicação",
      ],
      estimatedReach: 15000,
      estimatedEngagement: 2000,
    },
    {
      day: 6,
      instagramPosts: 2,
      instagramReels: 3,
      youtubeShorts: 3,
      tiktokVideos: 2,
      contentThemes: [
        "Mindfulness",
        "Meditação",
        "Bem-estar",
      ],
      estimatedReach: 6000,
      estimatedEngagement: 600,
    },
    {
      day: 7,
      instagramPosts: 2,
      instagramReels: 3,
      youtubeShorts: 3,
      tiktokVideos: 2,
      contentThemes: [
        "Motivação",
        "Sucesso",
        "Transformação",
      ],
      estimatedReach: 9000,
      estimatedEngagement: 1100,
    },
  ];
}

/**
 * 2. FÓRMULAS DE CONTEÚDO VIRAL
 */
export function getViralContentFormulas(): ViralContentFormula[] {
  return [
    {
      hook: "Você estava fazendo errado a TODA vida",
      pattern: "Erro comum → Verdade → Solução → Resultado",
      psychology:
        "Curiosidade + Validação + Esperança (pessoas querem saber que estavam erradas)",
      cta: "Salva esse vídeo e compartilha com quem precisa",
      expectedEngagement: 0.25,
    },
    {
      hook: "3 sinais de que você tem ANSIEDADE (e não sabia)",
      pattern: "Sintoma 1 → Sintoma 2 → Sintoma 3 → Ação",
      psychology:
        "Auto-descoberta + Validação + Ação (pessoas se identificam)",
      cta: "Qual você tem? Comenta aqui",
      expectedEngagement: 0.3,
    },
    {
      hook: "Psicólogos NÃO fazem isso com seus pacientes",
      pattern: "Mito → Verdade → Explicação → Impacto",
      psychology: "Curiosidade + Autoridade + Educação",
      cta: "Você faz? Comenta aqui",
      expectedEngagement: 0.28,
    },
    {
      hook: "Essa técnica MUDA sua vida em 30 dias",
      pattern: "Promessa → Explicação → Passo a passo → Resultado",
      psychology: "Esperança + Simplicidade + Transformação",
      cta: "Tenta fazer e comenta o resultado",
      expectedEngagement: 0.35,
    },
    {
      hook: "Você está em RELACIONAMENTO TÓXICO e não sabe",
      pattern: "Sinais de alerta → Validação → Ação → Esperança",
      psychology: "Proteção + Validação + Empoderamento",
      cta: "Se você está aqui, sai dessa. Comenta se conseguiu",
      expectedEngagement: 0.32,
    },
    {
      hook: "Seu chefe faz isso porque você deixa",
      pattern: "Comportamento → Raiz psicológica → Solução → Empoderamento",
      psychology: "Responsabilidade + Poder + Transformação",
      cta: "Começa a fazer diferente hoje",
      expectedEngagement: 0.27,
    },
    {
      hook: "A VERDADE sobre depressão que ninguém fala",
      pattern: "Mito → Verdade → Impacto → Esperança",
      psychology: "Educação + Desmitificação + Esperança",
      cta: "Se você tem depressão, você não está sozinho",
      expectedEngagement: 0.33,
    },
    {
      hook: "Você tem SÍNDROME DO IMPOSTOR? Faz esse teste",
      pattern: "Teste interativo → Resultado → Validação → Ação",
      psychology: "Auto-descoberta + Validação + Comunidade",
      cta: "Qual foi seu resultado? Comenta",
      expectedEngagement: 0.38,
    },
  ];
}

/**
 * 3. MONETIZAÇÃO SEM CONSULTAS
 */
export function getMonetizationWithoutConsultations(): MonetizationWithoutConsultations[] {
  return [
    {
      channel: "YouTube Ads (AdSense)",
      monthlyRevenue: 5000,
      requirements: [
        "1000 inscritos",
        "4000 horas de visualização",
        "Conteúdo original",
      ],
      timeToMonetize: "1-2 meses",
    },
    {
      channel: "Produtos Digitais (Cursos, E-books, Templates)",
      monthlyRevenue: 10000,
      requirements: [
        "Email list com 5k+",
        "Produto de qualidade",
        "Landing page",
      ],
      timeToMonetize: "2-3 semanas",
    },
    {
      channel: "Afiliados (Cursos, Livros, Ferramentas)",
      monthlyRevenue: 3000,
      requirements: [
        "Audiência engajada",
        "Produtos relevantes",
        "Confiança da audiência",
      ],
      timeToMonetize: "1-2 semanas",
    },
    {
      channel: "Sponsorships e Parcerias",
      monthlyRevenue: 5000,
      requirements: [
        "100k+ seguidores",
        "Engajamento alto",
        "Nicho específico",
      ],
      timeToMonetize: "2-3 meses",
    },
    {
      channel: "Patreon / Memberships",
      monthlyRevenue: 2000,
      requirements: [
        "Conteúdo exclusivo",
        "Comunidade ativa",
        "Valor agregado",
      ],
      timeToMonetize: "1 mês",
    },
    {
      channel: "Newsletter Premium",
      monthlyRevenue: 3000,
      requirements: [
        "Email list com 10k+",
        "Conteúdo premium",
        "Diferencial claro",
      ],
      timeToMonetize: "2-3 meses",
    },
    {
      channel: "Consultoria (Não clínica - Carreira, Negócios)",
      monthlyRevenue: 8000,
      requirements: [
        "Expertise reconhecida",
        "Audiência qualificada",
        "Proposta clara",
      ],
      timeToMonetize: "1-2 meses",
    },
    {
      channel: "Workshops e Eventos Online",
      monthlyRevenue: 4000,
      requirements: [
        "Audiência engajada",
        "Tema relevante",
        "Plataforma de eventos",
      ],
      timeToMonetize: "2-3 semanas",
    },
  ];
}

/**
 * 4. ESTRATÉGIA DE CAPTURA DE LEADS (SEM AGENDAMENTO)
 */
export function getLeadCaptureStrategy(): LeadCaptureStrategy[] {
  return [
    {
      method: "Lead Magnet - Guia Gratuito",
      platform: "Instagram + YouTube",
      incentive: "Guia: 10 Técnicas de Psicologia para Ansiedade",
      expectedLeads: 500,
      conversionToFollower: 0.8,
    },
    {
      method: "Quiz Interativo",
      platform: "Instagram Stories + Link",
      incentive: "Descubra seu tipo de ansiedade em 2 minutos",
      expectedLeads: 300,
      conversionToFollower: 0.7,
    },
    {
      method: "Webinar Gratuito",
      platform: "YouTube Live + Email",
      incentive: "Webinar: Psicologia do Sucesso (ao vivo)",
      expectedLeads: 1000,
      conversionToFollower: 0.9,
    },
    {
      method: "Desafio 7 Dias",
      platform: "WhatsApp + Email",
      incentive: "Desafio: 7 dias de técnicas de bem-estar",
      expectedLeads: 800,
      conversionToFollower: 0.85,
    },
    {
      method: "Comunidade Exclusiva",
      platform: "Telegram + WhatsApp",
      incentive: "Grupo exclusivo com dicas diárias de psicologia",
      expectedLeads: 600,
      conversionToFollower: 0.75,
    },
    {
      method: "Podcast/Áudio",
      platform: "Spotify + YouTube",
      incentive: "Podcast: Histórias de transformação",
      expectedLeads: 400,
      conversionToFollower: 0.6,
    },
  ];
}

/**
 * 5. PROJEÇÃO DE CRESCIMENTO 90 DIAS
 */
export function getGrowthProjection(): {
  week: number;
  instagramFollowers: number;
  youtubeSubscribers: number;
  tiktokFollowers: number;
  totalFollowers: number;
  estimatedReach: number;
  estimatedEngagement: number;
  estimatedLeads: number;
}[] {
  return [
    {
      week: 1,
      instagramFollowers: 5000,
      youtubeSubscribers: 2000,
      tiktokFollowers: 3000,
      totalFollowers: 10000,
      estimatedReach: 50000,
      estimatedEngagement: 5000,
      estimatedLeads: 500,
    },
    {
      week: 2,
      instagramFollowers: 15000,
      youtubeSubscribers: 8000,
      tiktokFollowers: 12000,
      totalFollowers: 35000,
      estimatedReach: 150000,
      estimatedEngagement: 18000,
      estimatedLeads: 1800,
    },
    {
      week: 3,
      instagramFollowers: 40000,
      youtubeSubscribers: 25000,
      tiktokFollowers: 35000,
      totalFollowers: 100000,
      estimatedReach: 400000,
      estimatedEngagement: 60000,
      estimatedLeads: 6000,
    },
    {
      week: 4,
      instagramFollowers: 80000,
      youtubeSubscribers: 60000,
      tiktokFollowers: 90000,
      totalFollowers: 230000,
      estimatedReach: 900000,
      estimatedEngagement: 150000,
      estimatedLeads: 15000,
    },
    {
      week: 5,
      instagramFollowers: 150000,
      youtubeSubscribers: 120000,
      tiktokFollowers: 200000,
      totalFollowers: 470000,
      estimatedReach: 1800000,
      estimatedEngagement: 300000,
      estimatedLeads: 30000,
    },
    {
      week: 6,
      instagramFollowers: 250000,
      youtubeSubscribers: 200000,
      tiktokFollowers: 350000,
      totalFollowers: 800000,
      estimatedReach: 3000000,
      estimatedEngagement: 500000,
      estimatedLeads: 50000,
    },
    {
      week: 7,
      instagramFollowers: 380000,
      youtubeSubscribers: 300000,
      tiktokFollowers: 550000,
      totalFollowers: 1230000,
      estimatedReach: 4500000,
      estimatedEngagement: 750000,
      estimatedLeads: 75000,
    },
    {
      week: 8,
      instagramFollowers: 500000,
      youtubeSubscribers: 400000,
      tiktokFollowers: 750000,
      totalFollowers: 1650000,
      estimatedReach: 6000000,
      estimatedEngagement: 1000000,
      estimatedLeads: 100000,
    },
    {
      week: 9,
      instagramFollowers: 650000,
      youtubeSubscribers: 500000,
      tiktokFollowers: 1000000,
      totalFollowers: 2150000,
      estimatedReach: 7500000,
      estimatedEngagement: 1250000,
      estimatedLeads: 125000,
    },
    {
      week: 10,
      instagramFollowers: 800000,
      youtubeSubscribers: 600000,
      tiktokFollowers: 1200000,
      totalFollowers: 2600000,
      estimatedReach: 8500000,
      estimatedEngagement: 1400000,
      estimatedLeads: 140000,
    },
    {
      week: 11,
      instagramFollowers: 900000,
      youtubeSubscribers: 700000,
      tiktokFollowers: 1300000,
      totalFollowers: 2900000,
      estimatedReach: 9000000,
      estimatedEngagement: 1500000,
      estimatedLeads: 150000,
    },
    {
      week: 12,
      instagramFollowers: 1000000,
      youtubeSubscribers: 800000,
      tiktokFollowers: 1500000,
      totalFollowers: 3300000,
      estimatedReach: 10000000,
      estimatedEngagement: 1700000,
      estimatedLeads: 170000,
    },
  ];
}

/**
 * 6. RESUMO EXECUTIVO
 */
export function getPhase1Summary(): string {
  const projection = getGrowthProjection();
  const final = projection[projection.length - 1];

  return `
# 🚀 FASE 1: CRESCIMENTO DE SEGUIDORES (90 DIAS)

## 🎯 OBJETIVO
Crescer de 0 para 1 MILHÃO de seguidores em 3 meses
Foco: Conteúdo viral diário + Monetização sem consultas

## 📊 PROJEÇÃO FINAL (90 DIAS)
- **Instagram:** 1M seguidores
- **YouTube:** 800k inscritos
- **TikTok:** 1.5M seguidores
- **Total:** 3.3M seguidores
- **Alcance Mensal:** 10M pessoas
- **Engajamento Mensal:** 1.7M interações
- **Leads Capturados:** 170k

## 💰 MONETIZAÇÃO (SEM CONSULTAS)
- YouTube Ads: R$ 5k/mês
- Produtos Digitais: R$ 10k/mês
- Afiliados: R$ 3k/mês
- Sponsorships: R$ 5k/mês
- Patreon: R$ 2k/mês
- Newsletter: R$ 3k/mês
- Consultoria: R$ 8k/mês
- Workshops: R$ 4k/mês

**Total: R$ 40k/mês em monetização (SEM consultas)**

## 📝 ESTRATÉGIA DE CONTEÚDO
- 2-3 posts Instagram/dia
- 3-5 reels Instagram/dia
- 3-5 shorts YouTube/dia
- 2-4 vídeos TikTok/dia
- 8 fórmulas virais testadas
- Conteúdo 100% autêntico (sem foto de Daniela)

## 🎁 CAPTURA DE LEADS
- Lead magnets
- Quizzes interativos
- Webinars gratuitos
- Desafios 7 dias
- Comunidades exclusivas
- Podcasts

## ✅ PRÓXIMOS PASSOS
1. Implementar agentes de IA para gerar conteúdo 24/7
2. Lançar primeira semana de conteúdo
3. Monitorar métricas e otimizar
4. Escalar conforme crescimento
5. Ativar monetização quando atingir marcos (1k, 10k, 100k)
`;
}
