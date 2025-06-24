const { z } = require('zod');

// Schema para validação de notícias
const newsSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(150, 'Título deve ter no máximo 150 caracteres'),
  content: z.string()
    .min(50, 'Conteúdo deve ter pelo menos 50 caracteres'),
  summary: z.string()
    .max(30, 'Resumo deve ter no máximo 30 caracteres')
    .optional(),
  imageUrl: z.string()
    .url('URL da imagem inválida')
    .optional(),
  author: z.string()
    .min(2, 'Nome do autor deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do autor deve ter no máximo 100 caracteres')
    .default('Admin'),
  category: z.string()
    .min(2, 'Categoria deve ter pelo menos 2 caracteres')
    .max(50, 'Categoria deve ter no máximo 50 caracteres')
    .default('Geral'),
  published: z.boolean().default(false),
  featured: z.boolean().default(false)
});

// Schema para validação de comentários
const commentSchema = z.object({
  content: z.string()
    .min(5, 'Comentário deve ter pelo menos 5 caracteres')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres'),
  author: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .optional(),
  parentId: z.number()
    .int('ID do comentário pai deve ser um número inteiro')
    .positive('ID do comentário pai deve ser positivo')
    .optional()
});

// Schema para validação de tópicos do fórum
const topicSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  author: z.string()
    .min(2, 'Nome do autor deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do autor deve ter no máximo 100 caracteres'),
  category: z.string()
    .min(2, 'Categoria deve ter pelo menos 2 caracteres')
    .max(50, 'Categoria deve ter no máximo 50 caracteres')
    .default('Geral'),
  pinned: z.boolean().default(false),
  locked: z.boolean().default(false)
});

// Schema para validação de posts do fórum
const postSchema = z.object({
  content: z.string()
    .min(5, 'Post deve ter pelo menos 5 caracteres')
    .max(5000, 'Post deve ter no máximo 5000 caracteres'),
  author: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
});

// Função para criar middleware de validação
const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.received
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors
        });
      }
      next(error);
    }
  };
};

// Middleware para validação de parâmetros de query
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors
        });
      }
      next(error);
    }
  };
};

// Schema para paginação
const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Página deve ser um número')
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Página deve ser maior que 0')
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(val => parseInt(val))
    .refine(val => val > 0 && val <= 100, 'Limite deve estar entre 1 e 100')
    .default('10'),
  category: z.string().optional(),
  featured: z.string()
    .regex(/^(true|false)$/, 'Featured deve ser true ou false')
    .optional()
});

// Schema para busca
const searchSchema = z.object({
  q: z.string()
    .min(2, 'Termo de busca deve ter pelo menos 2 caracteres')
    .max(100, 'Termo de busca deve ter no máximo 100 caracteres'),
  page: z.string()
    .regex(/^\d+$/, 'Página deve ser um número')
    .transform(val => parseInt(val))
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(val => parseInt(val))
    .default('10')
});

// Middlewares específicos
const validateNews = createValidationMiddleware(newsSchema);
const validateComment = createValidationMiddleware(commentSchema);
const validateTopic = createValidationMiddleware(topicSchema);
const validatePost = createValidationMiddleware(postSchema);
const validatePagination = validateQueryParams(paginationSchema);
const validateSearch = validateQueryParams(searchSchema);

module.exports = {
  validateNews,
  validateComment,
  validateTopic,
  validatePost,
  validatePagination,
  validateSearch,
  createValidationMiddleware,
  validateQueryParams,
  schemas: {
    newsSchema,
    commentSchema,
    topicSchema,
    postSchema,
    paginationSchema,
    searchSchema
  }
};

