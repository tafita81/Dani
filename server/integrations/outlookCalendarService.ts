/**
 * Serviço de Integração com Outlook Calendar
 * Sincroniza bloqueios de agenda com Outlook
 */

interface OutlookEvent {
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  categories: string[];
  isReminderOn: boolean;
  reminderMinutesBeforeStart: number;
}

interface ScheduleBlock {
  blockDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  reason?: string;
}

/**
 * Converter bloqueio de agenda para evento do Outlook
 */
export function convertBlockToOutlookEvent(block: ScheduleBlock): OutlookEvent {
  // Combinar data e hora
  const startDateTime = `${block.blockDate}T${block.startTime}:00`;
  const endDateTime = `${block.blockDate}T${block.endTime}:00`;

  return {
    subject: `Bloqueado: ${block.reason || "Indisponível"}`,
    start: {
      dateTime: startDateTime,
      timeZone: "America/Sao_Paulo", // Timezone do Brasil
    },
    end: {
      dateTime: endDateTime,
      timeZone: "America/Sao_Paulo",
    },
    categories: ["Bloqueado", "Assistente-Carro"],
    isReminderOn: false,
    reminderMinutesBeforeStart: 0,
  };
}

/**
 * Criar evento no Outlook
 * Requer token de acesso válido
 */
export async function createOutlookEvent(
  accessToken: string,
  block: ScheduleBlock
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const event = convertBlockToOutlookEvent(block);

    const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Erro ao criar evento: ${error.error?.message || response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      eventId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao criar evento no Outlook: ${(error as Error).message}`,
    };
  }
}

/**
 * Atualizar evento no Outlook
 */
export async function updateOutlookEvent(
  accessToken: string,
  eventId: string,
  block: ScheduleBlock
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = convertBlockToOutlookEvent(block);

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Erro ao atualizar evento: ${error.error?.message || response.statusText}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao atualizar evento no Outlook: ${(error as Error).message}`,
    };
  }
}

/**
 * Deletar evento no Outlook
 */
export async function deleteOutlookEvent(
  accessToken: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      return {
        success: false,
        error: `Erro ao deletar evento: ${error.error?.message || response.statusText}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao deletar evento no Outlook: ${(error as Error).message}`,
    };
  }
}

/**
 * Obter eventos do Outlook para um dia específico
 */
export async function getOutlookEventsForDate(
  accessToken: string,
  date: string // YYYY-MM-DD
): Promise<{ success: boolean; events?: any[]; error?: string }> {
  try {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startOfDay}&endDateTime=${endOfDay}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Erro ao obter eventos: ${error.error?.message || response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      events: data.value || [],
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao obter eventos do Outlook: ${(error as Error).message}`,
    };
  }
}

/**
 * Renovar token de acesso usando refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ success: boolean; accessToken?: string; expiresAt?: Date; error?: string }> {
  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: "Calendars.ReadWrite offline_access",
    });

    const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Erro ao renovar token: ${error.error_description || response.statusText}`,
      };
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    return {
      success: true,
      accessToken: data.access_token,
      expiresAt,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao renovar token: ${(error as Error).message}`,
    };
  }
}

/**
 * Verificar se token está expirado
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}

/**
 * Formatar horário para ISO string
 */
export function formatTimeToISO(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM
  return `${date}T${time}:00`;
}
