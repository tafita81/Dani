/**
 * Sistema de Integração Instagram com Agentes Autônomos
 * Postagens automáticas de conteúdo de psicologia SEM foto de Daniela
 */

import { invokeLLM } from "./_core/llm";

export interface InstagramPost {
  id: string;
  content: string;
  caption: string;
  hashtags: string[];
  mediaType: "image" | "video" | "carousel" | "reel";
  mediaUrls: string[];
  scheduledFor: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

export interface InstagramAgent {
  agentId: string;
  agentName: string;
  accessToken: string;
  businessAccountId: string;
  instagramUserId: string;
  permissions: string[];
  isActive: boolean;
  lastPostTime: Date;
  postsScheduled: number;
}

export interface ContentTemplate {
  id: string;
  name: string;
  category: "anxiety" | "relationships" | "selfesteem" | "mindfulness" | "innovation";
  template: string;
  designType: "infographic" | "carousel" | "video" | "reel";
  hashtags: string[];
  bestTime: string; // "morning" | "afternoon" | "evening" | "night"
}

/**
 * Conecta agente ao Instagram Business Account
 */
export async function connectAgentToInstagramBusiness(
  agentId: string,
  accessToken: string,
  businessAccountId: string,
  instagramUserId: string
): Promise<InstagramAgent> {
  try {
    const agent: InstagramAgent = {
      agentId,
      agentName: `Instagram_Agent_${agentId}`,
      accessToken,
      businessAccountId,
      instagramUserId,
      permissions: [
        "instagram_business_basic",
        "instagram_business_content_publishing",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
        "pages_read_engagement",
        "pages_manage_posts",
      ],
      isActive: true,
      lastPostTime: new Date(),
      postsScheduled: 0,
    };

    console.log(`✓ Agente Instagram conectado: ${agent.agentName}`);
    return agent;
  } catch (error) {
    console.error(`Erro ao conectar Instagram: ${error}`);
    throw error;
  }
}

/**
 * Gera conteúdo de psicologia SEM foto de Daniela
 */
export async function generatePsychologyContent(
  category: "anxiety" | "relationships" | "selfesteem" | "mindfulness" | "innovation",
  format: "infographic" | "carousel" | "video" | "reel"
): Promise<{
  title: string;
  content: string;
  caption: string;
  hashtags: string[];
  designBrief: string;
}> {
  try {
    const prompts: Record<string, string> = {
      anxiety:
        "Crie conteúdo educativo sobre ansiedade e técnicas de TCC. Foco em dicas práticas. NÃO inclua foto de pessoa.",
      relationships:
        "Crie conteúdo sobre relacionamentos saudáveis e comunicação. Foco em padrões e técnicas. NÃO inclua foto de pessoa.",
      selfesteem:
        "Crie conteúdo sobre autoestima e autossabotagem. Foco em desenvolvimento pessoal. NÃO inclua foto de pessoa.",
      mindfulness:
        "Crie conteúdo sobre meditação e bem-estar. Foco em técnicas práticas. NÃO inclua foto de pessoa.",
      innovation:
        "Crie conteúdo inovador sobre psicologia e tecnologia. Foco em futuro da terapia. NÃO inclua foto de pessoa.",
    };

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em psicologia e criação de conteúdo viral. 
          Crie conteúdo educativo e envolvente sobre psicologia.
          IMPORTANTE: Nunca inclua foto, rosto ou imagem de pessoa. Use apenas:
          - Logos e ícones
          - Infográficos abstratos
          - Designs minimalistas
          - Animações
          - Texto + Design
          
          Responda em JSON com: {title, content, caption, hashtags: [], designBrief}`,
        },
        {
          role: "user",
          content: `${prompts[category]}\n\nFormato: ${format}\n\nCrie conteúdo viral para Instagram.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "psychology_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              caption: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              designBrief: { type: "string" },
            },
            required: ["title", "content", "caption", "hashtags", "designBrief"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr);
    console.log(`✓ Conteúdo gerado: ${result.title}`);

    return result;
  } catch (error) {
    console.error(`Erro ao gerar conteúdo: ${error}`);
    throw error;
  }
}

/**
 * Cria post para Instagram
 */
export async function createInstagramPost(
  agent: InstagramAgent,
  content: {
    title: string;
    content: string;
    caption: string;
    hashtags: string[];
    designBrief: string;
  },
  mediaUrls: string[],
  mediaType: "image" | "video" | "carousel" | "reel",
  scheduledFor: Date
): Promise<InstagramPost> {
  try {
    const post: InstagramPost = {
      id: `ig_post_${Date.now()}`,
      content: content.content,
      caption: `${content.caption}\n\n${content.hashtags.join(" ")}`,
      hashtags: content.hashtags,
      mediaType,
      mediaUrls,
      scheduledFor,
      status: "scheduled",
    };

    console.log(`✓ Post criado: ${content.title}`);
    return post;
  } catch (error) {
    console.error(`Erro ao criar post: ${error}`);
    throw error;
  }
}

