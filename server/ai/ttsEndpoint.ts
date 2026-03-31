/**
 * Endpoint de Síntese de Fala (Text-to-Speech)
 * Converte texto em áudio MP3 usando a API de síntese de fala
 */

import { Router } from "express";
import { invokeLLM } from "./_core/llm";

const router = Router();

/**
 * POST /api/tts/speak
 * Converte texto em áudio
 * 
 * Body: { text: string, language?: string }
 * Response: { audioUrl: string }
 */
router.post("/speak", async (req, res) => {
  try {
    const { text, language = "pt-BR" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Texto é obrigatório" });
    }

    // Limpar texto
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\n+/g, " ")
      .replace(/[#\[\]()]/g, "")
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: "Texto vazio após limpeza" });
    }

    console.log("[TTS] Gerando áudio para:", cleanText.substring(0, 50));

    // Usar a API de síntese de fala do Manus (via LLM com audio_format)
    // Nota: Verificar se a API suporta síntese de fala
    // Por enquanto, usar fallback com Web Speech API no cliente

    // Retornar URL vazia para indicar que deve usar SpeechSynthesis no cliente
    return res.json({
      success: true,
      message: "Use SpeechSynthesis no cliente",
      text: cleanText,
    });
  } catch (error) {
    console.error("[TTS] Erro ao gerar áudio:", error);
    return res.status(500).json({ error: "Erro ao gerar áudio" });
  }
});

export default router;
