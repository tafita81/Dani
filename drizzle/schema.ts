import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean, json, decimal, date } from "drizzle-orm/mysql-core";

// ─── Users (Auth) ───
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
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Professional Profile ───
export const professionalProfile = mysqlTable("professionalProfile", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  displayName: varchar("displayName", { length: 255 }).default("Psi. Daniela Coelho").notNull(),
  title: varchar("title", { length: 255 }).default("Psicóloga Clínica").notNull(),
  subtitle: varchar("subtitle", { length: 512 }),
  bio: text("bio"),
  crp: varchar("crp", { length: 32 }),
  specialties: json("specialties"),
  education: json("education"),
  photoUrl: text("photoUrl"),
  heroPhotoUrl: text("heroPhotoUrl"),
  instagramUrl: varchar("instagramUrl", { length: 512 }),
  instagramHandle: varchar("instagramHandle", { length: 128 }),
  tiktokUrl: varchar("tiktokUrl", { length: 512 }),
  tiktokHandle: varchar("tiktokHandle", { length: 128 }),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  youtubeHandle: varchar("youtubeHandle", { length: 128 }),
  whatsappNumber: varchar("whatsappNumber", { length: 32 }),
  telegramUrl: varchar("telegramUrl", { length: 512 }),
  linkedinUrl: varchar("linkedinUrl", { length: 512 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  email: varchar("profileEmail", { length: 320 }),
  phone: varchar("profilePhone", { length: 32 }),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 64 }),
  primaryColor: varchar("primaryColor", { length: 32 }),
  accentColor: varchar("accentColor", { length: 32 }),
  tagline: varchar("tagline", { length: 512 }),
  yearsExperience: int("yearsExperience"),
  patientsServed: int("patientsServed"),
  sessionsCompleted: int("sessionsCompleted"),
  featuredVideoUrl: text("featuredVideoUrl"),
  featuredReelUrls: json("featuredReelUrls"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProfessionalProfile = typeof professionalProfile.$inferSelect;
export type InsertProfessionalProfile = typeof professionalProfile.$inferInsert;

// ─── Testimonials ───
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorInitials: varchar("authorInitials", { length: 8 }),
  content: text("content").notNull(),
  rating: int("rating").default(5).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// ─── CRM DE VENDAS — FUNIL DE CONVERSÃO ───
// ═══════════════════════════════════════════════════════════════

// ─── Leads (Funil de Vendas) ───
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // terapeuta dono
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  instagramHandle: varchar("instagramHandle", { length: 128 }),
  telegramChatId: varchar("telegramChatId", { length: 64 }),
  // Origem e funil
  source: mysqlEnum("leadSource", ["whatsapp", "telegram", "instagram", "website", "indicacao", "outro"]).notNull(),
  sourceDetail: varchar("sourceDetail", { length: 255 }), // ex: "comentou no post X", "clicou no link bio"
  funnelStage: mysqlEnum("funnelStage", ["lead", "contato", "interesse", "agendamento", "consulta", "paciente_ativo", "perdido"]).default("lead").notNull(),
  // Scoring
  score: int("score").default(0).notNull(), // 0-100
  interactionCount: int("interactionCount").default(1).notNull(),
  lastInteractionAt: timestamp("lastInteractionAt").defaultNow().notNull(),
  firstInteractionAt: timestamp("firstInteractionAt").defaultNow().notNull(),
  // Conversão
  convertedToPatientId: int("convertedToPatientId"), // quando vira paciente
  convertedAt: timestamp("convertedAt"),
  appointmentId: int("appointmentId"), // quando agenda consulta
  // Follow-up
  nextFollowUpAt: timestamp("nextFollowUpAt"),
  followUpCount: int("followUpCount").default(0).notNull(),
  lastFollowUpAt: timestamp("lastFollowUpAt"),
  notes: text("notes"),
  tags: json("tags"), // ["urgente", "retorno", "primeira_vez"]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Lead Interactions (Touchpoints) ───
export const leadInteractions = mysqlTable("leadInteractions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leadId: int("leadId").notNull(),
  channel: mysqlEnum("interactionChannel", ["whatsapp", "telegram", "instagram", "website", "telefone", "email"]).notNull(),
  type: mysqlEnum("interactionType", ["mensagem_recebida", "mensagem_enviada", "comentario", "dm", "visita_site", "agendamento", "cancelamento", "follow_up", "ligacao"]).notNull(),
  content: text("content"),
  metadata: json("metadata"), // dados extras (post_id, message_id, etc.)
  scoreImpact: int("scoreImpact").default(0).notNull(), // pontos ganhos/perdidos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LeadInteraction = typeof leadInteractions.$inferSelect;
export type InsertLeadInteraction = typeof leadInteractions.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// ─── PACIENTES ───
// ═══════════════════════════════════════════════════════════════

export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  whatsappId: varchar("whatsappId", { length: 64 }),
  telegramChatId: varchar("telegramChatId", { length: 64 }),
  instagramHandle: varchar("instagramHandle", { length: 128 }),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }),
  notes: text("notes"),
  // Origem e rastreabilidade
  source: mysqlEnum("patientSource", ["whatsapp", "telegram", "instagram", "website", "indicacao", "manual"]).default("manual").notNull(),
  sourceDetail: varchar("patientSourceDetail", { length: 255 }),
  leadId: int("leadId"), // vínculo com lead original
  // Abordagem terapêutica
  primaryApproach: mysqlEnum("primaryApproach", ["tcc", "terapia_esquema", "gestalt", "integrativa"]).default("integrativa").notNull(),
  // Status e gamificação
  status: mysqlEnum("patientStatus", ["active", "inactive", "archived"]).default("active").notNull(),
  sessionStreak: int("sessionStreak").default(0).notNull(),
  totalSessions: int("totalSessions").default(0).notNull(),
  badges: json("badges"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

// ─── Mood Tracking ───
export const moodEntries = mysqlTable("moodEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  appointmentId: int("appointmentId"),
  mood: int("mood").notNull(), // 1-5
  moodLabel: varchar("moodLabel", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = typeof moodEntries.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// ─── PRONTUÁRIO ELETRÔNICO — SISTEMA CLÍNICO COMPLETO ───
// ═══════════════════════════════════════════════════════════════

// ─── Anamnese Psicológica ───
export const anamnesis = mysqlTable("anamnesis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  mainComplaint: text("mainComplaint"),
  symptomOnset: varchar("symptomOnset", { length: 255 }),
  symptomDuration: varchar("symptomDuration", { length: 128 }),
  triggeringFactors: text("triggeringFactors"),
  previousTreatments: text("previousTreatments"),
  currentMedications: text("currentMedications"),
  psychiatristName: varchar("psychiatristName", { length: 255 }),
  personalHistory: text("personalHistory"),
  childhoodHistory: text("childhoodHistory"),
  adolescenceHistory: text("adolescenceHistory"),
  significantTraumas: text("significantTraumas"),
  familyHistory: text("familyHistory"),
  familyMentalHealth: text("familyMentalHealth"),
  familyRelationships: text("familyRelationships"),
  maritalStatus: varchar("maritalStatus", { length: 64 }),
  occupation: varchar("occupation", { length: 255 }),
  educationLevel: varchar("educationLevel", { length: 128 }),
  livingArrangement: text("livingArrangement"),
  socialNetwork: text("socialNetwork"),
  leisureActivities: text("leisureActivities"),
  sleepPattern: text("sleepPattern"),
  eatingPattern: text("eatingPattern"),
  substanceUse: text("substanceUse"),
  mentalStatusExam: text("mentalStatusExam"),
  clinicalImpression: text("clinicalImpression"),
  diagnosticHypothesis: text("diagnosticHypothesis"),
  riskAssessment: text("riskAssessment"),
  additionalNotes: text("additionalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Anamnesis = typeof anamnesis.$inferSelect;
export type InsertAnamnesis = typeof anamnesis.$inferInsert;

// ─── Conceituação Cognitiva (TCC - Beck) ───
export const cognitiveConcepts = mysqlTable("cognitiveConcepts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  coreBeliefsAboutSelf: text("coreBeliefsAboutSelf"),
  coreBeliefsAboutOthers: text("coreBeliefsAboutOthers"),
  coreBeliefsAboutWorld: text("coreBeliefsAboutWorld"),
  intermediateBeliefsRules: text("intermediateBeliefsRules"),
  intermediateBeliefsAttitudes: text("intermediateBeliefsAttitudes"),
  intermediateBeliefsAssumptions: text("intermediateBeliefsAssumptions"),
  compensatoryStrategies: text("compensatoryStrategies"),
  cognitiveDistortions: json("cognitiveDistortions"),
  mainAutomaticThoughts: text("mainAutomaticThoughts"),
  behavioralPatterns: text("behavioralPatterns"),
  emotionalPatterns: text("emotionalPatterns"),
  precipitatingFactors: text("precipitatingFactors"),
  perpetuatingFactors: text("perpetuatingFactors"),
  protectiveFactors: text("protectiveFactors"),
  caseFormulationSummary: text("caseFormulationSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CognitiveConcept = typeof cognitiveConcepts.$inferSelect;
export type InsertCognitiveConcept = typeof cognitiveConcepts.$inferInsert;

// ─── Esquemas Iniciais Desadaptativos (Terapia do Esquema — Young) ───
export const schemaAssessments = mysqlTable("schemaAssessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  assessmentDate: timestamp("assessmentDate").defaultNow().notNull(),
  // 18 Esquemas — intensidade 0-6
  abandonment: int("abandonment").default(0).notNull(),
  mistrust: int("mistrust").default(0).notNull(),
  emotionalDeprivation: int("emotionalDeprivation").default(0).notNull(),
  defectiveness: int("defectiveness").default(0).notNull(),
  socialIsolation: int("socialIsolation").default(0).notNull(),
  dependence: int("dependence").default(0).notNull(),
  vulnerability: int("vulnerability").default(0).notNull(),
  enmeshment: int("enmeshment").default(0).notNull(),
  failure: int("failure").default(0).notNull(),
  entitlement: int("entitlement").default(0).notNull(),
  insufficientSelfControl: int("insufficientSelfControl").default(0).notNull(),
  subjugation: int("subjugation").default(0).notNull(),
  selfSacrifice: int("selfSacrifice").default(0).notNull(),
  approvalSeeking: int("approvalSeeking").default(0).notNull(),
  negativity: int("negativity").default(0).notNull(),
  emotionalInhibition: int("emotionalInhibition").default(0).notNull(),
  unrelentingStandards: int("unrelentingStandards").default(0).notNull(),
  punitiveness: int("punitiveness").default(0).notNull(),
  schemaModes: json("schemaModes"),
  copingStyles: json("copingStyles"),
  clinicalNotes: text("clinicalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SchemaAssessment = typeof schemaAssessments.$inferSelect;
export type InsertSchemaAssessment = typeof schemaAssessments.$inferInsert;

// ─── Gestalt — Ciclo de Contato e Awareness ───
export const gestaltAssessments = mysqlTable("gestaltAssessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  assessmentDate: timestamp("assessmentDate").defaultNow().notNull(),
  // Ciclo de Contato
  preContact: text("preContact"),
  contact: text("contact"),
  finalContact: text("finalContact"),
  postContact: text("postContact"),
  // Mecanismos de Interrupção
  confluence: int("confluence").default(0).notNull(),
  introjection: int("introjection").default(0).notNull(),
  projection: int("projection").default(0).notNull(),
  retroflection: int("retroflection").default(0).notNull(),
  deflection: int("deflection").default(0).notNull(),
  egotism: int("egotism").default(0).notNull(),
  // Awareness
  bodyAwareness: text("bodyAwareness"),
  emotionalAwareness: text("emotionalAwareness"),
  cognitiveAwareness: text("cognitiveAwareness"),
  // Figuras e Fundo
  emergentNeeds: text("emergentNeeds"),
  unfinishedGestalten: text("unfinishedGestalten"),
  relationalField: text("relationalField"),
  // Experimentos
  experiments: json("experiments"),
  clinicalNotes: text("clinicalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GestaltAssessment = typeof gestaltAssessments.$inferSelect;
export type InsertGestaltAssessment = typeof gestaltAssessments.$inferInsert;

// ─── Registro de Pensamentos Disfuncionais (RPD) ───
export const thoughtRecords = mysqlTable("thoughtRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  sessionNoteId: int("sessionNoteId"),
  recordDate: timestamp("recordDate").defaultNow().notNull(),
  situation: text("situation"),
  automaticThought: text("automaticThought"),
  emotions: json("emotions"),
  evidenceFor: text("evidenceFor"),
  evidenceAgainst: text("evidenceAgainst"),
  alternativeThought: text("alternativeThought"),
  emotionsAfter: json("emotionsAfter"),
  cognitiveDistortion: varchar("cognitiveDistortion", { length: 128 }),
  behavioralExperiment: text("behavioralExperiment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ThoughtRecord = typeof thoughtRecords.$inferSelect;
export type InsertThoughtRecord = typeof thoughtRecords.$inferInsert;

// ─── Plano Terapêutico ───
export const treatmentPlans = mysqlTable("treatmentPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  approach: varchar("approach", { length: 128 }).default("Integrativa (TCC + TE + Gestalt)").notNull(),
  sessionFrequency: varchar("sessionFrequency", { length: 64 }),
  estimatedDuration: varchar("estimatedDuration", { length: 128 }),
  mainObjectives: json("mainObjectives"),
  therapeuticStrategies: json("therapeuticStrategies"),
  goals: json("goals"),
  plannedTechniques: json("plannedTechniques"),
  dischargeCriteria: text("dischargeCriteria"),
  observations: text("observations"),
  status: mysqlEnum("planStatus", ["active", "completed", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InsertTreatmentPlan = typeof treatmentPlans.$inferInsert;

// ─── Evolução Clínica Estruturada (por sessão) ───
export const sessionEvolutions = mysqlTable("sessionEvolutions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  appointmentId: int("appointmentId"),
  sessionNumber: int("sessionNumber").default(1).notNull(),
  sessionDate: timestamp("sessionDate").defaultNow().notNull(),
  patientPresentation: text("patientPresentation"),
  moodAtArrival: int("moodAtArrival"),
  moodAtDeparture: int("moodAtDeparture"),
  mainThemes: json("mainThemes"),
  activatedSchemas: json("activatedSchemas"),
  identifiedThoughts: text("identifiedThoughts"),
  identifiedEmotions: text("identifiedEmotions"),
  identifiedBehaviors: text("identifiedBehaviors"),
  techniquesUsed: json("techniquesUsed"),
  interventionsSummary: text("interventionsSummary"),
  homeworkAssigned: text("homeworkAssigned"),
  previousHomeworkReview: text("previousHomeworkReview"),
  homeworkCompleted: boolean("homeworkCompleted").default(false),
  progressNotes: text("progressNotes"),
  riskLevel: mysqlEnum("riskLevel", ["none", "low", "moderate", "high", "critical"]).default("none").notNull(),
  riskNotes: text("riskNotes"),
  nextSessionPlan: text("nextSessionPlan"),
  goalsProgress: json("goalsProgress"),
  // Transcrição em tempo real
  transcription: text("transcription"),
  aiSummary: text("aiSummary"),
  aiSuggestions: text("aiSuggestions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SessionEvolution = typeof sessionEvolutions.$inferSelect;
export type InsertSessionEvolution = typeof sessionEvolutions.$inferInsert;

// ─── Inventários Psicológicos ───
export const inventoryResults = mysqlTable("inventoryResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  inventoryType: mysqlEnum("inventoryType", ["BDI_II", "BAI", "YSQ_S3", "PHQ9", "GAD7", "WHOQOL", "CUSTOM"]).notNull(),
  inventoryName: varchar("inventoryName", { length: 255 }).notNull(),
  applicationDate: timestamp("applicationDate").defaultNow().notNull(),
  totalScore: int("totalScore"),
  maxScore: int("maxScore"),
  classification: varchar("classification", { length: 128 }),
  subscaleScores: json("subscaleScores"),
  itemResponses: json("itemResponses"),
  interpretation: text("interpretation"),
  clinicalNotes: text("clinicalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InventoryResult = typeof inventoryResults.$inferSelect;
export type InsertInventoryResult = typeof inventoryResults.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// ─── AGENDAMENTOS, SESSÕES, DOCUMENTOS, MENSAGENS ───
// ═══════════════════════════════════════════════════════════════

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: bigint("startTime", { mode: "number" }).notNull(),
  endTime: bigint("endTime", { mode: "number" }).notNull(),
  status: mysqlEnum("apptStatus", ["scheduled", "confirmed", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  googleEventId: varchar("googleEventId", { length: 255 }),
  source: mysqlEnum("apptSource", ["manual", "whatsapp", "telegram", "instagram", "google_calendar", "outlook_calendar", "website"]).default("manual").notNull(),
  reminderSent: boolean("reminderSent").default(false).notNull(),
  icsSent: boolean("icsSent").default(false).notNull(),
  bookingName: varchar("bookingName", { length: 255 }),
  bookingEmail: varchar("bookingEmail", { length: 320 }),
  bookingPhone: varchar("bookingPhone", { length: 32 }),
  bookingMessage: text("bookingMessage"),
  leadId: int("leadId"), // vínculo com lead que gerou o agendamento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export const sessionNotes = mysqlTable("sessionNotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  appointmentId: int("appointmentId"),
  content: text("content").notNull(),
  summary: text("summary"),
  transcription: text("transcription"), // transcrição em tempo real da sessão
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SessionNote = typeof sessionNotes.$inferSelect;
export type InsertSessionNote = typeof sessionNotes.$inferInsert;

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  fileSize: int("fileSize"),
  category: mysqlEnum("docCategory", ["evolution", "report", "exam", "prescription", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ─── Message Log (WhatsApp + Telegram + Instagram) ───
export const messageLog = mysqlTable("messageLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId"),
  leadId: int("leadId"), // vínculo com lead
  channel: mysqlEnum("msgChannel", ["whatsapp", "telegram", "instagram"]).notNull(),
  direction: mysqlEnum("msgDirection", ["inbound", "outbound"]).notNull(),
  content: text("content"),
  messageId: varchar("messageId", { length: 255 }),
  senderName: varchar("senderName", { length: 255 }),
  senderHandle: varchar("senderHandle", { length: 255 }), // @instagram, telefone, etc.
  status: varchar("msgStatus", { length: 32 }),
  metadata: json("msgMetadata"), // dados extras (post_id, media_url, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MessageLogEntry = typeof messageLog.$inferSelect;
export type InsertMessageLog = typeof messageLog.$inferInsert;

// ─── Integration Settings ───
export const integrationSettings = mysqlTable("integrationSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("intProvider", ["google_calendar", "outlook_calendar", "whatsapp", "telegram", "instagram"]).notNull(),
  config: json("intConfig"),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type IntegrationSetting = typeof integrationSettings.$inferSelect;
export type InsertIntegrationSetting = typeof integrationSettings.$inferInsert;

// ─── Alerts ───
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("alertType", ["new_appointment", "cancellation", "urgent_message", "reminder", "system", "lead_hot", "follow_up"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("alertMessage"),
  isRead: boolean("isRead").default(false).notNull(),
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// ─── GESTÃO TOTAL DO INSTAGRAM — CONTEÚDO E ANALYTICS ───
// ═══════════════════════════════════════════════════════════════

// ─── Instagram Posts (Conteúdo) ───
export const instagramPosts = mysqlTable("instagramPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  instagramPostId: varchar("instagramPostId", { length: 255 }), // ID do post no Instagram
  caption: text("caption"),
  content: text("content"), // Texto completo do post
  mediaUrls: json("mediaUrls"), // Array de URLs de imagens/vídeos
  mediaType: mysqlEnum("mediaType", ["image", "video", "carousel", "reel", "story"]).notNull(),
  hashtags: text("hashtags"), // Hashtags separadas por espaço
  mentions: text("mentions"), // Menções separadas por espaço
  callToAction: varchar("callToAction", { length: 255 }), // CTA (ex: "Agende agora")
  
  // Agendamento
  scheduledFor: timestamp("scheduledFor"), // Quando será publicado
  publishedAt: timestamp("publishedAt"), // Quando foi publicado
  status: mysqlEnum("postStatus", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  
  // Performance
  views: int("views").default(0).notNull(),
  likes: int("likes").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  saves: int("saves").default(0).notNull(),
  reach: int("reach").default(0).notNull(),
  impressions: int("impressions").default(0).notNull(),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Otimização
  aiOptimizationScore: int("aiOptimizationScore"), // Score de 0-100
  aiSuggestions: json("aiSuggestions"), // Sugestões de melhoria
  bestTimeToPost: varchar("bestTimeToPost", { length: 32 }), // Melhor horário
  targetAudience: json("targetAudience"), // Público-alvo sugerido
  
  // Metadata
  theme: varchar("theme", { length: 128 }), // Tema do post (ex: "TCC", "Ansiedade")
  contentType: mysqlEnum("contentType", ["educational", "testimonial", "promotional", "behind_the_scenes", "interactive", "motivational"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InstagramPost = typeof instagramPosts.$inferSelect;
export type InsertInstagramPost = typeof instagramPosts.$inferInsert;

// ─── Instagram Stories ───
export const instagramStories = mysqlTable("instagramStories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  instagramStoryId: varchar("instagramStoryId", { length: 255 }),
  mediaUrl: text("mediaUrl"),
  mediaType: mysqlEnum("storyMediaType", ["image", "video"]).notNull(),
  text: text("text"),
  stickers: json("stickers"), // Stickers, polls, etc.
  
  scheduledFor: timestamp("scheduledFor"),
  publishedAt: timestamp("publishedAt"),
  status: mysqlEnum("storyStatus", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  
  views: int("views").default(0).notNull(),
  replies: int("replies").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InstagramStory = typeof instagramStories.$inferSelect;
export type InsertInstagramStory = typeof instagramStories.$inferInsert;

// ─── Instagram Reels ───
export const instagramReels = mysqlTable("instagramReels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  instagramReelId: varchar("instagramReelId", { length: 255 }),
  videoUrl: text("videoUrl"),
  thumbnail: text("thumbnail"),
  caption: text("caption"),
  hashtags: text("hashtags"),
  music: varchar("music", { length: 255 }), // Música usada
  duration: int("duration"), // Duração em segundos
  
  scheduledFor: timestamp("scheduledFor"),
  publishedAt: timestamp("publishedAt"),
  status: mysqlEnum("reelStatus", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  
  views: int("views").default(0).notNull(),
  likes: int("likes").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  saves: int("saves").default(0).notNull(),
  reach: int("reach").default(0).notNull(),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).default("0.00"),
  
  aiOptimizationScore: int("aiOptimizationScore"),
  aiSuggestions: json("aiSuggestions"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InstagramReel = typeof instagramReels.$inferSelect;
export type InsertInstagramReel = typeof instagramReels.$inferInsert;

// ─── Instagram Analytics & Growth Metrics ───
export const instagramAnalytics = mysqlTable("instagramAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Followers & Engagement
  followers: int("followers").default(0).notNull(),
  followersGrowth: int("followersGrowth").default(0).notNull(), // Crescimento no período
  followersGrowthRate: decimal("followersGrowthRate", { precision: 5, scale: 2 }).default("0.00"), // Percentual
  
  totalEngagement: int("totalEngagement").default(0).notNull(),
  avgEngagementRate: decimal("avgEngagementRate", { precision: 5, scale: 2 }).default("0.00"),
  avgLikesPerPost: decimal("avgLikesPerPost", { precision: 8, scale: 2 }).default("0.00"),
  avgCommentsPerPost: decimal("avgCommentsPerPost", { precision: 8, scale: 2 }).default("0.00"),
  
  // Reach & Impressions
  totalReach: int("totalReach").default(0).notNull(),
  totalImpressions: int("totalImpressions").default(0).notNull(),
  avgReachPerPost: int("avgReachPerPost").default(0).notNull(),
  
  // Audience Demographics
  audienceDemographics: json("audienceDemographics"), // Idade, gênero, localização, etc.
  topAudienceCountries: json("topAudienceCountries"),
  topAudienceCities: json("topAudienceCities"),
  
  // Content Performance
  bestPerformingContentType: varchar("bestPerformingContentType", { length: 128 }),
  bestPerformingTheme: varchar("bestPerformingTheme", { length: 128 }),
  bestTimeToPost: varchar("bestTimeToPost", { length: 32 }),
  bestDayToPost: varchar("bestDayToPost", { length: 32 }),
  
  // Monetization
  estimatedMonthlyEarnings: decimal("estimatedMonthlyEarnings", { precision: 10, scale: 2 }).default("0.00"),
  reelsPlayCount: int("reelsPlayCount").default(0).notNull(),
  reelsEarnings: decimal("reelsEarnings", { precision: 10, scale: 2 }).default("0.00"),
  
  // Growth Strategy
  growthScore: int("growthScore").default(0).notNull(), // Score de 0-100
  recommendations: json("recommendations"), // Recomendações de crescimento
  
  // Period
  period: mysqlEnum("analyticsPeriod", ["daily", "weekly", "monthly"]).default("daily").notNull(),
  periodDate: date("periodDate").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InstagramAnalytic = typeof instagramAnalytics.$inferSelect;
export type InsertInstagramAnalytic = typeof instagramAnalytics.$inferInsert;

// ─── Instagram Content Calendar ───
export const instagramContentCalendar = mysqlTable("instagramContentCalendar", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  theme: varchar("theme", { length: 255 }), // Tema do mês (ex: "Ansiedade e Mindfulness")
  strategy: text("strategy"), // Estratégia de conteúdo
  goals: json("goals"), // Metas do mês (followers, engagement, etc.)
  
  contentIdeas: json("contentIdeas"), // Array de ideias de conteúdo
  hashtags: text("hashtags"), // Hashtags principais do mês
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InstagramContentCalendar = typeof instagramContentCalendar.$inferSelect;
export type InsertInstagramContentCalendar = typeof instagramContentCalendar.$inferInsert;

// ─── Instagram AI Content Suggestions ───
export const instagramAISuggestions = mysqlTable("instagramAISuggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  suggestionType: mysqlEnum("suggestionType", ["caption", "hashtags", "content_idea", "posting_time", "audience_targeting", "growth_strategy"]).notNull(),
  content: text("content"),
  reasoning: text("reasoning"), // Por que essa sugestão
  expectedImpact: varchar("expectedImpact", { length: 128 }), // Impacto esperado
  
  isApplied: boolean("isApplied").default(false).notNull(),
  appliedAt: timestamp("appliedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InstagramAISuggestion = typeof instagramAISuggestions.$inferSelect;
export type InsertInstagramAISuggestion = typeof instagramAISuggestions.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// ─── SISTEMA DE APRENDIZADO CONTÍNUO E EVOLUÇÃO QUANTITATIVA ───
// ═══════════════════════════════════════════════════════════════

// ─── Agent Action Log — Histórico de todas as ações ───
export const agentActionLog = mysqlTable("agentActionLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Identificação da ação
  actionType: mysqlEnum("actionType", [
    "post_created", "post_published", "post_edited",
    "instagram_sync", "analytics_generated",
    "content_idea_generated", "caption_optimized",
    "appointment_created", "appointment_published",
    "patient_interaction", "message_sent",
    "document_uploaded", "assessment_completed",
    "ai_suggestion_applied", "optimization_executed"
  ]).notNull(),
  
  // Descrição e contexto
  description: text("description"),
  actionData: json("actionData"), // Dados completos da ação
  
  // Resultado e feedback
  success: boolean("success").default(true).notNull(),
  errorMessage: text("errorMessage"),
  
  // Métricas de resultado
  resultMetrics: json("resultMetrics"), // Ex: { engagement: 150, reach: 500, conversions: 3 }
  
  // Feedback do usuário
  userFeedback: mysqlEnum("userFeedback", ["positive", "neutral", "negative"]),
  feedbackNotes: text("feedbackNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentActionLog = typeof agentActionLog.$inferSelect;
export type InsertAgentActionLog = typeof agentActionLog.$inferInsert;

// ─── Performance Metrics — Métricas agregadas por período ───
export const performanceMetrics = mysqlTable("performanceMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Período
  period: mysqlEnum("metricsPeriod", ["hourly", "daily", "weekly", "monthly"]).notNull(),
  periodDate: date("periodDate").notNull(),
  
  // Contadores de ações
  totalActionsExecuted: int("totalActionsExecuted").default(0).notNull(),
  successfulActions: int("successfulActions").default(0).notNull(),
  failedActions: int("failedActions").default(0).notNull(),
  successRate: decimal("successRate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Engajamento e alcance
  totalEngagement: int("totalEngagement").default(0).notNull(),
  totalReach: int("totalReach").default(0).notNull(),
  avgEngagementPerAction: decimal("avgEngagementPerAction", { precision: 10, scale: 2 }).default("0.00"),
  
  // Conversões e resultados
  totalConversions: int("totalConversions").default(0).notNull(),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Satisfação do usuário
  positiveActions: int("positiveActions").default(0).notNull(),
  negativeActions: int("negativeActions").default(0).notNull(),
  satisfactionScore: decimal("satisfactionScore", { precision: 5, scale: 2 }).default("0.00"), // 0-100
  
  // Eficiência
  avgExecutionTime: int("avgExecutionTime").default(0).notNull(), // em ms
  resourceUsage: decimal("resourceUsage", { precision: 5, scale: 2 }).default("0.00"), // percentual
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

// ─── Learning Insights — Aprendizados e padrões descobertos ───
export const learningInsights = mysqlTable("learningInsights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Tipo de insight
  insightType: mysqlEnum("insightType", [
    "best_posting_time",
    "best_content_type",
    "high_engagement_pattern",
    "low_engagement_pattern",
    "conversion_driver",
    "audience_preference",
    "seasonal_trend",
    "optimization_opportunity",
    "risk_pattern",
    "success_factor"
  ]).notNull(),
  
  // Conteúdo do insight
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Dados que suportam o insight
  supportingData: json("supportingData"),
  confidence: int("confidence").default(0).notNull(), // 0-100
  
  // Recomendações
  recommendations: json("recommendations"), // Array de ações recomendadas
  
  // Impacto esperado
  expectedImpact: varchar("expectedImpact", { length: 128 }), // Ex: "+25% engagement"
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  appliedAt: timestamp("appliedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LearningInsight = typeof learningInsights.$inferSelect;
export type InsertLearningInsight = typeof learningInsights.$inferInsert;

// ─── Optimization History — Histórico de otimizações aplicadas ───
export const optimizationHistory = mysqlTable("optimizationHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Otimização aplicada
  optimizationType: mysqlEnum("optimizationType", [
    "posting_time_adjustment",
    "caption_rewrite",
    "hashtag_optimization",
    "content_format_change",
    "audience_targeting_adjustment",
    "engagement_strategy_change",
    "frequency_adjustment",
    "ai_model_tuning"
  ]).notNull(),
  
  description: text("description"),
  
  // O que foi mudado
  changeDetails: json("changeDetails"), // Antes e depois
  
  // Resultados
  metricsBeforeOptimization: json("metricsBeforeOptimization"),
  metricsAfterOptimization: json("metricsAfterOptimization"),
  
  // Impacto
  impactPercentage: decimal("impactPercentage", { precision: 8, scale: 2 }).default("0.00"), // % de melhoria
  isSuccessful: boolean("isSuccessful").default(false).notNull(),
  
  // Feedback
  userApproval: boolean("userApproval"),
  notes: text("notes"),
  
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OptimizationHistory = typeof optimizationHistory.$inferSelect;
export type InsertOptimizationHistory = typeof optimizationHistory.$inferInsert;

// ─── AI Learning Model — Evolução do modelo de IA ───
export const aiLearningModel = mysqlTable("aiLearningModel", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Versão do modelo
  modelVersion: varchar("modelVersion", { length: 32 }).notNull(), // Ex: "1.0.0"
  modelName: varchar("modelName", { length: 255 }).notNull(),
  
  // Dados de treinamento
  trainingDataSize: int("trainingDataSize").default(0).notNull(), // Número de exemplos
  trainingDataSources: json("trainingDataSources"), // Fontes de dados
  
  // Performance
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).default("0.00"), // 0-100
  precision: decimal("precision", { precision: 5, scale: 2 }).default("0.00"),
  recall: decimal("recall", { precision: 5, scale: 2 }).default("0.00"),
  f1Score: decimal("f1Score", { precision: 5, scale: 2 }).default("0.00"),
  
  // Métricas de negócio
  engagementImprovement: decimal("engagementImprovement", { precision: 8, scale: 2 }).default("0.00"), // %
  conversionImprovement: decimal("conversionImprovement", { precision: 8, scale: 2 }).default("0.00"), // %
  
  // Metadata
  description: text("description"),
  changes: json("changes"), // O que mudou em relação à versão anterior
  
  // Status
  isActive: boolean("isActive").default(false).notNull(),
  deployedAt: timestamp("deployedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AILearningModel = typeof aiLearningModel.$inferSelect;
export type InsertAILearningModel = typeof aiLearningModel.$inferInsert;

// ─── GitHub Sync Log — Histórico de sincronizações com GitHub ───
export const githubSyncLog = mysqlTable("githubSyncLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Commit info
  commitHash: varchar("commitHash", { length: 40 }).notNull(),
  commitMessage: text("commitMessage").notNull(),
  
  // Mudanças
  filesChanged: int("filesChanged").default(0).notNull(),
  insertions: int("insertions").default(0).notNull(),
  deletions: int("deletions").default(0).notNull(),
  
  // Conteúdo do commit
  changesSummary: json("changesSummary"), // Resumo estruturado das mudanças
  
  // Contexto
  triggerReason: mysqlEnum("triggerReason", [
    "optimization_applied",
    "learning_discovered",
    "model_updated",
    "daily_snapshot",
    "manual_commit",
    "bug_fix",
    "feature_added"
  ]).notNull(),
  
  // Metadata
  branchName: varchar("branchName", { length: 255 }).default("main").notNull(),
  author: varchar("author", { length: 255 }),
  
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GitHubSyncLog = typeof githubSyncLog.$inferSelect;
export type InsertGitHubSyncLog = typeof githubSyncLog.$inferInsert;

// ─── Continuous Improvement Plan — Plano de melhoria contínua ───
export const continuousImprovementPlan = mysqlTable("continuousImprovementPlan", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Objetivo
  objective: varchar("objective", { length: 255 }).notNull(),
  description: text("description"),
  
  // Métricas alvo
  targetMetric: varchar("targetMetric", { length: 128 }).notNull(), // Ex: "engagement_rate"
  currentValue: decimal("currentValue", { precision: 10, scale: 2 }).default("0.00"),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }).default("0.00"),
  
  // Ações planejadas
  plannedActions: json("plannedActions"), // Array de ações
  
  // Timeline
  startDate: date("startDate").notNull(),
  targetDate: date("targetDate").notNull(),
  
  // Status
  status: mysqlEnum("improvementStatus", ["planning", "in_progress", "completed", "paused"]).default("planning").notNull(),
  progressPercentage: int("progressPercentage").default(0).notNull(),
  
  // Resultados
  actualValue: decimal("actualValue", { precision: 10, scale: 2 }),
  achieved: boolean("achieved"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContinuousImprovementPlan = typeof continuousImprovementPlan.$inferSelect;
export type InsertContinuousImprovementPlan = typeof continuousImprovementPlan.$inferInsert;
