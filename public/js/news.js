// ===== PÁGINA DE NOTÍCIA INDIVIDUAL =====
class NewsPage {
    constructor() {
        this.newsId = this.getNewsIdFromUrl();
        this.news = null;
        this.comments = [];
        
        this.init();
    }
    
    getNewsIdFromUrl() {
        const path = window.location.pathname;
        const matches = path.match(/\/news\/(\d+)/);
        return matches ? parseInt(matches[1]) : null;
    }
    
    async init() {
        if (!this.newsId) {
            this.showError('ID da notícia não encontrado');
            return;
        }
        
        try {
            await this.loadNews();
            await this.loadComments();
            this.setupEventListeners();
            await this.loadRelatedNews();
        } catch (error) {
            console.error('Erro ao inicializar página de notícia:', error);
            this.showError('Erro ao carregar a notícia');
        }
    }
    
    async loadNews() {
        try {
            const response = await fetch(`/api/news/${this.newsId}`);
            const data = await response.json();
            
            if (data.success) {
                this.news = data.data;
                this.renderNews();
                this.updatePageTitle();
                this.incrementViews();
            } else {
                throw new Error(data.message || 'Notícia não encontrada');
            }
        } catch (error) {
            console.error('Erro ao carregar notícia:', error);
            this.showError('Notícia não encontrada');
        }
    }
    
