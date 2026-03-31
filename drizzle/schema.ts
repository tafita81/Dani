/**
 * schema.ts — Schema completo do banco de dados
 * MySQL + Drizzle ORM — 24 tabelas
 */

import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  float,
  json,
  mysqlEnum,
  index,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// ── Helpers ───────────────────────────────────────────────────
const id = () => varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid());
const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
};

// ═══════════════════════════════════════════════════════════
//  AUTH & PERFIL
// ═══════════════════════════════════════════════════════════

export const users = mysqlTable("users", {
  ...id(),
  email:     varchar("email", { length: 255 }).notNull().unique(),
  password:  varchar("password", { length: 255 }),
  name:      varchar("name", { length: 255 }),
  role:      mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  active:    boolean("active").default(true).notNull(),
  ...timestamps,
});

export const professionalProfile = mysqlTable("professional_profile", {
  ...id(),
  userId:         varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  crp:            varchar("crp", { length: 20 }),
  bio:            text("bio"),
  specialties:    json("specialties").$type<string[]>().default([]),
  approaches:     json("approaches").$type<string[]>().default([]),
  sessionPrice:   float("session_price"),
  sessionDuration: int("session_duration").default(50),
  phone:          varchar("phone", { length: 20 }),
  address:        text("address"),
  instagram:      varchar("instagram", { length: 100 }),
  whatsapp:       varchar("whatsapp", { length: 20 }),
  ...timestamps,
});

export const testimonials = mysqlTable("testimonials", {
  ...id(),
  userId:    varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  patientAlias: varchar("patient_alias", { length: 100 }),
  content:   text("content").notNull(),
  rating:    int("rating").default(5),
  approved:  boolean("approved").default(false),
  ...timestamps,
});

// ═══════════════════════════════════════════════════════════
//  PACIENTES
// ═══════════════════════════════════════════════════════════

export const patients = mysqlTable("patients", {
  ...id(),
  userId:         varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  name:           varchar("name", { length: 255 }).notNull(),
  email:          varchar("email", { length: 255 }),
  phone:          varchar("phone", { length: 20 }),
  birthDate:      varchar("birth_date", { length: 10 }),
  gender:         mysqlEnum("gender", ["M", "F", "other"]),
  occupation:     varchar("occupation", { length: 100 }),
  origin:         mysqlEnum("origin", ["instagram", "whatsapp", "telegram", "site", "indication", "other"]).default("other"),
  status:         mysqlEnum("status", ["active", "inactive", "waitlist"]).default("active"),
  notes:          text("notes"),
  emergencyContact: json("emergency_contact").$type<{ name: string; phone: string; relation: string }>(),
  ...timestamps,
}, (t) => ({
  userIdx: index("patients_user_idx").on(t.userId),
}));

export const moodEntries = mysqlTable("mood_entries", {
  ...id(),
  patientId:  varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  score:      int("score").notNull(),           // 1-10
  emotion:    varchar("emotion", { length: 50 }),
  notes:      text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  ...timestamps,
});

// ═══════════════════════════════════════════════════════════
//  AGENDA
// ═══════════════════════════════════════════════════════════

export const appointments = mysqlTable("appointments", {
  ...id(),
  userId:          varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  patientId:       varchar("patient_id", { length: 21 }).references(() => patients.id),
  title:           varchar("title", { length: 255 }),
  startTime:       timestamp("start_time").notNull(),
  endTime:         timestamp("end_time").notNull(),
  status:          mysqlEnum("status", ["scheduled", "confirmed", "done", "cancelled", "no_show"]).default("scheduled"),
  type:            mysqlEnum("type", ["online", "presential"]).default("presential"),
  googleEventId:   varchar("google_event_id", { length: 255 }),
  outlookEventId:  varchar("outlook_event_id", { length: 255 }),
  meetLink:        varchar("meet_link", { length: 500 }),
  reminderSent:    boolean("reminder_sent").default(false),
  notes:           text("notes"),
  ...timestamps,
}, (t) => ({
  userIdx: index("appointments_user_idx").on(t.userId),
  startIdx: index("appointments_start_idx").on(t.startTime),
}));

// ═══════════════════════════════════════════════════════════
//  PRONTUÁRIO ELETRÔNICO
// ═══════════════════════════════════════════════════════════

export const sessionNotes = mysqlTable("session_notes", {
  ...id(),
  patientId:    varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  userId:       varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  appointmentId: varchar("appointment_id", { length: 21 }).references(() => appointments.id),
  transcript:   text("transcript"),
  summary:      text("summary"),
  keyThemes:    json("key_themes").$type<string[]>().default([]),
  interventions: json("interventions").$type<string[]>().default([]),
  homework:     text("homework"),
  nextSession:  text("next_session"),
  aiSuggestions: json("ai_suggestions").$type<string[]>().default([]),
  ...timestamps,
});

