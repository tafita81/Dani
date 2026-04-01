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
- [x] Melhorar Assistente Clínico: filtros avançados de paciente (email, telefone, data nascimento)
- [x] Melhorar Assistente Clínico: botão de salvar seleção de paciente
- [x] Melhorar Assistente Clínico: salvar seleção no banco de dados antes de iniciar gravação
- [x] Garantir que toda análise seja salva automaticamente no banco com todos os campos preenchidos
- [x] Criar botão "Ver Histórico" no Assistente Clínico
- [x] Criar modal com histórico completo do paciente
- [x] Exibir análises anteriores, temas recorrentes e sugestões
- [x] Carregar histórico automaticamente ao salvar paciente
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
- [x] Assistente de Carro: processar perguntas de voz com IA
- [x] Assistente de Carro: exibir respostas na tela
- [x] Assistente de Carro: falar respostas via TTS (pt-BR)
- [x] Assistente de Carro: consultar dados internos (pacientes, agenda, sessões, CRM)
- [x] Assistente de Carro: bloquear/liberar horários no Outlook
- [x] Assistente de Carro: reconhecimento de voz para comandos
- [x] Assistente de Carro: respostas por áudio (TTS)
- [x] Assistente de Carro: interface mãos-livres

## Fase 6: Testes e Otimização
- [x] Testes unitários (Vitest) - 21 testes passando
- [x] Verificação de tipos TypeScript
- [x] Validação de build
- [x] Validação de segurança
- [x] Otimização de queries

## Fase 6.5: Gestão Financeira e Pagamentos
- [x] Adicionar campos de origem de consulta (app, particular, plano de saúde)
- [x] Adicionar campos de pagamento (valor, data, status, método)
- [x] Criar tabela de histórico de valores com datas
- [x] Criar tabela de transações financeiras
- [x] Criar tabela de inadimplência e pendências
- [ ] Implementar dashboard de detalhes do paciente com gráficos
- [ ] Implementar exportação em PDF com relatórios clínicos
- [ ] Implementar comparação entre sessões lado-a-lado

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
