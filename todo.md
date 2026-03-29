# Assistente Clínico - TODO

## Schema e Infraestrutura
- [x] Schema do banco de dados (pacientes, agendamentos, sessões, documentos, configurações, mensagens)
- [x] Migração do banco de dados com pnpm db:push

## Backend - Integrações
- [x] Integração Google Calendar API com OAuth2 (consultar e inserir eventos)
- [x] Sistema de configuração para credenciais Gmail/Google Calendar
- [x] Webhook WhatsApp Business Cloud API com suporte a WhatsApp Flows
- [x] Bot Telegram com inline keyboards para seleção de horários
- [x] Geração de arquivos .ics para pacientes adicionarem consultas ao calendário
- [x] Detecção inteligente de horários vagos no Google Calendar

## Backend - Funcionalidades Core
- [x] CRUD de pacientes com dados clínicos
- [x] CRUD de agendamentos vinculados a pacientes
- [x] Sistema de notas de sessão e evolução clínica
- [x] Upload e armazenamento seguro de documentos clínicos (S3)
- [x] Histórico de interações com pacientes (WhatsApp e Telegram)
- [x] Sistema de notificações automáticas (lembrete 24h antes)
- [x] Alertas em tempo real para novos agendamentos, cancelamentos e mensagens urgentes
- [x] Assistente IA com LLM para comandos de voz/texto do terapeuta

## Frontend - Dashboard
- [x] Layout dashboard com sidebar (DashboardLayout)
- [x] Página inicial com visão geral do dia (próximos atendimentos, estatísticas)
- [x] Visualização de agenda sincronizada com Google Calendar
- [x] Lista e gestão de pacientes
- [x] Detalhes do paciente com histórico de sessões e documentos
- [x] Chat IA assistente para comandos do terapeuta
- [x] Painel de configurações (Google Calendar, WhatsApp, Telegram)
- [x] Painel de histórico de agendamentos e interações
- [x] Upload e visualização de documentos clínicos
- [x] Sistema de notificações e alertas em tempo real
- [x] Tema profissional clínico (cores, tipografia, design)

## Testes
- [x] Testes unitários para routers tRPC
- [x] Testes para lógica de agendamento e detecção de horários vagos

## Voz em Tempo Real
- [x] Hook useVoiceRecognition com Web Speech API para captura contínua de voz
- [x] Modo "escuta contínua" no chat IA que fica captando voz em tempo real
- [x] Indicador visual de que o microfone está ativo e captando
- [x] Transcrição em tempo real exibida na tela enquanto o terapeuta fala
- [x] Envio automático do comando ao assistente IA após pausa na fala
- [x] Botão toggle para ativar/desativar captura de voz contínua
- [x] Fallback para input de texto quando voz não está disponível

## Personalização - Psióloga Daniela Coelho
- [x] Personalizar brandingg para "Psicóloga Daniela Coelho"
- [x] Ajustar textos do dashboard, sidebar e login para contexto de psicologia
- [x] Atualizar título do app e meta tags para Daniela Coelho
- [x] Ajustar paleta de cores para tons suaves/acolhedores de psicologia
- [x] Personalizar mensagens do assistente IA para contexto psicológico
- [x] Ajustar terminologia: sessão, atendimento, prontuário, evolução clínica
- [x] Personalizar categorias de documentos para psicologia (prontuário, laudo psicológico, etc.)
- [x] Ajustar mensagens de boas-vindas do WhatsApp/Telegram para Psicóloga Daniela

