import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

export const clinicalAssistantRouter = router({
  // 1. Processamento de Transcrição em Tempo Real (Silencioso e Técnico)
  analyzeTranscript: protectedProcedure
    .input(z.object({ 
      transcript: z.string().min(1),
      patientId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let patientContext = "";
      if (input.patientId) {
        const patient = await db.getPatientById(ctx.user.id, input.patientId);
        if (patient) {
          patientContext = `PACIENTE: ${patient.name} (${patient.primaryApproach || "TCC"})\n`;
        }
      }

      const systemPrompt = `VOCÊ É O ANALISADOR CLÍNICO DA PSI. DANIELA COELHO.
SUA FUNÇÃO É PROCESSAR A TRANSCRIÇÃO DE UMA SESSÃO EM TEMPO REAL E FORNECER INSIGHTS TÉCNICOS.

REGRAS CRUCIAIS:
1. VOCÊ NÃO É UM CHATBOT. NÃO USE SAUDAÇÕES OU PRIMEIRA PESSOA SOCIAL.
2. ANALISE O CONTEÚDO SOB A ÓTICA DA PSICOLOGIA (TCC, TERAPIA DO ESQUEMA, GESTALT).
3. IDENTIFIQUE: DISTORÇÕES COGNITIVAS, PADRÕES EMOCIONAIS E TEMAS CENTRAIS.
4. FORNEÇA SUGESTÕES DE TÉCNICAS OU PERGUNTAS CLÍNICAS PARA A DANIELA.

FORMATO DE SAÍDA:
[INSIGHT]: (Observação técnica sobre a fala atual)
[TÉCNICA]: (Sugestão de abordagem para a Daniela)
[SENTIMENTO]: (Emoção predominante detectada)
[ALERTA]: (Pontos de atenção ou riscos)

${patientContext}
TRANSCRIÇÃO ATUAL:`;

      const result = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.transcript }
        ],
        temperature: 0.2,
      });

      const response = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Processando...";

      // Persistência imediata da transcrição bruta
      if (input.patientId) {
        await db.createSessionNote({
          userId: ctx.user.id,
          patientId: input.patientId,
          content: input.transcript,
          type: "transcription",
          createdAt: new Date()
        } as any);
      }

      return { response };
    }),

  // 2. Encerramento de Consulta e Consolidação de Dados
  endSession: protectedProcedure
    .input(z.object({ 
      patientId: z.number(),
      fullTranscript: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `Você é o Supervisor Clínico da Dra. Daniela Coelho.
Com base na transcrição completa da sessão abaixo, gere um RESUMO CLÍNICO ESTRUTURADO para o prontuário do paciente.

ESTRUTURA DO RESUMO:
1. SÍNTESE DA SESSÃO: (Principais temas abordados)
2. EVOLUÇÃO CLÍNICA: (Progresso ou retrocesso observado)
3. INTERVENÇÕES REALIZADAS: (Técnicas utilizadas)
4. PLANO DE AÇÃO: (Próximos passos e tarefas de casa)

TRANSCRIÇÃO COMPLETA:
${input.fullTranscript}`;

      const result = await invokeLLM({
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.3,
      });

      const summary = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Resumo não gerado.";

      // Salvar evolução final no banco de dados
      await db.createSessionEvolution({
        userId: ctx.user.id,
        patientId: input.patientId,
        content: summary,
        type: "session_summary",
        createdAt: new Date()
      } as any);

      return { summary };
    }),
});
