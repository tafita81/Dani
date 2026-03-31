import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

/**
 * ROUTER DO ASSISTENTE CLÍNICO SILENCIOSO
 * 
 * Este router processa as transcrições em tempo real da consulta
 * e gera insights apenas para a psicóloga Daniela, sem interagir com o paciente.
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
          patientContext = `PACIENTE ATUAL: ${patient.name} (Abordagem: ${patient.primaryApproach || "Não definida"})\nNotas: ${patient.notes || "Sem notas"}`;
        }
      }

      const systemPrompt = `Você é o Observador Clínico Silencioso da Psi. Daniela Coelho. 
Sua função é acompanhar a transcrição em tempo real de uma sessão de psicoterapia e fornecer INSIGHTS TÉCNICOS e SUGESTÕES CLÍNICAS apenas para a psicóloga.

REGRAS CRUCIAIS:
1. NÃO responda ao paciente. Você não é um chatbot.
2. NÃO use frases como "Como posso ajudar?" ou "Olá, tudo bem?".
3. ANALISE o que está sendo dito e sugira técnicas (TCC, Terapia do Esquema, Gestalt).
4. IDENTIFIQUE emoções, distorções cognitivas ou padrões de comportamento.
5. SEJA BREVE e use tópicos.
6. MANTENHA o foco no suporte à Daniela.

${patientContext}

FORMATO DE RESPOSTA (Use sempre que apropriado):
- [ANÁLISE]: Breve observação sobre o estado do paciente ou dinâmica atual.
- [SUGESTÃO]: Técnica ou pergunta que a Daniela pode fazer agora.
- [ALERTA]: Risco, inconsistência ou ponto importante detectado.
- [SENTIMENTO]: Emoção predominante detectada na fala.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...(input.history || []).slice(-6), // Pegar as últimas 6 interações para contexto
        { role: "user", content: `TRANSCRIÇÃO ATUAL: "${input.transcript}"` }
      ];

      const result = await invokeLLM({
        messages: messages as any,
        temperature: 0.3, // Menos criativo, mais técnico
      });

      const response = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Processando transcrição...";

      return { response };
    }),
});
