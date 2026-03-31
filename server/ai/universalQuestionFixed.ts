import { publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../core_logic/db";
import { invokeLLM } from "../_core/llm";

export const universalQuestionFixed = publicProcedure
  .input(z.object({
    question: z.string(),
    patientId: z.string().optional(),
    context: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    try {
      const startTime = Date.now();
      
      console.log(`[UniversalQuestion] Pergunta recebida: "${input.question}"`);
      
      // Buscar TODOS os dados do banco (sem filtro de userId)
      const allPatients = await db.getAllPatients();
      const allAppointments = await db.getAppointments(ctx.user?.id || 60036);
      const allSessions = await db.getSessionNotes(ctx.user?.id || 60036, 0) || [];
      
      console.log(`[UniversalQuestion] Dados carregados: ${allPatients.length} pacientes TOTAIS, ${allAppointments.length} agendamentos, ${allSessions.length} sessões`);
      
      const question = input.question.toLowerCase();
      let answer = '';
      let dataUsed: any = {};

      // ===== USAR IA PARA ENTENDER A INTENÇÃO DA PERGUNTA =====
      // Preparar dados para o LLM
      const patientsData = allPatients.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        status: p.status,
        totalSessions: p.totalSessions,
        primaryApproach: p.primaryApproach,
      }));

      const appointmentsData = allAppointments.slice(0, 10).map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        startTime: new Date(a.startTime).toLocaleString('pt-BR'),
        status: a.status,
      }));

      // Chamar LLM para entender a intenção e buscar resposta
      const llmPrompt = `Você é um assistente inteligente para um terapeuta clínico. 
      
Pergunta do usuário: "${input.question}"

Dados disponíveis:
- Total de pacientes: ${allPatients.length}
- Pacientes: ${JSON.stringify(patientsData, null, 2)}
- Agendamentos: ${JSON.stringify(appointmentsData, null, 2)}
- Total de sessões: ${allSessions.length}

Tarefas:
1. Entenda a intenção da pergunta (mesmo que não use palavras exatas)
2. Busque os dados relevantes
3. Forneça uma resposta clara, concisa e útil em português brasileiro

Responda APENAS com a resposta final, sem explicações adicionais. A resposta deve ser natural e conversacional.`;

      try {
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um assistente clínico inteligente que entende perguntas sobre pacientes, agendamentos e sessões. Responda de forma clara e natural em português brasileiro."
            },
            {
              role: "user",
              content: llmPrompt as any
            }
          ]
        });

        const llmContent = llmResponse.choices[0]?.message?.content;
        answer = typeof llmContent === 'string' ? llmContent : "Desculpe, não consegui processar sua pergunta.";
        dataUsed = {
          totalPatients: allPatients.length,
          patients: patientsData,
          appointments: appointmentsData,
          usedAI: true
        };

        console.log(`[UniversalQuestion] Resposta gerada com IA: "${answer}"`);
      } catch (llmError) {
        console.error('[UniversalQuestion] Erro ao chamar LLM:', llmError);
        
        // Fallback: usar lógica tradicional se LLM falhar
        if (question.includes('quantos') && (question.includes('paciente') || question.includes('cliente'))) {
          const activeCount = allPatients.filter((p: any) => p.status === 'active').length;
          const inactiveCount = allPatients.filter((p: any) => p.status === 'inactive').length;
          answer = `Você tem ${allPatients.length} pacientes cadastrados no total. Sendo ${activeCount} ativos e ${inactiveCount} inativos.`;
          dataUsed = { totalPatients: allPatients.length, activePatients: activeCount, inactivePatients: inactiveCount };
        } else if (question.includes('paciente') || question.includes('quem')) {
          const patientNames = allPatients.map((p: any) => p.name).join(', ');
          answer = `Seus pacientes são: ${patientNames}.`;
          dataUsed = { patients: patientsData };
        } else if (question.includes('agendamento') || question.includes('consulta')) {
          answer = `Você tem ${allAppointments.length} agendamentos registrados.`;
          dataUsed = { totalAppointments: allAppointments.length };
        } else {
          answer = `Recebi sua pergunta: "${input.question}". Tente perguntar sobre: quantos pacientes, nomes dos pacientes, agendamentos, sessões, ou informações de contato.`;
        }
      }

      const responseTime = Date.now() - startTime;
      const result = {
        success: true,
        question: input.question,
        answer: answer,
        dataSource: 'database',
        dataUsed: dataUsed,
        timestamp: new Date(),
        responseTime: responseTime,
      };

      console.log(`[UniversalQuestion] Resposta gerada em ${responseTime}ms`);
      return result;
    } catch (error) {
      console.error('[UniversalQuestion] Erro ao processar pergunta:', error);
      return {
        success: false,
        question: input.question,
        answer: 'Desculpe, ocorreu um erro ao processar sua pergunta.',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