export const sessionEvolutions = mysqlTable("session_evolutions", {
  ...id(),
  patientId:    varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  sessionNoteId: varchar("session_note_id", { length: 21 }).references(() => sessionNotes.id),
  period:       varchar("period", { length: 7 }),   // "2026-03"
  progressScore: int("progress_score"),              // 1-10
  observations: text("observations"),
  ...timestamps,
});

export const anamnesis = mysqlTable("anamnesis", {
  ...id(),
  patientId:         varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  mainComplaint:     text("main_complaint"),
  history:           text("history"),
  familyHistory:     text("family_history"),
  medicalHistory:    text("medical_history"),
  medications:       json("medications").$type<string[]>().default([]),
  previousTherapy:   boolean("previous_therapy").default(false),
  previousTherapyDetails: text("previous_therapy_details"),
  sleepPattern:      text("sleep_pattern"),
  exerciseHabits:    text("exercise_habits"),
  substanceUse:      text("substance_use"),
  socialSupport:     text("social_support"),
  workSituation:     text("work_situation"),
  completed:         boolean("completed").default(false),
  ...timestamps,
});

export const cognitiveConcepts = mysqlTable("cognitive_concepts", {
  ...id(),
  patientId:        varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  coreBeliefs:      json("core_beliefs").$type<string[]>().default([]),
  intermediateBeliefs: json("intermediate_beliefs").$type<string[]>().default([]),
  automaticThoughts: json("automatic_thoughts").$type<string[]>().default([]),
  compensatoryStrategies: json("compensatory_strategies").$type<string[]>().default([]),
  triggers:         json("triggers").$type<string[]>().default([]),
  ...timestamps,
});

export const schemaAssessments = mysqlTable("schema_assessments", {
  ...id(),
  patientId:        varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  ysqResults:       json("ysq_results").$type<Record<string, number>>(),   // YSQ-S3 90 itens
  activatedSchemas: json("activated_schemas").$type<string[]>().default([]),
  schemaModes:      json("schema_modes").$type<string[]>().default([]),
  ...timestamps,
});

export const gestaltAssessments = mysqlTable("gestalt_assessments", {
  ...id(),
  patientId:         varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  contactCycle:      json("contact_cycle").$type<Record<string, string>>(),
  interruptions:     json("interruptions").$type<string[]>().default([]),
  awarenessFindings: text("awareness_findings"),
  ...timestamps,
});

export const thoughtRecords = mysqlTable("thought_records", {
  ...id(),
  patientId:       varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  situation:       text("situation"),
  automaticThought: text("automatic_thought"),
  emotion:         varchar("emotion", { length: 100 }),
  emotionIntensity: int("emotion_intensity"),
  evidence_for:    text("evidence_for"),
  evidence_against: text("evidence_against"),
  balancedThought: text("balanced_thought"),
  outcome:         text("outcome"),
  ...timestamps,
});

export const treatmentPlans = mysqlTable("treatment_plans", {
  ...id(),
  patientId:    varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  goals:        json("goals").$type<Array<{ goal: string; achieved: boolean }>>().default([]),
  approach:     varchar("approach", { length: 100 }),
  techniques:   json("techniques").$type<string[]>().default([]),
  estimatedSessions: int("estimated_sessions"),
  frequency:    varchar("frequency", { length: 50 }),
  active:       boolean("active").default(true),
  ...timestamps,
});

export const inventoryResults = mysqlTable("inventory_results", {
  ...id(),
  patientId:   varchar("patient_id", { length: 21 }).notNull().references(() => patients.id),
  type:        mysqlEnum("type", ["BDI-II", "BAI", "PHQ-9", "GAD-7", "SMI", "YPI", "YSQ-S3"]).notNull(),
  answers:     json("answers").$type<Record<string, number>>().notNull(),
  totalScore:  int("total_score").notNull(),
  severity:    varchar("severity", { length: 50 }),   // "minimal", "mild", "moderate", "severe"
  interpretation: text("interpretation"),
  appliedAt:   timestamp("applied_at").defaultNow(),
  ...timestamps,
});

// ═══════════════════════════════════════════════════════════
//  CRM DE VENDAS
// ═══════════════════════════════════════════════════════════

