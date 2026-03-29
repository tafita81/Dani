/**
 * Gerenciador Seguro de Credenciais do WhatsApp
 * Armazena e gerencia tokens com criptografia
 */

import crypto from "crypto";

interface WhatsAppCredential {
  id: string;
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  groupId: string;
  webhookVerifyToken: string;
  isActive: boolean;
  createdAt: Date;
  lastValidated: Date;
  expiresAt?: Date;
}

interface EncryptedCredential {
  id: string;
  encryptedData: string;
  iv: string;
  salt: string;
  createdAt: Date;
}

export class WhatsAppCredentialsManager {
  private credentials: Map<string, EncryptedCredential> = new Map();
  private encryptionKey: string;

  constructor(encryptionKey?: string) {
    this.encryptionKey =
      encryptionKey || process.env.WHATSAPP_ENCRYPTION_KEY || "default-key-change-in-production";
  }

  /**
   * Criptografar credencial
   */
  private encryptCredential(credential: WhatsAppCredential): EncryptedCredential {
    const salt = crypto.randomBytes(16).toString("hex");
    const iv = crypto.randomBytes(16);

    // Derivar chave usando PBKDF2
    const derivedKey = crypto.pbkdf2Sync(
      this.encryptionKey + salt,
      salt,
      100000,
      32,
      "sha256"
    );

    const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);

    const credentialJson = JSON.stringify(credential);
    let encrypted = cipher.update(credentialJson, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      id: credential.id,
      encryptedData: encrypted + authTag.toString("hex"),
      iv: iv.toString("hex"),
      salt,
      createdAt: new Date(),
    };
  }

  /**
   * Descriptografar credencial
   */
  private decryptCredential(encrypted: EncryptedCredential): WhatsAppCredential {
    const salt = encrypted.salt;
    const iv = Buffer.from(encrypted.iv, "hex");

    // Derivar chave usando mesma salt
    const derivedKey = crypto.pbkdf2Sync(
      this.encryptionKey + salt,
      salt,
      100000,
      32,
      "sha256"
    );

    // Separar authTag dos dados criptografados
    const encryptedData = encrypted.encryptedData.slice(0, -32);
    const authTag = Buffer.from(encrypted.encryptedData.slice(-32), "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  }

  /**
   * Adicionar credencial do WhatsApp
   */
  addCredential(credential: WhatsAppCredential): string {
    const encrypted = this.encryptCredential(credential);
    this.credentials.set(credential.id, encrypted);
    console.log(`✅ Credencial WhatsApp adicionada: ${credential.id}`);
    return credential.id;
  }

  /**
   * Obter credencial descriptografada
   */
  getCredential(credentialId: string): WhatsAppCredential | null {
    const encrypted = this.credentials.get(credentialId);
    if (!encrypted) return null;

    try {
      return this.decryptCredential(encrypted);
    } catch (error) {
      console.error("Erro ao descriptografar credencial:", error);
      return null;
    }
  }

  /**
   * Validar token do WhatsApp
   */
  async validateToken(credentialId: string): Promise<boolean> {
    const credential = this.getCredential(credentialId);
    if (!credential) return false;

    try {
      // Aqui você faria uma chamada real à API do WhatsApp
      // Para validar o token
      const response = await fetch(
        `https://graph.instagram.com/v18.0/me?access_token=${credential.accessToken}`
      );

      if (response.ok) {
        // Atualizar lastValidated
        credential.lastValidated = new Date();
        this.addCredential(credential);
        console.log(`✅ Token validado: ${credentialId}`);
        return true;
      }

      console.error(`❌ Token inválido: ${credentialId}`);
      return false;
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return false;
    }
  }

  /**
   * Renovar token do WhatsApp
   */
  async renewToken(credentialId: string, newAccessToken: string): Promise<boolean> {
    const credential = this.getCredential(credentialId);
    if (!credential) return false;

    credential.accessToken = newAccessToken;
    credential.lastValidated = new Date();

    // Token de longa duração expira em 60 dias
    credential.expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    this.addCredential(credential);
    console.log(`✅ Token renovado: ${credentialId}`);
    return true;
  }

  /**
   * Listar todas as credenciais (apenas IDs)
   */
  listCredentials(): string[] {
    return Array.from(this.credentials.keys());
  }

  /**
   * Remover credencial
   */
  removeCredential(credentialId: string): boolean {
    const removed = this.credentials.delete(credentialId);
    if (removed) {
      console.log(`✅ Credencial removida: ${credentialId}`);
    }
    return removed;
  }

  /**
   * Verificar se credencial está expirada
   */
  isCredentialExpired(credentialId: string): boolean {
    const credential = this.getCredential(credentialId);
    if (!credential || !credential.expiresAt) return false;

    return new Date() > credential.expiresAt;
  }

  /**
   * Obter credenciais próximas de expirar
   */
  getExpiringCredentials(daysThreshold: number = 7): string[] {
    const expiringCredentials: string[] = [];
    const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);

    this.credentials.forEach((encrypted, id) => {
      try {
        const credential = this.decryptCredential(encrypted);
        if (
          credential.expiresAt &&
          credential.expiresAt <= thresholdDate &&
          credential.expiresAt > new Date()
        ) {
          expiringCredentials.push(id);
        }
      } catch (error) {
        console.error(`Erro ao verificar expiração de ${id}:`, error);
      }
    });

    return expiringCredentials;
  }

  /**
   * Obter estatísticas de credenciais
   */
  getCredentialStats(): Record<string, any> {
    let totalCredentials = this.credentials.size;
    let activeCredentials = 0;
    let expiredCredentials = 0;
    let expiringCredentials = 0;

    this.credentials.forEach((encrypted) => {
      try {
        const credential = this.decryptCredential(encrypted);
        if (credential.isActive) activeCredentials++;
        if (this.isCredentialExpired(credential.id)) expiredCredentials++;
      } catch (error) {
        console.error("Erro ao processar credencial:", error);
      }
    });

    expiringCredentials = this.getExpiringCredentials(7).length;

    return {
      totalCredentials,
      activeCredentials,
      expiredCredentials,
      expiringCredentials,
      healthScore: (
        ((totalCredentials - expiredCredentials) / totalCredentials) *
        100
      ).toFixed(2),
    };
  }
}

