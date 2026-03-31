import { describe, it, expect } from "vitest";
import { appRouter } from "../core_logic/routers";

describe("Assistente Clínico - Core System", () => {
  it("should have app router defined", () => {
    expect(appRouter).toBeDefined();
  });

  it("should have system router", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures.includes("system")).toBe(true);
  });

  it("should have auth router", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures.includes("auth")).toBe(true);
  });

  it("should have patients router", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures.includes("patients")).toBe(true);
  });

  it("should have clinical router", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures.includes("clinical")).toBe(true);
  });

  it("should have leads router for CRM", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures.includes("leads")).toBe(true);
  });

  it("should have assistant router for IA", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures.includes("assistant")).toBe(true);
  });
});
