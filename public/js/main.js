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

// Classe para gerenciar a página inicial
class HomePage {
    constructor() {
        this.currentPage = 1;
        this.currentCategory = '';
        this.isLoading = false;
        
        console.log('HomePage inicializada');
        this.init();
    }
    
    async init() {
        try {
            console.log('Iniciando carregamento da página...');
            await this.loadFeaturedNews();
            await this.loadLatestNews();
            await this.loadForumDiscussions();
            this.setupEventListeners();
            console.log('Página inicial carregada com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar página inicial:', error);
        }
    }
    
    async loadFeaturedNews() {
        try {
            console.log('Carregando notícias em destaque...');
            const response = await fetch('/api/news?featured=true&limit=3');
            const data = await response.json();
            
            if (data.success && data.data && data.data.length > 0) {
                this.renderFeaturedNews(data.data);
                renderCarousel(data.data);
            } else {
                this.showEmptyFeaturedNews();
            }
        } catch (error) {
            console.error('Erro ao carregar notícias em destaque:', error);
            this.showEmptyFeaturedNews();
        }
    }
    
    async loadLatestNews(page = 1, category = '') {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            console.log('Carregando últimas notícias...');
            const params = new URLSearchParams({
                page: page,
                limit: 6
            });
            
            if (category) {
                params.append('category', category);
            }
            
            const response = await fetch(`/api/news?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderLatestNews(data.data, page === 1);
            }
        } catch (error) {
            console.error('Erro ao carregar últimas notícias:', error);
        } finally {
            this.isLoading = false;
        }
    }
    
    async loadForumDiscussions() {
        try {
            console.log('Carregando discussões do fórum...');
            const response = await fetch("/api/forum/topics?limit=5");
            const data = await response.json();
            
            if (data.success) {
                this.renderForumDiscussions(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar discussões do fórum:', error);
        }
    }
    
    renderFeaturedNews(news) {
        const container = document.querySelector('.featured-news-list');
        if (!container) return;
        
        container.innerHTML = news.map(item => `
            <article class="featured-news-item">
                <div class="news-image">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">` : ''}
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
    }
    
    renderLatestNews(news, replace = true) {
        const container = document.querySelector('.latest-news-list');
        if (!container) return;
        
        const newsHTML = news.map(item => `
            <article class="news-card">
                <div class="news-image">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">` : ''}
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
    }
    
    renderForumDiscussions(topics) {
        const container = document.querySelector('.forum-discussions');
        if (!container) return;
        
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
    }
    
    showEmptyFeaturedNews() {
        const container = document.querySelector('.featured-news-list');
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

// Classe para gerenciar o carrossel
class NewsCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.autoSlideInterval = null;
        this.isLoading = false;
        
        console.log('NewsCarousel inicializado');
        this.init();
    }
    
    async init() {
        try {
            await this.loadCarouselNews();
            this.setupEventListeners();
            this.startAutoSlide();
        } catch (error) {
            console.error('Erro ao inicializar carrossel:', error);
            this.showError();
        }
    }
    
    async loadCarouselNews() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            console.log('Carregando notícias do carrossel...');
            const response = await fetch('/api/news?featured=true&limit=5');
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                this.slides = data.data;
                this.renderCarousel();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Erro ao carregar notícias do carrossel:', error);
            this.showError();
        } finally {
            this.isLoading = false;
        }
    }
    
    renderCarousel() {
        const container = document.querySelector('.carousel-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="carousel-slides">
                ${this.slides.map((slide, index) => `
                    <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                        <div class="slide-content">
                            <div class="slide-category">${slide.category}</div>
                            <h2 class="slide-title">${slide.title}</h2>
                            <p class="slide-summary">${slide.summary}</p>
                            <div class="slide-meta">
                                <span>Por ${slide.author}</span>
                                <span>${utils.formatDate(slide.createdAt)}</span>
                                <span>${slide.views || 0} visualizações</span>
                            </div>
                            <a href="/news/${slide.id}" class="slide-cta">Ler Matéria</a>
                        </div>
                        ${slide.imageUrl ? `<div class="slide-image" style="background-image: url('${slide.imageUrl}')"></div>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="carousel-controls">
                <button class="carousel-btn prev" aria-label="Slide anterior">
                    <span class="material-icons">chevron_left</span>
                </button>
                <button class="carousel-btn next" aria-label="Próximo slide">
                    <span class="material-icons">chevron_right</span>
                </button>
            </div>
        `;
        
        this.setupCarouselEvents();
    }
    
    setupCarouselEvents() {
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        const currentSlide = document.querySelector('.carousel-slide.active');
        if (currentSlide) currentSlide.classList.remove('active');
        
        const newSlide = document.querySelector(`[data-slide="${index}"]`);
        if (newSlide) newSlide.classList.add('active');
        
        this.currentSlide = index;
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }
    
    startAutoSlide() {
        this.pauseAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    showEmptyState() {
        const container = document.querySelector('.carousel-container');
        if (container) {
            container.innerHTML = `
                <div class="carousel-empty">
                    <span class="material-icons">photo_library</span>
                    <h3>Nenhuma notícia em destaque</h3>
                    <p>Adicione notícias em destaque para exibir no carrossel</p>
                </div>
            `;
        }
    }
    
    showError() {
        const container = document.querySelector('.carousel-container');
        if (container) {
            container.innerHTML = `
                <div class="carousel-error">
                    <span class="material-icons">error</span>
                    <h3>Erro ao carregar carrossel</h3>
                    <p>Não foi possível carregar as notícias do carrossel</p>
                </div>
            `;
        }
    }
}

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
            if (window.carousel) {
                await window.carousel.loadCarouselNews();
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
let carousel = null;
let homePage = null;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando aplicação...');
    
    // Inicializar apenas na página inicial
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        console.log('Página inicial detectada, inicializando componentes...');
        
        try {
            carousel = new NewsCarousel();
            homePage = new HomePage();
            
            // Tornar disponível globalmente para debug
            window.carousel = carousel;
            window.homePage = homePage;
            
            console.log('Componentes inicializados com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar componentes:', error);
        }
    }
});

