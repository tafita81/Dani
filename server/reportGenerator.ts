import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { storagePut } from "./storage";

export interface SessionReport {
  patientName: string;
  sessionDate: Date;
  sessionDuration: number; // em minutos
  sessionNotes: string;
  transcription: string;
  clinicalInsights: string[];
  suggestedTechniques: string[];
  emotionalState: string;
  riskLevel: "low" | "medium" | "high";
  nextSteps: string[];
  therapistNotes?: string;
  attachmentUrl?: string;
}

/**
 * Gera relatório em PDF para a sessão
 */
export async function generateSessionReport(
  report: SessionReport
): Promise<{ url: string; fileName: string }> {
  try {
    // Criar documento PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // Tamanho letter

    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Função auxiliar para adicionar texto
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color = rgb(0, 0, 0)) => {
      if (yPosition < 50) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      page.drawText(text, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color,
        font: isBold ? undefined : undefined, // Usar fonte padrão
      });

      yPosition -= fontSize + 10;
    };

    // Header
    addText("RELATÓRIO DE SESSÃO CLÍNICA", 16, true, rgb(0, 51, 102));
    addText("Psicóloga Daniela Coelho", 12, true);
    yPosition -= 10;

    // Informações da sessão
    addText(`Data: ${report.sessionDate.toLocaleDateString("pt-BR")}`, 11);
    addText(`Paciente: ${report.patientName}`, 11);
    addText(`Duração: ${report.sessionDuration} minutos`, 11);
    addText(`Nível de Risco: ${report.riskLevel.toUpperCase()}`, 11, true, report.riskLevel === "high" ? rgb(255, 0, 0) : rgb(0, 0, 0));
    yPosition -= 15;

    // Notas da sessão
    addText("NOTAS DA SESSÃO", 13, true);
    addText(report.sessionNotes, 11);
    yPosition -= 15;

    // Estado emocional
    addText("ESTADO EMOCIONAL", 13, true);
    addText(report.emotionalState, 11);
    yPosition -= 15;

    // Insights clínicos
    if (report.clinicalInsights.length > 0) {
      addText("INSIGHTS CLÍNICOS", 13, true);
      report.clinicalInsights.forEach((insight) => {
        addText(`• ${insight}`, 11);
      });
      yPosition -= 10;
    }

    // Técnicas sugeridas
    if (report.suggestedTechniques.length > 0) {
      addText("TÉCNICAS RECOMENDADAS", 13, true);
      report.suggestedTechniques.forEach((technique) => {
        addText(`• ${technique}`, 11);
      });
      yPosition -= 10;
    }

    // Próximos passos
    if (report.nextSteps.length > 0) {
      addText("PRÓXIMOS PASSOS", 13, true);
      report.nextSteps.forEach((step) => {
        addText(`• ${step}`, 11);
      });
      yPosition -= 10;
    }

    // Notas do terapeuta
    if (report.therapistNotes) {
      addText("NOTAS DO TERAPEUTA", 13, true);
      addText(report.therapistNotes, 11);
      yPosition -= 15;
    }

    // Footer
    yPosition = 30;
    addText(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 9);
    addText("Documento confidencial - Uso restrito", 9);

    // Salvar PDF
    const pdfBytes = await pdfDoc.save();

    // Upload para S3
    const fileName = `relatorio-${report.patientName.replace(/\s+/g, "-").toLowerCase()}-${report.sessionDate.getTime()}.pdf`;
    const { url } = await storagePut(`relatorios/${fileName}`, pdfBytes, "application/pdf");

    return { url, fileName };
  } catch (error) {
    console.error("Erro ao gerar relatório PDF:", error);
    throw error;
  }
}

/**
 * Gera relatório de evolução clínica (múltiplas sessões)
 */
