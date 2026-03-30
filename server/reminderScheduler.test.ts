import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  scheduleReminders,
  cancelReminders,
  getScheduledReminders,
  getReminderStats,
  cleanupOldReminders,
  type ReminderConfig,
} from "./reminderScheduler";

describe("Reminder Scheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scheduleReminders", () => {
    it("deve agendar lembretes com configuração padrão", () => {
      const reminders = scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      expect(reminders.length).toBeGreaterThan(0);
      expect(reminders[0].appointmentId).toBe("apt_123");
      expect(reminders[0].patientName).toBe("Maria Silva");
      expect(reminders[0].status).toBe("pending");
    });

    it("deve agendar lembretes para 24h, 1h e 15min antes", () => {
      const reminders = scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      const hours = reminders.map((r) => r.hoursBeforeAppointment);
      expect(hours).toContain(24);
      expect(hours).toContain(1);
      expect(hours).toContain(0.25);
    });

    it("deve respeitar configuração customizada", () => {
      const config: ReminderConfig[] = [
        { hoursBeforeAppointment: 48, channel: "email", enabled: true },
        { hoursBeforeAppointment: 2, channel: "whatsapp", enabled: true },
      ];

      const reminders = scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela",
        config
      );

      expect(reminders.length).toBe(2);
      expect(reminders[0].hoursBeforeAppointment).toBe(48);
      expect(reminders[1].hoursBeforeAppointment).toBe(2);
    });

    it("deve ignorar configurações desabilitadas", () => {
      const config: ReminderConfig[] = [
        { hoursBeforeAppointment: 24, channel: "email", enabled: false },
        { hoursBeforeAppointment: 1, channel: "whatsapp", enabled: true },
      ];

      const reminders = scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela",
        config
      );

      expect(reminders.length).toBe(1);
      expect(reminders[0].hoursBeforeAppointment).toBe(1);
    });

    it("deve gerar IDs únicos para cada lembrete", () => {
      const reminders = scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      const ids = reminders.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("cancelReminders", () => {
    it("deve cancelar lembretes de um agendamento", () => {
      scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      const cancelled = cancelReminders("apt_123");
      expect(cancelled).toBeGreaterThan(0);
    });

    it("deve retornar 0 se não houver lembretes para cancelar", () => {
      const cancelled = cancelReminders("apt_nonexistent");
      expect(cancelled).toBe(0);
    });

    it("deve cancelar apenas lembretes do agendamento especificado", () => {
      scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      scheduleReminders(
        "apt_456",
        "João Santos",
        "5511987654322",
        "joao@email.com",
        new Date("2026-04-06T15:00:00"),
        "15:00",
        "Dra. Daniela"
      );

      const cancelled = cancelReminders("apt_123");
      const remaining = getScheduledReminders("apt_456");

      expect(cancelled).toBeGreaterThan(0);
      expect(remaining.length).toBeGreaterThan(0);
    });
  });

  describe("getScheduledReminders", () => {
    it("deve retornar lembretes agendados para um agendamento", () => {
      scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      const reminders = getScheduledReminders("apt_123");
      expect(reminders.length).toBeGreaterThan(0);
      expect(reminders[0].appointmentId).toBe("apt_123");
    });

    it("deve retornar array vazio para agendamento sem lembretes", () => {
      const reminders = getScheduledReminders("apt_nonexistent");
      expect(reminders).toEqual([]);
    });
  });

  describe("getReminderStats", () => {
    it("deve retornar estatísticas de lembretes", () => {
      scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      const stats = getReminderStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.pending).toBeGreaterThan(0);
      expect(stats.sent).toBe(0);
      expect(stats.failed).toBe(0);
    });

    it("deve contar lembretes por status", () => {
      scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      const stats = getReminderStats();
      expect(stats.total).toBe(stats.pending + stats.sent + stats.failed);
    });
  });

  describe("cleanupOldReminders", () => {
    it("deve limpar lembretes antigos", () => {
      const cleaned = cleanupOldReminders(7);
      expect(typeof cleaned).toBe("number");
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });

    it("deve respeitar número de dias", () => {
      scheduleReminders(
        "apt_123",
        "Maria Silva",
        "5511987654321",
        "maria@email.com",
        new Date("2026-04-05T14:00:00"),
        "14:00",
        "Dra. Daniela"
      );

      // Limpar apenas lembretes com mais de 365 dias
      const cleaned = cleanupOldReminders(365);
      // Não deve limpar lembretes recentes
      expect(cleaned).toBe(0);
    });
  });
});
