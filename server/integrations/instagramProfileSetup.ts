/**
 * Sistema de Configuração do Perfil Instagram
 * Sem expor Daniela Coelho até ter CRP
 */

export interface InstagramProfileConfig {
  username: string;
  displayName: string;
  bio: string;
  website: string;
  profilePictureUrl: string;
  category: string;
  contactEmail: string;
  whatsappNumber: string;
  isVerified: boolean;
  businessCategory: string;
}

export interface ProfileBioOptions {
  style: "professional" | "casual" | "creative";
  includeEmojis: boolean;
  includeHashtags: boolean;
  includeLink: boolean;
}

/**
 * Cria configuração de perfil Instagram SEM expor Daniela
 */
export function createInstagramProfileConfig(): InstagramProfileConfig {
  return {
    username: "psi.educacao.br", // Genérico, sem nome de pessoa
    displayName: "Psicoeducação Brasil", // Sem nome de Daniela
    bio: generateBio("professional", true, false, true),
    website: "https://psi-educacao.com/agendamento", // Link genérico
    profilePictureUrl: "https://cdn.example.com/psi-logo.png", // Logo, não foto de pessoa
    category: "Health & Wellness",
    contactEmail: "contato@psieducacao.com.br", // Email genérico
    whatsappNumber: "+55 11 98765-4321", // WhatsApp genérico
    isVerified: false,
    businessCategory: "Mental Health Professional",
  };
}

/**
 * Gera bio otimizada para Instagram
 */
export function generateBio(
  style: "professional" | "casual" | "creative",
  includeEmojis: boolean,
  includeHashtags: boolean,
  includeLink: boolean
): string {
  const bios: Record<string, string> = {
    professional: `Psicoeducação e Bem-estar Mental${includeEmojis ? " 🧠" : ""}
Técnicas Comprovadas | TCC | Mindfulness
Sem CRP (em processo)${includeEmojis ? " ⏳" : ""}
${includeLink ? "\nAgendamento: link na bio" : ""}
${includeHashtags ? "\n#psicologia #saúdemental #bem-estar" : ""}`,

    casual: `Bem-vindo ao canal de psicoeducação${includeEmojis ? " 👋" : ""}
Aqui você aprende técnicas para melhorar sua saúde mental
Dicas práticas todos os dias${includeEmojis ? " ✨" : ""}
${includeLink ? "\nAgende uma consulta: link na bio" : ""}
${includeHashtags ? "\n#psicologia #técnicas #transformação" : ""}`,

    creative: `Sua jornada para melhor saúde mental começa aqui${includeEmojis ? " 🌱" : ""}
Técnicas, dicas e inspiração diária
Transforme sua vida com psicoeducação${includeEmojis ? " 💪" : ""}
${includeLink ? "\nVamos começar? Link na bio" : ""}
${includeHashtags ? "\n#psicoeducação #bem-estar #transformação" : ""}`,
  };

  return bios[style] || bios.professional;
}

/**
 * Cria diferentes versões de bio
 */
export function generateBioVariations(): Record<string, string> {
  return {
    professional: generateBio("professional", true, false, true),
    casual: generateBio("casual", true, false, true),
    creative: generateBio("creative", true, false, true),
    minimal: `Psicoeducação 🧠\nSem CRP (em breve)\nAgendamento: link na bio`,
    detailed: `Bem-vindo ao espaço de psicoeducação!
Aqui você encontra técnicas comprovadas de psicologia para melhorar sua saúde mental.

Conteúdo sobre:
🧠 Ansiedade e Técnicas de TCC
💚 Relacionamentos Saudáveis
🌱 Autoestima e Desenvolvimento Pessoal
🧘 Mindfulness e Bem-estar
🚀 Inovações em Psicologia

Nota: Conteúdo educativo. Sem CRP (em processo).
Agendamento: link na bio`,
  };
}

/**
 * Cria link para bio otimizado
 */
export function createBioLink(
  type: "whatsapp" | "website" | "linktree" | "calendly"
): string {
  const links: Record<string, string> = {
    whatsapp:
      "https://wa.me/5511987654321?text=Olá%20gostaria%20de%20agendar%20uma%20consulta",
    website: "https://psi-educacao.com/agendamento",
    linktree: "https://linktr.ee/psieducacao",
    calendly: "https://calendly.com/psieducacao/consulta",
  };

  return links[type] || links.whatsapp;
}

/**
 * Cria foto de perfil (descrição para design)
 */
