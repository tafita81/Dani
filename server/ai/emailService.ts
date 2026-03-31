// Serviço de envio de e-mail para notificações de agendamento

export interface EmailTemplate {
  subject: string;
  body: string;
  htmlBody?: string;
}

export interface RescheduleNotification {
  patientName: string;
  patientEmail: string;
  originalDate: Date;
  originalTime: string;
  newDate: Date;
  newTime: string;
  reason?: string;
  therapistName: string;
}

export interface CancellationNotification {
  patientName: string;
  patientEmail: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason?: string;
  therapistName: string;
  rescheduleLink?: string;
}

/**
 * Gera template de e-mail para remarcação de consulta
 */
export function generateRescheduleEmailTemplate(
  notification: RescheduleNotification
): EmailTemplate {
  const originalDateStr = notification.originalDate.toLocaleDateString("pt-BR");
  const newDateStr = notification.newDate.toLocaleDateString("pt-BR");

  const subject = `Sua consulta foi remarcada para ${newDateStr}`;

  const body = `Olá ${notification.patientName},

Informamos que sua consulta com ${notification.therapistName} foi remarcada.

📅 Data anterior: ${originalDateStr} às ${notification.originalTime}
📅 Nova data: ${newDateStr} às ${notification.newTime}

${notification.reason ? `Motivo: ${notification.reason}\n` : ""}

Se você não puder comparecer no novo horário, por favor nos avise com antecedência.

Atenciosamente,
${notification.therapistName}`;

  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Sua consulta foi remarcada</h2>
          <p>Olá <strong>${notification.patientName}</strong>,</p>
          <p>Informamos que sua consulta com <strong>${notification.therapistName}</strong> foi remarcada.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📅 Data anterior:</strong> ${originalDateStr} às ${notification.originalTime}</p>
            <p><strong>📅 Nova data:</strong> ${newDateStr} às ${notification.newTime}</p>
          </div>
          
          ${notification.reason ? `<p><strong>Motivo:</strong> ${notification.reason}</p>` : ""}
          
          <p>Se você não puder comparecer no novo horário, por favor nos avise com antecedência.</p>
          
          <p>Atenciosamente,<br><strong>${notification.therapistName}</strong></p>
        </div>
      </body>
    </html>
  `;

  return { subject, body, htmlBody };
}

/**
 * Gera template de e-mail para cancelamento de consulta
 */
export function generateCancellationEmailTemplate(
  notification: CancellationNotification
): EmailTemplate {
  const appointmentDateStr = notification.appointmentDate.toLocaleDateString(
    "pt-BR"
  );

  const subject = `Sua consulta de ${appointmentDateStr} foi cancelada`;

  const body = `Olá ${notification.patientName},

Informamos que sua consulta com ${notification.therapistName} foi cancelada.

📅 Data: ${appointmentDateStr} às ${notification.appointmentTime}

${notification.reason ? `Motivo: ${notification.reason}\n` : ""}

${notification.rescheduleLink ? `Para remarcar sua consulta, clique aqui: ${notification.rescheduleLink}\n` : ""}

Se tiver dúvidas, entre em contato conosco.

Atenciosamente,
${notification.therapistName}`;

  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Sua consulta foi cancelada</h2>
          <p>Olá <strong>${notification.patientName}</strong>,</p>
          <p>Informamos que sua consulta com <strong>${notification.therapistName}</strong> foi cancelada.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📅 Data:</strong> ${appointmentDateStr} às ${notification.appointmentTime}</p>
          </div>
          
          ${notification.reason ? `<p><strong>Motivo:</strong> ${notification.reason}</p>` : ""}
          
          ${
            notification.rescheduleLink
              ? `<p><a href="${notification.rescheduleLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Remarcar Consulta</a></p>`
              : ""
          }
          
          <p>Se tiver dúvidas, entre em contato conosco.</p>
          
          <p>Atenciosamente,<br><strong>${notification.therapistName}</strong></p>
        </div>
      </body>
    </html>
  `;

  return { subject, body, htmlBody };
}

/**
 * Gera template de e-mail para confirmação de consulta
 */
export function generateConfirmationEmailTemplate(
  patientName: string,
  appointmentDate: Date,
  appointmentTime: string,
  therapistName: string,
  location?: string
): EmailTemplate {
  const dateStr = appointmentDate.toLocaleDateString("pt-BR");

  const subject = `Confirmação de sua consulta em ${dateStr}`;

  const body = `Olá ${patientName},

Sua consulta com ${therapistName} foi confirmada!

📅 Data: ${dateStr}
⏰ Horário: ${appointmentTime}
${location ? `📍 Local: ${location}\n` : ""}

Por favor, chegue com 10 minutos de antecedência.

Se precisar cancelar ou remarcar, avise com antecedência.

Atenciosamente,
${therapistName}`;

  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Confirmação de sua consulta</h2>
          <p>Olá <strong>${patientName}</strong>,</p>
          <p>Sua consulta com <strong>${therapistName}</strong> foi confirmada!</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📅 Data:</strong> ${dateStr}</p>
            <p><strong>⏰ Horário:</strong> ${appointmentTime}</p>
            ${location ? `<p><strong>📍 Local:</strong> ${location}</p>` : ""}
          </div>
          
          <p>Por favor, chegue com 10 minutos de antecedência.</p>
          <p>Se precisar cancelar ou remarcar, avise com antecedência.</p>
          
          <p>Atenciosamente,<br><strong>${therapistName}</strong></p>
        </div>
      </body>
    </html>
  `;

  return { subject, body, htmlBody };
}

/**
 * Envia e-mail usando o serviço de notificação Manus
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<boolean> {
  try {
    // Usar o serviço de notificação Manus
    const response = await fetch(
      `${process.env.BUILT_IN_FORGE_API_URL}/notification/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          body: template.body,
          htmlBody: template.htmlBody,
        }),
      }
    );

    if (!response.ok) {
      console.error(`Erro ao enviar e-mail para ${to}:`, response.statusText);
      return false;
    }

    console.log(`✅ E-mail enviado para ${to}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return false;
  }
}

/**
 * Envia notificação de remarcação
 */
export async function notifyReschedule(
  notification: RescheduleNotification
): Promise<boolean> {
  const template = generateRescheduleEmailTemplate(notification);
  return sendEmail(notification.patientEmail, template);
}

/**
 * Envia notificação de cancelamento
 */
export async function notifyCancellation(
  notification: CancellationNotification
): Promise<boolean> {
  const template = generateCancellationEmailTemplate(notification);
  return sendEmail(notification.patientEmail, template);
}

/**
 * Envia confirmação de consulta
 */
export async function notifyConfirmation(
  patientEmail: string,
  patientName: string,
  appointmentDate: Date,
  appointmentTime: string,
  therapistName: string,
  location?: string
): Promise<boolean> {
  const template = generateConfirmationEmailTemplate(
    patientName,
    appointmentDate,
    appointmentTime,
    therapistName,
    location
  );
  return sendEmail(patientEmail, template);
}
