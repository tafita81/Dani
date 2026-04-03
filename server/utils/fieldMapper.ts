/**
 * Field Mapper - Mapeamento Inteligente de Campos e Sinônimos Clínicos
 * Permite interpretação flexível de perguntas com nomes diferentes
 */

export interface FieldMapping {
  fieldName: string;
  tableName: string;
  synonyms: string[];
  description: string;
  dataType: string;
}

// Mapeamento completo de todos os campos do banco com sinônimos
export const FIELD_MAPPINGS: FieldMapping[] = [
  // Tabela: patients
  {
    fieldName: "name",
    tableName: "patients",
    synonyms: ["nome", "nome do paciente", "paciente", "nome completo"],
    description: "Nome completo do paciente",
    dataType: "string",
  },
  {
    fieldName: "email",
    tableName: "patients",
    synonyms: ["email", "e-mail", "correio eletrônico"],
    description: "Email do paciente",
    dataType: "string",
  },
  {
    fieldName: "phone",
    tableName: "patients",
    synonyms: ["telefone", "celular", "whatsapp", "contato"],
    description: "Telefone de contato",
    dataType: "string",
  },
  {
    fieldName: "status",
    tableName: "patients",
    synonyms: ["status", "situação", "estado", "ativo", "inativo"],
    description: "Status do paciente (active, lead, inactive)",
    dataType: "enum",
  },
  {
    fieldName: "gender",
    tableName: "patients",
    synonyms: ["gênero", "sexo", "genero"],
    description: "Gênero do paciente",
    dataType: "string",
  },
  {
    fieldName: "birthDate",
    tableName: "patients",
    synonyms: ["data de nascimento", "nascimento", "idade", "aniversário"],
    description: "Data de nascimento",
    dataType: "date",
  },

  // Tabela: sessionNotes
  {
    fieldName: "summary",
    tableName: "sessionNotes",
    synonyms: [
      "resumo",
      "resumo da sessão",
      "sumário",
      "síntese",
      "resumido",
      "o que aconteceu",
    ],
    description: "Resumo da sessão",
    dataType: "text",
  },
  {
    fieldName: "transcript",
    tableName: "sessionNotes",
    synonyms: [
      "transcrição",
      "transcrição da sessão",
      "gravação",
      "áudio",
      "o que foi dito",
      "conversação",
    ],
    description: "Transcrição completa da sessão",
    dataType: "text",
  },
  {
    fieldName: "aiSuggestions",
    tableName: "sessionNotes",
    synonyms: [
      "sugestões",
      "sugestões da ia",
      "recomendações",
      "próximos passos",
      "o que fazer",
      "sugestões de ia",
    ],
    description: "Sugestões de IA para próximas sessões",
    dataType: "array",
  },
  {
    fieldName: "keyThemes",
    tableName: "sessionNotes",
    synonyms: [
      "temas",
      "temas principais",
      "temas-chave",
      "assuntos",
      "tópicos",
      "principais temas",
    ],
    description: "Temas principais abordados",
    dataType: "array",
  },
  {
    fieldName: "interventions",
    tableName: "sessionNotes",
    synonyms: [
      "intervenções",
      "técnicas",
      "técnicas usadas",
      "abordagens",
      "o que foi feito",
      "procedimentos",
    ],
    description: "Intervenções terapêuticas utilizadas",
    dataType: "array",
  },
  {
    fieldName: "homework",
    tableName: "sessionNotes",
    synonyms: [
      "tarefas de casa",
      "tarefa",
      "dever",
      "exercício",
      "trabalho de casa",
      "para fazer em casa",
    ],
    description: "Tarefas de casa para o paciente",
    dataType: "text",
  },
  {
    fieldName: "nextSession",
    tableName: "sessionNotes",
    synonyms: [
      "próxima sessão",
      "próxima consulta",
      "recomendações para próxima",
      "o que trabalhar",
      "próximos passos",
    ],
    description: "Recomendações para próxima sessão",
    dataType: "text",
  },

  // Tabela: treatmentPlans
  {
    fieldName: "approach",
    tableName: "treatmentPlans",
    synonyms: [
      "abordagem",
      "tipo de terapia",
      "terapia",
      "método",
      "abordagem terapêutica",
    ],
    description: "Abordagem terapêutica (CBT, ACT, etc)",
    dataType: "string",
  },
  {
    fieldName: "objectives",
    tableName: "treatmentPlans",
    synonyms: [
      "objetivos",
      "metas",
      "alvo",
      "o que queremos alcançar",
      "propósito",
    ],
    description: "Objetivos do tratamento",
    dataType: "text",
  },
  {
    fieldName: "frequency",
    tableName: "treatmentPlans",
    synonyms: [
      "frequência",
      "com que frequência",
      "quantas vezes",
      "periodicidade",
      "intervalo",
    ],
    description: "Frequência das sessões",
    dataType: "string",
  },

  // Tabela: anamnesis
  {
    fieldName: "complaint",
    tableName: "anamnesis",
    synonyms: [
      "queixa",
      "queixa principal",
      "problema",
      "motivo da consulta",
      "o que traz aqui",
    ],
    description: "Queixa principal do paciente",
    dataType: "text",
  },
  {
    fieldName: "history",
    tableName: "anamnesis",
    synonyms: [
      "história",
      "histórico",
      "história pessoal",
      "antecedentes",
      "passado",
    ],
    description: "História pessoal e familiar",
    dataType: "text",
  },

  // Tabela: inventoryResults
  {
    fieldName: "inventoryType",
    tableName: "inventoryResults",
    synonyms: [
      "inventário",
      "teste",
      "avaliação",
      "escala",
      "questionário",
      "bdi",
      "bai",
      "phq",
      "gad",
    ],
    description: "Tipo de inventário (BDI-II, BAI, PHQ-9, GAD-7)",
    dataType: "string",
  },
  {
    fieldName: "score",
    tableName: "inventoryResults",
    synonyms: ["pontuação", "escore", "resultado", "score", "nota"],
    description: "Pontuação do inventário",
    dataType: "number",
  },

  // Tabela: moodEntries
  {
    fieldName: "mood",
    tableName: "moodEntries",
    synonyms: [
      "humor",
      "estado emocional",
      "emoção",
      "sentimento",
      "como está se sentindo",
    ],
    description: "Estado emocional do paciente",
    dataType: "string",
  },
  {
    fieldName: "intensity",
    tableName: "moodEntries",
    synonyms: [
      "intensidade",
      "intensidade do humor",
      "nível",
      "força",
      "de 1 a 10",
    ],
    description: "Intensidade do humor (1-10)",
    dataType: "number",
  },
];

