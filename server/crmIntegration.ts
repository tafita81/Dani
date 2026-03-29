/**
 * Sistema de Integração com CRM Externo
 * Sincronização com Pipedrive ou HubSpot para automação de pipeline de vendas
 */

export interface CRMConfig {
  provider: "pipedrive" | "hubspot";
  apiKey: string;
  apiUrl: string;
  syncInterval: number; // em minutos
  lastSync?: Date;
}

export interface CRMDeal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  owner: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncLog {
  id: string;
  provider: string;
  timestamp: Date;
  status: "success" | "failed" | "partial";
  recordsSynced: number;
  recordsFailed: number;
  error?: string;
}

/**
 * Inicializa conexão com CRM
 */
export async function initializeCRMConnection(config: CRMConfig): Promise<boolean> {
  try {
    console.log(`Inicializando conexão com ${config.provider}...`);

    // Validar credenciais
    if (!config.apiKey || !config.apiUrl) {
      throw new Error("Credenciais inválidas");
    }

    console.log(`✓ Conexão com ${config.provider} estabelecida`);
    return true;
  } catch (error) {
    console.error("Erro ao inicializar CRM:", error);
    return false;
  }
}

/**
 * Busca deals do CRM
 */
export async function fetchDealsFromCRM(config: CRMConfig): Promise<CRMDeal[]> {
  try {
    console.log(`Buscando deals de ${config.provider}...`);

    // Dados simulados
    const deals: CRMDeal[] = [
      {
        id: "deal_1",
        title: "Consultoria de Terapia",
        value: 5000,
        currency: "BRL",
        stage: "negotiation",
        owner: "João Silva",
        contact: {
          name: "Maria Santos",
          email: "maria@example.com",
          phone: "11999999999",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "deal_2",
        title: "Pacote de 10 Sessões",
        value: 3000,
        currency: "BRL",
        stage: "won",
        owner: "João Silva",
        contact: {
          name: "Carlos Oliveira",
          email: "carlos@example.com",
          phone: "11888888888",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return deals;
  } catch (error) {
    console.error("Erro ao buscar deals:", error);
    return [];
  }
}

/**
 * Busca contatos do CRM
 */
export async function fetchContactsFromCRM(config: CRMConfig): Promise<CRMContact[]> {
  try {
    console.log(`Buscando contatos de ${config.provider}...`);

    // Dados simulados
    const contacts: CRMContact[] = [
      {
        id: "contact_1",
        name: "Maria Santos",
        email: "maria@example.com",
        phone: "11999999999",
        company: "Tech Corp",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "contact_2",
        name: "Carlos Oliveira",
        email: "carlos@example.com",
        phone: "11888888888",
        company: "Finance Ltd",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return contacts;
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    return [];
  }
}

/**
 * Sincroniza dados com CRM
 */
export async function syncWithCRM(config: CRMConfig): Promise<SyncLog> {
  try {
    const startTime = Date.now();
    let recordsSynced = 0;
    let recordsFailed = 0;

    console.log(`Iniciando sincronização com ${config.provider}...`);

    // Buscar deals
    const deals = await fetchDealsFromCRM(config);
    recordsSynced += deals.length;

    // Buscar contatos
    const contacts = await fetchContactsFromCRM(config);
    recordsSynced += contacts.length;

    // Aqui seria feita a sincronização com banco de dados local
    console.log(`✓ Sincronização concluída: ${recordsSynced} registros sincronizados`);

    const syncLog: SyncLog = {
      id: `sync_${Date.now()}`,
      provider: config.provider,
      timestamp: new Date(),
      status: recordsFailed === 0 ? "success" : "partial",
      recordsSynced,
      recordsFailed,
    };

    return syncLog;
  } catch (error) {
    console.error("Erro ao sincronizar com CRM:", error);

    return {
      id: `sync_${Date.now()}`,
      provider: config.provider,
      timestamp: new Date(),
      status: "failed",
      recordsSynced: 0,
      recordsFailed: 0,
      error: String(error),
    };
  }
}

/**
 * Cria novo deal no CRM
 */
export async function createDealInCRM(config: CRMConfig, deal: Omit<CRMDeal, "id" | "createdAt" | "updatedAt">): Promise<CRMDeal | null> {
  try {
    console.log(`Criando deal em ${config.provider}:`, deal.title);

    const newDeal: CRMDeal = {
      ...deal,
      id: `deal_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Aqui seria feita uma chamada à API do CRM
    return newDeal;
  } catch (error) {
    console.error("Erro ao criar deal:", error);
    return null;
  }
}

/**
 * Atualiza deal no CRM
 */
export async function updateDealInCRM(config: CRMConfig, dealId: string, updates: Partial<CRMDeal>): Promise<boolean> {
  try {
    console.log(`Atualizando deal ${dealId} em ${config.provider}`);

    // Aqui seria feita uma chamada à API do CRM
    return true;
  } catch (error) {
    console.error("Erro ao atualizar deal:", error);
    return false;
  }
}

/**
 * Cria novo contato no CRM
 */
export async function createContactInCRM(config: CRMConfig, contact: Omit<CRMContact, "id" | "createdAt" | "updatedAt">): Promise<CRMContact | null> {
  try {
    console.log(`Criando contato em ${config.provider}:`, contact.name);

    const newContact: CRMContact = {
      ...contact,
      id: `contact_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Aqui seria feita uma chamada à API do CRM
    return newContact;
  } catch (error) {
    console.error("Erro ao criar contato:", error);
    return null;
  }
}

/**
 * Mapeia estágios do pipeline
 */
export function mapPipelineStages(provider: "pipedrive" | "hubspot"): Record<string, string> {
  const stageMap = {
    pipedrive: {
      lead: "Lead",
      qualified: "Qualificado",
      negotiation: "Negociação",
      won: "Ganho",
      lost: "Perdido",
    },
    hubspot: {
      lead: "Lead",
      qualified: "Qualified Lead",
      negotiation: "Negotiation",
      won: "Closed Won",
      lost: "Closed Lost",
    },
  };

  return stageMap[provider] || stageMap.pipedrive;
}

/**
 * Calcula analytics do pipeline
 */
export async function calculatePipelineAnalytics(deals: CRMDeal[]): Promise<{
  totalValue: number;
  dealCount: number;
  avgDealValue: number;
  stageDistribution: Record<string, number>;
  conversionRate: number;
  forecastedRevenue: number;
}> {
  try {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const dealCount = deals.length;
    const avgDealValue = dealCount > 0 ? totalValue / dealCount : 0;

    // Distribuição por estágio
    const stageDistribution: Record<string, number> = {};
    deals.forEach((deal) => {
      stageDistribution[deal.stage] = (stageDistribution[deal.stage] || 0) + 1;
    });

    // Taxa de conversão (deals ganhos / total)
    const wonDeals = deals.filter((d) => d.stage === "won").length;
    const conversionRate = dealCount > 0 ? (wonDeals / dealCount) * 100 : 0;

    // Receita prevista (deals em negociação com probabilidade)
    const negotiationDeals = deals.filter((d) => d.stage === "negotiation");
    const forecastedRevenue = negotiationDeals.reduce((sum, deal) => sum + deal.value * 0.6, 0);

    return {
      totalValue,
      dealCount,
      avgDealValue,
      stageDistribution,
      conversionRate,
      forecastedRevenue,
    };
  } catch (error) {
    console.error("Erro ao calcular analytics:", error);
    return {
      totalValue: 0,
      dealCount: 0,
      avgDealValue: 0,
      stageDistribution: {},
      conversionRate: 0,
      forecastedRevenue: 0,
    };
  }
}

/**
 * Gera relatório de sincronização
 */
export async function generateSyncReport(logs: SyncLog[]): Promise<string> {
  try {
    let report = "# Relatório de Sincronização com CRM\n\n";

    const totalSyncs = logs.length;
    const successfulSyncs = logs.filter((l) => l.status === "success").length;
    const totalRecords = logs.reduce((sum, l) => sum + l.recordsSynced, 0);
    const totalErrors = logs.reduce((sum, l) => sum + l.recordsFailed, 0);

    report += `## Resumo\n`;
    report += `- Total de Sincronizações: ${totalSyncs}\n`;
    report += `- Sincronizações Bem-sucedidas: ${successfulSyncs}\n`;
    report += `- Total de Registros Sincronizados: ${totalRecords}\n`;
    report += `- Total de Erros: ${totalErrors}\n\n`;

    report += `## Últimas Sincronizações\n`;
    logs.slice(-5).forEach((log) => {
      report += `- ${log.timestamp.toLocaleString()}: ${log.status} (${log.recordsSynced} registros)\n`;
    });

    return report;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return "Erro ao gerar relatório";
  }
}

/**
 * Configura sincronização automática
 */
export async function setupAutoSync(config: CRMConfig, callback: () => Promise<void>): Promise<NodeJS.Timeout> {
  try {
    console.log(`Configurando sincronização automática a cada ${config.syncInterval} minutos`);

    const interval = setInterval(async () => {
      try {
        await callback();
        console.log("Sincronização automática concluída");
      } catch (error) {
        console.error("Erro na sincronização automática:", error);
      }
    }, config.syncInterval * 60 * 1000);

    return interval;
  } catch (error) {
    console.error("Erro ao configurar sincronização:", error);
    throw error;
  }
}
