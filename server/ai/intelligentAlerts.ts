/**
 * Sistema de Alertas Inteligentes
 * Detecta sinais de risco durante consultas e alerta a psicóloga em tempo real
 */

// Imports removidos para evitar conflitos de tipo

export interface RiskAlert {
  id: string;
  sessionId: string;
  patientId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  signalType:
    | "suicidal_ideation"
    | "self_harm"
    | "substance_abuse"
    | "violence"
    | "severe_anxiety"
    | "severe_depression"
    | "psychotic_symptoms"
    | "other";
  description: string;
  transcript: string;
  timestamp: Date;
  acknowledged: boolean;
  actionTaken?: string;
}

/**
 * Palavras-chave para detecção de sinais de risco
 */
const riskKeywords = {
  suicidal_ideation: [
    "morrer",
    "suicídio",
    "me matar",
    "não quero viver",
    "melhor morrer",
    "acabar com isso",
    "desaparecer",
    "não aguento mais",
  ],
  self_harm: [
    "me cortar",
    "arranhar",
    "bater",
    "machucar",
    "ferida",
    "sangue",
    "cicatriz",
  ],
  substance_abuse: [
    "droga",
    "álcool",
    "cocaína",
    "maconha",
    "bebida",
    "viciado",
    "dependência",
  ],
  violence: [
    "bater",
    "agredir",
    "violência",
    "arma",
    "faca",
    "matar",
    "atacar",
  ],
  severe_anxiety: [
    "pânico",
    "ataque de pânico",
    "sufocação",
    "coração acelerado",
    "desespero",
    "terror",
  ],
  severe_depression: [
    "sem esperança",
    "vazio",
    "nada importa",
    "inútil",
    "fracasso",
    "culpa",
  ],
  psychotic_symptoms: [
    "vozes",
    "alucinação",
    "perseguição",
    "conspiração",
    "realidade",
    "controle mental",
  ],
};

/**
 * Detecta sinais de risco na transcrição
 */
export function detectRiskSignals(transcript: string): {
  riskLevel: "low" | "medium" | "high" | "critical";
  signals: Array<{ type: string; severity: string; count: number }>;
} {
  const detectedSignals: Array<{ type: string; severity: string; count: number }> = [];
  const lowerTranscript = transcript.toLowerCase();

  // Verificar cada tipo de sinal
  for (const [signalType, keywords] of Object.entries(riskKeywords)) {
    let count = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerTranscript.match(regex);
      if (matches) {
        count += matches.length;
      }
    }

    if (count > 0) {
      detectedSignals.push({
        type: signalType,
        severity: count >= 3 ? "high" : count >= 2 ? "medium" : "low",
        count,
      });
    }
  }

  // Determinar nível de risco geral
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";

  const highSeverityCount = detectedSignals.filter(
    (s) => s.severity === "high"
  ).length;
  const mediumSeverityCount = detectedSignals.filter(
    (s) => s.severity === "medium"
  ).length;

  if (highSeverityCount >= 2 || detectedSignals.some((s) => s.type === "suicidal_ideation" && s.severity === "high")) {
    riskLevel = "critical";
  } else if (highSeverityCount >= 1) {
    riskLevel = "high";
  } else if (mediumSeverityCount >= 2) {
    riskLevel = "medium";
  } else if (detectedSignals.length > 0) {
    riskLevel = "low";
  }

  return {
    riskLevel,
    signals: detectedSignals,
  };
}

/**
 * Cria alerta de risco no banco de dados
 */
export async function createRiskAlert(
  sessionId: string,
  patientId: string,
  riskLevel: "low" | "medium" | "high" | "critical",
  signalType: RiskAlert["signalType"],
  description: string,
  transcript: string
): Promise<RiskAlert> {
  const alert: RiskAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    patientId,
    riskLevel,
    signalType,
    description,
    transcript,
    timestamp: new Date(),
    acknowledged: false,
  };

  // Aqui você salvaria no banco de dados
  // await db.insert(riskAlerts).values(alert);

  console.log(`[RISK ALERT] ${riskLevel.toUpperCase()}: ${description}`);

  // Se crítico, notificar imediatamente
  if (riskLevel === "critical") {
    await notifyPsychologistUrgent(alert);
  }

  return alert;
}

