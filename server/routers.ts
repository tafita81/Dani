import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { clinicalAssistantRouter } from "./routers/clinicalAssistant";
import { carAssistantRouter } from "./routers/carAssistant";
import { agentRouter } from "./routers/agent";
import { seedRouter } from "./routers/seed";
import { intelligentAnalysisRouter } from "./routers/intelligentAnalysis";
import {
  getPatientsByUserId,
  getPatientById,
  searchPatients,
  getPatientByPhone,
  getAppointmentsByUserId,
  getAppointmentsByPatientId,
  getUpcomingAppointments,
  getSessionsByPatientId,
  getSessionById,
  getRecentSessions,
  getLeadsByUserId,
  getLeadsByStage,
  getLeadById,
  getProfessionalProfile,
  getTreatmentPlansByPatientId,
  getActiveTreatmentPlan,
  getInventoryResultsByPatientId,
  getInventoryResultsByType,
  getAnamnesisbyPatientId,
  getCognitiveConcepts,
  getMoodEntriesByPatientId,
  getDb,
} from "./db";
import { z } from "zod";
import { patients, appointments, sessionNotes, leads, professionalProfile, treatmentPlans, inventoryResults, anamnesis, cognitiveConcepts, moodEntries } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════
//  ROUTERS
// ═══════════════════════════════════════════════════════════