    renderNews() {
        const container = document.getElementById('news-article');
        if (!container || !this.news) return;
        
        container.innerHTML = `
            <div class="container">
                <div class="news-header">
                    <div class="news-breadcrumb">
                        <a href="/">Início</a>
                        <span class="material-icons">chevron_right</span>
                        <a href="/news">Notícias</a>
                        <span class="material-icons">chevron_right</span>
                        <span>${this.news.category}</span>
                    </div>
                    
                    <div class="news-category">
                        <span class="category-tag">${this.news.category}</span>
                    </div>
                    
                    <h1 class="news-title">${this.news.title}</h1>
                    
                    <div class="news-meta">
                        <div class="meta-item">
                            <span class="material-icons">person</span>
                            <span>Por ${this.news.author}</span>
                        </div>
                        <div class="meta-item">
                            <span class="material-icons">schedule</span>
                            <span>${utils.formatDate(this.news.createdAt)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="material-icons">visibility</span>
                            <span>${this.news.views} visualizações</span>
                        </div>
                        <div class="meta-item">
                            <span class="material-icons">comment</span>
                            <span>${this.news._count?.comments || 0} comentários</span>
                        </div>
                    </div>
                </div>
                
                ${this.news.imageUrl ? `
                    <div class="news-image">
                        <img src="${this.news.imageUrl}" alt="${this.news.title}" loading="lazy">
                    </div>
                ` : ''}
                
                <div class="news-content">
                    <div class="news-summary">
                        <p><strong>${this.news.summary}</strong></p>
                    </div>
                    
                    <div class="news-body">
                        ${this.formatNewsContent(this.news.content)}
                    </div>
                </div>
                
                <div class="news-footer">
                    <div class="news-tags">
                        <span class="material-icons">local_offer</span>
                        <span class="tag">${this.news.category}</span>
                    </div>
                    
                    <div class="news-share">
                        <span>Compartilhar:</span>
                        <button data-share="twitter" class="share-btn">Twitter</button>
                        <button data-share="facebook" class="share-btn">Facebook</button>
                        <button data-share="link" class="share-btn">Copiar Link</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    formatNewsContent(content) {
        // Converter quebras de linha em parágrafos
        return content
            .split('\n\n')
            .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }
    
    updatePageTitle() {
        if (this.news) {
            document.title = `${this.news.title} - RUSH News`;
            
            // Atualizar meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = this.news.summary;
            }
        }
    }
    
    async incrementViews() {
        try {
            await fetch(`/api/news/${this.newsId}/view`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Erro ao incrementar visualizações:', error);
        }
    }
    
    async loadComments() {
        try {
            const response = await fetch(`/api/news/${this.newsId}/comments`);
            const data = await response.json();
            
            if (data.success) {
                this.comments = data.data;
                this.renderComments();
            }
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
        }
    }
    
    renderComments() {
        const container = document.getElementById('comments-list');
        if (!container) return;
        
        if (this.comments.length === 0) {
            container.innerHTML = `
                <div class="empty-comments">
                    <span class="material-icons">chat_bubble_outline</span>
                    <p>Seja o primeiro a comentar!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.comments.map(comment => `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">
                        <span class="material-icons">account_circle</span>
                        <strong>${comment.author}</strong>
                    </div>
                    <div class="comment-date">
                        ${utils.formatDate(comment.createdAt)}
                    </div>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
                <div class="comment-actions">
                    <button class="btn-edit-comment" data-action="edit" data-id="${comment.id}">
                        <span class="material-icons">edit</span> Editar
                    </button>
                    <button class="btn-delete-comment" data-action="delete" data-id="${comment.id}">
                        <span class="material-icons">delete</span> Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        }
    }
    
    async handleCommentSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const commentData = {
            author: formData.get('author'),
            content: formData.get('content'),
            newsId: this.newsId
        };
        
        try {
            const response = await fetch(`/api/news/${this.newsId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                utils.showMessage('Comentário enviado com sucesso!', 'success');
                e.target.reset();
                await this.loadComments();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            utils.showMessage('Erro ao enviar comentário', 'error');
        }
    }
    
    async loadRelatedNews() {
        try {
            const response = await fetch(`/api/news?category=${encodeURIComponent(this.news.category)}&limit=3&exclude=${this.newsId}`);
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                this.renderRelatedNews(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar notícias relacionadas:', error);
        }
    }
    
    renderRelatedNews(relatedNews) {
        const container = document.getElementById('related-news');
        if (!container) return;
        
        container.innerHTML = relatedNews.map(news => `
            <div class="related-item">
                <a href="/news/${news.id}" class="related-link">
                    ${news.imageUrl ? `
                        <div class="related-image">
                            <img src="${news.imageUrl}" alt="${news.title}" loading="lazy">
                        </div>
                    ` : ''}
                    <div class="related-content">
                        <div class="related-category">${news.category}</div>
                        <h3 class="related-title">${news.title}</h3>
                        <div class="related-meta">
                            <span>${utils.formatDate(news.createdAt)}</span>
                            <span>${news.views} visualizações</span>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    }
    
    shareNews(platform) {
        const url = window.location.href;
        const title = this.news.title;
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
    
    async copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            utils.showMessage('Link copiado para a área de transferência!', 'success');
        } catch (error) {
            console.error('Erro ao copiar link:', error);
            utils.showMessage('Erro ao copiar link', 'error');
        }
    }
    
    async editComment(commentId) {
        // Implementar edição de comentário
        utils.showMessage('Funcionalidade de edição em desenvolvimento', 'info');
    }
    
    async deleteComment(commentId) {
        if (!confirm('Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/news/${this.newsId}/comments/${commentId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                utils.showMessage('Comentário excluído com sucesso!', 'success');
                // Remover o comentário da interface
                const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
                if (commentItem) {
                    commentItem.remove();
                }
                // Recarregar os comentários
                await this.loadComments();
            } else {
                throw new Error(data.message || 'Erro ao excluir comentário');
            }
        } catch (error) {
            console.error('Erro ao excluir comentário:', error);
            utils.showMessage('Erro ao excluir comentário', 'error');
        }
    }
    
    showError(message) {
        const container = document.getElementById('news-article');
        if (container) {
            container.innerHTML = `
                <div class="container">
                    <div class="error-state">
                        <span class="material-icons">error_outline</span>
                        <h2>Erro ao Carregar Notícia</h2>
                        <p>${message}</p>
                        <a href="/" class="btn btn-primary">
                            <span class="material-icons">home</span>
                            Voltar ao Início
                        </a>
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar página de notícia
let newsPage;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('/news/')) {
        newsPage = new NewsPage();
    }
});
document.getElementById('news-article')?.addEventListener('click', (e) => {
    const shareBtn = e.target.closest('[data-share]');
    const copyBtn = e.target.closest('[data-copy]');
    const commentBtn = e.target.closest('[data-action]');

    if (shareBtn) this.shareNews(shareBtn.dataset.share);
    if (copyBtn) this.copyLink();
    if (commentBtn) {
        const id = parseInt(commentBtn.dataset.id);
        const action = commentBtn.dataset.action;
        if (action === 'delete') this.deleteComment(id);
        if (action === 'edit') this.editComment(id);
    }
});

