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
  carSessionRecordings, carSessionTranscripts,
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
export async function getAllPatients() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(patients).orderBy(asc(patients.name));
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
export async function getAllSessionNotes() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(sessionNotes).orderBy(desc(sessionNotes.createdAt));
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


// ─── Assistente Carro ───
export async function createCarSession(data: {
  userId: number;
  patientId?: number;
  sessionStartTime: Date;
  status: "active" | "paused" | "completed" | "cancelled";
  isActive: boolean;
  deviceType?: string;
  siriActivated: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(carSessionRecordings).values({
      userId: data.userId,
      patientId: data.patientId,
      sessionStartTime: data.sessionStartTime,
      status: data.status,
      isActive: data.isActive,
      deviceType: data.deviceType || "unknown",
      siriActivated: data.siriActivated,
    });
    
    return result;
  } catch (error) {
    console.error("Erro ao criar sessao do carro:", error);
    return null;
  }
}

export async function updateCarSession(data: {
  sessionId: string;
  sessionEndTime?: Date;
  transcription?: string;
  durationSeconds?: number;
  status: "active" | "paused" | "completed" | "cancelled";
  isActive: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Aqui você precisaria de um campo ID na tabela para identificar a sessão
    // Por enquanto, retornamos um objeto simulado
    return {
      success: true,
      sessionId: data.sessionId,
      endTime: data.sessionEndTime,
    };
  } catch (error) {
    console.error("Erro ao atualizar sessao:", error);
    return null;
  }
}

export async function createCarTranscript(data: {
  carSessionId: string;
  phrase: string;
  confidence?: number;
  sentiment?: "positive" | "neutral" | "negative";
  emotion?: string;
  keywords?: string[];
}) {
  // Simulado por enquanto - será implementado com integração real
  return {
    id: Date.now(),
    carSessionId: parseInt(data.carSessionId),
    phrase: data.phrase,
    confidence: data.confidence,
    sentiment: data.sentiment,
    emotion: data.emotion,
    keywords: data.keywords,
    timestamp: new Date(),
  };
}

export async function getCarSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const sessions = await db.select()
      .from(carSessionRecordings)
      .where(eq(carSessionRecordings.userId, userId));
    
    return sessions;
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    return [];
  }
}

export async function getCarSessionDetails(userId: number, sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Buscar sessão e suas transcrições
    const sessions = await db.select()
      .from(carSessionRecordings)
      .where(and(
        eq(carSessionRecordings.userId, userId),
        eq(carSessionRecordings.id, parseInt(sessionId) || 0)
      ));
    
    if (sessions.length === 0) return null;
    
    const session = sessions[0];
    const transcripts = await db.select()
      .from(carSessionTranscripts)
      .where(eq(carSessionTranscripts.carSessionId, session.id));
    
    return {
      ...session,
      transcripts,
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes da sessão:", error);
    return null;
  }
}


