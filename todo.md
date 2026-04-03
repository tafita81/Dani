# Plataforma Dani - TODO

## Fase 1: Arquitetura e Design System
- [x] Definir design system (cores, tipografia, componentes)
- [x] Criar paleta de cores profissional para contexto clínico
- [x] Estruturar layout base (dashboard, navegação, responsividade)
- [x] Documentar arquitetura de dados

## Fase 2: Banco de Dados
- [x] Criar tabelas de usuários e autenticação
- [x] Criar tabelas de pacientes e dados clínicos
- [x] Criar tabelas de agenda e compromissos
- [x] Criar tabelas de sessões e prontuário eletrônico
- [x] Criar tabelas de CRM e leads
- [x] Criar tabelas de integrações (WhatsApp, Google Calendar)
- [x] Criar índices e relacionamentos

## Fase 3: Backend - Routers e Procedures
- [x] Router de autenticação e perfil
- [x] Router de pacientes (CRUD, busca, filtros)
- [x] Router de agenda (agendamento, consulta, atualização)
- [x] Router de sessões (criação, atualização, geração de notas)
- [x] Router de CRM (leads, interações, conversão)
- [x] Router de assistente clínico (IA, transcrição, sugestões)
- [ ] Router de integrações (WhatsApp, Google Calendar)
- [ ] Router de assistente de carro (voz, comandos)

## Fase 4: Frontend - Páginas e Componentes
- [x] Dashboard principal (visão geral, estatísticas)
- [x] Página de Assistente Clínico (transcrição, análise)
- [ ] Página de login/autenticação
- [ ] Página de perfil profissional
- [ ] Página de pacientes (lista, cadastro, detalhes)
- [ ] Página de agenda (calendário, agendamentos)
- [ ] Página de sessões (histórico, notas, análise)
- [ ] Página de CRM (leads, funil, interações)
- [ ] Página de configurações (integrações, preferências)

## Fase 5: Assistentes com IA
- [x] Integrar API de LLM para análise clínica
- [x] Implementar transcrição de sessões em tempo real (Web Speech API)
- [x] Implementar sugestões de intervenções em tempo real
- [x] Gerar notas de sessão automaticamente
- [ ] Criar resumo pré-consulta inteligente
- [ ] Implementar reconhecimento de voz (pt-BR) - Assistente de Carro
- [ ] Integrar TTS para respostas por áudio
- [ ] Implementar modo turbo do assistente de carro
- [ ] Criar interface do assistente de carro (mãos-livres)

## Fase 6: Testes e Otimização
- [x] Testes unitários (Vitest) - 21 testes passando
- [x] Verificação de tipos TypeScript
- [x] Validação de build
- [x] Validação de segurança
- [x] Otimização de queries

## Fase 7: Integrações (Futuro)
- [ ] Integração com WhatsApp Business API
- [ ] Integração com Google Calendar
- [ ] Webhook para mensagens WhatsApp
- [ ] Sincronização de agenda
- [ ] Lembretes automáticos

## Fase 8: Publicação
- [x] Build de produção
- [x] Configuração de variáveis de ambiente
- [x] Deploy da plataforma
- [x] Validação de acesso e funcionalidades
- [x] Documentação final

## Fase 12: Replicação 100% do Replit
- [x] Implementar sidebar lateral com 6 abas (Dashboard, Pacientes, Agendamentos, CRM, Assistente IA, Modo Carro)
- [x] Adicionar rodapé com iniciais "DC" e dados do profissional
- [x] Implementar botão de pendências
- [x] Aplicar cores e estilos idênticos ao Replit
- [x] Recriar Dashboard com estatísticas e cards (57 pacientes, 6 consultas hoje, 18 leads)
- [x] Recriar página de Pacientes com tabela e filtros avançados
- [x] Recriar página de Agendamentos com calendário grid (9h-21h)
- [x] Recriar página de CRM de Leads com pipeline de conversão
- [x] Recriar página de Assistente Clínico com seleção de paciente
- [x] Implementar Assistente de Carro com TTS em português brasileiro (pt-BR)
- [x] Implementar Web Speech API para reconhecimento de voz
- [x] Implementar SpeechSynthesis para leitura de respostas em áudio
- [x] Adicionar sugestões rápidas contextuais
- [x] Implementar histórico de conversas
- [x] Implementar funcionalidades (exportação, filtros, busca)
- [x] Popular banco com 84 pacientes, 35 agendamentos, 18 leads
- [x] Testar TTS em diferentes navegadores
- [x] Testar e validar replicação completa


