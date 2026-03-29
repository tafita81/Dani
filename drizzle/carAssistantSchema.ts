import { mysqlTable, int, text, varchar, boolean, timestamp, date, time, index, foreignKey } from "drizzle-orm/mysql-core";
import { users, patients } from "./schema";

/**
 * Tabela para armazenar conversas do Assistente Carro
 */
export const carAssistantConversations = mysqlTable(
  "car_assistant_conversations",
  {
    id: int().primaryKey().autoincrement(),
    userId: int().notNull(),
    patientId: int(),
    question: text().notNull(),
    answer: text().notNull(),
    audioUrl: varchar({ length: 500 }),
    duration: int(), // duração em segundos
    sentiment: varchar({ length: 50 }), // positive, negative, neutral
    topic: varchar({ length: 100 }), // tópico detectado
    dataSource: varchar({ length: 100 }), // fonte de dados
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("idx_userId").on(table.userId),
    patientIdIdx: index("idx_patientId").on(table.patientId),
    createdAtIdx: index("idx_createdAt").on(table.createdAt),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
    patientFk: foreignKey({ columns: [table.patientId], foreignColumns: [patients.id] }),
  })
);

/**
 * Tabela para armazenar recomendações geradas
 */
export const carAssistantRecommendations = mysqlTable(
  "car_assistant_recommendations",
  {
    id: int().primaryKey().autoincrement(),
    conversationId: int().notNull(),
    recommendationType: varchar({ length: 50 }), // appointment, followup, technique, etc
    recommendationText: text().notNull(),
    actionTaken: boolean().default(false),
    actionDate: timestamp(),
    createdAt: timestamp().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index("idx_conversationId").on(table.conversationId),
    actionTakenIdx: index("idx_actionTaken").on(table.actionTaken),
    conversationFk: foreignKey({
      columns: [table.conversationId],
      foreignColumns: [carAssistantConversations.id],
    }),
  })
);

/**
 * Tabela para armazenar agendamentos feitos pelo Assistente Carro
 */
export const carAssistantAppointments = mysqlTable(
  "car_assistant_appointments",
  {
    id: int().primaryKey().autoincrement(),
    conversationId: int().notNull(),
    patientId: int().notNull(),
    userId: int().notNull(),
    requestedDate: date(),
    requestedTime: time(),
    confirmedDate: date(),
    confirmedTime: time(),
    status: varchar({ length: 50 }).default("pending"), // pending, confirmed, cancelled
    notes: text(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().onUpdateNow(),
  },
  (table) => ({
    statusIdx: index("idx_status").on(table.status),
    requestedDateIdx: index("idx_requestedDate").on(table.requestedDate),
    conversationFk: foreignKey({
      columns: [table.conversationId],
      foreignColumns: [carAssistantConversations.id],
    }),
    patientFk: foreignKey({ columns: [table.patientId], foreignColumns: [patients.id] }),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
  })
);
