/**
 * Google Calendar API integration helper.
 * Handles OAuth2 token management and calendar operations.
 * The therapist configures their Google Calendar credentials in the settings page.
 */

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarEmail: string; // Gmail to query
  accessToken?: string;
  tokenExpiry?: number;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: { email: string; displayName?: string }[];
}

export interface FreeSlot {
  start: number; // UTC ms
  end: number;   // UTC ms
}

async function getAccessToken(config: GoogleCalendarConfig): Promise<string> {
  // If we have a valid access token, use it
  if (config.accessToken && config.tokenExpiry && Date.now() < config.tokenExpiry) {
    return config.accessToken;
  }

  // Refresh the token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh Google token: ${error}`);
  }

  const data = await response.json();
  config.accessToken = data.access_token;
  config.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return data.access_token;
}

export async function listEvents(config: GoogleCalendarConfig, timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
  const token = await getAccessToken(config);
  const calendarId = encodeURIComponent(config.calendarEmail);
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Calendar API error: ${error}`);
  }

  const data = await response.json();
  return data.items || [];
}

export async function createEvent(config: GoogleCalendarConfig, event: CalendarEvent): Promise<CalendarEvent> {
  const token = await getAccessToken(config);
  const calendarId = encodeURIComponent(config.calendarEmail);

  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Google Calendar event: ${error}`);
  }

  return response.json();
}

export async function deleteEvent(config: GoogleCalendarConfig, eventId: string): Promise<void> {
  const token = await getAccessToken(config);
  const calendarId = encodeURIComponent(config.calendarEmail);

  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to delete Google Calendar event: ${error}`);
  }
}

/**
 * Detect free slots in the therapist's calendar.
 * workingHours: { start: 8, end: 18 } means 8 AM to 6 PM
 * slotDurationMinutes: duration of each appointment slot
 */
export async function findFreeSlots(
  config: GoogleCalendarConfig,
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
 * Generate Google Calendar OAuth2 authorization URL.
 * The therapist visits this URL to grant access to their calendar.
 */
export function getAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchange authorization code for tokens.
 */
export async function exchangeCode(clientId: string, clientSecret: string, code: string, redirectUri: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}
