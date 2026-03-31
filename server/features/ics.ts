/**
 * ICS file generator for appointment calendar invites.
 * Generates standard iCalendar format that works with Google Calendar, Apple Calendar, Outlook, etc.
 */

export interface IcsEvent {
  title: string;
  description?: string;
  startTime: number; // UTC ms
  endTime: number; // UTC ms
  location?: string;
  organizerName?: string;
  organizerEmail?: string;
  attendeeName?: string;
  attendeeEmail?: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIcsDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@assistente-clinico`;
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateIcs(event: IcsEvent): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Assistente Clinico//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${generateUid()}`,
    `DTSTAMP:${toIcsDate(Date.now())}`,
    `DTSTART:${toIcsDate(event.startTime)}`,
    `DTEND:${toIcsDate(event.endTime)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcs(event.location)}`);
  }
  if (event.organizerEmail) {
    const cn = event.organizerName ? `;CN=${escapeIcs(event.organizerName)}` : "";
    lines.push(`ORGANIZER${cn}:mailto:${event.organizerEmail}`);
  }
  if (event.attendeeEmail) {
    const cn = event.attendeeName ? `;CN=${escapeIcs(event.attendeeName)}` : "";
    lines.push(`ATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE${cn}:mailto:${event.attendeeEmail}`);
  }

  lines.push("STATUS:CONFIRMED");
  lines.push("BEGIN:VALARM");
  lines.push("TRIGGER:-PT1H");
  lines.push("ACTION:DISPLAY");
  lines.push("DESCRIPTION:Lembrete de consulta");
  lines.push("END:VALARM");
  lines.push("BEGIN:VALARM");
  lines.push("TRIGGER:-PT24H");
  lines.push("ACTION:DISPLAY");
  lines.push("DESCRIPTION:Consulta amanhã");
  lines.push("END:VALARM");
  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}
