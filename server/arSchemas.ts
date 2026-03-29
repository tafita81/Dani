/**
 * AR para Esquemas Emocionais — Inovação Quântica 2026
 * Visualização em realidade aumentada de esquemas emocionais
 * Projeção: 300-500 consultas/mês
 */

// ═══════════════════════════════════════════════════════════════
// ─── MODELOS 3D DE ESQUEMAS ───
// ═══════════════════════════════════════════════════════════════

export const emotionalSchemas3D = {
  abandonment: {
    name: "Esquema de Abandono",
    color: "#FF6B6B",
    description: "Medo de ser deixado de lado ou abandonado",
    visualization: {
      shape: "sphere",
      particles: "falling",
      animation: "pulsing",
      intensity: 0.8,
    },
    interventions: [
      "Técnicas de segurança emocional",
      "Trabalhar confiança em relacionamentos",
      "Explorar origens do medo",
    ],
  },

  mistrust: {
    name: "Esquema de Desconfiança",
    color: "#FFA500",
    description: "Expectativa de que os outros vão magoar ou enganar",
    visualization: {
      shape: "cube",
      particles: "rotating",
      animation: "fragmented",
      intensity: 0.7,
    },
    interventions: [
      "Construir confiança gradualmente",
      "Validar experiências passadas",
      "Desenvolver discernimento",
    ],
  },

  deprivation: {
    name: "Esquema de Privação Emocional",
    color: "#9B59B6",
    description: "Crença de que necessidades emocionais não serão atendidas",
    visualization: {
      shape: "torus",
      particles: "draining",
      animation: "fading",
      intensity: 0.9,
    },
    interventions: [
      "Validar necessidades emocionais",
      "Aprender a pedir ajuda",
      "Construir relacionamentos nutrientes",
    ],
  },

  defectiveness: {
    name: "Esquema de Defectibilidade",
    color: "#E74C3C",
    description: "Crença de ser defeituoso, indigno ou fundamentalmente flawed",
    visualization: {
      shape: "broken_sphere",
      particles: "scattered",
      animation: "disintegrating",
      intensity: 0.95,
    },
    interventions: [
      "Autoaceitação e autocompaixão",
      "Questionar crenças limitantes",
      "Desenvolver autossabotagem",
    ],
  },

  social_isolation: {
    name: "Esquema de Isolamento Social",
    color: "#3498DB",
    description: "Sentimento de estar separado do mundo",
    visualization: {
      shape: "isolated_sphere",
      particles: "none",
      animation: "floating_alone",
      intensity: 0.85,
    },
    interventions: [
      "Construir conexões sociais",
      "Superar timidez social",
      "Encontrar comunidade",
    ],
  },

  failure: {
    name: "Esquema de Fracasso",
    color: "#34495E",
    description: "Crença de ser incompetente ou fadado ao fracasso",
    visualization: {
      shape: "descending_sphere",
      particles: "falling",
      animation: "sinking",
      intensity: 0.8,
    },
    interventions: [
      "Reconhecer sucessos passados",
      "Definir metas realistas",
      "Desenvolver resiliência",
    ],
  },

  dependence: {
    name: "Esquema de Dependência",
    color: "#16A085",
    description: "Incapacidade percebida de funcionar independentemente",
    visualization: {
      shape: "connected_spheres",
      particles: "linking",
      animation: "dependent",
      intensity: 0.7,
    },
    interventions: [
      "Desenvolver autonomia",
      "Aumentar autoconfiança",
      "Aprender habilidades de vida",
    ],
  },

  vulnerability: {
    name: "Esquema de Vulnerabilidade",
    color: "#C0392B",
    description: "Medo de que algo terrível vai acontecer",
    visualization: {
      shape: "fragile_sphere",
      particles: "threatening",
      animation: "trembling",
      intensity: 0.9,
    },
    interventions: [
      "Técnicas de segurança",
      "Gerenciamento de ansiedade",
      "Exposição gradual",
    ],
  },

  enmeshment: {
    name: "Esquema de Fusão",
    color: "#8E44AD",
    description: "Falta de identidade separada dos outros",
    visualization: {
      shape: "merged_spheres",
      particles: "blending",
      animation: "merging",
      intensity: 0.75,
    },
    interventions: [
      "Desenvolver identidade pessoal",
      "Estabelecer limites saudáveis",
      "Explorar valores individuais",
    ],
  },

  subjugation: {
    name: "Esquema de Subjugação",
    color: "#D35400",
    description: "Sacrifício excessivo de suas próprias necessidades",
    visualization: {
      shape: "compressed_sphere",
      particles: "constraining",
      animation: "compressing",
      intensity: 0.8,
    },
    interventions: [
      "Aprender a dizer não",
      "Valorizar necessidades próprias",
      "Desenvolver assertividade",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE CENA AR ───
// ═══════════════════════════════════════════════════════════════

export function generateARScene(schemaId: keyof typeof emotionalSchemas3D) {
  const schema = emotionalSchemas3D[schemaId];

  return {
    schemaId,
    name: schema.name,
    description: schema.description,
    arModel: {
      format: "gltf",
      url: `https://models.assistenteclinico.com/schemas/${schemaId}.gltf`,
      scale: 1.5,
      position: { x: 0, y: 0, z: -2 },
    },
    visualization: schema.visualization,
    color: schema.color,
    interactions: [
      {
        gesture: "tap",
        action: "show_details",
        description: "Toque para ver detalhes",
      },
      {
        gesture: "pinch",
        action: "scale",
        description: "Pizzique para aumentar/diminuir",
      },
      {
        gesture: "rotate",
        action: "rotate_model",
        description: "Gire para visualizar de todos os ângulos",
      },
    ],
    interventions: schema.interventions,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── ANIMAÇÕES DE TRANSFORMAÇÃO ───
// ═══════════════════════════════════════════════════════════════

export function generateTransformationAnimation(
  fromSchema: keyof typeof emotionalSchemas3D,
  toSchema: keyof typeof emotionalSchemas3D
) {
  const from = emotionalSchemas3D[fromSchema];
  const to = emotionalSchemas3D[toSchema];

  return {
    duration: 3000, // 3 segundos
    steps: [
      {
        time: 0,
        state: {
          color: from.color,
          shape: from.visualization.shape,
          intensity: from.visualization.intensity,
        },
      },
      {
        time: 1500,
        state: {
          color: `mix(${from.color}, ${to.color})`,
          shape: "sphere", // Forma intermediária
          intensity: 0.5,
        },
      },
      {
        time: 3000,
        state: {
          color: to.color,
          shape: to.visualization.shape,
          intensity: to.visualization.intensity,
        },
      },
    ],
    description: `Transformação de ${from.name} para ${to.name}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── RASTREAMENTO DE PROGRESSO EM AR ───
// ═══════════════════════════════════════════════════════════════

export function trackAREngagement(sessionData: {
  schemaViewed: keyof typeof emotionalSchemas3D;
  timeSpent: number;
  interactionsCount: number;
  interventionSelected: string;
}) {
  return {
    ...sessionData,
    engagementScore: calculateEngagementScore(sessionData),
    insights: generateARInsights(sessionData),
    nextRecommendation: getNextRecommendation(sessionData),
  };
}

function calculateEngagementScore(data: any): number {
  return Math.min(100, (data.timeSpent / 60) * 10 + data.interactionsCount * 5);
}

function generateARInsights(data: any): string[] {
  const insights: string[] = [];

  if (data.timeSpent > 300) {
    insights.push("Você passou tempo significativo explorando este esquema. Ótimo autoconhecimento!");
  }

  if (data.interactionsCount > 5) {
    insights.push("Você explorou múltiplas perspectivas. Isso mostra curiosidade genuína.");
  }

  if (data.interventionSelected) {
    insights.push(`Você selecionou: ${data.interventionSelected}. Ótima escolha para começar!`);
  }

  return insights;
}

function getNextRecommendation(data: any): {
  schemaId: keyof typeof emotionalSchemas3D;
  reason: string;
} {
  // Lógica para recomendar próximo esquema baseado no atual
  const schemaMap: Record<string, keyof typeof emotionalSchemas3D> = {
    abandonment: "mistrust",
    mistrust: "deprivation",
    deprivation: "defectiveness",
    defectiveness: "social_isolation",
    social_isolation: "failure",
    failure: "dependence",
    dependence: "vulnerability",
    vulnerability: "enmeshment",
    enmeshment: "subjugation",
    subjugation: "abandonment",
  };

  const nextSchema = schemaMap[data.schemaViewed as string] || "abandonment";

  return {
    schemaId: nextSchema,
    reason: "Explorar o próximo esquema relacionado pode aprofundar seu autoconhecimento.",
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── INTEGRAÇÃO COM SESSÃO CLÍNICA ───
// ═══════════════════════════════════════════════════════════════

export function integrateARIntoSession(sessionId: string, identifiedSchemas: string[]) {
  return {
    sessionId,
    arExperience: {
      title: "Visualize seus Esquemas Emocionais",
      description: "Explore seus esquemas identificados em realidade aumentada",
      schemas: identifiedSchemas.map((schemaId) => generateARScene(schemaId as keyof typeof emotionalSchemas3D)),
      duration: "10-15 minutos",
      benefits: [
        "Melhor compreensão visual dos esquemas",
        "Experiência imersiva e memorável",
        "Conexão emocional com o trabalho terapêutico",
        "Ferramenta para auto-reflexão entre sessões",
      ],
    },
    recommendation: "Use esta experiência AR para aprofundar sua compreensão dos esquemas identificados.",
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── PROJEÇÃO DE CRESCIMENTO ───
// ═══════════════════════════════════════════════════════════════

export function getARProjection() {
  return {
    feature: "AR para Esquemas Emocionais",
    monthlyProjection: "300-500 consultas/mês",
    uniqueValue: "Primeira plataforma com visualização AR de esquemas emocionais",
    strategy: [
      "Oferecer experiência AR como diferencial premium",
      "Integrar com terapia do esquema (Young)",
      "Criar biblioteca de 18 esquemas em 3D",
      "Permitir compartilhamento de experiências AR",
      "Usar como ferramenta de marketing viral",
    ],
    technicalRequirements: [
      "WebAR (funciona no navegador, sem app)",
      "Modelos 3D otimizados (< 5MB)",
      "Suporte para iOS 12+ e Android 7+",
      "Rastreamento de plano para colocação",
    ],
  };
}
