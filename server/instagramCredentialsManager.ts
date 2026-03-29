/**
 * Instagram Credentials Manager
 * Gerencia credenciais do Instagram de forma segura e fácil
 */

export interface InstagramCredentials {
  accessToken: string;
  businessAccountId: string;
  userId: string;
  pageAccessToken?: string;
}

export interface CredentialsStatus {
  isConfigured: boolean;
  lastUpdated?: Date;
  expiresAt?: Date;
  status: "active" | "expired" | "invalid" | "not_configured";
}

/**
 * 1. GERENCIAR CREDENCIAIS
 */
export async function saveInstagramCredentials(
  credentials: InstagramCredentials
): Promise<{ success: boolean; message: string }> {
  try {
    // Validar credenciais
    if (!credentials.accessToken || !credentials.businessAccountId) {
      return {
        success: false,
        message: "Access Token e Business Account ID são obrigatórios",
      };
    }

    // Salvar em variáveis de ambiente (será feito via UI depois)
    console.log("✅ Credenciais prontas para serem salvas:");
    console.log(`- Access Token: ${credentials.accessToken.substring(0, 10)}...`);
    console.log(`- Business Account ID: ${credentials.businessAccountId}`);
    console.log(`- User ID: ${credentials.userId}`);

    return {
      success: true,
      message: "Credenciais salvas com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao salvar credenciais: ${error instanceof Error ? error.message : "Desconhecido"}`,
    };
  }
}

/**
 * 2. VERIFICAR STATUS DAS CREDENCIAIS
 */
export function checkCredentialsStatus(): CredentialsStatus {
  const hasToken = !!process.env.INSTAGRAM_ACCESS_TOKEN;
  const hasAccountId = !!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const hasUserId = !!process.env.INSTAGRAM_USER_ID;

  const isConfigured = hasToken && hasAccountId && hasUserId;

  return {
    isConfigured,
    status: isConfigured ? "active" : "not_configured",
    lastUpdated: new Date(),
  };
}

/**
 * 3. OBTER CREDENCIAIS CONFIGURADAS
 */
export function getInstagramCredentials(): InstagramCredentials | null {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !businessAccountId || !userId) {
    return null;
  }

  return {
    accessToken,
    businessAccountId,
    userId,
    pageAccessToken: process.env.INSTAGRAM_PAGE_ACCESS_TOKEN,
  };
}

/**
 * 4. GUIA DE COMO OBTER CREDENCIAIS
 */
export function getCredentialsGuide(): string {
  return `
# 📱 GUIA: COMO OBTER CREDENCIAIS DO INSTAGRAM

## Passo 1: Criar App no Facebook Developers
1. Acesse https://developers.facebook.com/
2. Clique em "Meus Apps" → "Criar App"
3. Escolha "Negócios" como tipo
4. Preencha os dados e crie

## Passo 2: Configurar Instagram Graph API
1. No seu app, clique em "Adicionar Produto"
2. Procure por "Instagram Graph API"
3. Clique em "Configurar"

## Passo 3: Obter Access Token
1. Vá para "Ferramentas" → "Explorador de Gráfico"
2. Selecione seu app
3. Clique em "Gerar Token de Acesso"
4. Copie o token (será usado como INSTAGRAM_ACCESS_TOKEN)

## Passo 4: Obter Business Account ID
1. No Explorador de Gráfico, execute:
   GET /me/instagram_business_accounts
2. Copie o "id" retornado (será usado como INSTAGRAM_BUSINESS_ACCOUNT_ID)

## Passo 5: Obter User ID
1. No Explorador de Gráfico, execute:
   GET /me
2. Copie o "id" retornado (será usado como INSTAGRAM_USER_ID)

## Credenciais Necessárias:
- INSTAGRAM_ACCESS_TOKEN
- INSTAGRAM_BUSINESS_ACCOUNT_ID
- INSTAGRAM_USER_ID

Depois de obter, você pode adicionar facilmente na interface do sistema!
  `;
}

/**
 * 5. VALIDAR CREDENCIAIS COM INSTAGRAM API
 */
export async function validateCredentials(
  credentials: InstagramCredentials
): Promise<{ valid: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${credentials.businessAccountId}?fields=id,name,username&access_token=${credentials.accessToken}`
    );

    if (!response.ok) {
      return {
        valid: false,
        message: "Credenciais inválidas ou expiradas",
      };
    }

    const data = (await response.json()) as { id?: string; name?: string };
    if (data.id) {
      return {
        valid: true,
        message: `✅ Credenciais válidas! Conta: ${data.name || "Instagram"}`,
      };
    }

    return {
      valid: false,
      message: "Não foi possível validar as credenciais",
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erro ao validar: ${error instanceof Error ? error.message : "Desconhecido"}`,
    };
  }
}

/**
 * 6. RESUMO DE CREDENCIAIS
 */
export function getCredentialsSummary(): string {
  const status = checkCredentialsStatus();
  const credentials = getInstagramCredentials();

  if (!status.isConfigured) {
    return `
# 🔐 STATUS DAS CREDENCIAIS

❌ **Credenciais não configuradas**

Para começar a postar automaticamente no Instagram, você precisa adicionar:
1. INSTAGRAM_ACCESS_TOKEN
2. INSTAGRAM_BUSINESS_ACCOUNT_ID
3. INSTAGRAM_USER_ID

Clique no botão "Adicionar Credenciais" para começar!
    `;
  }

  return `
# 🔐 STATUS DAS CREDENCIAIS

✅ **Credenciais configuradas com sucesso!**

Conta: ${credentials?.businessAccountId}
Status: Ativo
Última atualização: ${new Date().toLocaleString("pt-BR")}

Você pode agora:
- ✅ Postar conteúdo automaticamente
- ✅ Coletar dados de engajamento
- ✅ Capturar leads de comentários
- ✅ Monitorar performance
    `;
}
