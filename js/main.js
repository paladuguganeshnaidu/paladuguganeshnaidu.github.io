const fullName = "Paladugu Ganesh Naidu";
const typedNameEl = document.getElementById("typed-name");
const scrollIndicator = document.getElementById("scroll-indicator");
const footerYear = document.getElementById("year");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");
const siteNav = document.getElementById("site-nav");
const navBackdrop = document.getElementById("nav-backdrop");
const scrollProgressBar = document.getElementById("scroll-progress-bar");
const backToTopButton = document.getElementById("back-to-top");
const pageLoader = document.getElementById("page-loader");

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
      nextDelay = 1600;
    } else {
      nextDelay = 85;
    }
  } else {
    currentIndex -= 1;
    typedNameEl.textContent = fullName.slice(0, currentIndex);

    if (currentIndex <= 0) {
      deleting = false;
      nextDelay = 520;
    } else {
      nextDelay = 45;
    }
  }

  window.setTimeout(runTypewriter, nextDelay);
}

function updateScrollIndicator() {
  if (!scrollIndicator) return;

  const fadeDistance = 220;
  const opacity = Math.max(0, 1 - Math.min(window.scrollY / fadeDistance, 1));
  scrollIndicator.style.opacity = String(opacity);
  scrollIndicator.style.pointerEvents = opacity < 0.1 ? "none" : "auto";
}

function updateScrollProgress() {
  if (!scrollProgressBar) return;

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight <= 0 ? 0 : (window.scrollY / scrollableHeight) * 100;
  scrollProgressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
}

function updateBackToTop() {
  if (!backToTopButton) return;

  backToTopButton.classList.toggle("is-visible", window.scrollY > 520);
}

function setupScrollIndicator() {
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.getElementById("skills")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  let framePending = false;

  window.addEventListener("scroll", () => {
    if (framePending) return;

    framePending = true;
    window.requestAnimationFrame(() => {
      updateScrollIndicator();
      updateScrollProgress();
      updateBackToTop();
      framePending = false;
    });
  });

  updateScrollIndicator();
  updateScrollProgress();
  updateBackToTop();
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
    if (siteNav.classList.contains("is-open")) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navClose?.addEventListener("click", closeMobileNav);
  navBackdrop?.addEventListener("click", closeMobileNav);

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
  document.querySelectorAll(".reveal-card").forEach((card) => {
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

function markRevealTargets() {
  const selectors = [
    ".section-head",
    ".hero-metrics .metric",
    ".skills-grid .skill-card",
    ".projects-grid .project-card",
    ".experience-grid .experience-card",
    ".reveal-grid .reveal-card",
    ".timeline-grid .timeline-card",
    ".awards-grid .award-card",
    ".completion-grid .completion-card",
    ".contact-card",
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.hasAttribute("data-reveal")) return;

      element.setAttribute("data-reveal", "");
      element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 320)}ms`);
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
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function setupActiveNavLinks() {
  if (!siteNav || !("IntersectionObserver" in window)) return;

  const navLinks = Array.from(siteNav.querySelectorAll("a[href^='#']"));
  const linkMap = new Map(
    navLinks.map((link) => [link.getAttribute("href")?.slice(1), link]),
  );

  const sections = Array.from(linkMap.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry?.target.id) return;

      navLinks.forEach((link) => link.classList.remove("is-active"));
      linkMap.get(visibleEntry.target.id)?.classList.add("is-active");
    },
    {
      threshold: [0.2, 0.5, 0.7],
      rootMargin: "-20% 0px -55% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupHeroParallax() {
  const hero = document.querySelector(".hero-content");
  const accent = document.querySelector(".hero-accent");
  const photo = document.querySelector(".hero-photo-frame");

  if (!hero || !accent || !photo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let animationFrame = 0;

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }

    animationFrame = window.requestAnimationFrame(() => {
      accent.style.transform = `translate3d(${x * 18}px, ${y * 16}px, 0) rotate(${x * 8}deg)`;
      photo.style.transform = `translate3d(${x * -10}px, ${y * -12}px, 0)`;
    });
  });

  hero.addEventListener("mouseleave", () => {
    accent.style.transform = "";
    photo.style.transform = "";
  });
}

function setupCurrentYear() {
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }
}

function setupLoader() {
  const finishLoad = () => {
    document.body.classList.add("is-loaded");

    if (!pageLoader) return;

    window.setTimeout(() => {
      pageLoader.remove();
    }, 700);
  };

  if (document.readyState === "complete") {
    finishLoad();
  } else {
    window.addEventListener("load", finishLoad, { once: true });
  }
}

markRevealTargets();
runTypewriter();
setupScrollIndicator();
setupMobileNav();
setupKeyboardRevealCards();
setupScrollReveal();
setupActiveNavLinks();
setupHeroParallax();
setupCurrentYear();
setupLoader();
