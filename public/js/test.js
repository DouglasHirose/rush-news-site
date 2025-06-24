console.log('Teste: arquivo carregado');

class TestHomePage {
    constructor() {
        console.log('TestHomePage criada');
        this.loadNews();
    }
    
    async loadNews() {
        try {
            const response = await fetch('/api/news');
            const data = await response.json();
            console.log('Notícias carregadas:', data);
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM pronto, inicializando TestHomePage');
    const testPage = new TestHomePage();
});

