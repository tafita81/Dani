/**
 * Router tRPC para Recomendação Inteligente de Técnicas
 * Integra IA com base de conhecimento para sugerir técnicas em tempo real
 */

import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { recommendTechniques, techniqueKnowledgeBase } from "./techniqueKnowledgeBase";

export const techniqueRouter = router({
  /**
   * Recomenda técnicas baseado no estado atual da sessão
   */
  recommendForSession: protectedProcedure
    .input(z.object({
      patientId: z.number(),
      currentPresentation: z.string(),
      mainThemes: z.array(z.string()),
      sessionTranscript: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Busca histórico do paciente
      const patient = await db.getPatientById(ctx.user.id, input.patientId);
      if (!patient) throw new Error("Paciente não encontrado");

      // Busca evoluções anteriores
      const evolutions = await db.getSessionEvolutions(ctx.user.id, input.patientId);
      
      // Extrai técnicas usadas anteriormente e sua efetividade
      const previousTechniques = evolutions
        .flatMap(e => {
          const techniques = e.techniquesUsed as any[];
          return techniques?.map(t => ({
            technique: t.name || t,
            effectiveness: e.progressNotes ? 75 : 50, // Simplificado
          })) || [];
        })
        .slice(-10); // Últimas 10 técnicas

      // Busca anamnese para contexto
      const anamnesis = await db.getAnamnesis(ctx.user.id, input.patientId);
      
      // Constrói histórico do paciente
      const patientHistory = [
        patient.name,
        patient.notes,
        anamnesis?.mainComplaint,
        evolutions.map(e => e.mainThemes).join(" "),
      ].filter(Boolean).join(" ");

      // Recomenda técnicas
      const recommendations = recommendTechniques(
        input.currentPresentation,
        input.mainThemes,
        previousTechniques,
        patientHistory,
        5
      );

      // Usa IA para gerar contexto adicional
      const aiContext = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um assistente clínico especializado em psicologia. Analise as técnicas recomendadas e forneça insights adicionais sobre qual combinação seria mais efetiva para este caso específico.`,
          },
          {
            role: "user",
            content: `Paciente: ${patient.name}
Apresentação atual: ${input.currentPresentation}
Temas principais: ${input.mainThemes.join(", ")}
Histórico: ${patientHistory}

Técnicas recomendadas:
${recommendations.map(r => `- ${r.technique.name} (${r.technique.approach}): ${r.reasoning}`).join("\n")}

Forneça uma análise de qual combinação de técnicas seria mais efetiva e por quê.`,
          },
        ],
      });

      return {
        recommendations,
        aiInsight: aiContext.choices[0].message.content,
        timestamp: new Date(),
      };
    }),

  /**
   * Registra efetividade de uma técnica após uso
   */
  recordTechniqueEffectiveness: protectedProcedure
    .input(z.object({
      evolutionId: z.number(),
      techniqueName: z.string(),
      effectiveness: z.number().min(0).max(100),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Atualiza evolução com feedback de efetividade
      await db.updateSessionEvolution(ctx.user.id, input.evolutionId, {
        aiSuggestions: JSON.stringify({
          recordedTechnique: input.techniqueName,
          effectiveness: input.effectiveness,
          notes: input.notes,
          timestamp: new Date(),
        }),
      });

      return { success: true };
    }),

  /**
   * Retorna todas as técnicas disponíveis
   */
  getAllTechniques: protectedProcedure.query(() => {
    return techniqueKnowledgeBase.map(t => ({
      id: t.id,
      name: t.name,
      approach: t.approach,
      description: t.description,
      indications: t.indications,
      timeRequired: t.timeRequired,
      complexity: t.complexity,
    }));
  }),

  /**
   * Busca técnicas por abordagem
   */
  getTechniquesByApproach: protectedProcedure
    .input(z.object({
      approach: z.enum(["TCC", "Esquema", "Gestalt", "Psicodrama", "Mindfulness", "Integrada"]),
    }))
    .query(({ input }) => {
      return techniqueKnowledgeBase.filter(t => t.approach === input.approach);
    }),

  /**
   * Gera plano de tratamento com técnicas recomendadas
   */
  generateTreatmentPlan: protectedProcedure
    .input(z.object({
      patientId: z.number(),
      goals: z.array(z.string()),
      duration: z.number(), // semanas
    }))
    .mutation(async ({ ctx, input }) => {
      const patient = await db.getPatientById(ctx.user.id, input.patientId);
      if (!patient) throw new Error("Paciente não encontrado");

      const anamnesis = await db.getAnamnesis(ctx.user.id, input.patientId);
      
      // Recomenda técnicas para cada objetivo
      const planByGoal = input.goals.map(goal => {
        const recommendations = recommendTechniques(
          goal,
          [goal],
          [],
          patient.notes || "",
          3
        );

        return {
          goal,
          recommendedTechniques: recommendations.map(r => ({
            name: r.technique.name,
            approach: r.technique.approach,
            duration: r.technique.timeRequired,
            reasoning: r.reasoning,
          })),
        };
      });

      // Usa IA para gerar plano integrado
      const aiPlan = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um planejador clínico especializado. Crie um plano de tratamento estruturado que integre as técnicas recomendadas de forma coerente.`,
          },
          {
            role: "user",
            content: `Crie um plano de tratamento para ${input.duration} semanas com os seguintes objetivos:
${input.goals.map(g => `- ${g}`).join("\n")}

Técnicas recomendadas por objetivo:
${planByGoal.map(p => `${p.goal}: ${p.recommendedTechniques.map(t => t.name).join(", ")}`).join("\n")}

Forneça um plano estruturado com sequência de técnicas, frequência e marcos de progresso.`,
          },
        ],
      });

      return {
        patientName: patient.name,
        duration: input.duration,
        goals: input.goals,
        planByGoal,
        integratedPlan: aiPlan.choices[0].message.content,
        createdAt: new Date(),
      };
    }),
});

export default techniqueRouter;
