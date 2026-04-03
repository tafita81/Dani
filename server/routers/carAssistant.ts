import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import {
  patients,
  sessionNotes,
  treatmentPlans,
  appointments,
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Car Assistant Router
 * Hands-free mode for psychologists while driving
 * - Voice recognition (pt-BR)
 * - Text-to-speech responses
 * - Quick suggestions
 * - No authentication required
 */

export const carAssistantRouter = router({
  /**
   * Process voice input and provide quick response
   * Designed for hands-free operation while driving
   */
  processVoiceCommand: publicProcedure
    .input(
      z.object({
        transcript: z.string(),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Quick response for common clinical queries
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a clinical psychology assistant for a psychologist driving a car. 
Provide BRIEF, CONCISE responses (1-2 sentences max) in Portuguese (Brazilian).
Focus on quick clinical insights, technique reminders, or patient management tips.
Responses should be safe to read aloud while driving.
Never provide medical diagnoses - only therapeutic guidance.`,
          },
          {
            role: "user",
            content: `${input.transcript}${input.context ? `\n\nContext: ${input.context}` : ""}`,
          },
        ],
      });

      const responseText =
        typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "Desculpe, não consegui processar sua solicitação.";

      return {
        text: responseText,
        timestamp: new Date(),
        shouldSpeak: true,
      };
    }),

  /**
   * Get quick clinical suggestions for common scenarios
   */
  getQuickSuggestions: publicProcedure
    .input(
      z.object({
        scenario: z.enum([
          "anxiety",
          "depression",
          "stress",
          "relationship",
          "trauma",
          "general",
        ]),
      })
    )
    .query(async ({ input }) => {
      const scenarios: Record<string, string> = {
        anxiety: "Paciente apresentando sintomas de ansiedade",
        depression: "Paciente com sintomas depressivos",
        stress: "Paciente sob estresse significativo",
        relationship: "Questões relacionais ou de relacionamento",
        trauma: "Processamento de trauma ou experiência adversa",
        general: "Consulta clínica geral",
      };

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a clinical psychology expert. Provide 3 quick therapeutic techniques or reminders for the given scenario.
Format as bullet points. Keep each point to 1 sentence. Respond in Portuguese (Brazilian).
Focus on evidence-based approaches (CBT, ACT, mindfulness, etc).`,
          },
          {
            role: "user",
            content: `Scenario: ${scenarios[input.scenario]}\n\nProvide quick therapeutic suggestions I can use in my next session.`,
          },
        ],
      });

      const suggestionsText =
        typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "";

      return {
        scenario: input.scenario,
        suggestions: parseSuggestions(suggestionsText),
        timestamp: new Date(),
      };
    }),

  /**
   * Generate phonetic version of text for TTS
   * Helps with pronunciation of clinical terms
   */
  generatePhonetic: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ input }) => {
      // For Portuguese, we can use simple phonetic conversion
      // In production, consider using a proper phonetic library
      const phonetic = convertToPhonetic(input.text);

      return {
        original: input.text,
        phonetic: phonetic,
      };
    }),

  /**
   * Get turbo mode suggestions (ultra-fast responses)
   */
  getTurboSuggestions: publicProcedure
    .input(
      z.object({
        keyword: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Turbo mode: pre-computed quick responses
      const turboResponses: Record<string, string[]> = {
        "técnica de respiração":
          [
            "Respiração 4-7-8: inspire por 4, segure por 7, expire por 8",
            "Respiração diafragmática: inspire pelo nariz, expire pela boca",
            "Respiração alternada: feche uma narina, inspire, troque",
          ],
        "técnica de relaxamento": [
          "Relaxamento progressivo: tense e solte cada grupo muscular",
          "Visualização guiada: imagine um lugar seguro e calmo",
          "Escaneamento corporal: observe sensações do corpo",
        ],
        "técnica cognitiva": [
          "Reestruturação cognitiva: questione pensamentos automáticos",
          "Registro de pensamentos: escreva pensamento, evidência, alternativa",
          "Detecção de distorções: identifique catastrofização, generalização",
        ],
        "técnica comportamental": [
          "Exposição gradual: enfrente medos em pequenos passos",
          "Ativação comportamental: aumente atividades prazerosas",
          "Dessensibilização: reduza ansiedade através de exposição",
        ],
      };

      const suggestions =
        turboResponses[input.keyword.toLowerCase()] ||
        turboResponses["técnica geral"] ||
        [
          "Consulte o histórico do paciente para técnicas anteriormente eficazes",
          "Considere a abordagem terapêutica preferida do paciente",
          "Adapte a técnica ao contexto e apresentação atual",
        ];

      return {
        keyword: input.keyword,
        suggestions: suggestions,
        turboMode: true,
      };
    }),

  /**
   * Get comprehensive patient analysis based on session history
   * Analyzes all sessions and provides AI-powered recommendations
   */
  getPatientAnalysis: publicProcedure
    .input(
      z.object({
        patientId: z.number(),
        patientName: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { error: "Database not available" };
        }

        // Get patient data
        const patientResults = await (db as any)
          .select()
          .from(patients)
          .where(eq(patients.id, input.patientId));

        const patient = patientResults[0];
        if (!patient) {
          return { error: "Paciente não encontrado" };
        }

        // Get ALL sessions for this patient
        const allSessions = await (db as any)
          .select()
          .from(sessionNotes)
          .where(eq(sessionNotes.patientId, input.patientId))
          .orderBy(desc(sessionNotes.createdAt));

        // Get treatment plans
        const treatmentPlansData = await (db as any)
          .select()
          .from(treatmentPlans)
          .where(eq(treatmentPlans.patientId, input.patientId));

        // Compile analysis
        const totalSessions = allSessions.length;
        const lastSession = allSessions[0];
        const allSummaries = allSessions.map((s: any) => s.summary).filter(Boolean);
        const allAISuggestions = allSessions
          .filter((s: any) => s.aiSuggestions && s.aiSuggestions.length > 0)
          .flatMap((s: any) => s.aiSuggestions);
        const allKeyThemes = allSessions
          .filter((s: any) => s.keyThemes && s.keyThemes.length > 0)
          .flatMap((s: any) => s.keyThemes);
        const allInterventions = allSessions
          .filter((s: any) => s.interventions && s.interventions.length > 0)
          .flatMap((s: any) => s.interventions);

        return {
          success: true,
          patientName: patient.name,
          patientId: patient.id,
          totalSessions,
          lastSessionDate: lastSession ? new Date(lastSession.createdAt).toLocaleDateString("pt-BR") : null,
          lastSessionSummary: lastSession?.summary || null,
          allSummaries,
          allAISuggestions: Array.from(new Set(allAISuggestions)), // Remove duplicates
          allKeyThemes: Array.from(new Set(allKeyThemes)),
          allInterventions: Array.from(new Set(allInterventions)),
          treatmentPlanCount: treatmentPlansData.length,
          activeTreatmentPlan: treatmentPlansData.find((t: any) => t.active),
        };
      } catch (error) {
        console.error("[Car Assistant] Error getting patient analysis:", error);
        return { error: "Erro ao buscar análise do paciente" };
      }
    }),

  /**
   * Generate AI recommendations based on patient session history
   */
  generatePatientRecommendations: publicProcedure
    .input(
      z.object({
        patientId: z.number(),
        patientName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { error: "Database not available" };
        }

        // Get patient data
        const patientResults = await (db as any)
          .select()
          .from(patients)
          .where(eq(patients.id, input.patientId));

        const patient = patientResults[0];
        if (!patient) {
          return { error: "Paciente não encontrado" };
        }

        // Get ALL sessions
        const allSessions = await (db as any)
          .select()
          .from(sessionNotes)
          .where(eq(sessionNotes.patientId, input.patientId))
          .orderBy(desc(sessionNotes.createdAt));

        // Get treatment plans
        const patientTreatmentPlans = await (db as any)
          .select()
          .from(treatmentPlans)
          .where(eq(treatmentPlans.patientId, input.patientId));

        // Build context for LLM
        const sessionContext = allSessions
          .slice(0, 10) // Last 10 sessions
          .map((s: any, idx: number) => {
            const sessionDate = new Date(s.createdAt).toLocaleDateString("pt-BR");
            return `Sessão ${idx + 1} (${sessionDate}):\n- Resumo: ${s.summary || "N/A"}\n- Temas: ${s.keyThemes?.join(", ") || "N/A"}\n- Sugestões IA: ${s.aiSuggestions?.join(", ") || "N/A"}`;
          })
          .join("\n\n");

        // Call LLM to generate recommendations
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um assistente clínico especializado em análise de histórico de sessões terapêuticas.
Analise o histórico completo do paciente e gere recomendações de tratamento BREVES e DIRETAS (2-3 frases max).
Foco em: padrões identificados, temas recorrentes, efetividade das intervenções, próximos passos.`,
            },
            {
              role: "user",
              content: `Paciente: ${patient.name}\nTotal de sessões: ${allSessions.length}\n\nHistórico:\n${sessionContext}\n\nGere recomendações para as próximas sessões.`,
            },
          ],
        });

        const recommendations =
          typeof response.choices[0]?.message.content === "string"
            ? response.choices[0].message.content
            : "Não foi possível gerar recomendações.";

        return {
          success: true,
          patientName: patient.name,
          totalSessions: allSessions.length,
          recommendations,
          shouldSpeak: true,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Car Assistant] Error generating recommendations:", error);
        return { error: "Erro ao gerar recomendações" };
      }
    }),

  /**
   * Log interaction for later analysis
   */
  logInteraction: publicProcedure
    .input(
      z.object({
        transcript: z.string(),
        response: z.string(),
        duration: z.number().optional(),
        scenario: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Log for analytics and improvement
      // In production, this would save to database
      console.log("[Car Assistant] Interaction logged:", {
        timestamp: new Date(),
        transcriptLength: input.transcript.length,
        responseLength: input.response.length,
        duration: input.duration,
        scenario: input.scenario,
      });

      return {
        success: true,
        logged: true,
      };
    }),
});

// ═══════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function parseSuggestions(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);
}

function convertToPhonetic(text: string): string {
  // Simple phonetic conversion for Portuguese
  // In production, use a proper library like 'phonetic' or 'metaphone'
  const phonetic = text
    .toLowerCase()
    .replace(/ç/g, "s")
    .replace(/ã/g, "an")
    .replace(/õ/g, "on")
    .replace(/ão/g, "awn")
    .replace(/ões/g, "oens")
    .replace(/ê/g, "e")
    .replace(/é/g, "e")
    .replace(/á/g, "a")
    .replace(/à/g, "a")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u");

  return phonetic;
}
