/**
 * Motor de Conteúdo Ultra-Viral
 * Psicologia + Entretenimento para crescimento exponencial
 */

export interface ViralContent {
  id: string;
  title: string;
  description: string;
  category: "psychology" | "entertainment" | "motivation" | "trending" | "challenge";
  format: "reel" | "carousel" | "story" | "post" | "short";
  hooks: string[]; // Primeiros 3 segundos críticos
  mainMessage: string;
  callToAction: string;
  hashtags: string[];
  targetAudience: string;
  estimatedViralScore: number; // 0-100
  platforms: ("instagram" | "tiktok" | "youtube" | "pinterest")[];
  duration?: number; // em segundos
  createdAt: Date;
}

export interface ViralStrategy {
  id: string;
  name: string;
  theme: string;
  duration: number; // dias
  dailyPosts: number;
  targetReach: number;
  expectedGrowth: number; // seguidores esperados
  contentMix: {
    psychology: number; // %
    entertainment: number; // %
    motivation: number; // %
    trending: number; // %
    challenge: number; // %
  };
  platforms: string[];
}

export interface ViralHook {
  id: string;
  text: string;
  category: string;
  effectiveness: number; // 0-100
  usageCount: number;
  successRate: number;
}

export interface ContentCalendarViral {
  id: string;
  strategy: ViralStrategy;
  contents: ViralContent[];
  schedule: Array<{ date: Date; posts: ViralContent[] }>;
  projectedMetrics: {
    dailyReach: number;
    dailyFollowers: number;
    monthlyFollowers: number;
    quarterlyFollowers: number;
  };
}

/**
 * Gera hooks virais que capturam atenção em 3 segundos
 */
export async function generateViralHooks(category: string, count: number = 10): Promise<ViralHook[]> {
  try {
    const hookLibrary: Record<string, string[]> = {
      psychology: [
        "Seu terapeuta não quer que você saiba disso...",
        "3 sinais que você precisa de terapia AGORA",
        "Psicólogos descobriram que...",
        "Se você faz isso, sua ansiedade nunca vai embora",
        "O segredo que ninguém te conta sobre relacionamentos",
        "Você está fazendo terapia errado (e não sabe)",
        "Esse é o maior erro que as pessoas cometem",
        "Você sofre de síndrome do impostor? Aqui está a solução",
        "Seu trauma está sabotando sua vida e você não sabe",
        "Psicólogos odeiam esse truque simples",
      ],
      entertainment: [
        "Você não vai acreditar no que aconteceu...",
        "Espera até o final (prometo que vale a pena)",
        "Isso é tão engraçado que dói",
        "Ninguém esperava por isso...",
        "Você vai rir, chorar e se identificar",
        "Isso mudou minha vida completamente",
        "Não acredito que levei ANOS para descobrir",
        "Meu terapeuta ficou chocado quando contei",
        "Você faz isso? Então você é louco",
        "Essa é a coisa mais relatable que você vai ver hoje",
      ],
      motivation: [
        "Você é mais forte do que pensa",
        "Se você quer mudar sua vida, assista até o final",
        "Isso é o que separa os vencedores dos perdedores",
        "Você merece ser feliz (e aqui está como)",
        "Pare de se sabotar e faça isso",
        "Seu futuro eu agradece",
        "Você está mais perto do que pensa",
        "Isso vai mudar sua perspectiva para sempre",
        "Você é o único obstáculo entre você e seus sonhos",
        "Comece hoje, agradeça-se amanhã",
      ],
      trending: [
        "Todos estão falando sobre isso...",
        "Você viu essa tendência?",
        "Essa é a tendência do momento",
        "Viralizou por um motivo",
        "Você precisa ver isso",
        "Isso está explodindo nas redes",
        "Ninguém está falando sobre isso, mas deveria",
        "Essa tendência é genial",
        "Você está perdendo essa",
        "Isso é ouro puro",
      ],
      challenge: [
        "Desafio: consegue fazer isso?",
        "Vou fazer esse desafio e você?",
        "Esse desafio é impossível (ou é?)",
        "Quem consegue fazer isso?",
        "Desafio viral: tente não rir",
        "Você consegue completar esse desafio?",
        "Esse desafio vai te surpreender",
        "Poucos conseguem fazer isso",
        "Você é corajoso o suficiente?",
        "Desafio: 30 dias de transformação",
      ],
    };

    const hooks = hookLibrary[category] || hookLibrary.psychology;
    const selected = hooks.slice(0, count);

    return selected.map((text, i) => ({
      id: `hook_${Date.now()}_${i}`,
      text,
      category,
      effectiveness: Math.floor(Math.random() * 30) + 70, // 70-100
      usageCount: 0,
      successRate: 0,
    }));
  } catch (error) {
    console.error("Erro ao gerar hooks:", error);
    return [];
  }
}

/**
 * Cria conteúdo ultra-viral
 */
