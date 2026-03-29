import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const carAssistantFeedback = sqliteTable(
  "car_assistant_feedback",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    feedback: text("feedback").notNull(), // "positive", "negative", "neutral"
    rating: integer("rating"), // 1-5
    responseTime: integer("response_time"), // em ms
    intent: text("intent"), // patient_info, appointment_info, etc
    timestamp: integer("timestamp").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("feedback_user_id_idx").on(table.userId),
    timestampIdx: index("feedback_timestamp_idx").on(table.timestamp),
    feedbackIdx: index("feedback_feedback_idx").on(table.feedback),
  })
);

export type CarAssistantFeedback = typeof carAssistantFeedback.$inferSelect;
export type CarAssistantFeedbackInsert = typeof carAssistantFeedback.$inferInsert;
