document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SEÇİCİLERİ ---
    const shortcutsGrid = document.getElementById('shortcuts-grid');
    const addShortcutBtn = document.getElementById('add-shortcut-btn');
    const shortcutModal = document.getElementById('shortcut-modal');
    const closeShortcutModal = document.getElementById('close-shortcut-modal');
    const saveShortcutBtn = document.getElementById('save-shortcut');
    const shortcutNameInput = document.getElementById('shortcut-name');
    const shortcutUrlInput = document.getElementById('shortcut-url');
    const shortcutIconInput = document.getElementById('shortcut-icon');

    const SHORTCUTS_STORAGE_KEY = 'shortcuts_data';

    // --- FONKSİYONLAR ---

    // Favicon URL'sini al
    function getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) {
            return null;
        }
    }

    // Kısayolları localStorage'dan yükle
    function loadShortcuts() {
        const shortcuts = JSON.parse(localStorage.getItem(SHORTCUTS_STORAGE_KEY)) || [];
        return shortcuts;
    }

    // Kısayolları localStorage'a kaydet
    function saveShortcuts(shortcuts) {
        localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
    }

    // Kısayol kartı oluştur
    function createShortcutCard(shortcut) {
        const card = document.createElement('a');
        card.href = shortcut.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'shortcut-card';
        card.title = shortcut.name;
        card.draggable = true;
        card.dataset.shortcutId = shortcut.id;

        const iconDiv = document.createElement('div');
        iconDiv.className = 'shortcut-icon';

        // İkon görüntüsü
        if (shortcut.icon && shortcut.icon.startsWith('fa-')) {
            // Font Awesome ikonu
            const iconEl = document.createElement('i');
            iconEl.className = `fa-solid ${shortcut.icon}`;
            iconDiv.appendChild(iconEl);
        } else if (shortcut.faviconUrl) {
            // Favicon
            const img = document.createElement('img');
            img.src = shortcut.faviconUrl;
            img.alt = shortcut.name;
            img.onerror = () => {
                img.style.display = 'none';
                const fallbackIcon = document.createElement('i');
                fallbackIcon.className = 'fa-solid fa-globe';
                iconDiv.appendChild(fallbackIcon);
            };
            iconDiv.appendChild(img);
        } else {
            // Varsayılan ikon
            const defaultIcon = document.createElement('i');
            defaultIcon.className = 'fa-solid fa-link';
            iconDiv.appendChild(defaultIcon);
        }

        const nameEl = document.createElement('div');
        nameEl.className = 'shortcut-name';
        nameEl.textContent = shortcut.name;

        // Silme düğmesi
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'shortcut-delete';
        deleteBtn.innerHTML = '<i class="fa-solid fa-x"></i>';
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            deleteShortcut(shortcut.id);
        };

        // Drag event listeners
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            card.classList.add('dragging');
            e.dataTransfer.setData('text/html', card.innerHTML);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (e.target !== card && e.target.closest('.shortcut-card')) {
                e.target.closest('.shortcut-card').classList.add('drag-over');
            }
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            
            const allCards = Array.from(shortcutsGrid.querySelectorAll('.shortcut-card'));
            const draggedCard = shortcutsGrid.querySelector('.dragging');
            
            if (draggedCard && draggedCard !== card) {
                const draggedIndex = allCards.indexOf(draggedCard);
                const targetIndex = allCards.indexOf(card);
                
                const shortcuts = loadShortcuts();
                const draggedShortcut = shortcuts[draggedIndex];
                
                // Sırayı değiştir
                shortcuts.splice(draggedIndex, 1);
                shortcuts.splice(targetIndex, 0, draggedShortcut);
                
                saveShortcuts(shortcuts);
                displayShortcuts();
            }
        });

        card.appendChild(iconDiv);
        card.appendChild(nameEl);
        card.appendChild(deleteBtn);

        return card;
    }

    // Kısayolları sayfada göster
    function displayShortcuts() {
        shortcutsGrid.innerHTML = '';
        const shortcuts = loadShortcuts();

        shortcuts.forEach(shortcut => {
            const card = createShortcutCard(shortcut);
            shortcutsGrid.appendChild(card);
        });
    }

    // Kısayol ekle
    function addShortcut() {
        const name = shortcutNameInput.value.trim();
        const url = shortcutUrlInput.value.trim();
        const iconClass = shortcutIconInput.value.trim();

        if (!name || !url) {
            alert('Lütfen adı ve URL\'yi doldurunuz!');
            return;
        }

        // URL doğrulama
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            alert('Lütfen geçerli bir URL girin (http:// veya https:// ile başlamalı)');
            return;
        }

        const shortcut = {
            id: Date.now(),
            name: name,
            url: url,
            icon: iconClass || null,
            faviconUrl: !iconClass ? getFaviconUrl(url) : null
        };

        const shortcuts = loadShortcuts();
        shortcuts.push(shortcut);
        saveShortcuts(shortcuts);

        // Modalı kapat ve formu sıfırla
        closeModal();
        clearForm();
        displayShortcuts();
    }

    // Kısayol sil
    function deleteShortcut(id) {
        const shortcuts = loadShortcuts();
        const filteredShortcuts = shortcuts.filter(s => s.id !== id);
        saveShortcuts(filteredShortcuts);
        displayShortcuts();
    }

    // Formu sıfırla
    function clearForm() {
        shortcutNameInput.value = '';
        shortcutUrlInput.value = '';
        shortcutIconInput.value = '';
    }

    // Modalı aç
    function openModal() {
        shortcutModal.style.display = 'flex';
        shortcutNameInput.focus();
    }

    // Modalı kapat
    function closeModal() {
        shortcutModal.classList.add('modal-closing');
        setTimeout(() => {
            shortcutModal.style.display = 'none';
            shortcutModal.classList.remove('modal-closing');
        }, 300);
    }

    // --- EVENT LİSTENERS ---

    addShortcutBtn.addEventListener('click', openModal);
    closeShortcutModal.addEventListener('click', closeModal);
    saveShortcutBtn.addEventListener('click', addShortcut);

    // Modalın dışına tıklanırsa kapat
    shortcutModal.addEventListener('click', (e) => {
        if (e.target === shortcutModal) {
            closeModal();
        }
    });

    // Enter tuşu ile kaydet
    shortcutUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addShortcut();
        }
    });

    // Sayfayı yükledikten sonra kısayolları göster
    displayShortcuts();
});
