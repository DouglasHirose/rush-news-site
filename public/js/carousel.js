class NewsCarousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.autoSlideInterval = null;
    this.isLoading = false;

    console.log('🎠 NewsCarousel: Inicializando...');
    this.init();
  }

  async init() {
    try {
      await this.loadCarouselNews();
      this.setupKeyboardNavigation();
    } catch (err) {
      console.error('💥 Erro ao inicializar carrossel:', err);
      this.showError();
    }
  }

  async loadCarouselNews() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const res = await fetch('/api/news?featured=true&limit=5');
      const data = await res.json();

      if (data.success && Array.isArray(data.data) && data.data.length) {
        this.slides = data.data;
        this.renderCarousel(); // render + controles + autoplay
      } else {
        this.showEmptyState();
      }
    } catch (err) {
      console.error('❌ Erro ao buscar dados do carrossel:', err);
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
        ${this.slides.map((slide, i) => `
          <div class="carousel-slide${i === 0 ? ' active' : ''}" data-slide="${i}">
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
    `;

    this.setupCarouselControls();
    this.startAutoSlide();
  }

  setupCarouselControls() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.pauseAutoSlide();
        this.prevSlide();
        this.startAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.pauseAutoSlide();
        this.nextSlide();
        this.startAutoSlide();
      });
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.pauseAutoSlide();
        this.prevSlide();
        this.startAutoSlide();
      }

      if (e.key === 'ArrowRight') {
        this.pauseAutoSlide();
        this.nextSlide();
        this.startAutoSlide();
      }
    });
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    const current = document.querySelector('.carousel-slide.active');
    const target = document.querySelector(`.carousel-slide[data-slide="${index}"]`);

    if (current) current.classList.remove('active');
    if (target) target.classList.add('active');

    this.currentSlide = index;
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  startAutoSlide() {
    this.pauseAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
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
          <p>Adicione notícias em destaque para exibir no carrossel.</p>
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
          <p>Não foi possível carregar as notícias do carrossel.</p>
        </div>
      `;
    }
  }
}
