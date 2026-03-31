import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";

/**
 * Procedures para processamento de áudio
 * - Transcrever áudio
 * - Gerar resposta com IA
 * - Converter texto para fala
 */

/**
 * Transcrever áudio enviado
 */
export const transcribeAudioProcedure = publicProcedure
  .input(
    z.object({
      audioUrl: z.string().url(),
      language: z.string().default("pt-BR"),
    })
  )
  .mutation(async ({ input }: any) => {
    try {
      const result = await transcribeAudio({
        audioUrl: input.audioUrl,
        language: input.language,
        prompt: "Transcrever pergunta em português brasileiro",
      });

      return {
        success: true,
        transcript: (result as any).text || "",
        language: (result as any).language || "pt-BR",
        confidence: 0.9,
      };
    } catch (error) {
      console.error("Erro ao transcrever áudio:", error);
      return {
        success: false,
        transcript: "",
        error: "Erro ao transcrever áudio",
      };
    }
  });

/**
 * Gerar resposta com IA baseada em pergunta
 */
export const generateAIResponseProcedure = publicProcedure
  .input(
    z.object({
      question: z.string(),
      context: z.string().default("assistente-carro"),
      language: z.string().default("pt-BR"),
      systemPrompt: z.string().optional(),
    })
  )
  .mutation(async ({ input }: any) => {
    try {
      const systemPrompt =
        input.systemPrompt ||
        `Você é um assistente de voz amigável para um carro. 
Responda em Português Brasileiro de forma clara, concisa e útil.
Mantenha respostas curtas (máximo 2-3 frases).
Seja educado e prestativo.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: input.question,
          },
        ],
      });

      const answer =
        response.choices?.[0]?.message?.content ||
        "Desculpe, não consegui processar sua pergunta.";

      return {
        success: true,
        answer,
        question: input.question,
      };
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      return {
        success: false,
        answer: "Desculpe, ocorreu um erro ao processar sua pergunta.",
        error: "Erro ao gerar resposta",
      };
    }
  });

/**
 * Converter texto para fala (TTS)
 * Usa API de síntese de voz
 */
export const textToSpeechProcedure = publicProcedure
  .input(
    z.object({
      text: z.string(),
      language: z.string().default("pt-BR"),
      voice: z.enum(["male", "female"]).default("female"),
    })
  )
  .mutation(async ({ input }: any) => {
    try {
      // Usar Web Speech API ou serviço externo
      // Para este exemplo, retornamos um placeholder
      // Em produção, integrar com Google Cloud TTS, AWS Polly, etc.

      return {
        success: true,
        text: input.text,
        language: input.language,
        voice: input.voice,
        audioUrl: null, // Será preenchido pelo cliente com Web Speech API
        message: "Use a Web Speech API do navegador para TTS",
      };
    } catch (error) {
      console.error("Erro ao converter texto para fala:", error);
      return {
        success: false,
        error: "Erro ao converter texto para fala",
      };
    }
  });

/**
 * Processar conversa completa
 * 1. Transcrever áudio
 * 2. Gerar resposta com IA
 * 3. Retornar resposta para TTS no cliente
 */
export const processConversationProcedure = publicProcedure
  .input(
    z.object({
      audioUrl: z.string().url(),
      language: z.string().default("pt-BR"),
      context: z.string().default("assistente-carro"),
    })
  )
  .mutation(async ({ input }: any) => {
    try {
      // 1. Transcrever áudio
      const transcriptionResult = await transcribeAudio({
        audioUrl: input.audioUrl,
        language: input.language,
        prompt: "Transcrever pergunta em português brasileiro",
      });

      const question = (transcriptionResult as any).text || "";

      if (!question || question.length < 3) {
        return {
          success: false,
          error: "Nenhuma fala detectada ou muito curta",
        };
      }

      // 2. Gerar resposta com IA
      const systemPrompt = `Você é um assistente de voz para um carro.
Responda em Português Brasileiro de forma clara e concisa.
Mantenha respostas curtas (máximo 2-3 frases).
Seja educado e prestativo.`;

      const aiResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: question,
          },
        ],
      });

      const answer =
        aiResponse.choices?.[0]?.message?.content ||
        "Desculpe, não consegui processar sua pergunta.";

      return {
        success: true,
        question,
        answer,
        language: input.language,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao processar conversa:", error);
      return {
        success: false,
        error: "Erro ao processar conversa",
      };
    }
  });
