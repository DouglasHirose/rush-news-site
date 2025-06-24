const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Função para formatar data
function formatDate(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

// Função para escrever log
function writeLog(level, message, req = null) {
  const timestamp = formatDate(new Date());
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  
  let logEntry = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    logEntry += ` [${req.method}] [${req.originalUrl}] [IP: ${ip}] [UA: ${userAgent}]`;
  }
  
  logEntry += ` ${message}\n`;
  
  // Escrever no arquivo de log
  fs.appendFileSync(logFile, logEntry);
  
  // Também exibir no console em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(logEntry.trim());
  }
}

// Middleware de logging
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log da requisição
  writeLog('info', `Requisição iniciada`, req);
  
  // Interceptar o final da resposta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const size = Buffer.byteLength(data, 'utf8');
    
    writeLog('info', 
      `Resposta enviada - Status: ${res.statusCode} - Duração: ${duration}ms - Tamanho: ${size} bytes`,
      req
    );
    
    originalSend.call(this, data);
  };
  
  next();
};

// Funções de log para diferentes níveis
const log = {
  info: (message, req = null) => writeLog('info', message, req),
  warn: (message, req = null) => writeLog('warn', message, req),
  error: (message, req = null) => writeLog('error', message, req),
  debug: (message, req = null) => writeLog('debug', message, req)
};

module.exports = {
  logger,
  log
};

