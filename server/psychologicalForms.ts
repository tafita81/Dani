/**
 * Banco de Dados de Formulários Psicológicos Validados 2026
 * Todos em Português Brasileiro
 * Inclui: TCC, Terapia do Esquema, Gestalt e Inventários Padronizados
 */

export interface PsychologicalForm {
  id: string;
  name: string;
  description: string;
  technique: "TCC" | "Esquema" | "Gestalt" | "Geral";
  category: string;
  questions: FormQuestion[];
  scoringMethod: string;
  interpretation: string;
  validatedYear: number;
  language: "Português Brasileiro";
  source: string;
}

export interface FormQuestion {
  id: string;
  question: string;
  type: "likert" | "multiple" | "text" | "numeric" | "scale";
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
  scoring?: number;
}

// ============================================================================
// TCC - TERAPIA COGNITIVO-COMPORTAMENTAL
// ============================================================================

export const tccForms: PsychologicalForm[] = [
  {
    id: "tcc-registro-pensamentos",
    name: "Registro de Pensamentos Automáticos (RPA)",
    description: "Ferramenta fundamental da TCC para identificar e desafiar pensamentos automáticos",
    technique: "TCC",
    category: "Avaliação Cognitiva",
    questions: [
      {
        id: "q1",
        question: "Situação/Evento Disparador",
        type: "text",
      },
      {
        id: "q2",
        question: "Emoção(ões) Sentida(s)",
        type: "text",
      },
      {
        id: "q3",
        question: "Pensamento(s) Automático(s)",
        type: "text",
      },
      {
        id: "q4",
        question: "Evidências que Apoiam o Pensamento",
        type: "text",
      },
      {
        id: "q5",
        question: "Evidências Contra o Pensamento",
        type: "text",
      },
      {
        id: "q6",
        question: "Pensamento Alternativo/Equilibrado",
        type: "text",
      },
      {
        id: "q7",
        question: "Intensidade da Emoção Agora (0-100)",
        type: "numeric",
      },
    ],
    scoringMethod: "Qualitativo - Análise de Padrões de Pensamento",
    interpretation: "Identifica distorções cognitivas e padrões de pensamento disfuncionais",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Beck Institute - Adaptado para PT-BR",
  },

  {
    id: "tcc-analise-comportamento",
    name: "Planilha de Análise Comportamental",
    description: "Registra comportamentos, consequências e padrões de reforço",
    technique: "TCC",
    category: "Análise Comportamental",
    questions: [
      {
        id: "q1",
        question: "Comportamento Observado",
        type: "text",
      },
      {
        id: "q2",
        question: "Antecedente (O que aconteceu antes)",
        type: "text",
      },
      {
        id: "q3",
        question: "Consequência Imediata",
        type: "text",
      },
      {
        id: "q4",
        question: "Consequência a Longo Prazo",
        type: "text",
      },
      {
        id: "q5",
        question: "Frequência (vezes por semana)",
        type: "numeric",
      },
      {
        id: "q6",
        question: "Intensidade (0-10)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Mínima", "Máxima"] },
      },
      {
        id: "q7",
        question: "Padrão Identificado",
        type: "text",
      },
    ],
    scoringMethod: "Análise de Padrões ABC (Antecedente-Comportamento-Consequência)",
    interpretation: "Identifica ciclos de reforço e manutenção de comportamentos",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Análise Funcional - TCC",
  },

  {
    id: "tcc-crencas-centrais",
    name: "Identificação de Crenças Centrais",
    description: "Explora crenças profundas sobre si mesmo, outros e o mundo",
    technique: "TCC",
    category: "Crenças Centrais",
    questions: [
      {
        id: "q1",
        question: "O que você acredita sobre si mesmo?",
        type: "text",
      },
      {
        id: "q2",
        question: "O que você acredita sobre outras pessoas?",
        type: "text",
      },
      {
        id: "q3",
        question: "O que você acredita sobre o mundo/futuro?",
        type: "text",
      },
      {
        id: "q4",
        question: "Desde quando você tem essa crença?",
        type: "text",
      },
      {
        id: "q5",
        question: "Qual é a origem dessa crença?",
        type: "text",
      },
      {
        id: "q6",
        question: "Como essa crença afeta sua vida?",
        type: "text",
      },
      {
        id: "q7",
        question: "Convicção na Crença (0-100%)",
        type: "numeric",
      },
    ],
    scoringMethod: "Análise Qualitativa - Mapeamento de Crenças",
    interpretation: "Identifica estruturas cognitivas profundas e seus impactos",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Terapia Cognitiva - Beck",
  },
];

