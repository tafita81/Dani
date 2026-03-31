# 🏗️ Assistente Clínico - Arquitetura Completa do Sistema

## 📋 Visão Geral

O **Assistente Clínico** é uma plataforma SaaS completa desenvolvida para psicólogos, integrando gestão de agenda, prontuário eletrônico, assistente IA com voz, CRM de vendas e automação multicanal.

---

## 🗂️ Estrutura de Diretórios Organizada

```
DaniRepo/
├── client/                    # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── pages/            # 50+ páginas de interface
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # Serviços de API (tRPC)
│   │   ├── contexts/         # Context API para estado global
│   │   └── lib/              # Utilitários e helpers
│   └── index.html
│
├── server/                    # Backend (Express + tRPC)
│   ├── _core/                # Core da aplicação
│   │   ├── index.ts          # Ponto de entrada
│   │   ├── trpc.ts           # Configuração tRPC
│   │   ├── context.ts        # Contexto de requisição
│   │   ├── oauth.ts          # Autenticação OAuth2
│   │   ├── llm.ts            # Integração com LLM
│   │   └── vite.ts           # Configuração Vite
│   │
│   ├── core_logic/           # Lógica principal
│   │   ├── routers.ts        # Roteadores tRPC
│   │   ├── db.ts             # Funções de banco de dados
│   │   ├── productionConfig.ts
│   │   └── productionLaunch.ts
│   │
│   ├── ai/                   # Módulos de IA
│   │   ├── emotionAI.ts
│   │   ├── voiceCapture.ts
│   │   ├── sentimentAnalysis.ts
│   │   └── llmRealTimeAnalysis.ts
│   │
│   ├── integrations/         # Integrações externas
│   │   ├── whatsapp.ts
│   │   ├── instagram*.ts
│   │   ├── googleCalendar.ts
│   │   ├── outlookCalendar.ts
│   │   └── telegram.ts
│   │
│   ├── services/             # Serviços de negócio
│   │   ├── emailService.ts
│   │   ├── notificationService.ts
│   │   ├── segmentationService.ts
│   │   └── feedbackService.ts
│   │
│   ├── features/             # Funcionalidades específicas
│   │   ├── carAssistant.ts
│   │   ├── clinicalAssistant.ts
│   │   ├── psychologicalForms.ts
│   │   └── techniqueRecommender.ts
│   │
│   ├── growth/               # Estratégias de crescimento
│   │   ├── viralContentEngine.ts
│   │   ├── viralFunnelSystem.ts
│   │   └── instagramGrowthStrategy.ts
│   │
│   ├── webhooks/             # Webhooks de integrações
│   │   ├── whatsappWebhook.ts
│   │   └── trackingWebhooks.ts
│   │
│   ├── routers/              # Roteadores específicos
│   │   ├── carAssistant.ts
│   │   ├── clinicalAssistant.ts
│   │   └── notifications.ts
│   │
│   └── tests/                # Testes unitários
│
├── drizzle/                  # Migrações e schema do banco
│   ├── schema.ts             # Definição de tabelas
│   └── migrations/
│
├── shared/                   # Código compartilhado
│   ├── types.ts
│   ├── const.ts
│   └── _core/
│
├── docs/                     # Documentação
│   ├── strategies/
│   ├── compliance/
│   └── updates/
│
├── scripts/                  # Scripts de utilidade
│   ├── seed-db.mjs
│   └── deployment.sh
│
├── public/                   # Arquivos estáticos
├── package.json              # Dependências
├── vite.config.ts            # Configuração Vite
├── tsconfig.json             # Configuração TypeScript
└── vercel.json               # Configuração Vercel

```

---

## 🗄️ Banco de Dados (Drizzle + MySQL)

### Tabelas Principais (21 tabelas)

#### **Autenticação e Perfil**
- `users` - Usuários (psicólogos)
- `professionalProfile` - Perfil profissional
- `testimonials` - Depoimentos de pacientes

#### **CRM de Vendas**
- `leads` - Funil de conversão
- `leadInteractions` - Touchpoints de leads

#### **Pacientes e Clínica**
- `patients` - Dados de pacientes
- `moodEntries` - Rastreamento de humor
- `appointments` - Agendamentos
- `sessionNotes` - Notas de sessão
- `sessionEvolutions` - Evolução clínica

#### **Prontuário Eletrônico**
- `anamnesis` - Anamnese psicológica
- `cognitiveConcepts` - Conceituação TCC
- `schemaAssessments` - Esquemas emocionais
- `gestaltAssessments` - Avaliação Gestalt
- `thoughtRecords` - Registros de pensamentos
- `treatmentPlans` - Planos terapêuticos
- `inventoryResults` - Resultados de inventários (BDI, BAI, YSQ, etc.)

#### **Integração e Comunicação**
- `messageLog` - Histórico de mensagens
- `integrationSettings` - Configurações de integrações
- `alerts` - Notificações e alertas
- `documents` - Documentos clínicos (S3)

#### **Instagram e Redes Sociais**
- `instagramPosts` - Posts publicados
- `instagramStories` - Stories
- `instagramReels` - Reels
- `instagramAnalytics` - Análise de performance
- `instagramContentCalendar` - Calendário de conteúdo
- `instagramAISuggestions` - Sugestões de IA

#### **Aprendizado Contínuo**
- `agentActionLog` - Histórico de ações
- `systemInsights` - Insights gerados

---

## 🔌 Integrações Externas