/**
 * Gerenciador de Webhooks do WhatsApp
 */
export class WhatsAppWebhookManager {
  private webhookEndpoints: Map<string, string> = new Map();
  private webhookEvents: Array<{
    timestamp: Date;
    event: string;
    credentialId: string;
    data: any;
  }> = [];

  /**
   * Registrar endpoint de webhook
   */
  registerWebhook(credentialId: string, endpoint: string): void {
    this.webhookEndpoints.set(credentialId, endpoint);
    console.log(`✅ Webhook registrado: ${credentialId} → ${endpoint}`);
  }

  /**
   * Processar evento de webhook
   */
  processWebhookEvent(
    credentialId: string,
    event: string,
    data: any
  ): boolean {
    try {
      this.webhookEvents.push({
        timestamp: new Date(),
        event,
        credentialId,
        data,
      });

      console.log(`📨 Evento webhook processado: ${event}`);
      return true;
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      return false;
    }
  }

  /**
   * Obter eventos de webhook recentes
   */
  getRecentEvents(limit: number = 50): Array<{
    timestamp: Date;
    event: string;
    credentialId: string;
    data: any;
  }> {
    return this.webhookEvents.slice(-limit).reverse();
  }

  /**
   * Obter eventos por tipo
   */
  getEventsByType(eventType: string): Array<{
    timestamp: Date;
    event: string;
    credentialId: string;
    data: any;
  }> {
    return this.webhookEvents.filter((e) => e.event === eventType);
  }

  /**
   * Limpar eventos antigos
   */
  clearOldEvents(hoursThreshold: number = 24): number {
    const cutoffTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
    const initialLength = this.webhookEvents.length;

    this.webhookEvents = this.webhookEvents.filter((e) => e.timestamp > cutoffTime);

    const removed = initialLength - this.webhookEvents.length;
    console.log(`🗑️ ${removed} eventos antigos removidos`);

    return removed;
  }

  /**
   * Obter estatísticas de webhooks
   */
  getWebhookStats(): Record<string, any> {
    const eventCounts: Record<string, number> = {};

    this.webhookEvents.forEach((event) => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    });

    return {
      totalEvents: this.webhookEvents.length,
      registeredWebhooks: this.webhookEndpoints.size,
      eventTypes: Object.keys(eventCounts),
      eventCounts,
      lastEvent: this.webhookEvents[this.webhookEvents.length - 1]?.timestamp,
    };
  }
}

/**
 * Orquestrador de Credenciais e Webhooks
 */
export class WhatsAppAuthOrchestrator {
  private credentialsManager: WhatsAppCredentialsManager;
  private webhookManager: WhatsAppWebhookManager;

  constructor(encryptionKey?: string) {
    this.credentialsManager = new WhatsAppCredentialsManager(encryptionKey);
    this.webhookManager = new WhatsAppWebhookManager();
  }

  /**
   * Configurar credencial completa
   */
  setupCredential(
    accessToken: string,
    phoneNumberId: string,
    businessAccountId: string,
    groupId: string,
    webhookVerifyToken: string,
    webhookEndpoint: string
  ): string {
    const credentialId = `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const credential: WhatsAppCredential = {
      id: credentialId,
      accessToken,
      phoneNumberId,
      businessAccountId,
      groupId,
      webhookVerifyToken,
      isActive: true,
      createdAt: new Date(),
      lastValidated: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    };

    this.credentialsManager.addCredential(credential);
    this.webhookManager.registerWebhook(credentialId, webhookEndpoint);

    console.log(`✅ Credencial WhatsApp configurada: ${credentialId}`);
    return credentialId;
  }

  /**
   * Obter gerenciador de credenciais
   */
  getCredentialsManager(): WhatsAppCredentialsManager {
    return this.credentialsManager;
  }

  /**
   * Obter gerenciador de webhooks
   */
  getWebhookManager(): WhatsAppWebhookManager {
    return this.webhookManager;
  }

  /**
   * Obter health check completo
   */
  getHealthCheck(): Record<string, any> {
    return {
      credentials: this.credentialsManager.getCredentialStats(),
      webhooks: this.webhookManager.getWebhookStats(),
      timestamp: new Date(),
    };
  }
}