export async function generateEvolutionReport(
  patientName: string,
  sessions: SessionReport[],
  startDate: Date,
  endDate: Date
): Promise<{ url: string; fileName: string }> {
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Função auxiliar
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      if (yPosition < 50) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      page.drawText(text, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      yPosition -= fontSize + 10;
    };

    // Header
    addText("RELATÓRIO DE EVOLUÇÃO CLÍNICA", 16, true);
    addText(`Paciente: ${patientName}`, 12, true);
    addText(`Período: ${startDate.toLocaleDateString("pt-BR")} a ${endDate.toLocaleDateString("pt-BR")}`, 11);
    addText(`Total de Sessões: ${sessions.length}`, 11);
    yPosition -= 15;

    // Resumo estatístico
    addText("RESUMO ESTATÍSTICO", 13, true);
    const totalMinutes = sessions.reduce((sum, s) => sum + s.sessionDuration, 0);
    const avgMinutes = Math.round(totalMinutes / sessions.length);
    const highRiskCount = sessions.filter((s) => s.riskLevel === "high").length;

    addText(`Duração Total: ${totalMinutes} minutos`, 11);
    addText(`Duração Média: ${avgMinutes} minutos por sessão`, 11);
    addText(`Sessões com Risco Alto: ${highRiskCount}`, 11);
    yPosition -= 15;

    // Técnicas mais utilizadas
    const techniqueFrequency: Record<string, number> = {};
    sessions.forEach((session) => {
      session.suggestedTechniques.forEach((technique) => {
        techniqueFrequency[technique] = (techniqueFrequency[technique] || 0) + 1;
      });
    });

    addText("TÉCNICAS MAIS UTILIZADAS", 13, true);
    Object.entries(techniqueFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([technique, count]) => {
        addText(`• ${technique}: ${count} vezes`, 11);
      });
    yPosition -= 15;

    // Evolução de risco
    addText("EVOLUÇÃO DO NÍVEL DE RISCO", 13, true);
    sessions.forEach((session) => {
      const riskColor = session.riskLevel === "high" ? "🔴" : session.riskLevel === "medium" ? "🟡" : "🟢";
      addText(`${riskColor} ${session.sessionDate.toLocaleDateString("pt-BR")}: ${session.riskLevel.toUpperCase()}`, 11);
    });
    yPosition -= 15;

    // Recomendações finais
    addText("RECOMENDAÇÕES FINAIS", 13, true);
    addText("Continuar acompanhamento com foco em técnicas de manejo de ansiedade.", 11);
    addText("Avaliar necessidade de encaminhamento para psiquiatria se sintomas persistirem.", 11);
    addText("Agendar próxima sessão em 1 semana.", 11);

    // Salvar PDF
    const pdfBytes = await pdfDoc.save();

    // Upload para S3
    const fileName = `evolucao-${patientName.replace(/\s+/g, "-").toLowerCase()}-${new Date().getTime()}.pdf`;
    const { url } = await storagePut(`relatorios/${fileName}`, pdfBytes, "application/pdf");

    return { url, fileName };
  } catch (error) {
    console.error("Erro ao gerar relatório de evolução:", error);
    throw error;
  }
}

/**
 * Gera resumo de sessão em formato estruturado
 */
export function generateSessionSummary(report: SessionReport): string {
  return `
RESUMO DA SESSÃO
================

Paciente: ${report.patientName}
Data: ${report.sessionDate.toLocaleDateString("pt-BR")}
Duração: ${report.sessionDuration} minutos
Nível de Risco: ${report.riskLevel}

NOTAS:
${report.sessionNotes}

ESTADO EMOCIONAL:
${report.emotionalState}

INSIGHTS CLÍNICOS:
${report.clinicalInsights.map((i) => `- ${i}`).join("\n")}

TÉCNICAS RECOMENDADAS:
${report.suggestedTechniques.map((t) => `- ${t}`).join("\n")}

PRÓXIMOS PASSOS:
${report.nextSteps.map((s) => `- ${s}`).join("\n")}

${report.therapistNotes ? `NOTAS DO TERAPEUTA:\n${report.therapistNotes}` : ""}
  `.trim();
}
