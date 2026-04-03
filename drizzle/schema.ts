import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  float,
  index,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * SCHEMA COMPLETO - Plataforma Dani
 * Gestão clínica para psicólogos com IA, agenda, CRM e integrações
 */

// ═══════════════════════════════════════════════════════════
//  AUTH & PERFIL PROFISSIONAL
// ═══════════════════════════════════════════════════════════

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const professionalProfile = mysqlTable("professional_profile", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  crp: varchar("crp", { length: 20 }),
  bio: text("bio"),
  specialties: json("specialties").$type<string[]>(),
  approaches: json("approaches").$type<string[]>(),
  sessionPrice: float("session_price"),
  sessionDuration: int("session_duration").default(50),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  instagram: varchar("instagram", { length: 100 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("prof_user_idx").on(t.userId),
}));

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  patientAlias: varchar("patient_alias", { length: 100 }),
  content: text("content").notNull(),
  rating: int("rating").default(5),
  approved: boolean("approved").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("test_user_idx").on(t.userId),
}));

// ═══════════════════════════════════════════════════════════
//  PACIENTES
// ═══════════════════════════════════════════════════════════

export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  birthDate: varchar("birth_date", { length: 10 }),
  gender: mysqlEnum("gender", ["M", "F", "other"]),
  occupation: varchar("occupation", { length: 100 }),
  origin: mysqlEnum("origin", ["instagram", "whatsapp", "telegram", "site", "indication", "other"]).default("other"),
  status: mysqlEnum("status", ["active", "inactive", "waitlist"]).default("active"),
  notes: text("notes"),
  emergencyContact: json("emergency_contact").$type<{ name: string; phone: string; relation: string }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("patients_user_idx").on(t.userId),
  statusIdx: index("patients_status_idx").on(t.status),
}));

export const moodEntries = mysqlTable("mood_entries", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  score: int("score").notNull(),
  emotion: varchar("emotion", { length: 50 }),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  patientIdx: index("mood_patient_idx").on(t.patientId),
}));

// ═══════════════════════════════════════════════════════════
//  ANAMNESE E DADOS CLÍNICOS
// ═══════════════════════════════════════════════════════════

export const anamnesis = mysqlTable("anamnesis", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  mainComplaint: text("main_complaint"),
  history: text("history"),
  familyHistory: text("family_history"),
  medicalHistory: text("medical_history"),
  medications: json("medications").$type<string[]>(),
  previousTherapy: boolean("previous_therapy").default(false),
  previousTherapyDetails: text("previous_therapy_details"),
  sleepPattern: text("sleep_pattern"),
  exerciseHabits: text("exercise_habits"),
  substanceUse: text("substance_use"),
  socialSupport: text("social_support"),
  workSituation: text("work_situation"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  patientIdx: index("anam_patient_idx").on(t.patientId),
}));

export const cognitiveConcepts = mysqlTable("cognitive_concepts", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  coreBeliefs: json("core_beliefs").$type<string[]>(),
  intermediateBeliefs: json("intermediate_beliefs").$type<string[]>(),
  automaticThoughts: json("automatic_thoughts").$type<string[]>(),
  compensatoryStrategies: json("compensatory_strategies").$type<string[]>(),
  triggers: json("triggers").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  patientIdx: index("cog_patient_idx").on(t.patientId),
}));

export const inventoryResults = mysqlTable("inventory_results", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  type: mysqlEnum("type", ["BDI-II", "BAI", "PHQ-9", "GAD-7", "DASS-21", "PCL-5"]).notNull(),
  answers: json("answers").$type<Record<string, number>>().notNull(),
  totalScore: int("total_score").notNull(),
  severity: varchar("severity", { length: 50 }),
  interpretation: text("interpretation"),
  appliedAt: timestamp("applied_at").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  patientIdx: index("inv_patient_idx").on(t.patientId),
  typeIdx: index("inv_type_idx").on(t.type),
}));

