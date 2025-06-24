const { prisma } = require('../config/database');

class NewsController {
  // Listar todas as notícias (com paginação)
  async getAllNews(req, res) {
    try {
      const { page = 1, limit = 10, category, featured } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (category) where.category = category;
      if (featured !== undefined) where.featured = featured === 'true';
      where.published = true;

      const [news, total] = await Promise.all([
        prisma.news.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { comments: true }
            }
          }
        }),
        prisma.news.count({ where })
      ]);

      res.json({
        success: true,
        data: news,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar notícia por ID
  async getNewsById(req, res) {
    try {
      const { id } = req.params;

      const news = await prisma.news.findUnique({
        where: { id: parseInt(id) },
        include: {
          comments: {
            where: { parentId: null },
            include: {
              replies: {
                orderBy: { createdAt: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!news) {
        return res.status(404).json({
          success: false,
          message: 'Notícia não encontrada'
        });
      }

      // Incrementar visualizações
      await prisma.news.update({
        where: { id: parseInt(id) },
        data: { views: { increment: 1 } }
      });

      res.json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error('Erro ao buscar notícia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Criar nova notícia
  async createNews(req, res) {
    try {
      const newsData = req.body;

      const news = await prisma.news.create({
        data: newsData
      });

      res.status(201).json({
        success: true,
        data: news,
        message: 'Notícia criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar notícia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar notícia
  async updateNews(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const news = await prisma.news.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.json({
        success: true,
        data: news,
        message: 'Notícia atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar notícia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar notícia
  async deleteNews(req, res) {
    try {
      const { id } = req.params;

      await prisma.news.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Notícia deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar notícia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar notícias por termo
  async searchNews(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Termo de busca é obrigatório'
        });
      }

      const where = {
        published: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } }
        ]
      };

      const [news, total] = await Promise.all([
        prisma.news.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { comments: true }
            }
          }
        }),
        prisma.news.count({ where })
      ]);

      res.json({
        success: true,
        data: news,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Adicionar comentário
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const commentData = req.body;

      const comment = await prisma.comment.create({
        data: {
          ...commentData,
          newsId: parseInt(id)
        }
      });

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comentário adicionado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Excluir comentário
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;

      await prisma.comment.delete({
        where: { id: parseInt(commentId) }
      });

      res.json({
        success: true,
        message: 'Comentário excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new NewsController();

