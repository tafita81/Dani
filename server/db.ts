import { eq, and, desc, asc, gte, lte, sql, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, patients, InsertPatient, appointments, InsertAppointment,
  sessionNotes, InsertSessionNote, documents, InsertDocument, messageLog, InsertMessageLog,
  integrationSettings, InsertIntegrationSetting, alerts, InsertAlert,
  professionalProfile, InsertProfessionalProfile, testimonials, InsertTestimonial,
  leads, InsertLead, leadInteractions, InsertLeadInteraction,
  moodEntries, InsertMoodEntry, anamnesis, InsertAnamnesis,
  cognitiveConcepts, InsertCognitiveConcept, schemaAssessments, InsertSchemaAssessment,
  gestaltAssessments, InsertGestaltAssessment, thoughtRecords, InsertThoughtRecord,
  treatmentPlans, InsertTreatmentPlan, sessionEvolutions, InsertSessionEvolution,
  inventoryResults, InsertInventoryResult,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (e) { _db = null; }
  }
  return _db;
}

// ─── Users ───
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const f of ["name", "email", "loginMethod"] as const) {
    if (user[f] !== undefined) { values[f] = user[f] ?? null; updateSet[f] = user[f] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return r[0];
}

// ─── Patients ───
export async function createPatient(data: InsertPatient) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(patients).values(data);
  return { id: result.insertId, ...data };
}
export async function getPatients(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(patients).where(eq(patients.userId, userId)).orderBy(asc(patients.name));
}
export async function getPatientById(userId: number, id: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(patients).where(and(eq(patients.id, id), eq(patients.userId, userId))).limit(1);
  return r[0] ?? null;
}
export async function updatePatient(userId: number, id: number, data: Partial<InsertPatient>) {
  const db = await getDb(); if (!db) return;
  await db.update(patients).set(data).where(and(eq(patients.id, id), eq(patients.userId, userId)));
}
export async function deletePatient(userId: number, id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(patients).where(and(eq(patients.id, id), eq(patients.userId, userId)));
}
export async function findPatientByPhone(userId: number, phone: string) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(patients).where(and(eq(patients.userId, userId), eq(patients.phone, phone))).limit(1);
  return r[0] ?? null;
}
export async function findPatientByTelegram(userId: number, chatId: string) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(patients).where(and(eq(patients.userId, userId), eq(patients.telegramChatId, chatId))).limit(1);
  return r[0] ?? null;
}
export async function findPatientByInstagram(userId: number, handle: string) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(patients).where(and(eq(patients.userId, userId), eq(patients.instagramHandle, handle))).limit(1);
  return r[0] ?? null;
}

// ─── Appointments ───
export async function createAppointment(data: InsertAppointment) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(appointments).values(data);
  return { id: result.insertId, ...data };
}
export async function getAppointments(userId: number, startMs?: number, endMs?: number) {
  const db = await getDb(); if (!db) return [];
  let q = db.select().from(appointments).where(eq(appointments.userId, userId));
  if (startMs && endMs) {
    q = db.select().from(appointments).where(and(eq(appointments.userId, userId), gte(appointments.startTime, startMs), lte(appointments.startTime, endMs)));
  }
  return q.orderBy(asc(appointments.startTime));
}
export async function getAppointmentById(userId: number, id: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(appointments).where(and(eq(appointments.id, id), eq(appointments.userId, userId))).limit(1);
  return r[0] ?? null;
}
export async function updateAppointment(userId: number, id: number, data: Partial<InsertAppointment>) {
  const db = await getDb(); if (!db) return;
  await db.update(appointments).set(data).where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
}
export async function deleteAppointment(userId: number, id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(appointments).where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
}
export async function getUpcomingAppointments(userId: number, limit = 10) {
  const db = await getDb(); if (!db) return [];
  const now = Date.now();
  return db.select().from(appointments).where(and(eq(appointments.userId, userId), gte(appointments.startTime, now))).orderBy(asc(appointments.startTime)).limit(limit);
}
export async function getAppointmentsNeedingReminder(userId: number) {
  const db = await getDb(); if (!db) return [];
  const now = Date.now();
  const in24h = now + 24 * 60 * 60 * 1000;
  return db.select().from(appointments).where(and(eq(appointments.userId, userId), eq(appointments.reminderSent, false), gte(appointments.startTime, now), lte(appointments.startTime, in24h))).orderBy(asc(appointments.startTime));
}

