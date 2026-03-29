/**
 * Sistema de Rede de Influenciadores com Viral Loops
 * Crescimento exponencial através de amplificação
 */

export interface Influencer {
  id: string;
  name: string;
  platform: string;
  username: string;
  followers: number;
  engagement: number;
  niche: string;
  tier: "mega" | "macro" | "micro" | "nano";
  status: "active" | "inactive" | "pending";
  commission: number; // %
  roi: number;
  connectedAt: Date;
}

export interface ViralLoop {
  id: string;
  name: string;
  description: string;
  trigger: string;
  reward: string;
  expectedAmplification: number; // x vezes
  mechanics: string[];
  status: "active" | "paused" | "archived";
}

export interface InfluencerCampaign {
  id: string;
  name: string;
  influencers: Influencer[];
  content: string;
  budget: number;
  expectedReach: number;
  expectedFollowers: number;
  startDate: Date;
  endDate: Date;
  status: "planning" | "active" | "completed";
  metrics: {
    reach: number;
    engagement: number;
    followers: number;
    roi: number;
  };
}

export interface ViralLoopMetrics {
  triggersInitiated: number;
  rewardsDistributed: number;
  amplificationFactor: number;
  newFollowers: number;
  costPerFollower: number;
}

/**
 * Encontra influenciadores por nicho
 */
export async function findInfluencersByNiche(
  niche: string,
  minFollowers: number = 10000
): Promise<Influencer[]> {
  try {
    const influencers: Influencer[] = [];

    // Simular busca de influenciadores
    const tiers = ["nano", "micro", "macro", "mega"] as const;

    for (let i = 0; i < 20; i++) {
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      let followers = 0;

      switch (tier) {
        case "nano":
          followers = Math.floor(Math.random() * 50000) + 10000;
          break;
        case "micro":
          followers = Math.floor(Math.random() * 500000) + 50000;
          break;
        case "macro":
          followers = Math.floor(Math.random() * 5000000) + 500000;
          break;
        case "mega":
          followers = Math.floor(Math.random() * 50000000) + 5000000;
          break;
      }

      if (followers >= minFollowers) {
        influencers.push({
          id: `influencer_${i}`,
          name: `Influencer ${i}`,
          platform: "instagram",
          username: `influencer_${i}`,
          followers,
          engagement: Math.floor(Math.random() * 10) + 2,
          niche,
          tier,
          status: "active",
          commission: tier === "mega" ? 15 : tier === "macro" ? 12 : tier === "micro" ? 10 : 8,
          roi: Math.floor(Math.random() * 500) + 100,
          connectedAt: new Date(),
        });
      }
    }

    console.log(`✓ ${influencers.length} influenciadores encontrados em ${niche}`);
    return influencers;
  } catch (error) {
    console.error("Erro ao encontrar influenciadores:", error);
    return [];
  }
}

/**
 * Cria viral loop (mecanismo de crescimento exponencial)
 */
export async function createViralLoop(
  name: string,
  description: string,
  trigger: string,
  reward: string
): Promise<ViralLoop | null> {
  try {
    const loop: ViralLoop = {
      id: `loop_${Date.now()}`,
      name,
      description,
      trigger,
      reward,
      expectedAmplification: 3, // Cada pessoa compartilha com 3 pessoas
      mechanics: [
        `1. ${trigger}`,
        `2. Usuário recebe ${reward}`,
        `3. Usuário compartilha com amigos`,
        `4. Amigos repetem o processo`,
        `5. Crescimento exponencial`,
      ],
      status: "active",
    };

    console.log(`✓ Viral loop criado: ${name}`);
    return loop;
  } catch (error) {
    console.error("Erro ao criar viral loop:", error);
    return null;
  }
}

/**
 * Exemplos de viral loops
 */
