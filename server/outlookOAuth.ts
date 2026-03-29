/**
 * Sistema de Integração Outlook OAuth2
 * Sincronização bidirecional de calendários com detecção de conflitos
 */

export interface OutlookOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId: string;
}

export interface OutlookAccessToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userId: string;
}

export interface OutlookCalendarEvent {
  id: string;
  subject: string;
  start: Date;
  end: Date;
  organizer: string;
  attendees: string[];
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
  categories: string[];
}

export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflictingEvents: OutlookCalendarEvent[];
  suggestedAlternativeSlots: Date[];
  severity: "low" | "medium" | "high";
}

/**
 * Gera URL de autorização OAuth2
 */
export function generateOutlookAuthUrl(config: OutlookOAuthConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "Calendars.ReadWrite offline_access",
    response_mode: "query",
    prompt: "login",
  });

  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Troca código de autorização por token de acesso
 */
export async function exchangeCodeForToken(
  config: OutlookOAuthConfig,
  authCode: string
): Promise<OutlookAccessToken | null> {
  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: authCode,
          redirect_uri: config.redirectUri,
          grant_type: "authorization_code",
          scope: "Calendars.ReadWrite offline_access",
        }).toString(),
      }
    );

    if (!response.ok) {
      console.error("Erro ao trocar código por token:", response.statusText);
      return null;
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      userId: `outlook_user_${Date.now()}`,
    };
  } catch (error) {
    console.error("Erro ao trocar código por token:", error);
    return null;
  }
}

/**
 * Busca eventos do calendário Outlook
 */
export async function fetchOutlookCalendarEvents(
  accessToken: string,
  startDate: Date,
  endDate: Date
): Promise<OutlookCalendarEvent[]> {
  try {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startISO}&endDateTime=${endISO}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Erro ao buscar eventos:", response.statusText);
      return [];
    }

    const data = (await response.json()) as {
      value: Array<{
        id: string;
        subject: string;
        start: { dateTime: string };
        end: { dateTime: string };
        organizer: { emailAddress: { address: string } };
        attendees: Array<{ emailAddress: { address: string } }>;
        isOnlineMeeting: boolean;
        onlineMeetingUrl?: string;
        categories: string[];
      }>;
    };

    return data.value.map((event) => ({
      id: event.id,
      subject: event.subject,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      organizer: event.organizer.emailAddress.address,
      attendees: event.attendees.map((a) => a.emailAddress.address),
      isOnlineMeeting: event.isOnlineMeeting,
      onlineMeetingUrl: event.onlineMeetingUrl,
      categories: event.categories,
    }));
  } catch (error) {
    console.error("Erro ao buscar eventos do Outlook:", error);
    return [];
  }
}

/**
 * Cria evento no calendário Outlook
 */
export async function createOutlookCalendarEvent(
  accessToken: string,
  event: {
    subject: string;
    start: Date;
    end: Date;
    attendees: string[];
    description?: string;
    isOnlineMeeting?: boolean;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: event.subject,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        attendees: event.attendees.map((email) => ({
          emailAddress: { address: email },
          type: "required",
        })),
        description: event.description,
        isOnlineMeeting: event.isOnlineMeeting || false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro ao criar evento:", error);
      return { success: false, error };
    }

    const data = (await response.json()) as { id: string };

    return { success: true, eventId: data.id };
  } catch (error) {
    console.error("Erro ao criar evento no Outlook:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Detecta conflitos de horário
 */
export async function detectSchedulingConflicts(
  accessToken: string,
  proposedStart: Date,
  proposedEnd: Date,
  existingEvents: OutlookCalendarEvent[]
): Promise<ConflictDetectionResult> {
  const conflictingEvents = existingEvents.filter(
    (event) =>
      (proposedStart >= event.start && proposedStart < event.end) ||
      (proposedEnd > event.start && proposedEnd <= event.end) ||
      (proposedStart <= event.start && proposedEnd >= event.end)
  );

  const hasConflict = conflictingEvents.length > 0;

  // Sugerir slots alternativos
  const suggestedSlots: Date[] = [];
  if (hasConflict) {
    const duration = proposedEnd.getTime() - proposedStart.getTime();

    // Tentar próximas 5 horas
    for (let i = 1; i <= 5; i++) {
      const candidateStart = new Date(proposedStart.getTime() + i * 3600000);
      const candidateEnd = new Date(candidateStart.getTime() + duration);

      const hasConflictAtCandidate = existingEvents.some(
        (event) =>
          (candidateStart >= event.start && candidateStart < event.end) ||
          (candidateEnd > event.start && candidateEnd <= event.end)
      );

      if (!hasConflictAtCandidate) {
        suggestedSlots.push(candidateStart);
      }
    }
  }

  const severity =
    conflictingEvents.length === 0
      ? "low"
      : conflictingEvents.length === 1
        ? "medium"
        : "high";

  return {
    hasConflict,
    conflictingEvents,
    suggestedAlternativeSlots: suggestedSlots,
    severity,
  };
}

/**
 * Sincroniza evento com Outlook
 */
export async function syncEventWithOutlook(
  accessToken: string,
  appointmentData: {
    patientName: string;
    therapistEmail: string;
    patientEmail: string;
    startTime: Date;
    endTime: Date;
    description: string;
  }
): Promise<{ success: boolean; eventId?: string; conflictDetected?: boolean }> {
  try {
    // Buscar eventos existentes
    const existingEvents = await fetchOutlookCalendarEvents(
      accessToken,
      new Date(appointmentData.startTime.getTime() - 86400000),
      new Date(appointmentData.endTime.getTime() + 86400000)
    );

    // Detectar conflitos
    const conflictResult = await detectSchedulingConflicts(
      accessToken,
      appointmentData.startTime,
      appointmentData.endTime,
      existingEvents
    );

    if (conflictResult.hasConflict) {
      console.warn("Conflito de horário detectado:", conflictResult);
      return {
        success: false,
        conflictDetected: true,
      };
    }

    // Criar evento
    const result = await createOutlookCalendarEvent(accessToken, {
      subject: `Consulta Psicológica - ${appointmentData.patientName}`,
      start: appointmentData.startTime,
      end: appointmentData.endTime,
      attendees: [appointmentData.patientEmail],
      description: appointmentData.description,
      isOnlineMeeting: false,
    });

    return {
      success: result.success,
      eventId: result.eventId,
      conflictDetected: false,
    };
  } catch (error) {
    console.error("Erro ao sincronizar com Outlook:", error);
    return { success: false };
  }
}

/**
 * Atualiza token de acesso usando refresh token
 */
export async function refreshAccessToken(
  config: OutlookOAuthConfig,
  refreshToken: string
): Promise<OutlookAccessToken | null> {
  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: "Calendars.ReadWrite offline_access",
        }).toString(),
      }
    );

    if (!response.ok) {
      console.error("Erro ao renovar token:", response.statusText);
      return null;
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      userId: `outlook_user_${Date.now()}`,
    };
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return null;
  }
}
