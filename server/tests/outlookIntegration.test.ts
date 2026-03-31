import { describe, it, expect } from "vitest";
import {
  getAvailableSlotsFromOutlook,
  createOutlookEvent,
  generateICSFile,
  checkOutlookIntegrationStatus,
} from "./aiAutoScheduling";
import {
  registerWebPushSubscription,
  sendWebPushAppointmentReminder,
  sendWebPushHotLeadAlert,
  calculateOptimalNotificationTime,
  schedulePushNotificationBatch,
  generatePushNotificationStats,
} from "./pushNotifications";

describe("Integração Outlook Calendar", () => {
  it("deve buscar slots disponíveis", async () => {
    const slots = await getAvailableSlotsFromOutlook(
      "therapist_123",
      new Date("2026-04-01"),
      new Date("2026-04-07"),
      60
    );

    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toHaveProperty("date");
    expect(slots[0]).toHaveProperty("time");
    expect(slots[0]).toHaveProperty("available");
  });

  it("deve criar evento no Outlook", async () => {
    const result = await createOutlookEvent(
      "therapist_123",
      "João Silva",
      new Date("2026-04-01"),
      "10:00",
      60
    );

    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
  });

  it("deve gerar arquivo ICS válido", () => {
    const ics = generateICSFile(
      "João Silva",
      "Psicóloga Daniela",
      new Date("2026-04-01"),
      "10:00",
      60
    );

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("VEVENT");
    expect(ics).toContain("Psicóloga Daniela");
  });

  it("deve verificar status de integração Outlook", () => {
    const status = checkOutlookIntegrationStatus(new Date(), 5);

    expect(["connected", "disconnected", "error"]).toContain(status.status);
    expect(status.availableSlots).toBeGreaterThanOrEqual(0);
    expect(status.upcomingEvents).toBe(5);
  });
});

describe("Web Push Notifications", () => {
  it("deve registrar Web Push subscription", () => {
    const subscription = {
      endpoint: "https://example.com/push",
      keys: {
        p256dh: "test_key",
        auth: "test_auth",
      },
    };

    const result = registerWebPushSubscription("user_123", subscription);

    expect(result.success).toBe(true);
    expect(result.subscriptionId).toBeDefined();
  });

  it("deve enviar notificação de lembrete de consulta", async () => {
    const reminder = {
      appointmentId: "apt_123",
      patientId: "pat_123",
      patientName: "João Silva",
      appointmentDate: new Date("2026-04-01"),
      appointmentTime: "10:00",
      reminderTime: "24h" as const,
    };

    const result = await sendWebPushAppointmentReminder(reminder);

    expect(result.success).toBe(true);
    expect(result.notificationId).toBeDefined();
  });

  it("deve enviar alerta de lead quente", async () => {
    const alert = {
      leadId: "lead_123",
      leadName: "Maria Santos",
      leadScore: 85,
      urgency: "high" as const,
      nextAction: "Enviar proposta",
    };

    const result = await sendWebPushHotLeadAlert(alert);

    expect(result.success).toBe(true);
    expect(result.notificationId).toBeDefined();
  });

  it("deve calcular horário ótimo para notificação", () => {
    const appointmentTime = calculateOptimalNotificationTime("America/Sao_Paulo", "appointment");
    const leadTime = calculateOptimalNotificationTime("America/Sao_Paulo", "lead");
    const messageTime = calculateOptimalNotificationTime("America/Sao_Paulo", "message");

    expect(appointmentTime).toBeInstanceOf(Date);
    expect(leadTime).toBeInstanceOf(Date);
    expect(messageTime).toBeInstanceOf(Date);
    expect(appointmentTime.getTime()).toBeGreaterThan(Date.now());
  });

  it("deve agendar batch de notificações", () => {
    const notifications = [
      { type: "appointment", data: { appointmentId: "apt_1" } },
      { type: "lead", data: { leadId: "lead_1" } },
      { type: "message", data: { messageId: "msg_1" } },
    ];

    const result = schedulePushNotificationBatch(notifications);

    expect(result.scheduled).toBe(3);
    expect(result.failed).toBe(0);
  });

  it("deve gerar estatísticas de notificações", () => {
    const notifications = [
      { type: "appointment", status: "sent" },
      { type: "appointment", status: "sent" },
      { type: "lead", status: "failed" },
      { type: "message", status: "sent" },
    ];

    const stats = generatePushNotificationStats(notifications);

    expect(stats.total).toBe(4);
    expect(stats.sent).toBe(3);
    expect(stats.failed).toBe(1);
    expect(stats.successRate).toBe(75);
  });
});

describe("Integração Completa: Outlook + Push", () => {
  it("deve funcionar fluxo completo de agendamento com notificação", async () => {
    // 1. Buscar slots
    const slots = await getAvailableSlotsFromOutlook(
      "therapist_123",
      new Date("2026-04-01"),
      new Date("2026-04-07")
    );

    expect(slots.length).toBeGreaterThan(0);

    // 2. Criar evento
    const event = await createOutlookEvent(
      "therapist_123",
      "João Silva",
      slots[0].date,
      slots[0].time
    );

    expect(event.success).toBe(true);

    // 3. Enviar notificação de confirmação
    const reminder = {
      appointmentId: event.eventId!,
      patientId: "pat_123",
      patientName: "João Silva",
      appointmentDate: slots[0].date,
      appointmentTime: slots[0].time,
      reminderTime: "24h" as const,
    };

    const notif = await sendWebPushAppointmentReminder(reminder);

    expect(notif.success).toBe(true);
  });

  it("deve detectar lead quente e enviar alerta", async () => {
    const alert = {
      leadId: "lead_hot",
      leadName: "Cliente Premium",
      leadScore: 92,
      urgency: "high" as const,
      nextAction: "Agendar consulta",
    };

    const result = await sendWebPushHotLeadAlert(alert);

    expect(result.success).toBe(true);
    expect(result.notificationId).toBeDefined();
  });
});