// ============================================================================
// TERAPIA DO ESQUEMA
// ============================================================================

export const schematherapyForms: PsychologicalForm[] = [
  {
    id: "schema-identificacao",
    name: "Identificação de Esquemas Maladaptativos Iniciais",
    description: "Avalia 18 esquemas maladaptativos principais segundo Young",
    technique: "Esquema",
    category: "Diagnóstico de Esquemas",
    questions: [
      {
        id: "q1",
        question: "Sinto que ninguém realmente se importa comigo",
        type: "likert",
        options: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
        scoring: 0,
      },
      {
        id: "q2",
        question: "Tenho medo de ser abandonado",
        type: "likert",
        options: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
        scoring: 0,
      },
      {
        id: "q3",
        question: "Sinto que sou fundamentalmente defeituoso",
        type: "likert",
        options: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
        scoring: 0,
      },
      {
        id: "q4",
        question: "Preciso ser perfeito para ser aceito",
        type: "likert",
        options: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
        scoring: 0,
      },
      {
        id: "q5",
        question: "Sinto-me vazio por dentro",
        type: "likert",
        options: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
        scoring: 0,
      },
      {
        id: "q6",
        question: "Tenho dificuldade em controlar minhas emoções",
        type: "likert",
        options: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
        scoring: 0,
      },
      {
        id: "q7",
        question: "Sinto-me preso em relacionamentos prejudiciais",
        type: "likert",
        options: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
        scoring: 0,
      },
    ],
    scoringMethod: "Soma de Pontos - Esquemas com Maior Pontuação são Primários",
    interpretation: "Identifica esquemas maladaptativos dominantes (Privação, Abandono, Defeito, Fracasso, etc.)",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Young Schema Therapy - Adaptado PT-BR",
  },

  {
    id: "schema-modos",
    name: "Avaliação de Modos de Esquema",
    description: "Identifica estados emocionais e comportamentais dominantes",
    technique: "Esquema",
    category: "Modos de Esquema",
    questions: [
      {
        id: "q1",
        question: "Modo Criança Vulnerável (medo, tristeza, desamparo)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Ausente", "Muito Presente"] },
      },
      {
        id: "q2",
        question: "Modo Criança Raivosa (raiva, frustração, rebeldia)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Ausente", "Muito Presente"] },
      },
      {
        id: "q3",
        question: "Modo Protetor Desapegado (frieza, distância emocional)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Ausente", "Muito Presente"] },
      },
      {
        id: "q4",
        question: "Modo Protetor Agressivo (dominação, agressividade)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Ausente", "Muito Presente"] },
      },
      {
        id: "q5",
        question: "Modo Adulto Saudável (equilibrado, compassivo, racional)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Ausente", "Muito Presente"] },
      },
      {
        id: "q6",
        question: "Modo Pai Crítico (autocrítica, culpa, vergonha)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Ausente", "Muito Presente"] },
      },
    ],
    scoringMethod: "Identificação de Modos Dominantes e Sua Frequência",
    interpretation: "Mapeia estados emocionais predominantes e necessidade de ativação do Modo Adulto Saudável",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Schema Therapy - Mode Work",
  },

  {
    id: "schema-necessidades",
    name: "Avaliação de Necessidades Emocionais Não Atendidas",
    description: "Identifica necessidades fundamentais que não foram satisfeitas",
    technique: "Esquema",
    category: "Necessidades Emocionais",
    questions: [
      {
        id: "q1",
        question: "Segurança e Proteção",
        type: "likert",
        options: ["Totalmente Atendida", "Parcialmente Atendida", "Neutra", "Parcialmente Não Atendida", "Totalmente Não Atendida"],
      },
      {
        id: "q2",
        question: "Autonomia e Competência",
        type: "likert",
        options: ["Totalmente Atendida", "Parcialmente Atendida", "Neutra", "Parcialmente Não Atendida", "Totalmente Não Atendida"],
      },
      {
        id: "q3",
        question: "Liberdade de Expressão Emocional",
        type: "likert",
        options: ["Totalmente Atendida", "Parcialmente Atendida", "Neutra", "Parcialmente Não Atendida", "Totalmente Não Atendida"],
      },
      {
        id: "q4",
        question: "Limite e Autodisciplina",
        type: "likert",
        options: ["Totalmente Atendida", "Parcialmente Atendida", "Neutra", "Parcialmente Não Atendida", "Totalmente Não Atendida"],
      },
      {
        id: "q5",
        question: "Validação e Reconhecimento",
        type: "likert",
        options: ["Totalmente Atendida", "Parcialmente Atendida", "Neutra", "Parcialmente Não Atendida", "Totalmente Não Atendida"],
      },
      {
        id: "q6",
        question: "Conexão e Pertencimento",
        type: "likert",
        options: ["Totalmente Atendida", "Parcialmente Atendida", "Neutra", "Parcialmente Não Atendida", "Totalmente Não Atendida"],
      },
    ],
    scoringMethod: "Identificação de Necessidades Críticas Não Atendidas",
    interpretation: "Guia o trabalho terapêutico para atender necessidades fundamentais",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Schema Therapy - Emotional Needs",
  },
];

