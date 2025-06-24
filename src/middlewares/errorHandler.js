const { log } = require('./logger');

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  // Log do erro
  log.error(`Erro capturado: ${err.message}`, req);
  log.error(`Stack trace: ${err.stack}`);
  
  // Erro de validação do Zod
  if (err.name === 'ZodError') {
    const errors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }
  
  // Erro do Prisma
  if (err.code && err.code.startsWith('P')) {
    let message = 'Erro no banco de dados';
    let statusCode = 500;
    
    switch (err.code) {
      case 'P2002':
        message = 'Dados duplicados. Este registro já existe.';
        statusCode = 409;
        break;
      case 'P2025':
        message = 'Registro não encontrado.';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Violação de chave estrangeira.';
        statusCode = 400;
        break;
      default:
        message = 'Erro interno do banco de dados.';
    }
    
    return res.status(statusCode).json({
      success: false,
      message,
      code: err.code
    });
  }
  
  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido na requisição'
    });
  }
  
  // Erro de arquivo não encontrado
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      message: 'Arquivo não encontrado'
    });
  }
  
  // Erro de permissão
  if (err.code === 'EACCES') {
    return res.status(403).json({
      success: false,
      message: 'Permissão negada'
    });
  }
  
  // Erro de timeout
  if (err.code === 'ETIMEDOUT') {
    return res.status(408).json({
      success: false,
      message: 'Timeout da requisição'
    });
  }
  
  // Erro genérico
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

// Middleware para capturar erros assíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};

