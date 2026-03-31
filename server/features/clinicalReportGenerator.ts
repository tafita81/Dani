/**
 * Gerador de Relatórios Clínicos em PDF
 * Cria relatórios profissionais com evolução do paciente
 */

import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export interface PatientReport {
  patientName: string;
  patientId: string;
  dateOfBirth: Date;
  therapistName: string;
  reportDate: Date;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  totalSessions: number;
  attendanceRate: number;
  averageMood: number;
  averageEngagement: number;
  mainTherapyApproaches: string[];
  clinicalProgress: string;
  keyInsights: string[];
  recommendations: string[];
  formResults?: FormResult[];
  sessionNotes?: SessionNote[];
}

export interface FormResult {
  formName: string;
  date: Date;
  score: number;
  maxScore: number;
  interpretation: string;
  trend?: "improved" | "stable" | "worsened";
}

export interface SessionNote {
  date: Date;
  duration: number;
  mood: number;
  engagement: number;
  approach: string;
  summary: string;
  techniques: string[];
}

/**
 * Gera PDF com relatório clínico
 */
export async function generateClinicalReportPDF(
  report: PatientReport
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Cabeçalho
      drawHeader(doc, report);

      // Informações do Paciente
      doc.addPage();
      drawPatientInfo(doc, report);

      // Resumo Executivo
      doc.addPage();
      drawExecutiveSummary(doc, report);

      // Evolução de Formulários
      if (report.formResults && report.formResults.length > 0) {
        doc.addPage();
        drawFormResults(doc, report.formResults);
      }

      // Análise de Sessões
      if (report.sessionNotes && report.sessionNotes.length > 0) {
        doc.addPage();
        drawSessionAnalysis(doc, report.sessionNotes);
      }

      // Progresso Clínico
      doc.addPage();
      drawClinicalProgress(doc, report);

      // Recomendações
      doc.addPage();
      drawRecommendations(doc, report);

      // Rodapé
      addFooter(doc, report);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Desenha cabeçalho do documento
 */
function drawHeader(doc: PDFKit.PDFDocument, report: PatientReport) {
  // Logo/Título
  doc.fontSize(24).font("Helvetica-Bold").text("RELATÓRIO CLÍNICO", {
    align: "center",
  });

  doc.fontSize(12).font("Helvetica").text("Psi. Daniela Coelho", {
    align: "center",
  });

  doc.fontSize(10).text("Psicóloga Clínica - CRP XXXXX/XX", {
    align: "center",
  });

  doc.moveDown();
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();
}

/**
 * Desenha informações do paciente
 */
function drawPatientInfo(doc: PDFKit.PDFDocument, report: PatientReport) {
  doc.fontSize(14).font("Helvetica-Bold").text("INFORMAÇÕES DO PACIENTE");
  doc.moveDown();

  const infoData = [
    ["Nome:", report.patientName],
    ["Data de Nascimento:", formatDate(report.patientId)],
    ["Terapeuta:", report.therapistName],
    ["Data do Relatório:", formatDate(report.reportDate)],
    ["Período Analisado:", `${formatDate(report.reportPeriod.startDate)} a ${formatDate(report.reportPeriod.endDate)}`],
  ];

  doc.fontSize(11).font("Helvetica");
  infoData.forEach(([label, value]) => {
    doc.text(`${label} ${value}`);
    doc.moveDown(0.3);
  });

  doc.moveDown();
}

/**
 * Desenha resumo executivo
 */
function drawExecutiveSummary(doc: PDFKit.PDFDocument, report: PatientReport) {
  doc.fontSize(14).font("Helvetica-Bold").text("RESUMO EXECUTIVO");
  doc.moveDown();

  const summaryData = [
    [`Total de Sessões: ${report.totalSessions}`],
    [`Taxa de Comparecimento: ${report.attendanceRate.toFixed(1)}%`],
    [`Humor Médio: ${report.averageMood.toFixed(1)}/10`],
    [`Engajamento Médio: ${report.averageEngagement.toFixed(1)}/10`],
    [`Abordagens Utilizadas: ${report.mainTherapyApproaches.join(", ")}`],
  ];

  doc.fontSize(11).font("Helvetica");
  summaryData.forEach(([text]) => {
    doc.text(`• ${text}`);
    doc.moveDown(0.3);
  });

  doc.moveDown();
  doc.fontSize(11).font("Helvetica-Bold").text("Progresso Geral:");
  doc.font("Helvetica").text(report.clinicalProgress, {
    align: "justify",
    width: 475,
  });

  doc.moveDown();
}

/**
 * Desenha resultados de formulários
 */
function drawFormResults(
  doc: PDFKit.PDFDocument,
  formResults: FormResult[]
) {
  doc.fontSize(14).font("Helvetica-Bold").text("EVOLUÇÃO DE FORMULÁRIOS");
  doc.moveDown();

  formResults.forEach((form) => {
    const percentage = (form.score / form.maxScore) * 100;
    const trend = form.trend ? ` (${getTrendEmoji(form.trend)})` : "";

    doc.fontSize(11).font("Helvetica-Bold").text(`${form.formName}${trend}`);
    doc.fontSize(10).font("Helvetica").text(`Data: ${formatDate(form.date)}`);
    doc.text(`Pontuação: ${form.score}/${form.maxScore} (${percentage.toFixed(1)}%)`);
    doc.text(`Interpretação: ${form.interpretation}`);

    // Barra de progresso
    drawProgressBar(doc, percentage);

    doc.moveDown(0.5);
  });

  doc.moveDown();
}

/**
 * Desenha análise de sessões
 */
function drawSessionAnalysis(
  doc: PDFKit.PDFDocument,
  sessionNotes: SessionNote[]
) {
  doc.fontSize(14).font("Helvetica-Bold").text("ANÁLISE DE SESSÕES");
  doc.moveDown();

  const recentSessions = sessionNotes.slice(-5); // Últimas 5 sessões

  recentSessions.forEach((session) => {
    doc.fontSize(11).font("Helvetica-Bold").text(
      `Sessão de ${formatDate(session.date)} (${session.duration}min)`
    );

    doc.fontSize(10).font("Helvetica");
    doc.text(`Abordagem: ${session.approach}`);
    doc.text(`Humor: ${session.mood}/10 | Engajamento: ${session.engagement}/10`);
    doc.text(`Técnicas: ${session.techniques.join(", ")}`);
    doc.text(`Resumo: ${session.summary}`, {
      align: "justify",
      width: 475,
    });

    doc.moveDown(0.5);
  });

  doc.moveDown();
}

/**
 * Desenha progresso clínico
 */
function drawClinicalProgress(doc: PDFKit.PDFDocument, report: PatientReport) {
  doc.fontSize(14).font("Helvetica-Bold").text("PROGRESSO CLÍNICO");
  doc.moveDown();

  doc.fontSize(11).font("Helvetica").text(report.clinicalProgress, {
    align: "justify",
    width: 475,
  });

  if (report.keyInsights && report.keyInsights.length > 0) {
    doc.moveDown();
    doc.fontSize(11).font("Helvetica-Bold").text("Principais Insights:");
    doc.fontSize(10).font("Helvetica");

    report.keyInsights.forEach((insight) => {
      doc.text(`• ${insight}`);
      doc.moveDown(0.3);
    });
  }

  doc.moveDown();
}

/**
 * Desenha recomendações
 */
function drawRecommendations(doc: PDFKit.PDFDocument, report: PatientReport) {
  doc.fontSize(14).font("Helvetica-Bold").text("RECOMENDAÇÕES");
  doc.moveDown();

  doc.fontSize(11).font("Helvetica");
  report.recommendations.forEach((rec) => {
    doc.text(`• ${rec}`);
    doc.moveDown(0.5);
  });

  doc.moveDown();
  doc.fontSize(10).font("Helvetica-Oblique").text(
    "Este relatório é confidencial e destinado exclusivamente ao paciente e profissional responsável.",
    {
      align: "center",
    }
  );
}

/**
 * Adiciona rodapé
 */
function addFooter(doc: PDFKit.PDFDocument, report: PatientReport) {
  const pageCount = (doc as any).bufferedPageRange().count;

  for (let i = 1; i <= pageCount; i++) {
    doc.switchToPage(i - 1);

    doc.fontSize(9).font("Helvetica").text(
      `Página ${i} de ${pageCount}`,
      50,
      doc.page.height - 30,
      {
        align: "center",
      }
    );

    doc.text(
      `Gerado em ${formatDate(new Date())}`,
      50,
      doc.page.height - 15,
      {
        align: "center",
      }
    );
  }
}

/**
 * Desenha barra de progresso
 */
function drawProgressBar(doc: PDFKit.PDFDocument, percentage: number) {
  const barWidth = 200;
  const barHeight = 10;
  const x = doc.x;
  const y = doc.y;

  // Barra de fundo
  doc.rect(x, y, barWidth, barHeight).stroke();

  // Barra preenchida
  const fillWidth = (percentage / 100) * barWidth;
  const color = getColorForPercentage(percentage);
  doc.rect(x, y, fillWidth, barHeight).fill(color);

  // Percentual
  doc.fontSize(9).font("Helvetica").text(`${percentage.toFixed(1)}%`, x + barWidth + 10, y + 1);

  doc.moveDown(1);
}

/**
 * Obtém cor baseado em percentual
 */
function getColorForPercentage(percentage: number): string {
  if (percentage >= 80) return "#4CAF50"; // Verde
  if (percentage >= 60) return "#FFC107"; // Amarelo
  if (percentage >= 40) return "#FF9800"; // Laranja
  return "#F44336"; // Vermelho
}

/**
 * Obtém emoji de tendência
 */
function getTrendEmoji(trend: "improved" | "stable" | "worsened"): string {
  switch (trend) {
    case "improved":
      return "📈 Melhorou";
    case "stable":
      return "→ Estável";
    case "worsened":
      return "📉 Piorou";
  }
}

/**
 * Formata data
 */
function formatDate(date: Date | string): string {
  if (typeof date === "string") return date;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Exporta relatório para arquivo
 */
export async function exportReportToFile(
  report: PatientReport,
  filename: string
): Promise<void> {
  const pdf = await generateClinicalReportPDF(report);

  // Salvar em S3 ou arquivo local
  const fs = await import("fs").then((m) => m.promises);
  await fs.writeFile(filename, pdf);
}

/**
 * Envia relatório por e-mail
 */
export async function sendReportByEmail(
  report: PatientReport,
  recipientEmail: string
): Promise<boolean> {
  try {
    const pdf = await generateClinicalReportPDF(report);

    // Implementar envio via serviço de e-mail
    console.log(`Enviando relatório para ${recipientEmail}`);

    return true;
  } catch (error) {
    console.error("Erro ao enviar relatório:", error);
    return false;
  }
}
