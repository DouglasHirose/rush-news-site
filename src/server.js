require('dotenv').config(); // Carregar variáveis de ambiente o quanto antes

const express = require('express');
const app = express();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Configuração do banco
const { connectDB } = require('./config/database');

// Middlewares
const { errorHandler } = require('./middlewares/errorHandler');
const { logger } = require('./middlewares/logger');

// Rotas
const newsRoutes = require('./routes/newsRoutes');
const forumRoutes = require('./routes/forumRoutes');

const PORT = process.env.PORT || 3010;

// Conectar ao banco de dados
connectDB();

// Middlewares globais
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  helmet(
    process.env.NODE_ENV === 'development'
      ? {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              imgSrc: ["'self'", 'data:', 'https:', 'http:'],
              connectSrc: ["'self'"],
            },
          },
        }
      : undefined
  )
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(morgan('combined'));
app.use(logger);

// Arquivos estáticos
app.use(
  express.static(path.join(__dirname, '../public'), {
    maxAge: 0,
    etag: false,
  })
);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/news/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/news.html'));
});

app.get('/all-news', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/all-news.html'));
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

app.post('/news/carousel/reorder', async (req, res) => {
  const { newsIds } = req.body;

  if (!Array.isArray(newsIds) || newsIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Lista de IDs inválida' });
  }

  try {
    // Atualiza o campo de ordenação para cada item (por exemplo, sortOrder)
    const updatePromises = newsIds.map((id, index) => {
      return News.findByIdAndUpdate(id, { sortOrder: index }, { new: true });
    });

    await Promise.all(updatePromises);

    return res.json({ success: true, message: 'Ordem atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao reordenar carrossel:', err);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
});

module.exports = app;


app.get('/sobre', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/sobre.html'));
});

app.get('/contato', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/contato.html'));
});

app.get('/create-news', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/create-news.html'));
});

// Endpoint direto de criação de notícia (extra, além das rotas)
app.post('/api/news', async (req, res) => {
  const { title, summary, content, category, imageUrl, createdAt } = req.body;

  if (!title || !summary || !content) {
    return res.status(400).json({
      success: false,
      message: 'Título, resumo e conteúdo são obrigatórios.',
    });
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
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    res.status(201).json({ success: true, data: newNews });
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar notícia.' });
  }
});

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/forum', forumRoutes);
const carouselRoutes = require('./routes/carouselRouters');
app.use('/api/news/carousel', carouselRoutes);


// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Middleware de erro
app.use(errorHandler);

// Rota 404 customizada
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      error: 'Rota da API não encontrada',
      message: 'A rota solicitada não existe',
    });
  } else {
    res.sendFile(path.join(__dirname, '../public/404.html'));
  }
});

// Fechar conexão do Prisma ao encerrar
const gracefulShutdown = async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Inicialização do servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor RUSH rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`🎮 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
