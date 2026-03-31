/**
 * clinicalAssistant.ts — Assistente IA com Voz para Sessões Clínicas
 *
 * Usado DURANTE a consulta (não no carro):
 * - Transcrição contínua da sessão em tempo real
 * - Resumo pré-consulta inteligente
 * - Sugestões de intervenções em tempo real
 * - Geração automática de nota de sessão pós-consulta
 * - Suporte a comandos: "Me informe minha agenda de hoje",
 *   "Faça um resumo da última sessão", etc.
 */

import { router, protectedProcedure } from "../_core/trpc.js";
import { z } from "zod";
import { chat, analyzeClinicalSession } from "../_core/llm.js";
import { db } from "../core_logic/db.js";
import {
  patients, appointments, sessionNotes, moodEntries,
  anamnesis, cognitiveConcepts, inventoryResults,
} from "../../drizzle/schema.js";
import { eq, and, gte, desc } from "drizzle-orm";

export const clinicalAssistantRouter = router({

  // Resumo pré-consulta (gerado antes de a sessão iniciar)
  preSesionBriefing: protectedProcedure
    .input(z.object({ patientId: z.string(), appointmentId: z.string().optional() }))
    .query(async ({ input }) => {
      const [patient]  = await db.select().from(patients).where(eq(patients.id, input.patientId)).limit(1);
      const [anamn]    = await db.select().from(anamnesis).where(eq(anamnesis.patientId, input.patientId)).limit(1);
      const [cogn]     = await db.select().from(cognitiveConcepts).where(eq(cognitiveConcepts.patientId, input.patientId)).limit(1);
      const lastNotes  = await db.select().from(sessionNotes).where(eq(sessionNotes.patientId, input.patientId)).orderBy(desc(sessionNotes.createdAt)).limit(3);
      const lastMoods  = await db.select().from(moodEntries).where(eq(moodEntries.patientId, input.patientId)).orderBy(desc(moodEntries.recordedAt)).limit(5);
      const lastInventories = await db.select().from(inventoryResults).where(eq(inventoryResults.patientId, input.patientId)).orderBy(desc(inventoryResults.createdAt)).limit(3);

      const context = `
Paciente: ${patient?.name}, ${patient?.gender === "F" ? "feminino" : "masculino"}
Queixa principal: ${anamn?.mainComplaint ?? "não informada"}
Crenças nucleares: ${JSON.stringify(cogn?.coreBeliefs ?? [])}
Últimas 3 sessões: ${lastNotes.map(n => n.summary).filter(Boolean).join(" | ")}
Humor recente (1-10): ${lastMoods.map(m => m.score).join(", ")}
Últimos inventários: ${lastInventories.map(i => `${i.type}: ${i.totalScore} (${i.severity})`).join(", ")}
      `.trim();

      const briefing = await chat([
        {
          role: "system",
          content: `Você é o assistente da Psicóloga Daniela Coelho.
Gere um briefing pré-sessão estruturado com:
1. Resumo do paciente (2 frases)
2. Pontos de atenção desta sessão
3. Sugestões de abordagem
4. Tarefas de casa pendentes (se houver)
Seja conciso e clínico.`,
        },
        { role: "user", content: context },
      ], { maxTokens: 500 });

      return { briefing, patient: { name: patient?.name, status: patient?.status } };
    }),

  // Processar transcrição em tempo real durante a sessão
  realtimeAnalysis: protectedProcedure
    .input(z.object({
      patientId:  z.string(),
      transcript: z.string(),
      approach:   z.string().optional().default("TCC"),
    }))
    .mutation(async ({ input }) => {
      const response = await chat([
        {
          role: "system",
          content: `Você é co-terapeuta da Psicóloga Daniela Coelho.
Abordagem: ${input.approach}.
Ao analisar a transcrição da sessão:
- Identifique pensamentos automáticos, esquemas ou padrões relevantes
- Sugira 1 intervenção ou técnica pontual
- Seja BREVE (máx 3 linhas) — a psicóloga está em sessão`,
        },
        { role: "user", content: `Transcrição parcial:\n${input.transcript}` },
      ], { maxTokens: 150, temperature: 0.6 });

      return { suggestion: response };
    }),

  // Gerar nota de sessão automaticamente após a consulta
  generateSessionNote: protectedProcedure
    .input(z.object({
      patientId:   z.string(),
      transcript:  z.string(),
      appointmentId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const analysis = await analyzeClinicalSession(input.transcript);

      // Salvar nota no banco
      await db.insert(sessionNotes).values({
        patientId:     input.patientId,
        userId:        ctx.user.id,
        appointmentId: input.appointmentId,
        transcript:    input.transcript,
        summary:       analysis.summary,
        keyThemes:     analysis.keyThemes,
        interventions: analysis.suggestedInterventions,
        nextSession:   analysis.nextSteps,
        aiSuggestions: analysis.suggestedInterventions,
      });

      return analysis;
    }),

  // Processar comando de voz natural (durante sessão ou fora)
  voiceCommand: protectedProcedure
    .input(z.object({
      command:   z.string(),
      patientId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const lower  = input.command.toLowerCase();

      // Agenda de hoje
      if (lower.includes("agenda") || lower.includes("hoje")) {
        const today = new Date();
        const start = new Date(today); start.setHours(0,0,0,0);
        const end   = new Date(today); end.setHours(23,59,59,999);
        const appts = await db.select()
          .from(appointments)
          .where(and(eq(appointments.userId, userId), gte(appointments.startTime, start)))
          .orderBy(appointments.startTime)
          .limit(10);

        return {
          type: "agenda",
          data: appts.map(a => ({
            time: new Date(a.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            status: a.status,
            type: a.type,
          })),
        };
      }

      // Resumo da última sessão
      if (lower.includes("resumo") && input.patientId) {
        const [last] = await db.select()
          .from(sessionNotes)
          .where(eq(sessionNotes.patientId, input.patientId))
          .orderBy(desc(sessionNotes.createdAt))
          .limit(1);
        return { type: "session_summary", data: last?.summary ?? "Nenhuma sessão registrada." };
      }

      // Resposta geral
      const response = await chat([
        {
          role: "system",
          content: `Você é o assistente clínico da Psicóloga Daniela Coelho.
Responda ao comando de forma objetiva e profissional.`,
        },
        { role: "user", content: input.command },
      ], { maxTokens: 300 });

      return { type: "general", data: response };
    }),
});
