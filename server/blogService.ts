/**
 * Serviço de Blog com Conteúdo Educativo
 * Gerencia posts sobre psicologia clínica, TCC, TE, Gestalt
 */

export type BlogCategory = "tcc" | "te" | "gestalt" | "geral" | "bem-estar";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  category: BlogCategory;
  tags: string[];
  author: string;
  authorRole: string;
  featuredImage?: string;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

export interface BlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  featuredImage?: string;
  views: number;
  likes: number;
  createdAt: Date;
  readingTime: number;
}

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  postsByCategory: { [key in BlogCategory]: number };
  mostViewedPost: BlogPost | null;
  mostLikedPost: BlogPost | null;
  averageReadingTime: number;
}

/**
 * Posts de exemplo sobre psicologia
 */
export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "Introdução à Terapia Cognitivo-Comportamental (TCC)",
    slug: "introducao-tcc",
    excerpt:
      "Conheça os fundamentos da TCC e como ela pode ajudar a transformar seus pensamentos e comportamentos.",
    content: `# Introdução à Terapia Cognitivo-Comportamental (TCC)

A Terapia Cognitivo-Comportamental (TCC) é uma abordagem psicoterapêutica baseada na ideia de que nossos pensamentos, sentimentos e comportamentos estão interconectados.

## Como funciona a TCC?

A TCC trabalha com a premissa de que:
- Nossos pensamentos influenciam nossas emoções
- Nossas emoções influenciam nossos comportamentos
- Nossos comportamentos reforçam nossos pensamentos

## Benefícios da TCC

- Tratamento eficaz para ansiedade e depressão
- Melhora na qualidade de vida
- Desenvolvimento de habilidades de enfrentamento
- Redução de pensamentos negativos automáticos

## Como começar?

Se você está interessado em TCC, entre em contato conosco para agendar uma consulta.`,
    category: "tcc",
    tags: ["tcc", "psicologia", "saúde mental"],
    author: "Psi. Daniela Coelho",
    authorRole: "Psicóloga Clínica",
    views: 150,
    likes: 25,
    createdAt: new Date("2026-03-15"),
    updatedAt: new Date("2026-03-15"),
    published: true,
  },
  {
    id: "post-2",
    title: "Entendendo Esquemas: A Terapia do Esquema",
    slug: "entendendo-esquemas-te",
    excerpt:
      "Aprenda sobre os esquemas iniciais desadaptativos e como a Terapia do Esquema pode ajudar a transformá-los.",
    content: `# Entendendo Esquemas: A Terapia do Esquema

A Terapia do Esquema (TE) é uma abordagem integradora que combina elementos da TCC, psicodrama e teoria do apego.

## O que são esquemas?

Esquemas são padrões de pensamento, sentimento e comportamento que se desenvolvem desde a infância e tendem a se repetir ao longo da vida.

## Os 18 Esquemas Iniciais Desadaptativos

A TE identifica 18 esquemas principais que podem estar na raiz de nossos sofrimentos psicológicos.

## Como a TE funciona?

- Identifica os esquemas ativos
- Compreende suas origens
- Trabalha para modificar padrões disfuncionais
- Desenvolve modos mais saudáveis de funcionamento

## Benefícios da TE

- Transformação profunda e duradoura
- Compreensão das raízes dos problemas
- Desenvolvimento de relacionamentos mais saudáveis
- Maior autoconhecimento`,
    category: "te",
    tags: ["terapia do esquema", "esquemas", "psicologia"],
    author: "Psi. Daniela Coelho",
    authorRole: "Psicóloga Clínica",
    views: 120,
    likes: 18,
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date("2026-03-10"),
    published: true,
  },
  {
    id: "post-3",
    title: "Gestalt-Terapia: O Aqui e Agora",
    slug: "gestalt-aqui-agora",
    excerpt:
      "Descubra como a Gestalt-Terapia trabalha com a consciência do presente e a responsabilidade pessoal.",
    content: `# Gestalt-Terapia: O Aqui e Agora

A Gestalt-Terapia é uma abordagem humanista que enfatiza a experiência presente e a responsabilidade pessoal.

## Princípios Fundamentais

- **Aqui e Agora**: Foco na experiência presente
- **Responsabilidade**: Cada pessoa é responsável por suas escolhas
- **Awareness**: Consciência do que está acontecendo agora
- **Contato**: Qualidade de relação com o ambiente

## Técnicas Gestálticas

- Cadeira vazia
- Diálogo entre polaridades
- Experimentos criativos
- Trabalho com sonhos

## Benefícios da Gestalt

- Maior autoconhecimento
- Melhora na qualidade de vida
- Desenvolvimento de responsabilidade pessoal
- Maior presença e consciência`,
    category: "gestalt",
    tags: ["gestalt", "aqui e agora", "consciência"],
    author: "Psi. Daniela Coelho",
    authorRole: "Psicóloga Clínica",
    views: 95,
    likes: 14,
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date("2026-03-05"),
    published: true,
  },
  {
    id: "post-4",
    title: "Ansiedade: Causas e Estratégias de Manejo",
    slug: "ansiedade-causas-estrategias",
    excerpt:
      "Entenda as causas da ansiedade e aprenda estratégias práticas para gerenciá-la no dia a dia.",
    content: `# Ansiedade: Causas e Estratégias de Manejo

A ansiedade é uma resposta natural do corpo, mas quando excessiva pode afetar significativamente a qualidade de vida.

## Causas Comuns de Ansiedade

- Estresse crônico
- Traumas não resolvidos
- Padrões de pensamento negativo
- Falta de sono
- Cafeína em excesso

## Estratégias de Manejo

### Técnicas de Respiração
- Respiração diafragmática
- Técnica 4-7-8

### Mindfulness
- Meditação
- Observação sem julgamento

### Atividade Física
- Exercício regular
- Yoga

### Higiene do Sono
- Rotina consistente
- Ambiente adequado

## Quando Buscar Ajuda Profissional

Se a ansiedade está interferindo em suas atividades diárias, é importante procurar um profissional de saúde mental.`,
    category: "bem-estar",
    tags: ["ansiedade", "saúde mental", "bem-estar"],
    author: "Psi. Daniela Coelho",
    authorRole: "Psicóloga Clínica",
    views: 200,
    likes: 35,
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-01"),
    published: true,
  },
];

