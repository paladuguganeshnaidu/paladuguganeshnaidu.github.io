const fullName = "Paladugu Ganesh Naidu";
const typedNameEl = document.getElementById("typed-name");
const scrollIndicator = document.getElementById("scroll-indicator");
const footerYear = document.getElementById("year");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");
const siteNav = document.getElementById("site-nav");
const navBackdrop = document.getElementById("nav-backdrop");

let currentIndex = 0;
let deleting = false;

function runTypewriter() {
  if (!typedNameEl) return;

  let nextDelay = 100;

  if (!deleting) {
    currentIndex += 1;
    typedNameEl.textContent = fullName.slice(0, currentIndex);

    if (currentIndex >= fullName.length) {
      deleting = true;
      nextDelay = 1500;
    } else {
      nextDelay = 90;
    }
  } else {
    currentIndex -= 1;
    typedNameEl.textContent = fullName.slice(0, currentIndex);

    if (currentIndex <= 0) {
      deleting = false;
      nextDelay = 450;
    } else {
      nextDelay = 55;
    }
  }

  window.setTimeout(runTypewriter, nextDelay);
}

function updateScrollIndicator() {
  if (!scrollIndicator) return;

  const fadeDistance = 220;
  const progress = Math.min(window.scrollY / fadeDistance, 1);
  const opacity = 1 - progress;

  scrollIndicator.style.opacity = String(opacity);
  scrollIndicator.style.pointerEvents = opacity < 0.1 ? "none" : "auto";
}

function setupScrollIndicator() {
  if (!scrollIndicator) return;

  let framePending = false;

  scrollIndicator.addEventListener("click", () => {
    const target = document.getElementById("skills");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  window.addEventListener("scroll", () => {
    if (framePending) return;

    framePending = true;
    window.requestAnimationFrame(() => {
      updateScrollIndicator();
      framePending = false;
    });
  });

  updateScrollIndicator();
}

function openMobileNav() {
  if (!siteNav || !navToggle || !navBackdrop) return;

  siteNav.classList.add("is-open");
  navBackdrop.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Close navigation menu");
  document.body.classList.add("nav-open");
}

function closeMobileNav() {
  if (!siteNav || !navToggle || !navBackdrop) return;

  siteNav.classList.remove("is-open");
  navBackdrop.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("nav-open");
}

function setupMobileNav() {
  if (!siteNav || !navToggle) return;

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.contains("is-open");
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  if (navClose) {
    navClose.addEventListener("click", closeMobileNav);
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", closeMobileNav);
  }

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileNav();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMobileNav();
    }
  });
}

function setupKeyboardRevealCards() {
  const revealCards = document.querySelectorAll(".reveal-card");

  revealCards.forEach((card) => {
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("is-active");
      }
    });

    card.addEventListener("blur", () => {
      card.classList.remove("is-active");
    });
  });
}

function setupScrollReveal() {
  const revealTargets = document.querySelectorAll("[data-reveal]");

  if (!revealTargets.length) return;

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function setupCurrentYear() {
  if (!footerYear) return;
  footerYear.textContent = String(new Date().getFullYear());
}

runTypewriter();
setupScrollIndicator();
setupMobileNav();
setupKeyboardRevealCards();
setupScrollReveal();
setupCurrentYear();