export async function createViralContent(
  title: string,
  category: "psychology" | "entertainment" | "motivation" | "trending" | "challenge",
  format: "reel" | "carousel" | "story" | "post" | "short",
  hook: string,
  mainMessage: string,
  callToAction: string,
  platforms: ("instagram" | "tiktok" | "youtube" | "pinterest")[]
): Promise<ViralContent | null> {
  try {
    // Gerar hashtags virais
    const hashtagSets: Record<string, string[]> = {
      psychology: [
        "#psicologia",
        "#saudementalimporta",
        "#terapia",
        "#desenvolvimentopessoal",
        "#psicólogo",
        "#mentalhealth",
        "#psicologiabrasil",
        "#bemestar",
        "#autoconhecimento",
        "#crescimentopessoal",
        "#ansiedade",
        "#relacionamentos",
      ],
      entertainment: [
        "#viral",
        "#trending",
        "#foryou",
        "#explore",
        "#reels",
        "#shorts",
        "#viralvideo",
        "#engraçado",
        "#relatable",
        "#funny",
        "#entertainment",
        "#conteúdo",
      ],
      motivation: [
        "#motivação",
        "#inspiração",
        "#sucesso",
        "#crescimento",
        "#mindset",
        "#transformação",
        "#objetivos",
        "#disciplina",
        "#foco",
        "#vitória",
        "#mentalidade",
        "#força",
      ],
    };

    const hashtags = hashtagSets[category] || hashtagSets.psychology;

    // Calcular viral score (0-100)
    let viralScore = 50;
    if (hook.length > 20) viralScore += 10;
    if (mainMessage.length > 100) viralScore += 15;
    if (callToAction.includes("comente") || callToAction.includes("compartilhe")) viralScore += 15;
    if (platforms.length > 2) viralScore += 10;

    const content: ViralContent = {
      id: `viral_${Date.now()}`,
      title,
      description: mainMessage,
      category,
      format,
      hooks: [hook],
      mainMessage,
      callToAction,
      hashtags: hashtags.slice(0, 30),
      targetAudience: "Pessoas interessadas em psicologia, bem-estar e crescimento pessoal",
      estimatedViralScore: Math.min(100, viralScore),
      platforms,
      duration: format === "reel" || format === "short" ? 15 : undefined,
      createdAt: new Date(),
    };

    console.log(`✓ Conteúdo viral criado: ${title} (Score: ${content.estimatedViralScore})`);
    return content;
  } catch (error) {
    console.error("Erro ao criar conteúdo viral:", error);
    return null;
  }
}

/**
 * Cria estratégia viral de 3 meses
 */
export async function createThreeMonthViralStrategy(): Promise<ViralStrategy | null> {
  try {
    const strategy: ViralStrategy = {
      id: `strategy_${Date.now()}`,
      name: "Crescimento Exponencial 3 Meses",
      theme: "Psicologia + Entretenimento",
      duration: 90,
      dailyPosts: 6, // 2 por plataforma
      targetReach: 50000000, // 50 milhões de impressões
      expectedGrowth: 1000000, // 1 milhão de seguidores
      contentMix: {
        psychology: 40,
        entertainment: 30,
        motivation: 20,
        trending: 7,
        challenge: 3,
      },
      platforms: ["instagram", "tiktok", "youtube", "pinterest"],
    };

    console.log(`✓ Estratégia viral criada: ${strategy.expectedGrowth.toLocaleString("pt-BR")} seguidores esperados`);
    return strategy;
  } catch (error) {
    console.error("Erro ao criar estratégia:", error);
    return null;
  }
}

/**
 * Gera calendário de conteúdo viral para 90 dias
 */
export async function generateThreeMonthContentCalendar(
  strategy: ViralStrategy
): Promise<ContentCalendarViral | null> {
  try {
    const contents: ViralContent[] = [];
    const schedule: Array<{ date: Date; posts: ViralContent[] }> = [];

    // Gerar conteúdo para cada dia
    for (let day = 0; day < 90; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);

      const dailyContents: ViralContent[] = [];

      // Gerar 6 posts por dia (2 por plataforma)
      for (let i = 0; i < strategy.dailyPosts; i++) {
        const categories = ["psychology", "entertainment", "motivation", "trending", "challenge"] as const;
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        const content = await createViralContent(
          `Conteúdo Viral - Dia ${day + 1} - Post ${i + 1}`,
          randomCategory,
          "reel",
          "Hook viral aqui...",
          "Mensagem principal do conteúdo",
          "Comente, compartilhe e siga!",
          ["instagram", "tiktok"]
        );

        if (content) {
          contents.push(content);
          dailyContents.push(content);
        }
      }

      schedule.push({ date, posts: dailyContents });
    }

    // Calcular métricas projetadas
    const projectedMetrics = {
      dailyReach: Math.floor(strategy.targetReach / 90),
      dailyFollowers: Math.floor(strategy.expectedGrowth / 90),
      monthlyFollowers: Math.floor(strategy.expectedGrowth / 3),
      quarterlyFollowers: strategy.expectedGrowth,
    };

    const calendar: ContentCalendarViral = {
      id: `calendar_${Date.now()}`,
      strategy,
      contents,
      schedule,
      projectedMetrics,
    };

    console.log(`✓ Calendário de 90 dias criado com ${contents.length} posts`);
    return calendar;
  } catch (error) {
    console.error("Erro ao gerar calendário:", error);
    return null;
  }
}

