const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
app.use(express.json({ limit: '10mb' }));

// Importar configuração do banco
const { connectDB } = require('./config/database');

// Importar middlewares
const { errorHandler } = require('./middlewares/errorHandler');
const { logger } = require('./middlewares/logger');

// Importar rotas da API
const newsRoutes = require('./routes/newsRoutes');
const forumRoutes = require('./routes/forumRoutes');

const app = express();
const PORT = process.env.PORT || 3010;

// Conectar ao banco de dados
connectDB();

// Middlewares de segurança - CSP mais permissivo para desenvolvimento
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
        },
    },
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos ANTES dos middlewares personalizados
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: 0,
    etag: false
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de log personalizado
app.use(logger);

// Rotas para servir páginas HTML estáticas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/news/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/news.html'));
});

app.post('/api/news', async (req, res) => {
  const { title, summary, content, category, imageUrl, createdAt } = req.body;

  if (!title || !summary || !content) {
    return res.status(400).json({ success: false, message: 'Título, resumo e conteúdo são obrigatórios.' });
  }

  try {
    const newNews = await prisma.news.create({
      data: {
        title,
        summary,
        content,
        category: category || 'Geral',
        imageUrl: imageUrl || '/img/default-news.jpg',
        author: 'Admin',
        createdAt: createdAt ? new Date(createdAt) : new Date()
      }
    });

    res.status(201).json({ success: true, data: newNews });

  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar notícia.' });
  }
});



app.get('/forum', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/forum.html'));
});

app.get('/forum/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/forum-topic.html'));
});

app.get('/admin/carousel', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin-carousel.html'));
});

app.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sobre.html'));
});

app.get('/contato', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/contato.html'));
});

app.get('/create-news', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/create-news.html'));
});

// Rotas da API com rate limiting
app.use('/api/news', newsRoutes);
app.use('/api/forum', forumRoutes);

// Rota para health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Rota 404 para páginas
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ 
            success: false,
            error: 'Rota da API não encontrada',
            message: 'A rota solicitada não existe'
        });
    } else {
        res.sendFile(path.join(__dirname, '../public/404.html'));
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor RUSH rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🎮 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
