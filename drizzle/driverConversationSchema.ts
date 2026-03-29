import { mysqlTable, int, text, varchar, timestamp, index, foreignKey } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Tabela para armazenar conversas do motorista no Assistente Carro
 * Sem nenhuma relação com pacientes - apenas histórico de perguntas/respostas
 */
export const driverConversations = mysqlTable(
  "driver_conversations",
  {
    id: int().primaryKey().autoincrement(),
    userId: int().notNull(), // Motorista/Terapeuta usando o assistente
    question: text().notNull(), // Pergunta feita pelo motorista
    answer: text().notNull(), // Resposta do assistente
    audioUrl: varchar({ length: 500 }), // URL do áudio gravado
    duration: int(), // Duração em segundos
    topic: varchar({ length: 100 }), // Tópico detectado (saúde, bem-estar, psicologia, etc)
    dataSource: varchar({ length: 100 }), // Fonte de dados (universal_database_search, etc)
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("idx_userId").on(table.userId),
    topicIdx: index("idx_topic").on(table.topic),
    createdAtIdx: index("idx_createdAt").on(table.createdAt),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
  })
);

/**
 * Tabela para armazenar recomendações inteligentes
 * Baseadas no contexto das conversas
 */
export const driverRecommendations = mysqlTable(
  "driver_recommendations",
  {
    id: int().primaryKey().autoincrement(),
    conversationId: int().notNull(),
    recommendationType: varchar({ length: 50 }), // wellness_tip, breathing_exercise, meditation, etc
    recommendationText: text().notNull(), // Texto da recomendação
    category: varchar({ length: 50 }), // Categoria (bem-estar, mindfulness, etc)
    createdAt: timestamp().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index("idx_conversationId").on(table.conversationId),
    categoryIdx: index("idx_category").on(table.category),
    conversationFk: foreignKey({
      columns: [table.conversationId],
      foreignColumns: [driverConversations.id],
    }),
  })
);

/**
 * Tabela para análise de tópicos
 * Rastreia quais tópicos o motorista pergunta mais
 */
export const driverTopicAnalysis = mysqlTable(
  "driver_topic_analysis",
  {
    id: int().primaryKey().autoincrement(),
    userId: int().notNull(),
    topic: varchar({ length: 100 }).notNull(), // Tópico (saúde, bem-estar, psicologia, etc)
    count: int().default(1), // Quantas vezes perguntou sobre este tópico
    lastAskedAt: timestamp(), // Última vez que perguntou
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("idx_userId").on(table.userId),
    topicIdx: index("idx_topic").on(table.topic),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
  })
);
