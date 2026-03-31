/**
 * Quiz Viral — Inovação Quântica 2026
 * Gamificação, compartilhamento viral e geração de leads
 * Projeção: 1000-2000 leads/mês
 */

// ═══════════════════════════════════════════════════════════════
// ─── QUIZ TEMPLATES ───
// ═══════════════════════════════════════════════════════════════

export const quizzes = {
  anxiety_level: {
    title: "Qual é seu nível de ansiedade?",
    description: "Descubra seu perfil de ansiedade em 5 minutos",
    questions: [
      {
        id: 1,
        question: "Com que frequência você se sente preocupado?",
        answers: [
          { text: "Raramente", score: 1 },
          { text: "Às vezes", score: 2 },
          { text: "Frequentemente", score: 3 },
          { text: "Constantemente", score: 4 },
        ],
      },
      {
        id: 2,
        question: "Como você dorme à noite?",
        answers: [
          { text: "Muito bem", score: 1 },
          { text: "Bem", score: 2 },
          { text: "Com dificuldade", score: 3 },
          { text: "Insônia frequente", score: 4 },
        ],
      },
      {
        id: 3,
        question: "Você tem dificuldade em controlar seus pensamentos?",
        answers: [
          { text: "Nunca", score: 1 },
          { text: "Raramente", score: 2 },
          { text: "Às vezes", score: 3 },
          { text: "Sempre", score: 4 },
        ],
      },
      {
        id: 4,
        question: "Como você se sente em situações sociais?",
        answers: [
          { text: "Confortável", score: 1 },
          { text: "Um pouco nervoso", score: 2 },
          { text: "Bastante nervoso", score: 3 },
          { text: "Muito ansioso", score: 4 },
        ],
      },
      {
        id: 5,
        question: "Você tem sintomas físicos de ansiedade?",
        answers: [
          { text: "Nunca", score: 1 },
          { text: "Raramente", score: 2 },
          { text: "Às vezes", score: 3 },
          { text: "Frequentemente", score: 4 },
        ],
      },
    ],
    results: {
      low: {
        score: [5, 8],
        title: "Nível Baixo de Ansiedade",
        description: "Você está em um bom lugar! Continue com suas práticas de bem-estar.",
        recommendation: "Mantenha rotinas saudáveis e práticas de mindfulness.",
        cta: "Agende uma consulta para aprender mais técnicas preventivas",
      },
      moderate: {
        score: [9, 14],
        title: "Nível Moderado de Ansiedade",
        description: "Você pode se beneficiar de técnicas de manejo de ansiedade.",
        recommendation: "Considere terapia cognitivo-comportamental (TCC).",
        cta: "Agende uma consulta com a Psicóloga Daniela",
      },
      high: {
        score: [15, 20],
        title: "Nível Alto de Ansiedade",
        description: "É importante buscar ajuda profissional.",
        recommendation: "Recomendamos sessões regulares de psicoterapia.",
        cta: "Agende uma consulta urgente com a Psicóloga Daniela",
      },
    },
  },

  emotional_intelligence: {
    title: "Qual é seu nível de inteligência emocional?",
    description: "Avalie sua capacidade de reconhecer e gerenciar emoções",
    questions: [
      {
        id: 1,
        question: "Você consegue identificar suas emoções facilmente?",
        answers: [
          { text: "Sempre", score: 4 },
          { text: "Frequentemente", score: 3 },
          { text: "Às vezes", score: 2 },
          { text: "Nunca", score: 1 },
        ],
      },
      {
        id: 2,
        question: "Como você lida com críticas?",
        answers: [
          { text: "Com abertura e aprendizado", score: 4 },
          { text: "Bem, mas com alguma dificuldade", score: 3 },
          { text: "Com defensividade", score: 2 },
          { text: "Muito mal", score: 1 },
        ],
      },
      {
        id: 3,
        question: "Você consegue reconhecer emoções nos outros?",
        answers: [
          { text: "Sempre", score: 4 },
          { text: "Frequentemente", score: 3 },
          { text: "Às vezes", score: 2 },
          { text: "Raramente", score: 1 },
        ],
      },
      {
        id: 4,
        question: "Como você se motiva para alcançar objetivos?",
        answers: [
          { text: "Muito bem, sou automotivado", score: 4 },
          { text: "Bem, com algum esforço", score: 3 },
          { text: "Com dificuldade", score: 2 },
          { text: "Não consigo me motivar", score: 1 },
        ],
      },
      {
        id: 5,
        question: "Como são seus relacionamentos interpessoais?",
        answers: [
          { text: "Muito saudáveis e satisfatórios", score: 4 },
          { text: "Bons, com alguns desafios", score: 3 },
          { text: "Problemáticos", score: 2 },
          { text: "Muito conflituosos", score: 1 },
        ],
      },
    ],
    results: {
      low: {
        score: [5, 8],
        title: "Inteligência Emocional em Desenvolvimento",
        description: "Há espaço para crescimento. Trabalhe na autoconhecimento.",
        recommendation: "Terapia pode ajudar a desenvolver suas habilidades emocionais.",
        cta: "Comece sua jornada de desenvolvimento emocional",
      },
      moderate: {
        score: [9, 14],
        title: "Boa Inteligência Emocional",
        description: "Você tem uma base sólida. Continue desenvolvendo.",
        recommendation: "Aprofunde suas habilidades com coaching ou terapia.",
        cta: "Potencialize sua inteligência emocional",
      },
      high: {
        score: [15, 20],
        title: "Excelente Inteligência Emocional",
        description: "Você é um modelo em gestão emocional!",
        recommendation: "Compartilhe seus conhecimentos e continue evoluindo.",
        cta: "Explore desenvolvimento avançado",
      },
    },
  },

  relationship_health: {
    title: "Como está a saúde do seu relacionamento?",
    description: "Avalie a qualidade do seu relacionamento amoroso",
    questions: [
      {
        id: 1,
        question: "Você se sente seguro e confiante no relacionamento?",
        answers: [
          { text: "Totalmente", score: 4 },
          { text: "Geralmente", score: 3 },
          { text: "Às vezes", score: 2 },
          { text: "Nunca", score: 1 },
        ],
      },
      {
        id: 2,
        question: "Como é a comunicação com seu parceiro?",
        answers: [
          { text: "Aberta e honesta", score: 4 },
          { text: "Boa, com alguns desafios", score: 3 },
          { text: "Difícil", score: 2 },
          { text: "Muito ruim", score: 1 },
        ],
      },
      {
        id: 3,
        question: "Vocês resolvem conflitos de forma saudável?",
        answers: [
          { text: "Sempre", score: 4 },
          { text: "Frequentemente", score: 3 },
          { text: "Às vezes", score: 2 },
          { text: "Nunca", score: 1 },
        ],
      },
      {
        id: 4,
        question: "Você se sente apoiado e valorizado?",
        answers: [
          { text: "Sempre", score: 4 },
          { text: "Geralmente", score: 3 },
          { text: "Às vezes", score: 2 },
          { text: "Nunca", score: 1 },
        ],
      },
      {
        id: 5,
        question: "Como está a intimidade emocional e física?",
        answers: [
          { text: "Excelente", score: 4 },
          { text: "Boa", score: 3 },
          { text: "Precisa melhorar", score: 2 },
          { text: "Inexistente", score: 1 },
        ],
      },
    ],
    results: {
      low: {
        score: [5, 8],
        title: "Relacionamento em Risco",
        description: "Seu relacionamento precisa de atenção profissional.",
        recommendation: "Considere terapia de casal urgentemente.",
        cta: "Agende uma sessão de terapia de casal",
      },
      moderate: {
        score: [9, 14],
        title: "Relacionamento com Desafios",
        description: "Há oportunidades de melhoria.",
        recommendation: "Terapia de casal pode fortalecer seu relacionamento.",
        cta: "Fortaleça seu relacionamento com ajuda profissional",
      },
      high: {
        score: [15, 20],
        title: "Relacionamento Saudável",
        description: "Parabéns! Seu relacionamento está em bom estado.",
        recommendation: "Mantenha as práticas que funcionam.",
        cta: "Aprofunde ainda mais sua conexão",
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ─── CÁLCULO DE RESULTADO ───
// ═══════════════════════════════════════════════════════════════

export function calculateQuizResult(quizId: keyof typeof quizzes, answers: Record<number, number>) {
  const quiz = quizzes[quizId];
  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);

  let resultCategory: keyof typeof quiz.results = "low";

  for (const [category, result] of Object.entries(quiz.results)) {
    if (totalScore >= result.score[0] && totalScore <= result.score[1]) {
      resultCategory = category as keyof typeof quiz.results;
      break;
    }
  }

  const result = quiz.results[resultCategory];

  return {
    quizTitle: quiz.title,
    score: totalScore,
    maxScore: quiz.questions.length * 4,
    percentage: Math.round((totalScore / (quiz.questions.length * 4)) * 100),
    result,
    shareUrl: generateShareUrl(quizId, totalScore),
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── GERAÇÃO DE URL DE COMPARTILHAMENTO ───
// ═══════════════════════════════════════════════════════════════

function generateShareUrl(quizId: string, score: number): string {
  const baseUrl = "https://clinassist-dqdp2gmy.manus.space/quiz";
  const params = new URLSearchParams({
    quiz: quizId,
    score: score.toString(),
    ref: "social_share",
  });

  return `${baseUrl}?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════════
// ─── GAMIFICAÇÃO E BADGES ───
// ═══════════════════════════════════════════════════════════════

export function generateBadges(quizStats: { quizzesCompleted: number; averageScore: number }) {
  const badges = [];

  if (quizStats.quizzesCompleted >= 1) {
    badges.push({ name: "Primeiro Passo", icon: "🎯", description: "Completou o primeiro quiz" });
  }

  if (quizStats.quizzesCompleted >= 5) {
    badges.push({ name: "Explorador", icon: "🔍", description: "Completou 5 quizzes" });
  }

  if (quizStats.averageScore >= 80) {
    badges.push({ name: "Autoconhecimento", icon: "🧠", description: "Pontuação média acima de 80%" });
  }

  if (quizStats.quizzesCompleted >= 10) {
    badges.push({ name: "Mestre do Autoconhecimento", icon: "👑", description: "Completou todos os quizzes" });
  }

  return badges;
}

// ═══════════════════════════════════════════════════════════════
// ─── RASTREAMENTO DE LEADS ───
// ═══════════════════════════════════════════════════════════════

export async function trackQuizLead(quizId: string, result: any, userEmail?: string, userPhone?: string) {
  return {
    quizId,
    result,
    userEmail,
    userPhone,
    timestamp: new Date(),
    source: "quiz_viral",
    conversionPotential: calculateConversionPotential(result),
  };
}

function calculateConversionPotential(result: any): "high" | "medium" | "low" {
  // Usuários com scores altos têm maior potencial de conversão
  if (result.percentage >= 75) return "high";
  if (result.percentage >= 50) return "medium";
  return "low";
}

// ═══════════════════════════════════════════════════════════════
// ─── PROJEÇÃO DE CRESCIMENTO ───
// ═══════════════════════════════════════════════════════════════

export function getQuizViralProjection() {
  return {
    feature: "Quiz Viral",
    monthlyProjection: "1000-2000 leads/mês",
    conversionRate: "15-25%",
    strategy: [
      "3 quizzes principais (Ansiedade, Inteligência Emocional, Relacionamento)",
      "Compartilhamento viral em redes sociais",
      "Gamificação com badges e leaderboard",
      "Email automático com resultado + CTA para agendamento",
      "Integração com WhatsApp para follow-up",
    ],
    expectedOutcomes: {
      monthlyLeads: 1500,
      conversionRate: 0.2,
      monthlyConsultations: 300,
      estimatedRevenue: "R$ 30.000/mês",
    },
  };
}
