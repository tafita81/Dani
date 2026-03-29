/**
 * Sistema de Preenchimento do Instagram com Conteúdo Otimizado
 * Preenche o Instagram já conectado com conteúdo de psicologia SEM foto de Daniela
 */

export interface InstagramContentPlan {
  week: number;
  posts: Array<{
    day: string;
    time: string;
    category: string;
    format: "carousel" | "reel" | "post" | "story";
    title: string;
    description: string;
  }>;
}

/**
 * Cria plano de conteúdo para 12 semanas (3 meses)
 */
export function createThreeMonthContentPlan(): InstagramContentPlan[] {
  const plan: InstagramContentPlan[] = [];

  // Categorias de conteúdo
  const categories = [
    "anxiety",
    "relationships",
    "selfesteem",
    "mindfulness",
    "innovation",
    "techniques",
  ];

  // Formatos
  const formats: Array<"carousel" | "reel" | "post" | "story"> = [
    "carousel",
    "reel",
    "post",
    "story",
  ];

  // Horários ótimos
  const times = ["09:00", "13:00", "19:00", "21:00"];

  // Dias da semana
  const days = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];

  // Gerar plano para 12 semanas
  for (let week = 1; week <= 12; week++) {
    const weekPlan: InstagramContentPlan = {
      week,
      posts: [],
    };

    let categoryIndex = 0;
    let formatIndex = 0;
    let timeIndex = 0;

    // 2 posts por dia = 14 posts por semana
    for (let day = 0; day < 7; day++) {
      for (let post = 0; post < 2; post++) {
        const category = categories[categoryIndex % categories.length];
        const format = formats[formatIndex % formats.length];
        const time = times[timeIndex % times.length];

        const titles: Record<string, string> = {
          anxiety: `Semana ${week} - Ansiedade: Técnica ${post + 1}`,
          relationships: `Semana ${week} - Relacionamentos: Dica ${post + 1}`,
          selfesteem: `Semana ${week} - Autoestima: Exercício ${post + 1}`,
          mindfulness: `Semana ${week} - Mindfulness: Prática ${post + 1}`,
          innovation: `Semana ${week} - Inovação: Tecnologia ${post + 1}`,
          techniques: `Semana ${week} - Técnicas: TCC ${post + 1}`,
        };

        const descriptions: Record<string, string> = {
          anxiety:
            "Aprenda técnicas comprovadas de TCC para lidar com ansiedade",
          relationships:
            "Dicas práticas para relacionamentos mais saudáveis e comunicação efetiva",
          selfesteem:
            "Exercícios para aumentar sua autoestima e confiança pessoal",
          mindfulness:
            "Práticas de meditação e presença para bem-estar mental",
          innovation:
            "Conheça as inovações tecnológicas na psicologia e terapia",
          techniques:
            "Técnicas terapêuticas comprovadas e seus benefícios",
        };

        weekPlan.posts.push({
          day: days[day],
          time,
          category,
          format,
          title: titles[category],
          description: descriptions[category],
        });

        categoryIndex++;
        formatIndex++;
        timeIndex++;
      }
    }

    plan.push(weekPlan);
  }

  return plan;
}

/**
 * Gera conteúdo específico para cada post
 */
