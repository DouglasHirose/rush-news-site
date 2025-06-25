console.log('🚀 RUSH News - Carregando aplicação...');

const API_BASE_URL = '/api';

// Utilitários
const utils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
};

// Função para carregar notícias em destaque do backend
async function loadFeaturedNews() {
    try {
        const response = await fetch('/api/news/carousel');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            renderCarousel(data.data);
        } else {
            console.warn('Nenhuma notícia em destaque encontrada.');
            document.querySelector('.carousel-slides').innerHTML = `
                <div class="carousel-slide loading-slide">
                    <div class="slide-loading">
                        <p>Nenhuma notícia no carrossel</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar o carrossel:', error);
    }
}

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    let currentIndex = 0;
    let interval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            indicators[i]?.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }

    function nextSlide() {
        const nextIndex = (currentIndex + 1) % slides.length;
        showSlide(nextIndex);
    }

    interval = setInterval(nextSlide, 7000);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(interval);
            showSlide(index);
            interval = setInterval(nextSlide, 7000);
        });
    });

    showSlide(currentIndex);
}

// Função para renderizar os slides do carrossel
function renderCarousel(newsList) {
    const slidesContainer = document.querySelector('.carousel-slides');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    if (!slidesContainer || !indicatorsContainer) return;

    slidesContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    newsList.forEach((news, index) => {
        slidesContainer.innerHTML += `
            <div class="carousel-slide${index === 0 ? ' active' : ''}" 
                 style="background-image: url('${news.imageUrl || '/img/default-news.jpg'}')">
                <div class="slide-content">
                    <div class="slide-category">${news.category}</div>
                    <div class="slide-title">${news.title}</div>
                    <div class="slide-summary">${news.summary}</div>
                    <div class="slide-meta">
                        <span class="slide-author">${news.author}</span>
                        <span class="slide-date">${utils.formatDate(news.createdAt)}</span>
                        <span class="slide-views">${news.views} visualizações</span>
                    </div>
                    <a href="/news/${news.id}" class="slide-cta">Leia mais</a>
                </div>
            </div>
        `;

        indicatorsContainer.innerHTML += `
            <button class="carousel-indicator${index === 0 ? ' active' : ''}" data-index="${index}"></button>
        `;
    });

    initCarousel(); // ativa transição ou navegação se necessário
}
// Inicializa o carregamento na página assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedNews();
});

// Classe para gerenciar a página inicial
class HomePage {
    constructor() {
        console.log('📱 HomePage: Inicializando...');
        this.currentPage = 1;
        this.currentCategory = '';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('📊 HomePage: Carregando dados...');
            await this.loadFeaturedNews();
            await this.loadLatestNews();
            await this.loadForumDiscussions();
            this.setupEventListeners();
            console.log('✅ HomePage: Carregamento concluído!');
        } catch (error) {
            console.error('❌ HomePage: Erro ao inicializar:', error);
        }
    }
    
    async loadFeaturedNews() {
        try {
            console.log('🔥 Carregando notícias em destaque...');
            const response = await fetch('/api/news?featured=true&limit=3');
            const data = await response.json();
            
            console.log('📰 Notícias em destaque recebidas:', data);
            
            if (data.success && data.data && data.data.length > 0) {
                this.renderFeaturedNews(data.data);
            } else {
                this.showEmptyFeaturedNews();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar notícias em destaque:', error);
            this.showEmptyFeaturedNews();
        }
    }
    
    async loadLatestNews(page = 1, category = '') {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            console.log('📋 Carregando últimas notícias...');
            const params = new URLSearchParams({
                page: page,
                limit: 6
            });
            
            if (category) {
                params.append('category', category);
            }
            
            const response = await fetch(`/api/news?${params}`);
            const data = await response.json();
            
            console.log('📰 Últimas notícias recebidas:', data);
            
            if (data.success) {
                this.renderLatestNews(data.data, page === 1);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar últimas notícias:', error);
        } finally {
            this.isLoading = false;
        }
    }
    
    async loadForumDiscussions() {
        try {
            console.log('💬 Carregando discussões do fórum...');
            const response = await fetch("/api/forum/topics?limit=5");
            const data = await response.json();
            
            console.log('🗣️ Discussões do fórum recebidas:', data);
            
            if (data.success) {
                this.renderForumDiscussions(data.data);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar discussões do fórum:', error);
        }
    }
    
    renderFeaturedNews(news) {
        console.log('🎨 Renderizando notícias em destaque...');
        const container = document.querySelector('#featured-news');
        if (!container) {
            console.warn('⚠️ Container #featured-news não encontrado');
            return;
        }
        
        container.innerHTML = news.map(item => `
            <article class="featured-news-item">
                <div class="news-image">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">` : ''}
                    <div class="news-category">${item.category}</div>
                </div>
                <div class="news-content">
                    <h3><a href="/news/${item.id}">${item.title}</a></h3>
                    <p>${utils.truncateText(item.summary, 120)}</p>
                    <div class="news-meta">
                        <span>Por ${item.author}</span>
                        <span>${utils.formatDate(item.createdAt)}</span>
                        <span>${item.views || 0} visualizações</span>
                    </div>
                </div>
                <button class="delete-news-btn" data-id="${item.id}" title="Apagar notícia">

                    <span class="material-icons">delete</span>
                </button>
            </article>
        `).join('');
        
        console.log('✅ Notícias em destaque renderizadas');
    }
    
    renderLatestNews(news, replace = true) {
        console.log('🎨 Renderizando últimas notícias...');
        const container = document.querySelector('#latest-news');
        if (!container) {
            console.warn('⚠️ Container #latest-news não encontrado');
            return;
        }
        
        const newsHTML = news.map(item => `
            <article class="news-card">
                <div class="news-image">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">` : ''}
                    <div class="news-category">${item.category}</div>
                </div>
                <div class="news-content">
                    <h3><a href="/news/${item.id}">${item.title}</a></h3>
                    <p>${utils.truncateText(item.summary, 100)}</p>
                    <div class="news-meta">
                        <span>Por ${item.author}</span>
                        <span>${utils.formatDate(item.createdAt)}</span>
                        <span>${item.views || 0} visualizações</span>
                    </div>
                </div>
                <button class="delete-news-btn" data-id="${item.id}" title="Apagar notícia">

                    <span class="material-icons">delete</span>
                </button>
            </article>
        `).join('');
        
        if (replace) {
            container.innerHTML = newsHTML;
        } else {
            container.innerHTML += newsHTML;
        }
        
        console.log('✅ Últimas notícias renderizadas');
    }
    
    renderForumDiscussions(topics) {
        console.log('🎨 Renderizando discussões do fórum...');
        const container = document.querySelector('#forum-topics');
        if (!container) {
            console.warn('⚠️ Container #forum-topics não encontrado');
            return;
        }
        
        container.innerHTML = topics.map(topic => `
            <div class="forum-item">
                <div class="forum-content">
                    <h4><a href="/forum/${topic.id}">${topic.title}</a></h4>
                    <p>${utils.truncateText(topic.description, 80)}</p>
                    <div class="forum-meta">
                        <span>Por ${topic.author}</span>
                        <span>${topic._count?.posts || 0} respostas</span>
                        <span>${topic.views || 0} visualizações</span>
                    </div>
                </div>
                <div class="forum-category">${topic.category}</div>
            </div>
        `).join('');
        
        console.log('✅ Discussões do fórum renderizadas');
    }
    
    showEmptyFeaturedNews() {
        const container = document.querySelector('#featured-news');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">info</span>
                    <p>Nenhuma notícia em destaque para exibir.</p>
                </div>
            `;
        }
    }
    
    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');
        // Filtros de categoria
        const categoryButtons = document.querySelectorAll('.category-filter');
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category || '';
                this.filterByCategory(category);
            });
        });
    }
    
    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        
        // Atualizar botões ativos
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`) || 
                         document.querySelector('.category-filter');
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.loadLatestNews(1, category);
    }
}

// Adiciona o botão de gerenciamento do carrossel
document.addEventListener('DOMContentLoaded', function() {
    const manageCarouselBtn = document.getElementById('manage-carousel-btn');
    manageCarouselBtn.addEventListener('click', function() {
        // Redireciona para a página de gerenciamento do carrossel
        window.location.href = '/admin-carousel.html';
    });
});


// Função global para apagar notícias
async function deleteNews(newsId) {
    if (!confirm('Tem certeza que deseja apagar esta notícia? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/news/${newsId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            utils.showMessage('Notícia apagada com sucesso!', 'success');
            // Recarregar as notícias
            if (window.homePage) {
                await window.homePage.loadFeaturedNews();
                await window.homePage.loadLatestNews();
            }
        } else {
            utils.showMessage('Erro ao apagar notícia: ' + (data.message || 'Erro desconhecido'), 'error');
        }
    } catch (error) {
        console.error('Erro ao apagar notícia:', error);
        utils.showMessage('Erro ao apagar notícia. Tente novamente.', 'error');
    }
}

// Variáveis globais
let homePage = null;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM carregado, inicializando RUSH News...');
    
    // Inicializar apenas na página inicial
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        console.log('🏠 Página inicial detectada, inicializando HomePage...');
        
        try {
            homePage = new HomePage();
            
            // Tornar disponível globalmente
            window.homePage = homePage;
            
            console.log('🎉 RUSH News inicializado com sucesso!');
        } catch (error) {
            console.error('💥 Erro ao inicializar RUSH News:', error);
        }
    } else {
        console.log('📄 Página diferente da inicial:', window.location.pathname);
    }
});

document.addEventListener('DOMContentLoaded', () => {
  const openModalBtn = document.getElementById('open-create-modal'); // seu botão principal
  const closeModalBtn = document.getElementById('close-news-modal');
  const cancelBtn = document.getElementById('cancel-news-btn');
  const modal = document.getElementById('create-news-modal');
  const form = document.getElementById('create-news-form');

  // Abrir modal
  openModalBtn?.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  // Fechar modal
  closeModalBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  cancelBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Enviar nova notícia
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const summary = document.getElementById('summary').value;
    const category = document.getElementById('category').value;
    const imageUrl = document.getElementById('imageUrl').value;

    // Validação simples
    if (!title || !summary || !category) {
      utils.showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          category,
          imageUrl,
          createdAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        utils.showMessage('Notícia criada com sucesso!', 'success');
        modal.style.display = 'none';
        location.reload(); // recarrega a página para atualizar as notícias
      } else {
        throw new Error(data.message || 'Erro ao criar notícia');
      }

    } catch (error) {
      console.error('Erro ao criar notícia:', error);
      utils.showMessage('Erro ao criar notícia.', 'error');
    }
  });
});