export async function createCommonViralLoops(): Promise<ViralLoop[]> {
  try {
    const loops: ViralLoop[] = [];

    // Loop 1: Referral
    const referralLoop = await createViralLoop(
      "Programa de Referral",
      "Usuários ganham desconto ao indicar amigos",
      "Usuário compartilha link de referral",
      "Desconto de 20% na próxima consulta"
    );
    if (referralLoop) loops.push(referralLoop);

    // Loop 2: Challenge
    const challengeLoop = await createViralLoop(
      "Desafio Viral",
      "Usuários participam de desafio e marcam amigos",
      "Usuário completa desafio de 7 dias",
      "Certificado digital + menção no perfil"
    );
    if (challengeLoop) loops.push(challengeLoop);

    // Loop 3: Compartilhamento
    const shareLoop = await createViralLoop(
      "Compartilhe e Ganhe",
      "Usuários ganham pontos ao compartilhar conteúdo",
      "Usuário compartilha post nos stories",
      "Pontos para trocar por consultas grátis"
    );
    if (shareLoop) loops.push(shareLoop);

    // Loop 4: Comunidade
    const communityLoop = await createViralLoop(
      "Convide Amigos",
      "Usuários ganham acesso a grupo exclusivo",
      "Usuário convida 3 amigos",
      "Acesso a grupo privado no WhatsApp"
    );
    if (communityLoop) loops.push(communityLoop);

    // Loop 5: Competição
    const competitionLoop = await createViralLoop(
      "Ranking de Engajamento",
      "Usuários competem por prêmios",
      "Usuário com mais engajamento no mês",
      "Consulta grátis + destaque no perfil"
    );
    if (competitionLoop) loops.push(competitionLoop);

    console.log(`✓ ${loops.length} viral loops criados`);
    return loops;
  } catch (error) {
    console.error("Erro ao criar viral loops:", error);
    return [];
  }
}

/**
 * Cria campanha com influenciadores
 */
export async function createInfluencerCampaign(
  name: string,
  influencers: Influencer[],
  content: string,
  budget: number,
  duration: number = 30
): Promise<InfluencerCampaign | null> {
  try {
    // Calcular reach esperado
    const totalFollowers = influencers.reduce((sum, i) => sum + i.followers, 0);
    const avgEngagement = influencers.reduce((sum, i) => sum + i.engagement, 0) / influencers.length;
    const expectedReach = Math.floor(totalFollowers * (avgEngagement / 100));
    const expectedFollowers = Math.floor(expectedReach * 0.05); // 5% de conversão

    const campaign: InfluencerCampaign = {
      id: `campaign_${Date.now()}`,
      name,
      influencers,
      content,
      budget,
      expectedReach,
      expectedFollowers,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      status: "planning",
      metrics: {
        reach: 0,
        engagement: 0,
        followers: 0,
        roi: 0,
      },
    };

    console.log(`✓ Campanha criada: ${name} (${influencers.length} influenciadores)`);
    return campaign;
  } catch (error) {
    console.error("Erro ao criar campanha:", error);
    return null;
  }
}

/**
 * Calcula ROI de campanha
 */
export async function calculateCampaignROI(
  campaign: InfluencerCampaign
): Promise<{ roi: number; profitability: string }> {
  try {
    // Assumir valor médio de cliente = R$ 500
    const avgClientValue = 500;
    const revenue = campaign.metrics.followers * avgClientValue;
    const roi = ((revenue - campaign.budget) / campaign.budget) * 100;

    let profitability = "";
    if (roi > 300) {
      profitability = "Excelente - Escale imediatamente";
    } else if (roi > 100) {
      profitability = "Muito bom - Continue com essa estratégia";
    } else if (roi > 0) {
      profitability = "Bom - Otimize e continue";
    } else {
      profitability = "Negativo - Revise a estratégia";
    }

    console.log(`✓ ROI calculado: ${roi.toFixed(2)}%`);
    return { roi: Math.round(roi), profitability };
  } catch (error) {
    console.error("Erro ao calcular ROI:", error);
    return { roi: 0, profitability: "Erro ao calcular" };
  }
}

/**
 * Processa viral loop
 */
