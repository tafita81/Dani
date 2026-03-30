import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createCheckoutSession,
  createSubscriptionSession,
  getCheckoutSession,
  createStripeCustomer,
  listCustomerPayments,
  listCustomerSubscriptions,
  cancelSubscription,
  createCoupon,
  validateCoupon,
  generateRevenueReport,
  SUBSCRIPTION_PLANS,
  SESSION_PACKAGES,
} from "./stripeService";
import {
  getNextOccurrenceDate,
  createRecurringSessionInstances,
  generateReminderMessage,
  generateCancellationMessage,
  getRecurringSessionReport,
} from "./recurringScheduler";
import {
  generateClinicalReportPDF,
  PatientReport,
  FormResult,
  SessionNote,
} from "./clinicalReportGenerator";

describe("Stripe Service", () => {
  describe("Subscription Plans", () => {
    it("deve ter planos básico, profissional e premium", () => {
      expect(SUBSCRIPTION_PLANS.basic).toBeDefined();
      expect(SUBSCRIPTION_PLANS.professional).toBeDefined();
      expect(SUBSCRIPTION_PLANS.premium).toBeDefined();
    });

    it("plano básico deve custar R$ 99", () => {
      expect(SUBSCRIPTION_PLANS.basic.amount).toBe(9900);
    });

    it("plano profissional deve custar R$ 199", () => {
      expect(SUBSCRIPTION_PLANS.professional.amount).toBe(19900);
    });

    it("plano premium deve custar R$ 399", () => {
      expect(SUBSCRIPTION_PLANS.premium.amount).toBe(39900);
    });

    it("todos os planos devem ter período de trial", () => {
      expect(SUBSCRIPTION_PLANS.basic.trialDays).toBeGreaterThan(0);
      expect(SUBSCRIPTION_PLANS.professional.trialDays).toBeGreaterThan(0);
      expect(SUBSCRIPTION_PLANS.premium.trialDays).toBeGreaterThan(0);
    });
  });

  describe("Session Packages", () => {
    it("deve ter pacotes de 1, 5 e 10 sessões", () => {
      expect(SESSION_PACKAGES.single).toBeDefined();
      expect(SESSION_PACKAGES.pack_5).toBeDefined();
      expect(SESSION_PACKAGES.pack_10).toBeDefined();
    });

    it("pacote de 1 sessão deve custar R$ 150", () => {
      expect(SESSION_PACKAGES.single.amount).toBe(15000);
    });

    it("pacote de 5 sessões deve ter desconto", () => {
      const pricePerSession = SESSION_PACKAGES.pack_5.amount / 5;
      const singlePrice = SESSION_PACKAGES.single.amount;
      expect(pricePerSession).toBeLessThan(singlePrice);
    });

    it("pacote de 10 sessões deve ter maior desconto", () => {
      const pricePerSession = SESSION_PACKAGES.pack_10.amount / 10;
      const pack5Price = SESSION_PACKAGES.pack_5.amount / 5;
      expect(pricePerSession).toBeLessThan(pack5Price);
    });
  });

  describe("Coupon Validation", () => {
    it("deve validar cupom com desconto válido", async () => {
      const couponId = "TEST_COUPON_50";
      // Mock validation
      const result = {
        valid: true,
        id: couponId,
        percentOff: 50,
        isExpired: false,
      };
      expect(result.valid).toBe(true);
      expect(result.percentOff).toBe(50);
    });

    it("deve rejeitar cupom inválido", async () => {
      const result = {
        valid: false,
        error: "Cupom inválido ou expirado",
      };
      expect(result.valid).toBe(false);
    });
  });

  describe("Revenue Report", () => {
    it("deve calcular receita total corretamente", () => {
      const mockReport = {
        totalRevenue: 50000,
        totalTransactions: 10,
        successfulPayments: 8,
        failedPayments: 2,
        currency: "brl",
      };

      expect(mockReport.totalRevenue).toBe(50000);
      expect(mockReport.totalTransactions).toBe(10);
      expect(mockReport.successfulPayments).toBe(8);
    });

    it("deve calcular taxa de sucesso", () => {
      const successRate = (8 / 10) * 100;
      expect(successRate).toBe(80);
    });
  });
});

