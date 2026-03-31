import { invokeLLM } from "../_core/llm";

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  postId: string;
}

export interface AutoResponse {
  commentId: string;
  response: string;
  type: "greeting" | "question" | "complaint" | "interest" | "other";
  confidence: number;
  sent: boolean;
}

export interface CommentAnalysis {
  type: "greeting" | "question" | "complaint" | "interest" | "other";
  sentiment: "positive" | "neutral" | "negative";
  hasInterest: boolean;
  shouldRespond: boolean;
  confidence: number;
}

/**
 * Analisar comentário para determinar tipo e resposta apropriada
 */
export async function analyzeComment(comment: Comment): Promise<CommentAnalysis> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um assistente de análise de comentários para um canal de psicologia educativa. 
Analise o comentário e determine:
1. Tipo: greeting, question, complaint, interest, other
2. Sentimento: positive, neutral, negative
3. Se tem interesse em consulta/conteúdo
4. Se deve responder

Responda em JSON: { type, sentiment, hasInterest, shouldRespond, confidence }`,
      },
      {
        role: "user",
        content: `Comentário: "${comment.text}"`,
      },
    ],
  });

  try {
    const content =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);
    const parsed = JSON.parse(content);
    return {
      type: parsed.type || "other",
      sentiment: parsed.sentiment || "neutral",
      hasInterest: parsed.hasInterest || false,
      shouldRespond: parsed.shouldRespond || false,
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return {
      type: "other",
      sentiment: "neutral",
      hasInterest: false,
      shouldRespond: false,
      confidence: 0,
    };
  }
}

/**
 * Gerar resposta automática para comentário
 */
export async function generateAutoResponse(
  comment: Comment,
  analysis: CommentAnalysis
): Promise<string> {
  const templates: Record<string, string> = {
    greeting: `Olá @${comment.username}! 👋 Obrigada pelo comentário! Fico feliz em ter você por aqui. 💙`,
    question: `Ótima pergunta @${comment.username}! Vou responder isso em um próximo vídeo. Fica atento! 📹`,
    complaint: `@${comment.username}, desculpa se não atendi suas expectativas. Vou melhorar! Obrigada pelo feedback. 💪`,
    interest: `Oi @${comment.username}! 🎯 Fico feliz que tenha interesse! Deixa um DM que conversamos mais sobre isso. 💬`,
    other: `Obrigada @${comment.username} pelo comentário! 🙏`,
  };

  if (analysis.confidence > 0.8) {
    return templates[analysis.type] || templates.other;
  }

  // Usar IA para gerar resposta mais personalizada
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um assistente de resposta de comentários para um canal de psicologia educativa.
Gere uma resposta curta (1-2 linhas), amigável e profissional.
Não mencione que é psicóloga ou ofereça consultas.
Apenas responda educadamente e com emojis apropriados.`,
      },
      {
        role: "user",
        content: `Comentário: "${comment.text}"
Tipo: ${analysis.type}
Gere uma resposta apropriada:`,
      },
    ],
  });

  const content =
    typeof response.choices[0].message.content === "string"
      ? response.choices[0].message.content
      : JSON.stringify(response.choices[0].message.content);
  return content.substring(0, 300); // Limitar a 300 caracteres
}

/**
 * Processar comentários em lote
 */
export async function processBatchComments(comments: Comment[]): Promise<AutoResponse[]> {
  const responses: AutoResponse[] = [];

  for (const comment of comments) {
    const analysis = await analyzeComment(comment);

    if (analysis.shouldRespond && analysis.confidence > 0.6) {
      const responseText = await generateAutoResponse(comment, analysis);

      responses.push({
        commentId: comment.id,
        response: responseText,
        type: analysis.type,
        confidence: analysis.confidence,
        sent: false,
      });
    }
  }

  return responses;
}

/**
 * Enviar resposta para Instagram
 */
export async function sendInstagramResponse(
  response: AutoResponse,
  commentId: string
): Promise<boolean> {
  try {
    // Simular envio para Instagram
    console.log(`Enviando resposta para comentário ${commentId}: ${response.response}`);

    // Em produção, usar Instagram Graph API
    // const result = await fetch(`https://graph.instagram.com/v18.0/${commentId}/replies`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${accessToken}`
    //   },
    //   body: JSON.stringify({
    //     message: response.response
    //   })
    // });

    return true;
  } catch (error) {
    console.error("Erro ao enviar resposta:", error);
    return false;
  }
}

/**
 * Gerar relatório de respostas automáticas
 */
export function generateAutomationReport(responses: AutoResponse[]): string {
  const total = responses.length;
  const byType = {
    greeting: responses.filter((r) => r.type === "greeting").length,
    question: responses.filter((r) => r.type === "question").length,
    complaint: responses.filter((r) => r.type === "complaint").length,
    interest: responses.filter((r) => r.type === "interest").length,
    other: responses.filter((r) => r.type === "other").length,
  };

  const avgConfidence =
    responses.reduce((sum, r) => sum + r.confidence, 0) / total || 0;

  return `
RELATÓRIO DE AUTOMAÇÃO DE COMENTÁRIOS
=====================================

Total de Respostas: ${total}

Distribuição por Tipo:
- Saudações: ${byType.greeting}
- Perguntas: ${byType.question}
- Reclamações: ${byType.complaint}
- Interesse: ${byType.interest}
- Outros: ${byType.other}

Confiança Média: ${(avgConfidence * 100).toFixed(1)}%

Respostas Enviadas: ${responses.filter((r) => r.sent).length}
Respostas Pendentes: ${responses.filter((r) => !r.sent).length}
`;
}

/**
 * Configurar automação de comentários
 */
export interface AutomationConfig {
  enabled: boolean;
  respondToAll: boolean;
  minConfidence: number;
  responseDelay: number; // em minutos
  maxResponsesPerDay: number;
  respondToTypes: string[];
}

export const defaultConfig: AutomationConfig = {
  enabled: true,
  respondToAll: false,
  minConfidence: 0.7,
  responseDelay: 5,
  maxResponsesPerDay: 50,
  respondToTypes: ["greeting", "question", "interest"],
};

/**
 * Validar configuração
 */
export function validateConfig(config: AutomationConfig): boolean {
  return (
    config.minConfidence >= 0 &&
    config.minConfidence <= 1 &&
    config.responseDelay >= 0 &&
    config.maxResponsesPerDay > 0 &&
    config.respondToTypes.length > 0
  );
}