export function getProfilePictureDesignBrief(): string {
  return `
# Design da Foto de Perfil Instagram

## Requisitos
- ✅ Logo ou ícone de psicologia (NÃO foto de pessoa)
- ✅ Cores: Azul, verde ou roxo (cores associadas à saúde mental)
- ✅ Estilo: Minimalista e profissional
- ✅ Tamanho: 1080x1080px (Instagram padrão)
- ✅ Fundo: Transparente ou cor sólida

## Opções de Design

### Opção 1: Logo Abstrato
- Cérebro estilizado em azul/roxo
- Fundo branco ou transparente
- Simples e reconhecível

### Opção 2: Ícone de Bem-estar
- Coração + cérebro entrelaçados
- Cores: Verde (bem-estar) + Azul (mente)
- Moderno e atraente

### Opção 3: Símbolo de Psicologia
- Psi grego (Ψ) estilizado
- Cores gradiente (azul para roxo)
- Profissional e acadêmico

### Opção 4: Meditação/Mindfulness
- Pessoa em posição de meditação (silhueta, não rosto)
- Cores: Verde e branco
- Transmite calma e bem-estar

## Cores Recomendadas
- Primária: #2E86AB (Azul Profissional)
- Secundária: #06A77D (Verde Bem-estar)
- Terciária: #9B59B6 (Roxo Transformação)
- Fundo: #FFFFFF (Branco) ou Transparente

## Tipografia (se necessário)
- Fonte: Montserrat ou Poppins
- Peso: Bold
- Tamanho: Legível em 200x200px (tamanho mínimo no Instagram)
`;
}

/**
 * Cria conteúdo de apresentação do canal
 */
export function createChannelIntroductionPost(): {
  title: string;
  content: string;
  caption: string;
  hashtags: string[];
} {
  return {
    title: "Bem-vindo ao Canal de Psicoeducação",
    content: `
Olá! 👋

Bem-vindo ao nosso espaço dedicado à psicoeducação e bem-estar mental.

Aqui você encontrará:
🧠 Técnicas comprovadas de psicologia
💡 Dicas práticas para saúde mental
🌱 Conteúdo sobre desenvolvimento pessoal
🧘 Práticas de mindfulness e relaxamento
🚀 Inovações em psicologia e terapia

Nosso objetivo é democratizar o acesso à educação em saúde mental, 
oferecendo conteúdo de qualidade, acessível e transformador.

Nota importante: Este é um canal de psicoeducação. 
Para atendimento profissional, consulte um psicólogo credenciado.

Siga-nos e acompanhe novos conteúdos todos os dias!
    `,
    caption: `Bem-vindo ao nosso canal de psicoeducação! 🧠

Aqui você aprende técnicas comprovadas para melhorar sua saúde mental.

Conteúdo novo todos os dias!
Siga-nos e compartilhe com quem precisa.

#psicoeducação #saúdemental #bem-estar #técnicas #transformação`,
    hashtags: [
      "#psicoeducação",
      "#saúdemental",
      "#bem-estar",
      "#técnicas",
      "#transformação",
      "#psicologia",
      "#mindfulness",
      "#desenvolvimento",
    ],
  };
}

/**
 * Cria pinned post (post fixado)
 */
export function createPinnedPost(): {
  title: string;
  content: string;
  caption: string;
} {
  return {
    title: "📌 Informações Importantes",
    content: `
INFORMAÇÕES IMPORTANTES

1️⃣ SOBRE ESTE CANAL
Este é um espaço de psicoeducação e bem-estar mental.
Conteúdo educativo e informativo.

2️⃣ NÃO É ATENDIMENTO PROFISSIONAL
Os conteúdos aqui não substituem atendimento profissional.
Para diagnóstico ou tratamento, consulte um psicólogo credenciado.

3️⃣ COMO AGENDAR
Interessado em atendimento profissional?
Clique no link na bio para agendar sua consulta.

4️⃣ DÚVIDAS?
Envie uma mensagem no WhatsApp (link na bio).
Responderemos em até 24 horas.

Obrigado por estar aqui! 💚
    `,
    caption: `📌 LEIA ANTES DE SEGUIR

Este é um canal de psicoeducação.
Conteúdo educativo e informativo.

Para atendimento profissional:
👉 Link na bio

#psicoeducação #informações #importante`,
  };
}

/**
 * Cria story de boas-vindas
 */
export function createWelcomeStory(): Array<{
  type: "text" | "image" | "video";
  content: string;
  duration: number;
}> {
  return [
    {
      type: "text",
      content: "Bem-vindo! 👋\n\nVocê chegou no lugar certo para aprender sobre psicologia",
      duration: 5,
    },
    {
      type: "text",
      content: "Aqui você encontra:\n✅ Técnicas de TCC\n✅ Dicas de bem-estar\n✅ Mindfulness",
      duration: 5,
    },
    {
      type: "text",
      content: "Novo conteúdo todos os dias!\n\nSiga-nos e compartilhe 💚",
      duration: 5,
    },
    {
      type: "text",
      content: "Dúvidas?\nClique no link na bio para agendar uma consulta",
      duration: 5,
    },
  ];
}

/**
 * Cria highlights para stories
 */
