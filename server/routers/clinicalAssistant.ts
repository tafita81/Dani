import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { sessionNotes } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Clinical Assistant Router
 * Handles AI-powered clinical features:
 * - Real-time transcription analysis
 * - AI suggestions for interventions
 * - Automatic session note generation
 * - Patient history context
 */

export const clinicalAssistantRouter = router({
  /**
   * Analyze transcription and provide AI suggestions
   * Based on patient history and clinical best practices
   */
  analyzeSpeech: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        transcript: z.string(),
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

      return {
        analysis: analysisText,
        suggestions,
        themes,
        timestamp: new Date(),
      };
    }),

  /**
   * Generate automatic session notes from transcript
   */
  generateSessionNotes: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        transcript: z.string(),
        duration: z.number().optional(),
        mainThemes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      return {
        summary: extractSummary(notesText),
        fullNotes: notesText,
        keyThemes: input.mainThemes || extractThemes(notesText),
        timestamp: new Date(),
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
