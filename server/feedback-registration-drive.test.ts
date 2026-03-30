import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateFeedbackAnalytics,
  generateFeedbackMessage,
  getRecommendation,
  validateFeedback,
  generateFeedbackReport,
  SessionFeedback,
} from "./feedbackService";
import {
  createPatientFolderStructure,
  uploadFileToGoogleDrive,
  listPatientFiles,
  sharePatientFolderWithTherapist,
  backupPatientDocuments,
  generateDocumentReport,
  syncDocumentsWithGoogleDrive,
  validateGoogleDriveIntegration,
} from "./googleDriveService";

describe("Feedback Service", () => {
  const mockFeedbacks: SessionFeedback[] = [
    {
      id: "feedback-1",
      appointmentId: "apt-1",
      patientId: "patient-1",
      therapistId: "therapist-1",
      rating: 5,
      comment: "Excelente sessão, muito produtiva!",
      categories: {
        communication: 5,
        effectiveness: 5,
        environment: 5,
        professionalism: 5,
      },
      createdAt: new Date("2026-03-20"),
      updatedAt: new Date("2026-03-20"),
    },
    {
      id: "feedback-2",
      appointmentId: "apt-2",
      patientId: "patient-1",
      therapistId: "therapist-1",
      rating: 4,
      comment: "Boa sessão, mas poderia melhorar o tempo",
      categories: {
        communication: 4,
        effectiveness: 4,
        environment: 4,
        professionalism: 5,
      },
      createdAt: new Date("2026-03-22"),
      updatedAt: new Date("2026-03-22"),
    },
    {
      id: "feedback-3",
      appointmentId: "apt-3",
      patientId: "patient-1",
      therapistId: "therapist-1",
      rating: 5,
      comment: "Perfeito!",
      categories: {
        communication: 5,
        effectiveness: 5,
        environment: 5,
        professionalism: 5,
      },
      createdAt: new Date("2026-03-25"),
      updatedAt: new Date("2026-03-25"),
    },
  ];

  describe("Analytics Calculation", () => {
    it("deve calcular média de ratings corretamente", () => {
      const analytics = calculateFeedbackAnalytics(mockFeedbacks);

      expect(analytics.averageRating).toBeCloseTo((5 + 4 + 5) / 3, 1);
      expect(analytics.totalFeedback).toBe(3);
    });

    it("deve calcular distribuição de ratings", () => {
      const analytics = calculateFeedbackAnalytics(mockFeedbacks);

      expect(analytics.ratingDistribution[5]).toBe(2);
      expect(analytics.ratingDistribution[4]).toBe(1);
    });

    it("deve calcular médias de categorias", () => {
      const analytics = calculateFeedbackAnalytics(mockFeedbacks);

      expect(analytics.categoryAverages.communication).toBeGreaterThan(0);
      expect(analytics.categoryAverages.effectiveness).toBeGreaterThan(0);
      expect(analytics.categoryAverages.environment).toBeGreaterThan(0);
      expect(analytics.categoryAverages.professionalism).toBeGreaterThan(0);
    });

    it("deve detectar tendência de melhoria", () => {
      const analytics = calculateFeedbackAnalytics(mockFeedbacks);

      expect(["improving", "stable", "declining"]).toContain(analytics.trend);
    });

    it("deve retornar comentários principais", () => {
      const analytics = calculateFeedbackAnalytics(mockFeedbacks);

      expect(analytics.topComments.length).toBeGreaterThan(0);
      expect(analytics.topComments.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Feedback Messages", () => {
    it("deve gerar mensagem para rating 5", () => {
      const message = generateFeedbackMessage(5);

      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(0);
    });

    it("deve gerar mensagem para rating 1", () => {
      const message = generateFeedbackMessage(1);

      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(0);
    });

    it("mensagens devem variar", () => {
      const messages = new Set();

      for (let i = 0; i < 10; i++) {
        messages.add(generateFeedbackMessage(5));
      }

      expect(messages.size).toBeGreaterThan(1);
    });
  });

  describe("Recommendations", () => {
    it("deve recomendar manutenção para rating alto", () => {
      const analytics = calculateFeedbackAnalytics(mockFeedbacks);
      const recommendation = getRecommendation(analytics);

      expect(recommendation).toBeTruthy();
      expect(recommendation.length).toBeGreaterThan(0);
    });

    it("deve recomendar melhoria para rating baixo", () => {
      const lowFeedbacks: SessionFeedback[] = [
        {
          id: "feedback-low",
          appointmentId: "apt-low",
          patientId: "patient-low",
          therapistId: "therapist-1",
          rating: 2,
          comment: "Não gostei",
          categories: {
            communication: 2,
            effectiveness: 2,
            environment: 2,
            professionalism: 2,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const analytics = calculateFeedbackAnalytics(lowFeedbacks);
      const recommendation = getRecommendation(analytics);

      expect(recommendation).toContain("abaixo");
    });
  });

  describe("Validation", () => {
    it("deve validar feedback completo", () => {
      const feedback: Partial<SessionFeedback> = {
        appointmentId: "apt-1",
        patientId: "patient-1",
        rating: 5,
        categories: {
          communication: 5,
          effectiveness: 5,
          environment: 5,
          professionalism: 5,
        },
      };

      const result = validateFeedback(feedback);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("deve rejeitar rating inválido", () => {
      const feedback: Partial<SessionFeedback> = {
        appointmentId: "apt-1",
        patientId: "patient-1",
        rating: 10,
        categories: {
          communication: 5,
          effectiveness: 5,
          environment: 5,
          professionalism: 5,
        },
      };

      const result = validateFeedback(feedback);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("deve rejeitar comentário muito longo", () => {
      const feedback: Partial<SessionFeedback> = {
        appointmentId: "apt-1",
        patientId: "patient-1",
        rating: 5,
        comment: "a".repeat(501),
        categories: {
          communication: 5,
          effectiveness: 5,
          environment: 5,
          professionalism: 5,
        },
      };

      const result = validateFeedback(feedback);

      expect(result.valid).toBe(false);
    });
  });

  describe("Report Generation", () => {
    it("deve gerar relatório de feedback", () => {
      const analytics = calculateFeedbackAnalytics(mockFeedbacks);
      const report = generateFeedbackReport(analytics);

      expect(report).toContain("RELATÓRIO DE FEEDBACK");
      expect(report).toContain("Avaliação Média");
      expect(report).toContain("Distribuição de Ratings");
    });
  });
});

describe("Google Drive Service", () => {
  describe("Folder Structure", () => {
    it("deve criar estrutura de pastas para paciente", async () => {
      const structure = await createPatientFolderStructure("patient-123", "João Silva");

      expect(structure.patientId).toBe("patient-123");
      expect(structure.patientName).toBe("João Silva");
      expect(structure.folderId).toBeTruthy();
      expect(structure.subfolders).toHaveProperty("documents");
      expect(structure.subfolders).toHaveProperty("sessionNotes");
      expect(structure.subfolders).toHaveProperty("reports");
      expect(structure.subfolders).toHaveProperty("forms");
      expect(structure.subfolders).toHaveProperty("audio");
    });

    it("deve ter datas de criação e atualização", async () => {
      const structure = await createPatientFolderStructure("patient-123", "João Silva");

      expect(structure.createdAt).toBeInstanceOf(Date);
      expect(structure.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("File Upload", () => {
    it("deve fazer upload de arquivo", async () => {
      const mockFile = new File(["test content"], "test.pdf", { type: "application/pdf" });

      const result = await uploadFileToGoogleDrive(mockFile, "folder-123", "cpf");

      expect(result.id).toBeTruthy();
      expect(result.name).toContain("cpf");
      expect(result.mimeType).toBe("application/pdf");
      expect(result.size).toBe(12);
      expect(result.webViewLink).toBeTruthy();
      expect(result.downloadLink).toBeTruthy();
    });

    it("deve suportar múltiplos tipos de documento", async () => {
      const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });
      const documentTypes: Array<
        "cpf" | "rg" | "address_proof" | "session_note" | "report" | "form" | "audio"
      > = ["cpf", "rg", "address_proof", "session_note", "report", "form", "audio"];

      for (const docType of documentTypes) {
        const result = await uploadFileToGoogleDrive(mockFile, "folder-123", docType);
        expect(result.name).toContain(docType);
      }
    });
  });

  describe("File Listing", () => {
    it("deve listar arquivos de um paciente", async () => {
      const files = await listPatientFiles("folder-123");

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      expect(files[0]).toHaveProperty("id");
      expect(files[0]).toHaveProperty("name");
      expect(files[0]).toHaveProperty("mimeType");
    });

    it("deve filtrar arquivos por tipo", async () => {
      const files = await listPatientFiles("folder-123", "cpf");

      expect(files.every((f) => f.name.includes("cpf"))).toBe(true);
    });
  });

  describe("Sharing", () => {
    it("deve compartilhar pasta com terapeuta", async () => {
      const result = await sharePatientFolderWithTherapist(
        "folder-123",
        "terapeuta@email.com"
      );

      expect(result).toBe(true);
    });
  });

  describe("Backup", () => {
    it("deve fazer backup de documentos", async () => {
      const backup = await backupPatientDocuments("patient-123");

      expect(backup.totalFiles).toBeGreaterThan(0);
      expect(backup.totalSize).toBeGreaterThan(0);
      expect(backup.backupDate).toBeInstanceOf(Date);
    });
  });

  describe("Reports", () => {
    it("deve gerar relatório de documentos", async () => {
      const report = await generateDocumentReport("patient-123");

      expect(report).toContain("RELATÓRIO DE DOCUMENTOS");
      expect(report).toContain("Paciente ID");
      expect(report).toContain("Total de Arquivos");
    });
  });

  describe("Synchronization", () => {
    it("deve sincronizar documentos com Google Drive", async () => {
      const sync = await syncDocumentsWithGoogleDrive("patient-123");

      expect(sync.synced).toBeGreaterThanOrEqual(0);
      expect(sync.failed).toBeGreaterThanOrEqual(0);
      expect(sync.lastSync).toBeInstanceOf(Date);
    });
  });

  describe("Integration Validation", () => {
    it("deve validar integração com Google Drive", async () => {
      const validation = await validateGoogleDriveIntegration();

      expect(validation.connected).toBe(true);
      expect(validation.quota).toHaveProperty("used");
      expect(validation.quota).toHaveProperty("total");
      expect(validation.status).toBeTruthy();
    });

    it("deve retornar informações de quota", async () => {
      const validation = await validateGoogleDriveIntegration();

      expect(validation.quota.used).toBeLessThanOrEqual(validation.quota.total);
      expect(validation.quota.used).toBeGreaterThan(0);
    });
  });
});
