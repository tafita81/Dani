/**
 * Outlook Calendar API integration helper (Microsoft Graph API).
 * Handles OAuth2 token management and calendar operations for Outlook/Microsoft 365.
 * Uses delegated permissions to access the therapist's calendar.
 */

const MICROSOFT_GRAPH_API = "https://graph.microsoft.com/v1.0";

export interface OutlookCalendarConfig {
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: number;
  userEmail?: string; // Optional: email of the calendar owner
}

export interface CalendarEvent {
  id?: string;
  summary?: string;
  subject?: string; // Outlook uses "subject" instead of "summary"
  description?: string;
  bodyPreview?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: { email: string; displayName?: string }[];
  isReminderOn?: boolean;
  reminderMinutesBeforeStart?: number;
}

export interface FreeSlot {
  start: number; // UTC ms
  end: number;   // UTC ms
}

/**
 * List events from Outlook calendar for a given date range.
 */
export async function listEvents(
  config: OutlookCalendarConfig,
  timeMin: string, // ISO 8601 format
  timeMax: string  // ISO 8601 format
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    $filter: `start/dateTime ge '${timeMin}' and end/dateTime le '${timeMax}'`,
    $orderby: "start/dateTime",
    $top: "250",
  });

  const response = await fetch(`${MICROSOFT_GRAPH_API}/me/calendarview?${params}`, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Outlook Calendar API error: ${error}`);
  }

  const data = await response.json();
  return data.value || [];
}

/**
 * Create an event in Outlook calendar.
 */
export async function createEvent(
  config: OutlookCalendarConfig,
  event: CalendarEvent
): Promise<CalendarEvent> {
  const body = {
    subject: event.subject || event.summary,
    bodyPreview: event.description || event.bodyPreview,
    start: event.start,
    end: event.end,
    attendees: event.attendees || [],
    isReminderOn: event.isReminderOn !== false,
    reminderMinutesBeforeStart: event.reminderMinutesBeforeStart || 15,
  };

  const response = await fetch(`${MICROSOFT_GRAPH_API}/me/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Outlook Calendar event: ${error}`);
  }

  return response.json();
}

/**
 * Update an event in Outlook calendar.
 */
export async function updateEvent(
  config: OutlookCalendarConfig,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const body: any = {};
  if (event.subject || event.summary) body.subject = event.subject || event.summary;
  if (event.description || event.bodyPreview) body.bodyPreview = event.description || event.bodyPreview;
  if (event.start) body.start = event.start;
  if (event.end) body.end = event.end;
  if (event.attendees) body.attendees = event.attendees;
  if (event.isReminderOn !== undefined) body.isReminderOn = event.isReminderOn;
  if (event.reminderMinutesBeforeStart) body.reminderMinutesBeforeStart = event.reminderMinutesBeforeStart;

  const response = await fetch(`${MICROSOFT_GRAPH_API}/me/events/${eventId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update Outlook Calendar event: ${error}`);
  }

  return response.json();
}

/**
 * Delete an event from Outlook calendar.
 */
export async function deleteEvent(
  config: OutlookCalendarConfig,
  eventId: string
): Promise<void> {
  const response = await fetch(`${MICROSOFT_GRAPH_API}/me/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.accessToken}` },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to delete Outlook Calendar event: ${error}`);
  }
}

/**
 * Detect free slots in the therapist's Outlook calendar.
 * workingHours: { start: 8, end: 18 } means 8 AM to 6 PM
 * slotDurationMinutes: duration of each appointment slot
 */
export async function findFreeSlots(
  config: OutlookCalendarConfig,
  dateStr: string, // YYYY-MM-DD
  workingHours = { start: 8, end: 18 },
  slotDurationMinutes = 50,
  timezone = "America/Sao_Paulo"
): Promise<FreeSlot[]> {
  const timeMin = `${dateStr}T${String(workingHours.start).padStart(2, "0")}:00:00`;
  const timeMax = `${dateStr}T${String(workingHours.end).padStart(2, "0")}:00:00`;

  // Build timezone-aware ISO strings
  const timeMinISO = new Date(`${timeMin}-03:00`).toISOString();
  const timeMaxISO = new Date(`${timeMax}-03:00`).toISOString();

  const events = await listEvents(config, timeMinISO, timeMaxISO);

  // Build busy intervals
  const busy: { start: number; end: number }[] = events
    .filter(e => e.start?.dateTime && e.end?.dateTime)
    .map(e => ({
      start: new Date(e.start.dateTime).getTime(),
      end: new Date(e.end.dateTime).getTime(),
    }))
    .sort((a, b) => a.start - b.start);

  // Find free slots
  const freeSlots: FreeSlot[] = [];
  const slotMs = slotDurationMinutes * 60 * 1000;
  let cursor = new Date(`${timeMin}-03:00`).getTime();
  const dayEnd = new Date(`${timeMax}-03:00`).getTime();

  for (const event of busy) {
    while (cursor + slotMs <= event.start) {
      freeSlots.push({ start: cursor, end: cursor + slotMs });
      cursor += slotMs;
    }
    cursor = Math.max(cursor, event.end);
  }

  // Remaining slots after last event
  while (cursor + slotMs <= dayEnd) {
    freeSlots.push({ start: cursor, end: cursor + slotMs });
    cursor += slotMs;
  }

  return freeSlots;
}

/**
 * Get user profile info from Outlook.
 * Used to verify the connected account.
 */
export async function getUserProfile(config: OutlookCalendarConfig): Promise<any> {
  const response = await fetch(`${MICROSOFT_GRAPH_API}/me`, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Outlook user profile: ${error}`);
  }

  return response.json();
}

/**
 * Get the user's mailbox settings (timezone, language, etc).
 */
export async function getMailboxSettings(config: OutlookCalendarConfig): Promise<any> {
  const response = await fetch(`${MICROSOFT_GRAPH_API}/me/mailboxSettings`, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Outlook mailbox settings: ${error}`);
  }

  return response.json();
}
