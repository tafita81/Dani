import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "../core_logic/db";
import { universalQuestionFixed } from "../ai/universalQuestionFixed";

// Mock do contexto protectedProcedure
const mockContext = {
  user: {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
  },
  req: {} as any,
  res: {} as any,
};

describe("universalQuestionFixed - Busca em Banco de Dados Real", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar resposta com dados reais de pacientes", async () => {
    // Simular dados do banco
    const mockPatients = [
      { id: 1, userId: 1, name: "João Silva", email: "joao@example.com", phone: "11999999999" },
      { id: 2, userId: 1, name: "Maria Santos", email: "maria@example.com", phone: "11988888888" },
    ];

    const mockAppointments = [
      { id: 1, userId: 1, title: "Sessão com João", description: "Primeira sessão", startTime: Date.now(), endTime: Date.now() + 3600000 },
      { id: 2, userId: 1, title: "Sessão com Maria", description: "Seguimento", startTime: Date.now() + 86400000, endTime: Date.now() + 90000000 },
    ];

    // Mock das funções de banco
    vi.spyOn(db, "getPatients").mockResolvedValue(mockPatients as any);
    vi.spyOn(db, "getAppointments").mockResolvedValue(mockAppointments as any);
    vi.spyOn(db, "getSessionNotes").mockResolvedValue([]);

    // Testar pergunta sobre quantos pacientes - usar _def para acessar a função interna
    const result = await (universalQuestionFixed as any)._def.query({
      ctx: mockContext,
      input: { question: "Quantos pacientes tenho?" },
    });

    expect(result.success).toBe(true);
    expect(result.answer).toContain("2 pacientes");
    expect(result.dataSource).toBe("database");
    expect(result.responseTime).toBeLessThan(3000); // Menos de 3 segundos
  });

  it("deve retornar resposta com dados reais de agendamentos", async () => {
    const mockPatients = [];
    const mockAppointments = [
      { id: 1, userId: 1, title: "Sessão com João", description: "Primeira sessão", startTime: Date.now(), endTime: Date.now() + 3600000 },
      { id: 2, userId: 1, title: "Sessão com Maria", description: "Seguimento", startTime: Date.now() + 86400000, endTime: Date.now() + 90000000 },
    ];

    vi.spyOn(db, "getPatients").mockResolvedValue(mockPatients as any);
    vi.spyOn(db, "getAppointments").mockResolvedValue(mockAppointments as any);
    vi.spyOn(db, "getSessionNotes").mockResolvedValue([]);

    const result = await (universalQuestionFixed as any)._def.query({
      ctx: mockContext,
      input: { question: "Quantos agendamentos tenho?" },
    });

    expect(result.success).toBe(true);
    expect(result.answer).toContain("2 agendamentos");
    expect(result.dataSource).toBe("database");
  });

  it("deve retornar nomes de pacientes quando perguntado", async () => {
    const mockPatients = [
      { id: 1, userId: 1, name: "João Silva", email: "joao@example.com", phone: "11999999999" },
      { id: 2, userId: 1, name: "Maria Santos", email: "maria@example.com", phone: "11988888888" },
      { id: 3, userId: 1, name: "Pedro Oliveira", email: "pedro@example.com", phone: "11977777777" },
    ];

    vi.spyOn(db, "getPatients").mockResolvedValue(mockPatients as any);
    vi.spyOn(db, "getAppointments").mockResolvedValue([]);
    vi.spyOn(db, "getSessionNotes").mockResolvedValue([]);

    const result = await (universalQuestionFixed as any)._def.query({
      ctx: mockContext,
      input: { question: "Quais são meus pacientes?" },
    });

    expect(result.success).toBe(true);
    expect(result.answer).toContain("João Silva");
    expect(result.answer).toContain("Maria Santos");
    expect(result.answer).toContain("Pedro Oliveira");
  });

  it("deve usar userId do usuário logado para buscar dados", async () => {
    const getPatientsSpy = vi.spyOn(db, "getPatients");
    getPatientsSpy.mockResolvedValue([]);

    vi.spyOn(db, "getAppointments").mockResolvedValue([]);
    vi.spyOn(db, "getSessionNotes").mockResolvedValue([]);

    await (universalQuestionFixed as any)._def.query({
      ctx: mockContext,
      input: { question: "Quantos pacientes?" },
    });

    // Verificar que getPatients foi chamado com o userId correto
    expect(getPatientsSpy).toHaveBeenCalledWith(1); // userId = 1
  });

  it("deve retornar resposta em menos de 3 segundos", async () => {
    vi.spyOn(db, "getPatients").mockResolvedValue([]);
    vi.spyOn(db, "getAppointments").mockResolvedValue([]);
    vi.spyOn(db, "getSessionNotes").mockResolvedValue([]);

    const start = Date.now();
    const result = await (universalQuestionFixed as any)._def.query({
      ctx: mockContext,
      input: { question: "Teste de performance" },
    });
    const elapsed = Date.now() - start;

    expect(result.responseTime).toBeLessThan(3000);
    expect(elapsed).toBeLessThan(3000);
  });

  it("deve buscar dados do usuário correto com userId diferente", async () => {
    const getPatientsSpy = vi.spyOn(db, "getPatients");
    getPatientsSpy.mockResolvedValue([]);

    vi.spyOn(db, "getAppointments").mockResolvedValue([]);
    vi.spyOn(db, "getSessionNotes").mockResolvedValue([]);

    const customContext = {
      ...mockContext,
      user: { ...mockContext.user, id: 42 },
    };

    await (universalQuestionFixed as any)._def.query({
      ctx: customContext,
      input: { question: "Quantos pacientes?" },
    });

    // Verificar que getPatients foi chamado com userId = 42
    expect(getPatientsSpy).toHaveBeenCalledWith(42);
  });
});