## Fase 13: Correções do Modo Carro
- [x] Corrigir TTS para português brasileiro (pt-BR)
- [x] Implementar chamada ao backend para processar perguntas
- [x] Adicionar resposta da IA após transcrição
- [x] Adicionar tratamento de erros
- [x] Testar funcionalidade completa
- [x] Validar áudio em português brasileiro

## Fase 15: Debugar e Corrigir Agente LLM
- [x] Corrigir db.query para db.select().from()
- [x] Configurar continuous=false no Speech Recognition
- [x] Implementar processamento automático após transcrição
- [x] Testar chamada ao backend com curl
- [x] Validar resposta em português com dados reais
- [x] Confirmar TTS funcionando
- [x] 29 testes passando


## Fase 14: Agente LLM com Acesso ao Banco de Dados
- [x] Criar router de agente LLM (agent.ts)
- [x] Implementar queries para consultar pacientes, agendamentos, leads, sessões
- [x] Integrar agente no CarAssistant
- [x] Testar respostas com dados reais
- [x] Validar fallback inteligente
- [x] Logging detalhado para debugging


## Fase 16: Expansão do Agente LLM - Acesso Completo a Todas as Tabelas
- [x] Consultar todas as 12 tabelas do banco
- [x] Implementar joins por patientId
- [x] Acessar dados de: patients, appointments, sessionNotes, leads, treatmentPlans, anamnesis, inventoryResults, cognitiveConcepts, moodEntries, professionalProfile, users
- [x] Criar contexto completo com todos os campos
- [x] Testar respostas com dados interligados

## Fase 17: Modo Sempre Ativo (Continuous=true)
- [x] Mudar continuous=false para continuous=true
- [x] Implementar reinício automático após processar
- [x] Manter escuta contínua sem precisar clicar
- [x] Adicionar indicador visual de escuta ativa
- [x] Testar modo contínuo por 5 minutos


## Fase 18: Correção de Data/Hora - Usar Data/Hora Atual do Sistema
- [x] Adicionar contexto de data/hora atual ao agente LLM
- [x] Implementar timezone GMT-3 (Brasil)
- [x] Corrigir cálculos de agendamentos para usar data de hoje
- [x] Validar datas em todas as queries do banco
- [x] Testar respostas com data/hora corretas
- [x] Adicionar formatação de data em português (2 de abril de 2026)

## Fase 19: Usar Hora do Cliente (Navegador) em vez de Servidor
- [x] Enviar clientTimestamp do navegador
- [x] Usar hora do cliente no backend
- [x] Testar com hora correta do cliente (18:04)
- [x] Validar resposta com hora correta
- [x] Atualizar hora a cada 100ms (10x por segundo)
- [x] Incluir segundos na exibição (HH:MM:SS)
- [x] Fonte monospace para melhor legibilidade


## Fase 21: Comandos por Voz Rápidos no Modo Carro
- [x] Implementar reconhecimento de comandos: "próxima consulta", "pacientes hoje", "novo lead"
- [x] Adicionar atalhos inteligentes para perguntas frequentes
- [x] Testar reconhecimento de comandos

## Fase 22: Gravação de Áudio no Assistente Clínico
- [ ] Implementar gravação de áudio das sessões
- [ ] Salvar áudio no banco de dados
- [ ] Adicionar controle de gravação (iniciar/parar)
- [ ] Testar gravação e reprodução

## Fase 23: Dashboard de Análise de Interações
- [ ] Criar página de Analytics
- [ ] Implementar gráficos de perguntas mais frequentes
- [ ] Implementar gráficos de tempo médio de resposta
- [ ] Implementar gráficos de padrões de uso
- [ ] Testar dashboard