// ─── Session Notes ───
export async function createSessionNote(data: InsertSessionNote) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(sessionNotes).values(data);
  return { id: result.insertId, ...data };
}
export async function getSessionNotes(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(sessionNotes).where(and(eq(sessionNotes.userId, userId), eq(sessionNotes.patientId, patientId))).orderBy(desc(sessionNotes.createdAt));
}
export async function updateSessionNote(userId: number, id: number, data: Partial<InsertSessionNote>) {
  const db = await getDb(); if (!db) return;
  await db.update(sessionNotes).set(data).where(and(eq(sessionNotes.id, id), eq(sessionNotes.userId, userId)));
}

// ─── Documents ───
export async function createDocument(data: InsertDocument) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(documents).values(data);
  return { id: result.insertId, ...data };
}
export async function getDocuments(userId: number, patientId?: number) {
  const db = await getDb(); if (!db) return [];
  if (patientId) return db.select().from(documents).where(and(eq(documents.userId, userId), eq(documents.patientId, patientId))).orderBy(desc(documents.createdAt));
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
}
export async function deleteDocument(userId: number, id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
}

// ─── Message Log ───
export async function createMessageLog(data: InsertMessageLog) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(messageLog).values(data);
  return { id: result.insertId, ...data };
}
export async function getMessageLogs(userId: number, patientId?: number, channel?: string) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(messageLog.userId, userId)];
  if (patientId) conditions.push(eq(messageLog.patientId, patientId));
  if (channel) conditions.push(eq(messageLog.channel, channel as any));
  return db.select().from(messageLog).where(and(...conditions)).orderBy(desc(messageLog.createdAt)).limit(200);
}
export async function getPatientMessages(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(messageLog).where(and(eq(messageLog.userId, userId), eq(messageLog.patientId, patientId))).orderBy(desc(messageLog.createdAt)).limit(100);
}

// ─── Integration Settings ───
export async function getIntegrationSetting(userId: number, provider: string) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(integrationSettings).where(and(eq(integrationSettings.userId, userId), eq(integrationSettings.provider, provider as any))).limit(1);
  return r[0] ?? null;
}
export async function upsertIntegrationSetting(data: InsertIntegrationSetting) {
  const db = await getDb(); if (!db) return;
  const existing = await getIntegrationSetting(data.userId, data.provider);
  if (existing) {
    await db.update(integrationSettings).set({ config: data.config, isActive: data.isActive }).where(eq(integrationSettings.id, existing.id));
  } else {
    await db.insert(integrationSettings).values(data);
  }
}
export async function getAllIntegrations(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(integrationSettings).where(eq(integrationSettings.userId, userId));
}

// ─── Alerts ───
export async function createAlert(data: InsertAlert) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(alerts).values(data);
  return { id: result.insertId, ...data };
}
export async function getAlerts(userId: number, unreadOnly = false) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(alerts.userId, userId)];
  if (unreadOnly) conditions.push(eq(alerts.isRead, false));
  return db.select().from(alerts).where(and(...conditions)).orderBy(desc(alerts.createdAt)).limit(50);
}
export async function markAlertRead(userId: number, id: number) {
  const db = await getDb(); if (!db) return;
  await db.update(alerts).set({ isRead: true }).where(and(eq(alerts.id, id), eq(alerts.userId, userId)));
}
export async function markAllAlertsRead(userId: number) {
  const db = await getDb(); if (!db) return;
  await db.update(alerts).set({ isRead: true }).where(eq(alerts.userId, userId));
}

// ─── Professional Profile ───
export async function getProfile(userId: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(professionalProfile).where(eq(professionalProfile.userId, userId)).limit(1);
  return r[0] ?? null;
}
export async function upsertProfile(data: InsertProfessionalProfile) {
  const db = await getDb(); if (!db) return;
  const existing = await getProfile(data.userId);
  if (existing) {
    await db.update(professionalProfile).set(data).where(eq(professionalProfile.id, existing.id));
  } else {
    await db.insert(professionalProfile).values(data);
  }
}
export async function getPublicProfile(userId: number) {
  return getProfile(userId);
}

