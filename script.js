document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('date-badge-trigger');
    const modal = document.getElementById('calendar-modal');
    const closeBtn = document.getElementById('close-cal');
    const saveBtn = document.getElementById('save-note');
    const deleteBtn = document.getElementById('delete-note');
    const grid = document.getElementById('calendar-days');
    const noteInput = document.getElementById('note-input');
    const colorInput = document.getElementById('color-input');

    let viewDate = new Date();
    let selectedKey = null;

    function hexToRgba(hex, alpha = 0.05) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6];
        }
        return `rgba(${+r}, ${+g}, ${+b}, ${alpha})`;
    }

    function safeCloseModal() {
        modal.classList.add('modal-closing');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('modal-closing');
        }, 300);
    }

    function updateMainBadge() {
        const now = new Date();
        const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        const data = localStorage.getItem(key);
        const badge = document.getElementById('date-badge-trigger');
        const statusText = document.getElementById('episode-status');
        
        document.getElementById('current-day').innerText = now.getDate();
        const months = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];
        document.getElementById('current-month').innerText = months[now.getMonth()];

        if (data) {
            const parsed = JSON.parse(data);
            statusText.innerText = parsed.text.toUpperCase();
            badge.style.backgroundColor = hexToRgba(parsed.color, 0.1);
            badge.style.border = `1px solid ${parsed.color}`;
        } else {
            // BURASI SIFIRLAMA KISMI - Not silindiğinde burası çalışır
            statusText.innerText = "PLAN TAKVİMİ";
            badge.style.backgroundColor = ""; // Inline stili temizle, CSS'deki orjinal haline dönsün
            badge.style.border = "";          // Inline stili temizle
            // Eğer CSS'den gelmiyorsa manuel renk ver:
            // badge.style.backgroundColor = "var(--secondary-bg)";
            // badge.style.border = "1px solid var(--border)";
        }
    }

    function renderCalendar() {
        grid.innerHTML = '';
        const y = viewDate.getFullYear();
        const m = viewDate.getMonth();
        const monthFull = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        document.getElementById('month-display').innerText = `${monthFull[m]} ${y}`;

        const first = new Date(y, m, 1).getDay();
        const days = new Date(y, m + 1, 0).getDate();
        const offset = first === 0 ? 6 : first - 1;

        for (let i = 0; i < offset; i++) grid.innerHTML += `<div></div>`;

        for (let d = 1; d <= days; d++) {
            const key = `${y}-${m}-${d}`;
            const dayDiv = document.createElement('div');
            dayDiv.className = `calendar-day ${localStorage.getItem(key) ? 'has-note' : ''}`;
            dayDiv.innerText = d;
            
            dayDiv.style.animation = `fadeInUp 0.3s ease forwards ${d * 0.02}s`;
            dayDiv.style.opacity = '0';

            dayDiv.onclick = () => {
                selectedKey = key;
                document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                dayDiv.classList.add('selected');
                const existing = localStorage.getItem(key);
                if (existing) {
                    const dParsed = JSON.parse(existing);
                    noteInput.value = dParsed.text;
                    colorInput.value = dParsed.color;
                } else {
                    noteInput.value = "";
                }
            };
            grid.appendChild(dayDiv);
        }
    }

    if (trigger) {
        trigger.onclick = () => {
            modal.style.display = 'flex';
            renderCalendar();
        };
    }

    if (closeBtn) closeBtn.onclick = safeCloseModal;

    window.onclick = (e) => {
        if (e.target == modal) safeCloseModal();
    };

    if (saveBtn) {
        saveBtn.onclick = () => {
            if (!selectedKey) return;
            const txt = noteInput.value.trim();
            if (txt) {
                localStorage.setItem(selectedKey, JSON.stringify({text: txt, color: colorInput.value}));
                updateMainBadge();
                safeCloseModal();
            }
        };
    }

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (selectedKey) {
                localStorage.removeItem(selectedKey);
                renderCalendar();  // Takvimdeki alt çizgiyi kaldırır
                updateMainBadge(); // Badge'i "YENİ BÖLÜM"e ve eski rengine döndürür
                noteInput.value = "";
            }
        };
    }

    document.getElementById('prev-month').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
    document.getElementById('next-month').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

    updateMainBadge();
});