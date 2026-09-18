document.addEventListener('DOMContentLoaded', () => {
    const widgetModal = document.getElementById('widget-modal');
    const widgetTrigger = document.getElementById('widget-trigger');
    const closeWidget = document.getElementById('close-widget');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    const GITHUB_USERNAME = document.querySelector('.continue-card')?.dataset.githubUser || 'SiberizmBey';
    const TODO_KEY = 'quick-todos';

    let weatherLoaded = false;
    let githubLoaded = false;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    // ---- PANELİ AÇMA / KAPAMA ----
    widgetTrigger.addEventListener('click', () => {
        widgetModal.classList.toggle('active');
        widgetModal.style.display = 'flex';
    });

    closeWidget.addEventListener('click', () => {
        widgetModal.classList.remove('active');
    });

    // ---- SEKME GEÇİŞİ ----
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');

            const pane = document.getElementById(`tab-${btn.dataset.tab}`);
            if (pane) pane.classList.add('active');

            if (btn.dataset.tab === 'weather' && !weatherLoaded) loadWeather();
            if (btn.dataset.tab === 'github' && !githubLoaded) loadGithubRepos();
        });
    });

    // ---- GÖREVLER (TODO) ----
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');

    function loadTodos() {
        try {
            return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveTodos(todos) {
        localStorage.setItem(TODO_KEY, JSON.stringify(todos));
    }

    function renderTodos() {
        const todos = loadTodos();
        todoList.innerHTML = '';

        if (todos.length === 0) {
            todoList.innerHTML = '<div class="todo-empty">Henüz görev yok. Yukarıdan ekleyebilirsin.</div>';
            return;
        }

        todos.forEach(todo => {
            const item = document.createElement('div');
            item.className = `todo-item ${todo.done ? 'done' : ''}`;

            const check = document.createElement('div');
            check.className = 'todo-check';
            check.innerHTML = '<i class="fa-solid fa-check"></i>';
            check.onclick = () => {
                todo.done = !todo.done;
                saveTodos(todos);
                renderTodos();
            };

            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = todo.text;

            const del = document.createElement('button');
            del.className = 'todo-delete';
            del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            del.onclick = () => {
                saveTodos(todos.filter(t => t.id !== todo.id));
                renderTodos();
            };

            item.appendChild(check);
            item.appendChild(text);
            item.appendChild(del);
            todoList.appendChild(item);
        });
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;

        const todos = loadTodos();
        todos.unshift({ id: Date.now(), text, done: false });
        saveTodos(todos);
        todoInput.value = '';
        renderTodos();
    }

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    renderTodos();

    // ---- HAVA DURUMU ----
    const weatherCodes = {
        0: ['Açık', 'fa-sun'], 1: ['Az Bulutlu', 'fa-cloud-sun'], 2: ['Parçalı Bulutlu', 'fa-cloud-sun'],
        3: ['Kapalı', 'fa-cloud'], 45: ['Sisli', 'fa-smog'], 48: ['Kırağı Sisi', 'fa-smog'],
        51: ['Çisenti', 'fa-cloud-rain'], 53: ['Çisenti', 'fa-cloud-rain'], 55: ['Yoğun Çisenti', 'fa-cloud-rain'],
        61: ['Hafif Yağmur', 'fa-cloud-showers-heavy'], 63: ['Yağmurlu', 'fa-cloud-showers-heavy'], 65: ['Şiddetli Yağmur', 'fa-cloud-showers-heavy'],
        71: ['Hafif Kar', 'fa-snowflake'], 73: ['Karlı', 'fa-snowflake'], 75: ['Yoğun Kar', 'fa-snowflake'],
        80: ['Sağanak', 'fa-cloud-showers-heavy'], 81: ['Sağanak', 'fa-cloud-showers-heavy'], 82: ['Şiddetli Sağanak', 'fa-cloud-showers-heavy'],
        95: ['Gök Gürültülü', 'fa-cloud-bolt'], 96: ['Dolu ile Fırtına', 'fa-cloud-bolt'], 99: ['Şiddetli Fırtına', 'fa-cloud-bolt']
    };

    async function fetchWeather(lat, lon) {
        const cityEl = document.getElementById('w-city');
        const tempEl = document.getElementById('w-temp');
        const descEl = document.getElementById('w-desc');
        const iconEl = document.querySelector('.w-icon');

        try {
            const [weatherRes, geoRes] = await Promise.all([
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`),
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`)
            ]);
            const weather = await weatherRes.json();
            const geo = await geoRes.json();

            const current = weather.current_weather;
            const info = weatherCodes[current.weathercode] || ['Bilinmiyor', 'fa-cloud-sun'];

            cityEl.textContent = geo.city || geo.locality || 'Konumun';
            tempEl.textContent = `${Math.round(current.temperature)}°C`;
            descEl.textContent = info[0];
            if (iconEl) iconEl.className = `fa-solid ${info[1]} w-icon`;
            weatherLoaded = true;
        } catch (err) {
            descEl.textContent = 'Hava durumu alınamadı';
        }
    }

    function loadWeather() {
        const descEl = document.getElementById('w-desc');
        descEl.textContent = 'Yükleniyor...';

        const sivasFallback = () => fetchWeather(39.7477, 37.0179);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                sivasFallback,
                { timeout: 5000 }
            );
        } else {
            sivasFallback();
        }
    }

    // ---- GITHUB PROJELERİ ----
    const langColors = {
        JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', HTML: '#e34c26',
        CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
        PHP: '#4F5D95', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', Shell: '#89e051',
        Vue: '#41b883', Kotlin: '#A97BFF', Dart: '#00B4AB'
    };

    function timeAgo(dateStr) {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        const units = [[31536000, 'yıl'], [2592000, 'ay'], [86400, 'gün'], [3600, 'saat'], [60, 'dakika']];
        for (const [sec, label] of units) {
            const val = Math.floor(diff / sec);
            if (val >= 1) return `${val} ${label} önce`;
        }
        return 'az önce';
    }

    async function loadGithubRepos() {
        const container = document.getElementById('tab-github');
        container.innerHTML = '<div class="gh-loading">Repolar yükleniyor...</div>';

        try {
            const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=8`);
            const repos = await res.json();

            if (!Array.isArray(repos) || repos.length === 0) {
                container.innerHTML = '<div class="gh-empty">Repo bulunamadı.</div>';
                return;
            }

            const list = document.createElement('div');
            list.className = 'gh-list';

            repos.forEach(repo => {
                const item = document.createElement('a');
                item.className = 'gh-item';
                item.href = repo.html_url;
                item.target = '_blank';
                item.rel = 'noopener noreferrer';

                const color = langColors[repo.language] || '#888';

                item.innerHTML = `
                    <div class="gh-item-top">
                        <span class="gh-name">${escapeHtml(repo.name)}</span>
                        <span class="gh-star"><i class="fa-solid fa-star"></i> ${repo.stargazers_count}</span>
                    </div>
                    ${repo.description ? `<div class="gh-desc">${escapeHtml(repo.description)}</div>` : ''}
                    <div class="gh-meta">
                        ${repo.language ? `<span class="gh-lang-dot" style="background:${color}"></span><span>${escapeHtml(repo.language)}</span>` : ''}
                        <span>· güncellendi ${timeAgo(repo.pushed_at)}</span>
                    </div>
                `;
                list.appendChild(item);
            });

            container.innerHTML = '';
            container.appendChild(list);
            githubLoaded = true;
        } catch (err) {
            container.innerHTML = '<div class="gh-empty">Repolar yüklenemedi.</div>';
        }
    }
});
