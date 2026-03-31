import { describe, it, expect } from "vitest";
import {
  generateHumanizedMessage,
  createConfirmationMessage,
  createRescheduleOptionsMessage,
  createReminderMessage,
  createRescheduleConfirmationMessage,
  processPatientResponse,
  validatePhoneNumber,
  formatPhoneNumber,
} from "./whatsappScheduling";

describe("WhatsApp Scheduling", () => {
  describe("generateHumanizedMessage", () => {
    it("should generate humanized confirmation message", () => {
      const message = generateHumanizedMessage("confirm_appointment", {
        patientName: "João",
        date: "segunda, 31 de março",
        time: "14:00",
      });

      expect(message).toContain("João");
      expect(message).toContain("14:00");
      expect(message).not.toContain("{{");
    });

    it("should generate different messages on multiple calls", () => {
      const messages = new Set();
      for (let i = 0; i < 5; i++) {
        const message = generateHumanizedMessage("confirm_appointment", {
          patientName: "Maria",
          date: "terça, 1 de abril",
          time: "10:00",
        });
        messages.add(message);
      }

      expect(messages.size).toBeGreaterThan(1);
    });

    it("should generate reschedule options message", () => {
      const message = generateHumanizedMessage("reschedule_options", {
        patientName: "Pedro",
        date: "quarta, 2 de abril",
        slots: "1. segunda, 31 de março às 10:00\n2. terça, 1 de abril às 14:00",
      });

      expect(message).toContain("Pedro");
      expect(message).toContain("10:00");
    });

    it("should generate reminder message", () => {
      const message = generateHumanizedMessage("appointment_reminder", {
        patientName: "Ana",
        date: "quinta, 3 de abril",
        time: "16:00",
      });

      expect(message).toContain("Ana");
      expect(message).toContain("16:00");
    });
  });

  describe("createConfirmationMessage", () => {
    it("should create confirmation message with correct structure", () => {
      const date = new Date("2026-04-01");
      const message = createConfirmationMessage("João Silva", date, "14:00");

      expect(message.messageType).toBe("confirm_appointment");
      expect(message.patientName).toBeUndefined();
      expect(message.messageText).toContain("João Silva");
      expect(message.messageText).toContain("14:00");
    });
  });

  describe("createRescheduleOptionsMessage", () => {
    it("should create reschedule options with available slots", () => {
      const originalDate = new Date("2026-03-31");
      const availableSlots = [
        { date: new Date("2026-04-01"), time: "10:00" },
        { date: new Date("2026-04-02"), time: "14:00" },
      ];

      const message = createRescheduleOptionsMessage(
        "Maria Santos",
        originalDate,
        availableSlots
      );

      expect(message.messageType).toBe("reschedule_options");
      expect(message.availableSlots?.length).toBe(2);
      expect(message.messageText).toContain("Maria Santos");
    });
  });

  describe("createReminderMessage", () => {
    it("should create reminder message", () => {
      const date = new Date("2026-04-01");
      const message = createReminderMessage("Pedro Costa", date, "16:00");

      expect(message.messageType).toBe("appointment_reminder");
      expect(message.messageText).toContain("Pedro Costa");
      expect(message.messageText).toContain("16:00");
    });
  });

  describe("createRescheduleConfirmationMessage", () => {
    it("should create reschedule confirmation message", () => {
      const newDate = new Date("2026-04-05");
      const message = createRescheduleConfirmationMessage(
        "Ana Silva",
        newDate,
        "11:00"
      );

      expect(message.messageType).toBe("reschedule_confirmation");
      expect(message.messageText).toContain("Ana Silva");
      expect(message.messageText).toContain("11:00");
    });
  });

  describe("processPatientResponse", () => {
    it("should process confirmation response", () => {
      const result = processPatientResponse("SIM", "confirm_appointment");

      expect(result.action).toBe("confirm");
    });

    it("should process denial response", () => {
      const result = processPatientResponse("NÃO", "confirm_appointment");

      expect(result.action).toBe("deny");
    });

    it("should process slot selection", () => {
      const result = processPatientResponse("2", "reschedule_options");

      expect(result.action).toBe("select_slot");
      expect(result.selectedSlot).toBe(1);
    });

    it("should handle invalid response", () => {
      const result = processPatientResponse("xyz", "confirm_appointment");

      expect(result.action).toBe("invalid");
    });

    it("should be case insensitive", () => {
      const result1 = processPatientResponse("sim", "confirm_appointment");
      const result2 = processPatientResponse("SIM", "confirm_appointment");

      expect(result1.action).toBe(result2.action);
    });
  });

  describe("validatePhoneNumber", () => {
    it("should validate Brazilian phone number with DDD", () => {
      expect(validatePhoneNumber("11987654321")).toBe(true);
      expect(validatePhoneNumber("+5511987654321")).toBe(true);
    });

    it("should validate phone number with country code", () => {
      expect(validatePhoneNumber("+5511987654321")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhoneNumber("123")).toBe(false);
      expect(validatePhoneNumber("abc")).toBe(false);
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format phone number with country code", () => {
      const formatted = formatPhoneNumber("11987654321");

      expect(formatted).toBe("+5511987654321");
    });

    it("should handle already formatted numbers", () => {
      const formatted = formatPhoneNumber("(11) 98765-4321");

      expect(formatted).toContain("+55");
    });
  });
});
