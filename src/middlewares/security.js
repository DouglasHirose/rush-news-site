const rateLimit = require('express-rate-limit');
const { log } = require('./logger');

// Rate limiting para API geral
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.warn(`Rate limit excedido para IP: ${req.ip}`, req);
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente em alguns minutos.'
    });
  }
});

// Rate limiting mais restritivo para criação de conteúdo
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 criações por hora
  message: {
    success: false,
    message: 'Limite de criação excedido. Tente novamente mais tarde.'
  },
  skip: (req) => {
    // Pular rate limiting para métodos GET
    return req.method === 'GET';
  },
  handler: (req, res) => {
    log.warn(`Rate limit de criação excedido para IP: ${req.ip}`, req);
    res.status(429).json({
      success: false,
      message: 'Limite de criação excedido. Tente novamente mais tarde.'
    });
  }
});

// Middleware para sanitização de entrada
const sanitizeInput = (req, res, next) => {
  // Função para sanitizar strings
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remover scripts maliciosos
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  // Sanitizar recursivamente objetos
  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  };

  // Sanitizar body, query e params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Middleware para validação de Content-Type
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type deve ser application/json'
      });
    }
  }
  
  next();
};

// Middleware para log de segurança
const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /(<script|javascript:|on\w+\s*=)/i,
    /(union\s+select|drop\s+table|insert\s+into)/i,
    /(\.\.\/|\.\.\\)/,
    /(<iframe|<object|<embed)/i
  ];

  const checkSuspicious = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          log.warn(`Padrão suspeito detectado em ${path}: ${obj.substring(0, 100)}`, req);
          return true;
        }
      }
    } else if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (checkSuspicious(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Verificar body, query e params
  checkSuspicious(req.body, 'body');
  checkSuspicious(req.query, 'query');
  checkSuspicious(req.params, 'params');

  next();
};

module.exports = {
  apiLimiter,
  createLimiter,
  sanitizeInput,
  validateContentType,
  securityLogger
};

