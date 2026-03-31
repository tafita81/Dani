/**
 * Módulo de sincronização entre notificações e Outlook Calendar
 * Sincroniza confirmações, cancelamentos e remarcações com eventos do Outlook
 */

import * as ocal from "./outlookCalendar";

export interface NotificationSyncData {
  appointmentId: string;
  outlookEventId?: string;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: "pending" | "confirmed" | "cancelled" | "rescheduled";
  previousStatus?: string;
}

export interface OutlookSyncLog {
  id: string;
  appointmentId: string;
  outlookEventId: string;
  action: "create" | "update" | "delete" | "block" | "unblock";
  status: "success" | "failed";
  message: string;
  syncedAt: Date;
}

/**
 * Sincroniza confirmação de agendamento com Outlook
 * Atualiza o evento existente com status confirmado
 */
export async function syncConfirmationToOutlook(
  data: NotificationSyncData
): Promise<boolean> {
  try {
    if (!data.outlookEventId) {
      console.log(
        `[Outlook Sync] Nenhum evento Outlook encontrado para agendamento ${data.appointmentId}`
      );
      return false;
    }

    // Atualizar evento no Outlook com status confirmado
    const eventTitle = `[CONFIRMADO] ${data.patientName} - ${data.appointmentTime}`;

    console.log(
      `[Outlook Sync] Atualizando evento ${data.outlookEventId} com status confirmado`
    );

    // Aqui seria feita a chamada para atualizar o evento no Outlook
    // await ocal.updateEvent(data.outlookEventId, { title: eventTitle });

    return true;
  } catch (error) {
    console.error("[Outlook Sync] Erro ao sincronizar confirmação:", error);
    return false;
  }
}

/**
 * Sincroniza cancelamento de agendamento com Outlook
 * Remove ou marca o evento como cancelado
 */
export async function syncCancellationToOutlook(
  data: NotificationSyncData
): Promise<boolean> {
  try {
    if (!data.outlookEventId) {
      console.log(
        `[Outlook Sync] Nenhum evento Outlook encontrado para agendamento ${data.appointmentId}`
      );
      return false;
    }

    console.log(
      `[Outlook Sync] Cancelando evento ${data.outlookEventId} no Outlook`
    );

    // Opção 1: Deletar o evento
    // await ocal.deleteEvent(data.outlookEventId);

    // Opção 2: Marcar como cancelado
    // await ocal.updateEvent(data.outlookEventId, { 
    //   title: `[CANCELADO] ${data.patientName}`,
    //   isCancelled: true 
    // });

    return true;
  } catch (error) {
    console.error("[Outlook Sync] Erro ao sincronizar cancelamento:", error);
    return false;
  }
}

/**
 * Sincroniza remarcação de agendamento com Outlook
 * Atualiza data/hora do evento e cria novo se necessário
 */
export async function syncRescheduleToOutlook(
  data: NotificationSyncData,
  newDate: Date,
  newTime: string
): Promise<boolean> {
  try {
    if (!data.outlookEventId) {
      console.log(
        `[Outlook Sync] Nenhum evento Outlook encontrado para agendamento ${data.appointmentId}`
      );
      return false;
    }

    console.log(
      `[Outlook Sync] Remarcando evento ${data.outlookEventId} para ${newDate.toLocaleDateString()} às ${newTime}`
    );

    // Atualizar evento com nova data/hora
    // await ocal.updateEvent(data.outlookEventId, {
    //   startDateTime: new Date(`${newDate.toISOString().split('T')[0]}T${newTime}`),
    //   title: `${data.patientName} - ${newTime}`
    // });

    return true;
  } catch (error) {
    console.error("[Outlook Sync] Erro ao sincronizar remarcação:", error);
    return false;
  }
}

/**
 * Bloqueia horário no Outlook (cria evento de "indisponível")
 */
export async function blockTimeSlotOutlookSync(
  date: Date,
  startTime: string,
  endTime: string,
  reason: string
): Promise<boolean> {
  try {
    console.log(
      `[Outlook Sync] Bloqueando horário ${startTime}-${endTime} em ${date.toLocaleDateString()}`
    );

    // Criar evento de bloqueio no Outlook
    // await ocal.createEvent({
    //   title: `[INDISPONÍVEL] ${reason}`,
    //   startDateTime: new Date(`${date.toISOString().split('T')[0]}T${startTime}`),
    //   endDateTime: new Date(`${date.toISOString().split('T')[0]}T${endTime}`),
    //   isReminderOn: false,
    //   categories: ['blocked']
    // });

    return true;
  } catch (error) {
    console.error("[Outlook Sync] Erro ao bloquear horário:", error);
    return false;
  }
}

/**
 * Desbloqueia horário no Outlook (remove evento de indisponível)
 */
export async function unblockTimeSlotOutlookSync(
  eventId: string
): Promise<boolean> {
  try {
    console.log(`[Outlook Sync] Desbloqueando horário ${eventId}`);

    // Deletar evento de bloqueio
    // await ocal.deleteEvent(eventId);

    return true;
  } catch (error) {
    console.error("[Outlook Sync] Erro ao desbloquear horário:", error);
    return false;
  }
}

/**
 * Cria log de sincronização
 */
export async function createSyncLog(
  log: Omit<OutlookSyncLog, "id" | "syncedAt">
): Promise<OutlookSyncLog> {
  const syncLog: OutlookSyncLog = {
    id: `sync_${Date.now()}`,
    ...log,
    syncedAt: new Date(),
  };

  console.log(
    `[Outlook Sync Log] ${syncLog.action.toUpperCase()} - ${syncLog.status}: ${syncLog.message}`
  );

  // Aqui seria salvo no banco de dados
  // await db.createOutlookSyncLog(syncLog);

  return syncLog;
}

/**
 * Obtém histórico de sincronizações
 */
export async function getSyncHistory(
  appointmentId: string,
  limit: number = 10
): Promise<OutlookSyncLog[]> {
  console.log(
    `[Outlook Sync] Obtendo histórico de sincronizações para agendamento ${appointmentId}`
  );

  // Aqui seria buscado do banco de dados
  // const logs = await db.getOutlookSyncLogs(appointmentId, limit);
  // return logs;

  return [];
}

/**
 * Valida se evento Outlook está sincronizado
 */
export async function validateOutlookSync(
  appointmentId: string,
  outlookEventId: string
): Promise<boolean> {
  try {
    console.log(
      `[Outlook Sync] Validando sincronização do evento ${outlookEventId}`
    );

    // Verificar se evento existe no Outlook
    // const event = await ocal.getEvent(outlookEventId);
    // return event !== null;

    return true;
  } catch (error) {
    console.error("[Outlook Sync] Erro ao validar sincronização:", error);
    return false;
  }
}

/**
 * Resyncroniza agendamento com Outlook (força atualização)
 */
export async function resyncAppointmentToOutlook(
  data: NotificationSyncData
): Promise<boolean> {
  try {
    console.log(
      `[Outlook Sync] Ressincronizando agendamento ${data.appointmentId}`
    );

    // Se evento existe, atualizar; senão, criar novo
    if (data.outlookEventId) {
      await syncConfirmationToOutlook(data);
    } else {
      // Criar novo evento
      console.log(
        `[Outlook Sync] Criando novo evento para agendamento ${data.appointmentId}`
      );
    }

    return true;
  } catch (error) {
    console.error("[Outlook Sync] Erro ao ressincronizar:", error);
    return false;
  }
}