// ─── Testimonials ───
export async function createTestimonial(data: InsertTestimonial) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(testimonials).values(data);
  return { id: result.insertId, ...data };
}
export async function getTestimonials(userId: number, publishedOnly = false) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(testimonials.userId, userId)];
  if (publishedOnly) conditions.push(eq(testimonials.isPublished, true));
  return db.select().from(testimonials).where(and(...conditions)).orderBy(asc(testimonials.sortOrder));
}
export async function updateTestimonial(userId: number, id: number, data: Partial<InsertTestimonial>) {
  const db = await getDb(); if (!db) return;
  await db.update(testimonials).set(data).where(and(eq(testimonials.id, id), eq(testimonials.userId, userId)));
}
export async function deleteTestimonial(userId: number, id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(testimonials).where(and(eq(testimonials.id, id), eq(testimonials.userId, userId)));
}

// ═══════════════════════════════════════════════════════════════
// ─── CRM DE VENDAS — LEADS E FUNIL ───
// ═══════════════════════════════════════════════════════════════

export async function createLead(data: InsertLead) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(leads).values(data);
  return { id: result.insertId, ...data };
}
export async function getLeads(userId: number, stage?: string) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(leads.userId, userId)];
  if (stage) conditions.push(eq(leads.funnelStage, stage as any));
  return db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.score));
}
export async function getLeadById(userId: number, id: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(leads).where(and(eq(leads.id, id), eq(leads.userId, userId))).limit(1);
  return r[0] ?? null;
}
export async function updateLead(userId: number, id: number, data: Partial<InsertLead>) {
  const db = await getDb(); if (!db) return;
  await db.update(leads).set(data).where(and(eq(leads.id, id), eq(leads.userId, userId)));
}
export async function findLeadByPhone(userId: number, phone: string) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(leads).where(and(eq(leads.userId, userId), eq(leads.phone, phone))).limit(1);
  return r[0] ?? null;
}
export async function findLeadByTelegram(userId: number, chatId: string) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(leads).where(and(eq(leads.userId, userId), eq(leads.telegramChatId, chatId))).limit(1);
  return r[0] ?? null;
}
export async function findLeadByInstagram(userId: number, handle: string) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(leads).where(and(eq(leads.userId, userId), eq(leads.instagramHandle, handle))).limit(1);
  return r[0] ?? null;
}
export async function getLeadStats(userId: number) {
  const db = await getDb(); if (!db) return null;
  const allLeads = await db.select().from(leads).where(eq(leads.userId, userId));
  const stages = { lead: 0, contato: 0, interesse: 0, agendamento: 0, consulta: 0, paciente_ativo: 0, perdido: 0 };
  const sources = { whatsapp: 0, telegram: 0, instagram: 0, website: 0, indicacao: 0, outro: 0 };
  for (const l of allLeads) {
    stages[l.funnelStage as keyof typeof stages]++;
    sources[l.source as keyof typeof sources]++;
  }
  const converted = allLeads.filter(l => l.convertedToPatientId).length;
  return { total: allLeads.length, stages, sources, converted, conversionRate: allLeads.length > 0 ? Math.round((converted / allLeads.length) * 100) : 0 };
}

export async function createLeadInteraction(data: InsertLeadInteraction) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(leadInteractions).values(data);
  // Update lead score and interaction count
  const lead = await getLeadById(data.userId, data.leadId);
  if (lead) {
    await updateLead(data.userId, data.leadId, {
      score: Math.min(100, lead.score + (data.scoreImpact || 5)),
      interactionCount: lead.interactionCount + 1,
      lastInteractionAt: new Date(),
    });
  }
  return { id: result.insertId, ...data };
}
export async function getLeadInteractions(userId: number, leadId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(leadInteractions).where(and(eq(leadInteractions.userId, userId), eq(leadInteractions.leadId, leadId))).orderBy(desc(leadInteractions.createdAt));
}

