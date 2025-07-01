const { z, ZodError } = require('zod');

// 📰 Schema de Notícias
const newsSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  summary: z.string().min(1, 'Resumo é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional(),
  createdAt: z.string().optional(),
});

// 💬 Schema de Comentários
const commentSchema = z.object({
  content: z.string().min(5).max(1000),
  author: z.string().min(2).max(100),
  email: z.string().email('Email inválido').optional(),
  parentId: z.number().int().positive().optional(),
});

// 📌 Schema de Tópicos
const topicSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(1000).optional(),
  author: z.string().min(2).max(100),
  category: z.string().min(2).max(50).default('Geral'),
  pinned: z.boolean().default(false),
  locked: z.boolean().default(false),
});

// 📝 Schema de Posts
const postSchema = z.object({
  content: z.string().min(5).max(5000),
  author: z.string().min(2).max(100),
});

// 🔢 Schema de Paginação
const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Página deve ser maior que 0').default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).default('10'),
  category: z.string().optional(),
  featured: z.string().regex(/^(true|false)$/).optional(),
});

// 🔍 Schema de Busca
const searchSchema = z.object({
  q: z.string().min(2).max(100),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

// 🔒 Criação de middleware genérico para validação de body
const createValidationMiddleware = schema => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

// 🔍 Middleware para validar query params
const validateQueryParams = schema => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

// 🧩 Exportações
module.exports = {
  // Middlewares de validação
  validateNews: createValidationMiddleware(newsSchema),
  validateComment: createValidationMiddleware(commentSchema),
  validateTopic: createValidationMiddleware(topicSchema),
  validatePost: createValidationMiddleware(postSchema),
  validatePagination: validateQueryParams(paginationSchema),
  validateSearch: validateQueryParams(searchSchema),

  // Funções auxiliares
  createValidationMiddleware,
  validateQueryParams,

  // Schemas crus (úteis em testes ou uso direto)
  schemas: {
    newsSchema,
    commentSchema,
    topicSchema,
    postSchema,
    paginationSchema,
    searchSchema,
  },
};