export const appRouter = router({
  system: systemRouter,

  // ═══════════════════════════════════════════════════════════
  //  ASSISTENTE CLÍNICO
  // ═══════════════════════════════════════════════════════════

  clinicalAssistant: clinicalAssistantRouter,
  carAssistant: carAssistantRouter,
  agent: agentRouter,
  intelligentAnalysis: intelligentAnalysisRouter,
  seed: seedRouter,

  // ═══════════════════════════════════════════════════════════
  //  AUTENTICAÇÃO
  // ═══════════════════════════════════════════════════════════

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  PERFIL PROFISSIONAL
  // ═══════════════════════════════════════════════════════════

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getProfessionalProfile(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          crp: z.string().optional(),
          bio: z.string().optional(),
          specialties: z.array(z.string()).optional(),
          approaches: z.array(z.string()).optional(),
          sessionPrice: z.number().optional(),
          sessionDuration: z.number().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          instagram: z.string().optional(),
          whatsapp: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const existing = await getProfessionalProfile(ctx.user.id);

        if (existing) {
          await db
            .update(professionalProfile)
            .set(input)
            .where(eq(professionalProfile.userId, ctx.user.id));
        } else {
          await db.insert(professionalProfile).values({
            userId: ctx.user.id,
            ...input,
          });
        }

        return getProfessionalProfile(ctx.user.id);
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  PACIENTES
  // ═══════════════════════════════════════════════════════════

  patients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getPatientsByUserId(ctx.user.id);
    }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        return searchPatients(ctx.user.id, input.query);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPatientById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          birthDate: z.string().optional(),
          gender: z.enum(["M", "F", "other"]).optional(),
          occupation: z.string().optional(),
          origin: z.enum(["instagram", "whatsapp", "telegram", "site", "indication", "other"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(patients).values({
          userId: ctx.user.id,
          ...input,
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          birthDate: z.string().optional(),
          gender: z.enum(["M", "F", "other"]).optional(),
          occupation: z.string().optional(),
          notes: z.string().optional(),
          status: z.enum(["active", "inactive", "waitlist"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await db.update(patients).set(data).where(eq(patients.id, id));

        return getPatientById(id);
      }),

    getByPhone: protectedProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ ctx, input }) => {
        return getPatientByPhone(ctx.user.id, input.phone);
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  AGENDA
  // ═══════════════════════════════════════════════════════════

  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getAppointmentsByUserId(ctx.user.id);
    }),

    upcoming: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return getUpcomingAppointments(ctx.user.id, input.limit);
      }),

    byPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getAppointmentsByPatientId(input.patientId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          patientId: z.number().optional(),
          title: z.string(),
          startTime: z.date(),
          endTime: z.date(),
          type: z.enum(["online", "presential"]),
          meetLink: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(appointments).values({
          userId: ctx.user.id,
          ...input,
        });

        return result;
      }),
    createPending: publicProcedure
      .input(
        z.object({
          patientName: z.string(),
          patientEmail: z.string().email(),
          patientPhone: z.string(),
          appointmentType: z.enum(["first", "return", "routine", "evaluation", "follow_up", "emergency"]),
          modality: z.enum(["online", "presential", "hybrid"]),
          preferredDate: z.date(),
          preferredTime: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const startTime = new Date(input.preferredDate);
        const [hours, minutes] = input.preferredTime.split(":");
        startTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        const result = await db.insert(appointments).values({
          userId: 1,
          title: `Agendamento: ${input.patientName}`,
          startTime,
          endTime,
          type: input.modality === "online" ? "online" : "presential",
          appointmentType: input.appointmentType,
          modality: input.modality,
          status: "scheduled",
          notes: `Nome: ${input.patientName}\nEmail: ${input.patientEmail}\nTelefone: ${input.patientPhone}`,
          observations: `Agendamento publico - Aguardando confirmacao`,
        });

        return { success: true, appointmentId: 0 };
      }),


    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "confirmed", "done", "cancelled", "no_show"]).optional(),
          notes: z.string().optional(),
          reminderSent: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await db.update(appointments).set(data).where(eq(appointments.id, id));

        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  SESSÕES
  // ═══════════════════════════════════════════════════════════

  sessions: router({
    byPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getSessionsByPatientId(input.patientId);
      }),

    recent: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return getRecentSessions(ctx.user.id, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getSessionById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          appointmentId: z.number().optional(),
          transcript: z.string().optional(),
          summary: z.string().optional(),
          keyThemes: z.array(z.string()).optional(),
          interventions: z.array(z.string()).optional(),
          homework: z.string().optional(),
          nextSession: z.string().optional(),
          aiSuggestions: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(sessionNotes).values({
          userId: ctx.user.id,
          ...input,
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          transcript: z.string().optional(),
          summary: z.string().optional(),
          keyThemes: z.array(z.string()).optional(),
          interventions: z.array(z.string()).optional(),
          homework: z.string().optional(),
          nextSession: z.string().optional(),
          aiSuggestions: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await db.update(sessionNotes).set(data).where(eq(sessionNotes.id, id));

        return getSessionById(id);
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  CRM - LEADS
  // ═══════════════════════════════════════════════════════════

  leads: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getLeadsByUserId(ctx.user.id);
    }),

    byStage: protectedProcedure
      .input(z.object({ stage: z.string() }))
      .query(async ({ ctx, input }) => {
        return getLeadsByStage(ctx.user.id, input.stage);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLeadById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          source: z.enum(["instagram", "whatsapp", "telegram", "site", "tiktok", "other"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(leads).values({
          userId: ctx.user.id,
          ...input,
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          stage: z.enum(["lead", "prospect", "scheduled", "converted", "lost"]).optional(),
          score: z.number().optional(),
          notes: z.string().optional(),
          patientId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await db.update(leads).set(data).where(eq(leads.id, id));

        return getLeadById(id);
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  PLANOS DE TRATAMENTO
  // ═══════════════════════════════════════════════════════════

  treatmentPlans: router({
    byPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getTreatmentPlansByPatientId(input.patientId);
      }),

    active: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getActiveTreatmentPlan(input.patientId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          goals: z.array(z.object({ goal: z.string(), achieved: z.boolean() })),
          approach: z.string(),
          techniques: z.array(z.string()),
          estimatedSessions: z.number().optional(),
          frequency: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(treatmentPlans).values([input]);

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          goals: z.array(z.object({ goal: z.string(), achieved: z.boolean() })).optional(),
          approach: z.string().optional(),
          techniques: z.array(z.string()).optional(),
          frequency: z.string().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await db.update(treatmentPlans).set(data).where(eq(treatmentPlans.id, id));

        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  INVENTÁRIOS E AVALIAÇÕES
  // ═══════════════════════════════════════════════════════════

  inventories: router({
    byPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getInventoryResultsByPatientId(input.patientId);
      }),

    byType: protectedProcedure
      .input(z.object({ patientId: z.number(), type: z.string() }))
      .query(async ({ input }) => {
        return getInventoryResultsByType(input.patientId, input.type);
      }),

    create: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          type: z.enum(["BDI-II", "BAI", "PHQ-9", "GAD-7", "DASS-21", "PCL-5"]),
          answers: z.record(z.string(), z.number()),
          totalScore: z.number(),
          severity: z.string().optional(),
          interpretation: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(inventoryResults).values([input]);

        return result;
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  ANAMNESE
  // ═══════════════════════════════════════════════════════════

  anamnesis: router({
    get: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getAnamnesisbyPatientId(input.patientId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          mainComplaint: z.string().optional(),
          history: z.string().optional(),
          familyHistory: z.string().optional(),
          medicalHistory: z.string().optional(),
          medications: z.array(z.string()).optional(),
          previousTherapy: z.boolean().optional(),
          previousTherapyDetails: z.string().optional(),
          sleepPattern: z.string().optional(),
          exerciseHabits: z.string().optional(),
          substanceUse: z.string().optional(),
          socialSupport: z.string().optional(),
          workSituation: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(anamnesis).values([input]);

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          mainComplaint: z.string().optional(),
          history: z.string().optional(),
          familyHistory: z.string().optional(),
          medicalHistory: z.string().optional(),
          medications: z.array(z.string()).optional(),
          previousTherapy: z.boolean().optional(),
          previousTherapyDetails: z.string().optional(),
          sleepPattern: z.string().optional(),
          exerciseHabits: z.string().optional(),
          substanceUse: z.string().optional(),
          socialSupport: z.string().optional(),
          workSituation: z.string().optional(),
          completed: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { patientId, ...data } = input;
        await db
          .update(anamnesis)
          .set(data)
          .where(eq(anamnesis.patientId, patientId));

        return getAnamnesisbyPatientId(patientId);
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  CONCEITOS COGNITIVOS
  // ═══════════════════════════════════════════════════════════

  cognitiveConcepts: router({
    get: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getCognitiveConcepts(input.patientId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          coreBeliefs: z.array(z.string()).optional(),
          intermediateBeliefs: z.array(z.string()).optional(),
          automaticThoughts: z.array(z.string()).optional(),
          compensatoryStrategies: z.array(z.string()).optional(),
          triggers: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(cognitiveConcepts).values([input]);

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          coreBeliefs: z.array(z.string()).optional(),
          intermediateBeliefs: z.array(z.string()).optional(),
          automaticThoughts: z.array(z.string()).optional(),
          compensatoryStrategies: z.array(z.string()).optional(),
          triggers: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { patientId, ...data } = input;
        await db
          .update(cognitiveConcepts)
          .set(data)
          .where(eq(cognitiveConcepts.patientId, patientId));

        return getCognitiveConcepts(patientId);
      }),
  }),

  // ═══════════════════════════════════════════════════════════
  //  REGISTROS DE HUMOR
  // ═══════════════════════════════════════════════════════════

  mood: router({
    byPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getMoodEntriesByPatientId(input.patientId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          patientId: z.number(),
          score: z.number().min(1).max(10),
          emotion: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(moodEntries).values([input]);

        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
