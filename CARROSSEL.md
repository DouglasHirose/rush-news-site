# 🎠 Carrossel de Notícias - RUSH

## Visão Geral

O carrossel de notícias substitui o banner fixo anterior e oferece uma experiência dinâmica e totalmente editável para destacar as principais notícias do site.

## ✨ Funcionalidades Implementadas

### 🎯 Carrossel Principal
- **Navegação automática**: Troca de slides a cada 5 segundos
- **Controles manuais**: Setas de navegação e indicadores
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Touch/Swipe**: Suporte a gestos em dispositivos móveis
- **Teclado**: Navegação com setas do teclado
- **Pause on hover**: Para a rotação automática ao passar o mouse

### 🛠️ Painel de Administração
- **URL**: `/admin/carousel`
- **Estatísticas em tempo real**: Visualizações, total de notícias, etc.
- **Gerenciamento visual**: Interface intuitiva para adicionar/remover notícias
- **Busca e filtros**: Encontre notícias rapidamente
- **Reordenação**: Mude a ordem das notícias no carrossel
- **Ações em lote**: Limpe todo o carrossel de uma vez

### 🔌 API Endpoints

#### Carrossel
- `GET /api/news/carousel` - Obter notícias do carrossel
- `GET /api/news/carousel/stats` - Estatísticas do carrossel
- `PATCH /api/news/:id/featured` - Marcar/desmarcar como destaque
- `POST /api/news/carousel/reorder` - Reordenar notícias
- `DELETE /api/news/carousel/clear` - Limpar carrossel

## 🎨 Design e UX

### Características Visuais
- **Gradientes dinâmicos**: Sobreposições que destacam o texto
- **Tipografia hierárquica**: Títulos em Bangers, texto em Open Sans
- **Cores consistentes**: Paleta laranja (#ff6b35) do RUSH
- **Animações suaves**: Transições de 0.5s entre slides
- **Loading states**: Indicadores visuais durante carregamento

### Responsividade
- **Desktop**: Carrossel de 400px de altura
- **Tablet**: Carrossel de 300px de altura
- **Mobile**: Carrossel de 250px de altura, layout adaptado

## 🔧 Como Usar

### Para Usuários Finais
1. Acesse a página inicial (`/`)
2. O carrossel carrega automaticamente as notícias em destaque
3. Use as setas ou indicadores para navegar manualmente
4. Clique em "Ler Matéria" para acessar a notícia completa

### Para Administradores
1. Acesse `/admin/carousel`
2. Visualize as estatísticas atuais
3. Use "Adicionar ao Carrossel" para destacar notícias
4. Reordene usando os botões de seta
5. Use "Limpar Carrossel" para remover todas as notícias

## 📱 Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Grid, Flexbox, animações, variáveis CSS
- **JavaScript ES6+**: Classes, async/await, fetch API
- **Material Icons**: Ícones consistentes

### Backend
- **Node.js + Express**: Servidor web
- **Prisma ORM**: Gerenciamento do banco de dados
- **Zod**: Validação de dados
- **EJS**: Template engine

### Banco de Dados
- **SQLite**: Banco local para desenvolvimento
- **Campo `featured`**: Marca notícias para o carrossel
- **Ordenação por data**: Controla a ordem no carrossel

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas
- **Drag & Drop**: Reordenação por arrastar e soltar
- **Agendamento**: Programar notícias para aparecer em horários específicos
- **A/B Testing**: Testar diferentes versões do carrossel
- **Analytics**: Métricas detalhadas de cliques e visualizações
- **Temas**: Diferentes estilos visuais para o carrossel

### Otimizações Técnicas
- **Lazy loading**: Carregar imagens sob demanda
- **Cache**: Otimizar performance da API
- **CDN**: Servir imagens de forma otimizada
- **PWA**: Funcionalidades offline

## 🔒 Segurança

- **Rate limiting**: Proteção contra spam na API
- **Validação rigorosa**: Todos os dados são validados com Zod
- **Sanitização**: Prevenção contra XSS
- **CORS configurado**: Controle de acesso entre domínios

## 📊 Monitoramento

### Logs Disponíveis
- Todas as ações de administração são logadas
- Erros são capturados e registrados
- Métricas de performance são coletadas

### Estatísticas Rastreadas
- Número de notícias no carrossel
- Total de visualizações
- Percentual de notícias em destaque
- Atividade dos últimos 7 dias

---

**Desenvolvido para o projeto RUSH News**  
*Sistema de carrossel dinâmico e editável*