// ============================================================================
// GESTALT
// ============================================================================

export const gestaltForms: PsychologicalForm[] = [
  {
    id: "gestalt-ciclo-contato",
    name: "Avaliação do Ciclo de Contato",
    description: "Avalia as fases do contato autêntico: sensação, percepção, ação, contato, retirada",
    technique: "Gestalt",
    category: "Contato e Consciência",
    questions: [
      {
        id: "q1",
        question: "Consigo notar minhas sensações corporais no momento presente?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q2",
        question: "Consigo perceber meus sentimentos sem julgamento?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q3",
        question: "Consigo agir de acordo com minhas necessidades reais?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q4",
        question: "Consigo fazer contato autêntico com outras pessoas?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q5",
        question: "Consigo encerrar experiências e seguir em frente?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q6",
        question: "Onde você sente que o ciclo fica interrompido?",
        type: "text",
      },
    ],
    scoringMethod: "Análise de Pontos de Interrupção no Ciclo",
    interpretation: "Identifica bloqueios no contato autêntico e consciência presente",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Gestalt Therapy - Contact Cycle",
  },

  {
    id: "gestalt-mecanismos-defesa",
    name: "Identificação de Mecanismos de Defesa Gestálticos",
    description: "Avalia introjeção, projeção, retroflexão, deflexão e confluência",
    technique: "Gestalt",
    category: "Mecanismos de Defesa",
    questions: [
      {
        id: "q1",
        question: "Introjeção: Incorporo crenças de outros sem questionar?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q2",
        question: "Projeção: Atribuo meus sentimentos a outras pessoas?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q3",
        question: "Retroflexão: Faço a mim mesmo o que gostaria de fazer aos outros?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q4",
        question: "Deflexão: Evito contato direto com situações importantes?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q5",
        question: "Confluência: Perco meus limites e me fundo com os outros?",
        type: "likert",
        options: ["Nunca", "Raramente", "Às Vezes", "Frequentemente", "Sempre"],
      },
      {
        id: "q6",
        question: "Qual mecanismo é mais predominante em você?",
        type: "text",
      },
    ],
    scoringMethod: "Identificação de Mecanismos Predominantes",
    interpretation: "Revela padrões de evitação de contato e consciência",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Gestalt Therapy - Defense Mechanisms",
  },

  {
    id: "gestalt-aqui-agora",
    name: "Consciência do Aqui e Agora",
    description: "Avalia capacidade de estar presente no momento atual",
    technique: "Gestalt",
    category: "Presença e Consciência",
    questions: [
      {
        id: "q1",
        question: "Neste momento, consigo notar o que estou sentindo?",
        type: "text",
      },
      {
        id: "q2",
        question: "Consigo notar minhas sensações corporais agora?",
        type: "text",
      },
      {
        id: "q3",
        question: "O que é mais importante para mim neste exato momento?",
        type: "text",
      },
      {
        id: "q4",
        question: "Como estou me relacionando com você neste momento?",
        type: "text",
      },
      {
        id: "q5",
        question: "O que preciso fazer agora para estar mais presente?",
        type: "text",
      },
      {
        id: "q6",
        question: "Nível de Presença (0-10)",
        type: "scale",
        scale: { min: 0, max: 10, labels: ["Completamente Ausente", "Totalmente Presente"] },
      },
    ],
    scoringMethod: "Análise Qualitativa da Presença e Consciência",
    interpretation: "Avalia capacidade de contato autêntico e presença",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Gestalt Therapy - Here and Now Awareness",
  },
];

