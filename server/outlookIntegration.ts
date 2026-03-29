/**
 * Integração com Outlook Calendar
 * Sincroniza bloqueios de agenda e agendamentos automáticos
 */

export interface OutlookEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  bodyPreview: string;
  attendees?: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  isReminderOn: boolean;
  reminderMinutesBeforeStart: number;
}

export interface OutlookCalendarConfig {
  accessToken: string;
  userEmail: string;
  calendarId?: string; // Se não fornecido, usa calendário padrão
}

/**
 * Cria bloqueio de agenda no Outlook Calendar
 */
export async function blockTimeSlotOutlook(
  config: OutlookCalendarConfig,
  startTime: Date,
  endTime: Date,
  reason: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const event = {
      subject: `[BLOQUEADO] ${reason}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      categories: ["blocked"],
      isReminderOn: false,
      bodyPreview: `Horário bloqueado: ${reason}`,
    };

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${config.calendarId || "primary"}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Erro ao bloquear horário",
      };
    }

    const data = await response.json();
    return {
      success: true,
      eventId: data.id,
    };
  } catch (error) {
    console.error("Erro ao bloquear horário no Outlook:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Remove bloqueio de agenda no Outlook Calendar
 */
export async function unblockTimeSlotOutlook(
  config: OutlookCalendarConfig,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Erro ao liberar horário",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao liberar horário no Outlook:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Cria agendamento de consulta no Outlook Calendar
 */
export async function createAppointmentOutlook(
  config: OutlookCalendarConfig,
  patientName: string,
  patientEmail: string,
  startTime: Date,
  endTime: Date,
  notes?: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const event = {
      subject: `Consulta - ${patientName}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      body: {
        contentType: "HTML",
        content: `
          <p>Consulta agendada com ${patientName}</p>
          ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ""}
          <p>Abordagem: TCC, Terapia do Esquema, Gestalt</p>
        `,
      },
      attendees: [
        {
          emailAddress: {
            address: patientEmail,
            name: patientName,
          },
          type: "required",
        },
      ],
      isReminderOn: true,
      reminderMinutesBeforeStart: 15,
      categories: ["appointment"],
    };

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${config.calendarId || "primary"}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Erro ao criar agendamento",
      };
    }

    const data = await response.json();
    return {
      success: true,
      eventId: data.id,
    };
  } catch (error) {
    console.error("Erro ao criar agendamento no Outlook:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Cancela agendamento no Outlook Calendar
 */
export async function cancelAppointmentOutlook(
  config: OutlookCalendarConfig,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Erro ao cancelar agendamento",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar agendamento no Outlook:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Lista eventos do Outlook Calendar
 */
export async function listOutlookEvents(
  config: OutlookCalendarConfig,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; events?: OutlookEvent[]; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Erro ao listar eventos",
      };
    }

    const data = await response.json();
    return {
      success: true,
      events: data.value,
    };
  } catch (error) {
    console.error("Erro ao listar eventos do Outlook:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Verifica disponibilidade no Outlook Calendar
 */
export async function checkAvailabilityOutlook(
  config: OutlookCalendarConfig,
  startDate: Date,
  endDate: Date,
  durationMinutes: number = 60
): Promise<{
  success: boolean;
  availableSlots?: Array<{ start: Date; end: Date }>;
  error?: string;
}> {
  try {
    const { success, events, error } = await listOutlookEvents(config, startDate, endDate);

    if (!success) {
      return { success: false, error };
    }

    const availableSlots: Array<{ start: Date; end: Date }> = [];
    let currentTime = new Date(startDate);

    const busyTimes = (events || []).map((event) => ({
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
    }));

    while (currentTime < endDate) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

      // Verificar se o slot está disponível
      const isAvailable = !busyTimes.some(
        (busy) =>
          (currentTime >= busy.start && currentTime < busy.end) ||
          (slotEnd > busy.start && slotEnd <= busy.end) ||
          (currentTime <= busy.start && slotEnd >= busy.end)
      );

      if (isAvailable) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
        });
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60000); // Próximo slot em 30 minutos
    }

    return {
      success: true,
      availableSlots,
    };
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}
