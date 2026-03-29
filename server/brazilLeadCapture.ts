/**
 * Sistema de Coleta de Leads do Brasil Todo
 * Captura de leads por região com segmentação geográfica
 */

export interface BrazilianLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  state: string; // UF
  city?: string;
  region: "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul";
  interests: string[];
  captureSource: "instagram" | "youtube" | "whatsapp" | "website" | "referral";
  capturedAt: Date;
  status: "new" | "contacted" | "interested" | "qualified" | "converted";
  score: number; // 0-100
  notes?: string;
}

export interface RegionalMetrics {
  region: string;
  state: string;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgScore: number;
  topCities: Array<{ city: string; count: number }>;
}

export interface LeadSegment {
  id: string;
  name: string;
  criteria: {
    states: string[];
    interests: string[];
    minScore: number;
  };
  leads: BrazilianLead[];
  createdAt: Date;
}

// Mapa de estados por região
const BRAZIL_REGIONS: Record<string, string[]> = {
  norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "centro-oeste": ["DF", "GO", "MS", "MT"],
  sudeste: ["ES", "MG", "RJ", "SP"],
  sul: ["PR", "RS", "SC"],
};

/**
 * Identifica região pelo estado
 */
export function identifyRegion(state: string): "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul" {
  for (const [region, states] of Object.entries(BRAZIL_REGIONS)) {
    if (states.includes(state.toUpperCase())) {
      return region as any;
    }
  }
  return "sudeste"; // Default
}

/**
 * Captura lead do Brasil
 */
export async function captureBrazilianLead(
  name: string,
  email: string | undefined,
  phone: string | undefined,
  state: string,
  city: string | undefined,
  interests: string[],
  source: "instagram" | "youtube" | "whatsapp" | "website" | "referral"
): Promise<BrazilianLead | null> {
  try {
    const region = identifyRegion(state);

    const lead: BrazilianLead = {
      id: `lead_br_${Date.now()}`,
      name,
      email,
      phone,
      state: state.toUpperCase(),
      city,
      region,
      interests,
      captureSource: source,
      capturedAt: new Date(),
      status: "new",
      score: calculateLeadScore({ email, phone, interests }),
    };

    console.log(`✓ Lead capturado: ${name} - ${state}`);
    return lead;
  } catch (error) {
    console.error("Erro ao capturar lead:", error);
    return null;
  }
}

/**
 * Calcula score do lead
 */
export function calculateLeadScore(data: {
  email?: string;
  phone?: string;
  interests: string[];
}): number {
  let score = 0;

  // Email: +30 pontos
  if (data.email) score += 30;

  // Telefone: +30 pontos
  if (data.phone) score += 30;

  // Interesses: +10 pontos por interesse (máx 40)
  score += Math.min(40, data.interests.length * 10);

  return Math.min(100, score);
}

/**
 * Segmenta leads por região
 */
export async function segmentLeadsByRegion(leads: BrazilianLead[]): Promise<Record<string, BrazilianLead[]>> {
  try {
    const segments: Record<string, BrazilianLead[]> = {
      norte: [],
      nordeste: [],
      "centro-oeste": [],
      sudeste: [],
      sul: [],
    };

    leads.forEach((lead) => {
      segments[lead.region].push(lead);
    });

    console.log(`✓ Leads segmentados por região`);
    return segments;
  } catch (error) {
    console.error("Erro ao segmentar leads:", error);
    return {};
  }
}

/**
 * Calcula métricas por região
 */
export async function calculateRegionalMetrics(leads: BrazilianLead[]): Promise<RegionalMetrics[]> {
  try {
    const metricsMap: Record<string, RegionalMetrics> = {};

    leads.forEach((lead) => {
      const key = `${lead.region}_${lead.state}`;

      if (!metricsMap[key]) {
        metricsMap[key] = {
          region: lead.region,
          state: lead.state,
          totalLeads: 0,
          qualifiedLeads: 0,
          conversionRate: 0,
          avgScore: 0,
          topCities: [],
        };
      }

      metricsMap[key].totalLeads++;
      if (lead.status === "qualified" || lead.status === "converted") {
        metricsMap[key].qualifiedLeads++;
      }
      metricsMap[key].avgScore += lead.score;
    });

    // Calcular médias
    const metrics = Object.values(metricsMap).map((m) => {
      m.avgScore = Math.round(m.avgScore / m.totalLeads);
      m.conversionRate = (m.qualifiedLeads / m.totalLeads) * 100;
      return m;
    });

    return metrics.sort((a, b) => b.totalLeads - a.totalLeads);
  } catch (error) {
    console.error("Erro ao calcular métricas:", error);
    return [];
  }
}

/**
 * Identifica oportunidades por região
 */
