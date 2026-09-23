/* =========================================================
   MOBILE MENU
========================================================= */

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

toggle?.addEventListener("click", () => {
    nav.classList.toggle("open");

    toggle.setAttribute(
        "aria-expanded",
        nav.classList.contains("open")
    );
});

document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
    });
});


/* =========================================================
   STICKY HEADER SCROLL
========================================================= */

const header = document.querySelector(".site-header");

function updateHeader() {
    if (!header) return;

    header.classList.toggle(
        "header-scrolled",
        window.scrollY > 40
    );
}

window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
);

updateHeader();

/* =========================================================
   INTERNAL ANCHOR SCROLL
   The header changes height after the first scroll.
   Apply its final state before measuring the target, so the
   first click lands in exactly the same place as later clicks.
========================================================= */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;

        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();

        if (hash !== "#home") {
            header?.classList.add("header-scrolled");
        }

        requestAnimationFrame(() => {
            const headerHeight = header?.offsetHeight || 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY;
            const gap = 2;

            window.scrollTo({
                top: Math.max(0, targetTop - headerHeight - gap),
                behavior: "smooth"
            });

            history.replaceState(null, "", hash);
        });
    });
});



/* =========================================================
   CURRENT YEAR
========================================================= */

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}


/* =========================================================
   CONTACT FORM · FORMSPREE
========================================================= */

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

const formMessages = {
    it: {
        sending: "INVIO...",
        success: "Messaggio inviato correttamente. Ti risponderemo al più presto.",
        error: "Non è stato possibile inviare il messaggio. Riprova tra poco."
    },
    en: {
        sending: "SENDING...",
        success: "Message sent successfully. We will get back to you as soon as possible.",
        error: "The message could not be sent. Please try again shortly."
    }
};

function currentLanguage() {
    const lang = document.documentElement.lang || localStorage.getItem("siteLanguage") || "it";
    return formMessages[lang] ? lang : "it";
}

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector(".contact-submit");
    const submitLabel = contactForm.querySelector(".submit-label");
    const submitArrow = contactForm.querySelector(".submit-arrow");
    const originalLabel = submitLabel?.textContent || "INVIA MESSAGGIO";
    const lang = currentLanguage();

    if (formStatus) {
        formStatus.textContent = "";
        formStatus.className = "form-status";
    }

    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = formMessages[lang].sending;
    if (submitArrow) submitArrow.textContent = "…";

    try {
        const response = await fetch(contactForm.action, {
            method: contactForm.method,
            body: new FormData(contactForm),
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Formspree request failed");
        }

        contactForm.reset();

        if (formStatus) {
            formStatus.textContent = formMessages[lang].success;
            formStatus.classList.add("success");
        }

    } catch (error) {

        if (formStatus) {
            formStatus.textContent = formMessages[lang].error;
            formStatus.classList.add("error");
        }

    } finally {

        if (submitButton) submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
        if (submitArrow) submitArrow.textContent = "→";
    }
});
