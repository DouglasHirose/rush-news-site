const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { validateNews, validateComment } = require("../middlewares/validation");
const { z } = require("zod");
const { prisma } = require("../config/database");

// ===== ENDPOINTS ESPECÍFICOS PARA CARROSSEL (ANTES DAS ROTAS GENÉRICAS) =====

// Obter notícias do carrossel (em destaque)
router.get("/carousel", async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const carouselNews = await prisma.news.findMany({
            where: {
                published: true,
                featured: true
            },
            orderBy: [
                { createdAt: "desc" }
            ],
            take: parseInt(limit),
            include: {
                _count: {
                    select: { comments: true }
                }
            }
        });

        res.json({
            success: true,
            data: carouselNews,
            count: carouselNews.length
        });
    } catch (error) {
        console.error("Erro ao buscar notícias do carrossel:", error);
        res.status(500).json({
            success: false,
            error: "Erro interno do servidor",
            message: "Não foi possível carregar as notícias do carrossel"
        });
    }
});

// Estatísticas do carrossel
router.get("/carousel/stats", async (req, res) => {
    try {
        const [carouselCount, totalNews, totalViews, featuredPercentage] = await Promise.all([
            prisma.news.count({ where: { featured: true, published: true } }),
            prisma.news.count({ where: { published: true } }),
            prisma.news.aggregate({
                where: { published: true },
                _sum: { views: true }
            }),
            prisma.news.count({ where: { published: true } }).then(total => 
                prisma.news.count({ where: { featured: true, published: true } }).then(featured => 
                    total > 0 ? Math.round((featured / total) * 100) : 0
                )
            )
        ]);

        res.json({
            success: true,
            data: {
                carouselCount,
                totalNews,
                totalViews: totalViews._sum.views || 0,
                featuredPercentage
            }
        });
    } catch (error) {
        console.error("Erro ao buscar estatísticas do carrossel:", error);
        res.status(500).json({
            success: false,
            error: "Erro interno do servidor",
            message: "Não foi possível carregar as estatísticas"
        });
    }
});

// Limpar carrossel (remover todas as notícias em destaque)
router.delete("/carousel/clear", async (req, res) => {
    try {
        const result = await prisma.news.updateMany({
            where: { featured: true },
            data: { featured: false, updatedAt: new Date() }
        });

        res.json({
            success: true,
            message: `${result.count} notícias removidas do carrossel`,
            data: { removedCount: result.count }
        });
    } catch (error) {
        console.error("Erro ao limpar carrossel:", error);
        res.status(500).json({
            success: false,
            error: "Erro interno do servidor",
            message: "Não foi possível limpar o carrossel"
        });
    }
});

// Marcar/desmarcar notícia como destaque (para carrossel)
router.patch("/:id/featured", async (req, res) => {
    try {
        const { id } = req.params;
        const { featured } = req.body;

        // Validar dados
        const schema = z.object({
            featured: z.boolean()
        });

        const validatedData = schema.parse({ featured });

        const updatedNews = await prisma.news.update({
            where: { id: parseInt(id) },
            data: {
                featured: validatedData.featured,
                updatedAt: new Date()
            },
            include: {
                _count: {
                    select: { comments: true }
                }
            }
        });

        res.json({
            success: true,
            message: `Notícia ${validatedData.featured ? "adicionada ao" : "removida do"} carrossel`,
            data: updatedNews
        });
    } catch (error) {
        console.error("Erro ao atualizar destaque da notícia:", error);
        res.status(500).json({
            success: false,
            error: "Erro interno do servidor",
            message: "Não foi possível atualizar o destaque da notícia"
        });
    }
});

// Incrementar visualizações
router.post("/:id/view", async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.news.update({
            where: { id: parseInt(id) },
            data: {
                views: { increment: 1 },
                updatedAt: new Date()
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao incrementar visualizações:", error);
        res.status(400).json({
            success: false,
            error: "Erro ao incrementar visualizações"
        });
    }
});

// Rotas públicas (GET) - ordem específica para evitar conflitos
router.get("/search", newsController.searchNews);
router.get("/", newsController.getAllNews);

// Rotas para comentários
router.post("/:id/comments", validateComment, newsController.addComment);
router.delete("/:id/comments/:commentId", newsController.deleteComment);

// Rotas administrativas (POST, PUT, DELETE)
router.post("/", validateNews, newsController.createNews);
router.put("/:id", validateNews, newsController.updateNews);
router.delete("/:id", newsController.deleteNews);

// Rota para buscar notícia por ID (deve vir por último para evitar conflitos)
router.get("/:id", newsController.getNewsById);

module.exports = router;


