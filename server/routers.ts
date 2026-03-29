import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { generateIcs } from "./ics";
import * as gcal from "./googleCalendar";
import * as ocal from "./outlookCalendar";
import * as igm from "./instagramManager";
import { nanoid } from "nanoid";
import techniqueRouter from "./techniqueRecommender";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Dashboard ───
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
    upcoming: protectedProcedure.query(async ({ ctx }) => {
      return db.getUpcomingAppointments(ctx.user.id, 10);
    }),
  }),

  // ─── Patients ───
  patients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPatients(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPatientById(ctx.user.id, input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        whatsappId: z.string().optional(),
        telegramChatId: z.string().optional(),
        instagramHandle: z.string().optional(),
        dateOfBirth: z.string().optional(),
        notes: z.string().optional(),
        source: z.enum(["whatsapp", "telegram", "instagram", "website", "indicacao", "manual"]).optional(),
        sourceDetail: z.string().optional(),
        primaryApproach: z.enum(["tcc", "terapia_esquema", "gestalt", "integrativa"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createPatient({ ...input, userId: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        whatsappId: z.string().optional(),
        telegramChatId: z.string().optional(),
        instagramHandle: z.string().optional(),
        dateOfBirth: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["active", "inactive", "archived"]).optional(),
        primaryApproach: z.enum(["tcc", "terapia_esquema", "gestalt", "integrativa"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updatePatient(ctx.user.id, id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePatient(ctx.user.id, input.id);
        return { success: true };
      }),
    fullContext: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPatientFullContext(ctx.user.id, input.patientId);
      }),
  }),

  // ─── Appointments ───
  appointments: router({
    list: protectedProcedure
      .input(z.object({ startMs: z.number().optional(), endMs: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getAppointments(ctx.user.id, input?.startMs, input?.endMs);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAppointmentById(ctx.user.id, input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        patientId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        startTime: z.number(),
        endTime: z.number(),
        source: z.enum(["manual", "whatsapp", "telegram", "instagram", "google_calendar", "outlook_calendar", "website"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createAppointment({
          ...input,
          userId: ctx.user.id,
          source: input.source || "manual",
        });
        // Sync with Google Calendar
        try {
          const gcalSetting = await db.getIntegrationSetting(ctx.user.id, "google_calendar");
          if (gcalSetting?.isActive && gcalSetting.config) {
            const config = gcalSetting.config as gcal.GoogleCalendarConfig;
            const event = await gcal.createEvent(config, {
              summary: input.title,
              description: input.description,
              start: { dateTime: new Date(input.startTime).toISOString() },
              end: { dateTime: new Date(input.endTime).toISOString() },
            });
            if (event?.id && result?.id) {
              await db.updateAppointment(ctx.user.id, result.id, { googleEventId: event.id });
            }
          }
        } catch (e) { console.warn("[GCal] Sync failed:", e); }
        // Sync with Outlook Calendar
        try {
          const ocalSetting = await db.getIntegrationSetting(ctx.user.id, "outlook_calendar");
          if (ocalSetting?.isActive && ocalSetting.config) {
            const config = ocalSetting.config as ocal.OutlookCalendarConfig;
            const event = await ocal.createEvent(config, {
              subject: input.title,
              description: input.description,
              start: { dateTime: new Date(input.startTime).toISOString() },
              end: { dateTime: new Date(input.endTime).toISOString() },
            });
            if (event?.id && result?.id) {
              await db.updateAppointment(ctx.user.id, result.id, { googleEventId: event.id });
            }
          }
        } catch (e) { console.warn("[Outlook] Sync failed:", e); }
        // Alert
        if (result?.id) {
          await db.createAlert({
            userId: ctx.user.id,
            type: "new_appointment",
            title: "Novo agendamento",
            message: `Consulta "${input.title}" agendada para ${new Date(input.startTime).toLocaleString("pt-BR")}`,
            relatedId: result.id,
          });
        }
        return result;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
        patientId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateAppointment(ctx.user.id, id, data);
        if (data.status === "cancelled") {
          await db.createAlert({
            userId: ctx.user.id,
            type: "cancellation",
            title: "Consulta cancelada",
            message: `A consulta #${id} foi cancelada.`,
            relatedId: id,
          });
        }
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAppointment(ctx.user.id, input.id);
        return { success: true };
      }),
    generateIcs: protectedProcedure
      .input(z.object({ appointmentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const appt = await db.getAppointmentById(ctx.user.id, input.appointmentId);
        if (!appt) throw new Error("Consulta não encontrada");
        let patientName = "Paciente"; let patientEmail: string | undefined;
        if (appt.patientId) {
          const patient = await db.getPatientById(ctx.user.id, appt.patientId);
          if (patient) { patientName = patient.name; patientEmail = patient.email || undefined; }
        }
        const icsContent = generateIcs({
          title: appt.title, description: appt.description || undefined,
          startTime: appt.startTime, endTime: appt.endTime,
          organizerName: ctx.user.name || "Terapeuta",
          organizerEmail: ctx.user.email || undefined,
          attendeeName: patientName, attendeeEmail: patientEmail,
        });
        const fileKey = `ics/${ctx.user.id}/${nanoid()}.ics`;
        const { url } = await storagePut(fileKey, icsContent, "text/calendar");
        await db.updateAppointment(ctx.user.id, input.appointmentId, { icsSent: true });
        return { url, filename: `consulta-${appt.id}.ics` };
      }),
    freeSlots: protectedProcedure
      .input(z.object({
        date: z.string(),
        workingStart: z.number().optional(),
        workingEnd: z.number().optional(),
        slotDuration: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Try Outlook Calendar first
        const ocalSetting = await db.getIntegrationSetting(ctx.user.id, "outlook_calendar");
        if (ocalSetting?.isActive && ocalSetting.config) {
          const config = ocalSetting.config as ocal.OutlookCalendarConfig;
          return ocal.findFreeSlots(config, input.date, { start: input.workingStart || 8, end: input.workingEnd || 18 }, input.slotDuration || 50);
        }
        // Fallback to Google Calendar
        const gcalSetting = await db.getIntegrationSetting(ctx.user.id, "google_calendar");
        if (gcalSetting?.isActive && gcalSetting.config) {
          const config = gcalSetting.config as gcal.GoogleCalendarConfig;
          return gcal.findFreeSlots(config, input.date, { start: input.workingStart || 8, end: input.workingEnd || 18 }, input.slotDuration || 50);
        }
        // Fallback: generate slots from DB appointments
        const start = input.workingStart || 8; const end = input.workingEnd || 18;
        const duration = input.slotDuration || 50; const slots: { start: number; end: number }[] = [];
        const dateBase = new Date(`${input.date}T00:00:00-03:00`);
        for (let h = start; h < end; h++) {
          for (let m = 0; m + duration <= 60; m += duration) {
            const slotStart = new Date(dateBase); slotStart.setHours(h, m, 0, 0);
            const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);
            if (slotEnd.getHours() <= end) slots.push({ start: slotStart.getTime(), end: slotEnd.getTime() });
          }
        }
        return slots;
      }),
  }),

  // ─── Session Notes ───
  sessionNotes: router({
    list: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getSessionNotes(ctx.user.id, input.patientId);
      }),
    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        appointmentId: z.number().optional(),
        content: z.string().min(1),
        transcription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let summary: string | undefined;
        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: "Você é um assistente clínico para psicólogos. Resuma a nota de sessão em 2-3 frases concisas em português brasileiro." },
              { role: "user", content: input.content },
            ],
          });
          summary = typeof result.choices[0]?.message?.content === "string" ? result.choices[0].message.content : undefined;
        } catch (e) { console.warn("[LLM] Summary failed:", e); }
        return db.createSessionNote({ ...input, userId: ctx.user.id, summary });
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), content: z.string().optional(), summary: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateSessionNote(ctx.user.id, id, data);
        return { success: true };
      }),
  }),

  // ─── Documents ───
  documents: router({
    list: protectedProcedure
      .input(z.object({ patientId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getDocuments(ctx.user.id, input?.patientId);
      }),
    upload: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        category: z.enum(["evolution", "report", "exam", "prescription", "other"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const ext = input.fileName.split(".").pop() || "bin";
        const fileKey = `docs/${ctx.user.id}/${input.patientId}/${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return db.createDocument({
          userId: ctx.user.id, patientId: input.patientId,
          fileName: input.fileName, fileKey, fileUrl: url,
          mimeType: input.mimeType, fileSize: input.fileSize,
          category: input.category || "other",
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteDocument(ctx.user.id, input.id);
        return { success: true };
      }),
  }),

  // ─── Messages ───
  messages: router({
    byPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPatientMessages(ctx.user.id, input.patientId);
      }),
    recent: protectedProcedure
      .input(z.object({ channel: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getMessageLogs(ctx.user.id, undefined, input?.channel);
      }),
  }),

  // ─── Alerts ───
  alerts: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getAlerts(ctx.user.id, input?.unreadOnly);
      }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markAlertRead(ctx.user.id, input.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllAlertsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Integration Settings ───
  integrations: router({
    get: protectedProcedure
      .input(z.object({ provider: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getIntegrationSetting(ctx.user.id, input.provider);
      }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllIntegrations(ctx.user.id);
    }),
    save: protectedProcedure
      .input(z.object({
        provider: z.enum(["google_calendar", "outlook_calendar", "whatsapp", "telegram", "instagram"]),
        config: z.any(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertIntegrationSetting({
          userId: ctx.user.id,
          provider: input.provider,
          config: input.config,
          isActive: input.isActive,
        });
        return { success: true };
      }),
    googleAuthUrl: protectedProcedure
      .input(z.object({ clientId: z.string(), origin: z.string() }))
      .query(({ input }) => {
        const redirectUri = `${input.origin}/api/google-callback`;
        return { url: gcal.getAuthUrl(input.clientId, redirectUri) };
      }),
  }),

  // ─── Professional Profile ───
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getProfile(ctx.user.id);
    }),
    save: protectedProcedure
      .input(z.object({
        displayName: z.string().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        bio: z.string().optional(),
        crp: z.string().optional(),
        specialties: z.any().optional(),
        education: z.any().optional(),
        photoUrl: z.string().optional(),
        heroPhotoUrl: z.string().optional(),
        instagramUrl: z.string().optional(),
        instagramHandle: z.string().optional(),
        tiktokUrl: z.string().optional(),
        tiktokHandle: z.string().optional(),
        youtubeUrl: z.string().optional(),
        youtubeHandle: z.string().optional(),
        whatsappNumber: z.string().optional(),
        telegramUrl: z.string().optional(),
        linkedinUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        primaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        tagline: z.string().optional(),
        yearsExperience: z.number().optional(),
        patientsServed: z.number().optional(),
        sessionsCompleted: z.number().optional(),
        featuredVideoUrl: z.string().optional(),
        featuredReelUrls: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertProfile({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    public: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getPublicProfile(input.userId);
      }),
  }),

  // ─── Testimonials ───
  testimonials: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTestimonials(ctx.user.id);
    }),
    public: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getTestimonials(input.userId, true);
      }),
    create: protectedProcedure
      .input(z.object({
        authorName: z.string().min(1),
        authorInitials: z.string().optional(),
        content: z.string().min(1),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTestimonial({ ...input, userId: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        authorName: z.string().optional(),
        content: z.string().optional(),
        rating: z.number().optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateTestimonial(ctx.user.id, id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTestimonial(ctx.user.id, input.id);
        return { success: true };
      }),
  }),

  // ─── CRM de Vendas — Leads ───
  leads: router({
    list: protectedProcedure
      .input(z.object({ stage: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getLeads(ctx.user.id, input?.stage);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getLeadById(ctx.user.id, input.id);
      }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getLeadStats(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        instagramHandle: z.string().optional(),
        telegramChatId: z.string().optional(),
        source: z.enum(["whatsapp", "telegram", "instagram", "website", "indicacao", "outro"]),
        sourceDetail: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createLead({ ...input, userId: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        funnelStage: z.enum(["lead", "contato", "interesse", "agendamento", "consulta", "paciente_ativo", "perdido"]).optional(),
        score: z.number().optional(),
        notes: z.string().optional(),
        tags: z.any().optional(),
        nextFollowUpAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.nextFollowUpAt) updateData.nextFollowUpAt = new Date(data.nextFollowUpAt);
        await db.updateLead(ctx.user.id, id, updateData);
        return { success: true };
      }),
    addInteraction: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        channel: z.enum(["whatsapp", "telegram", "instagram", "website", "telefone", "email"]),
        type: z.enum(["mensagem_recebida", "mensagem_enviada", "comentario", "dm", "visita_site", "agendamento", "cancelamento", "follow_up", "ligacao"]),
        content: z.string().optional(),
        scoreImpact: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createLeadInteraction({ ...input, userId: ctx.user.id });
      }),
    interactions: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getLeadInteractions(ctx.user.id, input.leadId);
      }),
    convertToPatient: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.convertLeadToPatient(ctx.user.id, input.leadId);
      }),
  }),

  // ─── Prontuário Clínico ───
  clinical: router({
    // Anamnese
    getAnamnesis: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAnamnesis(ctx.user.id, input.patientId);
      }),
    saveAnamnesis: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.upsertAnamnesis({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
    // Conceituação Cognitiva (TCC)
    getCognitiveConcept: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getCognitiveConcept(ctx.user.id, input.patientId);
      }),
    saveCognitiveConcept: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.upsertCognitiveConcept({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
    // Schema Assessments (TE)
    getSchemaAssessments: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getSchemaAssessments(ctx.user.id, input.patientId);
      }),
    createSchemaAssessment: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.createSchemaAssessment({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
    // Gestalt Assessments
    getGestaltAssessments: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getGestaltAssessments(ctx.user.id, input.patientId);
      }),
    createGestaltAssessment: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.createGestaltAssessment({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
    // Thought Records (RPD)
    getThoughtRecords: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getThoughtRecords(ctx.user.id, input.patientId);
      }),
    createThoughtRecord: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.createThoughtRecord({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
    // Treatment Plan
    getTreatmentPlan: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getTreatmentPlan(ctx.user.id, input.patientId);
      }),
    saveTreatmentPlan: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.upsertTreatmentPlan({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
    // Session Evolutions
    getEvolutions: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getSessionEvolutions(ctx.user.id, input.patientId);
      }),
    createEvolution: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.createSessionEvolution({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
    updateEvolution: protectedProcedure
      .input(z.object({ id: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSessionEvolution(ctx.user.id, input.id, input.data);
        return { success: true };
      }),
    // Mood Entries
    getMoodEntries: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getMoodEntries(ctx.user.id, input.patientId);
      }),
    createMoodEntry: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        appointmentId: z.number().optional(),
        mood: z.number().min(1).max(5),
        moodLabel: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createMoodEntry({ ...input, userId: ctx.user.id });
      }),
    // Inventory Results
    getInventoryResults: protectedProcedure
      .input(z.object({ patientId: z.number(), type: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getInventoryResults(ctx.user.id, input.patientId, input.type);
      }),
    createInventoryResult: protectedProcedure
      .input(z.object({ patientId: z.number(), data: z.any() }))
      .mutation(async ({ ctx, input }) => {
        return db.createInventoryResult({ ...input.data, userId: ctx.user.id, patientId: input.patientId });
      }),
  }),

  // ─── AI Assistant ───
  assistant: router({
    chat: protectedProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const stats = await db.getDashboardStats(ctx.user.id);
        const upcoming = await db.getUpcomingAppointments(ctx.user.id, 5);
        const allPatients = await db.getPatients(ctx.user.id);

        const upcomingStr = upcoming.map(a => {
          const date = new Date(a.startTime).toLocaleDateString("pt-BR");
          const time = new Date(a.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          const patient = allPatients.find(p => p.id === a.patientId);
          return `- ${date} ${time}: ${a.title}${patient ? ` (${patient.name})` : ""} [${a.status}]`;
        }).join("\n");

        const patientsStr = allPatients.map(p => `- ${p.name} (ID:${p.id}, ${p.status}, abordagem: ${p.primaryApproach})`).join("\n");

        const systemPrompt = `Você é o Assistente Clínico da Psi. Daniela Coelho. Você ajuda a organizar agenda, resumir sessões, gerenciar pacientes e otimizar o tempo.
Responda sempre em português brasileiro, de forma profissional e objetiva.

CONTEXTO ATUAL:
- Data/Hora: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
- Total de pacientes: ${stats?.totalPatients || 0} (ativos: ${stats?.activePatients || 0})
- Consultas hoje: ${stats?.todayAppointments || 0}
- Alertas não lidos: ${stats?.unreadAlerts || 0}

PRÓXIMAS CONSULTAS:
${upcomingStr || "Nenhuma consulta agendada."}

PACIENTES:
${patientsStr || "Nenhum paciente cadastrado."}

Quando pedirem resumo de paciente, use o contexto disponível. Se precisar de mais dados, informe educadamente.`;

        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.message },
          ],
        });

        const response = typeof result.choices[0]?.message?.content === "string"
          ? result.choices[0].message.content
          : "Desculpe, não consegui processar. Tente novamente.";

        return { response };
      }),

    summarizePatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const context = await db.getPatientFullContext(ctx.user.id, input.patientId);
        if (!context.patient) throw new Error("Paciente não encontrado");

        const contextStr = JSON.stringify({
          patient: { name: context.patient.name, approach: context.patient.primaryApproach, sessions: context.patient.totalSessions },
          anamnesis: context.anamnesis ? { mainComplaint: context.anamnesis.mainComplaint, diagnosticHypothesis: context.anamnesis.diagnosticHypothesis } : null,
          treatmentPlan: context.treatmentPlan ? { approach: context.treatmentPlan.approach, objectives: context.treatmentPlan.mainObjectives } : null,
          recentEvolutions: context.sessionEvolutions.map(e => ({
            date: e.sessionDate, themes: e.mainThemes, progress: e.progressNotes, mood: e.moodAtArrival,
          })),
          recentMoods: context.moodEntries.map(m => ({ mood: m.mood, label: m.moodLabel, date: m.createdAt })),
        }, null, 2);

        const result = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente clínico para psicólogos. Faça um resumo pré-consulta completo do paciente, destacando: evolução recente, padrões identificados, pontos de atenção, sugestões para a próxima sessão. Use abordagem integrativa (TCC + TE + Gestalt). Responda em português brasileiro." },
            { role: "user", content: `Dados do paciente:\n${contextStr}` },
          ],
        });

        const response = typeof result.choices[0]?.message?.content === "string"
          ? result.choices[0].message.content : "Não foi possível gerar o resumo.";

        return { summary: response, patientName: context.patient.name };
      }),

    generateEvolutionSummary: protectedProcedure
      .input(z.object({ patientId: z.number(), transcription: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const context = await db.getPatientFullContext(ctx.user.id, input.patientId);

        const result = await invokeLLM({
          messages: [
            { role: "system", content: `Você é um assistente clínico. Com base na transcrição da sessão e no histórico do paciente, gere:
1. Resumo estruturado da sessão
2. Temas principais abordados
3. Esquemas/pensamentos automáticos identificados
4. Técnicas sugeridas para próxima sessão
5. Sugestões de tarefa de casa
Responda em português brasileiro, formato JSON com campos: summary, themes, identifiedPatterns, suggestedTechniques, homework.` },
            { role: "user", content: `Paciente: ${context.patient?.name}\nAbordagem: ${context.patient?.primaryApproach}\nTranscrição:\n${input.transcription}` },
          ],
        });

        const response = typeof result.choices[0]?.message?.content === "string"
          ? result.choices[0].message.content : "{}";

        try {
          return JSON.parse(response);
        } catch {
          return { summary: response, themes: [], identifiedPatterns: [], suggestedTechniques: [], homework: "" };
        }
      }),
  }),

  // ─── Public Booking ───
  booking: router({
    profile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getPublicProfile(input.userId);
        const testims = await db.getTestimonials(input.userId, true);
        return { profile, testimonials: testims };
      }),
    freeSlots: publicProcedure
      .input(z.object({ userId: z.number(), date: z.string() }))
      .query(async ({ input }) => {
        const gcalSetting = await db.getIntegrationSetting(input.userId, "google_calendar");
        if (gcalSetting?.isActive && gcalSetting.config) {
          const config = gcalSetting.config as gcal.GoogleCalendarConfig;
          return gcal.findFreeSlots(config, input.date, { start: 8, end: 18 }, 50);
        }
        const slots: { start: number; end: number }[] = [];
        const dateBase = new Date(`${input.date}T00:00:00-03:00`);
        for (let h = 8; h < 18; h++) {
          const slotStart = new Date(dateBase); slotStart.setHours(h, 0, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + 50 * 60 * 1000);
          slots.push({ start: slotStart.getTime(), end: slotEnd.getTime() });
        }
        return slots;
      }),
    request: publicProcedure
      .input(z.object({
        userId: z.number(),
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        message: z.string().optional(),
        startTime: z.number(),
        endTime: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Create or find lead
        let lead: any = input.phone ? await db.findLeadByPhone(input.userId, input.phone) : null;
        if (!lead) {
          lead = await db.createLead({
            userId: input.userId,
            name: input.name,
            phone: input.phone || null,
            email: input.email || null,
            source: "website",
            sourceDetail: "Agendamento pelo site",
            funnelStage: "agendamento",
            score: 50,
          });
        } else {
          await db.updateLead(input.userId, lead.id, { funnelStage: "agendamento", score: Math.min(100, lead.score + 30) });
        }
        // Create appointment
        const appt = await db.createAppointment({
          userId: input.userId,
          title: `Consulta - ${input.name}`,
          description: input.message,
          startTime: input.startTime,
          endTime: input.endTime,
          source: "website",
          bookingName: input.name,
          bookingEmail: input.email,
          bookingPhone: input.phone,
          bookingMessage: input.message,
          leadId: lead?.id,
        });
        // Alert
        await db.createAlert({
          userId: input.userId,
          type: "new_appointment",
          title: `Novo agendamento via site`,
          message: `${input.name} agendou para ${new Date(input.startTime).toLocaleString("pt-BR")}`,
          relatedId: appt?.id,
        });
        return { success: true, appointmentId: appt?.id };
      }),
  }),

  // ─── Instagram Management ───
  instagram: router({
    // Posts Management
    posts: router({
      create: protectedProcedure
        .input(z.object({
          caption: z.string().min(1),
          content: z.string(),
          mediaUrls: z.array(z.string()),
          mediaType: z.enum(["image", "video", "carousel", "reel", "story"]),
          hashtags: z.string().optional(),
          mentions: z.string().optional(),
          callToAction: z.string().optional(),
          scheduledFor: z.date().optional(),
          theme: z.string().optional(),
          contentType: z.enum(["educational", "testimonial", "promotional", "behind_the_scenes", "interactive", "motivational"]),
        }))
        .mutation(async ({ ctx, input }) => {
          return igm.createPost(ctx.user.id, input);
        }),
      
      update: protectedProcedure
        .input(z.object({
          postId: z.number(),
          caption: z.string().optional(),
          content: z.string().optional(),
          mediaUrls: z.array(z.string()).optional(),
          hashtags: z.string().optional(),
          mentions: z.string().optional(),
          callToAction: z.string().optional(),
          scheduledFor: z.date().optional(),
          status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { postId, ...data } = input;
          return igm.updatePost(ctx.user.id, postId, data);
        }),
      
      publish: protectedProcedure
        .input(z.object({ postId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const igConfig = await db.getIntegrationSetting(ctx.user.id, "instagram");
          if (!igConfig?.isActive || !igConfig.config) throw new Error("Instagram não configurado");
          return igm.publishPost(ctx.user.id, input.postId, igConfig.config as igm.InstagramConfig);
        }),
    }),

    // Analytics
    analytics: router({
      sync: protectedProcedure.mutation(async ({ ctx }) => {
        const igConfig = await db.getIntegrationSetting(ctx.user.id, "instagram");
        if (!igConfig?.isActive || !igConfig.config) throw new Error("Instagram não configurado");
        return igm.syncInstagramAnalytics(ctx.user.id, igConfig.config as igm.InstagramConfig);
      }),

      growthStrategy: protectedProcedure.query(async ({ ctx }) => {
        return igm.generateGrowthStrategy(ctx.user.id);
      }),
    }),

    // Content Ideas
    contentIdeas: protectedProcedure
      .input(z.object({ theme: z.string() }))
      .query(async ({ input }) => {
        return igm.generateContentIdeas(0, input.theme);
      }),

    // Scheduling
    scheduleWeek: protectedProcedure.mutation(async ({ ctx }) => {
      const igConfig = await db.getIntegrationSetting(ctx.user.id, "instagram");
      if (!igConfig?.isActive || !igConfig.config) throw new Error("Instagram não configurado");
      return igm.schedulePostsForWeek(ctx.user.id, igConfig.config as igm.InstagramConfig);
    }),
  }),

  // ─── Recomendação Inteligente de Técnicas ───
  technique: techniqueRouter,

  // ─── Gerenciamento de Respostas de Formulários ───
  formResponses: router({
    saveResponse: protectedProcedure
      .input(
        z.object({
          patientId: z.string(),
          formId: z.string(),
          formName: z.string(),
          technique: z.enum(["TCC", "Esquema", "Gestalt", "Geral"]),
          responses: z.record(z.string(), z.any()),
          totalScore: z.number().optional(),
          interpretation: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createFormResponse } = await import("./formResponseManager");
        return createFormResponse(
          input.patientId,
          input.formId,
          input.formName,
          input.technique,
          input.responses,
          input.totalScore,
          input.interpretation
        );
      }),

    getPatientResponses: protectedProcedure
      .input(z.object({ patientId: z.string(), formId: z.string().optional() }))
      .query(async ({ input }) => {
        return [];
      }),

    shouldRetakeForm: protectedProcedure
      .input(z.object({ patientId: z.string(), formId: z.string() }))
      .query(async ({ input }) => {
        const { shouldRetakeForm } = await import("./formResponseManager");
        return shouldRetakeForm(Date.now(), input.formId);
      }),
  }),

  // ─── Formulários Psicológicos Validados ───
  forms: router({
    getAllForms: publicProcedure.query(async () => {
      const { getAllForms } = await import("./psychologicalForms");
      return getAllForms();
    }),
    getFormsByTechnique: publicProcedure
      .input(z.enum(["TCC", "Esquema", "Gestalt", "Geral"]))
      .query(async ({ input }) => {
        const { getFormsByTechnique } = await import("./psychologicalForms");
        return getFormsByTechnique(input);
      }),
    getFormById: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const { getFormById } = await import("./psychologicalForms");
        return getFormById(input);
      }),
    getFormsByCategory: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const { getFormsByCategory } = await import("./psychologicalForms");
        return getFormsByCategory(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