// ═══════════════════════════════════════════════════════════
//  AGENDA E COMPROMISSOS
// ═══════════════════════════════════════════════════════════

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  patientId: int("patient_id").references(() => patients.id),
  title: varchar("title", { length: 255 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: mysqlEnum("status", ["scheduled", "confirmed", "done", "cancelled", "no_show"]).default("scheduled"),
  type: mysqlEnum("type", ["online", "presential"]).default("presential"),
  appointmentType: mysqlEnum("appointment_type", ["first", "return", "routine", "evaluation", "follow_up", "emergency"]).default("routine"),
  modality: mysqlEnum("modality", ["online", "presential", "hybrid"]).default("presential"),
  googleEventId: varchar("google_event_id", { length: 255 }),
  outlookEventId: varchar("outlook_event_id", { length: 255 }),
  meetLink: varchar("meet_link", { length: 500 }),
  reminderSent: boolean("reminder_sent").default(false),
  notes: text("notes"),
  observations: text("observations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("appt_user_idx").on(t.userId),
  patientIdx: index("appt_patient_idx").on(t.patientId),
  startIdx: index("appt_start_idx").on(t.startTime),
}));

// ═══════════════════════════════════════════════════════════
//  SESSÕES E PRONTUÁRIO ELETRÔNICO
// ═══════════════════════════════════════════════════════════

export const sessionNotes = mysqlTable("session_notes", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  userId: int("user_id").notNull().references(() => users.id),
  appointmentId: int("appointment_id").references(() => appointments.id),
  transcript: text("transcript"),
  summary: text("summary"),
  keyThemes: json("key_themes").$type<string[]>(),
  interventions: json("interventions").$type<string[]>(),
  homework: text("homework"),
  nextSession: text("next_session"),
  aiSuggestions: json("ai_suggestions").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  patientIdx: index("sn_patient_idx").on(t.patientId),
  userIdx: index("sn_user_idx").on(t.userId),
}));

export const sessionEvolutions = mysqlTable("session_evolutions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  sessionNoteId: int("session_note_id").references(() => sessionNotes.id),
  period: varchar("period", { length: 7 }),
  progressScore: int("progress_score"),
  observations: text("observations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  patientIdx: index("se_patient_idx").on(t.patientId),
}));

export const treatmentPlans = mysqlTable("treatment_plans", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  goals: json("goals").$type<Array<{ goal: string; achieved: boolean }>>(),
  approach: varchar("approach", { length: 100 }),
  techniques: json("techniques").$type<string[]>(),
  estimatedSessions: int("estimated_sessions"),
  frequency: varchar("frequency", { length: 50 }),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  patientIdx: index("tp_patient_idx").on(t.patientId),
}));

// ═══════════════════════════════════════════════════════════
//  CRM DE VENDAS
// ═══════════════════════════════════════════════════════════

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  source: mysqlEnum("source", ["instagram", "whatsapp", "telegram", "site", "tiktok", "other"]).default("other"),
  stage: mysqlEnum("stage", ["lead", "prospect", "scheduled", "converted", "lost"]).default("lead"),
  score: int("score").default(0),
  notes: text("notes"),
  convertedAt: timestamp("converted_at"),
  patientId: int("patient_id").references(() => patients.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("leads_user_idx").on(t.userId),
  stageIdx: index("leads_stage_idx").on(t.stage),
}));

export const leadInteractions = mysqlTable("lead_interactions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("lead_id").notNull().references(() => leads.id),
  type: mysqlEnum("type", ["call", "message", "email", "meeting", "note"]).default("note"),
  content: text("content"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  leadIdx: index("li_lead_idx").on(t.leadId),
}));

// ═══════════════════════════════════════════════════════════
//  INTEGRAÇÕES
// ═══════════════════════════════════════════════════════════

export const whatsappIntegration = mysqlTable("whatsapp_integration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  phoneNumberId: varchar("phone_number_id", { length: 255 }).notNull(),
  accessToken: varchar("access_token", { length: 500 }),
  businessAccountId: varchar("business_account_id", { length: 255 }),
  webhookToken: varchar("webhook_token", { length: 255 }),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("wa_user_idx").on(t.userId),
}));

export const whatsappMessages = mysqlTable("whatsapp_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  patientId: int("patient_id").references(() => patients.id),
  leadId: int("lead_id").references(() => leads.id),
  messageId: varchar("message_id", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  content: text("content"),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  status: mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("wm_user_idx").on(t.userId),
  patientIdx: index("wm_patient_idx").on(t.patientId),
}));

export const googleCalendarIntegration = mysqlTable("google_calendar_integration", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  accessToken: varchar("access_token", { length: 500 }),
  refreshToken: varchar("refresh_token", { length: 500 }),
  calendarId: varchar("calendar_id", { length: 255 }),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  userIdx: index("gc_user_idx").on(t.userId),
}));

// ═══════════════════════════════════════════════════════════
//  PROTOCOLO DE PSICOTERAPIA (CFP 13/2022)
// ═══════════════════════════════════════════════════════════