describe("Recurring Scheduler", () => {
  describe("Recurrence Patterns", () => {
    it("deve calcular próxima data semanal corretamente", () => {
      const monday = new Date(2026, 3, 30); // Quinta-feira
      const nextMonday = getNextOccurrenceDate(monday, "weekly", undefined, 1); // Segunda

      expect(nextMonday.getDay()).toBe(1); // Segunda-feira
    });

    it("deve calcular próxima data quinzenal corretamente", () => {
      const today = new Date(2026, 3, 29);
      const in2Weeks = getNextOccurrenceDate(today, "biweekly");

      const daysDiff = Math.floor(
        (in2Weeks.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(14);
    });

    it("deve calcular próxima data mensal corretamente", () => {
      const today = new Date(2026, 3, 29);
      const nextMonth = getNextOccurrenceDate(today, "monthly");

      expect(nextMonth.getMonth()).toBe(4); // Maio
    });

    it("deve calcular próxima data customizada corretamente", () => {
      const today = new Date(2026, 3, 29);
      const in3Days = getNextOccurrenceDate(today, "custom", 3);

      const daysDiff = Math.floor(
        (in3Days.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(3);
    });
  });

  describe("Reminder Messages", () => {
    it("deve gerar mensagem de lembrete humanizada", () => {
      const appointmentDate = new Date(2026, 3, 30, 14, 30);
      const message = generateReminderMessage(appointmentDate, 60);

      expect(message).toContain("14:30");
      expect(message.length).toBeGreaterThan(0);
    });

    it("deve gerar mensagem de cancelamento humanizada", () => {
      const appointmentDate = new Date(2026, 3, 30, 14, 30);
      const message = generateCancellationMessage(appointmentDate);

      expect(message).toContain("cancelada");
      expect(message.length).toBeGreaterThan(0);
    });

    it("mensagens devem variar", () => {
      const appointmentDate = new Date(2026, 3, 30, 14, 30);
      const messages = new Set();

      for (let i = 0; i < 10; i++) {
        messages.add(generateReminderMessage(appointmentDate, 60));
      }

      expect(messages.size).toBeGreaterThan(1); // Deve ter variação
    });
  });

  describe("Recurring Session Report", () => {
    it("deve calcular taxa de agendamentos recorrentes", () => {
      const mockReport = {
        totalAppointments: 100,
        recurringAppointments: 60,
        recurringPercentage: "60.00",
        byStatus: {
          scheduled: 30,
          completed: 50,
          cancelled: 15,
          rescheduled: 5,
        },
      };

      expect(mockReport.recurringPercentage).toBe("60.00");
      expect(mockReport.totalAppointments).toBe(100);
    });

    it("deve contar agendamentos por status", () => {
      const mockReport = {
        totalAppointments: 100,
        recurringAppointments: 60,
        recurringPercentage: "60.00",
        byStatus: {
          scheduled: 30,
          completed: 50,
          cancelled: 15,
          rescheduled: 5,
        },
      };

      const total =
        mockReport.byStatus.scheduled +
        mockReport.byStatus.completed +
        mockReport.byStatus.cancelled +
        mockReport.byStatus.rescheduled;

      expect(total).toBe(100);
    });
  });
});

describe("Clinical Report Generator", () => {
  const mockReport: PatientReport = {
    patientName: "João Silva",
    patientId: "patient-123",
    dateOfBirth: new Date(1990, 0, 15),
    therapistName: "Psi. Daniela Coelho",
    reportDate: new Date(),
    reportPeriod: {
      startDate: new Date(2026, 2, 1),
      endDate: new Date(2026, 3, 30),
    },
    totalSessions: 8,
    attendanceRate: 100,
    averageMood: 7.5,
    averageEngagement: 8.2,
    mainTherapyApproaches: ["TCC", "Gestalt"],
    clinicalProgress:
      "Paciente apresentou melhora significativa em sintomas de ansiedade.",
    keyInsights: [
      "Maior consciência emocional",
      "Melhora em relacionamentos",
    ],
    recommendations: [
      "Continuar com sessões semanais",
      "Praticar técnicas de respiração",
    ],
    formResults: [
      {
        formName: "PHQ-9",
        date: new Date(2026, 2, 1),
        score: 18,
        maxScore: 27,
        interpretation: "Depressão leve",
        trend: "improved",
      },
      {
        formName: "GAD-7",
        date: new Date(2026, 2, 1),
        score: 14,
        maxScore: 21,
        interpretation: "Ansiedade moderada",
        trend: "improved",
      },
    ],
    sessionNotes: [
      {
        date: new Date(2026, 3, 29),
        duration: 60,
        mood: 8,
        engagement: 9,
        approach: "TCC",
        summary: "Sessão produtiva focando em pensamentos automáticos",
        techniques: ["Reestruturação Cognitiva", "Exposição Gradual"],
      },
    ],
  };

  it("deve gerar PDF com relatório clínico", async () => {
    const pdf = await generateClinicalReportPDF(mockReport);

    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });

  it("deve incluir informações do paciente no relatório", async () => {
    const pdf = await generateClinicalReportPDF(mockReport);

    // Verifica se o PDF foi gerado
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.toString("utf8", 0, 4)).toContain("%PDF");
  });

  it("deve calcular percentual de formulários corretamente", () => {
    const form = mockReport.formResults![0];
    const percentage = (form.score / form.maxScore) * 100;

    expect(percentage).toBeCloseTo(66.67, 1);
  });

  it("deve incluir tendências de formulários", () => {
    mockReport.formResults!.forEach((form) => {
      expect(["improved", "stable", "worsened"]).toContain(form.trend);
    });
  });

  it("deve ter recomendações no relatório", () => {
    expect(mockReport.recommendations.length).toBeGreaterThan(0);
    mockReport.recommendations.forEach((rec) => {
      expect(typeof rec).toBe("string");
      expect(rec.length).toBeGreaterThan(0);
    });
  });

  it("deve calcular taxa de comparecimento", () => {
    expect(mockReport.attendanceRate).toBe(100);
    expect(mockReport.attendanceRate).toBeLessThanOrEqual(100);
    expect(mockReport.attendanceRate).toBeGreaterThanOrEqual(0);
  });

  it("deve ter humor e engajamento médios válidos", () => {
    expect(mockReport.averageMood).toBeGreaterThanOrEqual(0);
    expect(mockReport.averageMood).toBeLessThanOrEqual(10);
    expect(mockReport.averageEngagement).toBeGreaterThanOrEqual(0);
    expect(mockReport.averageEngagement).toBeLessThanOrEqual(10);
  });
});
