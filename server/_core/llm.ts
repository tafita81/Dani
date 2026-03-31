/**
 * llm.ts — Substitui Manus Built-in LLM por OpenAI
 * Interface compatível com o código existente
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

// ── Chat simples ─────────────────────────────────────────────
export async function chat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1000,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ── Análise clínica (resumo de sessão) ───────────────────────
export async function analyzeClinicalSession(sessionNotes: string): Promise<{
  summary: string;
  keyThemes: string[];
  suggestedInterventions: string[];
  nextSteps: string;
}> {
  const response = await chat([
    {
      role: "system",
      content: `Você é um assistente clínico especializado em psicologia.
Analise as notas de sessão fornecidas e retorne um JSON com:
- summary: resumo objetivo da sessão (2-3 frases)
- keyThemes: lista de temas principais identificados (array de strings)
- suggestedInterventions: intervenções terapêuticas sugeridas (array de strings)
- nextSteps: próximos passos recomendados (string)
Responda APENAS com JSON válido, sem markdown.`,
    },
    {
      role: "user",
      content: `Notas da sessão:\n${sessionNotes}`,
    },
  ]);

  try {
    return JSON.parse(response);
  } catch {
    return {
      summary: response,
      keyThemes: [],
      suggestedInterventions: [],
      nextSteps: "",
    };
  }
}

// ── Assistente clínico em tempo real ─────────────────────────
export async function clinicalAssistant(
  input: string,
  context: {
    patientHistory?: string;
    sessionTranscript?: string;
    approach?: string;
  }
): Promise<string> {
  const systemPrompt = `Você é o Assistente Clínico da Psicóloga Daniela Coelho.
Abordagem terapêutica principal: ${context.approach ?? "TCC"}.
${context.patientHistory ? `Histórico do paciente: ${context.patientHistory}` : ""}
${context.sessionTranscript ? `Transcrição atual: ${context.sessionTranscript}` : ""}

Forneça sugestões breves, práticas e baseadas em evidências.
Seja conciso e direto.`;

  return await chat([
    { role: "system", content: systemPrompt },
    { role: "user", content: input },
  ]);
}

// ── Assistente de carro ───────────────────────────────────────
export async function carAssistant(
  input: string,
  context?: { location?: string; vehicleInfo?: string }
): Promise<string> {
  const systemPrompt = `Você é um assistente inteligente para motoristas.
${context?.location ? `Localização atual: ${context.location}` : ""}
${context?.vehicleInfo ? `Veículo: ${context.vehicleInfo}` : ""}

Responda de forma clara e segura. Se a pergunta envolver segurança no trânsito,
priorize sempre a segurança. Seja breve pois o usuário pode estar dirigindo.`;

  return await chat([
    { role: "system", content: systemPrompt },
    { role: "user", content: input },
  ]);
}

// ── Detecção de emoção ────────────────────────────────────────
export async function detectEmotion(text: string): Promise<{
  emotion: string;
  intensity: number;
  sentiment: "positive" | "negative" | "neutral";
}> {
  const response = await chat(
    [
      {
        role: "system",
        content: `Analise o texto e retorne JSON com:
- emotion: emoção principal detectada (string em português)
- intensity: intensidade de 0 a 1 (número)
- sentiment: "positive", "negative" ou "neutral"
Responda APENAS com JSON válido.`,
      },
      { role: "user", content: text },
    ],
    { temperature: 0.3 }
  );

  try {
    return JSON.parse(response);
  } catch {
    return { emotion: "neutro", intensity: 0.5, sentiment: "neutral" };
  }
}

// ── Geração de conteúdo (growth engine) ──────────────────────
export async function generateContent(prompt: string, style?: string): Promise<string> {
  return await chat(
    [
      {
        role: "system",
        content: `Você é um especialista em criação de conteúdo para redes sociais.
${style ? `Estilo: ${style}` : "Estilo: educativo, empático, profissional"}
Crie conteúdo engajante e autêntico.`,
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.9 }
  );
}

// ── Health check do LLM ───────────────────────────────────────
export async function checkLLMHealth(): Promise<boolean> {
  try {
    await chat([{ role: "user", content: "ping" }], { maxTokens: 5 });
    return true;
  } catch {
    return false;
  }
}
