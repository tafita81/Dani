/**
 * Podcast/Audiobook IA — Inovação Quântica 2026
 * Geração automática de conteúdo de áudio para psicologia
 * Projeção: 200-500 consultas/mês
 */

import { invokeLLM } from "./_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE SCRIPT DE PODCAST ───
// ═══════════════════════════════════════════════════════════════

export async function generatePodcastScript(topic: string, duration: "5min" | "15min" | "30min" = "15min") {
  const wordCount = duration === "5min" ? 600 : duration === "15min" ? 1800 : 3600;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um roteirista de podcast especializado em psicologia clínica.
        Crie um script de podcast envolvente, educativo e inspirador sobre o tema.
        Duração: ${duration}
        Palavras aproximadas: ${wordCount}
        
        Estrutura:
        1. Introdução (30 segundos)
        2. Gancho/Problema (1 minuto)
        3. Desenvolvimento (principal)
        4. Dica Prática (1 minuto)
        5. Conclusão (30 segundos)
        
        Inclua pausas naturais [PAUSA] para respiração.
        Tom: Acolhedor, profissional, empático.`,
      },
      { role: "user", content: `Crie um podcast sobre: ${topic}` },
    ],
  });

  const script = response.choices[0].message.content || "";

  return {
    topic,
    duration,
    script,
    wordCount: script.split(" ").length,
    estimatedDuration: calculateAudioDuration(script),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE AUDIOBOOK IA ───
// ═══════════════════════════════════════════════════════════════

export async function generateAudiobookChapter(
  bookTitle: string,
  chapterNumber: number,
  topic: string
): Promise<{
  chapterTitle: string;
  script: string;
  audioUrl: string;
  duration: number;
}> {
  // Gerar script do capítulo
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um autor de audiobooks sobre psicologia clínica.
        Escreva o capítulo ${chapterNumber} do livro "${bookTitle}".
        
        Requisitos:
        - Duração: 10-15 minutos de áudio
        - Tom: Narrativo, envolvente, educativo
        - Inclua exemplos práticos e casos reais
        - Finalize com reflexão para o leitor
        - Use [PAUSA] para respiração natural`,
      },
      { role: "user", content: `Capítulo ${chapterNumber}: ${topic}` },
    ],
  });

  const script = response.choices[0].message.content || "";
  const duration = calculateAudioDuration(script);

  return {
    chapterTitle: `Capítulo ${chapterNumber}: ${topic}`,
    script,
    audioUrl: await generateAudioFromScript(script, `${bookTitle}-cap${chapterNumber}`),
    duration,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE ÁUDIO ───
// ═══════════════════════════════════════════════════════════════

async function generateAudioFromScript(script: string, filename: string): Promise<string> {
  try {
    // Usar ElevenLabs ou similar
    // Por enquanto, retornar URL placeholder
    return `https://audio.assistenteclinico.com/${filename}.mp3`;
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── CÁLCULO DE DURAÇÃO ───
// ═══════════════════════════════════════════════════════════════

function calculateAudioDuration(script: string): number {
  // Aproximadamente 150 palavras por minuto em português
  const words = script.split(" ").length;
  const minutes = words / 150;
  return Math.ceil(minutes);
}

// ═══════════════════════════════════════════════════════════════
// ─── SÉRIE DE PODCASTS TEMÁTICOS ───
// ═══════════════════════════════════════════════════════════════

export async function generatePodcastSeries(
  theme: "anxiety" | "depression" | "relationships" | "selfesteem" | "trauma",
  episodeCount: number = 10
) {
  const themes: Record<string, string[]> = {
    anxiety: [
      "O que é ansiedade e como reconhecer",
      "Técnicas de respiração para controlar crises",
      "Pensamentos catastróficos: como lidar",
      "Ansiedade social: estratégias práticas",
      "Insônia e ansiedade: a conexão",
      "Exercício físico como tratamento",
      "Alimentação e ansiedade",
      "Meditação e mindfulness",
      "Quando procurar ajuda profissional",
      "Histórias de sucesso: superando a ansiedade",
    ],
    depression: [
      "Entendendo a depressão",
      "Sinais de alerta que não devem ser ignorados",
      "Ativação comportamental",
      "Pensamentos depressivos: como questionar",
      "Rotina e estrutura no tratamento",
      "Suporte social e conexão",
      "Medicação e psicoterapia",
      "Autocuidado em tempos difíceis",
      "Recuperação é possível",
      "Prevenção de recaídas",
    ],
    relationships: [
      "Comunicação efetiva em relacionamentos",
      "Resolvendo conflitos com empatia",
      "Limites saudáveis",
      "Ciúmes e insegurança",
      "Intimidade e vulnerabilidade",
      "Relacionamentos tóxicos: reconhecer e sair",
      "Reconstruindo confiança",
      "Amor próprio antes de amar outro",
      "Relacionamentos à distância",
      "Quando terminar é a melhor opção",
    ],
    selfesteem: [
      "Autoestima: o que realmente é",
      "Identificando crenças limitantes",
      "Autocrítica vs autocompaixão",
      "Comparação social nas redes",
      "Aceitando imperfeições",
      "Desenvolvendo resiliência",
      "Celebrando pequenas vitórias",
      "Afirmações positivas que funcionam",
      "Imagem corporal e aceitação",
      "Jornada de autoaceitação",
    ],
    trauma: [
      "O que é trauma psicológico",
      "Reconhecendo sintomas de TEPT",
      "Segurança emocional primeiro",
      "Técnicas de regulação do sistema nervoso",
      "Processando memórias traumáticas",
      "Reconstruindo a confiança",
      "Ressignificando experiências",
      "Apoio profissional e grupos",
      "Jornada de cura",
      "Transformando trauma em força",
    ],
  };

  const episodes = themes[theme].slice(0, episodeCount);
  const series = [];

  for (let i = 0; i < episodes.length; i++) {
    const script = await generatePodcastScript(episodes[i], "15min");
    series.push({
      episode: i + 1,
      title: episodes[i],
      script: script.script,
      duration: script.estimatedDuration,
    });
  }

  return {
    theme,
    totalEpisodes: series.length,
    episodes: series,
    totalDuration: series.reduce((sum, ep) => sum + ep.duration, 0),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── ANÁLISE DE ENGAJAMENTO ───
// ═══════════════════════════════════════════════════════════════

export async function analyzePodcastEngagement(
  podcastId: string,
  metrics: {
    listens: number;
    completionRate: number;
    shares: number;
    comments: number;
  }
) {
  return {
    podcastId,
    metrics,
    engagement: calculateEngagementScore(metrics),
    insights: generateEngagementInsights(metrics),
    recommendations: getOptimizationRecommendations(metrics),
  };
}

function calculateEngagementScore(metrics: any): number {
  return (metrics.completionRate * 0.4 + (metrics.shares / metrics.listens) * 100 * 0.3 + (metrics.comments / metrics.listens) * 100 * 0.3) / 100;
}

function generateEngagementInsights(metrics: any): string[] {
  const insights: string[] = [];

  if (metrics.completionRate > 0.8) {
    insights.push("Excelente taxa de conclusão! Conteúdo muito envolvente.");
  }

  if (metrics.shares > metrics.listens * 0.1) {
    insights.push("Alto compartilhamento. Conteúdo viral em potencial.");
  }

  if (metrics.comments > 0) {
    insights.push("Comunidade engajada. Considere responder aos comentários.");
  }

  return insights;
}

function getOptimizationRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];

  if (metrics.completionRate < 0.6) {
    recommendations.push("Considere encurtar episódios ou melhorar o gancho inicial");
  }

  if (metrics.shares < metrics.listens * 0.05) {
    recommendations.push("Adicione CTAs para compartilhamento no final do episódio");
  }

  if (metrics.comments === 0) {
    recommendations.push("Faça perguntas diretas para estimular comentários");
  }

  return recommendations;
}

// ═══════════════════════════════════════════════════════════════
// ─── PROJEÇÃO DE CRESCIMENTO ───
// ═══════════════════════════════════════════════════════════════

export function getPodcastProjection() {
  return {
    feature: "Podcast/Audiobook IA",
    monthlyProjection: "200-500 consultas/mês",
    strategy: [
      "Publicar 2-3 episódios por semana",
      "Distribuir em Spotify, Apple Podcasts, YouTube",
      "Criar série temática (Ansiedade, Depressão, Relacionamentos)",
      "Incluir CTA para agendamento no final de cada episódio",
      "Compartilhar clipes em TikTok e Instagram Reels",
    ],
    contentIdeas: [
      "Histórias de pacientes (anonimizadas)",
      "Técnicas práticas de psicologia",
      "Entrevistas com outros psicólogos",
      "Q&A respondendo perguntas de ouvintes",
      "Meditações guiadas",
    ],
  };
}