export async function identifyRegionalOpportunities(leads: BrazilianLead[]): Promise<Array<{
  region: string;
  opportunity: string;
  score: number;
  recommendation: string;
}>> {
  try {
    const metrics = await calculateRegionalMetrics(leads);

    const opportunities = metrics.map((m) => {
      let opportunity = "";
      let score = 0;
      let recommendation = "";

      if (m.totalLeads > 100 && m.conversionRate < 10) {
        opportunity = "Baixa conversão em região com alto volume";
        score = 80;
        recommendation = "Revisar estratégia de conteúdo para esta região";
      } else if (m.totalLeads > 50 && m.conversionRate > 30) {
        opportunity = "Alta conversão - escalar investimento";
        score = 90;
        recommendation = "Aumentar investimento em publicidade nesta região";
      } else if (m.totalLeads < 20 && m.avgScore > 70) {
        opportunity = "Leads qualificados mas poucos";
        score = 70;
        recommendation = "Aumentar visibilidade nesta região";
      } else {
        opportunity = "Região com potencial";
        score = 50;
        recommendation = "Monitorar e testar novas estratégias";
      }

      return {
        region: `${m.state} (${m.region})`,
        opportunity,
        score,
        recommendation,
      };
    });

    return opportunities;
  } catch (error) {
    console.error("Erro ao identificar oportunidades:", error);
    return [];
  }
}

/**
 * Cria segmento de leads
 */
export async function createLeadSegment(
  name: string,
  states: string[],
  interests: string[],
  minScore: number = 50
): Promise<LeadSegment | null> {
  try {
    const segment: LeadSegment = {
      id: `segment_${Date.now()}`,
      name,
      criteria: {
        states: states.map((s) => s.toUpperCase()),
        interests,
        minScore,
      },
      leads: [],
      createdAt: new Date(),
    };

    console.log(`✓ Segmento de leads criado: ${name}`);
    return segment;
  } catch (error) {
    console.error("Erro ao criar segmento:", error);
    return null;
  }
}

/**
 * Adiciona leads ao segmento
 */
export async function addLeadsToSegment(
  segment: LeadSegment,
  leads: BrazilianLead[]
): Promise<LeadSegment | null> {
  try {
    const filtered = leads.filter(
      (lead) =>
        segment.criteria.states.includes(lead.state) &&
        lead.interests.some((i) => segment.criteria.interests.includes(i)) &&
        lead.score >= segment.criteria.minScore
    );

    segment.leads = filtered;

    console.log(`✓ ${filtered.length} leads adicionados ao segmento ${segment.name}`);
    return segment;
  } catch (error) {
    console.error("Erro ao adicionar leads:", error);
    return null;
  }
}

/**
 * Gera mapa de calor de leads por estado
 */
export async function generateLeadHeatmap(leads: BrazilianLead[]): Promise<Record<string, number>> {
  try {
    const heatmap: Record<string, number> = {};

    leads.forEach((lead) => {
      heatmap[lead.state] = (heatmap[lead.state] || 0) + 1;
    });

    return heatmap;
  } catch (error) {
    console.error("Erro ao gerar heatmap:", error);
    return {};
  }
}

/**
 * Gera relatório de leads por região
 */
export async function generateRegionalReport(leads: BrazilianLead[]): Promise<string> {
  try {
    let report = "# Relatório de Leads - Brasil\n\n";

    const metrics = await calculateRegionalMetrics(leads);

    report += `## Resumo Geral\n`;
    report += `- Total de Leads: ${leads.length}\n`;
    report += `- Regiões Ativas: ${metrics.length}\n`;
    report += `- Score Médio: ${Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)}\n\n`;

    report += `## Por Região\n`;
    metrics.forEach((m) => {
      report += `### ${m.state} (${m.region})\n`;
      report += `- Total: ${m.totalLeads} leads\n`;
      report += `- Qualificados: ${m.qualifiedLeads}\n`;
      report += `- Taxa de Conversão: ${m.conversionRate.toFixed(2)}%\n`;
      report += `- Score Médio: ${m.avgScore}\n\n`;
    });

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}

/**
 * Exporta leads para CSV
 */
export async function exportLeadsToCSV(leads: BrazilianLead[]): Promise<string> {
  try {
    let csv = "ID,Nome,Email,Telefone,Estado,Cidade,Região,Interesses,Fonte,Status,Score,Data\n";

    leads.forEach((lead) => {
      csv += `${lead.id},"${lead.name}","${lead.email || ""}","${lead.phone || ""}",${lead.state},"${lead.city || ""}",${lead.region},"${lead.interests.join("; ")}",${lead.captureSource},${lead.status},${lead.score},${lead.capturedAt.toISOString()}\n`;
    });

    return csv;
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
    return "";
  }
}
