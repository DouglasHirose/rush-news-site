// ===== ADMINISTRAÇÃO DO CARROSSEL =====
class CarouselAdmin {
    constructor() {
        this.allNews = [];
        this.carouselNews = [];
        this.filteredNews = [];
        this.stats = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderStats();
        this.renderCarouselList();
        this.renderNewsList();
    }

    async loadData() {
        try {
            const [statsResponse, carouselResponse, newsResponse] = await Promise.all([
                fetch('/api/news/carousel/stats'),
                fetch('/api/news/carousel'),
                fetch('/api/news?limit=50')
            ]);

            const [statsData, carouselData, newsData] = await Promise.all([
                statsResponse.json(),
                carouselResponse.json(),
                newsResponse.json()
            ]);

            this.stats = statsData.success ? statsData.data : {};
            this.carouselNews = carouselData.success ? carouselData.data : [];
            this.allNews = newsData.success ? newsData.data : [];
            this.filteredNews = [...this.allNews];

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            utils.showMessage('Erro ao carregar dados da administração', 'error');
        }
    }

    setupEventListeners() {
        const clearBtn = document.getElementById('clear-carousel-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCarousel());
        }

        const refreshBtn = document.getElementById('refresh-carousel-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        const searchInput = document.getElementById('search-news');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterNews(e.target.value));
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));
        }
    }

    renderStats() {
        const container = document.getElementById('stats-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card">
                <span class="stat-number">${this.stats.totalFeatured || 0}</span>
                <span class="stat-label">No Carrossel</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${this.stats.totalNews || 0}</span>
                <span class="stat-label">Total de Notícias</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${this.stats.recentViews || 0}</span>
                <span class="stat-label">Visualizações (7 dias)</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${this.stats.featuredPercentage || 0}%</span>
                <span class="stat-label">Em Destaque</span>
            </div>
        `;
    }

    renderCarouselList() {
        const container = document.getElementById('carousel-list');
        if (!container) return;

        if (this.carouselNews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">photo_library</span>
                    <p>Nenhuma notícia no carrossel</p>
                    <p>Adicione notícias clicando no botão "Adicionar ao Carrossel" abaixo.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.carouselNews.map((news, index) => `
            <div class="news-item featured" data-id="${news.id}">
                <img src="${news.imageUrl || '/img/default-news.jpg'}" alt="${news.title}" class="news-image">
                <div class="news-content">
                    <div class="news-title">${news.title}</div>
                    <div class="news-meta">
                        <span>${news.category}</span>
                        <span>Por ${news.author}</span>
                        <span>${utils.formatDate(news.createdAt)}</span>
                        <span>${news.views} visualizações</span>
                    </div>
                </div>
                <div class="news-actions">
                    <button class="btn btn-danger btn-small" data-action="remove" data-id="${news.id}">
                        <span class="material-icons">remove</span>
                        Remover
                    </button>
                    ${index > 0 ? `
                        <button class="btn btn-secondary btn-small" data-action="up" data-id="${news.id}">
                            <span class="material-icons">keyboard_arrow_up</span>
                        </button>` : ''}
                    ${index < this.carouselNews.length - 1 ? `
                        <button class="btn btn-secondary btn-small" data-action="down" data-id="${news.id}">
                            <span class="material-icons">keyboard_arrow_down</span>
                        </button>` : ''}
                </div>
            </div>
        `).join('');

        this.bindCarouselActions();
    }

    renderNewsList() {
        const container = document.getElementById('news-list');
        if (!container) return;

        if (this.filteredNews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">search_off</span>
                    <p>Nenhuma notícia encontrada</p>
                    <p>Tente ajustar os filtros de busca.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredNews.map(news => {
            const isInCarousel = this.carouselNews.some(c => c.id === news.id);

            return `
                <div class="news-item ${isInCarousel ? 'featured' : ''}" data-id="${news.id}">
                    <img src="${news.imageUrl || '/img/default-news.jpg'}" alt="${news.title}" class="news-image">
                    <div class="news-content">
                        <div class="news-title">${news.title}</div>
                        <div class="news-meta">
                            <span>${news.category}</span>
                            <span>Por ${news.author}</span>
                            <span>${utils.formatDate(news.createdAt)}</span>
                            <span>${news.views} visualizações</span>
                        </div>
                    </div>
                    <div class="news-actions">
                        ${isInCarousel ? `
                            <button class="btn btn-danger btn-small" data-action="remove" data-id="${news.id}">
                                <span class="material-icons">remove</span>
                                Remover do Carrossel
                            </button>` : `
                            <button class="btn btn-success btn-small" data-action="add" data-id="${news.id}">
                                <span class="material-icons">add</span>
                                Adicionar ao Carrossel
                            </button>`}
                        <a href="/news/${news.id}" class="btn btn-secondary btn-small" target="_blank">
                            <span class="material-icons">open_in_new</span>
                            Ver
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        this.bindNewsListActions();
    }

    bindCarouselActions() {
        const container = document.getElementById('carousel-list');
        if (!container) return;

        container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const id = parseInt(button.dataset.id);
                if (!id) return;

                switch (action) {
                    case 'remove': return this.removeFromCarousel(id);
                    case 'up': return this.moveUp(id);
                    case 'down': return this.moveDown(id);
                }
            });
        });
    }

    bindNewsListActions() {
        const container = document.getElementById('news-list');
        if (!container) return;

        container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const id = parseInt(button.dataset.id);
                if (!id) return;

                switch (action) {
                    case 'add': return this.addToCarousel(id);
                    case 'remove': return this.removeFromCarousel(id);
                }
            });
        });
    }

    async addToCarousel(newsId) {
        try {
            const response = await fetch(`/api/news/${newsId}/featured`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: true })
            });

            const data = await response.json();

            if (data.success) {
                utils.showMessage('Notícia adicionada ao carrossel!', 'success');
                await this.refresh();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao adicionar ao carrossel:', error);
            utils.showMessage('Erro ao adicionar notícia ao carrossel', 'error');
        }
    }

    async removeFromCarousel(newsId) {
        try {
            const response = await fetch(`/api/news/${newsId}/featured`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: false })
            });

            const data = await response.json();

            if (data.success) {
                utils.showMessage('Notícia removida do carrossel!', 'success');
                await this.refresh();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao remover do carrossel:', error);
            utils.showMessage('Erro ao remover notícia do carrossel', 'error');
        }
    }

    async clearCarousel() {
        if (!confirm('Tem certeza que deseja remover todas as notícias do carrossel?')) return;

        try {
            const response = await fetch('/api/news/carousel/clear', { method: 'DELETE' });
            const data = await response.json();

            if (data.success) {
                utils.showMessage(`${data.data.updatedCount} notícias removidas do carrossel!`, 'success');
                await this.refresh();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao limpar carrossel:', error);
            utils.showMessage('Erro ao limpar carrossel', 'error');
        }
    }

    async moveUp(newsId) {
        const currentIndex = this.carouselNews.findIndex(news => news.id === newsId);
        if (currentIndex <= 0) return;

        const newOrder = [...this.carouselNews];
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
        await this.reorderCarousel(newOrder.map(news => news.id));
    }

    async moveDown(newsId) {
        const currentIndex = this.carouselNews.findIndex(news => news.id === newsId);
        if (currentIndex >= this.carouselNews.length - 1) return;

        const newOrder = [...this.carouselNews];
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
        await this.reorderCarousel(newOrder.map(news => news.id));
    }

    async reorderCarousel(newsIds) {
        try {
            const response = await fetch('/api/news/carousel/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newsIds })
            });

            const data = await response.json();

            if (data.success) {
                utils.showMessage('Ordem do carrossel atualizada!', 'success');
                await this.refresh();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao reordenar carrossel:', error);
            utils.showMessage('Erro ao reordenar carrossel', 'error');
        }
    }

    filterNews(searchTerm) {
        const term = searchTerm.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;

        this.filteredNews = this.allNews.filter(news => {
            const matchesSearch =
                !term ||
                news.title.toLowerCase().includes(term) ||
                news.summary.toLowerCase().includes(term) ||
                news.author.toLowerCase().includes(term);
            
            const matchesCategory = !categoryFilter || news.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderNewsList();
    }
    
    filterByCategory(category) {
        const searchTerm = document.getElementById('search-news').value;
        this.filterNews(searchTerm);
    }
    
    async refresh() {
        await this.loadData();
        this.renderStats();
        this.renderCarouselList();
        this.renderNewsList();
        
        // Atualizar carrossel na página principal se estiver aberta
        if (window.newsCarousel) {
            await window.newsCarousel.refresh();
        }
    }
}

// Inicializar administração do carrossel
let carouselAdmin;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('stats-grid')) {
        carouselAdmin = new CarouselAdmin();
    }
});

