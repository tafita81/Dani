/**
 * Instagram Manager — Gestão completa de conteúdo, analytics e otimização
 * Integração com Instagram Graph API e IA para automação de agentes Manus
 */

import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { instagramPosts, instagramAnalytics, instagramReels, instagramStories } from "../drizzle/schema";
import { eq, gte, lte, and } from "drizzle-orm";

export interface InstagramConfig {
  accessToken: string;
  businessAccountId: string;
  instagramUserId: string;
}

// ═══════════════════════════════════════════════════════════════
// ─── GESTÃO DE POSTS ───
// ═══════════════════════════════════════════════════════════════

export async function createPost(
  userId: number,
  data: {
    caption: string;
    content: string;
    mediaUrls: string[];
    mediaType: "image" | "video" | "carousel" | "reel" | "story";
    hashtags?: string;
    mentions?: string;
    callToAction?: string;
    scheduledFor?: Date;
    theme?: string;
    contentType: "educational" | "testimonial" | "promotional" | "behind_the_scenes" | "interactive" | "motivational";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar sugestões de IA para otimização
  const aiSuggestions = await generateAIOptimizations(data.caption, data.contentType);

  // Calcular melhor horário para publicar
  const bestTimeToPost = await calculateBestTimeToPost(userId);

  const post = await db.insert(instagramPosts).values({
    userId,
    caption: data.caption,
    content: data.content,
    mediaUrls: data.mediaUrls,
    mediaType: data.mediaType,
    hashtags: data.hashtags || "",
    mentions: data.mentions || "",
    callToAction: data.callToAction,
    scheduledFor: data.scheduledFor,
    theme: data.theme,
    contentType: data.contentType,
    status: data.scheduledFor ? "scheduled" : "draft",
    aiOptimizationScore: aiSuggestions.score,
    aiSuggestions: aiSuggestions.suggestions,
    bestTimeToPost,
  });

  return post;
}

export async function updatePost(
  userId: number,
  postId: number,
  data: Partial<{
    caption: string;
    content: string;
    mediaUrls: string[];
    hashtags: string;
    mentions: string;
    callToAction: string;
    scheduledFor: Date;
    status: "draft" | "scheduled" | "published" | "archived";
    aiOptimizationScore?: number;
    aiSuggestions?: any[];
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Se atualizou caption, regenerar sugestões IA
  if (data.caption) {
    const posts = await db.select().from(instagramPosts).where(and(eq(instagramPosts.id, postId), eq(instagramPosts.userId, userId))).limit(1);
    const post = posts[0];
    if (post) {
      const aiSuggestions = await generateAIOptimizations(data.caption, post.contentType);
      (data as any).aiOptimizationScore = aiSuggestions.score;
      (data as any).aiSuggestions = aiSuggestions.suggestions;
    }
  }

  return await db.update(instagramPosts)
    .set(data)
    .where(and(eq(instagramPosts.id, postId), eq(instagramPosts.userId, userId)));
}

export async function publishPost(userId: number, postId: number, config: InstagramConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const posts = await db.select().from(instagramPosts).where(and(eq(instagramPosts.id, postId), eq(instagramPosts.userId, userId))).limit(1);
  const post = posts[0];
  if (!post) throw new Error("Post não encontrado");

  try {
    // Publicar no Instagram via Graph API
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${config.businessAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: post.mediaType === "carousel" ? "CAROUSEL" : post.mediaType.toUpperCase(),
          caption: post.caption,
          access_token: config.accessToken,
        }),
      }
    );

    if (!response.ok) throw new Error("Falha ao publicar no Instagram");

    const result = (await response.json()) as { id: string };

    // Atualizar post com ID do Instagram
    await db.update(instagramPosts)
      .set({
        instagramPostId: result.id,
        publishedAt: new Date(),
        status: "published",
      })
      .where(and(eq(instagramPosts.id, postId), eq(instagramPosts.userId, userId)));

    return result;
  } catch (error) {
    console.error("[Instagram] Erro ao publicar:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── ANALYTICS E OTIMIZAÇÃO ───
// ═══════════════════════════════════════════════════════════════

export async function generateAIOptimizations(
  caption: string,
  contentType: string
): Promise<{ score: number; suggestions: any[] }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em Instagram e crescimento de contas. 
Analise o caption e forneça sugestões de otimização para maximizar engagement, alcance e conversão.
Considere o tipo de conteúdo: ${contentType}`,
        },
        {
          role: "user",
          content: `Analise este caption e forneça sugestões de otimização:

"${caption}"

Forneça:
1. Score de otimização (0-100)
2. Sugestões específicas de melhoria
3. Hashtags recomendadas
4. Melhor horário para postar
5. Público-alvo sugerido`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "instagram_optimization",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: { type: "number", description: "Score de 0-100" },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "Sugestões de melhoria",
              },
              hashtags: { type: "string", description: "Hashtags recomendadas" },
              bestTimeToPost: { type: "string", description: "Melhor horário (ex: 19:00)" },
              targetAudience: { type: "string", description: "Público-alvo sugerido" },
            },
            required: ["score", "suggestions", "hashtags", "bestTimeToPost", "targetAudience"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      score: parsed.score,
      suggestions: [
        ...parsed.suggestions,
        { type: "hashtags", value: parsed.hashtags },
        { type: "bestTimeToPost", value: parsed.bestTimeToPost },
        { type: "targetAudience", value: parsed.targetAudience },
      ],
    };
  } catch (error) {
    console.error("[Instagram AI] Erro ao gerar otimizações:", error);
    return { score: 50, suggestions: [] };
  }
}

export async function calculateBestTimeToPost(userId: number): Promise<string> {
  // Analisar histórico de posts e engagement
  const db = await getDb();
  if (!db) return "19:00";

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentPosts = await db.select().from(instagramPosts)
    .where(and(eq(instagramPosts.userId, userId), gte(instagramPosts.publishedAt, thirtyDaysAgo)))
    .orderBy(instagramPosts.publishedAt)
    .limit(20);

  if (recentPosts.length === 0) return "19:00"; // Default

  // Calcular horário com melhor engagement
  const hourlyEngagement: { [hour: string]: number } = {};

  for (const post of recentPosts) {
    if (post.publishedAt) {
      const hour = new Date(post.publishedAt).getHours().toString().padStart(2, "0");
      const engagement = (post.likes ?? 0) + (post.comments ?? 0) * 2 + (post.saves ?? 0) * 3;
      hourlyEngagement[hour] = (hourlyEngagement[hour] || 0) + engagement;
    }
  }

  const bestHour = Object.entries(hourlyEngagement).sort(([, a], [, b]) => b - a)[0]?.[0] || "19";
  return `${bestHour}:00`;
}

export async function syncInstagramAnalytics(userId: number, config: InstagramConfig) {
  try {
    // Buscar insights da conta do Instagram
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${config.businessAccountId}/insights?metric=impressions,reach,profile_views,follower_count&period=day&access_token=${config.accessToken}`
    );

    if (!response.ok) throw new Error("Falha ao buscar analytics");

    const data = (await response.json()) as any;

    // Processar e salvar analytics
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const analytics = {
      userId,
      followers: data.follower_count || 0,
      totalReach: data.reach || 0,
      totalImpressions: data.impressions || 0,
      period: "daily" as const,
      periodDate: new Date(),
    };

    await db.insert(instagramAnalytics).values(analytics);

    return analytics;
  } catch (error) {
    console.error("[Instagram] Erro ao sincronizar analytics:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── ESTRATÉGIA DE CRESCIMENTO ───
// ═══════════════════════════════════════════════════════════════

export async function generateGrowthStrategy(userId: number) {
  try {
    // Analisar dados atuais
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const recentAnalytics = await db.select().from(instagramAnalytics)
      .where(eq(instagramAnalytics.userId, userId))
      .orderBy(instagramAnalytics.periodDate)
      .limit(30);

    const recentPosts = await db.select().from(instagramPosts)
      .where(and(eq(instagramPosts.userId, userId), eq(instagramPosts.status, "published")))
      .orderBy(instagramPosts.publishedAt)
      .limit(20);

    const avgEngagement =
      recentPosts.reduce((sum: number, p: any) => sum + ((p.likes ?? 0) + (p.comments ?? 0)), 0) / recentPosts.length || 0;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em crescimento de Instagram para psicólogos e terapeutas.
Analise os dados e forneça uma estratégia completa de crescimento focando em:
- Aumento de seguidores
- Aumento de engagement
- Monetização (Reels, Super Likes, etc.)
- Posicionamento de marca`,
        },
        {
          role: "user",
          content: `Dados atuais:
- Followers: ${recentAnalytics[0]?.followers || 0}
- Engagement médio por post: ${avgEngagement.toFixed(0)}
- Posts publicados: ${recentPosts.length}
- Tipo de conteúdo: Psicologia, Terapia, Bem-estar

Forneça uma estratégia de crescimento completa com ações específicas.`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("[Instagram] Erro ao gerar estratégia:", error);
    throw error;
  }
}

export async function generateContentIdeas(userId: number, theme: string) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criação de conteúdo para Instagram para psicólogos.
Gere ideias criativas, engajantes e que sigam as melhores práticas de crescimento.`,
        },
        {
          role: "user",
          content: `Gere 10 ideias de posts para o tema: "${theme}"
Para cada ideia, forneça:
- Tipo de conteúdo (educacional, testimonial, etc.)
- Descrição breve
- Hashtags sugeridas
- Melhor horário para postar`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("[Instagram] Erro ao gerar ideias:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── AGENDAMENTO AUTOMÁTICO ───
// ═══════════════════════════════════════════════════════════════

export async function schedulePostsForWeek(userId: number, config: InstagramConfig) {
  try {
    // Buscar posts agendados para a semana
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const scheduledPosts = await db.select().from(instagramPosts)
      .where(and(
        eq(instagramPosts.userId, userId),
        eq(instagramPosts.status, "scheduled"),
        gte(instagramPosts.scheduledFor, weekStart),
        lte(instagramPosts.scheduledFor, weekEnd)
      ))
      .orderBy(instagramPosts.scheduledFor);

    // Publicar posts no horário agendado
    for (const post of scheduledPosts) {
      if (post.scheduledFor && new Date(post.scheduledFor) <= new Date()) {
        await publishPost(userId, post.id, config);
      }
    }

    return (scheduledPosts as any[]).length;
  } catch (error) {
    console.error("[Instagram] Erro ao agendar posts:", error);
    throw error;
  }
}