/**
 * Encontra mapeamento de campo por sinônimo
 */
export function findFieldByQuery(query: string): FieldMapping | null {
  const lowerQuery = query.toLowerCase().trim();

  for (const mapping of FIELD_MAPPINGS) {
    // Verificar correspondência exata com o nome do campo
    if (mapping.fieldName.toLowerCase() === lowerQuery) {
      return mapping;
    }

    // Verificar correspondência com sinônimos
    for (const synonym of mapping.synonyms) {
      if (synonym.toLowerCase().includes(lowerQuery) || lowerQuery.includes(synonym.toLowerCase())) {
        return mapping;
      }
    }
  }

  return null;
}

/**
 * Encontra todos os mapeamentos relacionados a um tópico
 */
export function findRelatedFields(topic: string): FieldMapping[] {
  const lowerTopic = topic.toLowerCase();
  return FIELD_MAPPINGS.filter((mapping) => {
    return (
      mapping.tableName.toLowerCase().includes(lowerTopic) ||
      mapping.fieldName.toLowerCase().includes(lowerTopic) ||
      mapping.synonyms.some((s) => s.toLowerCase().includes(lowerTopic))
    );
  });
}

/**
 * Extrai campos relevantes de uma pergunta
 */
export function extractFieldsFromQuestion(question: string): FieldMapping[] {
  const words = question.toLowerCase().split(/[\s,\.?!]+/);
  const fields: FieldMapping[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    if (word.length < 3) continue; // Ignorar palavras muito curtas

    const field = findFieldByQuery(word);
    if (field && !seen.has(field.fieldName)) {
      fields.push(field);
      seen.add(field.fieldName);
    }
  }

  return fields;
}

/**
 * Cria prompt para o LLM com contexto de mapeamento
 */
export function createMappingContext(question: string): string {
  const fields = extractFieldsFromQuestion(question);

  if (fields.length === 0) {
    return "";
  }

  let context = "Campos relevantes encontrados na pergunta:\n";
  for (const field of fields) {
    context += `- ${field.fieldName} (${field.tableName}): ${field.description}\n`;
  }

  return context;
}
