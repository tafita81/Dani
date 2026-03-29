# Guia de Webhooks, Newsletter e Segmentação

## Visão Geral

Este guia documenta a integração completa de três sistemas avançados:

1. **Webhooks de Rastreamento** - Capturar aberturas e cliques de emails
2. **Newsletter Job com Segmentação** - Enviar newsletters personalizadas
3. **Integração Completa** - Rastreamento automático por segmento

---

## 1. Webhooks de Rastreamento

### Endpoints Disponíveis

#### 1.1 Registrar Abertura de Email

**POST** `/api/tracking/pixel/:pixelId`

Registra quando um email é aberto pelo subscriber.

**Parâmetros:**
- `pixelId` (string): Formato `emailId-subscriberId`

**Resposta:**
- Imagem GIF 1x1 pixel transparente
- Headers de cache desabilitados

**Exemplo:**
```bash
curl -X POST https://api.example.com/api/tracking/pixel/newsletter-123-sub-456
```

#### 1.2 Registrar Clique em Link

**POST** `/api/tracking/click/:trackingId/:encodedUrl`

Registra quando um subscriber clica em um link e redireciona para URL original.

**Parâmetros:**
- `trackingId` (string): Formato `emailId-subscriberId`
- `encodedUrl` (string): URL codificada em Base64

**Resposta:**
- Redirecionamento 301 para URL original

**Exemplo:**
```bash
# URL original: https://example.com/article
# Codificada em Base64: aHR0cHM6Ly9leGFtcGxlLmNvbS9hcnRpY2xl

curl -X POST https://api.example.com/api/tracking/click/newsletter-123-sub-456/aHR0cHM6Ly9leGFtcGxlLmNvbS9hcnRpY2xl
```

#### 1.3 Obter Estatísticas de Rastreamento

**GET** `/api/tracking/stats/:emailId`

Retorna estatísticas de rastreamento para um email.

**Parâmetros:**
- `emailId` (string): ID do email

**Resposta:**
```json
{
  "emailId": "newsletter-123",
  "totalSent": 100,
  "totalOpened": 45,
  "totalClicked": 12,
  "openRate": 45,
  "clickRate": 12,
  "uniqueOpens": 40,
  "uniqueClicks": 10,
  "avgTimeToOpen": 3600000,
  "avgTimeToClick": 7200000
}
```

#### 1.4 Gerar Relatório de Engajamento

**GET** `/api/tracking/report?emailIds=email1,email2,email3`

Retorna relatório agregado de engajamento.

**Parâmetros:**
- `emailIds` (string): IDs de emails separados por vírgula

**Resposta:**
```json
{
  "period": "2026-03-01 to 2026-03-31",
  "totalEmails": 3,
  "totalSent": 300,
  "totalOpened": 135,
  "totalClicked": 36,
  "avgOpenRate": 45,
  "avgClickRate": 12,
  "topLinks": [
    {
      "url": "https://example.com/article1",
      "clicks": 25
    }
  ]
}
```

#### 1.5 Limpar Dados Antigos

**POST** `/api/tracking/cleanup`

Remove dados de rastreamento com mais de X dias.

**Body:**
```json
{
  "daysToKeep": 30
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "1250 registros antigos deletados",
  "deletedCount": 1250
}
```

### Geração de Pixels e Links Rastreáveis

#### Gerar Pixel de Rastreamento

```typescript
import { getEmailTrackingService } from "./emailTrackingService";

const trackingService = getEmailTrackingService();
const pixelUrl = trackingService.generateTrackingPixel("newsletter-123", "sub-456");
// Resultado: /api/tracking/pixel/newsletter-123-sub-456
```

#### Gerar Link Rastreável

```typescript
const trackableUrl = trackingService.generateTrackableLink(
  "newsletter-123",
  "sub-456",
  "https://example.com/article"
);
// Resultado: /api/tracking/click/newsletter-123-sub-456/aHR0cHM6Ly9leGFtcGxlLmNvbS9hcnRpY2xl
```

---

## 2. Newsletter Job com Segmentação

### Configuração

#### Inicializar Job na Inicialização do Servidor

```typescript
import { initializeNewsletterJob } from "./jobs/newsletterJobWithSegmentation";

// No arquivo principal do servidor
initializeNewsletterJob();
```

#### Agendamento

O job é executado automaticamente no **1º dia de cada mês às 9h (horário do servidor)**.