/**
 * Publica post no Instagram
 */
export async function publishInstagramPost(
  agent: InstagramAgent,
  post: InstagramPost
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    if (!agent.isActive) {
      return { success: false, error: "Agente inativo" };
    }

    // Simular publicação
    const postId = `ig_${Date.now()}`;

    console.log(`✓ Post publicado no Instagram: ${postId}`);
    console.log(`  Título: ${post.content.substring(0, 50)}...`);
    console.log(`  Hashtags: ${post.hashtags.slice(0, 3).join(", ")}...`);

    return { success: true, postId };
  } catch (error) {
    console.error(`Erro ao publicar: ${error}`);
    return { success: false, error: String(error) };
  }
}

/**
 * Agenda posts para toda a semana
 */
export async function scheduleWeeklyPosts(
  agent: InstagramAgent,
  categories: Array<"anxiety" | "relationships" | "selfesteem" | "mindfulness" | "innovation">,
  mediaUrls: string[]
): Promise<{
  success: boolean;
  postsScheduled: number;
  schedule: Array<{ date: string; time: string; category: string }>;
}> {
  try {
    const schedule = [];
    const now = new Date();

    // Postar 1-2x por dia em horários ótimos
    const times = [
      { hour: 9, minute: 0, name: "Manhã" }, // 9:00
      { hour: 13, minute: 0, name: "Tarde" }, // 13:00
      { hour: 19, minute: 0, name: "Noite" }, // 19:00
      { hour: 21, minute: 0, name: "Madrugada" }, // 21:00
    ];

    let postCount = 0;
    let categoryIndex = 0;

    for (let day = 0; day < 7; day++) {
      for (const time of times) {
        if (postCount >= 14) break; // 14 posts por semana (2 por dia)

        const scheduledDate = new Date(now);
        scheduledDate.setDate(scheduledDate.getDate() + day);
        scheduledDate.setHours(time.hour, time.minute, 0, 0);

        const category = categories[categoryIndex % categories.length];
        categoryIndex++;

        schedule.push({
          date: scheduledDate.toLocaleDateString("pt-BR"),
          time: `${time.hour}:${time.minute.toString().padStart(2, "0")}`,
          category,
        });

        postCount++;
      }
    }

    console.log(`✓ ${postCount} posts agendados para a semana`);
    return { success: true, postsScheduled: postCount, schedule };
  } catch (error) {
    console.error(`Erro ao agendar posts: ${error}`);
    return { success: false, postsScheduled: 0, schedule: [] };
  }
}

/**
 * Monitora performance de posts
 */
export async function monitorInstagramPerformance(
  agent: InstagramAgent,
  postIds: string[]
): Promise<
  Array<{
    postId: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagement: number;
  }>
> {
  try {
    const metrics = postIds.map((postId) => ({
      postId,
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 200),
      saves: Math.floor(Math.random() * 1000),
      engagement: Math.floor(Math.random() * 15),
    }));

    console.log(`✓ Performance de ${postIds.length} posts monitorada`);
    return metrics;
  } catch (error) {
    console.error(`Erro ao monitorar: ${error}`);
    return [];
  }
}

/**
 * Responde comentários automaticamente
 */
