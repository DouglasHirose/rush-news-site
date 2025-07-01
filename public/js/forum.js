class ForumPage {
    constructor() {
        this.currentPage = 1;
        this.currentCategory = '';
        this.currentSort = 'recent';
        this.topics = [];
        this.isLoading = false;
        this.dom = this.cacheDOMElements();
        this.editingTopicId = null;
        this.init();
    }

    cacheDOMElements() {
        return {
            container: document.getElementById('topics-list'),
            pagination: document.getElementById('pagination'),
            modal: document.getElementById('create-topic-modal'),
            form: document.getElementById('create-topic-form'),
            searchInput: document.getElementById('search-topics'),
            categoryFilter: document.getElementById('category-filter'),
            sortFilter: document.getElementById('sort-filter'),
            createBtn: document.getElementById('create-topic-btn'),
            closeBtn: document.getElementById('close-modal'),
            cancelBtn: document.getElementById('cancel-topic'),
        };
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
            const params = new URLSearchParams({ page, limit: 10, sort });
            if (category) params.append('category', category);
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
        const { container } = this.dom;
        if (!container) return;

        if (!this.topics.length) {
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
                        <h3><a href="/forum/${topic.id}">${topic.title}</a></h3>
                        <span class="topic-category">${topic.category}</span>
                    </div>
                    <p>${topic.description}</p>
                    <div class="topic-meta">
                        <span><i class="material-icons">person</i> ${topic.author}</span>
                        <span><i class="material-icons">schedule</i> ${utils.formatDate(topic.createdAt)}</span>
                        <span><i class="material-icons">comment</i> ${topic._count?.posts || 0} respostas</span>
                        <span><i class="material-icons">visibility</i> ${topic.views || 0} visualizações</span>
                        <div>
                            <button class="btn-edit-topic" data-id="${topic.id}" title="Editar">
                                <i class="material-icons">edit</i>
                            </button>
                            <button class="btn-delete-topic" data-id="${topic.id}" title="Excluir">
                                <i class="material-icons">delete</i>
                            </button>
                        </div>
                    </div>
                </div>
                <a href="/forum/${topic.id}" class="btn btn-small btn-primary">
                    <i class="material-icons">open_in_new</i> Ver Tópico
                </a>
            </div>
        `).join('');
    }

        async deleteTopic(topicId) {
        if (!confirm('Tem certeza que deseja excluir este tópico?')) return;

        try {
            const res = await fetch(`/api/forum/${topicId}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                utils.showMessage('Tópico excluído com sucesso!', 'success');
                await this.loadTopics(this.currentPage, this.currentCategory, this.currentSort);
            } else {
                throw new Error(data.message || 'Erro desconhecido');
            }
        } catch (error) {
            console.error('Erro ao excluir tópico:', error);
            utils.showMessage('Erro ao excluir tópico', 'error');
        }
    }

    renderPagination({ currentPage, totalPages, hasNext, hasPrev }) {
        const { pagination } = this.dom;
        if (!pagination || totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = `<div class="pagination-controls">`;

        if (hasPrev) {
            html += `<button onclick="forumPage.goToPage(${currentPage - 1})">
                        <i class="material-icons">chevron_left</i> Anterior
                     </button>`;
        }

        html += '<div class="pagination-numbers">';
        for (let i = 1; i <= totalPages; i++) {
            html += (i === currentPage)
                ? `<span class="pagination-number active">${i}</span>`
                : `<button onclick="forumPage.goToPage(${i})">${i}</button>`;
        }
        html += '</div>';

        if (hasNext) {
            html += `<button onclick="forumPage.goToPage(${currentPage + 1})">
                        Próximo <i class="material-icons">chevron_right</i>
                     </button>`;
        }

        html += '</div>';
        pagination.innerHTML = html;
    }

    setupEventListeners() {
        const { createBtn, closeBtn, cancelBtn, modal, form, searchInput, categoryFilter, sortFilter } = this.dom;

        createBtn?.addEventListener('click', () => this.openCreateModal());
        closeBtn?.addEventListener('click', () => this.closeCreateModal());
        cancelBtn?.addEventListener('click', () => this.closeCreateModal());
        modal?.addEventListener('click', e => { if (e.target === modal) this.closeCreateModal(); });
        form?.addEventListener('submit', e => this.handleFormSubmit(e));
        searchInput?.addEventListener('input', debounce(() => this.handleSearch(), 500));
        categoryFilter?.addEventListener('change', () => this.handleCategoryFilter());
        sortFilter?.addEventListener('change', () => this.handleSortFilter());

        this.dom.container.addEventListener('click', (e) => {
            const target = e.target.closest('button');

            if (!target) return;

            const topicId = target.getAttribute('data-id');

            if (target.classList.contains('btn-edit-topic')) {
                this.editTopic(topicId);
            }

            if (target.classList.contains('btn-delete-topic')) {
                this.deleteTopic(topicId);
        }
});

    }

openCreateModal(topic = null) {
    const { modal, form } = this.dom;

    if (topic) {
        // Modo Edição
        this.editingTopicId = topic.id;
        form.title.value = topic.title;
        form.category.value = topic.category;
        form.description.value = topic.description;
        form.content.value = topic.content;
        form.author.value = topic.author;

        form.querySelector('button[type="submit"]').innerHTML = `
            <span class="material-icons">save</span>
            Salvar Alterações
        `;
    } else {
        // Modo Criação
        this.editingTopicId = null;
        form.reset();
        form.querySelector('button[type="submit"]').innerHTML = `
            <span class="material-icons">send</span>
            Criar Tópico
        `;
    }

    modal.style.display = 'flex';
}


    closeCreateModal() {
        const { modal, form } = this.dom;
        modal.style.display = 'none';
        form?.reset();
    }

async handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const topicData = Object.fromEntries(formData.entries());
    const url = this.editingTopicId ? `/api/forum/${this.editingTopicId}` : '/api/forum';
    const method = this.editingTopicId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topicData)
        });

        const data = await res.json();

        if (data.success) {
            utils.showMessage(`Tópico ${this.editingTopicId ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            this.closeCreateModal();
            await this.loadTopics();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Erro no envio do formulário:', error);
        utils.showMessage(`Erro ao ${this.editingTopicId ? 'editar' : 'criar'} tópico`, 'error');
    }
}

    handleSearch() {
        const value = this.dom.searchInput?.value;
        if (value) console.log('Buscar por:', value);
    }

    handleCategoryFilter() {
        this.currentCategory = this.dom.categoryFilter?.value || '';
        this.currentPage = 1;
        this.loadTopics(1, this.currentCategory, this.currentSort);
    }

    handleSortFilter() {
        this.currentSort = this.dom.sortFilter?.value || 'recent';
        this.currentPage = 1;
        this.loadTopics(1, this.currentCategory, this.currentSort);
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadTopics(page, this.currentCategory, this.currentSort);
    }

async editTopic(topicId) {
    try {
        const res = await fetch(`/api/forum/${topicId}`);
        const data = await res.json();

        if (data.success) {
            this.openCreateModal(data.data);
        } else {
            utils.showMessage('Tópico não encontrado', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar tópico para edição:', error);
        utils.showMessage('Erro ao carregar tópico', 'error');
    }
}


    async deleteTopic(topicId) {
        if (!confirm('Tem certeza que deseja excluir este tópico?')) return;

        try {
            const res = await fetch(`/api/forum/${topicId}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                utils.showMessage('Tópico excluído com sucesso!', 'success');
                await this.loadTopics();
            } else throw new Error(data.message);
        } catch (error) {
            console.error('Erro ao excluir tópico:', error);
            utils.showMessage('Erro ao excluir tópico', 'error');
        }
    }

    showError(message) {
        this.dom.container.innerHTML = `
            <div class="error-state">
                <span class="material-icons">error_outline</span>
                <h3>Erro ao Carregar Fórum</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="forumPage.loadTopics()">
                    <i class="material-icons">refresh</i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

function debounce(func, wait = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/forum' || window.location.pathname === '/forum.html') {
        forumPage = new ForumPage();
    }
});
