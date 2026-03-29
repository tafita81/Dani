/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─── App-specific shared types ───

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  weekAppointments: number;
  unreadAlerts: number;
}

export interface WorkingHours {
  start: number; // hour 0-23
  end: number;
  slotDuration: number; // minutes
  daysOff: number[]; // 0=Sunday, 6=Saturday
}

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: 8,
  end: 18,
  slotDuration: 50,
  daysOff: [0, 6],
};

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
export type PatientStatus = "active" | "inactive" | "archived";
export type MessageChannel = "whatsapp" | "telegram";
export type AlertType = "new_appointment" | "cancellation" | "urgent_message" | "reminder" | "system";
export type DocumentCategory = "evolution" | "report" | "exam" | "prescription" | "other";
