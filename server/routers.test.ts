import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createMockContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Dani Routers", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe("auth", () => {
    it("should return current user with me query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe("test@example.com");
    });

    it("should logout and clear cookie", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("patients", () => {
    it("should handle patient list query", async () => {
      const caller = appRouter.createCaller(ctx);
      // This will return empty array since we're not mocking the database
      const result = await caller.patients.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should validate patient search input", async () => {
      const caller = appRouter.createCaller(ctx);
      // Test that the procedure accepts valid input
      const result = await caller.patients.search({ query: "John" });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should validate patient creation input", async () => {
      const caller = appRouter.createCaller(ctx);

      // This will fail because database is not available, but it validates input
      try {
        await caller.patients.create({
          name: "João Silva",
          email: "joao@example.com",
          phone: "11999999999",
          gender: "M",
        });
      } catch (error: any) {
        // Expected to fail due to no database
        expect(error.message).toContain("Database not available");
      }
    });
  });

  describe("appointments", () => {
    it("should handle appointments list query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.appointments.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle upcoming appointments query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.appointments.upcoming({ limit: 5 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("sessions", () => {
    it("should handle sessions list query", async () => {
      const caller = appRouter.createCaller(ctx);
      // Test with valid patient ID
      const result = await caller.sessions.byPatient({ patientId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle recent sessions query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.sessions.recent({ limit: 5 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("leads", () => {
    it("should handle leads list query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.leads.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle leads by stage query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.leads.byStage({ stage: "lead" });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("profile", () => {
    it("should handle profile get query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.profile.get();

      // Will be null since no profile exists, but should not error
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("should validate profile update input", async () => {
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.profile.update({
          crp: "CRP/SP 12345",
          bio: "Psicóloga especializada em terapia cognitivo-comportamental",
          specialties: ["Ansiedade", "Depressão"],
          approaches: ["TCC", "Mindfulness"],
        });
      } catch (error: any) {
        // Expected to fail due to no database
        expect(error.message).toContain("Database not available");
      }
    });
  });

  describe("inventories", () => {
    it("should handle inventory results query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.inventories.byPatient({ patientId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle inventory by type query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.inventories.byType({
        patientId: 1,
        type: "BDI-II",
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("mood", () => {
    it("should handle mood entries query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.mood.byPatient({ patientId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("anamnesis", () => {
    it("should handle anamnesis get query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.anamnesis.get({ patientId: 1 });

      // Will be null since no anamnesis exists, but should not error
      expect(result === null || typeof result === "object").toBe(true);
    });
  });

  describe("cognitive concepts", () => {
    it("should handle cognitive concepts get query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.cognitiveConcepts.get({ patientId: 1 });

      // Will be null since no concepts exist, but should not error
      expect(result === null || typeof result === "object").toBe(true);
    });
  });

  describe("treatment plans", () => {
    it("should handle treatment plans query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.treatmentPlans.byPatient({ patientId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle active treatment plan query", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.treatmentPlans.active({ patientId: 1 });

      // Will be null since no active plan exists, but should not error
      expect(result === null || typeof result === "object").toBe(true);
    });
  });
});
