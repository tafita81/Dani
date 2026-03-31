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
      status: z.string().default("active"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Mapear birthDate para dateOfBirth se necessário no schema
      return db.createPatient({
        userId: ctx.user.id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        dateOfBirth: input.birthDate,
        gender: input.gender,
        primaryApproach: input.primaryApproach as any,
        complaint: input.complaint,
        status: input.status as any,
        createdAt: new Date(),
        totalSessions: 0,
      } as any);
    }),

  // 1. Processamento de Transcrição com Memória Clínica Profunda
  analyzeTranscript: protectedProcedure
    .input(z.object({ 
      transcript: z.string().min(1),
      patientId: z.number(), // Agora obrigatório para interligação
    }))
    .mutation(async ({ ctx, input }) => {
      // Recuperar contexto completo pelo patientId
      const context = await db.getPatientFullContext(ctx.user.id, input.patientId);
      
      if (!context.patient) throw new Error("Paciente não encontrado ou acesso negado.");

      const patientContext = `CLIENTE: ${context.patient.name}
ABORDAGEM: ${context.patient.primaryApproach || "Integrativa"}
STATUS: ${context.patient.status}
TOTAL DE SESSÕES: ${context.patient.totalSessions || 0}\n`;

      // Pegar as últimas 5 evoluções para contexto de eficácia
      const pastEvolutions = context.history && context.history.length > 0
        ? "\n--- HISTÓRICO DE EVOLUÇÕES E INSIGHTS ANTERIORES ---\n" + 
          context.history.slice(0, 5).map(e => `[${new Date(e.createdAt).toLocaleDateString()}]: ${e.content}`).join("\n\n")
        : "";

      // Pegar as últimas transcrições para continuidade
      const clinicalHistory = context.transcripts && context.transcripts.length > 0
        ? "\n--- CONTEXTO DAS ÚLTIMAS SESSÕES ---\n" + 
          context.transcripts.slice(0, 3).map(n => `[Sessão ${new Date(n.createdAt).toLocaleDateString()}]: ${n.text?.substring(0, 200)}...`).join("\n")
        : "";

      const systemPrompt = `VOCÊ É O ESTRATEGISTA CLÍNICO CONECTADO DA PSI. DANIELA COELHO.
SUA FUNÇÃO É ANALISAR A SESSÃO ATUAL INTEGRANDO TODO O HISTÓRICO DO CLIENTE.

CONTEXTO DO CLIENTE:
${patientContext}
${pastEvolutions}
${clinicalHistory}

OBJETIVO:
1. Identifique padrões recorrentes entre o que está sendo dito agora e o histórico do cliente.
2. Sugira técnicas baseadas no que já foi tentado (veja o que deu certo ou errado no histórico).
3. Seja um observador técnico e silencioso. NUNCA use saudações ou primeira pessoa social.

FORMATO DE SAÍDA (EXCLUSIVO PARA DANIELA):
[INSIGHT HISTÓRICO]: (Relacione a fala atual com padrões anteriores do cliente)
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

      // Persistência imediata vinculada ao patientId
      await db.createSessionNote({
        userId: ctx.user.id,
        patientId: input.patientId,
        text: input.transcript,
        type: "transcript",
        createdAt: new Date()
      } as any);

      // Salvar o insight técnico gerado também vinculado ao patientId
      await db.createSessionEvolution({
        userId: ctx.user.id,
        patientId: input.patientId,
        content: response,
        type: "insight_realtime",
        createdAt: new Date()
      } as any);

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
Gere um RESUMO CLÍNICO ESTRUTURADO consolidando a sessão de hoje com o histórico do cliente ${patient?.name || ""}.

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

      // Salvar evolução final vinculada ao patientId
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
