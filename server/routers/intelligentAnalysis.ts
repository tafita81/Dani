/**
 * Intelligent Analysis Router - Análise Contextualizada com Mapeamento Inteligente
 * Integra mapeamento de campos, análise de histórico e geração de recomendações
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { findFieldByQuery, createMappingContext, FIELD_MAPPINGS } from "../utils/fieldMapper";

export const intelligentAnalysisRouter = router({
  /**
   * Análise completa de paciente com interpretação flexível de perguntas
   */
  analyzePatientWithFlexibleQuery: publicProcedure
    .input(
      z.object({
        patientId: z.string(),
        query: z.string(),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { patientId, query, context } = input;

      // Extrair campos relevantes da pergunta
      const mappingContext = createMappingContext(query);

      // Criar prompt inteligente que entende sinônimos
      const systemPrompt = `Você é um assistente clínico especializado em análise de pacientes.
      
Você tem acesso aos seguintes campos e tabelas:
${FIELD_MAPPINGS.map((m) => `- ${m.tableName}.${m.fieldName}: ${m.description} (sinônimos: ${m.synonyms.join(", ")})`).join("\n")}

Quando o usuário faz uma pergunta, você deve:
1. Identificar quais campos/tabelas são relevantes (mesmo que use nomes diferentes)
2. Interpretar a pergunta com flexibilidade (resumo = summary, notas = notes, etc)
3. Fornecer resposta completa baseada em TODOS os dados disponíveis
4. Associar corretamente o assunto e campo que o usuário está falando

${mappingContext}

Pergunta do usuário: "${query}"
${context ? `Contexto adicional: ${context}` : ""}

Forneça uma resposta completa e precisa baseada no histórico do paciente.`;

      // Chamar LLM com contexto inteligente
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Analise o paciente ${patientId} e responda: ${query}`,
          },
        ],
      });

      const responseContent = response.choices?.[0]?.message?.content;
      const responseText = typeof responseContent === "string" ? responseContent : "Não foi possível gerar análise";

      return {
        success: true,
        query,
        response: responseText,
        fieldsIdentified: FIELD_MAPPINGS.filter((m) =>
          responseText.toLowerCase().includes(m.fieldName.toLowerCase())
        ).map((m) => ({ field: m.fieldName, table: m.tableName })),
      };
    }),

  /**
   * Gera recomendações para próxima consulta baseado em histórico
   */
  generateNextSessionRecommendations: publicProcedure
    .input(
      z.object({
        patientId: z.string(),
        includeFormQuestions: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const { patientId, includeFormQuestions } = input;

      const systemPrompt = `Você é um psicólogo especializado em criar recomendações para próximas sessões.

Com base no histórico completo do paciente, você deve:
1. Analisar evolução e padrões
2. Identificar temas recorrentes
3. Gerar recomendações de tratamento
4. Sugerir perguntas para próxima consulta
${includeFormQuestions ? "5. Sugerir formulários/inventários relevantes" : ""}

Forneça respostas estruturadas e baseadas em evidências clínicas.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Para o paciente ${patientId}, gere:
1. Resumo de evolução
2. Recomendações de tratamento
3. Perguntas sugeridas para próxima consulta
${includeFormQuestions ? "4. Formulários/inventários recomendados" : ""}`,
          },
        ],
      });

      const responseContent = response.choices?.[0]?.message?.content;
      const responseText = typeof responseContent === "string" ? responseContent : "Não foi possível gerar recomendações";

      // Parsear resposta estruturada
      const recommendations = parseStructuredResponse(responseText);

      return {
        success: true,
        patientId,
        recommendations,
        rawResponse: responseText,
      };
    }),

  /**
   * Busca campos relacionados a um tópico
   */
  findRelatedFields: publicProcedure
    .input(
      z.object({
        topic: z.string(),
      })
    )
    .query(({ input }) => {
      const { topic } = input;
      const lowerTopic = topic.toLowerCase();

      const relatedFields = FIELD_MAPPINGS.filter((mapping) => {
        return (
          mapping.tableName.toLowerCase().includes(lowerTopic) ||
          mapping.fieldName.toLowerCase().includes(lowerTopic) ||
          mapping.synonyms.some((s) => s.toLowerCase().includes(lowerTopic)) ||
          mapping.description.toLowerCase().includes(lowerTopic)
        );
      });

      return {
        topic,
        fieldsFound: relatedFields.length,
        fields: relatedFields,
      };
    }),

  /**
   * Mapeia sinônimos para campos oficiais
   */
  mapSynonymsToFields: publicProcedure
    .input(
      z.object({
        userInput: z.string(),
      })
    )
    .query(({ input }) => {
      const { userInput } = input;
      const field = findFieldByQuery(userInput);

      if (!field) {
        return {
          success: false,
          userInput,
          message: "Campo não encontrado",
        };
      }

      return {
        success: true,
        userInput,
        mappedField: {
          fieldName: field.fieldName,
          tableName: field.tableName,
          description: field.description,
          allSynonyms: field.synonyms,
        },
      };
    }),
});

/**
 * Parseia resposta estruturada do LLM
 */
function parseStructuredResponse(response: string | any): Record<string, any> {
  const result: Record<string, any> = {};
  const responseStr = typeof response === "string" ? response : String(response);

  // Extrair seções da resposta
  const sections = responseStr.split(/\n(?=\d\.|##|###)/);

  for (const section of sections) {
    if (section.toLowerCase().includes("evolução") || section.toLowerCase().includes("progresso")) {
      result.evolution = section.trim();
    } else if (section.toLowerCase().includes("recomendação")) {
      result.recommendations = section.trim();
    } else if (section.toLowerCase().includes("pergunta")) {
      result.suggestedQuestions = section.trim();
    } else if (section.toLowerCase().includes("formulário") || section.toLowerCase().includes("inventário")) {
      result.suggestedForms = section.trim();
    }
  }

  // Se não conseguir parsear, retornar resposta completa
  if (Object.keys(result).length === 0) {
    result.fullResponse = responseStr;
  }

  return result;
}

