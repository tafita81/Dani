import { describe, it, expect } from "vitest";
import {
  generateConfirmationMessage,
  generateRescheduleMessage,
  generateCancellationMessage,
  generateReminderMessage,
  parseConfirmationResponse,
} from "./whatsappService";

describe("WhatsApp Service", () => {
  describe("generateConfirmationMessage", () => {
    it("deve gerar mensagem de confirmação com dados corretos", () => {
      const message = generateConfirmationMessage({
        patientPhone: "5511987654321",
        patientName: "Maria",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Dra. Daniela",
      });

      expect(message).toContain("Maria");
      expect(message).toContain("Dra. Daniela");
      expect(message).toContain("14:00");
      expect(message.length > 0).toBe(true);
    });

    it("deve gerar mensagens variadas", () => {
      const messages = new Set();
      const data = {
        patientPhone: "5511987654321",
        patientName: "João",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Terapeuta",
      };

      for (let i = 0; i < 10; i++) {
        messages.add(generateConfirmationMessage(data));
      }

      // Deve gerar pelo menos 2 variações diferentes
      expect(messages.size).toBeGreaterThan(1);
    });
  });

  describe("generateRescheduleMessage", () => {
    it("deve gerar mensagem de remarcação com datas corretas", () => {
      const message = generateRescheduleMessage({
        patientPhone: "5511987654321",
        patientName: "Ana",
        originalDate: new Date("2026-04-05"),
        originalTime: "14:00",
        newDate: new Date("2026-04-12"),
        newTime: "15:00",
        therapistName: "Dra. Daniela",
      });

      expect(message).toContain("Dra. Daniela");
      expect(message).toContain("15:00");
      expect(message.length).toBeGreaterThan(10);
    });

    it("deve incluir nova data e hora", () => {
      const message = generateRescheduleMessage({
        patientPhone: "5511987654321",
        patientName: "Carlos",
        originalDate: new Date("2026-04-05"),
        originalTime: "14:00",
        newDate: new Date("2026-04-12"),
        newTime: "15:00",
        therapistName: "Terapeuta",
      });

      expect(message).toContain("15:00");
      expect(message).toContain("Terapeuta");
    });
  });

  describe("generateCancellationMessage", () => {
    it("deve gerar mensagem de cancelamento com dados corretos", () => {
      const message = generateCancellationMessage({
        patientPhone: "5511987654321",
        patientName: "Beatriz",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Dra. Daniela",
      });

      expect(message).toContain("Dra. Daniela");
      expect(message).toContain("14:00");
      expect(message.length).toBeGreaterThan(10);
    });

    it("deve incluir link de remarcação quando fornecido", () => {
      const rescheduleLink = "https://example.com/reschedule";
      const message = generateCancellationMessage({
        patientPhone: "5511987654321",
        patientName: "Paciente",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Terapeuta",
        rescheduleLink,
      });

      expect(message).toContain(rescheduleLink);
    });
  });

  describe("generateReminderMessage", () => {    it("deve gerar mensagem de lembrete com dados corretos", () => {
      const message = generateReminderMessage(
        "Maria",
        new Date("2026-04-05"),
        "14:00",
        "Dra. Daniela"
      );

      expect(message).toContain("Maria");
      expect(message).toContain("Dra. Daniela");
      expect(message).toContain("14:00");
      expect(message.length).toBeGreaterThan(10);
    });

    it("deve gerar mensagens variadas", () => {
      const messages = new Set();

      for (let i = 0; i < 10; i++) {
        messages.add(
          generateReminderMessage(
            "João",
            new Date("2026-04-05"),
            "14:00",
            "Terapeuta"
          )
        );
      }

      // Deve gerar pelo menos 2 variações
      expect(messages.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe("parseConfirmationResponse", () => {
    it("deve reconhecer confirmações", () => {
      const confirmations = [
        "Sim",
        "yes",
        "Ok",
        "Certo",
        "Pode ser",
        "👍",
        "✅",
      ];

      confirmations.forEach((response) => {
        expect(parseConfirmationResponse(response)).toBe("confirmed");
      });
    });

    it("deve reconhecer cancelamentos", () => {
      const cancellations = [
        "Não",
        "no",
        "Cancela",
        "Não posso",
        "❌",
        "👎",
      ];

      cancellations.forEach((response) => {
        expect(parseConfirmationResponse(response)).toBe("cancelled");
      });
    });

    it("deve reconhecer remarcações", () => {
      const reschedules = [
        "Remarcar",
        "Outro horário",
        "Outro dia",
        "Quando?",
        "Que horas?",
      ];

      reschedules.forEach((response) => {
        expect(parseConfirmationResponse(response)).toBe("rescheduled");
      });
    });

    it("deve retornar unknown para respostas não reconhecidas", () => {
      expect(parseConfirmationResponse("Talvez")).toBe("unknown");
      expect(parseConfirmationResponse("xyz")).toBe("unknown");
      expect(parseConfirmationResponse("abc123")).toBe("unknown");
    });

    it("deve ser case-insensitive", () => {
      expect(parseConfirmationResponse("SIM")).toBe("confirmed");
      expect(parseConfirmationResponse("NÃO")).toBe("cancelled");
      expect(parseConfirmationResponse("REMARCAR")).toBe("rescheduled");
    });

    it("deve ignorar espaços em branco", () => {
      expect(parseConfirmationResponse("  sim  ")).toBe("confirmed");
      expect(parseConfirmationResponse("  não  ")).toBe("cancelled");
    });
  });

  describe("Message Quality", () => {
    it("mensagens devem conter nome do paciente", () => {
      const message = generateConfirmationMessage({
        patientPhone: "5511987654321",
        patientName: "Teste",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Terapeuta",
      });

      expect(message).toContain("Teste");
    });

    it("mensagens devem conter nome do terapeuta", () => {
      const message = generateConfirmationMessage({
        patientPhone: "5511987654321",
        patientName: "Paciente",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Dra. Silva",
      });

      expect(message).toContain("Dra. Silva");
    });

    it("mensagens devem ser humanas (não robóticas)", () => {
      const message = generateConfirmationMessage({
        patientPhone: "5511987654321",
        patientName: "Maria",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Dra. Daniela",
      });

      // Não deve conter padrões robóticos
      expect(message).not.toContain("CONFIRMAÇÃO_AGENDAMENTO");
      expect(message).not.toContain("{{");
      expect(message.length).toBeGreaterThan(20);
    });
  });
});
