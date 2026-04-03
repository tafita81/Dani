import { describe, it, expect } from "vitest";
import { carAssistantRouter } from "./carAssistant";

describe("Car Assistant Router", () => {
  it("should have processVoiceCommand procedure", () => {
    const procedure = carAssistantRouter._def.procedures.processVoiceCommand;
    expect(procedure).toBeDefined();
  });

  it("should have getQuickSuggestions procedure", () => {
    const procedure = carAssistantRouter._def.procedures.getQuickSuggestions;
    expect(procedure).toBeDefined();
  });

  it("should have getTurboSuggestions procedure", () => {
    const procedure = carAssistantRouter._def.procedures.getTurboSuggestions;
    expect(procedure).toBeDefined();
  });
});