export const leads = mysqlTable("leads", {
  ...id(),
  userId:      varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  name:        varchar("name", { length: 255 }).notNull(),
  phone:       varchar("phone", { length: 20 }),
  email:       varchar("email", { length: 255 }),
  source:      mysqlEnum("source", ["instagram", "whatsapp", "telegram", "site", "tiktok", "other"]).default("other"),
  stage:       mysqlEnum("stage", ["lead", "prospect", "scheduled", "converted", "lost"]).default("lead"),
  score:       int("score").default(0),
  notes:       text("notes"),
  convertedAt: timestamp("converted_at"),
  patientId:   varchar("patient_id", { length: 21 }).references(() => patients.id),
  ...timestamps,
}, (t) => ({
  userIdx: index("leads_user_idx").on(t.userId),
  stageIdx: index("leads_stage_idx").on(t.stage),
}));

export const leadInteractions = mysqlTable("lead_interactions", {
  ...id(),
  leadId:    varchar("lead_id", { length: 21 }).notNull().references(() => leads.id),
  channel:   mysqlEnum("channel", ["whatsapp", "instagram", "telegram", "email", "phone"]),
  direction: mysqlEnum("direction", ["inbound", "outbound"]),
  content:   text("content"),
  ...timestamps,
});

// ═══════════════════════════════════════════════════════════
//  MENSAGENS & INTEGRAÇÕES
// ═══════════════════════════════════════════════════════════

export const messageLog = mysqlTable("message_log", {
  ...id(),
  userId:    varchar("user_id", { length: 21 }).references(() => users.id),
  patientId: varchar("patient_id", { length: 21 }).references(() => patients.id),
  channel:   mysqlEnum("channel", ["whatsapp", "telegram", "instagram", "email"]).notNull(),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  content:   text("content").notNull(),
  mediaUrl:  varchar("media_url", { length: 500 }),
  status:    mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent"),
  externalId: varchar("external_id", { length: 255 }),
  ...timestamps,
}, (t) => ({
  channelIdx: index("message_log_channel_idx").on(t.channel),
}));

export const integrationSettings = mysqlTable("integration_settings", {
  ...id(),
  userId:    varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  service:   mysqlEnum("service", ["google_calendar", "outlook", "whatsapp", "telegram", "instagram", "stripe"]).notNull(),
  enabled:   boolean("enabled").default(false),
  config:    json("config").$type<Record<string, string>>().default({}),
  tokens:    json("tokens").$type<Record<string, string>>().default({}),
  ...timestamps,
});

export const alerts = mysqlTable("alerts", {
  ...id(),
  userId:    varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  type:      varchar("type", { length: 50 }).notNull(),
  title:     varchar("title", { length: 255 }).notNull(),
  message:   text("message"),
  read:      boolean("read").default(false),
  priority:  mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  data:      json("data").$type<Record<string, any>>(),
  ...timestamps,
});

export const documents = mysqlTable("documents", {
  ...id(),
  userId:    varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  patientId: varchar("patient_id", { length: 21 }).references(() => patients.id),
  name:      varchar("name", { length: 255 }).notNull(),
  type:      varchar("type", { length: 50 }),
  s3Key:     varchar("s3_key", { length: 500 }).notNull(),
  s3Url:     varchar("s3_url", { length: 500 }),
  size:      int("size"),
  ...timestamps,
});

// ═══════════════════════════════════════════════════════════
//  INSTAGRAM / CONTEÚDO
// ═══════════════════════════════════════════════════════════

export const instagramPosts = mysqlTable("instagram_posts", {
  ...id(),
  userId:      varchar("user_id", { length: 21 }).notNull().references(() => users.id),
  type:        mysqlEnum("type", ["post", "reel", "story", "carousel"]).notNull(),
  caption:     text("caption"),
  mediaUrl:    varchar("media_url", { length: 500 }),
  instagramId: varchar("instagram_id", { length: 255 }),
  status:      mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  likes:       int("likes").default(0),
  comments:    int("comments").default(0),
  reach:       int("reach").default(0),
  saves:       int("saves").default(0),
  ...timestamps,
});

export const agentActionLog = mysqlTable("agent_action_log", {
  ...id(),
  userId:   varchar("user_id", { length: 21 }).references(() => users.id),
  action:   varchar("action", { length: 100 }).notNull(),
  module:   varchar("module", { length: 50 }),
  input:    json("input"),
  output:   json("output"),
  duration: int("duration"),           // ms
  success:  boolean("success").default(true),
  error:    text("error"),
  ...timestamps,
});

// ═══════════════════════════════════════════════════════════
//  RELATIONS
// ═══════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many, one }) => ({
  profile: one(professionalProfile, { fields: [users.id], references: [professionalProfile.userId] }),
  patients: many(patients),
  appointments: many(appointments),
  leads: many(leads),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  appointments: many(appointments),
  sessionNotes: many(sessionNotes),
  moodEntries: many(moodEntries),
  inventoryResults: many(inventoryResults),
  anamnesis: one(anamnesis, { fields: [patients.id], references: [anamnesis.patientId] }),
}));