### **Calendários**
- **Google Calendar**: Sincronização bidirecional com OAuth2
- **Outlook Calendar**: Sincronização e bloqueio de horários

### **Redes Sociais**
- **Instagram**: Graph API para posts, reels, stories e análise
- **WhatsApp Business**: Webhooks e automação de mensagens
- **Telegram**: Bot com inline keyboards

### **IA e Processamento**
- **Manus Built-in LLM**: Análise e sugestões em tempo real
- **Web Speech API**: Transcrição em tempo real (pt-BR)
- **ElevenLabs**: Text-to-Speech (opcional)

### **Storage**
- **AWS S3**: Armazenamento de documentos clínicos

---

## 🎯 Funcionalidades Principais

### **1. Gestão de Agenda Inteligente**
- Sincronização automática com Google Calendar e Outlook
- Agendamento público online com confirmação automática
- Detecção de horários vagos
- Lembretes automáticos via WhatsApp/Telegram
- Geração de arquivos .ics

### **2. Prontuário Eletrônico Multiabordagem**
- **TCC**: Conceituação Cognitiva, Registro de Pensamentos
- **Terapia do Esquema**: YSQ-S3 completo (90 itens)
- **Gestalt-Terapia**: Ciclo de Contato, Mecanismos de Interrupção
- **Inventários Padronizados**: BDI-II, BAI, PHQ-9, GAD-7, SMI, YPI

### **3. Assistente IA com Voz**
- Captura contínua de voz (Web Speech API)
- Transcrição em tempo real durante consultas
- Comandos naturais
- Resumo pré-consulta inteligente
- Sugestões IA em tempo real

### **4. CRM de Vendas**
- Pipeline Kanban visual
- Scoring automático de leads
- Rastreamento de interações por canal
- Automação de follow-up
- Dashboard de conversão

### **5. Automação Multicanal**
- WhatsApp Business com webhooks
- Telegram Bot com automação
- Instagram DMs e comentários
- Sincronização de dados entre plataformas

---

## 🚀 Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js, Express, tRPC 11, TypeScript |
| **Database** | MySQL/TiDB, Drizzle ORM |
| **Auth** | Manus OAuth2 |
| **Storage** | AWS S3 |
| **UI Components** | shadcn/ui |
| **Integrations** | Google Calendar, WhatsApp, Telegram, Instagram, Outlook |
| **AI/LLM** | Manus Built-in LLM, Web Speech API |

---

## 🔐 Segurança

✅ Autenticação OAuth2 Manus  
✅ Criptografia de dados sensíveis  
✅ Controle de acesso por role (admin/user)  
✅ Sigilo profissional garantido  
✅ LGPD compliant  
✅ Backup automático de dados clínicos  

---

## 📊 Roteadores tRPC Disponíveis

```typescript
appRouter = {
  system,              // Sistema e saúde
  auth,                // Autenticação
  dashboard,           // Dashboard
  patients,            // Gestão de pacientes
  appointments,        // Agendamentos
  sessions,            // Notas de sessão
  clinical,            // Dados clínicos
  leads,               // CRM de vendas
  integrations,        // Configurações de integrações
  instagram,           // Gestão do Instagram
  notifications,       // Notificações
  carAssistant,        // Assistente para motoristas
  clinicalAssistant,   // Assistente clínico
}
```

---

## 🌐 URLs Principais

- **App Principal**: https://clinassist-dqdp2gmy.manus.space/
- **Assistente IA**: https://clinassist-dqdp2gmy.manus.space/app/assistente
- **Assistente Carro**: https://clinassist-dqdp2gmy.manus.space/app/assistente-carro
- **Landing Page**: https://clinassist-dqdp2gmy.manus.space/
- **Agendar Consulta**: https://clinassist-dqdp2gmy.manus.space/agendar

---

## 🔄 Fluxo de Dados

```
Usuário (Psicólogo)
    ↓
Frontend (React)
    ↓
tRPC Client
    ↓
Express Server
    ↓
tRPC Router
    ↓
Banco de Dados (MySQL)
    ↓
Integrações (Google, Instagram, WhatsApp, etc.)
```

---

## 📈 Métricas de Sucesso

| Métrica | Objetivo |
|---------|----------|
| Conversão de Leads | 15-20% |
| Tempo Médio de Agendamento | < 2 min |
| Satisfação do Paciente | 4.8/5.0 |
| Automação de Tarefas | 80% |
| Taxa de Retenção | 90% |

---

## 🎨 Design System

- **Tema**: Profissional Minimalista com tons de lavanda/roxo
- **Tipografia**: Playfair Display (headings), Plus Jakarta Sans (body)
- **Componentes**: shadcn/ui com customizações premium
- **Animações**: Framer Motion para transições suaves
- **Responsividade**: Mobile-first, 4K ready

---

## 📝 Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/assistente_clinico

# OAuth
VITE_APP_ID=seu_app_id_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Integrações
GOOGLE_CALENDAR_CLIENT_ID=seu_client_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_account_id
WHATSAPP_BUSINESS_API_TOKEN=seu_token
TELEGRAM_BOT_TOKEN=seu_token
INSTAGRAM_ACCESS_TOKEN=seu_token

# Storage S3
AWS_ACCESS_KEY_ID=sua_chave
AWS_SECRET_ACCESS_KEY=sua_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket

# LLM
BUILT_IN_FORGE_API_KEY=sua_chave
BUILT_IN_FORGE_API_URL=https://api.manus.im
```

---

**Versão**: 1.2 | **Status**: ✅ Produção | **Última Atualização**: 31/03/2026
