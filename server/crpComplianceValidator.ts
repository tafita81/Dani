/**
 * Sistema de Validação de Conformidade com Regulamentações do CRP
 * Garante que todo conteúdo respeita as normas do Conselho Regional de Psicologia
 */

export interface ComplianceValidation {
  contentId: string;
  isCompliant: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  violations: Array<{
    type: string;
    severity: "warning" | "error" | "critical";
    message: string;
    suggestion: string;
  }>;
  score: number; // 0-100
  recommendations: string[];
  canPublish: boolean;
}

export interface CRPGuidelines {
  prohibitedTerms: string[];
  prohibitedPractices: string[];
  allowedContent: string[];
  disclaimers: string[];
  requiredNotices: string[];
}

/**
 * Diretrizes do CRP - Proibições
 */
export const CRP_PROHIBITED_TERMS = [
  "cura garantida",
  "cura 100%",
  "psicóloga daniela",
  "dra. daniela",
  "consultora daniela",
  "coach daniela",
  "garanto resultados",
  "eliminar ansiedade",
  "eliminar depressão",
  "eliminar trauma",
  "milagre",
  "solução mágica",
  "único método",
  "melhor psicóloga",
  "psicóloga mais buscada",
  "melhor do brasil",
  "diagnóstico",
  "receita",
  "medicação",
  "prescrição",
];

export const CRP_PROHIBITED_PRACTICES = [
  "fazer diagnóstico em redes sociais",
  "prescrever medicamentos",
  "oferecer cura garantida",
  "fazer autopromoção agressiva",
  "usar depoimentos sem consentimento",
  "comparar com outros profissionais",
  "fazer atendimento sem regulamentação",
  "cobrar por consulta sem CRP",
  "fazer psicoterapia online sem registro",
  "oferecer atendimento de emergência",
];

export const CRP_ALLOWED_CONTENT = [
  "dicas de psicologia",
  "técnicas terapêuticas",
  "informações sobre saúde mental",
  "educação sobre transtornos",
  "estratégias de bem-estar",
  "mindfulness",
  "meditação",
  "exercícios de relaxamento",
  "informações sobre especialidades",
  "chamada para consulta",
];

export const CRP_REQUIRED_DISCLAIMERS = [
  "Este conteúdo é apenas informativo e não substitui atendimento profissional",
  "Para diagnóstico ou tratamento, procure um psicólogo credenciado",
  "Em caso de emergência, procure o serviço de saúde mais próximo",
];

/**
 * Valida conteúdo contra regulamentações do CRP
 */