## UX Premium 2026 — Funcionalidades Avançadas
- [x] Portal público do paciente com autoagendamento (sem login)
- [x] Landing page premium com glassmorphism e animações 3D Framer Motion
- [x] Micro-interações e transições suaves em toda a interface
- [x] Cards com efeito glassmorphism (backdrop-blur, transparência)
- [x] Animações de entrada com stagger (elementos aparecem em sequência)
- [x] Mood Tracking: paciente registra humor antes da sessão via portal
- [x] Gráfico de evolução emocional do paciente ao longo do tempo
- [x] Gamificação: streak de sessões consecutivas, badges de progresso
- [x] Página de agendamento público com seleção visual de horários
- [x] Confirmação de consulta com animação de sucesso (confetti/check)
- [x] Widget de depoimentos/avaliações de pacientes
- [x] Seção "Sobre a Psicóloga" com bio profissional da Daniela
- [x] Gradientes animados e efeitos de luz no background
- [x] Skeleton loading com shimmer effect em todas as páginas
- [x] Responsividade 4K com grid fluido e tipografia escalável
- [x] Efeito parallax suave no scroll da landing page
- [x] Botão flutuante WhatsApp para contato direto

## Alto Status & Luxo — Experiência Premium
- [x] Landing page pública de luxo que transmite clínica de elite
- [x] Animações cinematográficas de entrada com Framer Motion
- [x] Tipografia premium com fonte serif elegante (Playfair Display)
- [x] Gradientes dourado/lavanda sofisticados no hero
- [x] Seção "Sobre Daniela Coelho" com bio de alto impacto e credenciais
- [x] Seção de especialidades com ícones animados
- [x] Depoimentos de pacientes com design editorial premium
- [x] Contador animado de estatísticas (anos de experiência, pacientes atendidos)
- [x] Seção de agendamento público com design de luxo
- [x] Footer premium com informações de contato e redes sociais
- [x] Efeito de partículas/orbs flutuantes no background
- [x] Botão WhatsApp flutuante com animação pulse
- [x] Transições de página suaves e elegantes
- [x] Mood tracking e portal do paciente com design premium

## Ecossistema Digital Integrado — Redes Sociais
- [x] Página de configurações para inserir links de Instagram, TikTok, YouTube, WhatsApp, Telegram
- [x] Hub de links premium estilo Linktree de luxo integrado ao site (rota /links)
- [x] Feed do Instagram embarcado na landing page com design editorial
- [x] Seção de vídeos YouTube/TikTok embarcados na landing page
- [x] Botão flutuante multi-canal (WhatsApp, Telegram, Instagram) com animação
- [x] Social proof: contadores de seguidores e engajamento
- [x] QR Code dinâmico para cada rede social
- [x] Integração de CTAs cruzados (Instagram → Agendar, YouTube → WhatsApp, etc.)
- [x] Página /links como bio link premium para Instagram e TikTok
- [x] Schema de redes sociais no banco de dados (configurável pelo painel)
- [x] Open Graph e meta tags dinâmicas para compartilhamento premium
- [x] Seção de conteúdos/blog com embed de reels e shorts

## Sistema Clínico Completo — Prontuário Eletrônico + TE/TCC
- [x] Tabelas DB: anamnese, esquemas iniciais desadaptativos (TE), crenças centrais (TCC), registro de pensamentos
- [x] Tabelas DB: plano terapêutico, metas de tratamento, técnicas utilizadas por sessão
- [x] Tabelas DB: inventários padronizados (BDI, BAI, YSQ), resultados por aplicação
- [x] Formulário de Anamnese Psicológica completo (história pessoal, familiar, queixa principal)
- [x] Formulário de Conceitualição CognitivaTCC): situação → pensamento → emoção → comportamento
- [x] Formulário de Identificação de Esquemas (TE): 18 esquemas iniciais desadaptativos de Young
- [x] Registro de Pensamentos Disfuncionais (RPD) por sessão
- [x] Plano Terapêutico com metas SMART e progresso
- [x] Evolução clínica estruturada por sessão com campos padronizados
- [x] Inventários: BDI-II (depressão), BAI (ansiedade), YSQ-S3 (esquemas) com scoring automático
- [x] Gráficos de evolução dos scores ao longo do tempo
- [x] Resumo pré-consulta IA: acessa anamnese + últimas sessões + esquemas + humor + plano terapêutico
- [x] Routers tRPC para CRUD de todos os formulários clínicos
- [x] Página de Prontuário do Paciente com abas: Anamnese, Conceituação, Esquemas, RPD, Evolução, Inventários
- [x] Página de Evolução de Sessão com template estruturado

