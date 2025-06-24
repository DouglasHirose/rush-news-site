const { prisma } = require('../config/database');

class ForumController {
  // Listar todos os tópicos do fórum
  async getAllTopics(req, res) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (category) where.category = category;

      const [topics, total] = await Promise.all([
        prisma.forumTopic.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: [
            { pinned: 'desc' },
            { updatedAt: 'desc' }
          ],
          include: {
            _count: {
              select: { posts: true }
            },
            posts: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                author: true,
                createdAt: true
              }
            }
          }
        }),
        prisma.forumTopic.count({ where })
      ]);

      res.json({
        success: true,
        data: topics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar tópico por ID com posts
  async getTopicById(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const topic = await prisma.forumTopic.findUnique({
        where: { id: parseInt(id) },
        include: {
          posts: {
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { posts: true }
          }
        }
      });

      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Tópico não encontrado'
        });
      }

      // Incrementar visualizações
      await prisma.forumTopic.update({
        where: { id: parseInt(id) },
        data: { views: { increment: 1 } }
      });

      res.json({
        success: true,
        data: {
          ...topic,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: topic._count.posts,
            pages: Math.ceil(topic._count.posts / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar tópico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Criar novo tópico
  async createTopic(req, res) {
    try {
      const topicData = req.body;

      const topic = await prisma.forumTopic.create({
        data: topicData
      });

      res.status(201).json({
        success: true,
        data: topic,
        message: 'Tópico criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar tópico
  async updateTopic(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const topic = await prisma.forumTopic.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.json({
        success: true,
        data: topic,
        message: 'Tópico atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar tópico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar tópico
  async deleteTopic(req, res) {
    try {
      const { id } = req.params;

      await prisma.forumTopic.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Tópico deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar tópico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Adicionar post ao tópico
  async addPost(req, res) {
    try {
      const { id } = req.params;
      const postData = req.body;

      // Verificar se o tópico existe e não está bloqueado
      const topic = await prisma.forumTopic.findUnique({
        where: { id: parseInt(id) }
      });

      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Tópico não encontrado'
        });
      }

      if (topic.locked) {
        return res.status(403).json({
          success: false,
          message: 'Tópico está bloqueado para novos posts'
        });
      }

      const post = await prisma.forumPost.create({
        data: {
          ...postData,
          topicId: parseInt(id)
        }
      });

      // Atualizar data de modificação do tópico
      await prisma.forumTopic.update({
        where: { id: parseInt(id) },
        data: { updatedAt: new Date() }
      });

      res.status(201).json({
        success: true,
        data: post,
        message: 'Post adicionado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar post:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar tópicos por termo
  async searchTopics(req, res) {
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
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      };

      const [topics, total] = await Promise.all([
        prisma.forumTopic.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: {
              select: { posts: true }
            }
          }
        }),
        prisma.forumTopic.count({ where })
      ]);

      res.json({
        success: true,
        data: topics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter estatísticas do fórum
  async getForumStats(req, res) {
    try {
      const [totalTopics, totalPosts, recentTopics] = await Promise.all([
        prisma.forumTopic.count(),
        prisma.forumPost.count(),
        prisma.forumTopic.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            author: true,
            createdAt: true,
            _count: {
              select: { posts: true }
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalTopics,
          totalPosts,
          recentTopics
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new ForumController();

