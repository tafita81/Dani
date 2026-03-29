import { mysqlTable, int, varchar, timestamp, boolean, text, index, foreignKey } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Tabela para armazenar bloqueios de horários na agenda
 * Permite bloquear/liberar horários específicos
 */
export const scheduleBlocks = mysqlTable(
  "schedule_blocks",
  {
    id: int().primaryKey().autoincrement(),
    userId: int().notNull(), // Terapeuta/Motorista
    blockDate: varchar({ length: 10 }).notNull(), // Formato YYYY-MM-DD
    startTime: varchar({ length: 5 }).notNull(), // Formato HH:MM
    endTime: varchar({ length: 5 }).notNull(), // Formato HH:MM
    reason: varchar({ length: 100 }), // Motivo do bloqueio (almoço, reunião, etc)
    isBlocked: boolean().default(true), // true = bloqueado, false = liberado
    syncedToOutlook: boolean().default(false), // Se foi sincronizado com Outlook
    outlookEventId: varchar({ length: 255 }), // ID do evento no Outlook
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("idx_userId").on(table.userId),
    blockDateIdx: index("idx_blockDate").on(table.blockDate),
    isBlockedIdx: index("idx_isBlocked").on(table.isBlocked),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
  })
);

/**
 * Tabela para armazenar credenciais do Outlook
 */
export const outlookCredentials = mysqlTable(
  "outlook_credentials",
  {
    id: int().primaryKey().autoincrement(),
    userId: int().notNull(),
    accessToken: text().notNull(), // Token de acesso do Outlook
    refreshToken: text().notNull(), // Token de refresh
    expiresAt: timestamp().notNull(), // Quando o token expira
    outlookEmail: varchar({ length: 255 }).notNull(), // Email do Outlook
    isActive: boolean().default(true),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("idx_userId").on(table.userId),
    isActiveIdx: index("idx_isActive").on(table.isActive),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
  })
);

/**
 * Tabela para armazenar sincronizações com Outlook
 */
export const outlookSyncLog = mysqlTable(
  "outlook_sync_log",
  {
    id: int().primaryKey().autoincrement(),
    userId: int().notNull(),
    blockId: int(),
    syncType: varchar({ length: 50 }).notNull(), // create, update, delete
    status: varchar({ length: 50 }).notNull(), // success, failed, pending
    errorMessage: text(), // Mensagem de erro se falhar
    createdAt: timestamp().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_userId").on(table.userId),
    blockIdIdx: index("idx_blockId").on(table.blockId),
    statusIdx: index("idx_status").on(table.status),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
    blockFk: foreignKey({ columns: [table.blockId], foreignColumns: [scheduleBlocks.id] }),
  })
);
