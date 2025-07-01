const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rota para reordenar os itens do carrossel
router.post('/reorder', async (req, res) => {
  const { newsIds } = req.body;

  if (!Array.isArray(newsIds) || newsIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Lista de IDs inválida' });
  }

  try {
    const updatePromises = newsIds.map((id, index) =>
      prisma.news.update({
        where: { id },
        data: { sortOrder: index }
      })
    );

    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar carrossel:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao reordenar.' });
  }
});

module.exports = router;
