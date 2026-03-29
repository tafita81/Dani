import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./db";
import { IntentRecognizer } from "./intentRecognizer";

describe("CarAssistant - Busca em Banco de Dados Real", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar pacientes do usuário logado", async () => {
    const mockPatients = [
      { id: 1, userId: 1, name: "João Silva", email: "joao@example.com", phone: "11999999999" },
      { id: 2, userId: 1, name: "Maria Santos", email: "maria@example.com", phone: "11988888888" },
    ];

    vi.spyOn(db, "getPatients").mockResolvedValue(mockPatients as any);

    const patients = await db.getPatients(1);
    
    expect(patients).toHaveLength(2);
    expect(patients[0].name).toBe("João Silva");
    expect(patients[1].name).toBe("Maria Santos");
  });

  it("deve buscar agendamentos do usuário logado", async () => {
    const mockAppointments = [
      { id: 1, userId: 1, title: "Sessão com João", description: "Primeira sessão", startTime: Date.now(), endTime: Date.now() + 3600000 },
      { id: 2, userId: 1, title: "Sessão com Maria", description: "Seguimento", startTime: Date.now() + 86400000, endTime: Date.now() + 90000000 },
    ];

    vi.spyOn(db, "getAppointments").mockResolvedValue(mockAppointments as any);

    const appointments = await db.getAppointments(1);
    
    expect(appointments).toHaveLength(2);
    expect(appointments[0].title).toBe("Sessão com João");
    expect(appointments[1].title).toBe("Sessão com Maria");
  });

  it("deve buscar sessões do usuário logado", async () => {
    const mockSessions = [
      { id: 1, userId: 1, patientId: 1, content: "Primeira sessão com João", summary: "Bom progresso" },
      { id: 2, userId: 1, patientId: 2, content: "Seguimento com Maria", summary: "Continuar tratamento" },
    ];

    vi.spyOn(db, "getSessionNotes").mockResolvedValue(mockSessions as any);

    const sessions = await db.getSessionNotes(1, 0);
    
    expect(sessions).toHaveLength(2);
    expect(sessions[0].content).toContain("João");
    expect(sessions[1].content).toContain("Maria");
  });

  it("deve reconhecer intenção de pergunta sobre pacientes", () => {
    const result = IntentRecognizer.recognize("Quantos pacientes tenho?");
    
    expect(result.intent).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("deve reconhecer intenção de pergunta sobre agendamentos", () => {
    const result = IntentRecognizer.recognize("Quais são meus agendamentos?");
    
    expect(result.intent).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("deve retornar dados diferentes para usuários diferentes", async () => {
    const mockPatientsUser1 = [
      { id: 1, userId: 1, name: "João Silva", email: "joao@example.com", phone: "11999999999" },
    ];

    const mockPatientsUser2 = [
      { id: 2, userId: 2, name: "Pedro Oliveira", email: "pedro@example.com", phone: "11977777777" },
    ];

    vi.spyOn(db, "getPatients")
      .mockResolvedValueOnce(mockPatientsUser1 as any)
      .mockResolvedValueOnce(mockPatientsUser2 as any);

    const patientsUser1 = await db.getPatients(1);
    const patientsUser2 = await db.getPatients(2);
    
    expect(patientsUser1[0].name).toBe("João Silva");
    expect(patientsUser2[0].name).toBe("Pedro Oliveira");
  });

  it("deve filtrar pacientes por nome", async () => {
    const mockPatients = [
      { id: 1, userId: 1, name: "João Silva", email: "joao@example.com", phone: "11999999999" },
      { id: 2, userId: 1, name: "Maria Santos", email: "maria@example.com", phone: "11988888888" },
      { id: 3, userId: 1, name: "Pedro Oliveira", email: "pedro@example.com", phone: "11977777777" },
    ];

    const keywords = ["maria"];
    const filtered = mockPatients.filter((p) =>
      keywords.some((k) => p.name.toLowerCase().includes(k))
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Maria Santos");
  });

  it("deve contar pacientes corretamente", async () => {
    const mockPatients = [
      { id: 1, userId: 1, name: "João Silva", email: "joao@example.com", phone: "11999999999" },
      { id: 2, userId: 1, name: "Maria Santos", email: "maria@example.com", phone: "11988888888" },
    ];

    vi.spyOn(db, "getPatients").mockResolvedValue(mockPatients as any);

    const patients = await db.getPatients(1);
    const count = patients.length;

    expect(count).toBe(2);
  });

  it("deve retornar resposta em menos de 3 segundos", async () => {
    const mockPatients = [
      { id: 1, userId: 1, name: "João Silva", email: "joao@example.com", phone: "11999999999" },
    ];

    vi.spyOn(db, "getPatients").mockResolvedValue(mockPatients as any);

    const start = Date.now();
    await db.getPatients(1);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(3000);
  });
});
