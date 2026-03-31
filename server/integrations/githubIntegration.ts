/**
 * GitHub Integration — Sincronização automática de histórico e aprendizados
 * Cria commits automáticos com histórico de otimizações e insights
 */

import { getDb } from "../core_logic/db";
import { githubSyncLog } from "../../drizzle/schema";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════
// ─── SINCRONIZAÇÃO COM GITHUB ───
// ═══════════════════════════════════════════════════════════════

export async function syncToGitHub(
  userId: number,
  triggerReason: "optimization_applied" | "learning_discovered" | "model_updated" | "daily_snapshot" | "manual_commit" | "bug_fix" | "feature_added",
  changesSummary: any,
  commitMessage: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Preparar commit
    const timestamp = new Date().toISOString();
    const fullCommitMessage = `[${triggerReason}] ${commitMessage} - ${timestamp}`;

    // Executar git commands
    await execAsync("git add -A", { cwd: process.cwd() });
    const { stdout } = await execAsync(`git commit -m "${fullCommitMessage}"`, { cwd: process.cwd() });

    // Extrair informações do commit
    const commitHashMatch = stdout.match(/\[main [a-f0-9]+\]/);
    const commitHash = commitHashMatch ? commitHashMatch[0].split(" ")[1].replace("]", "") : "unknown";

    // Fazer push
    await execAsync("git push origin main", { cwd: process.cwd() });

    // Registrar no banco de dados
    const syncLog = await db.insert(githubSyncLog).values({
      userId,
      commitHash,
      commitMessage: fullCommitMessage,
      filesChanged: 0, // Será atualizado com git diff
      insertions: 0,
      deletions: 0,
      changesSummary,
      triggerReason,
      branchName: "main",
      author: "agent-learning-system",
    });

    console.log(`✅ GitHub sync successful: ${commitHash}`);
    return { success: true, commitHash, syncLog };
  } catch (error) {
    console.error("❌ GitHub sync failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── COMMIT AUTOMÁTICO DIÁRIO ───
// ═══════════════════════════════════════════════════════════════

export async function createDailySnapshot(userId: number, dailyReport: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toLocaleDateString("pt-BR");

  const changesSummary = {
    date: today,
    metricsSnapshot: {
      successRate: dailyReport.metrics?.successRate,
      engagement: dailyReport.metrics?.totalEngagement,
      conversions: dailyReport.metrics?.totalConversions,
      satisfaction: dailyReport.metrics?.satisfactionScore,
    },
    insightsDiscovered: dailyReport.insights?.length || 0,
    improvementPlans: dailyReport.improvementPlans?.length || 0,
  };

  return syncToGitHub(userId, "daily_snapshot", changesSummary, `Daily learning snapshot - ${today}`);
}

// ═══════════════════════════════════════════════════════════════
// ─── COMMIT DE OTIMIZAÇÕES APLICADAS ───
// ═══════════════════════════════════════════════════════════════

export async function commitOptimization(
  userId: number,
  optimizationType: string,
  metricsImprovement: any,
  description: string
) {
  const changesSummary = {
    optimizationType,
    improvement: metricsImprovement,
    timestamp: new Date().toISOString(),
  };

  return syncToGitHub(userId, "optimization_applied", changesSummary, `Applied optimization: ${description}`);
}

// ═══════════════════════════════════════════════════════════════
// ─── COMMIT DE MODELO IA ATUALIZADO ───
// ═══════════════════════════════════════════════════════════════

export async function commitModelUpdate(
  userId: number,
  modelVersion: string,
  improvements: any,
  performanceMetrics: any
) {
  const changesSummary = {
    modelVersion,
    improvements,
    performanceMetrics,
    timestamp: new Date().toISOString(),
  };

  return syncToGitHub(userId, "model_updated", changesSummary, `Updated AI model to v${modelVersion}`);
}

// ═══════════════════════════════════════════════════════════════
// ─── HISTÓRICO DE SINCRONIZAÇÕES ───
// ═══════════════════════════════════════════════════════════════

export async function getSyncHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { eq } = await import("drizzle-orm");
  const history = await db
    .select()
    .from(githubSyncLog)
    .where(eq(githubSyncLog.userId, userId))
    .orderBy(githubSyncLog.syncedAt)
    .limit(limit);

  return history;
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAR RELATÓRIO DE HISTÓRICO ───
// ═══════════════════════════════════════════════════════════════

export async function generateHistoryReport(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { eq, gte } = await import("drizzle-orm");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const syncLogs = await db
    .select()
    .from(githubSyncLog)
    .where(eq(githubSyncLog.userId, userId))
    .orderBy(githubSyncLog.syncedAt);

  // Agrupar por tipo de trigger
  const byType: any = {};
  for (const log of syncLogs) {
    if (!byType[log.triggerReason]) {
      byType[log.triggerReason] = [];
    }
    byType[log.triggerReason].push(log);
  }

  return {
    period: `${days} dias`,
    totalCommits: syncLogs.length,
    byType,
    timeline: syncLogs.map((log) => ({
      date: log.syncedAt,
      message: log.commitMessage,
      type: log.triggerReason,
    })),
  };
}
