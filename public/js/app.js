console.log('🚀 RUSH News - Iniciando aplicação unificada...');

const API_BASE_URL = '/api';

const utils = {
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  truncateText(text, maxLength) {
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
  },

  showMessage(message, type = 'info') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(div, container.firstChild);

    setTimeout(() => div.remove(), 5000);
  }
};

// ========== Carrossel ==========
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
    showSlide((currentIndex + 1) % slides.length);
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

  initCarousel();
}

// ========== Página Inicial ==========
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
      await this.loadFeaturedNews();
      await this.loadLatestNews();
      await this.loadForumDiscussions();
      console.log('✅ HomePage: Tudo pronto!');
    } catch (err) {
      console.error('❌ HomePage: Erro ao inicializar:', err);
    }
  }

async loadFeaturedNews() {
  try {
    const response = await fetch(`${API_BASE_URL}/news?featured=true&limit=3`);
    const data = await response.json();

    if (data.success && data.data?.length) {
      this.renderFeaturedNews(data.data);
      renderCarousel(data.data); // <- Garante que o carrossel seja preenchido
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
      const params = new URLSearchParams({ page, limit: 6 });
      if (category) params.append('category', category);

      const res = await fetch(`${API_BASE_URL}/news?${params}`);
      const json = await res.json();
      if (json.success) this.renderLatestNews(json.data, page === 1);
    } catch (err) {
      console.error('❌ Erro ao carregar últimas notícias:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async loadForumDiscussions() {
    try {
      const res = await fetch(`${API_BASE_URL}/forum/topics?limit=5`);
      const json = await res.json();
      if (json.success) this.renderForumDiscussions(json.data);
    } catch (err) {
      console.error('❌ Erro ao carregar discussões do fórum:', err);
    }
  }

  renderFeaturedNews(news) {
    const container = document.querySelector('#featured-news') || document.querySelector('.featured-news-list');
    if (!container) return;
    container.innerHTML = news.map(item => `
      <article class="featured-news-item">
        <div class="news-image">
          <img src="${item.imageUrl || '/img/default-news.jpg'}" alt="${item.title}" onerror="this.src='/img/default-news.jpg'">
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
  }

  renderLatestNews(news, replace = true) {
    const container = document.querySelector('#latest-news') || document.querySelector('.latest-news-list');
    if (!container) return;

    const html = news.map(item => `
      <article class="news-card">
        <div class="news-image">
          <img src="${item.imageUrl || '/img/default-news.jpg'}" alt="${item.title}" onerror="this.src='/img/default-news.jpg'">
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

    container.innerHTML = replace ? html : container.innerHTML + html;
  }

  renderForumDiscussions(topics) {
    const container = document.querySelector('#forum-topics') || document.querySelector('.forum-discussions');
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
    const container = document.querySelector('#featured-news') || document.querySelector('.featured-news-list');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons">info</span>
          <p>Nenhuma notícia em destaque para exibir.</p>
        </div>
      `;
    }
  }
}

async function deleteNews(newsId) {
  if (!confirm('Tem certeza que deseja apagar esta notícia?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
      method: 'DELETE'
    });
    const data = await response.json();

    if (data.success) {
      utils.showMessage('Notícia apagada com sucesso!', 'success');
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

// ========== Inicialização ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 DOM carregado, inicializando RUSH News...');
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    try {
      window.homePage = new HomePage();
    } catch (error) {
      console.error('💥 Erro ao inicializar HomePage:', error);
    }
  }

  const manageCarouselBtn = document.getElementById('manage-carousel-btn');
  if (manageCarouselBtn) {
    manageCarouselBtn.addEventListener('click', () => {
      window.location.href = '/admin-carousel.html';
    });
  }

  const createNewsBtn = document.getElementById('btn-create-news-page');
  if (createNewsBtn) {
    createNewsBtn.addEventListener('click', () => {
      window.location.href = '/create-news.html';
    });
  }

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn && window.homePage) {
    loadMoreBtn.addEventListener('click', () => {
      window.homePage.currentPage++;
      window.homePage.loadLatestNews(window.homePage.currentPage, window.homePage.currentCategory);
    });
  }
});
