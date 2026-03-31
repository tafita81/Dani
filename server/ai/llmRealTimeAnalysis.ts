import { invokeLLM } from "../_core/llm";

export interface RealTimeAnalysisResult {
  clinicalInsights: string[];
  suggestedTechniques: string[];
  patternDetected: string | null;
  riskAlert: boolean;
  riskLevel: "low" | "medium" | "high";
  emotionalState: string;
  nextSteps: string[];
  confidence: number;
}

/**
 * Analisa transcrição em tempo real com LLM
 * Fornece sugestões clínicas, detecção de padrões e alertas
 */
export async function analyzeTranscriptionRealTime(
  transcription: string,
  patientContext: {
    name: string;
    mainComplaint: string;
    dominantSchemas?: string[];
    treatmentApproach: "TCC" | "Esquema" | "Gestalt" | "Integrativa";
    previousSessions?: string[];
  }
): Promise<RealTimeAnalysisResult> {
  try {
    const systemPrompt = `Você é um assistente clínico especializado em ${patientContext.treatmentApproach}. 
Analise a transcrição do paciente ${patientContext.name} com queixa principal: "${patientContext.mainComplaint}".
${patientContext.dominantSchemas ? `Esquemas dominantes: ${patientContext.dominantSchemas.join(", ")}` : ""}

Forneça:
1. Insights clínicos relevantes
2. Técnicas recomendadas
3. Padrões detectados
4. Nível de risco (baixo/médio/alto)
5. Estado emocional
6. Próximos passos

Responda em JSON estruturado.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Analise esta transcrição: "${transcription}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "clinical_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              clinicalInsights: {
                type: "array",
                items: { type: "string" },
                description: "Insights clínicos relevantes",
              },
              suggestedTechniques: {
                type: "array",
                items: { type: "string" },
                description: "Técnicas recomendadas",
              },
              patternDetected: {
                type: ["string", "null"],
                description: "Padrão comportamental detectado",
              },
              riskLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Nível de risco",
              },
              emotionalState: {
                type: "string",
                description: "Estado emocional detectado",
              },
              nextSteps: {
                type: "array",
                items: { type: "string" },
                description: "Próximos passos recomendados",
              },
              confidence: {
                type: "number",
                description: "Confiança da análise (0-1)",
              },
            },
            required: [
              "clinicalInsights",
              "suggestedTechniques",
              "riskLevel",
              "emotionalState",
              "nextSteps",
              "confidence",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      clinicalInsights: parsed.clinicalInsights || [],
      suggestedTechniques: parsed.suggestedTechniques || [],
      patternDetected: parsed.patternDetected || null,
      riskAlert: parsed.riskLevel !== "low",
      riskLevel: parsed.riskLevel || "low",
      emotionalState: parsed.emotionalState || "Não identificado",
      nextSteps: parsed.nextSteps || [],
      confidence: parsed.confidence || 0.8,
    };
  } catch (error) {
    console.error("Erro ao analisar transcrição com LLM:", error);
    return {
      clinicalInsights: [],
      suggestedTechniques: [],
      patternDetected: null,
      riskAlert: false,
      riskLevel: "low",
      emotionalState: "Análise indisponível",
      nextSteps: [],
      confidence: 0,
    };
  }
}

/**
 * Gera sugestões de técnicas baseado no contexto clínico
 */
export async function generateTechniqueSuggestions(
  patientContext: {
    name: string;
    mainComplaint: string;
    treatmentApproach: "TCC" | "Esquema" | "Gestalt" | "Integrativa";
    recentTranscriptions: string[];
  }
): Promise<string[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em ${patientContext.treatmentApproach}. 
Baseado no histórico do paciente, sugira as 5 técnicas mais eficazes para aplicar na próxima sessão.`,
        },
        {
          role: "user",
          content: `Paciente: ${patientContext.name}
Queixa: ${patientContext.mainComplaint}
Histórico recente: ${patientContext.recentTranscriptions.join("\n")}

Quais técnicas você recomenda?`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    const text = typeof content === "string" ? content : JSON.stringify(content);
    
    // Extrair técnicas da resposta
    const techniques = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 5);

    return techniques;
  } catch (error) {
    console.error("Erro ao gerar sugestões de técnicas:", error);
    return [];
  }
}

/**
 * Detecta alertas de risco na transcrição
 */
export async function detectRiskAlerts(
  transcription: string
): Promise<{ hasRisk: boolean; riskType: string; severity: "low" | "medium" | "high"; recommendation: string }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente clínico especializado em detecção de risco.
Analise a transcrição para detectar possíveis riscos (ideação suicida, automutilação, abuso, etc).
Responda em JSON com: hasRisk (boolean), riskType (string), severity (low/medium/high), recommendation (string).`,
        },
        {
          role: "user",
          content: `Analise para riscos: "${transcription}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "risk_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              hasRisk: { type: "boolean" },
              riskType: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high"] },
              recommendation: { type: "string" },
            },
            required: ["hasRisk", "riskType", "severity", "recommendation"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      hasRisk: parsed.hasRisk || false,
      riskType: parsed.riskType || "Nenhum",
      severity: parsed.severity || "low",
      recommendation: parsed.recommendation || "",
    };
  } catch (error) {
    console.error("Erro ao detectar riscos:", error);
    return {
      hasRisk: false,
      riskType: "Erro na análise",
      severity: "low",
      recommendation: "Revisar manualmente",
    };
  }
}
