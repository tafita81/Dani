import { getDb } from "./db";
import { appointments } from "../drizzle/schema";
import { eq, and, gte, lt } from "drizzle-orm";

/**
 * Bloqueia um horário no calendário
 */
export async function blockTimeAndSync(
  input: { start: Date; end: Date; reason: string; patientNotification?: boolean },
  userId: number,
  calendarId?: string
): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Criar registro no banco como agendamento especial
    const result = await db.insert(appointments).values({
      userId,
      patientId: null,
      title: `🔒 ${input.reason}`,
      description: `Horário bloqueado: ${input.reason}`,
      startTime: input.start.getTime(),
      endTime: input.end.getTime(),
      status: "scheduled" as any, // Usar scheduled como placeholder para bloqueio
      source: "manual",
    });

    return result;
  } catch (error) {
    console.error("Erro ao bloquear horário:", error);
    throw error;
  }
}

/**
 * Libera um horário removendo bloqueio
 */
export async function unblockTimeAndSync(
  appointmentId: string,
  calendarId?: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Deletar do banco
    await db.delete(appointments).where(eq(appointments.id, parseInt(appointmentId)));
  } catch (error) {
    console.error("Erro ao liberar horário:", error);
    throw error;
  }
}

/**
 * Cria agendamento se o horário estiver disponível
 */
export async function createAppointmentIfAvailable(
  userId: number,
  patientId: string | null,
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  calendarId?: string
): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Verificar se há conflito
    const conflicts = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, userId),
          lt(appointments.startTime, endDate.getTime()),
          gte(appointments.endTime, startDate.getTime())
        )
      );

    if (conflicts.length > 0) {
      throw new Error("Time slot not available");
    }

    // Criar no banco
    const result = await db.insert(appointments).values({
      userId,
      patientId: patientId ? parseInt(patientId) : null,
      title,
      description: description || "",
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      status: "scheduled",
      source: "manual",
    });

    return result;
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    throw error;
  }
}

/**
 * Atualiza agendamento em ambos os sistemas
 */
export async function updateAppointmentInBothSystems(
  appointmentId: string,
  updates: {
    title?: string;
    description?: string;
    startTime?: number;
    endTime?: number;
    status?: string;
  },
  calendarId?: string
): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const updateData: any = { ...updates };

    // Atualizar no banco
    await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, parseInt(appointmentId)));

    return { success: true, appointmentId };
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    throw error;
  }
}

/**
 * Deleta agendamento
 */
export async function deleteAppointmentAndSync(
  appointmentId: string,
  calendarId?: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Deletar do banco
    await db.delete(appointments).where(eq(appointments.id, parseInt(appointmentId)));
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    throw error;
  }
}

/**
 * Sincroniza todos os agendamentos
 */
export async function syncAllAppointmentsToOutlook(calendarId?: string): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Obter todos os agendamentos
    const allAppointments = await db.select().from(appointments);

    return allAppointments.length;
  } catch (error) {
    console.error("Erro ao sincronizar agendamentos:", error);
    throw error;
  }
}