export async function processViralLoop(
  loop: ViralLoop,
  initialUsers: number = 100
): Promise<ViralLoopMetrics> {
  try {
    const metrics: ViralLoopMetrics = {
      triggersInitiated: initialUsers,
      rewardsDistributed: 0,
      amplificationFactor: 1,
      newFollowers: 0,
      costPerFollower: 0,
    };

    // Simular crescimento exponencial
    let currentUsers = initialUsers;

    for (let wave = 0; wave < 5; wave++) {
      const newUsers = Math.floor(currentUsers * loop.expectedAmplification);
      metrics.triggersInitiated += newUsers;
      metrics.rewardsDistributed += newUsers;
      metrics.amplificationFactor = metrics.triggersInitiated / initialUsers;
      currentUsers = newUsers;
    }

    // Assumir 20% de conversão para seguidores
    metrics.newFollowers = Math.floor(metrics.triggersInitiated * 0.2);

    console.log(`✓ Viral loop processado: ${metrics.amplificationFactor.toFixed(1)}x amplificação`);
    return metrics;
  } catch (error) {
    console.error("Erro ao processar viral loop:", error);
    return {
      triggersInitiated: 0,
      rewardsDistributed: 0,
      amplificationFactor: 0,
      newFollowers: 0,
      costPerFollower: 0,
    };
  }
}

/**
 * Gera relatório de rede de influenciadores
 */
export async function generateInfluencerNetworkReport(
  influencers: Influencer[],
  campaigns: InfluencerCampaign[],
  loops: ViralLoop[]
): Promise<string> {
  try {
    let report = "# Relatório de Rede de Influenciadores\n\n";

    report += `## Influenciadores Conectados\n`;
    report += `- Total: ${influencers.length}\n`;

    const byTier = {
      mega: influencers.filter((i) => i.tier === "mega").length,
      macro: influencers.filter((i) => i.tier === "macro").length,
      micro: influencers.filter((i) => i.tier === "micro").length,
      nano: influencers.filter((i) => i.tier === "nano").length,
    };

    report += `- Mega: ${byTier.mega}\n`;
    report += `- Macro: ${byTier.macro}\n`;
    report += `- Micro: ${byTier.micro}\n`;
    report += `- Nano: ${byTier.nano}\n\n`;

    const totalFollowers = influencers.reduce((sum, i) => sum + i.followers, 0);
    report += `- Total de Seguidores: ${totalFollowers.toLocaleString("pt-BR")}\n\n`;

    report += `## Campanhas\n`;
    report += `- Total: ${campaigns.length}\n`;

    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
    report += `- Ativas: ${activeCampaigns}\n\n`;

    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalReach = campaigns.reduce((sum, c) => sum + c.metrics.reach, 0);
    const totalFollowersGenerated = campaigns.reduce((sum, c) => sum + c.metrics.followers, 0);

    report += `- Budget Total: R$ ${totalBudget.toLocaleString("pt-BR")}\n`;
    report += `- Reach Total: ${totalReach.toLocaleString("pt-BR")}\n`;
    report += `- Seguidores Gerados: ${totalFollowersGenerated.toLocaleString("pt-BR")}\n\n`;

    report += `## Viral Loops\n`;
    report += `- Total: ${loops.length}\n`;
    report += `- Ativos: ${loops.filter((l) => l.status === "active").length}\n\n`;

    loops.forEach((loop) => {
      report += `### ${loop.name}\n`;
      report += `- Descrição: ${loop.description}\n`;
      report += `- Amplificação Esperada: ${loop.expectedAmplification}x\n`;
    });

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}

/**
 * Otimiza rede de influenciadores
 */
export async function optimizeInfluencerNetwork(
  influencers: Influencer[],
  campaigns: InfluencerCampaign[]
): Promise<Influencer[]> {
  try {
    // Remover influenciadores com ROI negativo
    const optimized = influencers.filter((influencer) => influencer.roi > 0);

    // Aumentar comissão para top performers
    const topPerformers = optimized.sort((a, b) => b.roi - a.roi).slice(0, 5);
    topPerformers.forEach((inf) => {
      inf.commission += 2;
    });

    console.log(`✓ Rede otimizada: ${optimized.length} influenciadores ativos`);
    return optimized;
  } catch (error) {
    console.error("Erro ao otimizar rede:", error);
    return influencers;
  }
}
