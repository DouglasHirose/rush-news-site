# RUSH - Site de Notícias de Games

Criado por Douglas Kaoru Hirose - CG3023486

Um site completo de notícias sobre games e esports desenvolvido com Node.js, Express, Prisma e tecnologias web modernas.

##  Características

- **Arquitetura MVC (Incompleta)**: Estrutura organizada com Models, Views
- **API RESTful**: Endpoints para notícias e fórum
- **Banco de Dados**: SQLite com Prisma ORM
- **Validação**: Validação com Zod
- **Middlewares**: Log, segurança e tratamento de erros
- **Frontend Responsivo**: HTML5, CSS3 e JavaScript vanilla
- **Sistema de Comentários**: Comentários aninhados nas notícias (Não finalizado)
- **Fórum**: Sistema de tópicos e posts para discussões

##  Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Zod** - Validação de schemas
- **Morgan** - Logger HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Express Rate Limit** - Rate limiting

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização com variáveis CSS
- **JavaScript ES6+** - Interatividade
- **Google Fonts** - Tipografia (Bangers, Open Sans)
- **Material Icons** - Ícones

##  Estrutura do Projeto

```
rush-news-site/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Prisma (Conectar banco de dados)
│   ├── controllers/
│   │   ├── newsController.js    # Controller de notícias
│   │   └── forumController.js   # Controller do fórum
│   ├── middlewares/
│   │   ├── errorHandler.js      # Tratamento de erros
│   │   ├── logger.js            # Sistema de logs
│   │   └── validation.js        # Validação com Zod
│   ├── routes/
│   │   ├── newsRoutes.js        # Rotas de notícias
│   │   └── forumRoutes.js       # Rotas do fórum
│   └── server.js                # Servidor principal
├── public/
│   ├── css/
│   │   ├── style.css            # Estilos principais
│   │   ├── cards.css            # Cards de notícias
│   │   ├── comments.css         # aba de comentários (não finalizada)
│   │   ├── forum.css            # aba forum 
│   │   ├── news.css             # aba all-news
│   │   └── carousel.csss        # carrosel do index e carousel-admin
│   ├── js/
│   │   ├── app.js               # script principal (puxar e enviar dados do banco, carregar e gerar no front)
│   │   ├── admin-carousel.js    # gerenciar página do carrosel (ordem, notícias que serão mostradas)
│   │   ├── carousel.js          # faz o carrossel do index girar e outras funções que por hora bugaram
│   │   ├── forum.js             # aba do forum (GET, POST, DELETE e render)
│   │   └── news.js              # responsável pelo render dos cards e do all-news
│   ├── img/  # Imagens
│   ├── index.html               # Página inicial
│   ├── admin-carousel.html      # Página para gerenciar o carrosel
│   ├── all-news.html            # Página que mostra todos o cards de notícia
│   ├── create-news.html         # Página para criar notícia
│   ├── forum.html               # Pagina do fórum (adição e gerenciamento de tópicos (não finalizado))
│   ├── news.html                # Página de notícia, é invocada ao clicar no card
│   └── 404.html                 # Página de erro                   
├── prisma/
│   ├── schema.prisma            # Schema do banco (ajustado por IA na cara de pau)
│   ├── dev.db                   # banco de dados 
│   └── seed.js                  # Dados iniciais (para testar)
├── logs/                        # Arquivos de log
├── package.json                 # Dependências
└── README.md                    # Este arquivo
```

##  Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Instale as dependências**
```bash
npm install
```

2. **Configure o banco de dados**
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados iniciais (opcional)
node prisma/seed.js
```

3. **Inicie o servidor**
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

4. **Acesse o site**
```
http://localhost:3010
```

##  API Endpoints

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

##  Segurança

- **Rate Limiting**: Proteção contra spam e ataques (retirado junto com JWT, dava dando muita dor de cabeça)
- **Sanitização**: Limpeza de dados de entrada
- **Validação**: Validação com Zod
- **Logs**: Sistema completo de auditoria

##  Responsividade

O site é totalmente responsivo e funciona em:
-  Dispositivos móveis
-  Tablets
-  Desktops
-  Telas grandes

##  Design

- **Tema Escuro**: Interface moderna com cores escuras
- **Tipografia**: Bangers para títulos, Open Sans para texto
- **Cores**: Paleta baseada em cinza escuro com acentos laranja (Cores duvidosas, mas eu não sei ver cor mesmo...)
- **Cards**: Layout em grid responsivo para notícias

##  Scripts Disponíveis

```bash
npm start          # Iniciar servidor em produção
npm run dev        # Iniciar servidor em desenvolvimento
npm run db:generate # Gerar cliente Prisma
npm run db:push    # Aplicar mudanças no schema
npm run db:migrate # Executar migrações
npm run db:studio  # Abrir Prisma Studio
```

##  Banco de Dados

### Modelos

**News** (Notícias)
- id, title, content, summary
- imageUrl, author, category
- views, timestamps

**Comment** (Comentários)               # Não finalizado, então não foi utilizado
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


##  Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.


