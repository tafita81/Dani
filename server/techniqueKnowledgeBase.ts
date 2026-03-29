/**
 * Base de Conhecimento de Técnicas Terapêuticas
 * Sistema inteligente que armazena e recomenda técnicas baseado em histórico
 */

export interface TherapyTechnique {
  id: string;
  name: string;
  approach: "TCC" | "Esquema" | "Gestalt" | "Psicodrama" | "Mindfulness" | "Integrada";
  description: string;
  indications: string[];
  contraindications: string[];
  effectiveness: number; // 0-100
  timeRequired: number; // minutos
  complexity: "baixa" | "média" | "alta";
  keywords: string[];
}

export interface TechniqueRecommendation {
  technique: TherapyTechnique;
  relevanceScore: number; // 0-100
  reasoning: string;
  expectedOutcome: string;
  alternativeTechniques: TherapyTechnique[];
}

// Base de Conhecimento Completa de Técnicas
export const techniqueKnowledgeBase: TherapyTechnique[] = [
  // ─── TCC - Terapia Cognitivo-Comportamental ───
  {
    id: "tcc_thought_record",
    name: "Registro de Pensamentos Automáticos",
    approach: "TCC",
    description: "Técnica para identificar e registrar pensamentos automáticos, emoções e comportamentos",
    indications: ["ansiedade", "depressão", "distorções cognitivas", "baixa autoestima"],
    contraindications: ["psicose aguda", "crises de pânico severas"],
    effectiveness: 85,
    timeRequired: 30,
    complexity: "média",
    keywords: ["pensamentos", "emoções", "comportamentos", "registro", "automáticos"],
  },
  {
    id: "tcc_behavioral_activation",
    name: "Ativação Comportamental",
    approach: "TCC",
    description: "Aumento gradual de atividades prazerosas para melhorar humor",
    indications: ["depressão", "apatia", "isolamento social", "falta de motivação"],
    contraindications: ["fadiga extrema", "catatonia"],
    effectiveness: 82,
    timeRequired: 20,
    complexity: "baixa",
    keywords: ["atividades", "prazer", "motivação", "comportamento", "humor"],
  },
  {
    id: "tcc_exposure",
    name: "Exposição Gradual",
    approach: "TCC",
    description: "Exposição progressiva a estímulos ansiógenos para reduzir medo",
    indications: ["fobias", "transtorno de pânico", "TEPT", "ansiedade generalizada"],
    contraindications: ["psicose", "risco iminente"],
    effectiveness: 88,
    timeRequired: 45,
    complexity: "alta",
    keywords: ["exposição", "medo", "ansiedade", "fobia", "gradual"],
  },
  {
    id: "tcc_cognitive_restructuring",
    name: "Reestruturação Cognitiva",
    approach: "TCC",
    description: "Identificação e modificação de pensamentos disfuncionais",
    indications: ["depressão", "ansiedade", "baixa autoestima", "perfeccionismo"],
    contraindications: ["déficit cognitivo severo"],
    effectiveness: 84,
    timeRequired: 40,
    complexity: "média",
    keywords: ["pensamentos", "crenças", "reestruturação", "cognitivo", "disfuncional"],
  },
  {
    id: "tcc_problem_solving",
    name: "Resolução de Problemas",
    approach: "TCC",
    description: "Método estruturado para identificar e resolver problemas",
    indications: ["estresse", "conflitos", "tomada de decisão", "ansiedade situacional"],
    contraindications: [],
    effectiveness: 80,
    timeRequired: 35,
    complexity: "média",
    keywords: ["problemas", "solução", "decisão", "estratégia", "planejamento"],
  },

  // ─── Terapia do Esquema ───
  {
    id: "schema_imagery",
    name: "Imaginação Guiada de Esquema",
    approach: "Esquema",
    description: "Técnica de imaginação para acessar e modificar esquemas maladaptativos",
    indications: ["trauma", "relacionamentos disfuncionais", "padrões repetitivos", "abandono"],
    contraindications: ["psicose", "dissociação severa"],
    effectiveness: 86,
    timeRequired: 50,
    complexity: "alta",
    keywords: ["imaginação", "esquema", "trauma", "padrões", "guiada"],
  },
  {
    id: "schema_chair_dialogue",
    name: "Diálogo entre Cadeiras (Esquema)",
    approach: "Esquema",
    description: "Diálogo entre diferentes partes do self para trabalhar conflitos internos",
    indications: ["conflito interno", "ambivalência", "relacionamentos", "identidade"],
    contraindications: ["psicose", "dissociação"],
    effectiveness: 83,
    timeRequired: 40,
    complexity: "alta",
    keywords: ["diálogo", "cadeiras", "partes", "conflito", "interno"],
  },
  {
    id: "schema_limited_reparenting",
    name: "Reparenting Limitado",
    approach: "Esquema",
    description: "Terapeuta oferece suporte emocional para reparar necessidades não atendidas",
    indications: ["privação emocional", "abandono", "negligência", "apego inseguro"],
    contraindications: ["dependência excessiva", "transferência negativa"],
    effectiveness: 81,
    timeRequired: 45,
    complexity: "alta",
    keywords: ["reparenting", "apoio", "emocional", "necessidades", "cuidado"],
  },

  // ─── Gestalt ───
  {
    id: "gestalt_awareness",
    name: "Experimento de Consciência Corporal",
    approach: "Gestalt",
    description: "Aumento da consciência de sensações corporais e emoções",
    indications: ["dissociação", "ansiedade somática", "falta de contato", "bloqueios emocionais"],
    contraindications: [],
    effectiveness: 79,
    timeRequired: 25,
    complexity: "média",
    keywords: ["corpo", "consciência", "sensações", "emoções", "contato"],
  },
  {
    id: "gestalt_empty_chair",
    name: "Cadeira Vazia (Gestalt)",
    approach: "Gestalt",
    description: "Técnica para trabalhar com pessoas ausentes ou partes de si mesmo",
    indications: ["luto", "mágoa", "ressentimento", "relacionamentos não resolvidos"],
    contraindications: ["psicose", "dissociação severa"],
    effectiveness: 85,
    timeRequired: 35,
    complexity: "média",
    keywords: ["cadeira", "vazia", "diálogo", "ausente", "resolução"],
  },
  {
    id: "gestalt_exaggeration",
    name: "Exageração de Gestos",
    approach: "Gestalt",
    description: "Amplificação de gestos ou comportamentos para aumentar consciência",
    indications: ["bloqueios", "incongruência", "falta de expressão", "rigidez"],
    contraindications: [],
    effectiveness: 77,
    timeRequired: 20,
    complexity: "baixa",
    keywords: ["gestos", "exageração", "expressão", "consciência", "amplificação"],
  },

  // ─── Mindfulness e Meditação ───
  {
    id: "mindfulness_body_scan",
    name: "Varredura Corporal (Body Scan)",
    approach: "Mindfulness",
    description: "Meditação guiada focando atenção em diferentes partes do corpo",
    indications: ["ansiedade", "insônia", "dor crônica", "estresse", "dissociação"],
    contraindications: [],
    effectiveness: 80,
    timeRequired: 30,
    complexity: "baixa",
    keywords: ["corpo", "meditação", "atenção", "relaxamento", "consciência"],
  },
  {
    id: "mindfulness_breathing",
    name: "Respiração Consciente",
    approach: "Mindfulness",
    description: "Foco na respiração para acalmar o sistema nervoso",
    indications: ["ansiedade", "pânico", "raiva", "estresse agudo"],
    contraindications: [],
    effectiveness: 82,
    timeRequired: 15,
    complexity: "baixa",
    keywords: ["respiração", "calma", "foco", "presente", "nervoso"],
  },
  {
    id: "mindfulness_observation",
    name: "Observação Sem Julgamento",
    approach: "Mindfulness",
    description: "Prática de observar pensamentos e emoções sem julgamento",
    indications: ["ruminação", "ansiedade", "depressão", "autocrítica"],
    contraindications: [],
    effectiveness: 78,
    timeRequired: 20,
    complexity: "média",
    keywords: ["observação", "julgamento", "pensamentos", "emoções", "aceitação"],
  },

  // ─── Psicodrama ───
  {
    id: "psychodrama_role_play",
    name: "Dramatização de Papéis",
    approach: "Psicodrama",
    description: "Representação de situações para ganhar insight e praticar comportamentos",
    indications: ["relacionamentos", "assertividade", "conflitos", "habilidades sociais"],
    contraindications: ["psicose", "vergonha extrema"],
    effectiveness: 81,
    timeRequired: 40,
    complexity: "alta",
    keywords: ["dramatização", "papéis", "representação", "prática", "insight"],
  },
  {
    id: "psychodrama_doubling",
    name: "Técnica do Duplo",
    approach: "Psicodrama",
    description: "Terapeuta ou outro atua como 'duplo' para explorar sentimentos",
    indications: ["bloqueios emocionais", "ambivalência", "comunicação", "insight"],
    contraindications: ["psicose", "paranoia"],
    effectiveness: 79,
    timeRequired: 30,
    complexity: "alta",
    keywords: ["duplo", "espelho", "emoções", "exploração", "comunicação"],
  },

  // ─── Técnicas Integradas ───
  {
    id: "integrated_emotion_focused",
    name: "Terapia Focada em Emoções",
    approach: "Integrada",
    description: "Integração de técnicas para trabalhar com emoções primárias",
    indications: ["trauma", "depressão", "ansiedade", "relacionamentos"],
    contraindications: ["crise aguda"],
    effectiveness: 87,
    timeRequired: 50,
    complexity: "alta",
    keywords: ["emoções", "integrada", "primária", "trabalho", "processamento"],
  },
  {
    id: "integrated_narrative",
    name: "Terapia Narrativa",
    approach: "Integrada",
    description: "Reescrita da narrativa pessoal para mudança de perspectiva",
    indications: ["identidade", "trauma", "significado", "propósito"],
    contraindications: [],
    effectiveness: 83,
    timeRequired: 45,
    complexity: "média",
    keywords: ["narrativa", "história", "significado", "perspectiva", "reescrita"],
  },
  {
    id: "integrated_somatic",
    name: "Terapia Somática",
    approach: "Integrada",
    description: "Trabalho com corpo e emoções para liberar bloqueios",
    indications: ["trauma", "ansiedade", "bloqueios emocionais", "dissociação"],
    contraindications: ["psicose"],
    effectiveness: 84,
    timeRequired: 40,
    complexity: "alta",
    keywords: ["corpo", "somático", "bloqueios", "liberação", "integração"],
  },
];

