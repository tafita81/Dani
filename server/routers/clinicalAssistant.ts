import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { sessionNotes } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Clinical Assistant Router
 * Handles AI-powered clinical features:
 * - Real-time transcription analysis
 * - AI suggestions for interventions
 * - Automatic session note generation
 * - Patient history context
 * - SAVES all analyses to database with complete information
 */

export const clinicalAssistantRouter = router({
  /**
   * Analyze transcription and provide AI suggestions
   * Based on patient history and clinical best practices
   * SAVES complete analysis to database
   */
  analyzeSpeech: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        transcript: z.string(),
        appointmentId: z.number().optional(),
        sessionContext: z.object({
          duration: z.number().optional(),
          mainThemes: z.array(z.string()).optional(),
          emotionalState: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get patient history for context
      const patientSessions = await db
        .select()
        .from(sessionNotes)
        .where(eq(sessionNotes.patientId, input.patientId))
        .orderBy((col) => col.createdAt)
        .limit(5);

      const patientContext = patientSessions
        .map((s) => `- ${s.summary || ""}`)
        .join("\n");

      // Call LLM for analysis and suggestions
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert clinical psychologist assistant. Analyze the session transcript and provide:
1. Key themes and patterns
2. Emotional indicators
3. Suggested therapeutic interventions (based on CBT, ACT, or other evidence-based approaches)
4. Follow-up recommendations
5. Red flags or concerns to monitor

Patient history:
${patientContext || "No previous sessions"}

Respond in Portuguese (Brazilian) with a structured format.`,
          },
          {
            role: "user",
            content: `Please analyze this session transcript and provide clinical suggestions:\n\n${input.transcript}`,
          },
        ],
      });

      const analysisText =
        typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "";

      // Parse AI response to extract structured data
      const suggestions = extractSuggestions(analysisText);
      const themes = extractThemes(analysisText);
      
      // Extract emotional analysis
      const emotionalAnalysisResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Analyze the emotional content in JSON format with fields: primaryEmotions, emotionalIntensity (1-10), emotionalShifts, emotionalRegulation, potentialTriggers. Respond ONLY with valid JSON.`,
          },
          {
            role: "user",
            content: input.transcript,
          },
        ],
      });
      
      let emotionalAnalysis: any = {};
      try {
        const emotionalText = typeof emotionalAnalysisResponse.choices[0]?.message.content === "string"
          ? emotionalAnalysisResponse.choices[0].message.content
          : "{}";
        emotionalAnalysis = JSON.parse(emotionalText);
      } catch (e) {
        emotionalAnalysis = { error: "Could not parse emotional analysis" };
      }

      // SAVE complete analysis to database
      const result = await db.insert(sessionNotes).values({
        patientId: input.patientId,
        userId: ctx.user.id,
        appointmentId: input.appointmentId || null,
        transcript: input.transcript,
        summary: extractSummary(analysisText),
        keyThemes: themes,
        interventions: suggestions,
        aiSuggestions: suggestions,
        fullAnalysis: analysisText,
        emotionalAnalysis: emotionalAnalysis,
        sessionType: "analysis",
        duration: input.sessionContext?.duration || null,
        sessionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        analysis: analysisText,
        suggestions,
        themes,
        timestamp: new Date(),
        sessionId: (result as any)[0]?.id || 0,
        saved: true,
      };
    }),

  /**
   * Generate automatic session notes from transcript
   * SAVES complete notes to database
   */
  generateSessionNotes: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        transcript: z.string(),
        appointmentId: z.number().optional(),
        duration: z.number().optional(),
        mainThemes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a clinical documentation expert. Generate a professional session note in Portuguese (Brazilian) based on the transcript.
Include:
- Session summary (2-3 sentences)
- Key themes discussed
- Patient's emotional state
- Therapeutic interventions used
- Homework/tasks assigned
- Recommendations for next session
- Any concerning patterns or red flags