export async function validateCRPCompliance(
  content: string,
  contentType: "caption" | "video" | "banner" | "story"
): Promise<ComplianceValidation> {
  try {
    const violations: ComplianceValidation["violations"] = [];
    let score = 100;
    const contentLower = content.toLowerCase();

    // 1. Verificar termos proibidos
    for (const term of CRP_PROHIBITED_TERMS) {
      if (contentLower.includes(term)) {
        violations.push({
          type: "prohibited_term",
          severity: "critical",
          message: `Termo proibido detectado: "${term}"`,
          suggestion: `Remova ou substitua o termo "${term}" por uma alternativa mais apropriada`,
        });
        score -= 15;
      }
    }

    // 2. Verificar promessas de cura
    const curePatterns = [
      /curar\s+(ansiedade|depressão|trauma|fobia|transtorno)/gi,
      /eliminar\s+(ansiedade|depressão|trauma|fobia|transtorno)/gi,
      /acabar\s+com\s+(ansiedade|depressão|trauma|fobia|transtorno)/gi,
      /garantido/gi,
      /100%\s+efetivo/gi,
    ];

    for (const pattern of curePatterns) {
      if (pattern.test(content)) {
        violations.push({
          type: "cure_promise",
          severity: "critical",
          message: "Promessa de cura detectada",
          suggestion:
            "Use termos como 'ajuda', 'suporte', 'ferramentas' em vez de 'cura' ou 'eliminação'",
        });
        score -= 20;
      }
    }

    // 3. Verificar autopromoção agressiva
    const selfPromoPatterns = [
      /melhor\s+(psicóloga|profissional|consultora)/gi,
      /única\s+(psicóloga|profissional|consultora)/gi,
      /mais\s+buscada/gi,
      /mais\s+famosa/gi,
      /mais\s+seguida/gi,
    ];

    for (const pattern of selfPromoPatterns) {
      if (pattern.test(content)) {
        violations.push({
          type: "aggressive_promotion",
          severity: "error",
          message: "Autopromoção agressiva detectada",
          suggestion:
            "Remova comparações com outros profissionais. Deixe o conteúdo falar por si",
        });
        score -= 10;
      }
    }

    // 4. Verificar diagnósticos
    if (contentLower.includes("diagnóstico") || contentLower.includes("diagnosticar")) {
      violations.push({
        type: "diagnosis",
        severity: "critical",
        message: "Conteúdo oferece diagnóstico",
        suggestion:
          "Não ofereça diagnósticos em redes sociais. Use termos como 'sinais', 'sintomas', 'possíveis indicadores'",
      });
      score -= 20;
    }

    // 5. Verificar menção direta da psicóloga
    if (
      contentLower.includes("daniela") ||
      contentLower.includes("dra.") ||
      contentLower.includes("psicóloga")
    ) {
      violations.push({
        type: "direct_promotion",
        severity: "error",
        message: "Menção direta da psicóloga detectada",
        suggestion:
          "Use canal secreto até ter CRP. Não mencione a psicóloga diretamente no conteúdo",
      });
      score -= 15;
    }

    // 6. Verificar se é conteúdo educativo
    let isEducational = false;
    for (const allowed of CRP_ALLOWED_CONTENT) {
      if (contentLower.includes(allowed)) {
        isEducational = true;
        score += 5;
        break;
      }
    }

    // 7. Verificar se tem disclaimer
    let hasDisclaimer = false;
    for (const disclaimer of CRP_REQUIRED_DISCLAIMERS) {
      if (contentLower.includes(disclaimer.toLowerCase())) {
        hasDisclaimer = true;
        score += 10;
        break;
      }
    }

    // 8. Verificar oferecimento de atendimento
    if (
      contentLower.includes("consulta") ||
      contentLower.includes("atendimento") ||
      contentLower.includes("sessão")
    ) {
      if (!contentLower.includes("procure um psicólogo")) {
        violations.push({
          type: "service_offering",
          severity: "warning",
          message: "Oferecimento de serviço sem disclaimer adequado",
          suggestion:
            "Adicione disclaimer: 'Para atendimento, procure um psicólogo credenciado'",
        });
        score -= 5;
      }
    }

    // Calcular nível de risco
    let riskLevel: ComplianceValidation["riskLevel"] = "low";
    if (violations.some((v) => v.severity === "critical")) {
      riskLevel = "critical";
    } else if (violations.some((v) => v.severity === "error")) {
      riskLevel = "high";
    } else if (violations.some((v) => v.severity === "warning")) {
      riskLevel = "medium";
    }

    // Se não há violações e tem conteúdo educativo, é low risk
    if (violations.length === 0 && isEducational) {
      riskLevel = "low";
      score = Math.min(100, score + 20);
    }

    // Gerar recomendações
    const recommendations: string[] = [];
    if (!isEducational) {
      recommendations.push(
        "Adicione conteúdo educativo sobre psicologia para aumentar valor"
      );
    }
    if (!hasDisclaimer && violations.length === 0) {
      recommendations.push("Considere adicionar um disclaimer para maior conformidade");
    }
    if (contentType === "caption" && content.length < 50) {
      recommendations.push("Caption muito curta. Adicione mais contexto e valor");
    }

    const validation: ComplianceValidation = {
      contentId: `validation_${Date.now()}`,
      isCompliant: violations.length === 0 && riskLevel !== "critical" && score >= 60,
      riskLevel,
      violations,
      score: Math.max(0, score),
      recommendations,
      canPublish: (violations.length === 0 || riskLevel === "low") && score >= 60,
    };

    console.log(
      `✓ Validação CRP concluída: ${validation.isCompliant ? "Conforme" : "Não conforme"} (Score: ${validation.score})`
    );
    return validation;
  } catch (error) {
    console.error(`Erro ao validar conformidade CRP: ${error}`);
    throw error;
  }
}