export function generatePostContent(
  category: string,
  format: string,
  weekNumber: number
): {
  title: string;
  mainContent: string;
  caption: string;
  hashtags: string[];
  cta: string;
} {
  const contentTemplates: Record<
    string,
    Record<string, (week: number) => { title: string; content: string }>
  > = {
    anxiety: {
      carousel: (week) => ({
        title: `5 Técnicas de TCC para Ansiedade - Semana ${week}`,
        content: `Slide 1: Respiração 4-7-8
Slide 2: Exposição Gradual
Slide 3: Reestruturação Cognitiva
Slide 4: Relaxamento Muscular
Slide 5: Mindfulness`,
      }),
      reel: (week) => ({
        title: `Você estava fazendo ERRADO com ansiedade`,
        content: `Hook: "Você estava fazendo errado com ansiedade"
Problema: Evitar situações
Solução: Exposição gradual
CTA: "Salva esse reel"`,
      }),
      post: (week) => ({
        title: `Sinais de Ansiedade que Você Ignora`,
        content: `Descubra os 7 sinais silenciosos de ansiedade que você pode estar ignorando. Conheça técnicas comprovadas para lidar com cada um deles.`,
      }),
      story: (week) => ({
        title: `Quiz: Qual é seu nível de ansiedade?`,
        content: `Responda 5 perguntas rápidas e descubra seu nível de ansiedade. Técnicas personalizadas nos próximos stories!`,
      }),
    },
    relationships: {
      carousel: (week) => ({
        title: `5 Padrões de Relacionamento Tóxico - Semana ${week}`,
        content: `Slide 1: Comunicação Agressiva
Slide 2: Falta de Limites
Slide 3: Ciúmes Excessivo
Slide 4: Controle
Slide 5: Falta de Empatia`,
      }),
      reel: (week) => ({
        title: `Seu relacionamento está CONDENADO se...`,
        content: `Hook: "Seu relacionamento está condenado se..."
Problema: Listar sinais de alerta
Solução: Comunicação efetiva
CTA: "Compartilha com seu parceiro"`,
      }),
      post: (week) => ({
        title: `Como Comunicar Sem Brigar`,
        content: `Aprenda a técnica de comunicação não-violenta para resolver conflitos sem prejudicar o relacionamento.`,
      }),
      story: (week) => ({
        title: `Enquete: Qual é seu maior desafio no relacionamento?`,
        content: `Ajude-nos a entender seus desafios. Suas respostas guiarão nosso próximo conteúdo!`,
      }),
    },
    selfesteem: {
      carousel: (week) => ({
        title: `5 Exercícios para Aumentar Autoestima - Semana ${week}`,
        content: `Slide 1: Espelho Positivo
Slide 2: Diário de Gratidão
Slide 3: Afirmações Diárias
Slide 4: Autossabotagem
Slide 5: Compaixão Própria`,
      }),
      reel: (week) => ({
        title: `Você está SABOTANDO sua autoestima`,
        content: `Hook: "Você está sabotando sua autoestima"
Problema: Padrões de autossabotagem
Solução: Exercícios práticos
CTA: "Salva e pratica hoje"`,
      }),
      post: (week) => ({
        title: `Por que você não acredita em si mesmo?`,
        content: `Descubra as raízes da baixa autoestima e como transformá-la em confiança genuína.`,
      }),
      story: (week) => ({
        title: `Desafio de 7 dias: Autossabotagem`,
        content: `Participe do desafio e descubra seus padrões de autossabotagem. Prêmio: Guia exclusivo!`,
      }),
    },
    mindfulness: {
      carousel: (week) => ({
        title: `5 Práticas de Mindfulness Diárias - Semana ${week}`,
        content: `Slide 1: Respiração Consciente
Slide 2: Meditação 5 Minutos
Slide 3: Caminhada Atenta
Slide 4: Alimentação Consciente
Slide 5: Presença Digital`,
      }),
      reel: (week) => ({
        title: `Meditação de 1 minuto para Estresse`,
        content: `Hook: "1 minuto para aliviar estresse"
Técnica: Respiração 4-7-8
Benefício: Calma instantânea
CTA: "Pratica agora"`,
      }),
      post: (week) => ({
        title: `Mindfulness: Mais que Meditação`,
        content: `Entenda como a presença atenta pode transformar seu dia a dia e reduzir ansiedade.`,
      }),
      story: (week) => ({
        title: `Meditação Guiada de 5 Minutos`,
        content: `Link para meditação exclusiva. Pratique agora e sinta a diferença!`,
      }),
    },
    innovation: {
      carousel: (week) => ({
        title: `5 Inovações em Psicologia - Semana ${week}`,
        content: `Slide 1: Avatar 3D em Terapia
Slide 2: IA em Diagnóstico
Slide 3: Realidade Virtual
Slide 4: Wearables de Saúde Mental
Slide 5: Apps Terapêuticos`,
      }),
      reel: (week) => ({
        title: `O Futuro da Psicologia é AQUI`,
        content: `Hook: "O futuro da psicologia chegou"
Inovação: Tecnologia + Terapia
Benefício: Terapia mais acessível
CTA: "Descobre mais"`,
      }),
      post: (week) => ({
        title: `Psicologia + Tecnologia: O Futuro`,
        content: `Conheça as inovações que estão transformando a forma como fazemos terapia.`,
      }),
      story: (week) => ({
        title: `Você usaria Avatar 3D em terapia?`,
        content: `Enquete: Qual inovação você mais gostaria de experimentar?`,
      }),
    },
    techniques: {
      carousel: (week) => ({
        title: `5 Técnicas Terapêuticas Comprovadas - Semana ${week}`,
        content: `Slide 1: TCC (Terapia Cognitivo-Comportamental)
Slide 2: Terapia do Esquema
Slide 3: Gestalt
Slide 4: Psicanálise
Slide 5: Terapia Integrativa`,
      }),
      reel: (week) => ({
        title: `Qual técnica é MELHOR para você?`,
        content: `Hook: "Qual técnica é melhor para você?"
Opções: TCC, Esquema, Gestalt
Benefício: Escolha certa
CTA: "Descobre qual é tua"`,
      }),
      post: (week) => ({
        title: `TCC: A Técnica Mais Comprovada`,
        content: `Entenda como a Terapia Cognitivo-Comportamental funciona e por que é tão efetiva.`,
      }),
      story: (week) => ({
        title: `Quiz: Qual técnica é para você?`,
        content: `Responda 5 perguntas e descubra qual técnica terapêutica é ideal para seus objetivos.`,
      }),
    },
  };

  const template =
    contentTemplates[category]?.[format]?.(weekNumber) ||
    contentTemplates["techniques"]["post"](weekNumber);

  return {
    title: template.title,
    mainContent: template.content,
    caption: `${template.title}\n\nSalva esse conteúdo! 📌\n\n#psicologia #saúdemental #técnicas #educação`,
    hashtags: [
      "psicologia",
      "saúdemental",
      "técnicas",
      "educação",
      category,
      "tcc",
      "bem-estar",
    ],
    cta: "Salva esse conteúdo e compartilha com quem precisa!",
  };
}

