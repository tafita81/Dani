/**
 * Serviço de Segmentação de Inscritos
 * Permite filtrar e agrupar inscritos por critérios específicos
 */

interface Subscriber {
  id: string;
  email: string;
  name: string;
  interest: "consultas" | "informacoes" | "ambos";
  status: "active" | "notified" | "unsubscribed";
  createdAt: Date;
  openRate: number;
  clickRate: number;
  engagementScore: number;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SegmentCriteria {
  interest?: "consultas" | "informacoes" | "ambos";
  status?: "active" | "notified" | "unsubscribed";
  minEngagementScore?: number;
  maxEngagementScore?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  minOpenRate?: number;
  maxOpenRate?: number;
  minClickRate?: number;
  maxClickRate?: number;
}

class SegmentationService {
  private segments: Map<string, Segment> = new Map();
  private subscribers: Subscriber[] = [];

  /**
   * Adicionar inscrito
   */
  addSubscriber(subscriber: Subscriber): void {
    this.subscribers.push(subscriber);
  }

  /**
   * Carregar inscritos do banco
   */
  loadSubscribers(subscribers: Subscriber[]): void {
    this.subscribers = subscribers;
    console.log(`[Segmentation] ${subscribers.length} inscritos carregados`);
  }

  /**
   * Criar novo segmento
   */
  createSegment(name: string, description: string, criteria: SegmentCriteria): Segment {
    const id = `segment-${Date.now()}`;
    const subscribers = this.filterSubscribers(criteria);

    const segment: Segment = {
      id,
      name,
      description,
      criteria,
      subscriberCount: subscribers.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.segments.set(id, segment);
    console.log(`[Segmentation] Segmento "${name}" criado com ${subscribers.length} inscritos`);

    return segment;
  }

  /**
   * Filtrar inscritos por critérios
   */
  filterSubscribers(criteria: SegmentCriteria): Subscriber[] {
    return this.subscribers.filter((subscriber) => {
      // Filtro por interesse
      if (criteria.interest && subscriber.interest !== criteria.interest) {
        return false;
      }

      // Filtro por status
      if (criteria.status && subscriber.status !== criteria.status) {
        return false;
      }

      // Filtro por score de engajamento
      if (criteria.minEngagementScore !== undefined && subscriber.engagementScore < criteria.minEngagementScore) {
        return false;
      }
      if (criteria.maxEngagementScore !== undefined && subscriber.engagementScore > criteria.maxEngagementScore) {
        return false;
      }

      // Filtro por data de criação
      if (criteria.createdAfter && subscriber.createdAt < criteria.createdAfter) {
        return false;
      }
      if (criteria.createdBefore && subscriber.createdAt > criteria.createdBefore) {
        return false;
      }

      // Filtro por taxa de abertura
      if (criteria.minOpenRate !== undefined && subscriber.openRate < criteria.minOpenRate) {
        return false;
      }
      if (criteria.maxOpenRate !== undefined && subscriber.openRate > criteria.maxOpenRate) {
        return false;
      }

      // Filtro por taxa de clique
      if (criteria.minClickRate !== undefined && subscriber.clickRate < criteria.minClickRate) {
        return false;
      }
      if (criteria.maxClickRate !== undefined && subscriber.clickRate > criteria.maxClickRate) {
        return false;
      }

      return true;
    });
  }

  /**
   * Obter inscritos de um segmento
   */
  getSegmentSubscribers(segmentId: string): Subscriber[] {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      console.warn(`[Segmentation] Segmento ${segmentId} não encontrado`);
      return [];
    }

    return this.filterSubscribers(segment.criteria);
  }