/**
 * Otimiza conteúdo para máximo viral
 */
export async function optimizeForViral(content: ViralContent): Promise<ViralContent> {
  try {
    // Melhorar hook
    if (content.hooks[0].length < 20) {
      content.hooks[0] = `${content.hooks[0]} (você não vai acreditar)`;
    }

    // Adicionar mais CTAs
    if (!content.callToAction.includes("comente")) {
      content.callToAction += " Comente sua opinião!";
    }

    // Aumentar score
    content.estimatedViralScore = Math.min(100, content.estimatedViralScore + 15);

    // Adicionar mais hashtags virais
    const viralHashtags = ["#foryou", "#explore", "#viral", "#trending", "#reels"];
    const uniqueHashtags = Array.from(new Set([...content.hashtags, ...viralHashtags]));
    content.hashtags = uniqueHashtags.slice(0, 30);

    console.log(`✓ Conteúdo otimizado para viral (Score: ${content.estimatedViralScore})`);
    return content;
  } catch (error) {
    console.error("Erro ao otimizar:", error);
    return content;
  }
}

/**
 * Calcula crescimento exponencial
 */
export function calculateExponentialGrowth(
  startFollowers: number,
  dailyGrowthRate: number,
  days: number
): number {
  try {
    // Fórmula: Final = Inicial * (1 + taxa)^dias
    const finalFollowers = startFollowers * Math.pow(1 + dailyGrowthRate, days);
    return Math.floor(finalFollowers);
  } catch (error) {
    console.error("Erro ao calcular crescimento:", error);
    return startFollowers;
  }
}

/**
 * Gera projeção de crescimento para 3 meses
 */
export async function generateGrowthProjection(
  currentFollowers: number,
  targetFollowers: number,
  days: number = 90
): Promise<Array<{ day: number; followers: number; growth: number }>> {
  try {
    const projection: Array<{ day: number; followers: number; growth: number }> = [];

    // Calcular taxa de crescimento diária necessária
    const requiredDailyRate = Math.pow(targetFollowers / currentFollowers, 1 / days) - 1;

    for (let day = 0; day <= days; day++) {
      const followers = Math.floor(currentFollowers * Math.pow(1 + requiredDailyRate, day));
      const growth = followers - currentFollowers;

      projection.push({
        day,
        followers,
        growth,
      });
    }

    console.log(`✓ Projeção gerada: ${currentFollowers.toLocaleString("pt-BR")} → ${targetFollowers.toLocaleString("pt-BR")} em ${days} dias`);
    return projection;
  } catch (error) {
    console.error("Erro ao gerar projeção:", error);
    return [];
  }
}

/**
 * Gera relatório de estratégia viral
 */
export async function generateViralStrategyReport(
  strategy: ViralStrategy,
  calendar: ContentCalendarViral
): Promise<string> {
  try {
    let report = "# Relatório de Estratégia Viral - 3 Meses\n\n";

    report += `## Objetivo\n`;
    report += `- Crescimento: ${strategy.expectedGrowth.toLocaleString("pt-BR")} novos seguidores\n`;
    report += `- Reach: ${strategy.targetReach.toLocaleString("pt-BR")} impressões\n`;
    report += `- Duração: ${strategy.duration} dias\n\n`;

    report += `## Mix de Conteúdo\n`;
    report += `- Psicologia: ${strategy.contentMix.psychology}%\n`;
    report += `- Entretenimento: ${strategy.contentMix.entertainment}%\n`;
    report += `- Motivação: ${strategy.contentMix.motivation}%\n`;
    report += `- Trending: ${strategy.contentMix.trending}%\n`;
    report += `- Desafios: ${strategy.contentMix.challenge}%\n\n`;

    report += `## Plataformas\n`;
    strategy.platforms.forEach((p) => {
      report += `- ${p}\n`;
    });

    report += `\n## Métricas Projetadas\n`;
    report += `- Reach Diário: ${calendar.projectedMetrics.dailyReach.toLocaleString("pt-BR")}\n`;
    report += `- Seguidores Diários: ${calendar.projectedMetrics.dailyFollowers.toLocaleString("pt-BR")}\n`;
    report += `- Seguidores Mensais: ${calendar.projectedMetrics.monthlyFollowers.toLocaleString("pt-BR")}\n`;
    report += `- Seguidores Trimestrais: ${calendar.projectedMetrics.quarterlyFollowers.toLocaleString("pt-BR")}\n\n`;

    report += `## Conteúdo Total\n`;
    report += `- Posts Criados: ${calendar.contents.length}\n`;
    report += `- Score Médio: ${Math.round(calendar.contents.reduce((sum, c) => sum + c.estimatedViralScore, 0) / calendar.contents.length)}\n`;

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}