/**
 * Valida múltiplos conteúdos em lote
 */
export async function validateBatchCRPCompliance(
  contents: Array<{ id: string; text: string; type: "caption" | "video" | "banner" | "story" }>
): Promise<Array<ComplianceValidation>> {
  try {
    const validations = await Promise.all(
      contents.map((c) => validateCRPCompliance(c.text, c.type))
    );

    const compliantCount = validations.filter((v) => v.isCompliant).length;
    console.log(
      `✓ Validação em lote concluída: ${compliantCount}/${validations.length} conformes`
    );

    return validations;
  } catch (error) {
    console.error(`Erro ao validar lote: ${error}`);
    return [];
  }
}

/**
 * Gera relatório de conformidade CRP
 */
export async function generateCRPComplianceReport(
  validations: ComplianceValidation[]
): Promise<string> {
  try {
    let report = "# Relatório de Conformidade CRP\n\n";

    const compliant = validations.filter((v) => v.isCompliant).length;
    const nonCompliant = validations.length - compliant;
    const avgScore =
      validations.reduce((sum, v) => sum + v.score, 0) / validations.length;

    report += `## Resumo\n`;
    report += `- **Total de conteúdos:** ${validations.length}\n`;
    report += `- **Conformes:** ${compliant} (${Math.round((compliant / validations.length) * 100)}%)\n`;
    report += `- **Não conformes:** ${nonCompliant}\n`;
    report += `- **Score médio:** ${Math.round(avgScore)}/100\n\n`;

    const criticalViolations = validations.filter(
      (v) => v.riskLevel === "critical"
    );
    if (criticalViolations.length > 0) {
      report += `## ⚠️ Violações Críticas\n`;
      criticalViolations.forEach((v) => {
        report += `\n### Conteúdo ${v.contentId}\n`;
        v.violations
          .filter((viol) => viol.severity === "critical")
          .forEach((viol) => {
            report += `- **${viol.type}:** ${viol.message}\n`;
            report += `  - Sugestão: ${viol.suggestion}\n`;
          });
      });
    }

    report += `\n## Recomendações Gerais\n`;
    const allRecommendations = validations.flatMap((v) => v.recommendations);
    const uniqueRecommendations = Array.from(new Set(allRecommendations));
    uniqueRecommendations.forEach((rec) => {
      report += `- ${rec}\n`;
    });

    report += `\n## Próximas Ações\n`;
    report += `1. Corrigir todas as violações críticas antes de publicar\n`;
    report += `2. Revisar conteúdo com risco alto\n`;
    report += `3. Implementar disclaimers onde necessário\n`;
    report += `4. Manter conformidade em todas as publicações futuras\n`;

    return report;
  } catch (error) {
    console.error(`Erro ao gerar relatório: ${error}`);
    return "Erro ao gerar relatório";
  }
}

/**
 * Sugere melhorias para tornar conteúdo conforme
 */
export async function suggestCRPCompliantAlternative(
  originalContent: string
): Promise<string> {
  try {
    let improved = originalContent;

    // Substituir termos proibidos
    const replacements: { [key: string]: string } = {
      "cura garantida": "suporte e ferramentas",
      "eliminar ansiedade": "gerenciar ansiedade",
      "eliminar depressão": "lidar com depressão",
      garantido: "potencial",
      "100% efetivo": "efetivo para muitas pessoas",
      "melhor psicóloga": "psicóloga dedicada",
      "única solução": "uma das soluções",
    };

    for (const [prohibited, alternative] of Object.entries(replacements)) {
      const regex = new RegExp(prohibited, "gi");
      improved = improved.replace(regex, alternative);
    }

    // Adicionar disclaimer se necessário
    if (
      improved.toLowerCase().includes("consulta") ||
      improved.toLowerCase().includes("atendimento")
    ) {
      if (!improved.toLowerCase().includes("procure um psicólogo")) {
        improved +=
          "\n\n⚠️ Este conteúdo é informativo. Para atendimento profissional, procure um psicólogo credenciado.";
      }
    }

    console.log(`✓ Sugestão de conteúdo conforme gerada`);
    return improved;
  } catch (error) {
    console.error(`Erro ao sugerir alternativa: ${error}`);
    return originalContent;
  }
}

