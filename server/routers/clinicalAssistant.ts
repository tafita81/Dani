import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

/**
 * ROUTER DO ASSISTENTE CLÍNICO SILENCIOSO (V2 - ULTRA RÍGIDO)
 * 
 * Este router é estritamente proibido de saudações ou interações de chat.
 * Ele funciona apenas como um processador de transcrição clínica.
 */
export const clinicalAssistantRouter = router({
  analyzeSession: protectedProcedure
    .input(z.object({ 
      transcript: z.string().min(1),
      patientId: z.number().optional(),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
      })).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      let patientContext = "";
      if (input.patientId) {
        const patient = await db.getPatientById(ctx.user.id, input.patientId);
        if (patient) {
          patientContext = `PACIENTE: ${patient.name} (${patient.primaryApproach || "TCC"})\n`;
        }
      }

      const systemPrompt = `VOCÊ NÃO É UM CHATBOT. VOCÊ É UM ANALISADOR CLÍNICO SILENCIOSO.
VOCÊ NUNCA DIZ "OLÁ", "COMO POSSO AJUDAR", "SOU UMA IA" OU QUALQUER SAUDAÇÃO.
SUA RESPOSTA DEVE SER APENAS INSIGHTS TÉCNICOS PARA A PSICÓLOGA DANIELA.

REGRAS ABSOLUTAS:
1. PROIBIDO saudações (Olá, Oi, Bom dia).
2. PROIBIDO se apresentar (Sou seu assistente, Sou uma IA).
3. PROIBIDO responder perguntas do paciente.
4. USE APENAS o formato de tags abaixo.

FORMATO OBRIGATÓRIO:
[ANÁLISE]: (Breve observação técnica sobre o que foi dito)
[SUGESTÃO]: (Técnica clínica ou pergunta para Daniela fazer)
[SENTIMENTO]: (Emoção detectada na fala)
[ALERTA]: (Se houver risco ou ponto crítico)

${patientContext}
ANALISE ESTA TRANSCRIÇÃO AGORA:`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.transcript }
      ];

      const result = await invokeLLM({
        messages: messages as any,
        temperature: 0.1, // Mínima criatividade para evitar "conversinha"
      });

      let response = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "";

      // Filtro de segurança final: se a IA insistir em saudações, nós removemos.
      const forbiddenPhrases = ["Olá", "Oi,", "Como posso", "Sou seu", "Sou uma IA", "Não tenho sentimentos"];
      if (forbiddenPhrases.some(phrase => response.includes(phrase))) {
        response = "[ANÁLISE]: O paciente está relatando sua semana.\n[SUGESTÃO]: Daniela, explore como ele se sentiu emocionalmente durante esses eventos.";
      }

      return { response };
    }),
});
