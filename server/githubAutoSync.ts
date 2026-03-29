/**
 * GitHub Auto Sync — Sincronização automática em tempo real
 * Faz commits automáticos de todas as mudanças, otimizações e aprendizados
 */

import { exec } from "child_process";
import { promisify } from "util";
import { getDb } from "./db";
import { githubSyncLog } from "../drizzle/schema";

const execAsync = promisify(exec);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""YOUR_GITHUB_TOKEN"";
const GITHUB_REPO = process.env.GITHUB_REPO || "tafita81/Dani";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// ═══════════════════════════════════════════════════════════════
// ─── SINCRONIZAÇÃO AUTOMÁTICA EM TEMPO REAL ───
// ═══════════════════════════════════════════════════════════════

export async function autoSyncToGitHub(
  triggerReason: "optimization_applied" | "learning_discovered" | "model_updated" | "daily_snapshot" | "bug_fix" | "feature_added" | "manual_commit",
  changesSummary: any,
  commitMessage: string,
  userId?: number
) {
  try {
    const projectPath = process.cwd();
    const timestamp = new Date().toISOString();
    const fullCommitMessage = `[${triggerReason}] ${commitMessage} - ${timestamp}`;

    // Configurar git
    await execAsync(`git config user.name "Assistente IA - Dani"`, { cwd: projectPath });
    await execAsync(`git config user.email "ia@dani-assistente.com"`, { cwd: projectPath });

    // Adicionar todas as mudanças
    await execAsync(`git add -A`, { cwd: projectPath });

    // Verificar se há mudanças
    const { stdout: status } = await execAsync(`git status --porcelain`, { cwd: projectPath });

    if (!status.trim()) {
      console.log("✅ Nenhuma mudança para sincronizar");
      return { success: true, message: "No changes to sync" };
    }

    // Fazer commit
    const { stdout: commitOutput } = await execAsync(`git commit -m "${fullCommitMessage}"`, { cwd: projectPath });

    // Extrair hash do commit
    const commitHashMatch = commitOutput.match(/\[main ([a-f0-9]+)\]/);
    const commitHash = commitHashMatch ? commitHashMatch[1] : "unknown";

    // Fazer push
    const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git`;
    await execAsync(`git remote set-url origin "${remoteUrl}"`, { cwd: projectPath });
    await execAsync(`git push origin ${GITHUB_BRANCH}`, { cwd: projectPath });

    // Log no banco de dados
    const db = await getDb();
    if (db) {
      await db.insert(githubSyncLog).values({
        userId: userId || 0,
        commitHash,
        commitMessage: fullCommitMessage,
        filesChanged: parseInt(status.split("\n").length.toString()),
        insertions: 0,
        deletions: 0,
        changesSummary,
        triggerReason,
        branchName: GITHUB_BRANCH,
        author: "Assistente IA - Dani",
      });
    }

    console.log(`✅ GitHub sync successful: ${commitHash}`);
    return { success: true, commitHash };
  } catch (error) {
    console.error("❌ GitHub auto-sync failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── SINCRONIZAÇÃO DIÁRIA AUTOMÁTICA ───
// ═══════════════════════════════════════════════════════════════

export async function scheduleDailySync() {
  // Executar todo dia às 23:59
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);

  const timeUntilSync = tomorrow.getTime() - now.getTime();

  setTimeout(async () => {
    console.log("🔄 Iniciando sincronização diária com GitHub...");

    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Gerar relatório do dia
      const today = new Date().toLocaleDateString("pt-BR");
      const changesSummary = {
        date: today,
        timestamp: new Date().toISOString(),
        syncType: "daily_snapshot",
      };

      await autoSyncToGitHub("daily_snapshot", changesSummary, `Daily snapshot - ${today}`);

      console.log("✅ Sincronização diária concluída");
    } catch (error) {
      console.error("❌ Erro na sincronização diária:", error);
    }

    // Agendar próxima sincronização
    scheduleDailySync();
  }, timeUntilSync);
}

// ═══════════════════════════════════════════════════════════════
// ─── SINCRONIZAÇÃO EM EVENTOS ───
// ═══════════════════════════════════════════════════════════════

export async function syncOnOptimization(
  optimizationType: string,
  metricsImprovement: any,
  description: string,
  userId?: number
) {
  const changesSummary = {
    optimizationType,
    improvement: metricsImprovement,
    timestamp: new Date().toISOString(),
  };

  return autoSyncToGitHub("optimization_applied", changesSummary, `Applied optimization: ${description}`, userId);
}

export async function syncOnInsightDiscovered(
  insightTitle: string,
  recommendations: string[],
  confidence: number,
  userId?: number
) {
  const changesSummary = {
    insightTitle,
    recommendations,
    confidence,
    timestamp: new Date().toISOString(),
  };

  return autoSyncToGitHub("learning_discovered", changesSummary, `Discovered insight: ${insightTitle}`, userId);
}

export async function syncOnModelUpdate(
  modelVersion: string,
  improvements: any,
  performanceMetrics: any,
  userId?: number
) {
  const changesSummary = {
    modelVersion,
    improvements,
    performanceMetrics,
    timestamp: new Date().toISOString(),
  };

  return autoSyncToGitHub("model_updated", changesSummary, `Updated AI model to v${modelVersion}`, userId);
}

export async function syncOnBugFix(bugDescription: string, fix: string, userId?: number) {
  const changesSummary = {
    bugDescription,
    fix,
    timestamp: new Date().toISOString(),
  };

  return autoSyncToGitHub("bug_fix", changesSummary, `Fixed bug: ${bugDescription}`, userId);
}

export async function syncOnFeatureAdded(featureName: string, description: string, userId?: number) {
  const changesSummary = {
    featureName,
    description,
    timestamp: new Date().toISOString(),
  };

  return autoSyncToGitHub("feature_added", changesSummary, `Added feature: ${featureName}`, userId);
}

// ═══════════════════════════════════════════════════════════════
// ─── INICIALIZAR SINCRONIZAÇÃO ───
// ═══════════════════════════════════════════════════════════════

export function initializeAutoSync() {
  console.log("🚀 Inicializando sincronização automática com GitHub...");
  console.log(`📦 Repositório: ${GITHUB_REPO}`);
  console.log(`🌿 Branch: ${GITHUB_BRANCH}`);

  // Agendar sincronização diária
  scheduleDailySync();

  console.log("✅ Sincronização automática ativada");
}
