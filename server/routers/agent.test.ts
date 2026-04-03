import { describe, it, expect } from "vitest";
import { agentRouter } from "./agent";

describe("AI Agent Router", () => {
  it("should have processQuery procedure", () => {
    const procedure = agentRouter._def.procedures.processQuery;
    expect(procedure).toBeDefined();
  });

  it("should have getStats procedure", () => {
    const procedure = agentRouter._def.procedures.getStats;
    expect(procedure).toBeDefined();
  });

  it("should have getPatientInsights procedure", () => {
    const procedure = agentRouter._def.procedures.getPatientInsights;
    expect(procedure).toBeDefined();
  });
});
