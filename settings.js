document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENT SEÇİCİLER ---
    const settingsModal = document.getElementById("settings-modal");
    const gearBtn = document.querySelector(".merch-btn");
    const closeSettingsBtn = document.getElementById("close-settings");
    const saveSettingsBtn = document.getElementById("save-settings");
    const resetWallpaperBtn = document.getElementById("reset-wallpaper");
    const heroSection = document.querySelector(".hero-section");
    const wallpaperInput = document.getElementById("wallpaper-url");
    const spreadCheckbox = document.getElementById("spread-wallpaper");

    // Arama Motoru Seçicileri
    const searchForm = document.querySelector(".search-container");
    const searchInput = document.getElementById("search-input");
    const engineSelect = document.getElementById("search-engine-select");
    const engineIcon = document.getElementById("search-engine-icon");

    const DEFAULT_WALLPAPER = "siberizmpp.png";

    // Arama Motoru Veritabanı
    const engineData = {
        "https://www.google.com/search": {
            icon: "https://www.google.com/favicon.ico",
            prefix: "g!",
        },
        "https://duckduckgo.com/": {
            icon: "https://duckduckgo.com/favicon.ico",
            prefix: "d!",
        },
        "https://search.yahoo.com/search": {
            icon: "https://www.yahoo.com/favicon.ico",
            prefix: "y!",
        },
        "https://www.bing.com/search": {
            icon: "https://www.bing.com/favicon.ico",
            prefix: "b!",
        },
        "https://yandex.com.tr/search/": {
            icon: "https://yandex.com.tr/favicon.ico",
            prefix: "ya!",
        },
    };

    const socialConfig = {
        yt: { iconInp: "yt-icon", urlInp: "yt-url", el: ".social-icon.yt" },
        dc: { iconInp: "dc-icon", urlInp: "dc-url", el: ".social-icon.dc" },
        gh: { iconInp: "gh-icon", urlInp: "gh-url", el: ".social-icon.gh" },
    };

    // --- TEMEL FONKSİYONLAR ---

    function updateBodyWallpaper(url, isSpread) {
        document.body.style.setProperty(
            "--bg-img",
            `url("${url || DEFAULT_WALLPAPER}")`,
        );
        if (isSpread) {
            document.body.classList.add("wallpaper-spread");
        } else {
            document.body.classList.remove("wallpaper-spread");
        }
    }

    /**
     * Arama motoru görselini ve form hedefini günceller
     */
    function updateEngineVisuals(url) {
        if (engineData[url]) {
            engineIcon.src = engineData[url].icon;
            searchForm.action = url;
            engineSelect.value = url;
        }
    }

    function loadAllSettings() {
        // 1. Sosyal Medya Yükleme
        const socialData = JSON.parse(localStorage.getItem("user-socials")) || {
            yt: { icon: "fa-brands fa-youtube", url: "https://youtube.com" },
            dc: { icon: "fa-brands fa-discord", url: "https://discord.com" },
            gh: { icon: "fa-brands fa-github", url: "https://github.com" },
        };

        Object.keys(socialConfig).forEach((key) => {
            const linkEl = document.querySelector(socialConfig[key].el);
            if (linkEl) {
                linkEl.href = socialData[key].url;
                linkEl.querySelector("i").className = socialData[key].icon;
                document.getElementById(socialConfig[key].iconInp).value =
                    socialData[key].icon;
                document.getElementById(socialConfig[key].urlInp).value =
                    socialData[key].url;
            }
        });

        // 2. Duvar Kağıdı Yükleme
        const savedWallpaper =
            localStorage.getItem("user-wallpaper") || DEFAULT_WALLPAPER;
        const isSpread = localStorage.getItem("wallpaper-spread") === "true";
        heroSection.style.background = `url("${savedWallpaper}") center/cover`;
        wallpaperInput.value = localStorage.getItem("user-wallpaper") || "";
        spreadCheckbox.checked = isSpread;
        updateBodyWallpaper(savedWallpaper, isSpread);

        // 3. Arama Motoru Yükleme
        const savedEngine =
            localStorage.getItem("preferredEngine") ||
            "https://www.google.com/search";
        updateEngineVisuals(savedEngine);
    }

    function closeSettingsModal() {
        settingsModal.classList.add("modal-closing");
        setTimeout(() => {
            settingsModal.style.display = "none";
            settingsModal.classList.remove("modal-closing");
        }, 300);
    }

    // --- EVENT LISTENERS ---

    // Smart Search (g!, y!, d! kontrolü)
    searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase().trim();
        for (const [url, data] of Object.entries(engineData)) {
            if (val.startsWith(data.prefix)) {
                updateEngineVisuals(url);
                localStorage.setItem("preferredEngine", url);
                e.target.value = val.replace(data.prefix, "").trim();
                break;
            }
        }
    });

    // Arama Motoru Select Değişimi
    engineSelect.addEventListener("change", (e) => {
        const newUrl = e.target.value;
        updateEngineVisuals(newUrl);
        localStorage.setItem("preferredEngine", newUrl);
    });

    saveSettingsBtn.onclick = () => {
        // Sosyal Medya Kayıt
        const newSocialData = {};
        Object.keys(socialConfig).forEach((key) => {
            newSocialData[key] = {
                icon:
                    document.getElementById(socialConfig[key].iconInp).value ||
                    "fa-solid fa-link",
                url:
                    document.getElementById(socialConfig[key].urlInp).value ||
                    "#",
            };
        });
        localStorage.setItem("user-socials", JSON.stringify(newSocialData));

        // Duvar Kağıdı Kayıt
        const wpUrl = wallpaperInput.value.trim();
        if (wpUrl) localStorage.setItem("user-wallpaper", wpUrl);
        else localStorage.removeItem("user-wallpaper");
        localStorage.setItem("wallpaper-spread", spreadCheckbox.checked);

        // Arama motoru zaten anlık kaydediliyor ama burada da garantiye alalım
        localStorage.setItem("preferredEngine", engineSelect.value);

        loadAllSettings();
        closeSettingsModal();
    };

    resetWallpaperBtn.onclick = () => {
        wallpaperInput.value = "";
        spreadCheckbox.checked = false;
        localStorage.removeItem("user-wallpaper");
        localStorage.removeItem("wallpaper-spread");
        localStorage.setItem(
            "preferredEngine",
            "https://www.google.com/search",
        );
        loadAllSettings();
    };

    gearBtn.onclick = () => (settingsModal.style.display = "flex");
    closeSettingsBtn.onclick = closeSettingsModal;

    window.onclick = (e) => {
        if (e.target === settingsModal) closeSettingsModal();
    };

    loadAllSettings();
});
