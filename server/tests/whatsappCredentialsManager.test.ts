import { describe, it, expect, beforeEach } from "vitest";
import {
  WhatsAppCredentialsManager,
  WhatsAppWebhookManager,
  WhatsAppAuthOrchestrator,
} from "./whatsappCredentialsManager";

describe("WhatsAppCredentialsManager", () => {
  let manager: WhatsAppCredentialsManager;

  beforeEach(() => {
    manager = new WhatsAppCredentialsManager("test-encryption-key");
  });

  it("deve adicionar credencial com criptografia", () => {
    const credentialId = manager.addCredential({
      id: "test_cred_1",
      accessToken: "test_token_12345",
      phoneNumberId: "123456789",
      businessAccountId: "987654321",
      groupId: "group_123",
      webhookVerifyToken: "verify_token",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
    });

    expect(credentialId).toBe("test_cred_1");
  });

  it("deve recuperar credencial descriptografada", () => {
    manager.addCredential({
      id: "test_cred_2",
      accessToken: "secret_token_xyz",
      phoneNumberId: "111111111",
      businessAccountId: "222222222",
      groupId: "group_456",
      webhookVerifyToken: "verify_xyz",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
    });

    const credential = manager.getCredential("test_cred_2");

    expect(credential).not.toBeNull();
    expect(credential?.accessToken).toBe("secret_token_xyz");
    expect(credential?.phoneNumberId).toBe("111111111");
  });

  it("deve retornar null para credencial inexistente", () => {
    const credential = manager.getCredential("nonexistent");
    expect(credential).toBeNull();
  });

  it("deve listar todas as credenciais", () => {
    manager.addCredential({
      id: "cred_1",
      accessToken: "token_1",
      phoneNumberId: "111",
      businessAccountId: "222",
      groupId: "group_1",
      webhookVerifyToken: "verify_1",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
    });

    manager.addCredential({
      id: "cred_2",
      accessToken: "token_2",
      phoneNumberId: "333",
      businessAccountId: "444",
      groupId: "group_2",
      webhookVerifyToken: "verify_2",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
    });

    const credentials = manager.listCredentials();

    expect(credentials.length).toBe(2);
    expect(credentials).toContain("cred_1");
    expect(credentials).toContain("cred_2");
  });

  it("deve remover credencial", () => {
    manager.addCredential({
      id: "cred_to_remove",
      accessToken: "token",
      phoneNumberId: "111",
      businessAccountId: "222",
      groupId: "group",
      webhookVerifyToken: "verify",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
    });

    const removed = manager.removeCredential("cred_to_remove");

    expect(removed).toBe(true);
    expect(manager.getCredential("cred_to_remove")).toBeNull();
  });

  it("deve renovar token", async () => {
    manager.addCredential({
      id: "cred_renew",
      accessToken: "old_token",
      phoneNumberId: "111",
      businessAccountId: "222",
      groupId: "group",
      webhookVerifyToken: "verify",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
    });

    const renewed = await manager.renewToken("cred_renew", "new_token_xyz");

    expect(renewed).toBe(true);
    const credential = manager.getCredential("cred_renew");
    expect(credential?.accessToken).toBe("new_token_xyz");
  });

  it("deve verificar se credencial está expirada", () => {
    const expiredDate = new Date(Date.now() - 1000); // 1 segundo atrás

    manager.addCredential({
      id: "cred_expired",
      accessToken: "token",
      phoneNumberId: "111",
      businessAccountId: "222",
      groupId: "group",
      webhookVerifyToken: "verify",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
      expiresAt: expiredDate,
    });

    const isExpired = manager.isCredentialExpired("cred_expired");

    expect(isExpired).toBe(true);
  });

  it("deve obter credenciais próximas de expirar", () => {
    const expiringDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias

    manager.addCredential({
      id: "cred_expiring",
      accessToken: "token",
      phoneNumberId: "111",
      businessAccountId: "222",
      groupId: "group",
      webhookVerifyToken: "verify",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
      expiresAt: expiringDate,
    });

    const expiring = manager.getExpiringCredentials(7);

    expect(expiring).toContain("cred_expiring");
  });

  it("deve obter estatísticas de credenciais", () => {
    manager.addCredential({
      id: "cred_1",
      accessToken: "token_1",
      phoneNumberId: "111",
      businessAccountId: "222",
      groupId: "group_1",
      webhookVerifyToken: "verify_1",
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
    });

    const stats = manager.getCredentialStats();

    expect(stats.totalCredentials).toBe(1);
    expect(stats.activeCredentials).toBe(1);
    expect(stats.healthScore).toBeDefined();
  });
});

