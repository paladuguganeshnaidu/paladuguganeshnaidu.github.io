(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Navigation
  const nav = document.querySelector('.navlinks');
  const menu = document.querySelector('.menu');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.endsWith(path) || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Work filters
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-type]')];
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      card.hidden = !(filter === 'all' || card.dataset.type === filter);
    });
  }));

  // Live public GitHub activity
  const feed = document.querySelector('#github-feed');
  if (feed) {
    fetch('https://api.github.com/users/paladuguganeshnaidu/events/public?per_page=12', {
      headers: { Accept: 'application/vnd.github+json' }
    })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(events => {
        if (!Array.isArray(events) || !events.length) {
          feed.innerHTML = '<p class="muted">No recent public activity was returned by GitHub.</p>';
          return;
        }
        feed.replaceChildren(...events.slice(0, 8).map(event => {
          const item = document.createElement('a');
          const repo = event.repo?.name || 'GitHub';
          const when = event.created_at
            ? new Date(event.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
            : '';
          const action = (event.type || 'Activity').replace('Event','').replace(/([A-Z])/g,' $1').trim();
          item.className = 'activity-item';
          item.href = 'https://github.com/' + repo;
          item.target = '_blank';
          item.rel = 'noopener noreferrer';
          item.innerHTML = '<span class="activity-dot"></span>';

          const box = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = action + ' · ' + repo;
          const meta = document.createElement('small');
          meta.textContent = when;
          box.append(title, meta);
          item.appendChild(box);
          return item;
        }));
      })
      .catch(() => {
        feed.innerHTML = '<p class="muted">Live GitHub activity is temporarily unavailable. The project archive remains fully indexed and browsable.</p>';
      });
  }

  // Hero 3D scene — smooth pointer/touch tilt with no layout reads in the frame loop.
  const scene = document.querySelector('[data-scene]');
  if (scene && !reduceMotion) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let hostRect = null;

    const refreshSceneRect = () => {
      const host = scene.parentElement;
      hostRect = host ? host.getBoundingClientRect() : null;
    };
    const setPointer = (x, y) => {
      if (!hostRect) refreshSceneRect();
      if (!hostRect) return;
      targetX = Math.max(-1, Math.min(1, ((x - hostRect.left) / hostRect.width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((y - hostRect.top) / hostRect.height - 0.5) * 2));
    };

    const host = scene.parentElement;
    refreshSceneRect();
    window.addEventListener('resize', refreshSceneRect, { passive: true });
    host?.addEventListener('pointermove', e => setPointer(e.clientX, e.clientY), { passive: true });
    host?.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; }, { passive: true });
    host?.addEventListener('pointerup', () => { targetX = 0; targetY = 0; }, { passive: true });
    host?.addEventListener('pointercancel', () => { targetX = 0; targetY = 0; }, { passive: true });

    const frame = () => {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;
      scene.style.setProperty('--scene-rx', (currentY * -8).toFixed(2) + 'deg');
      scene.style.setProperty('--scene-ry', (currentX * 10).toFixed(2) + 'deg');
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // Global 3D field — one compositor-friendly loop for pointer, touch, scroll and float.
  const field = document.querySelector('.global-field');
  if (field && !reduceMotion) {
    const inner = field.querySelector('.field-inner');
    const movers = [...field.querySelectorAll('.field-tile, .field-server-object, .field-gpu-object, .field-shield-object')];

    let pointerTargetX = 0.5, pointerTargetY = 0.5;
    let pointerX = 0.5, pointerY = 0.5;
    let scrollTarget = window.scrollY || 0, scrollY = scrollTarget;
    let viewportW = window.innerWidth, viewportH = window.innerHeight;
    let layoutDirty = true;
    let pointerActive = false;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const cacheLayout = () => {
      viewportW = window.innerWidth;
      viewportH = window.innerHeight;
      movers.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        el.__motion = {
          cx: (rect.left + rect.width / 2) / Math.max(1, viewportW),
          cy: (rect.top + rect.height / 2) / Math.max(1, viewportH),
          phase: index * 0.83,
          speed: 0.75 + (index % 5) * 0.085,
          amplitude: 5 + (index % 4) * 2.5,
          depth: el.classList.contains('field-word') ? 0.72 : 1,
          scroll: 0.28 + (index % 4) * 0.08
        };
      });
      layoutDirty = false;
    };

    const updatePointer = (clientX, clientY) => {
      pointerActive = true;
      pointerTargetX = clamp(clientX / Math.max(1, viewportW), 0, 1);
      pointerTargetY = clamp(clientY / Math.max(1, viewportH), 0, 1);
      field.style.setProperty('--field-glow-x', (pointerTargetX * 100).toFixed(1) + '%');
      field.style.setProperty('--field-glow-y', (pointerTargetY * 100).toFixed(1) + '%');
    };

    const resetPointer = () => {
      pointerActive = false;
      pointerTargetX = 0.5;
      pointerTargetY = 0.5;
      field.style.setProperty('--field-glow-x', '50%');
      field.style.setProperty('--field-glow-y', '48%');
    };

    const onResize = () => {
      layoutDirty = true;
      cacheLayout();
    };

    cacheLayout();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', e => updatePointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('pointerdown', e => updatePointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('pointerup', resetPointer, { passive: true });
    window.addEventListener('pointercancel', resetPointer, { passive: true });
    window.addEventListener('scroll', () => { scrollTarget = window.scrollY || 0; }, { passive: true });

    document.addEventListener('pointerout', e => {
      if (e.relatedTarget === null) resetPointer();
    }, { passive: true });

    let lastScroll = scrollY;
    let lastTime = performance.now();

    const tick = now => {
      if (layoutDirty) cacheLayout();

      pointerX += (pointerTargetX - pointerX) * 0.085;
      pointerY += (pointerTargetY - pointerY) * 0.085;
      scrollY += (scrollTarget - scrollY) * 0.075;

      const delta = scrollY - lastScroll;
      const dt = Math.max(16, now - lastTime);
      const velocity = clamp((delta / dt) * 0.9, -1.5, 1.5);
      const fieldY = -scrollY * 0.045;
      const tiltY = (pointerX - 0.5) * 2.4;
      const tiltX = (pointerY - 0.5) * -1.9 + velocity * -1.8;

      inner.style.transform =
        'translate3d(0,' + fieldY.toFixed(2) + 'px,0) rotateX(' + tiltX.toFixed(2) +
        'deg) rotateY(' + tiltY.toFixed(2) + 'deg)';

      movers.forEach(el => {
        const meta = el.__motion;
        if (!meta) return;

        const actualCy = meta.cy + fieldY / Math.max(1, viewportH);
        const dx = pointerX - meta.cx;
        const dy = pointerY - actualCy;
        const distance = Math.hypot(dx * 1.15, dy);
        const influence = pointerActive ? clamp(1 - distance / 0.58, 0, 1) : 0;
        const depth = meta.depth * (0.65 + influence * 0.9);
        const time = now * 0.001 * meta.speed + meta.phase;
        const floatY = Math.sin(time) * meta.amplitude;
        const floatZ = (Math.cos(time * 0.86) * 0.5 + 0.5) * (meta.amplitude * 1.35);
        const liftX = dx * (10 + influence * 30) * depth;
        const liftY = dy * (8 + influence * 22) * depth;
        const liftZ = influence * 26 * depth;
        const rx = -dy * (4 + influence * 10) + Math.sin(time * 0.8) * 2;
        const ry = dx * (5 + influence * 12) + Math.cos(time * 0.7) * 3;
        const rz = Math.sin(time * 0.45) * (1.5 + influence * 2);

        el.style.transform =
          'translate3d(' + liftX.toFixed(2) + 'px,' +
          (liftY + floatY - scrollY * meta.scroll * 0.018).toFixed(2) + 'px,' +
          (liftZ + floatZ).toFixed(2) + 'px) rotateX(' + rx.toFixed(2) +
          'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';

      });

      lastScroll = scrollY;
      lastTime = now;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // Profile image fallback
  const profileImage = document.querySelector('img[data-profile-image]');
  if (profileImage) {
    profileImage.addEventListener('error', () => {
      profileImage.src = 'images/profile/ganesh-naidu.jpg';
    }, { once: true });
  }
})();