Cron expression: `0 9 1 * *`

### Envio Manual

```typescript
import { getNewsletterJob } from "./jobs/newsletterJobWithSegmentation";

const job = getNewsletterJob();

// Executar manualmente
await job.runManually();

// Obter status
const status = job.getStatus();
console.log(status);
// {
//   isRunning: false,
//   lastRunTime: 2026-03-29T09:00:00.000Z,
//   successCount: 450,
//   failureCount: 0,
//   totalProcessed: 450
// }
```

### Segmentos Padrão

O sistema vem com 7 segmentos pré-configurados:

| Segmento | Descrição | Critério |
|----------|-----------|----------|
| `high-engagement` | Alto Engajamento | Score >= 80 |
| `medium-engagement` | Médio Engajamento | Score 50-79 |
| `low-engagement` | Baixo Engajamento | Score < 50 |
| `new-subscribers` | Novos Inscritos | Inscritos < 30 dias |
| `active-subscribers` | Inscritos Ativos | Abriram email nos últimos 30 dias |
| `inactive-subscribers` | Inscritos Inativos | Não abriram email nos últimos 90 dias |
| `all-subscribers` | Todos os Inscritos | Sem filtro |

### Personalização de Conteúdo por Segmento

```typescript
import { getNewsletterJob } from "./jobs/newsletterJobWithSegmentation";

const job = getNewsletterJob();

// O conteúdo é automaticamente personalizado por segmento
// Cada segmento recebe:
// - Subject personalizado
// - Conteúdo relevante
// - Links rastreáveis
// - Pixel de rastreamento
```

---

## 3. Integração Completa: Tracking + Newsletter + Segmentação

### Fluxo Completo

```
1. Newsletter Job inicia
   ↓
2. Para cada segmento:
   ├─ Obter inscritos do segmento
   ├─ Preparar conteúdo personalizado
   ├─ Gerar pixel de rastreamento
   ├─ Gerar links rastreáveis
   └─ Enviar email com rastreamento
   ↓
3. Subscriber abre email
   ├─ Pixel é carregado
   ├─ Abertura é registrada
   └─ Score de engajamento é atualizado
   ↓
4. Subscriber clica em link
   ├─ Clique é registrado
   ├─ Score de engajamento é atualizado
   ├─ Subscriber é redirecionado
   └─ Segmento é reavaliado
   ↓
5. Relatório de engajamento é gerado
   ├─ Taxa de abertura por segmento
   ├─ Taxa de clique por segmento
   ├─ Recomendações de otimização
   └─ Dados são salvos no banco
```

### Exemplo de Implementação

```typescript
import { getNewsletterJob } from "./jobs/newsletterJobWithSegmentation";
import { getEmailTrackingService } from "./emailTrackingService";
import { getSegmentationService } from "./segmentationService";

// 1. Inicializar serviços
const job = getNewsletterJob();
const trackingService = getEmailTrackingService();
const segmentationService = getSegmentationService();

// 2. Executar newsletter
await job.runManually();

// 3. Aguardar alguns segundos para os emails serem enviados
await new Promise(resolve => setTimeout(resolve, 5000));

// 4. Obter estatísticas de rastreamento
const stats = trackingService.getTrackingStats("newsletter-123");
console.log("Estatísticas de rastreamento:", stats);

// 5. Obter relatório de engajamento por segmento
const report = trackingService.generateEngagementReport(["newsletter-123"]);
console.log("Relatório de engajamento:", report);

// 6. Reavalia segmentos baseado em engajamento
const updatedSegments = segmentationService.evaluateSegments();
console.log("Segmentos atualizados:", updatedSegments);
```

### Otimização de Timing

O sistema analisa o timing ideal de envio por segmento:

```typescript
const optimization = segmentationService.optimizeTimingBySegment();
// {
//   "high-engagement": { optimalTime: "09:00", avgOpenRate: 85 },
//   "medium-engagement": { optimalTime: "14:00", avgOpenRate: 65 },
//   "low-engagement": { optimalTime: "19:00", avgOpenRate: 35 }
// }
```

---

## 4. Monitoramento e Relatórios

### Dashboard de Métricas

Acesse `/admin/engagement-metrics` para visualizar:

- Taxa de abertura por segmento
- Taxa de clique por segmento
- Tendências de engajamento
- Inscritos mais engajados
- Recomendações automáticas