## Transcrição em Tempo Real + IA Auxiliar na Sessão
- [x] Página de Sessão Ao Vivo com transcrição em tempo real via Web Speech API pt-BR
- [x] Painel lateral com histórico resumido do paciente visível durante a sessão
- [x] Botão iniciar/pausar/parar transcrição durante a consulta
- [x] Transcrição salva automaticamente como nota de sessão ao finalizar
- [x] IA gera resumo estruturado da sessão ao finalizar (temas, emoções, pensamentos, intervenções)
- [x] IA sugere próximos passos e o que abordar na próxima sessão baseado no histórico completo
- [x] Painel de sugestões IA em tempo real durante a sessão (insights baseados no que está sendo dito)
- [x] Integração com evolução clínica estruturada (preenche campos automaticamente)
- [x] Detecção de palavras-chave e esquemas ativados durante a fala do paciente

## PWA — Execução em Segundo Plano
- [x] Manifest.json para instalação como app nativo (mobile e desktop)
- [x] Service Worker com cache offline e background sync
- [x] Notificações push via Web Push API
- [x] Ícones de app em múltiplas resoluções
- [x] Tela de splash screen personalizada
- [x] Background fetch para sincronização de dados
- [x] Prompt de instalação do app customizado

## Cross-Platform — iPhone, Android, Windows (Chrome, Edge, Safari)
- [x] Design responsivo mobile-first para telas de 320px a 4K
- [x] Touch-friendly: botões mínimo 44px, gestos de swipe
- [x] Safe area insets para iPhone (notch, dynamic island)
- [x] Meta tags para iOS standalone, Android TWA, Windows PWA
- [x] Fallback de Web Speech API para Safari iOS (limitações)
- [x] Testes de layout em viewport mobile, tablet e desktop

## Gestalt-Terapia — Formulários e Protocolos
- [x] Formulário de Ciclo de Contato (pré-contato, contato, contato final, pós-contato)
- [x] Registro de Mecanismos de Interrupção de Contato (confluência, introjeção, projeção, retroflexão, deflexão, egotismo)
- [x] Formulário de Awareness (consciência corporal, emocional, cognitiva no aqui-e-agora)
- [x] Registro de Experimentos Gestálticos realizados na sessão (cadeira vazia, diálogo polaridades, etc.)
- [x] Formulário de Necessidades e Figuras-Fundo (necessidades emergentes, gestalten inacabadas)
- [x] Campo Fenomenológico do paciente (percepção do campo relacional)
- [x] Integração Gestalt com TE/TCC no sistema de evolução clínica

## Integração Multiabordagem TCC + TE + Gestalt
- [x] Sistema de perfil terapêutico do paciente (abordagem primária, secundária)
- [x] IA personaliza formulários e sugestões baseado no histórico e abordagem do paciente
- [x] Mapeamento cruzado: esquemas (TE) ↔ crenças centrais (TCC) ↔ gestalten inacabadas (Gestalt)
- [x] Resumo pré-consulta IA integra dados das 3 abordagens

