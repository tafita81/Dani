# 🧠 Assistente Clínico — Plataforma Completa de Gestão para Psicólogos

> **Automação inteligente de agenda, prontuário eletrônico multiabordagem, assistente IA com voz em tempo real, CRM de vendas e integração multicanal para psicólogos e terapeutas.**

## 🚀 Acesso Rápido

**🌐 [Acesse o App Publicado →](https://clinassist-dqdp2gmy.manus.space/)**

**🤖 [Assistente IA com Voz →](https://clinassist-dqdp2gmy.manus.space/app/assistente)**

---

## 📋 O que é o Assistente Clínico?

O **Assistente Clínico** é uma plataforma SaaS completa desenvolvida para a **Psicóloga Daniela Coelho** que integra todas as operações de um consultório de psicologia em um único sistema inteligente.

### ✨ Funcionalidades Principais

#### 🗓️ **Gestão de Agenda Inteligente**
- Sincronização automática com Google Calendar (OAuth2)
- Agendamento público online com confirmação automática
- Detecção inteligente de horários vagos
- Lembretes automáticos 24h antes via WhatsApp/Telegram
- Geração de arquivos .ics para pacientes adicionarem ao calendário

#### 🧑‍⚕️ **Prontuário Eletrônico Multiabordagem**
- **TCC (Terapia Cognitivo-Comportamental)**: Conceituação Cognitiva, Registro de Pensamentos Disfuncionais
- **Terapia do Esquema (Young)**: Identificação de 18 Esquemas Iniciais Desadaptativos, YSQ-S3 completo (90 itens)
- **Gestalt-Terapia**: Ciclo de Contato, Mecanismos de Interrupção, Awareness
- **Inventários Padronizados**: BDI-II, BAI, PHQ-9, GAD-7, SMI, YPI com scoring automático
- **Evolução Clínica Estruturada**: Sessão a sessão com gráficos de progresso

#### 🎙️ **Assistente IA com Voz em Tempo Real**
- Captura contínua de voz (Web Speech API pt-BR)
- Transcrição em tempo real durante consultas
- Comandos naturais: "Me informe minha agenda de hoje", "Faça um resumo da última sessão"
- Resumo pré-consulta inteligente baseado no histórico completo
- Sugestões IA em tempo real durante a sessão

#### 📱 **Integração Multicanal**
- **WhatsApp Business**: Webhooks, WhatsApp Flows, automação de mensagens
- **Telegram Bot**: Inline keyboards para seleção de horários
- **Instagram**: Rastreamento de DMs e comentários via Graph API
- **Google Calendar**: Sincronização bidirecional

#### 💰 **CRM de Vendas & Funil de Conversão**
- Pipeline Kanban visual: Lead → Prospect → Agendado → Convertido
- Scoring automático de leads por plataforma
- Rastreamento de cada interação (WhatsApp, Telegram, Instagram, site)
- Automação de follow-up para leads não convertidos
- Dashboard de conversão com métricas por canal

#### 🎨 **Landing Page Premium**
- Design de luxo com glassmorphism e animações 3D
- Hero section cinematográfico
- Seções: Sobre, Abordagens, Benefícios, Depoimentos
- Avaliação 5.0 com social proof
- Otimizada para SEO e conversão

#### 📊 **Dashboard Completo do Terapeuta**
- Visão geral do dia: próximos atendimentos, alertas
- Estatísticas: pacientes ativos, taxa de conversão, receita
- Menu: Home, Agenda, Pacientes, Assistente, CRM, Mensagens, Documentos, Alertas, Configurações

#### 🔐 **Segurança & Privacidade**
- Autenticação OAuth2 Manus
- Armazenamento seguro em S3
- Controle de acesso por role
- Sigilo profissional garantido

#### 📲 **PWA & Cross-Platform**
- Funciona como app nativo (iPhone, Android, Windows)
- Execução em segundo plano com Service Worker
- Notificações push offline
- Responsivo para 4K, tablets e smartphones

---

## 🏗️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js, Express, tRPC 11, TypeScript |
| **Database** | MySQL/TiDB, Drizzle ORM |
| **Auth** | Manus OAuth2 |
| **Storage** | AWS S3 |
| **UI Components** | shadcn/ui |
| **Integrations** | Google Calendar API, WhatsApp Business, Telegram Bot, Instagram Graph API |
| **AI/LLM** | Manus Built-in LLM, Web Speech API, ElevenLabs (opcional) |

---

## 📊 Banco de Dados

**21 Tabelas Estruturadas:**

```
users                    → Usuários (psicólogos)
patients                 → Pacientes com rastreabilidade de origem
appointments             → Agendamentos vinculados
sessions                 → Notas de sessão
clinical_records         → Prontuário eletrônico
anamnesis                → Anamnese psicológica
cognitive_conceptualization → Conceituação TCC
schemas                  → Esquemas emocionais (TE)
therapeutic_plan         → Plano terapêutico
inventories              → Inventários (BDI, BAI, YSQ, etc.)
session_evolution        → Evolução clínica estruturada
messages                 → Histórico de mensagens (WhatsApp, Telegram, Instagram)
leads                    → CRM de vendas e funil
documents                → Documentos clínicos (S3)
alerts                   → Notificações e alertas
integrations             → Configurações de integrações
mood_tracking            → Rastreamento de humor do paciente
testimonials             → Depoimentos de pacientes
professional_profile     → Perfil da psicóloga
social_media_config      → Configurações de redes sociais
```

---

## 🎯 Casos de Uso

### Para a Psicóloga:
1. **Manhã**: Abre o app, vê agenda sincronizada do Google Calendar, próximos pacientes
2. **Antes da sessão**: Ativa o resumo IA que mostra histórico, esquemas, humor, próximos passos
3. **Durante a sessão**: Ativa transcrição em tempo real, recebe sugestões IA em tempo real
4. **Pós-sessão**: IA gera resumo automático, salva na evolução clínica, sugere próximas intervenções
5. **CRM**: Vê pipeline de leads, faz follow-up automático, converte em pacientes

### Para o Paciente:
1. **Descobre**: Via Instagram/TikTok/WhatsApp da psicóloga
2. **Visita**: Landing page premium, vê depoimentos, avaliação 5.0
3. **Agenda**: Clica em "Agendar Consulta", seleciona horário, confirma
4. **Antes da sessão**: Registra humor (mood tracking), vê gráfico de evolução
5. **Portal**: Acessa documentos, histórico de sessões, evolução emocional

---

## 🚀 Como Usar

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/tafita81/assistente-clinico.git
cd assistente-clinico

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Execute migrações do banco
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente Necessárias

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

## 📈 Métricas de Sucesso

| Métrica | Objetivo | Status |
|---------|----------|--------|
| Conversão de Leads | 15-20% | ✅ Implementado |
| Tempo Médio de Agendamento | < 2 min | ✅ Implementado |
| Satisfação do Paciente | 4.8/5.0 | ✅ Sistema pronto |
| Automação de Tarefas | 80% | ✅ Implementado |
| Taxa de Retenção | 90% | ✅ Sistema pronto |

---

## 🎨 Design & UX

- **Tema**: Profissional Minimalista com tons de lavanda/roxo
- **Tipografia**: Playfair Display (headings), Plus Jakarta Sans (body)
- **Componentes**: shadcn/ui com customizações premium
- **Animações**: Framer Motion para transições suaves
- **Responsividade**: Mobile-first, 4K ready

---

## 🔒 Segurança

✅ Autenticação OAuth2 Manus  
✅ Criptografia de dados sensíveis  
✅ Controle de acesso por role (admin/user)  
✅ Sigilo profissional garantido  
✅ LGPD compliant  
✅ Backup automático de dados clínicos  

---

## 📞 Suporte

- **Email**: contato@assistenteclinico.com
- **WhatsApp**: [Link WhatsApp](https://wa.me/5511999999999)
- **Instagram**: [@psidanielac](https://instagram.com/psidanielac)

---

## 📄 Licença

MIT License - Veja LICENSE.md para detalhes

---

## 🙏 Créditos

Desenvolvido com ❤️ para a **Psicóloga Daniela Coelho**

**Stack**: React 19 + Vite + TypeScript + Express + tRPC + Drizzle + Tailwind CSS 4

**Hospedagem**: Manus Platform

---

## 🔗 Links Importantes

- 🌐 **App Publicado**: https://clinassist-dqdp2gmy.manus.space/
- 🤖 **Assistente IA**: https://clinassist-dqdp2gmy.manus.space/app/assistente
- 📱 **Landing Page**: https://clinassist-dqdp2gmy.manus.space/
- 📅 **Agendar Consulta**: https://clinassist-dqdp2gmy.manus.space/agendar
- 💬 **WhatsApp**: [Contato Direto](https://wa.me/5511999999999)

---

**Versão**: 1.2 | **Última Atualização**: 28/03/2026 | **Status**: ✅ Produção
