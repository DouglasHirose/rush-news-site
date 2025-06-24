// ===== FÓRUM - FUNCIONALIDADES =====
class ForumPage {
    constructor() {
        this.currentPage = 1;
        this.currentCategory = '';
        this.currentSort = 'recent';
        this.topics = [];
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadTopics();
            this.setupEventListeners();
        } catch (error) {
            console.error('Erro ao inicializar fórum:', error);
        }
    }
    
    async loadTopics(page = 1, category = '', sort = 'recent') {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            const params = new URLSearchParams({
                page: page,
                limit: 10,
                sort: sort
            });
            
            if (category) {
                params.append('category', category);
            }
            
            const response = await fetch(`/api/forum?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.topics = data.data;
                this.renderTopics();
                this.renderPagination(data.pagination);
            } else {
                this.showError('Erro ao carregar tópicos');
            }
        } catch (error) {
            console.error('Erro ao carregar tópicos:', error);
            this.showError('Erro ao carregar tópicos do fórum');
        } finally {
            this.isLoading = false;
        }
    }
    
    renderTopics() {
        const container = document.getElementById('topics-list');
        if (!container) return;
        
        if (this.topics.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">forum</span>
                    <h3>Nenhum tópico encontrado</h3>
                    <p>Seja o primeiro a criar um tópico!</p>
                    <button class="btn btn-primary" onclick="forumPage.openCreateModal()">
                        <span class="material-icons">add</span>
                        Criar Primeiro Tópico
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.topics.map(topic => `
            <div class="topic-item">
                <div class="topic-content">
                    <div class="topic-header">
                        <h3 class="topic-title">
                            <a href="/forum/${topic.id}">${topic.title}</a>
                        </h3>
                        <span class="topic-category">${topic.category}</span>
                    </div>
                    <p class="topic-description">${topic.description}</p>
                    <div class="topic-meta">
                        <div class="topic-author">
                            <span class="material-icons">person</span>
                            <span>Por ${topic.author}</span>
                        </div>
                        <div class="topic-date">
                            <span class="material-icons">schedule</span>
                            <span>${utils.formatDate(topic.createdAt)}</span>
                        </div>
                        <div class="topic-replies">
                            <span class="material-icons">comment</span>
                            <span>${topic._count?.posts || 0} respostas</span>
                        </div>
                        <div class="topic-views">
                            <span class="material-icons">visibility</span>
                            <span>${topic.views || 0} visualizações</span>
                        </div>
                        <div class="topic-actions">
                            <button class="btn-edit-topic" onclick="forumPage.editTopic(${topic.id})" title="Editar tópico">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="btn-delete-topic" onclick="forumPage.deleteTopic(${topic.id})" title="Excluir tópico">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="topic-actions">
                    <a href="/forum/${topic.id}" class="btn btn-small btn-primary">
                        <span class="material-icons">open_in_new</span>
                        Ver Tópico
                    </a>
                </div>
            </div>
        `).join('');
    }
    
    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container || !pagination) return;
        
        const { currentPage, totalPages, hasNext, hasPrev } = pagination;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination-controls">';
        
        // Botão anterior
        if (hasPrev) {
            paginationHTML += `
                <button class="pagination-number" data-page="${i}">${i}</button>
                    <span class="material-icons">chevron_left</span>
                    Anterior
                </button>
            `;
        }
        
        // Números das páginas
        paginationHTML += '<div class="pagination-numbers">';
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<span class="pagination-number active">${i}</span>`;
            } else {
                paginationHTML += `<button class="pagination-number" onclick="forumPage.goToPage(${i})">${i}</button>`;
            }
        }
        paginationHTML += '</div>';
        
        // Botão próximo
        if (hasNext) {
            paginationHTML += `
                <button class="pagination-btn" onclick="forumPage.goToPage(${currentPage + 1})">
                    Próximo
                    <span class="material-icons">chevron_right</span>
                </button>
            `;
        }
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }
    
    setupEventListeners() {
    document.getElementById('pagination')?.addEventListener('click', (e) => {
        const pageBtn = e.target.closest('[data-page]');
        if (pageBtn) {
            const page = parseInt(pageBtn.dataset.page);
            this.goToPage(page);
        }
    });
        // Botão criar tópico
        const createBtn = document.getElementById('create-topic-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.openCreateModal());
        }
        
        // Modal
        const modal = document.getElementById('create-topic-modal');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-topic');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCreateModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeCreateModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeCreateModal();
                }
            });
        }
        
        // Formulário
        const form = document.getElementById('create-topic-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleCreateTopic(e));
        }
        
        // Filtros
        const searchInput = document.getElementById('search-topics');
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(() => this.handleSearch(), 500));
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.handleCategoryFilter());
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.handleSortFilter());
        }
    }
    
    openCreateModal() {
        const modal = document.getElementById('create-topic-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Removido o overflow hidden para permitir scroll
        }
    }
    
    closeCreateModal() {
        const modal = document.getElementById('create-topic-modal');
        if (modal) {
            modal.style.display = 'none';
            // Removido o overflow auto pois não foi definido overflow hidden
            
            // Limpar formulário
            const form = document.getElementById('create-topic-form');
            if (form) {
                form.reset();
            }
        }
    }
    
    async handleCreateTopic(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const topicData = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            content: formData.get('content'),
            author: formData.get('author')
        };
        
        try {
            const response = await fetch('/api/forum', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(topicData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                utils.showMessage('Tópico criado com sucesso!', 'success');
                this.closeCreateModal();
                await this.loadTopics(); // Recarregar tópicos
            } else {
                throw new Error(data.message || 'Erro ao criar tópico');
            }
        } catch (error) {
            console.error('Erro ao criar tópico:', error);
            utils.showMessage('Erro ao criar tópico', 'error');
        }
    }
    
    handleSearch() {
        const searchInput = document.getElementById('search-topics');
        if (searchInput) {
            // Implementar busca quando a API estiver pronta
            console.log('Buscar por:', searchInput.value);
        }
    }
    
    handleCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            this.currentCategory = categoryFilter.value;
            this.currentPage = 1;
            this.loadTopics(1, this.currentCategory, this.currentSort);
        }
    }
    
    handleSortFilter() {
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            this.currentSort = sortFilter.value;
            this.currentPage = 1;
            this.loadTopics(1, this.currentCategory, this.currentSort);
        }
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadTopics(page, this.currentCategory, this.currentSort);
    }
    
    async editTopic(topicId) {
        // Implementar edição de tópico
        utils.showMessage('Funcionalidade de edição em desenvolvimento', 'info');
    }
    
    async deleteTopic(topicId) {
        if (!confirm('Tem certeza que deseja excluir este tópico? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/forum/${topicId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                utils.showMessage('Tópico excluído com sucesso!', 'success');
                await this.loadTopics(); // Recarregar tópicos
            } else {
                throw new Error(data.message || 'Erro ao excluir tópico');
            }
        } catch (error) {
            console.error('Erro ao excluir tópico:', error);
            utils.showMessage('Erro ao excluir tópico', 'error');
        }
    }
    
    showError(message) {
        const container = document.getElementById('topics-list');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <span class="material-icons">error_outline</span>
                    <h3>Erro ao Carregar Fórum</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="forumPage.loadTopics()">
                        <span class="material-icons">refresh</span>
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }
}

// Inicializar página do fórum
let forumPage;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/forum' || window.location.pathname === '/forum.html') {
        forumPage = new ForumPage();
    }
});