## Formulários Clínicos Profissionais Avançados (Nível Premium)
- [x] YSQ-S3 completo (90 itens, 18 esquemas, 5 domínios, scoring automático- [x] Diagrama de Conceitualição Cognitiva de Judith Beck (modelo visual interativo)
- [x] BDI-II completo (21 itens, scoring e classificação automática)
- [x] BAI completo (21 itens, scoring e classificação automática)
- [x] PHQ-9 completo (9 itens, scoring e classificação automática)
- [x] GAD-7 completo (7 itens, scoring e classificação automática)
- [x] SMI - Schema Mode Inventory (modos de esquema completo)
- [x] YPI - Young Parenting Inventory (inventário parental)
- [x] Registro de Ciclo de Contato Gestalt (formulário visual interativo)
- [x] Escala de Awareness Gestáltica (consciência corporal/emocional/cognitiva)
- [x] Todos com gráficos de evolução temporal e comparação entre aplicações

## Cadastro Completo de Pacientes
- [x] Cadastro com identificação por canal de origem (WhatsApp, Telegram, site, manual)
- [x] Rastreabilidade: saber de onde veio cada paciente e todo histórico de interações
- [x] Vincular paciente ao número WhatsApp e chat Telegram automaticamente
- [x] Formulário de cadastro completo com todos os dados pessoais e clínicos

## Rastreabilidade de Mensagens por Paciente e Plataforma
- [x] Vincular cada mensagem recebida (WhatsApp/Telegram) ao paciente correto automaticamente
- [x] Exibir no perfil do paciente todas as mensagens dele por plataforma (WhatsApp vs Telegram)
- [x] Filtro por plataforma no histórico de mensagens do paciente
- [x] Identificação automática do paciente pelo número WhatsApp ou chat ID Telegram

## Integração Instagram
- [x] Instagram Graph API para receber DMs e comentários
- [x] Rastrear mensagens de pacientes vindas do Instagram
- [x] Vincular perfil Instagram do paciente ao cadastro
- [x] Exibir interações do Instagram no histórico do paciente
- [x] Webhook para receber notificações de comentários e DMs do Instagram
- [x] Canal Instagram no log de mensagens e no painel de mensagens

## CRM de Vendas e Funil de Conversão
- [x] Tabela de leads com origem (WhatsApp, Telegram, Instagram, site), status do funil, scoring
- [x] Pipeline visual de vendas: Lead → Contato → Interesse → Agendamento → Consulta → Paciente Ativo
- [x] Scoring automático de leads baseado em interações (mensagens, visitas, cliques)
- [x] Rastreamento de cada interação por plataforma vinculada ao lead/paciente
- [x] Dashboard de conversão com métricas: taxa de conversão por canal, tempo médio de conversão
- [x] Automação de follow-up: mensagem automática para leads que não responderam em X horas
- [x] Tag de origem em cada paciente convertido (veio do Instagram, WhatsApp, etc.)
- [x] Histórico completo de touchpoints do lead antes da conversão
- [x] Página de CRM no dashboard com visão Kanban do funil
- [x] Alertas para leads quentes que precisam de follow-up

## Integração Outlook Calendar (Substituindo Google Calendar)
- [x] Implementar autenticação Outlook Calendar com Microsoft Graph API
- [x] Criar routers tRPC para sincronização Outlook
- [x] Atualizar UI para integração Outlook
- [ ] Testar fluxo completo de agendamento com Outlook
- [ ] Documentar credenciais e configuração Outlook
## Gestão Total do Instagram - Psi cóloga Daniela Coelho
- [x] Criar sistema de gestão de conteúdo Instagram (CRUD posts, stories, reels)
- [x] Implementar editor visual de posts com IA
- [x] Criar gerador automático de captions otimizadas com hashtags estratégicas
- [x] Implementar analytics e métricas de performance (views, likes, shares, saves)
- [x] Criar otimização automática de conteúdo (melhor horário, formato, tom)
- [x] Integrar Instagram Graph API com automação de agentes Manus
- [x] Criar dashboard de estratégia de crescimento (acessos, inscritos, monetização)
- [x] Implementar agendamento automático de posts
- [x] Criar sugestões de conteúdo baseadas em tendências
- [x] Sincronizar alterações com repositório Dani no GitHub
- [x] Testar sistema completo de gestão Instagram


## Sistema de Aprendizado Contínuo e Evolução Quantitativa
- [x] Criar tabelas DB para histórico de ações, métricas e feedback
- [x] Implementar logging automático de todas as ações do agente
- [x] Criar engine de análise de performance e cálculo de métricas
- [x] Integrar com GitHub para versionamento automático
- [x] Implementar feedback loop e sugestões de otimização
- [x] Criar dashboard de evolução e aprendizados
- [x] Testar sistema completo de aprendizado contínuo


## Funil Viral Integrado (5000-10000 consultas/mês)
- [ ] Implementar sistema de referral viral com incentivos e gamificação
- [ ] Criar automação de marketing e nurturing de leads
- [ ] Otimizar landing pages para conversão máxima (CTR, CTA, copy)
- [ ] Integrar analytics e rastreamento de funil (funnel tracking)
- [ ] Configurar automação de social proof e testimoniais virais
- [ ] Implementar estratégia de conteúdo viral (blog, vídeos, posts)
- [ ] Criar sistema de notificações push e email automático
- [ ] Testar e validar funil viral completo


## 5 Inovações Quânticas 2026
- [ ] Implementar Avatar 3D da Psicóloga com sincronização de voz (500-1000 consultas/mês)
- [ ] Criar sistema de Emotion AI em tempo real com análise de sentimentos (diferencial premium)
- [ ] Implementar geração de Podcast/Audiobook IA automático (200-500 consultas/mês)
- [ ] Criar Quiz Viral com gamificação e compartilhamento (1000-2000 leads/mês)
- [ ] Implementar AR para visualização de Esquemas Emocionais (300-500 consultas/mês)
- [ ] Atualizar README.md com as 5 inovações
- [ ] Sincronizar tudo com repositório Dani


## Dashboard de Métricas (NOVO)
- [ ] Criar página Dashboard.tsx com layout de gráficos
- [ ] Implementar gráfico de Pacientes por Origem (pizza/donut)
- [ ] Implementar gráfico de Taxa de Conversão de Leads (funil/barras)
- [ ] Implementar gráfico de Engagement Instagram (linha/área)
- [ ] Implementar gráfico de Progresso Clínico por Abordagem Terapêutica (barras)
- [ ] Criar procedimento tRPC para buscar métricas de pacientes
- [ ] Criar procedimento tRPC para buscar métricas de leads
- [ ] Criar procedimento tRPC para buscar métricas de Instagram
- [ ] Criar procedimento tRPC para buscar progresso clínico
- [ ] Integrar gráficos com dados em tempo real
- [ ] Adicionar filtros por período (hoje, semana, mês, ano)
- [ ] Adicionar cards de resumo (total pacientes, leads, conversão %)
- [ ] Exportar relatórios em PDF

## Agendamento Automático via IA (NOVO)
- [ ] Integração com Outlook Calendar API (OAuth2)
- [ ] Buscar horários disponíveis do calendário Outlook
- [ ] Treinar assistente IA para reconhecer pedidos de agendamento
- [ ] IA sugere 3 horários disponíveis quando paciente/lead pede para agendar
- [ ] Implementar confirmação de agendamento via chat
- [ ] Criar evento no Outlook Calendar automaticamente
- [ ] Enviar confirmação de agendamento via WhatsApp/Telegram
- [ ] Enviar arquivo .ics para o paciente adicionar ao seu calendário
- [ ] Lembrete automático 24h antes da consulta
- [ ] Permitir reagendamento via IA
- [ ] Cancelamento de consulta via IA com atualização do calendário
- [ ] Histórico de agendamentos sugeridos pela IA


## Agendamento Inteligente com Detecção de Paciente (NOVO)
- [ ] Corrigir erro no routers.ts (booking router duplicado)
- [ ] Implementar validação de conflitos de horário (PREVENIR DOUBLE-BOOKING)
- [ ] Criar formulário de agendamento público com validação de nome e telefone com DDD
- [ ] Implementar máscara de telefone (XX) XXXXX-XXXX
- [ ] Criar procedimento tRPC para buscar paciente por telefone
- [ ] Criar procedimento tRPC para criar/atualizar paciente
- [ ] Criar procedimento tRPC para agendar consulta com detecção automática de paciente
- [ ] Integrar agendamento com Outlook Calendar
- [ ] Enviar confirmação de agendamento via WhatsApp/SMS
- [ ] Enviar arquivo .ics para o paciente
- [ ] Lembrete automático 24h antes da consulta
- [ ] Página de agendamento público com seleção de horários
- [ ] Integrar com Assistente IA para sugerir horários quando paciente pedir
