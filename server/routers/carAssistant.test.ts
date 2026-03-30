import { describe, it, expect, beforeEach, vi } from "vitest";
import { carAssistantRouter } from "./carAssistant";
import { getDb } from "../db";

// Mock do getDb
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("Car Assistant Router", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe("blockTimeSlot", () => {
    it("deve bloquear um horário com sucesso", async () => {
      const input = {
        startDate: new Date("2026-04-01T14:00:00"),
        endDate: new Date("2026-04-01T15:00:00"),
        reason: "Almoço",
      };

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).blockTimeSlot(input);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Almoço");
    });

    it("deve retornar mensagem de sucesso", async () => {
      const input = {
        startDate: new Date("2026-04-01T14:00:00"),
        endDate: new Date("2026-04-01T15:00:00"),
        reason: "Reunião",
      };

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).blockTimeSlot(input);

      expect(result.message).toContain("✅");
    });
  });

  describe("getTodayAppointments", () => {
    it("deve retornar agendamentos de hoje", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      mockDb.where.mockResolvedValue([
        {
          id: 1,
          title: "Sessão com Maria",
          startTime: today.getTime(),
          endTime: today.getTime() + 60 * 60000,
        },
      ]);

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).getTodayAppointments({});

      expect(result.count).toBe(1);
      expect(result.message).toContain("✅");
    });

    it("deve retornar count zero se não houver agendamentos", async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).getTodayAppointments({});

      expect(result.count).toBe(0);
    });
  });

  describe("getAppointmentsByPeriod", () => {
    it("deve retornar agendamentos de um período", async () => {
      const startDate = new Date("2026-04-01");
      const endDate = new Date("2026-04-30");

      mockDb.where.mockResolvedValue([
        {
          id: 1,
          title: "Sessão 1",
          startTime: startDate.getTime(),
        },
        {
          id: 2,
          title: "Sessão 2",
          startTime: new Date("2026-04-15").getTime(),
        },
      ]);

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).getAppointmentsByPeriod({ startDate, endDate });

      expect(result.count).toBe(2);
      expect(result.appointments.length).toBe(2);
    });

    it("deve retornar mensagem de sucesso com contagem", async () => {
      mockDb.where.mockResolvedValue([
        { id: 1, title: "Sessão" },
        { id: 2, title: "Sessão" },
      ]);

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).getAppointmentsByPeriod({
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-04-30"),
      });

      expect(result.message).toContain("2");
    });
  });

  describe("createAppointment", () => {
    it("deve criar agendamento com sucesso", async () => {
      mockDb.where.mockResolvedValue([]); // Sem conflitos

      const input = {
        patientId: "1",
        title: "Sessão com João",
        startDate: new Date("2026-04-05T14:00:00"),
        endDate: new Date("2026-04-05T15:00:00"),
        description: "Sessão TCC",
      };

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).createAppointment(input);

      expect(result.success).toBe(true);
      expect(result.message).toContain("✅");
    });

    it("deve retornar erro se horário não está disponível", async () => {
      mockDb.where.mockResolvedValue([
        { id: 1, title: "Conflito" }, // Há conflito
      ]);

      const input = {
        patientId: "1",
        title: "Sessão com João",
        startDate: new Date("2026-04-05T14:00:00"),
        endDate: new Date("2026-04-05T15:00:00"),
      };

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).createAppointment(input);

      expect(result.success).toBe(false);
      expect(result.message).toContain("❌");
    });
  });

  describe("updateAppointment", () => {
    it("deve atualizar agendamento com sucesso", async () => {
      const input = {
        appointmentId: "1",
        title: "Sessão Atualizada",
        status: "confirmed" as const,
      };

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).updateAppointment(input);

      expect(result.success).toBe(true);
      expect(result.message).toContain("✅");
    });
  });

  describe("deleteAppointment", () => {
    it("deve deletar agendamento com sucesso", async () => {
      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).deleteAppointment({ appointmentId: "1" });

      expect(result.success).toBe(true);
      expect(result.message).toContain("✅");
    });
  });

  describe("syncAllAppointments", () => {
    it("deve sincronizar todos os agendamentos", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue([
          { id: 1, title: "Sessão 1" },
          { id: 2, title: "Sessão 2" },
        ]),
      });

      const result = await carAssistantRouter.createCaller({
        user: { id: 1 },
      } as any).syncAllAppointments({});

      expect(result.success).toBe(true);
      expect(result.message).toContain("✅");
    });
  });
});