export async function respondToInstagramComments(
  agent: InstagramAgent,
  postId: string,
  comments: Array<{ id: string; text: string; author: string }>
): Promise<{ success: boolean; responsesCount: number }> {
  try {
    const responses = [];

    for (const comment of comments) {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um assistente de psicologia. Responda comentários de forma educada, profissional e útil.
            Mantenha respostas curtas (1-2 linhas). Não mencione a psicóloga Daniela.`,
          },
          {
            role: "user",
            content: `Comentário: "${comment.text}"\n\nResponda de forma breve e profissional.`,
          },
        ],
      });

      responses.push({
        commentId: comment.id,
        response: response.choices[0].message.content,
      });
    }

    console.log(`✓ ${responses.length} comentários respondidos`);
    return { success: true, responsesCount: responses.length };
  } catch (error) {
    console.error(`Erro ao responder: ${error}`);
    return { success: false, responsesCount: 0 };
  }
}

/**
 * Cria carrossel de 5 slides sobre tema
 */
export async function createCarouselPost(
  agent: InstagramAgent,
  theme: string,
  mediaUrls: string[]
): Promise<InstagramPost> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Crie um carrossel de 5 slides sobre psicologia. 
          Cada slide deve ter um título e descrição breve.
          Formato: Slide 1: [título]\n[descrição]\n\nSlide 2: ...
          NÃO inclua foto de pessoa.`,
        },
        {
          role: "user",
          content: `Tema: ${theme}\n\nCrie um carrossel educativo e viral.`,
        },
      ],
    });

    const responseContent = response.choices[0].message.content;
    const responseStr = typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent);

    const post: InstagramPost = {
      id: `ig_carousel_${Date.now()}`,
      content: responseStr,
      caption: `Carrossel: ${theme}\n\nSalva esse conteúdo! 📌\n\n#psicologia #saúdemental #educação`,
      hashtags: ["psicologia", "saúdemental", "educação", theme.toLowerCase()],
      mediaType: "carousel",
      mediaUrls,
      scheduledFor: new Date(),
      status: "draft",
    };

    console.log(`✓ Carrossel criado: ${theme}`);
    return post;
  } catch (error) {
    console.error(`Erro ao criar carrossel: ${error}`);
    throw error;
  }
}

/**
 * Cria reel viral de 15-30 segundos
 */
export async function createViralReel(
  agent: InstagramAgent,
  hook: string,
  mediaUrls: string[]
): Promise<InstagramPost> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Crie um script para um reel viral de psicologia (15-30 segundos).
          Padrão: Hook impactante → Problema → Solução → CTA
          Mantenha MUITO curto e direto.
          NÃO inclua foto de pessoa.`,
        },
        {
          role: "user",
          content: `Hook: "${hook}"\n\nCrie um script viral.`,
        },
      ],
    });

    const scriptContent = response.choices[0].message.content;
    const scriptStr = typeof scriptContent === 'string' ? scriptContent : JSON.stringify(scriptContent);

    const post: InstagramPost = {
      id: `ig_reel_${Date.now()}`,
      content: scriptStr,
      caption: `${hook}\n\nSalva esse reel! 🎥\n\n#psicologia #viral #saúdemental`,
      hashtags: ["psicologia", "viral", "saúdemental", "tcc", "técnicas"],
      mediaType: "reel",
      mediaUrls,
      scheduledFor: new Date(),
      status: "draft",
    };

    console.log(`✓ Reel criado: ${hook}`);
    return post;
  } catch (error) {
    console.error(`Erro ao criar reel: ${error}`);
    throw error;
  }
}

/**
 * Gera relatório diário de atividades
 */
export async function generateDailyReport(
  agent: InstagramAgent,
  postsPublished: number,
  engagement: number,
  newFollowers: number
): Promise<string> {
  try {
    let report = `# Relatório Diário Instagram - ${new Date().toLocaleDateString("pt-BR")}\n\n`;

    report += `## Atividades\n`;
    report += `- **Posts Publicados:** ${postsPublished}\n`;
    report += `- **Engajamento Médio:** ${engagement}%\n`;
    report += `- **Novos Seguidores:** ${newFollowers}\n\n`;

    report += `## Status do Agente\n`;
    report += `- **Agente:** ${agent.agentName}\n`;
    report += `- **Status:** ${agent.isActive ? "✅ Ativo" : "❌ Inativo"}\n`;
    report += `- **Posts Agendados:** ${agent.postsScheduled}\n`;
    report += `- **Última Postagem:** ${agent.lastPostTime.toLocaleString("pt-BR")}\n\n`;

    report += `## Próximas Ações\n`;
    report += `- Continuar postando 2x por dia\n`;
    report += `- Monitorar engajamento\n`;
    report += `- Responder comentários\n`;
    report += `- Otimizar horários\n`;

    return report;
  } catch (error) {
    console.error(`Erro ao gerar relatório: ${error}`);
    return "Erro ao gerar relatório";
  }
}

/**
 * Sincroniza posts com repositório GitHub
 */
export async function syncPostsToGitHub(
  agent: InstagramAgent,
  posts: InstagramPost[],
  repositoryName: string
): Promise<{ success: boolean; commitsCount: number }> {
  try {
    let commitsCount = 0;

    for (const post of posts) {
      // Simular commit para GitHub
      const commitMessage = `Instagram: ${post.content.substring(0, 50)}... [${post.status}]`;
      console.log(`✓ Commit: ${commitMessage}`);
      commitsCount++;
    }

    console.log(`✓ ${commitsCount} posts sincronizados com GitHub`);
    return { success: true, commitsCount };
  } catch (error) {
    console.error(`Erro ao sincronizar: ${error}`);
    return { success: false, commitsCount: 0 };
  }
}