## Fase 24: TTS Automático em Todas as Respostas
- [x] Implementar TTS automático no Modo Carro
- [ ] Implementar TTS automático no Assistente Clínico
- [x] Testar reprodução de áudio em português
- [x] Validar qualidade de áudio


## Fase 25: Acesso Completo ao Histórico de Sessões no Modo Carro
- [ ] Expandir agente para acessar histórico completo de sessões do paciente
- [ ] Implementar compilação de análises da IA de todas as sessões
- [ ] Gerar recomendações de tratamento baseadas em histórico completo
- [ ] Responder perguntas sobre análise resumida da IA por paciente
- [ ] Responder perguntas sobre sugestões de tratamento por paciente
- [ ] Testar com pacientes específicos
- [ ] Validar acesso a todas as informações de sessões anteriores

## Fase 26: População Completa do Banco de Dados com Dados Realistas
- [x] Criar script de seed com 50 pacientes
- [x] Popular 250 sessões com transcrições completas
- [x] Incluir análises de IA realistas em cada sessão
- [x] Popular 150 agendamentos
- [x] Popular 20 leads com interações
- [x] Garantir que TODAS as tabelas estejam interligadas por patientId
- [x] Incluir dados de anamnese, conceitos cognitivos, planos de tratamento
- [x] Incluir dados de inventários psicológicos (BDI-II, BAI, PHQ-9, GAD-7)
- [x] Incluir dados de humor (mood entries)
- [x] Executar seed com sucesso - 50 pacientes, 250 sessões, 150 agendamentos, 20 leads

## Fase 27: Testes de Leitura por Voz
- [ ] Testar leitura por voz APENAS após resposta aparecer na tela
- [ ] Validar qualidade de áudio em português brasileiro
- [ ] Testar com diferentes tipos de perguntas
- [ ] Validar volume e velocidade de fala


## Fase 28: Protocolo Completo Conforme CFP 13/2022
- [ ] Criar tabelas para armazenar todas as perguntas do protocolo
- [ ] Implementar estrutura de perguntas por seção (anamnese, avaliação, plano, evolução)
- [ ] Adicionar campos para capturar respostas da transcrição
- [ ] Implementar IA para extrair respostas automaticamente da transcrição
- [ ] Salvar respostas no banco para reutilização automática
- [ ] Criar página de protocolo com formulário completo
- [ ] Implementar botão de exportação em PDF
- [ ] Testar preenchimento automático com dados de transcrição
- [ ] Validar conformidade com CFP 13/2022


## Fase 29: Remover Login e Implementar Acesso Direto
- [x] Remover tela de login
- [x] Implementar acesso direto via URL secreto
- [x] Criar token de acesso exclusivo para Daniela
- [x] Implementar autenticação por token em todas as rotas
- [x] Testar acesso sem login

## Fase 30: Melhores Práticas Globais 2026 (Brasil + EUA)
- [x] Implementar HIPAA compliance (EUA)
- [x] Implementar LGPD compliance (Brasil)
- [x] Implementar GDPR compliance (Europa)
- [x] Encriptação end-to-end de dados
- [ ] Autenticação biométrica (opcional)
- [x] Audit trail completo de todas as ações
- [x] Backup automático com redundância
- [ ] Disaster recovery plan

## Fase 31: Protocolo CFP 13/2022 + APA Guidelines
- [ ] Implementar estrutura CFP 13/2022 completa
- [ ] Adicionar APA Guidelines (DSM-5, Ethical Guidelines)
- [ ] Criar validação de conformidade em tempo real
- [ ] Implementar sistema de versionamento de protocolos
- [ ] Criar notificações de atualizações de regras

## Fase 32: IA Avançada para Análise Clínica
- [ ] Integrar GPT-4 ou Claude 3.5 para análise profunda
- [ ] Implementar ML para predição de risco de suicídio
- [ ] Criar análise de padrões comportamentais
- [ ] Implementar recomendações de técnicas baseadas em histórico
- [ ] Análise de sentimento em tempo real
- [ ] Detecção de crises e alertas automáticos

