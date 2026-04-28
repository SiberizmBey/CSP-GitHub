const engines = {
    'g!': { name: 'Google', url: 'https://www.google.com/search', icon: 'https://www.google.com/favicon.ico' },
    'd!': { name: 'DuckDuckGo', url: 'https://duckduckgo.com/', icon: 'https://duckduckgo.com/favicon.ico' },
    'y!': { name: 'Yandex', url: 'https://yandex.com.tr/search/', icon: 'https://yandex.com.tr/favicon.ico' },
    'b!': { name: 'Bing', url: 'https://www.bing.com/search', icon: 'https://www.bing.com/favicon.ico' }
};

const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const engineIcon = document.getElementById('search-engine-icon');

// Arama motorunu ve ikonu güncelleyen fonksiyon
function updateSearchEngine(engineKey) {
    const engine = engines[engineKey];
    if (engine) {
        searchForm.action = engine.url;
        engineIcon.src = engine.icon;
        // Ayarlar kaydediliyorsa localStorage'a da atılabilir
        return true;
    }
    return false;
}

// Smart Search Takibi
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim().toLowerCase();
    const prefix = value.substring(0, 2); // İlk iki karakteri al (g!, d! vb.)

    if (engines[prefix]) {
        updateSearchEngine(prefix);
        // Yazılan prefix'i temizle ki kullanıcı sadece arayacağı kelimeyi yazmaya devam etsin
        e.target.value = value.substring(2).trim();
    }
});

// Form gönderilirken boş prefix kontrolü (Opsiyonel)
searchForm.addEventListener('submit', (e) => {
    if (searchInput.value.trim() === "") {
        e.preventDefault();
    }
});