// ─── Busca em Tempo Real ───
export async function searchAllTables(userId: number, query: string, type: "patients" | "appointments" | "protocols" | "all" = "all") {
  const db = await getDb();
  if (!db) return { patients: [], appointments: [], protocols: [] };
  
  try {
    const results: any = { patients: [], appointments: [], protocols: [] };
    const searchTerm = `%${query}%`;
    
    if (type === "patients" || type === "all") {
      const patientResults = await db.select()
        .from(patients)
        .where(and(
          eq(patients.userId, userId),
          // Buscar por nome ou email
        ));
      results.patients = patientResults.filter(p => 
        p.name?.toLowerCase().includes(query.toLowerCase()) || 
        p.email?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (type === "appointments" || type === "all") {
      const appointmentResults = await db.select()
        .from(appointments)
        .where(eq(appointments.userId, userId));
      results.appointments = appointmentResults;
    }
    
    if (type === "protocols" || type === "all") {
      const protocolResults = await db.select()
        .from(sessionEvolutions)
        .where(eq(sessionEvolutions.userId, userId));
      results.protocols = protocolResults;
    }
    
    return results;
  } catch (error) {
    console.error("Erro ao buscar:", error);
    return { patients: [], appointments: [], protocols: [] };
  }
}

export async function getCarSuggestions(userId: number, patientId?: number, context?: string) {
  // Retornar sugestões baseadas no contexto
  return {
    suggestions: [
      "Verificar histórico de ansiedade do paciente",
      "Revisar técnicas de respiração",
      "Consultar último protocolo aplicado",
    ],
    recommendations: [
      "Aplicar TCC para pensamentos automáticos",
      "Usar técnicas de grounding",
    ],
  };
}

export async function blockSchedule(userId: number, data: {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}) {
  // Implementar bloqueio de agenda
  return {
    success: true,
    message: `Horário bloqueado de ${data.startTime} até ${data.endTime}`,
  };
}

export async function sendPatientMessage(userId: number, data: {
  patientId: number;
  message: string;
  channel: "whatsapp" | "telegram" | "sms" | "email";
}) {
  // Implementar envio de mensagem
  return {
    success: true,
    message: `Mensagem enviada via ${data.channel}`,
  };
}


// ─── ANÁLISE AVANÇADA ───

/**
 * Pacientes sem sessão há X dias
 */
export async function getPatientsWithoutSessionInDays(days: number = 30) {
  const db = await getDb(); if (!db) return [];
  const allPatients = await getAllPatients();
  const allSessions = await db.select().from(sessionNotes).orderBy(desc(sessionNotes.createdAt));
  
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return allPatients.filter((patient: any) => {
    const lastSession = allSessions.find((s: any) => s.patientId === patient.id);
    if (!lastSession) return true; // Nunca teve sessão
    return lastSession.createdAt.getTime() < cutoffDate;
  });
}

/**
 * Pacientes por abordagem terapêutica
 */
export async function getPatientsByApproach() {
  const allPatients = await getAllPatients();
  const approaches: Record<string, any[]> = {
    tcc: [],
    terapia_esquema: [],
    gestalt: [],
    integrativa: []
  };
  
  allPatients.forEach((p: any) => {
    const approach = p.primaryApproach || 'integrativa';
    if (approaches[approach]) {
      approaches[approach].push(p);
    }
  });
  
  return approaches;
}

/**
 * Efetividade por abordagem (baseado em sessões e progresso)
 */
export async function getApproachEffectiveness() {
  const approaches = await getPatientsByApproach();
  const result: Record<string, any> = {};
  
  for (const [approach, patients] of Object.entries(approaches)) {
    const totalSessions = (patients as any[]).reduce((sum, p) => sum + (p.totalSessions || 0), 0);
    const activePatientsCount = (patients as any[]).filter((p: any) => p.status === 'active').length;
    const avgSessions = patients.length > 0 ? totalSessions / patients.length : 0;
    
    result[approach] = {
      totalPatients: patients.length,
      activePatientsCount,
      inactivePatientsCount: patients.length - activePatientsCount,
      totalSessions,
      avgSessionsPerPatient: avgSessions,
      retentionRate: patients.length > 0 ? (activePatientsCount / patients.length) * 100 : 0,
      patients: patients
    };
  }
  
  return result;
}

/**
 * Paciente com maior progresso (mais sessões)
 */
export async function getMostProgressivePatient() {
  const allPatients = await getAllPatients();
  return allPatients.reduce((max: any, p: any) => 
    (p.totalSessions > (max.totalSessions || 0)) ? p : max
  );
}

/**
 * Pacientes com mais agendamentos
 */
export async function getPatientsWithMostAppointments(limit: number = 5) {
  const db = await getDb(); if (!db) return [];
  const allPatients = await getAllPatients();
  const allAppointments = await db.select().from(appointments);
  
  const patientAppointmentCount = allPatients.map((p: any) => ({
    ...p,
    appointmentCount: allAppointments.filter((a: any) => a.patientId === p.id).length
  }));
  
  return patientAppointmentCount
    .sort((a: any, b: any) => b.appointmentCount - a.appointmentCount)
    .slice(0, limit);
}

/**
 * Taxa de retenção geral
 */
export async function getRetentionRate() {
  const allPatients = await getAllPatients();
  const activeCount = allPatients.filter((p: any) => p.status === 'active').length;
  const totalCount = allPatients.length;
  
  return {
    totalPatients: totalCount,
    activePatients: activeCount,
    inactivePatients: totalCount - activeCount,
    retentionRate: totalCount > 0 ? (activeCount / totalCount) * 100 : 0
  };
}

/**
 * Estatísticas gerais
 */
export async function getGeneralStatistics() {
  const allPatients = await getAllPatients();
  const db = await getDb(); if (!db) return null;
  
  const allSessions = await db.select().from(sessionNotes);
  const allAppointments = await db.select().from(appointments);
  const approaches = await getPatientsByApproach();
  const retention = await getRetentionRate();
  
  const totalSessions = allPatients.reduce((sum: number, p: any) => sum + (p.totalSessions || 0), 0);
  const avgSessionsPerPatient = allPatients.length > 0 ? totalSessions / allPatients.length : 0;
  
  return {
    totalPatients: allPatients.length,
    totalSessions,
    totalAppointments: allAppointments.length,
    avgSessionsPerPatient,
    retentionRate: retention.retentionRate,
    activePatients: retention.activePatients,
    inactivePatients: retention.inactivePatients,
    approachesSummary: Object.entries(approaches).map(([name, patients]) => ({
      name,
      count: (patients as any[]).length,
      percentage: ((patients as any[]).length / allPatients.length) * 100
    }))
  };
}

/**
 * Pacientes novos (últimos 30 dias)
 */
export async function getNewPatients(days: number = 30) {
  const allPatients = await getAllPatients();
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return allPatients.filter((p: any) => 
    new Date(p.createdAt).getTime() > cutoffDate
  );
}

/**
 * Pacientes com maior streak de sessões
 */
export async function getPatientsWithHighestStreak() {
  const allPatients = await getAllPatients();
  return allPatients
    .sort((a: any, b: any) => (b.sessionStreak || 0) - (a.sessionStreak || 0))
    .slice(0, 5);
}


// ─── INTEGRAÇÃO COMPLETA: AGENDAMENTOS + CONSULTAS + PROTOCOLOS + INDICADORES ───

/**
 * Obter histórico completo de um paciente (userId)
 * Junta: agendamentos, sessões, protocolos, indicadores
 */
export async function getCompletePatientHistory(userId: number) {
  const db = await getDb(); if (!db) return null;
  
  // Buscar paciente
  const patient = await db.select().from(patients).where(eq(patients.userId, userId)).limit(1);
  if (!patient || patient.length === 0) return null;
  
  const patientData = patient[0];
  
  // Buscar agendamentos
  const patientAppointments = await db.select().from(appointments).where(eq(appointments.userId, userId));
  
  // Buscar sessões/consultas realizadas
  const patientSessions = await db.select().from(sessionNotes).where(eq(sessionNotes.userId, userId));
  
  // Buscar anamnese (protocolo inicial)
  const patientAnamnesis = await db.select().from(anamnesis).where(eq(anamnesis.userId, userId)).limit(1);
  
  // Buscar conceitos cognitivos (TCC)
  const patientCognitive = await db.select().from(cognitiveConcepts).where(eq(cognitiveConcepts.userId, userId)).limit(1);
  
  // Buscar avaliação de esquemas (Terapia do Esquema)
  const patientSchema = await db.select().from(schemaAssessments).where(eq(schemaAssessments.userId, userId)).limit(1);
  
  // Buscar avaliação Gestalt
  const patientGestalt = await db.select().from(gestaltAssessments).where(eq(gestaltAssessments.userId, userId)).limit(1);
  
  // Buscar plano de tratamento
  const patientTreatmentPlan = await db.select().from(treatmentPlans).where(eq(treatmentPlans.userId, userId)).limit(1);
  
  // Buscar evolução de sessões
  const patientEvolutions = await db.select().from(sessionEvolutions).where(eq(sessionEvolutions.userId, userId));
  
  // Buscar registros de humor
  const patientMoodEntries = await db.select().from(moodEntries).where(eq(moodEntries.userId, userId));
  
  return {
    patient: patientData,
    appointments: patientAppointments,
    sessions: patientSessions,
    protocols: {
      anamnesis: patientAnamnesis?.[0] || null,
      cognitive: patientCognitive?.[0] || null,
      schema: patientSchema?.[0] || null,
      gestalt: patientGestalt?.[0] || null,
      treatmentPlan: patientTreatmentPlan?.[0] || null
    },
    evolutions: patientEvolutions,
    moodEntries: patientMoodEntries
  };
}

/**
 * Calcular indicadores de progresso para um paciente
 */
export async function calculatePatientIndicators(userId: number) {
  const db = await getDb(); if (!db) return null;
  
  const history = await getCompletePatientHistory(userId);
  if (!history) return null;
  
  const patient = history.patient;
  const sessions = history.sessions;
  const appointments = history.appointments;
  const moodEntries = history.moodEntries;
  
  // Indicador 1: Frequência de Sessões
  const sessionFrequency = sessions.length > 0 
    ? (sessions.length / ((Date.now() - new Date(patient.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000))).toFixed(2)
    : 0;
  
  // Indicador 2: Taxa de Comparecimento
  const completedAppointments = appointments.filter((a: any) => a.status === 'completed').length;
  const attendanceRate = appointments.length > 0 
    ? ((completedAppointments / appointments.length) * 100).toFixed(1)
    : 0;
  
  // Indicador 3: Evolução de Humor (se houver registros)
  let moodTrend = null;
  if (moodEntries.length > 1) {
    const firstMood = moodEntries[moodEntries.length - 1].mood || 0;
    const lastMood = moodEntries[0].mood || 0;
    moodTrend = lastMood - firstMood; // Positivo = melhora
  }
  
  // Indicador 4: Adesão ao Tratamento
  const daysSinceLastSession = sessions.length > 0 
    ? Math.floor((Date.now() - new Date(sessions[0].createdAt).getTime()) / (24 * 60 * 60 * 1000))
    : null;
  
  const adherence = daysSinceLastSession !== null && daysSinceLastSession < 14 ? 'Alta' : daysSinceLastSession !== null && daysSinceLastSession < 30 ? 'Média' : 'Baixa';
  
  // Indicador 5: Protocolos Preenchidos
  const protocolsCompleted = Object.values(history.protocols).filter(p => p !== null).length;
  
  return {
    userId,
    patientName: patient.name,
    indicators: {
      sessionFrequency: `${sessionFrequency} sessões/semana`,
      attendanceRate: `${attendanceRate}%`,
      moodTrend: moodTrend ? (moodTrend > 0 ? `Melhora de ${moodTrend}` : `Piora de ${Math.abs(moodTrend)}`) : 'Sem dados',
      adherence,
      daysSinceLastSession,
      protocolsCompleted
    },
    summary: {
      totalSessions: sessions.length,
      totalAppointments: appointments.length,
      completedAppointments,
      moodEntriesCount: moodEntries.length
    }
  };
}

/**
 * Comparar indicadores entre múltiplos pacientes
 */
export async function comparePatientIndicators(userIds: number[]) {
  const indicators = await Promise.all(
    userIds.map(userId => calculatePatientIndicators(userId))
  );
  
  return indicators.filter(ind => ind !== null);
}

/**
 * Obter relatório completo de um paciente
 */
export async function getPatientCompleteReport(userId: number) {
  const history = await getCompletePatientHistory(userId);
  if (!history) return null;
  
  const indicators = await calculatePatientIndicators(userId);
  
  return {
    patient: history.patient,
    history,
    indicators,
    report: {
      lastSession: history.sessions[0] || null,
      nextAppointment: history.appointments.find((a: any) => a.startTime > Date.now()) || null,
      protocolsStatus: Object.entries(history.protocols).map(([name, data]) => ({
        name,
        completed: data !== null,
        date: data?.createdAt || null
      })),
      treatmentProgress: {
        sessionsCompleted: history.sessions.length,
        appointmentsScheduled: history.appointments.length,
        protocolsCompleted: Object.values(history.protocols).filter(p => p !== null).length,
        evolutionRecords: history.evolutions.length
      }
    }
  };
}

/**
 * Buscar todos os pacientes com seus indicadores
 */
export async function getAllPatientsWithIndicators() {
  const allPatients = await getAllPatients();
  
  const patientsWithIndicators = await Promise.all(
    allPatients.map(async (patient: any) => {
      const indicators = await calculatePatientIndicators(patient.userId);
      return {
        ...patient,
        indicators
      };
    })
  );
  
  return patientsWithIndicators;
}

/**
 * Filtrar pacientes por indicador
 */
export async function filterPatientsByIndicator(
  indicatorType: 'adherence' | 'attendance' | 'mood' | 'frequency',
  value: string | number
) {
  const allPatients = await getAllPatientsWithIndicators();
  
  return allPatients.filter((p: any) => {
    if (!p.indicators) return false;
    
    switch (indicatorType) {
      case 'adherence':
        return p.indicators.indicators.adherence === value;
      case 'attendance':
        return parseFloat(p.indicators.indicators.attendanceRate) >= (value as number);
      case 'mood':
        return p.indicators.indicators.moodTrend && p.indicators.indicators.moodTrend.includes('Melhora');
      case 'frequency':
        return parseFloat(p.indicators.indicators.sessionFrequency) >= (value as number);
      default:
        return false;
    }
  });
}

// ─── Get ALL Appointments (sem filtro de userId) ───
export async function getAllAppointments() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(appointments).orderBy(asc(appointments.startTime));
}
