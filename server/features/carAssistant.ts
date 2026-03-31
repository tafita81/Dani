/**
 * carAssistant.ts — Assistente Clínico Mãos-Livres (Modo Carro)
 *
 * Permite à psicóloga consultar dados clínicos enquanto dirige,
 * usando reconhecimento de voz em pt-BR e respostas por áudio (TTS).
 *
 * Diferenças do assistente clínico normal:
 * - Respostas curtas (máx 2 frases) para não distrair ao volante
 * - Entrada 100% por voz (Web Speech API pt-BR)
 * - Modo Turbo: resposta imediata sem confirmação
 * - TTS: ElevenLabs (se configurado) ou Browser Speech Synthesis
 * - Sugestões rápidas pré-configuradas na interface
 */

import { router, protectedProcedure } from "../_core/trpc.js";
import { z } from "zod";
import { chat } from "../_core/llm.js";
import { db } from "../core_logic/db.js";
import { patients, appointments, sessionNotes, leads } from "../../drizzle/schema.js";
import { eq, and, gte, lte, desc, like } from "drizzle-orm";

// ── Intenções mapeadas a frases ditas em voz ──────────────────
const VOICE_INTENTS: Record<string, string> = {
  "agenda de hoje":        "agenda_today",
  "próximo paciente":      "next_patient",
  "próxima consulta":      "next_patient",
  "resumo do paciente":    "patient_summary",
  "evolução do paciente":  "patient_evolution",
  "pacientes inativos":    "inactive_patients",
  "listar pacientes":      "list_patients",
  "quantos pacientes":     "count_patients",
  "leads de hoje":         "leads_today",
  "mensagens não lidas":   "unread_messages",
};

function detectIntent(text: string): string {
  const lower = text.toLowerCase();
  for (const [phrase, intent] of Object.entries(VOICE_INTENTS)) {
    if (lower.includes(phrase)) return intent;
  }
  return "general";
}

// Remove markdown e limita a 2 frases (segurança ao volante)
function toAudioResponse(text: string): string {
  const clean = text.replace(/[#*`_\[\]>-]/g, "").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 2);
  return sentences.join(" ").trim();
}

// ── Router ────────────────────────────────────────────────────
export const carAssistantRouter = router({

  // Processar transcrição de voz e retornar resposta curta
  voiceCommand: protectedProcedure
    .input(z.object({
      transcript: z.string().min(1).max(300),
      turboMode:  z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const intent = detectIntent(input.transcript);
      const now = new Date();
      let responseText = "";

      // ── Agenda de hoje ──────────────────────────────────────
      if (intent === "agenda_today") {
        const start = new Date(now); start.setHours(0, 0, 0, 0);
        const end   = new Date(now); end.setHours(23, 59, 59, 999);

        const appts = await db.select({ startTime: appointments.startTime, status: appointments.status })
          .from(appointments)
          .where(and(eq(appointments.userId, userId), gte(appointments.startTime, start), lte(appointments.startTime, end)))
          .orderBy(appointments.startTime);

        if (!appts.length) {
          responseText = "Você não tem consultas agendadas para hoje.";
        } else {
          const times = appts.map(a =>
            new Date(a.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          ).join(", ");
          responseText = `Você tem ${appts.length} consulta${appts.length > 1 ? "s" : ""} hoje, às ${times}.`;
        }
      }

      // ── Próxima consulta ────────────────────────────────────
      else if (intent === "next_patient") {
        const [next] = await db.select()
          .from(appointments)
          .where(and(eq(appointments.userId, userId), gte(appointments.startTime, now)))
          .orderBy(appointments.startTime)
          .limit(1);

        if (!next) {
          responseText = "Sem próximas consultas agendadas.";
        } else {
          const h = new Date(next.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          responseText = `Próxima consulta às ${h}, modo ${next.type === "online" ? "online" : "presencial"}.`;
        }
      }

      // ── Pacientes inativos ──────────────────────────────────
      else if (intent === "inactive_patients") {
        const inactives = await db.select({ name: patients.name })
          .from(patients)
          .where(and(eq(patients.userId, userId), eq(patients.status, "inactive")))
          .limit(5);

        if (!inactives.length) {
          responseText = "Nenhum paciente inativo no momento.";
        } else {
          const names = inactives.map(p => p.name).join(", ");
          responseText = `${inactives.length} paciente${inactives.length > 1 ? "s" : ""} inativo${inactives.length > 1 ? "s" : ""}: ${names}.`;
        }
      }

      // ── Contar pacientes ────────────────────────────────────
      else if (intent === "count_patients") {
        const all = await db.select({ id: patients.id })
          .from(patients)
          .where(and(eq(patients.userId, userId), eq(patients.status, "active")));
        responseText = `Você tem ${all.length} paciente${all.length !== 1 ? "s" : ""} ativo${all.length !== 1 ? "s" : ""}.`;
      }

      // ── Evolução de paciente (extrai nome da fala) ──────────
      else if (intent === "patient_evolution") {
        const match = input.transcript.match(/paciente\s+([a-zA-ZÀ-ú\s]+)/i);
        const nameQuery = match?.[1]?.trim();

        if (!nameQuery) {
          responseText = "Diga o nome do paciente. Exemplo: evolução do paciente João.";
        } else {
          const [found] = await db.select()
            .from(patients)
            .where(and(eq(patients.userId, userId), like(patients.name, `%${nameQuery}%`)))
            .limit(1);

          if (!found) {
            responseText = `Paciente ${nameQuery} não encontrado.`;
          } else {
            const [lastNote] = await db.select({ summary: sessionNotes.summary })
              .from(sessionNotes)
              .where(eq(sessionNotes.patientId, found.id))
              .orderBy(desc(sessionNotes.createdAt))
              .limit(1);

            responseText = lastNote?.summary
              ? toAudioResponse(`${found.name}: ${lastNote.summary}`)
              : `Nenhuma nota registrada para ${found.name}.`;
          }
        }
      }

      // ── Resposta geral via LLM (modo mãos-livres) ───────────
      else {
        const raw = await chat([
          {
            role: "system",
            content: `Você é o assistente de voz da Psicóloga Daniela Coelho.
REGRAS CRÍTICAS — a psicóloga está DIRIGINDO:
- Responda em EXATAMENTE 1 a 2 frases curtas
- PROIBIDO: listas, markdown, números de itens, formatação
- Seja direta e objetiva
- Se não souber, diga "Não tenho essa informação agora."`,
          },
          { role: "user", content: input.transcript },
        ], { maxTokens: 80, temperature: 0.4 });

        responseText = toAudioResponse(raw);
      }

      return {
        response: responseText,
        intent,
        turboMode: input.turboMode,
        timestamp: new Date().toISOString(),
      };
    }),

  // Sugestões rápidas exibidas como botões na interface
  suggestions: protectedProcedure.query(() => ({
    suggestions: [
      "📅 Agenda de hoje",
      "👤 Próximo paciente",
      "📈 Ver evolução de paciente",
      "😴 Listar pacientes inativos",
      "🔢 Quantos pacientes ativos",
    ],
  })),

  // Status do sistema (exibido na interface)
  status: protectedProcedure.query(() => ({
    language: "pt-BR",
    speechEngine: "Web Speech API",
    ttsEngine: process.env.ELEVENLABS_API_KEY ? "ElevenLabs" : "Browser TTS",
    maxSentences: 2,
    turboModeAvailable: true,
  })),
});
