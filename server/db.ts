import { eq, and, desc, asc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  patients,
  appointments,
  sessionNotes,
  leads,
  professionalProfile,
  treatmentPlans,
  inventoryResults,
  anamnesis,
  cognitiveConcepts,
  moodEntries,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ═══════════════════════════════════════════════════════════
//  PACIENTES
// ═══════════════════════════════════════════════════════════

export async function getPatientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(patients).where(eq(patients.userId, userId));
}

export async function getPatientById(patientId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function searchPatients(userId: number, query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(patients)
    .where(
      and(
        eq(patients.userId, userId),
        like(patients.name, `%${query}%`)
      )
    )
    .limit(20);
}

export async function getPatientByPhone(userId: number, phone: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(patients)
    .where(and(eq(patients.userId, userId), eq(patients.phone, phone)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ═══════════════════════════════════════════════════════════
//  AGENDA
// ═══════════════════════════════════════════════════════════

export async function getAppointmentsByUserId(
  userId: number,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId))
    .orderBy(desc(appointments.startTime));
}

export async function getAppointmentsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(appointments)
    .where(eq(appointments.patientId, patientId))
    .orderBy(desc(appointments.startTime));
}

export async function getUpcomingAppointments(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId))
    .orderBy(asc(appointments.startTime))
    .limit(limit);
}

// ═══════════════════════════════════════════════════════════
//  SESSÕES
// ═══════════════════════════════════════════════════════════

export async function getSessionsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(sessionNotes)
    .where(eq(sessionNotes.patientId, patientId))
    .orderBy(desc(sessionNotes.createdAt));
}

export async function getSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(sessionNotes)
    .where(eq(sessionNotes.id, sessionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getRecentSessions(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(sessionNotes)
    .where(eq(sessionNotes.userId, userId))
    .orderBy(desc(sessionNotes.createdAt))
    .limit(limit);
}

// ═══════════════════════════════════════════════════════════
//  CRM - LEADS
// ═══════════════════════════════════════════════════════════

export async function getLeadsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(leads)
    .where(eq(leads.userId, userId))
    .orderBy(desc(leads.createdAt));
}

export async function getLeadsByStage(userId: number, stage: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(leads)
    .where(and(eq(leads.userId, userId), eq(leads.stage, stage as any)))
    .orderBy(desc(leads.score));
}

export async function getLeadById(leadId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ═══════════════════════════════════════════════════════════
//  PERFIL PROFISSIONAL
// ═══════════════════════════════════════════════════════════

export async function getProfessionalProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(professionalProfile)
    .where(eq(professionalProfile.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ═══════════════════════════════════════════════════════════
//  PLANOS DE TRATAMENTO
// ═══════════════════════════════════════════════════════════

export async function getTreatmentPlansByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(treatmentPlans)
    .where(eq(treatmentPlans.patientId, patientId))
    .orderBy(desc(treatmentPlans.createdAt));
}

export async function getActiveTreatmentPlan(patientId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(treatmentPlans)
    .where(
      and(
        eq(treatmentPlans.patientId, patientId),
        eq(treatmentPlans.active, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ═══════════════════════════════════════════════════════════
//  INVENTÁRIOS E AVALIAÇÕES
// ═══════════════════════════════════════════════════════════

export async function getInventoryResultsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(inventoryResults)
    .where(eq(inventoryResults.patientId, patientId))
    .orderBy(desc(inventoryResults.createdAt));
}

export async function getInventoryResultsByType(
  patientId: number,
  type: string
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(inventoryResults)
    .where(
      and(
        eq(inventoryResults.patientId, patientId),
        eq(inventoryResults.type, type as any)
      )
    )
    .orderBy(desc(inventoryResults.createdAt));
}

// ═══════════════════════════════════════════════════════════
//  ANAMNESE
// ═══════════════════════════════════════════════════════════

export async function getAnamnesisbyPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(anamnesis)
    .where(eq(anamnesis.patientId, patientId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ═══════════════════════════════════════════════════════════
//  CONCEITOS COGNITIVOS
// ═══════════════════════════════════════════════════════════

export async function getCognitiveConcepts(patientId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(cognitiveConcepts)
    .where(eq(cognitiveConcepts.patientId, patientId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ═══════════════════════════════════════════════════════════
//  REGISTROS DE HUMOR
// ═══════════════════════════════════════════════════════════

export async function getMoodEntriesByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.patientId, patientId))
    .orderBy(desc(moodEntries.createdAt))
    .limit(30);
}
