/* ============================================================
   Paladugu Ganesh Naidu — Portfolio interactions
   ============================================================ */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----------------------------------------------------------
     Opening loader — particles fly in from all sides and
     assemble into the "GN" monogram
     ---------------------------------------------------------- */
  const preloader = $("#preloader");
  const logoCanvas = $("#logo-canvas");

  const VIOLET_RGB = [109, 74, 255];
  const TEAL_RGB = [15, 158, 148];

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  function mixColor(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* Rasterise "GN" offscreen and return the glyph pixel targets */
  function sampleLogoPoints(W, H, dpr) {
    const d = document.createElement("canvas");
    d.width = Math.max(1, Math.round(W * dpr));
    d.height = Math.max(1, Math.round(H * dpr));
    const c = d.getContext("2d", { willReadFrequently: true });
    if (!c) return [];

    const fontStack = '"Space Grotesk", "Inter", "Segoe UI", system-ui, sans-serif';
    const setFont = (s) => {
      c.font = `800 ${s}px ${fontStack}`;
      return c.measureText("GN");
    };

    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = "#000";

    let size = Math.floor(H * 0.86);
    let m = setFont(size);
    if (m.width > W * 0.9) size = Math.max(10, Math.floor((size * W * 0.9) / m.width));
    m = setFont(size);
    let asc = m.actualBoundingBoxAscent || size * 0.72;
    let desc = m.actualBoundingBoxDescent || size * 0.18;
    if (asc + desc > H * 0.92) {
      size = Math.max(10, Math.floor((size * H * 0.92) / (asc + desc)));
      m = setFont(size);
      asc = m.actualBoundingBoxAscent || size * 0.72;
      desc = m.actualBoundingBoxDescent || size * 0.18;
    }

    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    const baselineY = Math.min(H - 4, Math.max(4, H / 2 + (asc - desc) / 2));
    c.fillText("GN", W / 2, baselineY);

    const data = c.getImageData(0, 0, d.width, d.height).data;
    const targetCount = Math.round(Math.max(360, Math.min(1500, (W / 700) * 1350)));

    const gather = (st) => {
      const out = [];
      for (let y = 0; y < d.height; y += st) {
        for (let x = 0; x < d.width; x += st) {
          if (data[(y * d.width + x) * 4 + 3] > 140) out.push({ x: x / dpr, y: y / dpr });
        }
      }
      return out;
    };

    let step = 2;
    let pts = gather(step);
    while (pts.length > targetCount && step < 16) {
      step += 1;
      pts = gather(step);
    }
    if (pts.length > targetCount) {
      const k = Math.ceil(pts.length / targetCount);
      pts = pts.filter((_, i) => i % k === 0);
    }
    return pts;
  }

  function staggerHeroReveals() {
    const items = $$(".hero .reveal-item");
    items.forEach((el, i) => {
      el.style.transitionDelay = `${(0.3 + i * 0.11).toFixed(2)}s`;
    });
  }

  function finishLoader() {
    staggerHeroReveals();
    document.body.classList.add("is-loaded");
    document.documentElement.classList.remove("is-loading");
    if (preloader) {
      window.setTimeout(() => {
        preloader.remove();
      }, 950);
    }
  }

  function runParticleLogo(done) {
    if (!preloader || !logoCanvas || reducedMotion) {
      done();
      return;
    }
    const ctx = logoCanvas.getContext("2d");
    if (!ctx) {
      done();
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const W = Math.max(300, Math.min(vw * 0.92, 720));
    const H = Math.max(100, Math.min(vh * 0.3, 230));

    logoCanvas.style.width = `${W}px`;
    logoCanvas.style.height = `${H}px`;
    logoCanvas.width = Math.round(W * dpr);
    logoCanvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targets = sampleLogoPoints(W, H, dpr);
    if (!targets.length) {
      done();
      return;
    }

    const margin = Math.max(W, H) * 0.55;
    let maxEnd = 0;
    const particles = targets.map((p, i) => {
      const side = i % 4;
      let x;
      let y;
      const rnd = Math.random;
      if (side === 0) {
        x = -margin - rnd() * margin;
        y = rnd() * H;
      } else if (side === 1) {
        x = W + margin + rnd() * margin;
        y = rnd() * H;
      } else if (side === 2) {
        x = rnd() * W;
        y = -margin - rnd() * margin;
      } else {
        x = rnd() * W;
        y = H + margin + rnd() * margin;
      }
      const t = clamp01(p.x / W);
      const color = mixColor(VIOLET_RGB, TEAL_RGB, t);
      const delay = rnd() * 240 + side * 45;
      const dur = 900 + rnd() * 260;
      if (delay + dur > maxEnd) maxEnd = delay + dur;
      return { x, y, tx: p.x, ty: p.y, delay, dur, color, r: rnd() * 1.25 + 0.8 };
    });

    const t0 = performance.now();
    const hold = 300;
    let settled = false;
    let doneFired = false;

    const fireDone = () => {
      if (doneFired) return;
      doneFired = true;
      done();
    };

    const frame = (now) => {
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const pr = clamp01((t - p.delay) / p.dur);
        if (pr <= 0) continue;
        const e = easeInOutCubic(pr);
        const px = p.x + (p.tx - p.x) * e;
        const py = p.y + (p.ty - p.y) * e;
        ctx.globalAlpha = pr < 0.08 ? pr / 0.08 : 1;
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.95)`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!settled && t >= maxEnd) {
        settled = true;
        window.setTimeout(fireDone, hold);
        return;
      }
      if (t > 2600) {
        fireDone();
        return;
      }
      window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame(frame);
  }

  function runLoader() {
    runParticleLogo(finishLoader);
  }

  /* ----------------------------------------------------------
     Header: scrolled state, active link, mobile nav
     ---------------------------------------------------------- */
  const header = $("#site-header");
  const nav = $("#site-nav");
  const navToggle = $("#nav-toggle");
  const navBackdrop = $("#nav-backdrop");

  function setScrolled() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }

  function openNav() {
    nav?.classList.add("is-open");
    navBackdrop?.classList.add("is-open");
    navToggle?.setAttribute("aria-expanded", "true");
    navToggle?.setAttribute("aria-label", "Close menu");
    document.body.classList.add("lock");
  }

  function closeNav() {
    nav?.classList.remove("is-open");
    navBackdrop?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("lock");
  }

  function setupHeader() {
    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });

    navToggle?.addEventListener("click", () => {
      if (nav?.classList.contains("is-open")) closeNav();
      else openNav();
    });
    navBackdrop?.addEventListener("click", closeNav);
    nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  function setupActiveNav() {
    if (!nav || !("IntersectionObserver" in window)) return;
    const links = $$(".nav-link", nav).filter((l) => l.getAttribute("href")?.startsWith("#"));
    const map = new Map(links.map((l) => [l.getAttribute("href").slice(1), l]));
    const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);

    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!top?.target?.id) return;
        links.forEach((l) => l.classList.remove("is-active"));
        map.get(top.target.id)?.classList.add("is-active");
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((s) => obs.observe(s));
  }

  /* ----------------------------------------------------------
     Scroll reveal with sibling stagger
     ---------------------------------------------------------- */
  function setupReveals() {
    const targets = $$("[data-reveal]");
    if (!targets.length) return;

    targets.forEach((el) => {
      const siblings = $$("[data-reveal]", el.parentElement);
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.setProperty("--rd", `${Math.min(idx * 90, 520)}ms`);
    });

    if (!("IntersectionObserver" in window) || reducedMotion) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );
    targets.forEach((el) => obs.observe(el));
  }

  /* ----------------------------------------------------------
     Marquee: duplicate track for a seamless loop
     ---------------------------------------------------------- */
  function setupMarquee() {
    const track = $(".marquee-track");
    if (!track) return;
    track.innerHTML += track.innerHTML;
  }

  /* ----------------------------------------------------------
     Footer year
     ---------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------
     Live LeetCode stat (best-effort, static fallback kept)
     ---------------------------------------------------------- */
  function setupLiveLeetCode() {
    const statEl = $("#leetcode-live-stat");
    if (!statEl) return;
    fetch("https://leetcode-stats-api.herokuapp.com/paladuguganeshnaidu")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        const solved = data && data.totalSolved;
        if (typeof solved === "number" && solved > 0) statEl.textContent = `${solved}+`;
      })
      .catch(() => {});
  }

  /* ----------------------------------------------------------
     Ambient background: neural network + faint 3D wireframe orb
     ---------------------------------------------------------- */
  function setupNeuralBackground() {
    const canvas = $("#neural-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const VIOLET = "109,74,255";
    const TEAL = "15,158,148";

    let w = 0;
    let h = 0;
    let nodes = [];
    let orb = null;

    function makeOrb(cx, cy, radius) {
      const rings = [];
      const lonCount = 9;
      const latCount = 6;
      for (let k = 0; k < lonCount; k += 1) {
        const pts = [];
        for (let i = 0; i <= 48; i += 1) {
          const t = (i / 48) * Math.PI * 2;
          pts.push([Math.cos(t), 0, Math.sin(t)]);
        }
        rings.push(pts);
      }
      for (let k = 1; k < latCount; k += 1) {
        const lat = -Math.PI / 2 + (k / latCount) * Math.PI;
        const pts = [];
        for (let i = 0; i <= 48; i += 1) {
          const t = (i / 48) * Math.PI * 2;
          pts.push([Math.cos(lat) * Math.cos(t), Math.sin(lat), Math.cos(lat) * Math.sin(t)]);
        }
        rings.push(pts);
      }
      return { cx, cy, radius, rings, rx: 0.4, ry: 0.3 };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(56, Math.max(22, Math.round((w * h) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.7,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        c: Math.random() < 0.62 ? VIOLET : TEAL,
      }));

      const R = Math.min(120, w * 0.09);
      orb = makeOrb(w - R * 1.9, h * 0.2, R);
    }

    function step() {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }
    }

    function drawOrb(alpha) {
      if (!orb) return;
      orb.rx += 0.0022;
      orb.ry += 0.0034;
      ctx.strokeStyle = `rgba(${VIOLET},${alpha})`;
      ctx.lineWidth = 1;

      for (const ring of orb.rings) {
        ctx.beginPath();
        let started = false;
        for (const [x0, y0, z0] of ring) {
          // rotate Y then X
          let x = x0;
          let y = y0 * Math.cos(orb.rx) - z0 * Math.sin(orb.rx);
          let z = y0 * Math.sin(orb.rx) + z0 * Math.cos(orb.rx);
          const tx = x * Math.cos(orb.ry) + z * Math.sin(orb.ry);
          z = -x * Math.sin(orb.ry) + z * Math.cos(orb.ry);
          x = tx;
          const sx = orb.cx + x * orb.radius;
          const sy = orb.cy + y * orb.radius;
          if (!started) {
            ctx.moveTo(sx, sy);
            started = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      }
    }

    function drawLinks() {
      const maxD = 130;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD * maxD) {
            const alpha = (1 - Math.sqrt(d2) / maxD) * 0.11;
            ctx.strokeStyle = `rgba(${a.c},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    function drawNodes() {
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${n.c},0.35)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawFrame() {
      ctx.clearRect(0, 0, w, h);
      drawLinks();
      drawOrb(reducedMotion ? 0.05 : 0.07);
      drawNodes();
    }

    function loop() {
      if (!document.hidden) {
        step();
        drawFrame();
      }
      window.requestAnimationFrame(loop);
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    });

    resize();
    drawFrame();
    if (!reducedMotion) window.requestAnimationFrame(loop);
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function boot() {
    setupHeader();
    setupActiveNav();
    setupMarquee();
    setupReveals();
    setupNeuralBackground();
    setupLiveLeetCode();
    runLoader();
    window.__GN_BOOTED__ = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
