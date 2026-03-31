/**
 * Text-to-Speech Simples
 * Usa Google Translate API para gerar áudio
 */

import { storagePut } from "../core_logic/storage";

/**
 * Gerar áudio usando Google Translate TTS
 */
export async function generateAudioUrl(text: string, language: string = "pt-BR"): Promise<string | null> {
  try {
    // Limpar texto
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\n+/g, " ")
      .replace(/[#\[\]()]/g, "")
      .trim();

    if (!cleanText) return null;

    console.log("[TTS] Gerando áudio para:", cleanText.substring(0, 50));

    // Usar Google Translate TTS (sem API key necessária)
    // URL: https://translate.google.com/translate_tts?ie=UTF-8&q=TEXTO&tl=pt&client=tw-ob
    const langCode = language === "pt-BR" ? "pt" : language;
    const encodedText = encodeURIComponent(cleanText);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;

    console.log("[TTS] URL gerada:", ttsUrl.substring(0, 80));

    // Baixar áudio
    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error("[TTS] Erro ao baixar áudio:", response.status);
      return null;
    }

    // Obter buffer de áudio
    const audioBuffer = await response.arrayBuffer();
    console.log("[TTS] Áudio baixado:", audioBuffer.byteLength, "bytes");

    if (audioBuffer.byteLength < 1000) {
      console.error("[TTS] Áudio muito pequeno, pode ser erro");
      return null;
    }

    // Salvar em S3
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileKey = `audio/${Date.now()}-${randomSuffix}.mp3`;
    const result = await storagePut(fileKey, Buffer.from(audioBuffer), "audio/mpeg");
    const url = result.url;

    console.log("[TTS] Áudio salvo em S3:", url);
    return url as string;
  } catch (error) {
    console.error("[TTS] Erro ao gerar áudio:", error);
    return null;
  }
}