/**
 * Calcula score de relevância de uma técnica para um caso específico
 */
export function calculateRelevanceScore(
  technique: TherapyTechnique,
  patientPresentation: string,
  mainThemes: string[],
  previousTechniques: { technique: string; effectiveness: number }[],
  patientHistory: string
): number {
  let score = 50; // Score base

  // Aumenta se a técnica foi efetiva antes
  const previousUse = previousTechniques.find(t => t.technique === technique.id);
  if (previousUse) {
    score += previousUse.effectiveness * 0.3;
  }

  // Aumenta se as indicações combinam com os temas
  const matchingIndications = technique.indications.filter(ind =>
    mainThemes.some(theme => theme.toLowerCase().includes(ind.toLowerCase())) ||
    patientPresentation.toLowerCase().includes(ind.toLowerCase())
  );
  score += matchingIndications.length * 10;

  // Aumenta se keywords combinam
  const matchingKeywords = technique.keywords.filter(kw =>
    patientHistory.toLowerCase().includes(kw.toLowerCase()) ||
    mainThemes.some(theme => theme.toLowerCase().includes(kw.toLowerCase()))
  );
  score += matchingKeywords.length * 5;

  // Penaliza se há contraindições
  const hasContraindications = technique.contraindications.some(contra =>
    patientHistory.toLowerCase().includes(contra.toLowerCase())
  );
  if (hasContraindications) {
    score -= 30;
  }

  // Normaliza entre 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Recomenda técnicas baseado no caso específico
 */
export function recommendTechniques(
  patientPresentation: string,
  mainThemes: string[],
  previousTechniques: { technique: string; effectiveness: number }[],
  patientHistory: string,
  topN: number = 5
): TechniqueRecommendation[] {
  const recommendations = techniqueKnowledgeBase
    .map(technique => ({
      technique,
      relevanceScore: calculateRelevanceScore(
        technique,
        patientPresentation,
        mainThemes,
        previousTechniques,
        patientHistory
      ),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topN)
    .map(({ technique, relevanceScore }) => ({
      technique,
      relevanceScore,
      reasoning: generateReasoning(technique, mainThemes, previousTechniques),
      expectedOutcome: generateExpectedOutcome(technique, mainThemes),
      alternativeTechniques: getAlternativeTechniques(technique, 2),
    }));

  return recommendations;
}

function generateReasoning(
  technique: TherapyTechnique,
  mainThemes: string[],
  previousTechniques: { technique: string; effectiveness: number }[]
): string {
  let reasoning = `A técnica "${technique.name}" é recomendada porque: `;

  const matchingThemes = mainThemes.filter(theme =>
    technique.indications.some(ind => ind.toLowerCase().includes(theme.toLowerCase()))
  );

  if (matchingThemes.length > 0) {
    reasoning += `é indicada para ${matchingThemes.join(", ")}. `;
  }

  const previousUse = previousTechniques.find(t => t.technique === technique.id);
  if (previousUse && previousUse.effectiveness > 70) {
    reasoning += `Teve boa efetividade (${previousUse.effectiveness}%) em sessões anteriores. `;
  }

  reasoning += `Abordagem ${technique.approach} com complexidade ${technique.complexity}.`;

  return reasoning;
}

function generateExpectedOutcome(technique: TherapyTechnique, mainThemes: string[]): string {
  const themes = mainThemes.slice(0, 2).join(" e ");
  return `Esperado: Redução de ${themes} através da aplicação de ${technique.name}, com foco em mudança de padrões e aumento de consciência.`;
}

function getAlternativeTechniques(
  currentTechnique: TherapyTechnique,
  count: number
): TherapyTechnique[] {
  return techniqueKnowledgeBase
    .filter(t => t.id !== currentTechnique.id && t.approach === currentTechnique.approach)
    .slice(0, count);
}

export default techniqueKnowledgeBase;