// ─── Convert Lead to Patient ───
export async function convertLeadToPatient(userId: number, leadId: number) {
  const db = await getDb(); if (!db) return null;
  const lead = await getLeadById(userId, leadId);
  if (!lead) return null;
  const patient = await createPatient({
    userId, name: lead.name || "Novo Paciente", email: lead.email ?? undefined,
    phone: lead.phone ?? undefined, instagramHandle: lead.instagramHandle ?? undefined,
    telegramChatId: lead.telegramChatId ?? undefined,
    source: lead.source as any, sourceDetail: lead.sourceDetail ?? undefined, leadId: lead.id,
  });
  if (patient) {
    await updateLead(userId, leadId, { funnelStage: "paciente_ativo", convertedToPatientId: patient.id, convertedAt: new Date() });
  }
  return patient;
}

// ═══════════════════════════════════════════════════════════════
// ─── PRONTUÁRIO CLÍNICO ───
// ═══════════════════════════════════════════════════════════════

// ─── Mood Entries ───
export async function createMoodEntry(data: InsertMoodEntry) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(moodEntries).values(data);
  return { id: result.insertId, ...data };
}
export async function getMoodEntries(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(moodEntries).where(and(eq(moodEntries.userId, userId), eq(moodEntries.patientId, patientId))).orderBy(desc(moodEntries.createdAt));
}

// ─── Anamnesis ───
export async function upsertAnamnesis(data: InsertAnamnesis) {
  const db = await getDb(); if (!db) return null;
  const existing = await db.select().from(anamnesis).where(and(eq(anamnesis.userId, data.userId), eq(anamnesis.patientId, data.patientId))).limit(1);
  if (existing[0]) {
    await db.update(anamnesis).set(data).where(eq(anamnesis.id, existing[0].id));
    return existing[0];
  }
  const [result] = await db.insert(anamnesis).values(data);
  return { id: result.insertId, ...data };
}
export async function getAnamnesis(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(anamnesis).where(and(eq(anamnesis.userId, userId), eq(anamnesis.patientId, patientId))).limit(1);
  return r[0] ?? null;
}

// ─── Cognitive Concepts (TCC) ───
export async function upsertCognitiveConcept(data: InsertCognitiveConcept) {
  const db = await getDb(); if (!db) return null;
  const existing = await db.select().from(cognitiveConcepts).where(and(eq(cognitiveConcepts.userId, data.userId), eq(cognitiveConcepts.patientId, data.patientId))).limit(1);
  if (existing[0]) {
    await db.update(cognitiveConcepts).set(data).where(eq(cognitiveConcepts.id, existing[0].id));
    return existing[0];
  }
  const [result] = await db.insert(cognitiveConcepts).values(data);
  return { id: result.insertId, ...data };
}
export async function getCognitiveConcept(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(cognitiveConcepts).where(and(eq(cognitiveConcepts.userId, userId), eq(cognitiveConcepts.patientId, patientId))).limit(1);
  return r[0] ?? null;
}

// ─── Schema Assessments (TE) ───
export async function createSchemaAssessment(data: InsertSchemaAssessment) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(schemaAssessments).values(data);
  return { id: result.insertId, ...data };
}
export async function getSchemaAssessments(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(schemaAssessments).where(and(eq(schemaAssessments.userId, userId), eq(schemaAssessments.patientId, patientId))).orderBy(desc(schemaAssessments.assessmentDate));
}

// ─── Gestalt Assessments ───
export async function createGestaltAssessment(data: InsertGestaltAssessment) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(gestaltAssessments).values(data);
  return { id: result.insertId, ...data };
}
export async function getGestaltAssessments(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(gestaltAssessments).where(and(eq(gestaltAssessments.userId, userId), eq(gestaltAssessments.patientId, patientId))).orderBy(desc(gestaltAssessments.assessmentDate));
}

// ─── Thought Records (RPD) ───
export async function createThoughtRecord(data: InsertThoughtRecord) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(thoughtRecords).values(data);
  return { id: result.insertId, ...data };
}
export async function getThoughtRecords(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(thoughtRecords).where(and(eq(thoughtRecords.userId, userId), eq(thoughtRecords.patientId, patientId))).orderBy(desc(thoughtRecords.recordDate));
}