describe("WhatsAppWebhookManager", () => {
  let manager: WhatsAppWebhookManager;

  beforeEach(() => {
    manager = new WhatsAppWebhookManager();
  });

  it("deve registrar webhook", () => {
    manager.registerWebhook("cred_1", "https://example.com/webhook");

    expect(manager.getWebhookStats().registeredWebhooks).toBe(1);
  });

  it("deve processar evento de webhook", () => {
    const processed = manager.processWebhookEvent("cred_1", "message", {
      from: "5511999999999",
      text: "Olá!",
    });

    expect(processed).toBe(true);
    expect(manager.getWebhookStats().totalEvents).toBe(1);
  });

  it("deve obter eventos recentes", () => {
    manager.processWebhookEvent("cred_1", "message", { text: "msg1" });
    manager.processWebhookEvent("cred_1", "message", { text: "msg2" });
    manager.processWebhookEvent("cred_1", "status", { status: "read" });

    const recent = manager.getRecentEvents(10);

    expect(recent.length).toBe(3);
  });

  it("deve obter eventos por tipo", () => {
    manager.processWebhookEvent("cred_1", "message", { text: "msg1" });
    manager.processWebhookEvent("cred_1", "message", { text: "msg2" });
    manager.processWebhookEvent("cred_1", "status", { status: "read" });

    const messages = manager.getEventsByType("message");

    expect(messages.length).toBe(2);
  });

  it("deve limpar eventos antigos", () => {
    manager.processWebhookEvent("cred_1", "message", { text: "msg" });

    const removed = manager.clearOldEvents(0); // 0 horas = remove tudo

    expect(removed).toBeGreaterThan(0);
  });

  it("deve obter estatísticas de webhooks", () => {
    manager.registerWebhook("cred_1", "https://example.com/webhook");
    manager.processWebhookEvent("cred_1", "message", { text: "msg" });
    manager.processWebhookEvent("cred_1", "status", { status: "read" });

    const stats = manager.getWebhookStats();

    expect(stats.totalEvents).toBe(2);
    expect(stats.registeredWebhooks).toBe(1);
    expect(stats.eventTypes).toContain("message");
    expect(stats.eventTypes).toContain("status");
  });
});

describe("WhatsAppAuthOrchestrator", () => {
  let orchestrator: WhatsAppAuthOrchestrator;

  beforeEach(() => {
    orchestrator = new WhatsAppAuthOrchestrator("test-key");
  });

  it("deve configurar credencial completa", () => {
    const credentialId = orchestrator.setupCredential(
      "test_token",
      "123456789",
      "987654321",
      "group_123",
      "verify_token",
      "https://example.com/webhook"
    );

    expect(credentialId).toBeDefined();
    expect(credentialId).toContain("whatsapp_");
  });

  it("deve obter gerenciador de credenciais", () => {
    const manager = orchestrator.getCredentialsManager();

    expect(manager).toBeDefined();
  });

  it("deve obter gerenciador de webhooks", () => {
    const manager = orchestrator.getWebhookManager();

    expect(manager).toBeDefined();
  });

  it("deve obter health check completo", () => {
    orchestrator.setupCredential(
      "test_token",
      "123456789",
      "987654321",
      "group_123",
      "verify_token",
      "https://example.com/webhook"
    );

    const health = orchestrator.getHealthCheck();

    expect(health.credentials).toBeDefined();
    expect(health.webhooks).toBeDefined();
    expect(health.timestamp).toBeInstanceOf(Date);
  });
});
