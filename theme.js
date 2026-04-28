// --- TEMA YÖNETİMİ ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

/**
 * Temayı günceller ve ikonu değiştirir
 */
function applyTheme(isLight) {
    if (isLight) {
        document.body.classList.add('light-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
}

// Buton Tıklama Olayı
themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // İkonu değiştir
    if (isLight) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
});

// Sayfa yüklendiğinde loadAllSettings fonksiyonuna veya sonuna ekle:
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    applyTheme(true);
}