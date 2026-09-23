(() => {
    const root = document.getElementById("project-root");
    if (!root) return;

    const supported = ["it", "en"];
    let projects = [];
    let project = null;
    let projectIndex = 0;
    let galleryImages = [];
    let lightboxIndex = 0;
    let touchStartX = null;

    const $ = (id) => document.getElementById(id);
    const lang = () => {
        const value = localStorage.getItem("siteLanguage") || document.documentElement.lang || "it";
        return supported.includes(value) ? value : "it";
    };

    async function loadProject() {
        const currentLang = lang();
        const params = new URLSearchParams(window.location.search);
        const slug = params.get("id") || "villa-sul-lago";

        try {
            const response = await fetch(`data/projects-${currentLang}.json`);
            if (!response.ok) throw new Error("Project data not found");
            const data = await response.json();
            projects = data.projects || [];
            projectIndex = projects.findIndex(item => item.slug === slug);
            if (projectIndex < 0) projectIndex = 0;
            project = projects[projectIndex];
            render();
        } catch (error) {
            console.error(error);
        }
    }

    function render() {
        document.title = `${project.title} — FEDETEBA STUDIO`;
        $("detail-type").textContent = project.type;
        $("detail-title").textContent = project.title;
        $("detail-location").textContent = project.location;
        $("detail-year").textContent = project.year;
        $("detail-hero-image").src = project.hero;
        $("detail-hero-image").alt = project.alt;
        $("detail-intro-text").textContent = project.intro;
        $("detail-description").textContent = project.description;
        $("fact-location").textContent = project.location;
        $("fact-year").textContent = project.year;
        $("fact-type").textContent = project.type;
        $("fact-surface").textContent = project.surface;
        $("fact-status").textContent = project.status;

        galleryImages = [{src: project.hero, alt: project.alt}, ...(project.gallery || [])];
        renderGallery();
        renderPagination();
    }

    function renderGallery() {
        const gallery = $("detail-gallery");
        gallery.innerHTML = "";
        const items = project.gallery || [];

        let i = 0;
        while (i < items.length) {
            const item = items[i];

            if (item.layout === "full") {
                gallery.appendChild(makeImage(item, i + 1, "gallery-full"));
                i++;
                continue;
            }

            if (item.layout === "portrait" && items[i + 1]?.layout === "stack" && items[i + 2]?.layout === "stack") {
                const row = document.createElement("div");
                row.className = "gallery-mixed";
                row.appendChild(makeImage(item, i + 1, "gallery-portrait"));

                const stack = document.createElement("div");
                stack.className = "gallery-stack";
                stack.appendChild(makeImage(items[i + 1], i + 2, ""));
                stack.appendChild(makeImage(items[i + 2], i + 3, ""));
                row.appendChild(stack);
                gallery.appendChild(row);
                i += 3;
                continue;
            }

            if (item.layout === "half" && items[i + 1]?.layout === "half") {
                const row = document.createElement("div");
                row.className = "gallery-halves";
                row.appendChild(makeImage(item, i + 1, ""));
                row.appendChild(makeImage(items[i + 1], i + 2, ""));
                gallery.appendChild(row);
                i += 2;
                continue;
            }

            gallery.appendChild(makeImage(item, i + 1, "gallery-full"));
            i++;
        }
    }

    function makeImage(item, galleryIndex, extraClass) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `gallery-image gallery-trigger ${extraClass}`.trim();
        button.dataset.galleryIndex = galleryIndex;
        button.setAttribute("aria-label", item.alt || "Apri immagine");

        const image = document.createElement("img");
        image.src = item.src;
        image.alt = item.alt || "";
        image.loading = "lazy";
        button.appendChild(image);

        button.addEventListener("click", () => openLightbox(galleryIndex));
        return button;
    }

    function renderPagination() {
        const previous = projects[(projectIndex - 1 + projects.length) % projects.length];
        const next = projects[(projectIndex + 1) % projects.length];

        $("previous-project").href = `progetto.html?id=${encodeURIComponent(previous.slug)}`;
        $("previous-title").textContent = previous.title;
        $("previous-meta").textContent = `${previous.location} · ${previous.year}`;

        $("next-project").href = `progetto.html?id=${encodeURIComponent(next.slug)}`;
        $("next-title").textContent = next.title;
        $("next-meta").textContent = `${next.location} · ${next.year}`;

        $("project-position").textContent =
            `${String(projectIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    }

    const lightbox = $("lightbox");
    function openLightbox(index) {
        lightboxIndex = index;
        updateLightbox();
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        $("lightbox-close").focus();
    }
    function closeLightbox() {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
    }
    function updateLightbox() {
        const image = galleryImages[lightboxIndex];
        $("lightbox-image").src = image.src;
        $("lightbox-image").alt = image.alt || "";
        $("lightbox-count").textContent =
            `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(galleryImages.length).padStart(2, "0")}`;
    }
    function moveLightbox(delta) {
        lightboxIndex = (lightboxIndex + delta + galleryImages.length) % galleryImages.length;
        updateLightbox();
    }

    document.querySelector(".detail-hero")?.addEventListener("click", () => openLightbox(0));
    $("lightbox-close")?.addEventListener("click", closeLightbox);
    $("lightbox-prev")?.addEventListener("click", () => moveLightbox(-1));
    $("lightbox-next")?.addEventListener("click", () => moveLightbox(1));

    lightbox?.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
        if (!lightbox?.classList.contains("open")) return;
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") moveLightbox(-1);
        if (event.key === "ArrowRight") moveLightbox(1);
    });

    lightbox?.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].clientX;
    }, {passive: true});

    lightbox?.addEventListener("touchend", (event) => {
        if (touchStartX == null) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) moveLightbox(dx > 0 ? -1 : 1);
        touchStartX = null;
    }, {passive: true});

    document.addEventListener("DOMContentLoaded", loadProject);
    document.querySelectorAll("[data-lang]").forEach(button => {
        button.addEventListener("click", () => window.setTimeout(loadProject, 50));
    });
})();