### Exportar Relatório

```bash
GET /api/tracking/report?emailIds=newsletter-123,newsletter-124 \
  -H "Accept: application/pdf"
```

### Limpar Dados Antigos

```bash
POST /api/tracking/cleanup \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep": 30}'
```

---

## 5. Troubleshooting

### Problema: Pixels não estão sendo carregados

**Solução:**
1. Verificar se o email contém o pixel: `<img src="/api/tracking/pixel/..." />`
2. Verificar logs do servidor para erros
3. Validar que o pixel está sendo incluído no final do email

### Problema: Links rastreáveis não estão funcionando

**Solução:**
1. Verificar se a URL está codificada corretamente em Base64
2. Validar que o link segue o formato: `/api/tracking/click/trackingId/encodedUrl`
3. Verificar se o servidor pode acessar a URL original

### Problema: Newsletter não está sendo enviada

**Solução:**
1. Verificar se o job foi inicializado: `initializeNewsletterJob()`
2. Verificar logs do servidor para erros de envio
3. Verificar se há inscritos no segmento
4. Executar manualmente: `await job.runManually()`

### Problema: Segmentação não está funcionando

**Solução:**
1. Verificar se os critérios de segmentação estão corretos
2. Reavalia segmentos: `segmentationService.evaluateSegments()`
3. Verificar se os inscritos têm score de engajamento calculado

---

## 6. Performance e Escalabilidade

### Limites Recomendados

| Métrica | Limite | Recomendação |
|---------|--------|--------------|
| Inscritos por segmento | 10.000+ | Usar índices no banco |
| Emails por newsletter | 50.000+ | Usar fila de jobs |
| Dados de rastreamento | 1M+ registros | Limpar dados antigos regularmente |
| Taxa de envio | 1.000 emails/min | Usar rate limiting |

### Otimizações

1. **Índices no Banco de Dados**
   ```sql
   CREATE INDEX idx_tracking_email ON tracking(email_id);
   CREATE INDEX idx_tracking_subscriber ON tracking(subscriber_id);
   CREATE INDEX idx_tracking_timestamp ON tracking(timestamp);
   ```

2. **Cache de Segmentos**
   ```typescript
   // Segmentos são cacheados por 1 hora
   const segments = segmentationService.listSegments(); // Usa cache
   ```

3. **Fila de Envio**
   ```typescript
   // Usar Bull Queue para envios em background
   import Queue from "bull";
   const emailQueue = new Queue("emails");
   ```

---

## 7. Segurança

### Validação de Entrada

- Todos os IDs são validados com regex
- URLs são validadas antes de redirecionar
- Rate limiting é aplicado aos endpoints

### Proteção de Dados

- Pixels e links rastreáveis expiram após 90 dias
- Dados de rastreamento são criptografados no banco
- Acesso aos endpoints requer autenticação

### GDPR Compliance

- Dados de rastreamento podem ser deletados por subscriber
- Unsubscribe é respeitado automaticamente
- Consentimento é verificado antes de enviar

---

## 8. Exemplos de Uso

### Exemplo 1: Enviar Newsletter com Rastreamento

```typescript
import { getNewsletterJob } from "./jobs/newsletterJobWithSegmentation";

// Executar newsletter
const job = getNewsletterJob();
await job.runManually();

// Aguardar conclusão
const status = job.getStatus();
console.log(`Enviados: ${status.successCount}, Falhas: ${status.failureCount}`);
```

### Exemplo 2: Obter Estatísticas de Engajamento

```typescript
import { getEmailTrackingService } from "./emailTrackingService";

const trackingService = getEmailTrackingService();
const stats = trackingService.getTrackingStats("newsletter-123");

console.log(`Taxa de abertura: ${stats.openRate}%`);
console.log(`Taxa de clique: ${stats.clickRate}%`);
```

### Exemplo 3: Reavalia Segmentos

```typescript
import { getSegmentationService } from "./segmentationService";

const segmentationService = getSegmentationService();
const updatedSegments = segmentationService.evaluateSegments();

updatedSegments.forEach(segment => {
  console.log(`${segment.name}: ${segment.subscribers.length} inscritos`);
});
```

---

## Suporte

Para questões ou problemas, consulte:
- Documentação técnica: `/docs`
- Logs do servidor: `/logs`
- Dashboard de admin: `/admin`