Format the response as structured clinical documentation.`,
          },
          {
            role: "user",
            content: `Generate session notes from this transcript:\n\n${input.transcript}`,
          },
        ],
      });

      const notesText =
        typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "";

      const summary = extractSummary(notesText);
      const themes = input.mainThemes || extractThemes(notesText);
      const interventions = extractSuggestions(notesText);

      // SAVE complete notes to database
      const result = await db.insert(sessionNotes).values({
        patientId: input.patientId,
        userId: ctx.user.id,
        appointmentId: input.appointmentId || null,
        transcript: input.transcript,
        summary: summary,
        keyThemes: themes,
        interventions: interventions,
        aiSuggestions: interventions,
        fullAnalysis: notesText,
        sessionType: "session_notes",
        duration: input.duration || null,
        sessionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        summary: summary,
        fullNotes: notesText,
        keyThemes: themes,
        timestamp: new Date(),
        sessionId: (result as any).insertId,
        saved: true,
      };
    }),

  /**
   * Get complete patient history for clinical reference
   * Includes all past sessions, themes, techniques, and recommendations
   */
  getPatientHistory: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all patient sessions
      const sessions = await db
        .select()
        .from(sessionNotes)
        .where(eq(sessionNotes.patientId, input.patientId))
        .orderBy((col) => col.createdAt);

      // Extract and aggregate data
      const allThemes: Record<string, number> = {};
      const allTechniques: string[] = [];
      const allEmotions: Record<string, number> = {};
      let totalDuration = 0;

      sessions.forEach((session) => {
        // Count themes
        if (session.keyThemes && Array.isArray(session.keyThemes)) {
          session.keyThemes.forEach((theme: string) => {
            allThemes[theme] = (allThemes[theme] || 0) + 1;
          });
        }

        // Collect techniques
        if (session.interventions && Array.isArray(session.interventions)) {
          allTechniques.push(...session.interventions);
        }

        // Count emotions
        if (session.emotionalAnalysis && typeof session.emotionalAnalysis === "object") {
          const emotions = (session.emotionalAnalysis as any).primaryEmotions;
          if (Array.isArray(emotions)) {
            emotions.forEach((emotion: string) => {
              allEmotions[emotion] = (allEmotions[emotion] || 0) + 1;
            });
          }
        }

        // Sum duration
        if (session.duration) {
          totalDuration += session.duration;
        }
      });

      // Get top recurring themes
      const topThemes = Object.entries(allThemes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([theme]) => theme);

      // Get unique techniques
      const uniqueTechniques = Array.from(new Set(allTechniques)).slice(0, 5);

      // Get top emotions
      const topEmotions = Object.entries(allEmotions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emotion]) => emotion);

      return {
        totalSessions: sessions.length,
        totalDuration,
        recentSessions: sessions
          .slice(-5)
          .reverse()
          .map((s) => ({
            id: s.id,
            date: s.sessionDate || s.createdAt,
            summary: s.summary || "Sem resumo",
            themes: s.keyThemes || [],
            techniques: s.interventions || [],
          })),
        recurringThemes: topThemes,
        effectiveTechniques: uniqueTechniques,
        primaryEmotions: topEmotions,
        recommendations: `Com base no histórico do paciente, recomenda-se focar nos temas recorrentes: ${topThemes.join(", ")}. Técnicas que funcionaram bem: ${uniqueTechniques.join(", ")}. Estados emocionais frequentes: ${topEmotions.join(", ")}.`,
      };
    }),

  /**
   * Get AI suggestions based on patient history
   * Analyzes past sessions to recommend techniques
   */
  getSuggestions: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        currentContext: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get patient's recent sessions and treatment plan
      const sessions = await db
        .select()
        .from(sessionNotes)
        .where(eq(sessionNotes.patientId, input.patientId))
        .orderBy((col) => col.createdAt)
        .limit(10);

      const successfulInterventions = sessions
        .filter((s) => s.interventions && s.interventions.length > 0)
        .flatMap((s) => s.interventions || []);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a clinical psychology expert. Based on the patient's history, suggest the most effective therapeutic techniques and interventions.
Consider what has worked well in the past and what hasn't.
Provide specific, actionable recommendations in Portuguese (Brazilian).`,
          },
          {
            role: "user",
            content: `Patient history summary:
Sessions completed: ${sessions.length}
Previously successful interventions: ${successfulInterventions.join(", ") || "None recorded"}
Current context: ${input.currentContext || "General session"}

What are the best therapeutic approaches and specific techniques to use in this session?`,
          },
        ],
      });

      const suggestionsText =
        typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "";

      return {
        suggestions: suggestionsText,
        successfulTechniques: successfulInterventions,
        sessionCount: sessions.length,
      };
    }),

  /**
   * Analyze emotional patterns from transcription
   */
  analyzeEmotions: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        transcript: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Analyze the emotional content of this session transcript. Identify:
1. Primary emotions expressed
2. Emotional intensity (1-10 scale)
3. Emotional shifts or patterns
4. Emotional regulation indicators
5. Potential triggers

Respond in JSON format with these fields in Portuguese.`,
          },
          {
            role: "user",
            content: input.transcript,
          },
        ],
      });

      const analysisText =
        typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "{}";

      try {
        const emotionalAnalysis = JSON.parse(analysisText);
        return emotionalAnalysis;
      } catch {
        return {
          analysis: analysisText,
          timestamp: new Date(),
        };
      }
    }),

  /**
   * Generate homework/tasks for patient
   */
  generateHomework: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        sessionSummary: z.string(),
        mainThemes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Generate practical homework assignments for a therapy patient based on the session.
The tasks should be:
- Specific and measurable
- Achievable between sessions
- Related to the session themes
- Aligned with evidence-based practices

Respond in Portuguese (Brazilian) with 2-3 concrete tasks.`,
          },
          {
            role: "user",
            content: `Session summary: ${input.sessionSummary}
Main themes: ${input.mainThemes?.join(", ") || "General"}

What homework should this patient do before the next session?`,
          },
        ],
      });

      const homeworkText =
        typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "";

      return {
        homework: homeworkText,
        timestamp: new Date(),
      };
    }),
});

// ═══════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function extractSummary(text: string): string {
  const lines = text.split("\n");
  const summaryLine = lines.find(
    (line) =>
      line.toLowerCase().includes("summary") ||
      line.toLowerCase().includes("resumo")
  );

  if (summaryLine) {
    return summaryLine.replace(/^[^:]*:\s*/, "").trim();
  }

  return lines.slice(0, 3).join(" ").substring(0, 200);
}

function extractThemes(text: string): string[] {
  const themes: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (
      line.toLowerCase().includes("theme") ||
      line.toLowerCase().includes("tema")
    ) {
      const theme = line.replace(/^[^:]*:\s*/, "").trim();
      if (theme && theme.length > 0) {
        themes.push(theme);
      }
    }
  }

  return themes.slice(0, 5);
}

function extractSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (
      line.toLowerCase().includes("suggest") ||
      line.toLowerCase().includes("recommend") ||
      line.toLowerCase().includes("interven")
    ) {
      const suggestion = line.replace(/^[^:]*:\s*/, "").trim();
      if (suggestion && suggestion.length > 0) {
        suggestions.push(suggestion);
      }
    }
  }

  return suggestions.slice(0, 5);
}
