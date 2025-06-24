# RUSH - Site de Notícias de Games

Um site completo de notícias sobre games e esports desenvolvido com Node.js, Express, Prisma e tecnologias web modernas.

## 🚀 Características

- **Arquitetura MVC**: Estrutura organizada com Models, Views e Controllers
- **API RESTful**: Endpoints completos para notícias e fórum
- **Banco de Dados**: SQLite com Prisma ORM
- **Validação**: Validação robusta com Zod
- **Middlewares**: Log, segurança e tratamento de erros
- **Frontend Responsivo**: HTML5, CSS3 e JavaScript vanilla
- **Sistema de Comentários**: Comentários aninhados nas notícias
- **Fórum**: Sistema de tópicos e posts para discussões
- **Busca**: Funcionalidade de busca em notícias
- **Filtros**: Filtros por categoria de games

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Zod** - Validação de schemas
- **EJS** - Template engine
- **Morgan** - Logger HTTP
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing
- **Express Rate Limit** - Rate limiting

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização com variáveis CSS
- **JavaScript ES6+** - Interatividade
- **Google Fonts** - Tipografia (Bangers, Open Sans)
- **Material Icons** - Ícones

## 📁 Estrutura do Projeto

```
rush-news-site/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Prisma
│   ├── controllers/
│   │   ├── newsController.js    # Controller de notícias
│   │   └── forumController.js   # Controller do fórum
│   ├── middlewares/
│   │   ├── errorHandler.js      # Tratamento de erros
│   │   ├── logger.js            # Sistema de logs
│   │   ├── security.js          # Middlewares de segurança
│   │   └── validation.js        # Validação com Zod
│   ├── routes/
│   │   ├── newsRoutes.js        # Rotas de notícias
│   │   └── forumRoutes.js       # Rotas do fórum
│   └── server.js                # Servidor principal
├── public/
│   ├── css/
│   │   └── style.css            # Estilos principais
│   ├── js/
│   │   └── main.js              # JavaScript principal
│   └── img/                     # Imagens e assets
├── views/
│   ├── index.ejs                # Página inicial
│   ├── news.ejs                 # Página de notícia
│   └── 404.ejs                  # Página de erro 404
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   └── seed.js                  # Dados iniciais
├── logs/                        # Arquivos de log
├── package.json                 # Dependências
└── README.md                    # Este arquivo
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd rush-news-site
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados iniciais (opcional)
node prisma/seed.js
```

4. **Inicie o servidor**
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

5. **Acesse o site**
```
http://localhost:3000
```

## 📊 API Endpoints

### Notícias
- `GET /api/news` - Listar notícias (com paginação e filtros)
- `GET /api/news/:id` - Obter notícia específica
- `GET /api/news/search?q=termo` - Buscar notícias
- `POST /api/news` - Criar notícia
- `PUT /api/news/:id` - Atualizar notícia
- `DELETE /api/news/:id` - Deletar notícia
- `POST /api/news/:id/comments` - Adicionar comentário

### Fórum
- `GET /api/forum` - Listar tópicos
- `GET /api/forum/:id` - Obter tópico específico
- `GET /api/forum/search?q=termo` - Buscar tópicos
- `GET /api/forum/stats` - Estatísticas do fórum
- `POST /api/forum` - Criar tópico
- `PUT /api/forum/:id` - Atualizar tópico
- `DELETE /api/forum/:id` - Deletar tópico
- `POST /api/forum/:id/posts` - Adicionar post

#### Carrossel
- `GET /api/news/carousel` - Obter notícias do carrossel
- `GET /api/news/carousel/stats` - Estatísticas do carrossel
- `PATCH /api/news/:id/featured` - Marcar/desmarcar como destaque
- `POST /api/news/carousel/reorder` - Reordenar notícias
- `DELETE /api/news/carousel/clear` - Limpar carrossel

## 🎮 Funcionalidades

### Para Visitantes
- ✅ Visualizar notícias por categoria
- ✅ Ler artigos completos
- ✅ Comentar em notícias
- ✅ Buscar notícias
- ✅ Participar do fórum
- ✅ Visualizar tópicos e posts

### Para Administradores (via API)
- ✅ Criar, editar e deletar notícias
- ✅ Moderar comentários
- ✅ Gerenciar tópicos do fórum
- ✅ Visualizar logs e estatísticas

## 🔒 Segurança

- **Rate Limiting**: Proteção contra spam e ataques
- **Sanitização**: Limpeza de dados de entrada
- **Validação**: Validação rigorosa com Zod
- **Helmet**: Headers de segurança
- **CORS**: Configuração adequada de CORS
- **Logs**: Sistema completo de auditoria

## 📱 Responsividade

O site é totalmente responsivo e funciona em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🎨 Design

- **Tema Escuro**: Interface moderna com cores escuras
- **Tipografia**: Bangers para títulos, Open Sans para texto
- **Cores**: Paleta baseada em cinza escuro com acentos laranja
- **Animações**: Transições suaves e efeitos hover
- **Cards**: Layout em grid responsivo para notícias

## 📝 Scripts Disponíveis

```bash
npm start          # Iniciar servidor em produção
npm run dev        # Iniciar servidor em desenvolvimento
npm run db:generate # Gerar cliente Prisma
npm run db:push    # Aplicar mudanças no schema
npm run db:migrate # Executar migrações
npm run db:studio  # Abrir Prisma Studio
```

## 🗃️ Banco de Dados

### Modelos

**News** (Notícias)
- id, title, content, summary
- imageUrl, author, category
- published, featured, views
- timestamps

**Comment** (Comentários)
- id, content, author, email
- newsId, parentId (para respostas)
- timestamps

**ForumTopic** (Tópicos do Fórum)
- id, title, description, author
- category, pinned, locked, views
- timestamps

**ForumPost** (Posts do Fórum)
- id, content, author, topicId
- timestamps


## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.

---

**RUSH** - O melhor site de notícias sobre games e esports! 🎮

