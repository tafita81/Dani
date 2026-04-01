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
  observations: text("observations"),
  detailedObservations: text("detailed_observations"),
  emergencyContact: json("emergency_contact").$type<{ name: string; phone: string; relation: string }>(),
  // Endereço Completo
  addressStreet: varchar("address_street", { length: 255 }),
  addressNumber: varchar("address_number", { length: 20 }),
  addressComplement: varchar("address_complement", { length: 255 }),
  addressCity: varchar("address_city", { length: 100 }),
  addressState: varchar("address_state", { length: 2 }),
  addressZip: varchar("address_zip", { length: 10 }),
  // Dados Pessoais
  cpf: varchar("cpf", { length: 14 }),
  rg: varchar("rg", { length: 20 }),
  maritalStatus: mysqlEnum("marital_status", ["single", "married", "divorced", "widowed", "other"]),
  children: int("children").default(0),
  educationLevel: mysqlEnum("education_level", ["elementary", "high_school", "college", "postgraduate", "other"]),
  income: mysqlEnum("income", ["< 1000", "1000-2000", "2000-5000", "5000-10000", "> 10000"]),
  // Tipo de Atendimento
  attendanceType: mysqlEnum("attendance_type", ["presencial", "online", "hibrido"]).default("presencial"),
  paymentType: mysqlEnum("payment_type", ["particular", "plano_saude", "convenio", "gratuito"]).default("particular"),
  healthPlan: varchar("health_plan", { length: 100 }),
  healthPlanNumber: varchar("health_plan_number", { length: 50 }),
  // Origem de Consulta - Detalhada
  consultationOriginType: mysqlEnum("consultation_origin_type", ["particular", "plano_saude", "convenio", "app_online", "indicacao", "outro"]).default("particular"),
  healthPlanName: varchar("health_plan_name", { length: 150 }),
  healthPlanId: varchar("health_plan_id", { length: 50 }),
  onlineAppName: varchar("online_app_name", { length: 150 }),
  onlineAppUrl: varchar("online_app_url", { length: 255 }),
  referralSource: varchar("referral_source", { length: 150 }),
  referralSourceDetails: text("referral_source_details"),
  consultationApp: mysqlEnum("consultation_app", ["telemedicina", "zoom", "whatsapp", "google_meet", "skype", "presencial", "outro"]),
  consultationAppName: varchar("consultation_app_name", { length: 100 }),
  // Dados de Pagamento
  currentConsultationPrice: float("current_consultation_price"),
  paymentStatus: mysqlEnum("payment_status", ["pago", "pendente", "inadimplente", "cancelado"]).default("pendente"),
  paymentMethod: mysqlEnum("payment_method", ["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "outro"]),
  lastPaymentDate: timestamp("last_payment_date"),
  lastPaymentAmount: float("last_payment_amount"),
  totalReceived: float("total_received").default(0),
  totalPending: float("total_pending").default(0),
  // Histórico Médico
  medicalHistory: text("medical_history"),
  medications: json("medications").$type<Array<{ name: string; dosage: string; frequency: string }>>(),
  allergies: json("allergies").$type<Array<{ allergen: string; reaction: string }>>(),
  previousTherapies: json("previous_therapies").$type<Array<{ therapist: string; period: string; reason: string }>>(),
  psychiatricHistory: text("psychiatric_history"),
  familyHistory: text("family_history"),
  socialHistory: text("social_history"),
  substanceUse: json("substance_use").$type<Array<{ substance: string; frequency: string; status: string }>>(),
  suicideRisk: mysqlEnum("suicide_risk", ["low", "moderate", "high", "unknown"]).default("unknown"),
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
  googleEventId: varchar("google_event_id", { length: 255 }),
  outlookEventId: varchar("outlook_event_id", { length: 255 }),
  meetLink: varchar("meet_link", { length: 500 }),
  reminderSent: boolean("reminder_sent").default(false),
  notes: text("notes"),
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
  fullAnalysis: text("full_analysis"),
  emotionalAnalysis: json("emotional_analysis").$type<Record<string, any>>(),
  sessionType: varchar("session_type", { length: 50 }),
  duration: int("duration"),
  sessionDate: timestamp("session_date"),
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
//  GESTÃO FINANCEIRA
// ═══════════════════════════════════════════════════════════

export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  userId: int("user_id").notNull().references(() => users.id),
  oldPrice: float("old_price"),
  newPrice: float("new_price").notNull(),
  reason: text("reason"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  patientIdx: index("ph_patient_idx").on(t.patientId),
  userIdx: index("ph_user_idx").on(t.userId),
}));

export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  userId: int("user_id").notNull().references(() => users.id),
  sessionId: int("session_id").references(() => sessionNotes.id),
  appointmentId: int("appointment_id").references(() => appointments.id),
  type: mysqlEnum("type", ["consulta", "reembolso", "ajuste", "desconto", "taxa"]).notNull(),
  amount: float("amount").notNull(),
  status: mysqlEnum("status", ["pago", "pendente", "cancelado", "reembolsado"]).default("pendente"),
  paymentMethod: mysqlEnum("payment_method", ["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "outro"]),
  paymentDate: timestamp("payment_date"),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  receiptUrl: varchar("receipt_url", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  patientIdx: index("ft_patient_idx").on(t.patientId),
  userIdx: index("ft_user_idx").on(t.userId),
  statusIdx: index("ft_status_idx").on(t.status),
  typeIdx: index("ft_type_idx").on(t.type),
}));

export const delinquency = mysqlTable("delinquency", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  userId: int("user_id").notNull().references(() => users.id),
  totalDelinquent: float("total_delinquent").notNull(),
  daysOverdue: int("days_overdue").default(0),
  status: mysqlEnum("status", ["ativo", "pago", "parcial", "cancelado"]).default("ativo"),
  lastNotificationDate: timestamp("last_notification_date"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  patientIdx: index("del_patient_idx").on(t.patientId),
  userIdx: index("del_user_idx").on(t.userId),
  statusIdx: index("del_status_idx").on(t.status),
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
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;
export type Delinquency = typeof delinquency.$inferSelect;
export type InsertDelinquency = typeof delinquency.$inferInsert;
