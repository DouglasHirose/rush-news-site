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
