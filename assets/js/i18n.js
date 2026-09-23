(() => {
  const DEFAULT_LANG = "it";
  const SUPPORTED = ["it", "en"];
  const getKey = (obj, path) => path.split(".").reduce((o,k) => o?.[k], obj);

  async function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error(`Language file ${lang} not found`);
      const dict = await res.json();

      document.querySelectorAll("[data-i18n]").forEach(el => {
        const value = getKey(dict, el.dataset.i18n);
        if (value != null) el.textContent = value;
      });
      document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const value = getKey(dict, el.dataset.i18nHtml);
        if (value != null) el.innerHTML = value;
      });
      document.querySelectorAll("[data-i18n-alt]").forEach(el => {
        const value = getKey(dict, el.dataset.i18nAlt);
        if (value != null) el.setAttribute("alt", value);
      });
      const titleEl = document.querySelector("[data-i18n-title]");
      if (titleEl) document.title = getKey(dict, titleEl.dataset.i18nTitle) || document.title;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict.meta?.description) metaDesc.content = dict.meta.description;

      document.documentElement.lang = lang;
      localStorage.setItem("siteLanguage", lang);
      document.querySelectorAll("[data-lang]").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === lang));
    } catch (err) { console.error(err); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lang]").forEach(btn => btn.addEventListener("click", () => setLanguage(btn.dataset.lang)));
    setLanguage(localStorage.getItem("siteLanguage") || DEFAULT_LANG);
  });
})();