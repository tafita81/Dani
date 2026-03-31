/**
 * Speech Synthesis Server-Side
 * Converte texto em áudio usando a API de síntese de fala do Manus
 */

import { ENV } from "./_core/env";
import { storagePut } from "./storage";

/**
 * Sintetizar texto em áudio
 */
export async function synthesizeText(text: string, language: string = "pt-BR"): Promise<string | null> {
  try {
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.error("[SpeechSynthesis] API não configurada");
      return null;
    }

    // Limpar texto
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\n+/g, " ")
      .replace(/[#\[\]()]/g, "")
      .trim();

    if (!cleanText) return null;

    console.log("[SpeechSynthesis] Sintetizando:", cleanText.substring(0, 50));

    // Chamar API de síntese de fala do Manus
    const response = await fetch(`${ENV.forgeApiUrl}/v1/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        text: cleanText,
        language,
        voice: "default",
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      console.error("[SpeechSynthesis] Erro da API:", response.status, response.statusText);
      return null;
    }

    // Obter áudio em buffer
    const audioBuffer = await response.arrayBuffer();
    console.log("[SpeechSynthesis] Áudio gerado:", audioBuffer.byteLength, "bytes");

    // Salvar em S3 com chave aleatória
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `audio/${Date.now()}-${randomSuffix}.mp3`;
    const result = await storagePut(fileKey, Buffer.from(audioBuffer), "audio/mpeg");
    const url = result.url;

    console.log("[SpeechSynthesis] Áudio salvo em:", url);
    return url as string;
  } catch (error) {
    console.error("[SpeechSynthesis] Erro ao sintetizar:", error);
    return null;
  }
}

/**
 * Endpoint para síntese de fala
 * POST /api/tts
 * Body: { text: string, language?: string }
 * Response: { audioUrl: string }
 */
export async function handleTextToSpeech(text: string, language: string = "pt-BR") {
  try {
    const audioUrl = await synthesizeText(text, language);

    if (!audioUrl) {
      return {
        success: false,
        error: "Falha ao gerar áudio",
      };
    }

    return {
      success: true,
      audioUrl,
    };
  } catch (error) {
    console.error("[SpeechSynthesis] Erro no handler:", error);
    return {
      success: false,
      error: "Erro ao processar síntese de fala",
    };
  }
}