export function createStoryHighlights(): Array<{
  name: string;
  description: string;
  icon: string;
}> {
  return [
    {
      name: "Bem-vindo",
      description: "Apresentação do canal e informações importantes",
      icon: "👋",
    },
    {
      name: "Técnicas",
      description: "Técnicas de TCC, Esquema e outras abordagens",
      icon: "🧠",
    },
    {
      name: "Bem-estar",
      description: "Dicas de mindfulness, relaxamento e autocuidado",
      icon: "🧘",
    },
    {
      name: "Relacionamentos",
      description: "Comunicação saudável e padrões de relacionamento",
      icon: "💚",
    },
    {
      name: "Autoestima",
      description: "Exercícios para aumentar confiança e autoestima",
      icon: "💪",
    },
    {
      name: "Inovação",
      description: "Tecnologia e inovações em psicologia",
      icon: "🚀",
    },
    {
      name: "FAQ",
      description: "Perguntas frequentes e respostas",
      icon: "❓",
    },
    {
      name: "Agendamento",
      description: "Como agendar uma consulta",
      icon: "📅",
    },
  ];
}

/**
 * Cria guia de conformidade CRP
 */
export function createCRPComplianceGuide(): string {
  return `
# 📋 GUIA DE CONFORMIDADE CRP

## O QUE PODE FAZER (SEM CRP)

✅ Conteúdo educativo sobre psicologia
✅ Dicas e técnicas terapêuticas
✅ Informações sobre saúde mental
✅ Divulgar especialidades (TCC, Esquema, etc)
✅ Chamar para consulta (sem pressão)
✅ Usar canal secreto para crescer

## O QUE NÃO PODE FAZER (SEM CRP)

❌ Fazer diagnósticos
❌ Oferecer tratamento
❌ Prometer cura
❌ Usar depoimentos de pacientes
❌ Fazer autopromoção agressiva
❌ Mencionar "Psicóloga Daniela Coelho"
❌ Mostrar foto/rosto de Daniela
❌ Oferecer atendimento online sem regulamentação

## QUANDO TIVER CRP

✅ Revelar que é psicóloga
✅ Usar nome "Daniela Coelho"
✅ Mostrar foto profissional
✅ Oferecer atendimentos
✅ Usar depoimentos (com consentimento)
✅ Reposicionar como especialista

## CHECKLIST DIÁRIO

- [ ] Conteúdo é educativo?
- [ ] Não menciona Daniela?
- [ ] Não faz promessas de cura?
- [ ] Não tem foto de pessoa?
- [ ] Tem disclaimer quando necessário?
- [ ] Está conforme CRP?

## CONTATO CRP

Para dúvidas sobre conformidade:
📞 CRP-SP: (11) 3214-0001
🌐 www.crpsp.org.br
`;
}

/**
 * Gera relatório de configuração do perfil
 */
export function generateProfileSetupReport(): string {
  const config = createInstagramProfileConfig();
  const bioVariations = generateBioVariations();

  let report = `# 📊 RELATÓRIO DE CONFIGURAÇÃO DO PERFIL INSTAGRAM\n\n`;

  report += `## 👤 DADOS DO PERFIL\n\n`;
  report += `| Campo | Valor |\n`;
  report += `|-------|-------|\n`;
  report += `| Username | ${config.username} |\n`;
  report += `| Nome Exibido | ${config.displayName} |\n`;
  report += `| Categoria | ${config.category} |\n`;
  report += `| Email | ${config.contactEmail} |\n`;
  report += `| WhatsApp | ${config.whatsappNumber} |\n\n`;

  report += `## 📝 OPÇÕES DE BIO\n\n`;

  for (const [style, bio] of Object.entries(bioVariations)) {
    report += `### ${style.toUpperCase()}\n`;
    report += `\`\`\`\n${bio}\n\`\`\`\n\n`;
  }

  report += `## 🔗 LINK NA BIO\n\n`;
  report += `Recomendado: ${createBioLink("whatsapp")}\n\n`;

  report += `## 🎨 FOTO DE PERFIL\n\n`;
  report += `${getProfilePictureDesignBrief()}\n\n`;

  report += `## 📌 PRIMEIRO POST (FIXADO)\n\n`;
  const pinnedPost = createPinnedPost();
  report += `**Título:** ${pinnedPost.title}\n\n`;
  report += `**Conteúdo:**\n${pinnedPost.content}\n\n`;

  report += `## ✅ CHECKLIST DE CONFORMIDADE\n\n`;
  report += `- ✅ Sem nome "Daniela Coelho"\n`;
  report += `- ✅ Sem foto de Daniela\n`;
  report += `- ✅ Sem promessas de cura\n`;
  report += `- ✅ Conteúdo educativo\n`;
  report += `- ✅ Conforme CRP\n`;
  report += `- ✅ Pronto para crescimento viral\n`;

  return report;
}