// ─── Treatment Plans ───
export async function upsertTreatmentPlan(data: InsertTreatmentPlan) {
  const db = await getDb(); if (!db) return null;
  const existing = await db.select().from(treatmentPlans).where(and(eq(treatmentPlans.userId, data.userId), eq(treatmentPlans.patientId, data.patientId), eq(treatmentPlans.status, "active"))).limit(1);
  if (existing[0]) {
    await db.update(treatmentPlans).set(data).where(eq(treatmentPlans.id, existing[0].id));
    return existing[0];
  }
  const [result] = await db.insert(treatmentPlans).values(data);
  return { id: result.insertId, ...data };
}
export async function getTreatmentPlan(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(treatmentPlans).where(and(eq(treatmentPlans.userId, userId), eq(treatmentPlans.patientId, patientId))).orderBy(desc(treatmentPlans.createdAt)).limit(1);
  return r[0] ?? null;
}

// ─── Session Evolutions ───
export async function createSessionEvolution(data: InsertSessionEvolution) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(sessionEvolutions).values(data);
  return { id: result.insertId, ...data };
}
export async function getSessionEvolutions(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(sessionEvolutions).where(and(eq(sessionEvolutions.userId, userId), eq(sessionEvolutions.patientId, patientId))).orderBy(desc(sessionEvolutions.sessionDate));
}
export async function updateSessionEvolution(userId: number, id: number, data: Partial<InsertSessionEvolution>) {
  const db = await getDb(); if (!db) return;
  await db.update(sessionEvolutions).set(data).where(and(eq(sessionEvolutions.id, id), eq(sessionEvolutions.userId, userId)));
}
export async function getLatestEvolution(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(sessionEvolutions).where(and(eq(sessionEvolutions.userId, userId), eq(sessionEvolutions.patientId, patientId))).orderBy(desc(sessionEvolutions.sessionDate)).limit(1);
  return r[0] ?? null;
}

// ─── Inventory Results ───
export async function createInventoryResult(data: InsertInventoryResult) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(inventoryResults).values(data);
  return { id: result.insertId, ...data };
}
export async function getInventoryResults(userId: number, patientId: number, type?: string) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(inventoryResults.userId, userId), eq(inventoryResults.patientId, patientId)];
  if (type) conditions.push(eq(inventoryResults.inventoryType, type as any));
  return db.select().from(inventoryResults).where(and(...conditions)).orderBy(desc(inventoryResults.applicationDate));
}

// ─── AI Pre-Session Summary ───
export async function getPatientFullContext(userId: number, patientId: number) {
  const [patient, anam, cognitive, schemas, gestalt, plan, evolutions, moods, inventories, notes] = await Promise.all([
    getPatientById(userId, patientId),
    getAnamnesis(userId, patientId),
    getCognitiveConcept(userId, patientId),
    getSchemaAssessments(userId, patientId),
    getGestaltAssessments(userId, patientId),
    getTreatmentPlan(userId, patientId),
    getSessionEvolutions(userId, patientId),
    getMoodEntries(userId, patientId),
    getInventoryResults(userId, patientId),
    getSessionNotes(userId, patientId),
  ]);
  return { patient, anamnesis: anam, cognitiveConcept: cognitive, schemaAssessments: schemas, gestaltAssessments: gestalt, treatmentPlan: plan, sessionEvolutions: evolutions.slice(0, 5), moodEntries: moods.slice(0, 10), inventoryResults: inventories.slice(0, 5), sessionNotes: notes.slice(0, 5) };
}

// ─── Dashboard Stats ───
export async function getDashboardStats(userId: number) {
  const db = await getDb(); if (!db) return null;
  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const [allPatients, todayAppts, allLeadsData, unreadAlerts] = await Promise.all([
    db.select().from(patients).where(eq(patients.userId, userId)),
    db.select().from(appointments).where(and(eq(appointments.userId, userId), gte(appointments.startTime, todayStart.getTime()), lte(appointments.startTime, todayEnd.getTime()))),
    getLeadStats(userId),
    db.select().from(alerts).where(and(eq(alerts.userId, userId), eq(alerts.isRead, false))),
  ]);
  return {
    totalPatients: allPatients.length,
    activePatients: allPatients.filter(p => p.status === "active").length,
    todayAppointments: todayAppts.length,
    todaySchedule: todayAppts,
    leadStats: allLeadsData,
    unreadAlerts: unreadAlerts.length,
  };
}
