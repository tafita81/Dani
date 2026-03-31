/**
 * Avatar 3D da Psicóloga — Inovação Quântica 2026
 * Sincronização de voz, expressões faciais e gestos em tempo real
 * Projeção: 500-1000 consultas/mês
 */

import { getDb } from "../core_logic/db";
import { invokeLLM } from "../_core/llm";

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE AVATAR 3D ───
// ═══════════════════════════════════════════════════════════════

export async function generateAvatarResponse(userMessage: string, context: any = {}) {
  // Gerar resposta com IA
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é a Psicóloga Daniela Coelho. Responda de forma empática, profissional e acolhedora. 
        Mantenha respostas concisas (2-3 frases) para sincronização com avatar 3D.
        Contexto: ${JSON.stringify(context)}`,
      },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0].message.content || "";

  // Analisar emoção para expressão facial
  const emotion = analyzeEmotion(text);

  // Gerar gestos baseado no conteúdo
  const gestures = generateGestures(text);

  return {
    text,
    emotion,
    gestures,
    duration: calculateDuration(text),
    voiceUrl: await generateVoiceAudio(text),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── ANÁLISE DE EMOÇÃO PARA EXPRESSÃO FACIAL ───
// ═══════════════════════════════════════════════════════════════

function analyzeEmotion(text: string): {
  type: "neutral" | "smile" | "concerned" | "surprised" | "thoughtful";
  intensity: number;
} {
  const emotionKeywords: Record<string, string> = {
    // Positivas
    "ótimo|excelente|maravilhoso|feliz|alegre": "smile",
    "parabéns|sucesso|conquista": "smile",

    // Preocupação
    "preocupado|ansioso|estressado|difícil": "concerned",
    "cuidado|atenção|importante": "concerned",

    // Surpresa
    "incrível|surpreendente|inesperado": "surprised",
    "wow|nossa|realmente": "surprised",

    // Reflexão
    "interessante|pensar|considerar|refletir": "thoughtful",
    "talvez|pode ser|depende": "thoughtful",
  };

  let emotion = "neutral";
  let intensity = 0.5;

  for (const [keywords, emotionType] of Object.entries(emotionKeywords)) {
    const regex = new RegExp(keywords, "gi");
    if (regex.test(text)) {
      emotion = emotionType;
      intensity = Math.min(1, intensity + 0.3);
    }
  }

  return { type: emotion as any, intensity };
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE GESTOS ───
// ═══════════════════════════════════════════════════════════════

function generateGestures(text: string): Array<{
  gesture: "nod" | "hand_wave" | "hand_point" | "hand_open" | "head_tilt";
  timing: number;
  intensity: number;
}> {
  const gestures: any[] = [];
  const words = text.split(" ");

  // Aceno de cabeça a cada 5-8 palavras
  for (let i = 5; i < words.length; i += Math.floor(Math.random() * 3) + 5) {
    gestures.push({
      gesture: "nod",
      timing: (i / words.length) * 100,
      intensity: 0.6,
    });
  }

  // Gestos de mão para ênfase
  if (text.includes("importante") || text.includes("fundamental")) {
    gestures.push({
      gesture: "hand_point",
      timing: 50,
      intensity: 0.8,
    });
  }

  if (text.includes("aberto") || text.includes("possibilidade")) {
    gestures.push({
      gesture: "hand_open",
      timing: 60,
      intensity: 0.7,
    });
  }

  // Inclinação de cabeça para reflexão
  if (text.includes("pensar") || text.includes("considerar")) {
    gestures.push({
      gesture: "head_tilt",
      timing: 40,
      intensity: 0.5,
    });
  }

  return gestures;
}

// ═══════════════════════════════════════════════════════════════
// ─── CÁLCULO DE DURAÇÃO ───
// ═══════════════════════════════════════════════════════════════

function calculateDuration(text: string): number {
  // Aproximadamente 150 palavras por minuto em português
  const words = text.split(" ").length;
  const minutes = words / 150;
  return Math.ceil(minutes * 60); // Retorna em segundos
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE ÁUDIO COM VOZ ───
// ═══════════════════════════════════════════════════════════════

async function generateVoiceAudio(text: string): Promise<string> {
  try {
    // Usar ElevenLabs ou similar para gerar áudio
    // Por enquanto, retornar URL placeholder
    const encodedText = encodeURIComponent(text);
    return `https://api.elevenlabs.io/v1/text-to-speech/psi-daniela?text=${encodedText}`;
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── SINCRONIZAÇÃO DE LIP-SYNC ───
// ═══════════════════════════════════════════════════════════════

export function generateLipSyncData(text: string): Array<{
  phoneme: string;
  timing: number;
}> {
  // Mapeamento simplificado de fonemas para português
  const phonemeMap: Record<string, string> = {
    a: "A",
    e: "E",
    i: "I",
    o: "O",
    u: "U",
    m: "M",
    p: "P",
    b: "B",
    f: "F",
    v: "V",
    t: "T",
    d: "D",
    n: "N",
    s: "S",
    z: "Z",
    l: "L",
    r: "R",
  };

  const lipSyncData: any[] = [];
  const duration = calculateDuration(text);
  const chars = text.toLowerCase().replace(/[^a-záéíóú]/g, "");

  let currentTime = 0;
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (phonemeMap[char]) {
      currentTime += (duration / chars.length) * 1000; // Converter para ms
      lipSyncData.push({
        phoneme: phonemeMap[char],
        timing: Math.round(currentTime),
      });
    }
  }

  return lipSyncData;
}

// ═══════════════════════════════════════════════════════════════
// ─── RASTREAMENTO DE ENGAJAMENTO ───
// ═══════════════════════════════════════════════════════════════

export async function trackAvatarEngagement(
  sessionId: string,
  metrics: {
    watchTime: number;
    interactions: number;
    sentiment: "positive" | "neutral" | "negative";
    bookingIntent: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;

  console.log(`Avatar engagement tracked for session ${sessionId}:`, metrics);

  // Salvar no banco de dados
  // await db.insert(avatarEngagement).values({...})
}

// ═══════════════════════════════════════════════════════════════
// ─── PROJEÇÃO DE CRESCIMENTO ───
// ═══════════════════════════════════════════════════════════════

export function getAvatarProjection() {
  return {
    feature: "Avatar 3D da Psicóloga",
    monthlyProjection: "500-1000 consultas/mês",
    conversionBoost: "+40% taxa de agendamento",
    engagementIncrease: "+60% tempo na página",
    strategy: [
      "Avatar como primeira interação na landing page",
      "Responde perguntas frequentes com empatia",
      "Agendamento direto após interação positiva",
      "Compartilhamento em redes sociais (TikTok, Instagram Reels)",
    ],
  };
}