export const protocolVersions = mysqlTable("protocol_versions", {
  id: int("id").autoincrement().primaryKey(),
  cfpResolutionNumber: varchar("cfp_resolution_number", { length: 20 }).notNull(),
  cfpResolutionYear: int("cfp_resolution_year").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  effectiveDate: timestamp("effective_date").notNull(),
  status: mysqlEnum("status", ["active", "archived", "deprecated"]).default("active"),
  content: json("content").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  resolutionIdx: index("pv_resolution_idx").on(t.cfpResolutionNumber),
  statusIdx: index("pv_status_idx").on(t.status),
}));

export const psychotherapyProtocols = mysqlTable("psychotherapy_protocols", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  userId: int("user_id").notNull().references(() => users.id),
  protocolVersionId: int("protocol_version_id").notNull().references(() => protocolVersions.id),
  status: mysqlEnum("status", ["draft", "active", "completed", "archived"]).default("draft"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  patientIdx: index("pp_patient_idx").on(t.patientId),
  userIdx: index("pp_user_idx").on(t.userId),
  statusIdx: index("pp_status_idx").on(t.status),
}));

export const protocolSections = mysqlTable("protocol_sections", {
  id: int("id").autoincrement().primaryKey(),
  protocolId: int("protocol_id").notNull().references(() => psychotherapyProtocols.id),
  sectionName: varchar("section_name", { length: 100 }).notNull(),
  sectionOrder: int("section_order").notNull(),
  content: json("content").$type<Record<string, any>>(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  protocolIdx: index("ps_protocol_idx").on(t.protocolId),
}));

export const protocolQuestions = mysqlTable("protocol_questions", {
  id: int("id").autoincrement().primaryKey(),
  sectionId: int("section_id").notNull().references(() => protocolSections.id),
  questionText: text("question_text").notNull(),
  questionType: mysqlEnum("question_type", ["text", "textarea", "number", "date", "select", "checkbox", "radio"]).default("text"),
  required: boolean("required").default(true),
  order: int("order").notNull(),
  options: json("options").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  sectionIdx: index("pq_section_idx").on(t.sectionId),
}));

export const protocolAnswers = mysqlTable("protocol_answers", {
  id: int("id").autoincrement().primaryKey(),
  protocolId: int("protocol_id").notNull().references(() => psychotherapyProtocols.id),
  questionId: int("question_id").notNull().references(() => protocolQuestions.id),
  answer: text("answer"),
  extractedFromTranscription: boolean("extracted_from_transcription").default(false),
  transcriptionSource: text("transcription_source"),
  confirmedByPsychologist: boolean("confirmed_by_psychologist").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  protocolIdx: index("pa_protocol_idx").on(t.protocolId),
  questionIdx: index("pa_question_idx").on(t.questionId),
}));

export const protocolExports = mysqlTable("protocol_exports", {
  id: int("id").autoincrement().primaryKey(),
  protocolId: int("protocol_id").notNull().references(() => psychotherapyProtocols.id),
  exportFormat: mysqlEnum("export_format", ["pdf", "docx", "html"]).default("pdf"),
  exportedAt: timestamp("exported_at").defaultNow(),
  fileUrl: text("file_url"),
  fileName: varchar("file_name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  protocolIdx: index("pe_protocol_idx").on(t.protocolId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type SessionNote = typeof sessionNotes.$inferSelect;
export type InsertSessionNote = typeof sessionNotes.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type ProtocolVersion = typeof protocolVersions.$inferSelect;
export type InsertProtocolVersion = typeof protocolVersions.$inferInsert;
export type PsychotherapyProtocol = typeof psychotherapyProtocols.$inferSelect;
export type InsertPsychotherapyProtocol = typeof psychotherapyProtocols.$inferInsert;
export type ProtocolSection = typeof protocolSections.$inferSelect;
export type InsertProtocolSection = typeof protocolSections.$inferInsert;
export type ProtocolQuestion = typeof protocolQuestions.$inferSelect;
export type InsertProtocolQuestion = typeof protocolQuestions.$inferInsert;
export type ProtocolAnswer = typeof protocolAnswers.$inferSelect;
export type InsertProtocolAnswer = typeof protocolAnswers.$inferInsert;
export type ProtocolExport = typeof protocolExports.$inferSelect;
export type InsertProtocolExport = typeof protocolExports.$inferInsert;
