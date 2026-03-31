/**
 * googleCalendar.ts — Sincronização bidirecional com Google Calendar
 * OAuth2 próprio (sem Manus)
 */

import { google } from "googleapis";
import { db } from "../core_logic/db.js";
import { appointments } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

const CLIENT_ID     = process.env.GOOGLE_CALENDAR_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? "";
const REDIRECT_URI  = process.env.GOOGLE_CALENDAR_REDIRECT_URI ?? "";

// ── Criar cliente OAuth2 ──────────────────────────────────────
export function createOAuthClient(tokens?: { access_token: string; refresh_token: string }) {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  if (tokens) auth.setCredentials(tokens);
  return auth;
}

// ── URL de autorização ────────────────────────────────────────
export function getAuthUrl(): string {
  const auth = createOAuthClient();
  return auth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    prompt: "consent",
  });
}

// ── Trocar code por tokens ────────────────────────────────────
export async function exchangeCode(code: string) {
  const auth = createOAuthClient();
  const { tokens } = await auth.getToken(code);
  return tokens;
}

// ── Listar eventos de hoje ────────────────────────────────────
export async function getTodayEvents(tokens: { access_token: string; refresh_token: string }) {
  const auth     = createOAuthClient(tokens);
  const calendar = google.calendar({ version: "v3", auth });

  const now   = new Date();
  const start = new Date(now); start.setHours(0,0,0,0);
  const end   = new Date(now); end.setHours(23,59,59,999);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items ?? [];
}

// ── Criar evento no Google Calendar ──────────────────────────
export async function createEvent(
  tokens: { access_token: string; refresh_token: string },
  event: {
    title: string;
    start: Date;
    end: Date;
    description?: string;
    attendeeEmail?: string;
  }
): Promise<string | null> {
  const auth     = createOAuthClient(tokens);
  const calendar = google.calendar({ version: "v3", auth });

  const body: any = {
    summary: event.title,
    description: event.description,
    start: { dateTime: event.start.toISOString(), timeZone: "America/Sao_Paulo" },
    end:   { dateTime: event.end.toISOString(),   timeZone: "America/Sao_Paulo" },
    reminders: { useDefault: false, overrides: [{ method: "email", minutes: 60 }, { method: "popup", minutes: 15 }] },
  };

  if (event.attendeeEmail) {
    body.attendees = [{ email: event.attendeeEmail }];
  }

  const created = await calendar.events.insert({ calendarId: "primary", requestBody: body });
  return created.data.id ?? null;
}

// ── Cancelar evento ────────────────────────────────────────────
export async function deleteEvent(
  tokens: { access_token: string; refresh_token: string },
  eventId: string
): Promise<boolean> {
  const auth     = createOAuthClient(tokens);
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId: "primary", eventId });
  return true;
}

// ── Sincronizar DB → Google Calendar ─────────────────────────
export async function syncAppointmentsToGoogle(
  userId: string,
  tokens: { access_token: string; refresh_token: string }
): Promise<number> {
  const appts = await db.select()
    .from(appointments)
    .where(eq(appointments.userId, userId));

  let synced = 0;
  for (const appt of appts) {
    if (!appt.googleEventId && appt.startTime && appt.endTime) {
      const eventId = await createEvent(tokens, {
        title: appt.title ?? "Consulta",
        start: new Date(appt.startTime),
        end:   new Date(appt.endTime),
        description: appt.notes ?? "",
      });

      if (eventId) {
        await db.update(appointments)
          .set({ googleEventId: eventId })
          .where(eq(appointments.id, appt.id));
        synced++;
      }
    }
  }
  return synced;
}