/**
 * Notifica psicóloga com urgência
 */
async function notifyPsychologistUrgent(alert: RiskAlert): Promise<void> {
  // Aqui você implementaria notificações push, SMS, email, etc.
  console.log(`[URGENT NOTIFICATION] Alerta crítico para psicóloga:`, alert);

  // Exemplo: enviar via sistema de notificações
  // await sendUrgentNotification({
  //   title: "⚠️ ALERTA DE RISCO CRÍTICO",
  //   message: alert.description,
  //   priority: "high",
  // });
}

/**
 * Marca alerta como reconhecido
 */
export async function acknowledgeAlert(
  alertId: string,
  actionTaken?: string
): Promise<void> {
  console.log(`[ALERT ACKNOWLEDGED] ${alertId}`, actionTaken);
  // Aqui você atualizaria no banco de dados
  // await db.update(riskAlerts)
  //   .set({ acknowledged: true, actionTaken })
  //   .where(eq(riskAlerts.id, alertId));
}

/**
 * Gera recomendações de ação para alerta
 */
export function getAlertRecommendations(
  signalType: RiskAlert["signalType"],
  riskLevel: string
): string[] {
  const recommendations: Record<string, string[]> = {
    suicidal_ideation: [
      "Contactar CVV (188) ou CAPS mais próximo",
      "Avaliar plano e meios de suicídio",
      "Encaminhar para psiquiatra",
      "Considerar internação se risco iminente",
      "Estabelecer contato com rede de apoio do paciente",
    ],
    self_harm: [
      "Explorar gatilhos e funções do comportamento",
      "Ensinar técnicas de tolerância ao sofrimento",
      "Envolver rede de apoio",
      "Considerar referência psiquiátrica",
    ],
    substance_abuse: [
      "Avaliar padrão de uso",
      "Encaminhar para especialista em dependência",
      "Explorar motivação para mudança",
      "Envolver família se possível",
    ],
    violence: [
      "Avaliar risco para vítima",
      "Notificar autoridades se necessário",
      "Explorar alternativas não-violentas",
      "Considerar referência psiquiátrica",
    ],
    severe_anxiety: [
      "Ensinar técnicas de respiração",
      "Praticar exposição gradual",
      "Considerar medicação",
      "Validar experiência do paciente",
    ],
    severe_depression: [
      "Avaliar risco de suicídio",
      "Aumentar frequência de sessões",
      "Envolver rede de apoio",
      "Considerar referência psiquiátrica",
    ],
    psychotic_symptoms: [
      "Não confrontar delírios",
      "Encaminhar para psiquiatra urgentemente",
      "Avaliar risco de violência",
      "Manter contato com família",
    ],
    other: [
      "Explorar mais detalhes",
      "Consultar supervisor se necessário",
      "Documentar cuidadosamente",
    ],
  };

  return recommendations[signalType] || recommendations.other;
}

/**
 * Gera relatório de alertas para período
 */
export function generateAlertReport(alerts: RiskAlert[]): {
  totalAlerts: number;
  byRiskLevel: Record<string, number>;
  bySignalType: Record<string, number>;
  criticalAlerts: RiskAlert[];
  acknowledgedRate: number;
} {
  const byRiskLevel: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  const bySignalType: Record<string, number> = {};

  let acknowledgedCount = 0;

  for (const alert of alerts) {
    byRiskLevel[alert.riskLevel]++;
    bySignalType[alert.signalType] = (bySignalType[alert.signalType] || 0) + 1;
    if (alert.acknowledged) acknowledgedCount++;
  }

  return {
    totalAlerts: alerts.length,
    byRiskLevel,
    bySignalType,
    criticalAlerts: alerts.filter((a) => a.riskLevel === "critical"),
    acknowledgedRate: alerts.length > 0 ? acknowledgedCount / alerts.length : 0,
  };
}