## Fase 33: Gerador de PDF Profissional
- [ ] Criar template de protocolo em PDF
- [ ] Implementar assinatura digital com CRP
- [ ] Adicionar gráficos de evolução
- [ ] Criar comparação de sessões lado a lado
- [ ] Implementar exportação em múltiplos formatos (PDF, DOCX, HTML)
- [ ] Adicionar marca d'água de confidencialidade

## Fase 34: Transcrição Automática com Análise
- [ ] Implementar Web Speech API com alta precisão
- [ ] Integrar Whisper API para transcrição offline
- [ ] Criar análise em tempo real de transcrição
- [ ] Extrair automaticamente respostas para protocolo
- [ ] Implementar correção automática com IA
- [ ] Salvar histórico completo de transcrições

## Fase 37: URL de Acesso Secreto
- [x] Gerar URL única para Daniela
- [x] Implementar middleware de validação
- [x] Criar documentação de acesso
- [x] Testar acesso com token
- [x] Garantir segurança da URL

## Fase 35: Testes e Validação
- [ ] Testar com 50 pacientes fictícios
- [ ] Validar conformidade CFP + APA
- [ ] Testar segurança LGPD + HIPAA
- [ ] Testar performance com 1000+ sessões
- [ ] Testar transcrição em diferentes sotaques
- [ ] Validar geração de PDF
- [ ] Testar com dados reais de Daniela

## Fase 36: Implementação de Funcionalidades Avançadas
- [ ] Dashboard com analytics avançado
- [ ] Gráficos de evolução por paciente
- [ ] Análise de padrões de tratamento
- [ ] Recomendações de próximos passos
- [ ] Integração com calendário (Outlook, Google)
- [ ] Lembretes automáticos para pacientes
- [ ] Sistema de notificações em tempo real

## Fase 37: Responsive Design Completo
- [x] Criar componentes responsivos para todos os dispositivos
- [x] Otimizar meta tags de viewport
- [x] Testar em iPhone, iPad, Android, Desktop
- [x] Auto-ajuste de layout por orientação
- [x] Otimizar tamanho de fonte por dispositivo
- [x] Sidebar colapsável em mobile
- [x] Botões aumentados para toque
- [x] Criar documentação de acesso


## Fase 41: Análise Inteligente e Completa de Dados do Paciente
- [x] Criar mapeamento de sinônimos clínicos (resumo=summary, notas=notes, formulário=form, etc)
- [x] Implementar acesso a TODAS as linhas e colunas sem limitações
- [x] Criar sistema de análise contextualizada de histórico completo
- [x] Implementar gerador de recomendações para próxima consulta baseado em evolução
- [x] Integrar análise inteligente no Modo Carro
- [ ] Testar com perguntas variadas e validar respostas precisas
- [ ] Garantir que respostas sejam baseadas em evolução mais recente do paciente
- [x] Implementar interpretação flexível de perguntas (mesmo com nomes diferentes)
- [x] Criar sistema de associação automática de campos do banco com perguntas


## Fase 42: Correção Completa de Agendamentos
- [x] Corrigir dados de agendamentos na página de Agendamentos
- [x] Mostrar nomes reais dos pacientes em vez de genérico
- [x] Corrigir formatação de datas (Invalid Date)
- [x] Adicionar características do agendamento (retorno, primeiro, rotina, etc)
- [x] Preencher calendário com agendamentos nos horários corretos
- [ ] Adicionar mais características: tipo de atendimento, duração, modalidade, status, observações
- [ ] Testar página de agendamentos completa


## Fase 43: Sistema Completo de Agendamento Público
- [ ] Criar página pública de agendamento com formulário (nome, email, telefone, tipo, modalidade, horário)
- [ ] Implementar ícone de pendências no Dashboard com contador
- [ ] Criar página de confirmação/cancelamento de agendamentos
- [ ] Integrar envio automático de email de confirmação/cancelamento
- [ ] Integrar envio automático de WhatsApp de confirmação/cancelamento
- [ ] Testar fluxo completo de agendamento
- [ ] Gerar link público compartilhável
- [ ] Sincronizar em tempo real com banco de dados