/**
 * Cria cronograma de publicação para 3 meses
 */
export function createPublicationSchedule() {
  const plan = createThreeMonthContentPlan();

  console.log("\n📅 CRONOGRAMA DE PUBLICAÇÃO - 3 MESES (12 SEMANAS)\n");
  console.log("=".repeat(80));

  let totalPosts = 0;

  for (const week of plan) {
    console.log(`\n📍 SEMANA ${week.week}`);
    console.log("-".repeat(80));

    const postsByDay: Record<string, number> = {};

    for (const post of week.posts) {
      if (!postsByDay[post.day]) {
        postsByDay[post.day] = 0;
      }
      postsByDay[post.day]++;
      totalPosts++;

      console.log(
        `  ${post.day} às ${post.time} - [${post.format.toUpperCase()}] ${post.title}`
      );
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 RESUMO:`);
  console.log(`  - Total de Posts: ${totalPosts}`);
  console.log(`  - Posts por Semana: ${totalPosts / 12}`);
  console.log(`  - Posts por Dia (média): ${(totalPosts / 12 / 7).toFixed(1)}`);
  console.log(`  - Período: 3 meses (12 semanas)`);
  console.log(`  - Plataforma: Instagram`);
  console.log(`  - Conteúdo: Psicologia SEM foto de Daniela`);
  console.log(`  - Status: Pronto para publicação automática\n`);

  return plan;
}

/**
 * Gera lista de hashtags otimizadas por categoria
 */
export function getOptimizedHashtags(category: string): string[] {
  const hashtagsByCategory: Record<string, string[]> = {
    anxiety: [
      "#ansiedade",
      "#tcc",
      "#saúdemental",
      "#técnicas",
      "#relaxamento",
      "#meditação",
      "#psicologia",
      "#bem-estar",
      "#tranquilidade",
      "#mindfulness",
    ],
    relationships: [
      "#relacionamentos",
      "#comunicação",
      "#relacionamentosaudável",
      "#casamento",
      "#amor",
      "#psicologia",
      "#relacionamento",
      "#dicas",
      "#relacionamentotóxico",
      "#empatia",
    ],
    selfesteem: [
      "#autoestima",
      "#autossabotagem",
      "#confiança",
      "#desenvolvimentopessoal",
      "#psicologia",
      "#bem-estar",
      "#autoaceitação",
      "#crescimento",
      "#transformação",
      "#empoderamento",
    ],
    mindfulness: [
      "#mindfulness",
      "#meditação",
      "#bem-estar",
      "#saúdemental",
      "#presença",
      "#relaxamento",
      "#psicologia",
      "#equilíbrio",
      "#paz",
      "#serenidade",
    ],
    innovation: [
      "#inovação",
      "#psicologia",
      "#tecnologia",
      "#futuro",
      "#ia",
      "#saúdemental",
      "#avatar3d",
      "#realidadevirtual",
      "#apps",
      "#transformação",
    ],
    techniques: [
      "#técnicas",
      "#tcc",
      "#esquema",
      "#gestalt",
      "#psicanálise",
      "#psicologia",
      "#terapia",
      "#saúdemental",
      "#educação",
      "#bem-estar",
    ],
  };

  return hashtagsByCategory[category] || hashtagsByCategory["techniques"];
}

/**
 * Calcula melhor horário para postar
 */
export function getBestPostingTime(
  day: string
): { morning: string; afternoon: string; evening: string; night: string } {
  // Horários ótimos por dia da semana
  const optimalTimes: Record<
    string,
    { morning: string; afternoon: string; evening: string; night: string }
  > = {
    Segunda: {
      morning: "09:00",
      afternoon: "13:00",
      evening: "19:00",
      night: "21:00",
    },
    Terça: {
      morning: "09:00",
      afternoon: "13:00",
      evening: "19:00",
      night: "21:00",
    },
    Quarta: {
      morning: "09:00",
      afternoon: "13:00",
      evening: "19:00",
      night: "21:00",
    },
    Quinta: {
      morning: "09:00",
      afternoon: "13:00",
      evening: "19:00",
      night: "21:00",
    },
    Sexta: {
      morning: "10:00",
      afternoon: "14:00",
      evening: "19:00",
      night: "22:00",
    },
    Sábado: {
      morning: "10:00",
      afternoon: "15:00",
      evening: "20:00",
      night: "22:00",
    },
    Domingo: {
      morning: "11:00",
      afternoon: "15:00",
      evening: "20:00",
      night: "21:00",
    },
  };

  return optimalTimes[day] || optimalTimes["Segunda"];
}

/**
 * Gera relatório de preenchimento do Instagram
 */
export function generateInstagramFillingReport(): string {
  const plan = createThreeMonthContentPlan();

  let report = `# 📊 Relatório de Preenchimento do Instagram\n\n`;

  report += `## 📅 Cronograma de Publicação\n\n`;
  report += `- **Período:** 3 meses (12 semanas)\n`;
  report += `- **Total de Posts:** ${plan.length * 14}\n`;
  report += `- **Posts por Semana:** 14\n`;
  report += `- **Posts por Dia:** 2\n\n`;

  report += `## 📂 Categorias de Conteúdo\n\n`;
  report += `1. **Ansiedade** - Técnicas de TCC e relaxamento\n`;
  report += `2. **Relacionamentos** - Comunicação e padrões saudáveis\n`;
  report += `3. **Autoestima** - Exercícios e autossabotagem\n`;
  report += `4. **Mindfulness** - Meditação e presença\n`;
  report += `5. **Inovação** - Tecnologia em psicologia\n`;
  report += `6. **Técnicas** - TCC, Esquema, Gestalt, etc\n\n`;

  report += `## 🎨 Formatos de Conteúdo\n\n`;
  report += `- **Carrosséis:** 5 slides informativos\n`;
  report += `- **Reels:** 15-30 segundos virais\n`;
  report += `- **Posts:** Educativos e detalhados\n`;
  report += `- **Stories:** Enquetes e interatividade\n\n`;

  report += `## ✅ Status\n\n`;
  report += `- ✅ Cronograma criado\n`;
  report += `- ✅ Conteúdo planejado\n`;
  report += `- ✅ Hashtags otimizadas\n`;
  report += `- ✅ Horários ótimos definidos\n`;
  report += `- ⏳ Aguardando publicação automática\n\n`;

  report += `## 🚀 Próximos Passos\n\n`;
  report += `1. Gerar conteúdo visual (infográficos, designs)\n`;
  report += `2. Criar vídeos para Reels\n`;
  report += `3. Publicar automaticamente conforme cronograma\n`;
  report += `4. Monitorar engajamento\n`;
  report += `5. Otimizar baseado em dados\n`;

  return report;
}
