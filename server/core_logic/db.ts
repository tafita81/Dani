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

// ─── Patients (Tenancy by userId, Records by patientId) ───
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

// ─── Clinical Data Persistence (Interlinked by patientId) ───

// Session Notes (Transcripts)
export async function createSessionNote(data: InsertSessionNote) {
  const db = await getDb(); if (!db) return null;
  // Garante que o patientId está presente para interligação
  if (!data.patientId) throw new Error("patientId is required for clinical persistence");
  const [result] = await db.insert(sessionNotes).values(data);
  return { id: result.insertId, ...data };
}

export async function getSessionNotes(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  // Busca por patientId, mas valida userId da Daniela para segurança
  return db.select().from(sessionNotes)
    .where(and(eq(sessionNotes.patientId, patientId), eq(sessionNotes.userId, userId)))
    .orderBy(desc(sessionNotes.createdAt));
}

// Session Evolutions (Analyses/Insights)
export async function createSessionEvolution(data: InsertSessionEvolution) {
  const db = await getDb(); if (!db) return null;
  if (!data.patientId) throw new Error("patientId is required for clinical evolution");
  const [result] = await db.insert(sessionEvolutions).values(data);
  return { id: result.insertId, ...data };
}

export async function getSessionEvolutions(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(sessionEvolutions)
    .where(and(eq(sessionEvolutions.patientId, patientId), eq(sessionEvolutions.userId, userId)))
    .orderBy(desc(sessionEvolutions.createdAt));
}

// Anamnesis
export async function getAnamnesis(userId: number, patientId: number) {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(anamnesis)
    .where(and(eq(anamnesis.patientId, patientId), eq(anamnesis.userId, userId)))
    .limit(1);
  return r[0] ?? null;
}

// Full Patient Context for AI Analysis
export async function getPatientFullContext(userId: number, patientId: number) {
  const [patient, evolutions, notes, anam] = await Promise.all([
    getPatientById(userId, patientId),
    getSessionEvolutions(userId, patientId),
    getSessionNotes(userId, patientId),
    getAnamnesis(userId, patientId)
  ]);

  return {
    patient,
    history: evolutions,
    transcripts: notes,
    anamnesis: anam
  };
}

// ─── Other Entities (Owner Scoped) ───

export async function getAppointments(userId: number, startMs?: number, endMs?: number) {
  const db = await getDb(); if (!db) return [];
  let q = db.select().from(appointments).where(eq(appointments.userId, userId));
  if (startMs && endMs) {
    q = db.select().from(appointments).where(and(eq(appointments.userId, userId), gte(appointments.startTime, startMs), lte(appointments.startTime, endMs)));
  }
  return q.orderBy(asc(appointments.startTime));
}

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

export async function getDashboardStats(userId: number) {
  const db = await getDb(); if (!db) return null;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const [allPatients, todayAppts, unreadAlerts] = await Promise.all([
    db.select().from(patients).where(eq(patients.userId, userId)),
    db.select().from(appointments).where(and(eq(appointments.userId, userId), gte(appointments.startTime, todayStart.getTime()), lte(appointments.startTime, todayEnd.getTime()))),
    db.select().from(alerts).where(and(eq(alerts.userId, userId), eq(alerts.isRead, false))),
  ]);
  return {
    totalPatients: allPatients.length,
    activePatients: allPatients.filter(p => p.status === "active").length,
    todayAppointments: todayAppts.length,
    todaySchedule: todayAppts,
    unreadAlerts: unreadAlerts.length,
  };
}

// ─── Legacy/Helpers ───
export async function getAllAppointments() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(appointments).orderBy(asc(appointments.startTime));
}
