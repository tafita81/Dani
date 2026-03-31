import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

export const clinicalAssistantRouter = router({
  // Listar pacientes para o seletor
  listPatients: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getPatients(ctx.user.id);
    }),

  // Criar novo paciente com campos clínicos de elite
  createPatient: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      birthDate: z.string().optional(),
      gender: z.string().optional(),
      primaryApproach: z.string().optional(),
      complaint: z.string().optional(),
      status: z.string().default("Ativo"),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.createPatient({
        userId: ctx.user.id,
        ...input,
        createdAt: new Date(),
        totalSessions: 0,
      } as any);
    }),

  // 1. Processamento de Transcrição com Memória Clínica Profunda
  analyzeTranscript: protectedProcedure
    .input(z.object({ 
      transcript: z.string().min(1),
      patientId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let patientContext = "";
      let clinicalHistory = "";
      let pastEvolutions = "";

      if (input.patientId) {
        const [patient, evolutions, notes] = await Promise.all([
          db.getPatientById(ctx.user.id, input.patientId),
          db.getSessionEvolutions(ctx.user.id, input.patientId),
          db.getSessionNotes(ctx.user.id, input.patientId)
        ]);

        if (patient) {
          patientContext = `PACIENTE: ${patient.name}
ABORDAGEM: ${patient.primaryApproach || "Integrativa"}
STATUS: ${patient.status}
TOTAL DE SESSÕES: ${patient.totalSessions || 0}\n`;
        }

        // Pegar as últimas 5 evoluções para contexto de eficácia
        if (evolutions && evolutions.length > 0) {
          pastEvolutions = "\n--- HISTÓRICO DE EVOLUÇÕES E INSIGHTS ANTERIORES ---\n" + 
            evolutions.slice(0, 5).map(e => `[${new Date(e.createdAt).toLocaleDateString()}]: ${e.content}`).join("\n\n");
        }

        // Pegar as últimas transcrições para continuidade
        if (notes && notes.length > 0) {
          clinicalHistory = "\n--- CONTEXTO DAS ÚLTIMAS SESSÕES ---\n" + 
            notes.slice(0, 3).map(n => `[Sessão ${new Date(n.createdAt).toLocaleDateString()}]: ${n.content.substring(0, 200)}...`).join("\n");
        }
      }

      const systemPrompt = `VOCÊ É O ESTRATEGISTA CLÍNICO CONECTADO DA PSI. DANIELA COELHO.
SUA FUNÇÃO É ANALISAR A SESSÃO ATUAL INTEGRANDO TODO O HISTÓRICO DO PACIENTE.

CONTEXTO DO PACIENTE:
${patientContext}
${pastEvolutions}
${clinicalHistory}

OBJETIVO:
1. Identifique padrões recorrentes entre o que está sendo dito agora e o histórico.
2. Sugira técnicas baseadas no que já foi tentado (veja o que deu certo ou errado no histórico).
3. Seja um observador técnico e silencioso. NUNCA use saudações ou primeira pessoa social.

FORMATO DE SAÍDA (EXCLUSIVO PARA DANIELA):
[INSIGHT HISTÓRICO]: (Relacione a fala atual com padrões anteriores do paciente)
[EFICÁCIA]: (Analise se a abordagem atual está funcionando baseada no histórico)
[TÉCNICA RECOMENDADA]: (Sugira a melhor técnica para este momento específico, ex: TCC, Gestalt, Terapia do Esquema)
[SENTIMENTO ATUAL]: (Emoção detectada agora)

TRANSCRIÇÃO EM TEMPO REAL:`;

      const result = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.transcript }
        ],
        temperature: 0.2,
      });

      const response = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Analisando contexto...";

      // Persistência imediata
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

  // 2. Encerramento com Consolidação Histórica
  endSession: protectedProcedure
    .input(z.object({ 
      patientId: z.number(),
      fullTranscript: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const patient = await db.getPatientById(ctx.user.id, input.patientId);
      
      const systemPrompt = `Você é o Supervisor Clínico Sênior.
Gere um RESUMO CLÍNICO ESTRUTURADO consolidando a sessão de hoje com o histórico do paciente ${patient?.name || ""}.

ESTRUTURA:
1. SÍNTESE DA SESSÃO: (Principais temas)
2. COMPARAÇÃO HISTÓRICA: (Como esta sessão se compara com o progresso anterior)
3. TÉCNICAS APLICADAS E RESULTADO: (O que foi feito e como o paciente reagiu)
4. PLANEJAMENTO FUTURO: (Ajustes na estratégia terapêutica)

TRANSCRIÇÃO COMPLETA:
${input.fullTranscript}`;

      const result = await invokeLLM({
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.3,
      });

      const summary = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Resumo não gerado.";

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