  /**
   * Listar todos os segmentos
   */
  listSegments(): Segment[] {
    return Array.from(this.segments.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Atualizar segmento
   */
  updateSegment(segmentId: string, updates: Partial<Segment>): Segment | null {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      return null;
    }

    const updated = {
      ...segment,
      ...updates,
      updatedAt: new Date(),
    };

    this.segments.set(segmentId, updated);
    return updated;
  }

  /**
   * Deletar segmento
   */
  deleteSegment(segmentId: string): boolean {
    return this.segments.delete(segmentId);
  }

  /**
   * Criar segmentos pré-definidos
   */
  createDefaultSegments(): void {
    // Segmento: Inscritos Altamente Engajados
    this.createSegment("Altamente Engajados", "Inscritos com score de engajamento > 80", {
      minEngagementScore: 80,
      status: "active",
    });

    // Segmento: Inscritos Interessados em Consultas
    this.createSegment("Interessados em Consultas", "Inscritos interessados em consultas", {
      interest: "consultas",
      status: "active",
    });

    // Segmento: Inscritos Interessados em Informações
    this.createSegment("Interessados em Informações", "Inscritos interessados em informações", {
      interest: "informacoes",
      status: "active",
    });

    // Segmento: Inscritos Inativos
    this.createSegment("Inativos", "Inscritos com baixo engajamento", {
      maxEngagementScore: 30,
      status: "active",
    });

    // Segmento: Inscritos Recentes
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.createSegment("Inscritos Recentes", "Inscritos nos últimos 7 dias", {
      createdAfter: sevenDaysAgo,
      status: "active",
    });

    // Segmento: Inscritos com Alta Taxa de Abertura
    this.createSegment("Alta Taxa de Abertura", "Inscritos com taxa de abertura > 50%", {
      minOpenRate: 50,
      status: "active",
    });

    // Segmento: Inscritos com Baixa Taxa de Clique
    this.createSegment("Baixa Taxa de Clique", "Inscritos com taxa de clique < 10%", {
      maxClickRate: 10,
      status: "active",
    });

    console.log("[Segmentation] Segmentos padrão criados");
  }

  /**
   * Gerar recomendações de segmentação
   */
  generateSegmentationRecommendations() {
    const recommendations = [];

    // Análise de engajamento
    const avgEngagement =
      this.subscribers.reduce((sum, s) => sum + s.engagementScore, 0) / this.subscribers.length || 0;

    if (avgEngagement < 50) {
      recommendations.push({
        type: "engagement",
        message: "Engajamento médio baixo. Considere personalizar conteúdo para segmentos específicos.",
        action: "Criar segmentos por interesse e personalizar newsletters",
      });
    }

    // Análise de taxa de abertura
    const avgOpenRate = this.subscribers.reduce((sum, s) => sum + s.openRate, 0) / this.subscribers.length || 0;

    if (avgOpenRate < 30) {
      recommendations.push({
        type: "open_rate",
        message: "Taxa de abertura abaixo da média. Teste diferentes horários e assuntos.",
        action: "Segmentar por hora de envio preferida",
      });
    }

    // Análise de inscritos inativos
    const inactiveCount = this.subscribers.filter((s) => s.engagementScore < 30).length;
    const inactivePercentage = (inactiveCount / this.subscribers.length) * 100;

    if (inactivePercentage > 20) {
      recommendations.push({
        type: "inactive",
        message: `${inactivePercentage.toFixed(1)}% dos inscritos estão inativos.`,
        action: "Criar campanha de re-engajamento para inscritos inativos",
      });
    }

    return recommendations;
  }

  /**
   * Exportar segmento para envio de newsletter
   */
  exportSegmentForNewsletter(segmentId: string) {
    const subscribers = this.getSegmentSubscribers(segmentId);
    const segment = this.segments.get(segmentId);

    return {
      segmentId,
      segmentName: segment?.name,
      subscriberCount: subscribers.length,
      subscribers: subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        name: s.name,
      })),
      exportedAt: new Date(),
    };
  }

  /**
   * Análise de segmentos
   */
  analyzeSegments() {
    const analysis = {
      totalSegments: this.segments.size,
      totalSubscribers: this.subscribers.length,
      segments: [] as any[],
    };

    for (const segment of this.segments.values()) {
      const subscribers = this.getSegmentSubscribers(segment.id);
      const avgEngagement =
        subscribers.reduce((sum, s) => sum + s.engagementScore, 0) / subscribers.length || 0;
      const avgOpenRate = subscribers.reduce((sum, s) => sum + s.openRate, 0) / subscribers.length || 0;
      const avgClickRate = subscribers.reduce((sum, s) => sum + s.clickRate, 0) / subscribers.length || 0;

      analysis.segments.push({
        id: segment.id,
        name: segment.name,
        subscriberCount: subscribers.length,
        avgEngagement: avgEngagement.toFixed(1),
        avgOpenRate: avgOpenRate.toFixed(1),
        avgClickRate: avgClickRate.toFixed(1),
        percentage: ((subscribers.length / this.subscribers.length) * 100).toFixed(1),
      });
    }

    return analysis;
  }

  /**
   * Limpar segmentos
   */
  clearSegments(): void {
    this.segments.clear();
    console.log("[Segmentation] Todos os segmentos foram limpos");
  }
}

// Instância global
let segmentationService: SegmentationService | null = null;

/**
 * Obter instância do serviço de segmentação
 */
export function getSegmentationService(): SegmentationService {
  if (!segmentationService) {
    segmentationService = new SegmentationService();
  }
  return segmentationService;
}

export { SegmentationService, Segment, SegmentCriteria, Subscriber };
