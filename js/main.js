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
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      document.getElementById("about")?.scrollIntoView({
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
    ".hero-metrics .metric",
    ".about-pillars-grid .about-pillar",
    ".skills-grid .skill-card",
    ".projects-grid .project-card",
    ".experience-grid .experience-card",
    ".reveal-grid .reveal-card",
    ".timeline-grid .timeline-card",
    ".awards-grid .award-card",
    ".contact-card",
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.hasAttribute("data-reveal")) return;

      element.setAttribute("data-reveal", "");
      element.style.setProperty("--reveal-delay", `${Math.min(index * 60, 300)}ms`);
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
  const linkMap = new Map(navLinks.map((link) => [link.getAttribute("href")?.slice(1), link]));

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
    { threshold: [0.2, 0.5, 0.7], rootMargin: "-20% 0px -55% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * 3D tilt + cursor-follow glow for glass cards.
 * Adds perspective-based rotation on mousemove, resets on leave,
 * and updates --mx/--my custom properties for the CSS spotlight effect.
 */
function setupTiltCards() {
  if (prefersReducedMotion) return;

  const tiltEls = document.querySelectorAll(".tilt");
  if (!tiltEls.length) return;

  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

  tiltEls.forEach((el) => {
    const maxTilt = Number(el.getAttribute("data-tilt-max")) || 7;
    let frame = 0;

    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);

      if (!supportsFinePointer) return;

      const rotateY = (x - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - y) * maxTilt * 2;

      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
      });
    });

    el.addEventListener("mouseleave", () => {
      if (frame) window.cancelAnimationFrame(frame);
      el.style.transform = "";
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    });
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

/**
 * Best-effort live LeetCode solved-count fetch.
 * Falls back silently to the static number already in the HTML
 * if the public stats endpoint is unreachable or rate-limited.
 */
function setupLiveLeetCodeStat() {
  const statEl = document.getElementById("leetcode-live-stat");
  if (!statEl) return;

  fetch("https://leetcode-stats-api.herokuapp.com/paladuguganeshnaidu")
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      const solved = data?.totalSolved;
      if (typeof solved === "number" && solved > 0) {
        statEl.textContent = `${solved}+`;
      }
    })
    .catch(() => {
      /* keep the static fallback already in the markup */
    });
}

/**
 * Lightweight three.js hero background: a rotating wireframe icosahedron
 * with a soft particle field, tuned dark/neon to match the site theme.
 * Degrades gracefully (no-op) if three.js failed to load.
 */
function setupHero3D() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || typeof THREE === "undefined" || prefersReducedMotion) return;

  let width = canvas.clientWidth || canvas.parentElement.clientWidth;
  let height = canvas.clientHeight || canvas.parentElement.clientHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  const icoGeometry = new THREE.IcosahedronGeometry(2.6, 1);
  const icoMaterial = new THREE.MeshBasicMaterial({
    color: 0x7c5cff,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const ico = new THREE.Mesh(icoGeometry, icoMaterial);
  ico.position.set(2.4, 0.4, 0);
  scene.add(ico);

  const innerGeometry = new THREE.IcosahedronGeometry(1.5, 0);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });
  const innerIco = new THREE.Mesh(innerGeometry, innerMaterial);
  innerIco.position.copy(ico.position);
  scene.add(innerIco);

  const particleCount = 220;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xf5578a,
    size: 0.035,
    transparent: true,
    opacity: 0.55,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  let targetRotX = 0;
  let targetRotY = 0;

  window.addEventListener("mousemove", (event) => {
    targetRotX = (event.clientY / window.innerHeight - 0.5) * 0.4;
    targetRotY = (event.clientX / window.innerWidth - 0.5) * 0.4;
  });

  function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  window.addEventListener("resize", resize);

  function animate() {
    ico.rotation.x += 0.0022;
    ico.rotation.y += 0.0032;
    innerIco.rotation.x -= 0.0018;
    innerIco.rotation.y -= 0.0026;
    particles.rotation.y += 0.0006;

    camera.position.x += (targetRotY * 2 - camera.position.x + 0) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  resize();
  animate();
}

markRevealTargets();
runTypewriter();
setupScrollIndicator();
setupMobileNav();
setupKeyboardRevealCards();
setupScrollReveal();
setupActiveNavLinks();
setupTiltCards();
setupCurrentYear();
setupLoader();
setupLiveLeetCodeStat();
setupHero3D();
