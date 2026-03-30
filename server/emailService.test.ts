import { describe, it, expect } from "vitest";
import {
  generateRescheduleEmailTemplate,
  generateCancellationEmailTemplate,
  generateConfirmationEmailTemplate,
} from "./emailService";

describe("Email Service", () => {
  describe("generateRescheduleEmailTemplate", () => {
    it("deve gerar template de remarcação com dados corretos", () => {
      const notification = {
        patientName: "Maria Silva",
        patientEmail: "maria@email.com",
        originalDate: new Date("2026-04-05"),
        originalTime: "14:00",
        newDate: new Date("2026-04-12"),
        newTime: "15:00",
        reason: "Indisponibilidade da terapeuta",
        therapistName: "Dra. Daniela",
      };

      const template = generateRescheduleEmailTemplate(notification);

      expect(template.subject).toContain("04/2026");
      expect(template.body).toContain("Maria Silva");
      expect(template.body).toContain("Dra. Daniela");
      expect(template.body).toContain("2026");
      expect(template.htmlBody).toBeDefined();
    });

    it("deve incluir motivo quando fornecido", () => {
      const notification = {
        patientName: "João",
        patientEmail: "joao@email.com",
        originalDate: new Date("2026-04-05"),
        originalTime: "14:00",
        newDate: new Date("2026-04-12"),
        newTime: "15:00",
        reason: "Motivo teste",
        therapistName: "Terapeuta",
      };

      const template = generateRescheduleEmailTemplate(notification);
      expect(template.body).toContain("Motivo teste");
    });
  });

  describe("generateCancellationEmailTemplate", () => {
    it("deve gerar template de cancelamento com dados corretos", () => {
      const notification = {
        patientName: "Ana Costa",
        patientEmail: "ana@email.com",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        reason: "Emergência",
        therapistName: "Dra. Daniela",
        rescheduleLink: "https://example.com/reschedule",
      };

      const template = generateCancellationEmailTemplate(notification);

      expect(template.subject).toContain("04/04/2026");
      expect(template.body).toContain("Ana Costa");
      expect(template.body).toContain("Dra. Daniela");
      expect(template.body).toContain("Emergência");
      expect(template.body).toContain("https://example.com/reschedule");
    });

    it("deve funcionar sem motivo e sem link de remarcação", () => {
      const notification = {
        patientName: "Carlos",
        patientEmail: "carlos@email.com",
        appointmentDate: new Date("2026-04-05"),
        appointmentTime: "14:00",
        therapistName: "Terapeuta",
      };

      const template = generateCancellationEmailTemplate(notification);

      expect(template.subject).toBeDefined();
      expect(template.body).toContain("Carlos");
      expect(template.htmlBody).toBeDefined();
    });
  });

  describe("generateConfirmationEmailTemplate", () => {
    it("deve gerar template de confirmação com dados corretos", () => {
      const template = generateConfirmationEmailTemplate(
        "Beatriz",
        new Date("2026-04-05"),
        "14:00",
        "Dra. Daniela",
        "Consultório Centro"
      );

      expect(template.subject).toContain("04/04/2026");
      expect(template.body).toContain("Beatriz");
      expect(template.body).toContain("Dra. Daniela");
      expect(template.body).toContain("14:00");
      expect(template.body).toContain("Consultório Centro");
    });

    it("deve funcionar sem local", () => {
      const template = generateConfirmationEmailTemplate(
        "Paciente",
        new Date("2026-04-05"),
        "14:00",
        "Terapeuta"
      );

      expect(template.subject).toBeDefined();
      expect(template.body).toBeDefined();
      expect(template.htmlBody).toBeDefined();
    });
  });

  describe("Email Template Structure", () => {
    it("deve ter subject, body e htmlBody", () => {
      const notification = {
        patientName: "Teste",
        patientEmail: "teste@email.com",
        originalDate: new Date("2026-04-05"),
        originalTime: "14:00",
        newDate: new Date("2026-04-12"),
        newTime: "15:00",
        therapistName: "Terapeuta",
      };

      const template = generateRescheduleEmailTemplate(notification);

      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("body");
      expect(template).toHaveProperty("htmlBody");
      expect(typeof template.subject).toBe("string");
      expect(typeof template.body).toBe("string");
      expect(typeof template.htmlBody).toBe("string");
    });

    it("htmlBody deve conter tags HTML válidas", () => {
      const template = generateConfirmationEmailTemplate(
        "Teste",
        new Date("2026-04-05"),
        "14:00",
        "Terapeuta"
      );

      expect(template.htmlBody).toContain("<html>");
      expect(template.htmlBody).toContain("</html>");
      expect(template.htmlBody).toContain("<body");
      expect(template.htmlBody).toContain("</body>");
    });
  });
});
