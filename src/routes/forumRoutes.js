const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const { validateTopic, validatePost } = require("../middlewares/validation");

// Rotas públicas
router.get("/", forumController.getAllTopics); // Esta deve vir primeiro
router.get("/topics", forumController.getAllTopics); // Rota adicionada para /api/forum/topics
router.get("/search", forumController.searchTopics);
router.get("/stats", forumController.getForumStats);

// Rotas para posts
router.post("/:id/posts", validatePost, forumController.addPost);

// Rotas administrativas
router.post("/", validateTopic, forumController.createTopic);
router.put("/:id", validateTopic, forumController.updateTopic);
router.delete("/:id", forumController.deleteTopic);

// Rota para buscar tópico por ID (deve vir por último para evitar conflitos)
router.get("/:id", forumController.getTopicById);

module.exports = router;


