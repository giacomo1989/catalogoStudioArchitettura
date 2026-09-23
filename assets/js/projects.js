(() => {
    const grid = document.getElementById("portfolio-grid");
    if (!grid) return;

    const supported = ["it", "en"];

    function getLanguage() {
        const lang = localStorage.getItem("siteLanguage") || document.documentElement.lang || "it";
        return supported.includes(lang) ? lang : "it";
    }

    async function renderProjects() {
        const lang = getLanguage();

        try {
            const response = await fetch(`data/projects-${lang}.json`);
            if (!response.ok) throw new Error("Projects data not found");

            const data = await response.json();
            const projects = data.projects || [];

            grid.innerHTML = projects.map((project) => `
                <a class="portfolio-card" href="progetto.html?id=${encodeURIComponent(project.slug)}">
                    <div class="portfolio-image">
                        <img src="${project.image}" alt="${project.alt}" loading="lazy">
                    </div>

                    <h2>${project.title}</h2>

                    <p>
                        ${project.location}
                        <span>·</span>
                        ${project.year}
                        <span>·</span>
                        ${project.type}
                    </p>
                </a>
            `).join("");

            const total = document.getElementById("portfolio-total");
            if (total) total.textContent = String(projects.length).padStart(2, "0");

        } catch (error) {
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", renderProjects);

    document.querySelectorAll("[data-lang]").forEach((button) => {
        button.addEventListener("click", () => {
            window.setTimeout(renderProjects, 50);
        });
    });
})();
