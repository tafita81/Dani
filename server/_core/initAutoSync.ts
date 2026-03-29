/**
 * Inicialização da Sincronização Automática com GitHub
 * Executado na inicialização do servidor
 */

import { initializeAutoSync } from "../githubAutoSync";

export function setupAutoSync() {
  try {
    console.log("\n🔄 Configurando sincronização automática com GitHub...\n");
    initializeAutoSync();
  } catch (error) {
    console.error("Erro ao configurar sincronização automática:", error);
  }
}
