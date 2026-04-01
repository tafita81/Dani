import PDFDocument from "pdfkit";
import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface SessionAnalysisSummary {
  sessionId: number;
  date: Date;
  summary: string;
  keyThemes: string[];
  interventions: string[];
  aiSuggestions: string;
}

export interface PatientReportData {
  patient: {
    id: number;
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
    gender?: string;
    cpf?: string;
    observations?: string;
  };
  professional: {
    name: string;
    crp: string;
    email: string;
    phone: string;
  };
  treatmentSummary: {
    startDate: Date;
    totalSessions: number;
    currentStatus: string;
    mainObjectives: string[];
    techniques: string[];
  };
  evolutionAnalysis: {
    initialState: string;
    currentState: string;
    improvements: string[];
    challenges: string[];
    nextSteps: string[];
  };
  sessionAnalyses: SessionAnalysisSummary[];
  moodProgression: Array<{
    date: Date;
    score: number;
  }>;
  recurringThemes: Array<{
    theme: string;
    frequency: number;
  }>;
  effectiveTechniques: Array<{
    technique: string;
    successRate: number;
  }>;
  recommendations: string;
  generatedAt: Date;
}

export function generatePatientReportPDF(data: PatientReportData) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;

  // Cores profissionais brasileiras
  const colors = {
    primary: "#003366", // Azul profissional
    secondary: "#666666", // Cinza
    accent: "#0066cc", // Azul claro
    border: "#cccccc", // Cinza claro
    text: "#333333", // Cinza escuro
  };

  // Helper functions
  const addHeader = () => {
    // Logo area (simulated)
    doc.fontSize(12).font("Helvetica-Bold").fillColor(colors.primary).text("DANI - ASSISTENTE CLÍNICO IA", margin, margin);
    doc.fontSize(9).font("Helvetica").fillColor(colors.secondary).text("Plataforma de Gestão Clínica Integrada", margin, doc.y + 2);

    // Horizontal line
    doc.moveTo(margin, doc.y + 10).lineTo(pageWidth - margin, doc.y + 10).stroke(colors.border);
    doc.moveDown(1);
  };

  const addTitle = (text: string) => {
    doc.fontSize(18).font("Helvetica-Bold").fillColor(colors.primary).text(text, { align: "center" });
    doc.fontSize(10).font("Helvetica").fillColor(colors.secondary).text("Laudo Clínico Profissional", { align: "center" });
    doc.moveDown(0.5);
  };

  const addSectionTitle = (text: string) => {
    doc.fontSize(12).font("Helvetica-Bold").fillColor(colors.primary).text(text);
    doc.moveTo(margin, doc.y).lineTo(pageWidth - margin, doc.y).stroke(colors.border);
    doc.moveDown(0.4);
  };

  const addFieldRow = (label: string, value: string, width: number = contentWidth / 2) => {
    doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text(label + ":", { width, continued: true });
    doc.font("Helvetica").fillColor(colors.text).text(" " + value);
  };

  const addBox = (title: string, content: string) => {
    doc.rect(margin, doc.y, contentWidth, 1).stroke(colors.border);
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.primary).text(title);
    doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(content, { width: contentWidth });
    doc.moveDown(0.3);
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "N/A";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Page 1: Header and Patient Info
  addHeader();
  addTitle("LAUDO CLÍNICO PSICOLÓGICO");

  // Document info
  doc.fontSize(9).fillColor(colors.secondary).text(
    `Emitido em: ${format(data.generatedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
    { align: "right" }
  );
  doc.text(`Hora: ${format(data.generatedAt, "HH:mm:ss")}`, { align: "right" });
  doc.moveDown(0.5);

  // Professional Info Box
  addSectionTitle("PROFISSIONAL RESPONSÁVEL");
  doc.fontSize(9);
  addFieldRow("Nome", data.professional.name, contentWidth);
  addFieldRow("CRP", data.professional.crp, contentWidth);
  addFieldRow("Email", data.professional.email, contentWidth);
  addFieldRow("Telefone", data.professional.phone, contentWidth);
  doc.moveDown(0.5);

  // Patient Info Box
  addSectionTitle("DADOS DO PACIENTE");
  doc.fontSize(9);
  addFieldRow("Nome Completo", data.patient.name, contentWidth);
  addFieldRow("Idade", `${calculateAge(data.patient.birthDate)} anos`, contentWidth / 2);
  addFieldRow("Gênero", data.patient.gender || "N/A", contentWidth / 2);
  addFieldRow("Email", data.patient.email, contentWidth);
  addFieldRow("Telefone", data.patient.phone, contentWidth);
  if (data.patient.cpf) {
    addFieldRow("CPF", data.patient.cpf, contentWidth);
  }
  doc.moveDown(0.5);

  // Treatment Summary
  addSectionTitle("RESUMO DO TRATAMENTO");
  doc.fontSize(9);
  addFieldRow(
    "Início do Tratamento",
    format(new Date(data.treatmentSummary.startDate), "dd/MM/yyyy", { locale: ptBR }),
    contentWidth / 2
  );
  addFieldRow("Total de Sessões", data.treatmentSummary.totalSessions.toString(), contentWidth / 2);
  addFieldRow(
    "Duração",
    `${differenceInMonths(new Date(), new Date(data.treatmentSummary.startDate))} meses`,
    contentWidth / 2
  );
  addFieldRow("Status Atual", data.treatmentSummary.currentStatus, contentWidth / 2);
  doc.moveDown(0.3);

  doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text("Objetivos Principais:");
  data.treatmentSummary.mainObjectives.forEach((obj) => {
    doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(`• ${obj}`, { indent: 15 });
  });
  doc.moveDown(0.3);

  doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text("Técnicas Utilizadas:");
  data.treatmentSummary.techniques.forEach((tech) => {
    doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(`• ${tech}`, { indent: 15 });
  });
  doc.moveDown(0.5);

  // Evolution Analysis
  if (doc.y > pageHeight - 150) {
    doc.addPage();
    addHeader();
  }

  addSectionTitle("ANÁLISE DE EVOLUÇÃO CLÍNICA");
  addBox("Estado Inicial", data.evolutionAnalysis.initialState);
  addBox("Estado Atual", data.evolutionAnalysis.currentState);

  doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text("Melhorias Observadas:");
  data.evolutionAnalysis.improvements.forEach((imp) => {
    doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(`✓ ${imp}`, { indent: 15 });
  });
  doc.moveDown(0.3);

  doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text("Desafios Identificados:");
  data.evolutionAnalysis.challenges.forEach((challenge) => {
    doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(`• ${challenge}`, { indent: 15 });
  });
  doc.moveDown(0.5);

  // Recurring Themes
  if (data.recurringThemes.length > 0) {
    if (doc.y > pageHeight - 120) {
      doc.addPage();
      addHeader();
    }
    addSectionTitle("TEMAS RECORRENTES IDENTIFICADOS");
    data.recurringThemes.forEach((theme) => {
      doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(`• ${theme.theme} (${theme.frequency} ocorrências)`);
    });
    doc.moveDown(0.5);
  }

  // Effective Techniques
  if (data.effectiveTechniques.length > 0) {
    if (doc.y > pageHeight - 120) {
      doc.addPage();
      addHeader();
    }
    addSectionTitle("TÉCNICAS MAIS EFETIVAS");
    data.effectiveTechniques.forEach((tech) => {
      const percentage = (tech.successRate * 100).toFixed(0);
      doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(`• ${tech.technique} (${percentage}% efetividade)`);
    });
    doc.moveDown(0.5);
  }

  // Session Analyses Summary
  if (data.sessionAnalyses.length > 0) {
    if (doc.y > pageHeight - 120) {
      doc.addPage();
      addHeader();
    }
    addSectionTitle("RESUMO DE ANÁLISES DAS SESSÕES");
    doc.fontSize(9).fillColor(colors.secondary).text(`Total de ${data.sessionAnalyses.length} análises registradas`);
    doc.moveDown(0.3);

    data.sessionAnalyses.forEach((analysis) => {
      if (doc.y > pageHeight - 100) {
        doc.addPage();
        addHeader();
      }

      // Session header with background
      doc.rect(margin, doc.y, contentWidth, 20).fill(colors.accent + "20");
      doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.primary).text(
        `Sessão #${analysis.sessionId} - ${format(new Date(analysis.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        margin + 5,
        doc.y + 5
      );
      doc.moveDown(1.5);

      // Session summary
      doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(analysis.summary, { width: contentWidth });
      doc.moveDown(0.2);

      // Themes
      if (analysis.keyThemes && analysis.keyThemes.length > 0) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text("Temas:");
        doc.fontSize(8).font("Helvetica").fillColor(colors.text).text(analysis.keyThemes.join(", "), { width: contentWidth });
        doc.moveDown(0.2);
      }

      // Interventions
      if (analysis.interventions && analysis.interventions.length > 0) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text("Intervenções:");
        doc.fontSize(8).font("Helvetica").fillColor(colors.text).text(analysis.interventions.join(", "), { width: contentWidth });
        doc.moveDown(0.2);
      }

      // AI Suggestions
      if (analysis.aiSuggestions) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.secondary).text("Sugestões IA:");
        doc.fontSize(8).font("Helvetica").fillColor(colors.text).text(analysis.aiSuggestions, { width: contentWidth });
        doc.moveDown(0.3);
      }
    });
    doc.moveDown(0.5);
  }

  // Recommendations
  if (doc.y > pageHeight - 150) {
    doc.addPage();
    addHeader();
  }
  addSectionTitle("RECOMENDAÇÕES PARA PRÓXIMAS SESSÕES");
  addBox("Plano de Ação", data.recommendations);

  // Next Steps
  if (data.evolutionAnalysis.nextSteps.length > 0) {
    addSectionTitle("PRÓXIMOS PASSOS");
    data.evolutionAnalysis.nextSteps.forEach((step) => {
      doc.fontSize(9).font("Helvetica").fillColor(colors.text).text(`→ ${step}`, { indent: 15 });
    });
    doc.moveDown(0.5);
  }

  // Signature Section
  doc.moveDown(1);
  doc.moveTo(margin, doc.y).lineTo(margin + 150, doc.y).stroke(colors.primary);
  doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.primary).text(data.professional.name, margin, doc.y + 8);
  doc.fontSize(9).font("Helvetica").fillColor(colors.secondary).text(`CRP ${data.professional.crp}`, margin, doc.y + 15);
  doc.fontSize(8).font("Helvetica").fillColor(colors.secondary).text(
    format(data.generatedAt, "dd/MM/yyyy", { locale: ptBR }),
    margin,
    doc.y + 20
  );

  // Footer on all pages
  const pages = doc.bufferedPageRange().count;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(colors.secondary).text(
      "DOCUMENTO CONFIDENCIAL - Uso exclusivo do paciente e profissional responsável",
      margin,
      pageHeight - 30,
      { align: "center" }
    );
    doc.fontSize(7).fillColor(colors.border).text(
      `Página ${i + 1} de ${pages} | Gerado em ${format(data.generatedAt, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}`,
      margin,
      pageHeight - 15,
      { align: "center" }
    );
  }

  return doc;
}