/**
 * Calcula tempo de leitura em minutos
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Gera slug a partir do título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Valida dados de post
 */
export function validateBlogPost(post: Partial<BlogPost>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!post.title || post.title.trim().length < 5) {
    errors.push("Título deve ter pelo menos 5 caracteres");
  }

  if (!post.excerpt || post.excerpt.trim().length < 20) {
    errors.push("Resumo deve ter pelo menos 20 caracteres");
  }

  if (!post.content || post.content.trim().length < 100) {
    errors.push("Conteúdo deve ter pelo menos 100 caracteres");
  }

  if (!post.category || !["tcc", "te", "gestalt", "geral", "bem-estar"].includes(post.category)) {
    errors.push("Categoria inválida");
  }

  if (!post.author || post.author.trim().length < 3) {
    errors.push("Autor é obrigatório");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calcula estatísticas do blog
 */
export function calculateBlogStats(posts: BlogPost[]): BlogStats {
  const publishedPosts = posts.filter((p) => p.published);

  const postsByCategory: { [key in BlogCategory]: number } = {
    tcc: 0,
    te: 0,
    gestalt: 0,
    geral: 0,
    "bem-estar": 0,
  };

  publishedPosts.forEach((post) => {
    postsByCategory[post.category]++;
  });

  const totalViews = publishedPosts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = publishedPosts.reduce((sum, post) => sum + post.likes, 0);

  const mostViewedPost = publishedPosts.reduce((prev, current) =>
    prev.views > current.views ? prev : current
  );

  const mostLikedPost = publishedPosts.reduce((prev, current) =>
    prev.likes > current.likes ? prev : current
  );

  const totalReadingTime = publishedPosts.reduce(
    (sum, post) => sum + calculateReadingTime(post.content),
    0
  );
  const averageReadingTime =
    publishedPosts.length > 0 ? Math.round(totalReadingTime / publishedPosts.length) : 0;

  return {
    totalPosts: publishedPosts.length,
    totalViews,
    totalLikes,
    postsByCategory,
    mostViewedPost: mostViewedPost || null,
    mostLikedPost: mostLikedPost || null,
    averageReadingTime,
  };
}

/**
 * Filtra posts por categoria
 */
export function filterPostsByCategory(posts: BlogPost[], category: BlogCategory): BlogPost[] {
  return posts.filter((p) => p.category === category && p.published);
}

/**
 * Busca posts por tag
 */
export function searchPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter((p) => p.tags.includes(tag.toLowerCase()) && p.published);
}

/**
 * Busca posts por texto
 */
export function searchPostsByText(posts: BlogPost[], query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return posts.filter(
    (p) =>
      (p.title.toLowerCase().includes(lowerQuery) ||
        p.excerpt.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)) &&
      p.published
  );
}

/**
 * Gera lista de tags únicas
 */
export function extractUniqueTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Ordena posts por data (mais recentes primeiro)
 */
export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Ordena posts por visualizações
 */
export function sortPostsByViews(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.views - a.views);
}

/**
 * Ordena posts por likes
 */
export function sortPostsByLikes(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.likes - a.likes);
}