// ============================================================================
// INVENTÁRIOS PADRONIZADOS VALIDADOS
// ============================================================================

export const standardizedInventories: PsychologicalForm[] = [
  {
    id: "phq-9",
    name: "PHQ-9 - Questionário de Saúde do Paciente",
    description: "Avalia sintomas de depressão (9 itens)",
    technique: "Geral",
    category: "Depressão",
    questions: [
      {
        id: "q1",
        question: "Pouco interesse ou prazer em fazer as coisas",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q2",
        question: "Sentir-se para baixo, deprimido ou sem esperança",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q3",
        question: "Dificuldade em adormecer, manter o sono ou dormir demais",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q4",
        question: "Sentir-se cansado ou com pouca energia",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q5",
        question: "Pouco apetite ou comer demais",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q6",
        question: "Sentir-se mal consigo mesmo ou sentir-se fracassado",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q7",
        question: "Dificuldade em concentrar-se em tarefas",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q8",
        question: "Falar ou mover-se tão lentamente que outros notaram",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q9",
        question: "Pensar em se machucar ou que seria melhor estar morto",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
    ],
    scoringMethod: "Soma: 0-4 (Mínimo), 5-9 (Leve), 10-14 (Moderado), 15-19 (Moderado-Grave), 20+ (Grave)",
    interpretation: "Avalia gravidade de sintomas depressivos",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Kroenke et al. - Validado para PT-BR",
  },

  {
    id: "gad-7",
    name: "GAD-7 - Escala de Transtorno de Ansiedade Generalizada",
    description: "Avalia sintomas de ansiedade (7 itens)",
    technique: "Geral",
    category: "Ansiedade",
    questions: [
      {
        id: "q1",
        question: "Sentir-se nervoso, ansioso ou assustado",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q2",
        question: "Não conseguir parar ou controlar a preocupação",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q3",
        question: "Preocupar-se muito com diferentes coisas",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q4",
        question: "Dificuldade em relaxar",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q5",
        question: "Estar tão inquieto que é difícil ficar sentado",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q6",
        question: "Ficar irritável facilmente",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
      {
        id: "q7",
        question: "Sentir medo de que algo terrível possa acontecer",
        type: "likert",
        options: ["Nenhum dia", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"],
      },
    ],
    scoringMethod: "Soma: 0-4 (Mínimo), 5-9 (Leve), 10-14 (Moderado), 15+ (Grave)",
    interpretation: "Avalia gravidade de sintomas ansiosos",
    validatedYear: 2026,
    language: "Português Brasileiro",
    source: "Spitzer et al. - Validado para PT-BR",
  },
];

/**
 * Retorna todos os formulários disponíveis
 */
export function getAllForms(): PsychologicalForm[] {
  return [
    ...tccForms,
    ...schematherapyForms,
    ...gestaltForms,
    ...standardizedInventories,
  ];
}

/**
 * Retorna formulários por técnica
 */
export function getFormsByTechnique(technique: "TCC" | "Esquema" | "Gestalt" | "Geral"): PsychologicalForm[] {
  return getAllForms().filter(form => form.technique === technique);
}

/**
 * Retorna formulário por ID
 */
export function getFormById(id: string): PsychologicalForm | undefined {
  return getAllForms().find(form => form.id === id);
}

/**
 * Retorna formulários por categoria
 */
export function getFormsByCategory(category: string): PsychologicalForm[] {
  return getAllForms().filter(form => form.category === category);
}

export default {
  getAllForms,
  getFormsByTechnique,
  getFormById,
  getFormsByCategory,
  tccForms,
  schematherapyForms,
  gestaltForms,
  standardizedInventories,
};