/**
 * Valida se conteúdo pode ser publicado
 */
export async function canPublishContent(
  validation: ComplianceValidation
): Promise<{ canPublish: boolean; reason: string }> {
  try {
    if (validation.riskLevel === "critical") {
      return {
        canPublish: false,
        reason: "Conteúdo tem violações críticas do CRP. Não pode ser publicado.",
      };
    }

    if (validation.riskLevel === "high" && validation.violations.length > 3) {
      return {
        canPublish: false,
        reason: "Conteúdo tem múltiplas violações de alto risco. Revise antes de publicar.",
      };
    }

    if (validation.score < 60) {
      return {
        canPublish: false,
        reason: `Score de conformidade muito baixo (${validation.score}/100). Revise o conteúdo.`,
      };
    }

    return {
      canPublish: true,
      reason: "Conteúdo está conforme com regulamentações do CRP",
    };
  } catch (error) {
    console.error(`Erro ao verificar publicação: ${error}`);
    return { canPublish: false, reason: "Erro ao verificar conformidade" };
  }
}

/**
 * Cria checklist de conformidade CRP
 */
export async function createCRPComplianceChecklist(): Promise<string> {
  try {
    let checklist = "# Checklist de Conformidade CRP\n\n";

    checklist += "## ❌ Proibições - NÃO FAZER\n";
    checklist += "- [ ] Mencionar a psicóloga Daniela diretamente\n";
    checklist += "- [ ] Fazer promessas de cura ou resultados garantidos\n";
    checklist += "- [ ] Oferecer diagnósticos em redes sociais\n";
    checklist += "- [ ] Fazer autopromoção agressiva ou comparações\n";
    checklist += "- [ ] Usar depoimentos de pacientes sem consentimento\n";
    checklist += "- [ ] Prescrever medicamentos ou tratamentos\n";
    checklist += "- [ ] Oferecer atendimento sem regulamentação adequada\n";
    checklist += "- [ ] Fazer promessas de 'cura 100%' ou 'único método'\n\n";

    checklist += "## ✅ Permitido - FAZER\n";
    checklist += "- [ ] Conteúdo educativo sobre psicologia\n";
    checklist += "- [ ] Dicas e técnicas terapêuticas\n";
    checklist += "- [ ] Informações sobre saúde mental\n";
    checklist += "- [ ] Exercícios de mindfulness e relaxamento\n";
    checklist += "- [ ] Informações sobre especialidades (TCC, Esquema, Gestalt)\n";
    checklist += "- [ ] Chamar para consulta de forma respeitosa\n";
    checklist += "- [ ] Usar canal secreto até ter CRP\n";
    checklist += "- [ ] Adicionar disclaimers apropriados\n\n";

    checklist += "## 📋 Antes de Publicar\n";
    checklist += "- [ ] Validar conformidade CRP\n";
    checklist += "- [ ] Score de conformidade > 80\n";
    checklist += "- [ ] Sem violações críticas\n";
    checklist += "- [ ] Conteúdo educativo e valioso\n";
    checklist += "- [ ] Disclaimer incluído se necessário\n";
    checklist += "- [ ] Sem menção direta da psicóloga\n";
    checklist += "- [ ] Linguagem respeitosa e profissional\n";

    return checklist;
  } catch (error) {
    console.error(`Erro ao criar checklist: ${error}`);
    return "Erro ao criar checklist";
  }
}
