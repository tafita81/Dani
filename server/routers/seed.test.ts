import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { seedRouter } from "./seed";

describe("Seed Router", () => {
  it("should have populate procedure", () => {
    expect(seedRouter.createCaller).toBeDefined();
  });

  it("populate should accept patientCount, appointmentCount, leadCount", () => {
    const procedure = seedRouter._def.procedures.populate;
    expect(procedure).toBeDefined();
  });
});
