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

  // Hero 3D scene — uses CSS variables so responsive scale is preserved.
  const scene = document.querySelector('[data-scene]');
  if (scene && !reduceMotion) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    const setPointer = (x, y, rect) => {
      targetX = Math.max(-1, Math.min(1, ((x - rect.left) / rect.width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((y - rect.top) / rect.height - 0.5) * 2));
    };

    const host = scene.parentElement;
    host?.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      setPointer(e.clientX, e.clientY, host.getBoundingClientRect());
    }, { passive: true });

    host?.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    }, { passive: true });

    const frame = () => {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;
      scene.style.setProperty('--scene-rx', (currentY * -8).toFixed(2) + 'deg');
      scene.style.setProperty('--scene-ry', (currentX * 10).toFixed(2) + 'deg');
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // Global 3D field — pointer magnetism + scroll depth + smooth inertia.
  const field = document.querySelector('.global-field');
  if (field && !reduceMotion) {
    const root = document.documentElement;
    const inner = field.querySelector('.field-inner');
    const tiles = [...field.querySelectorAll('.field-tile, .field-server-object, .field-gpu-object, .field-shield-object')];

    let pointerTargetX = 0.5;
    let pointerTargetY = 0.5;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let scrollTarget = window.scrollY || 0;
    let scrollY = scrollTarget;
    let viewportW = window.innerWidth;
    let viewportH = window.innerHeight;
    let layoutDirty = true;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const cacheLayout = () => {
      viewportW = window.innerWidth;
      viewportH = window.innerHeight;
      tiles.forEach(tile => {
        const rect = tile.getBoundingClientRect();
        tile.__field = {
          cx: (rect.left + rect.width / 2) / Math.max(1, viewportW),
          cy: (rect.top + rect.height / 2) / Math.max(1, viewportH),
          depth: tile.classList.contains('field-word') ? 0.72 : 1,
          scroll: 0.35 + (tile.offsetWidth > 70 ? 0.30 : 0.18)
        };
      });
      layoutDirty = false;
    };

    const onResize = () => {
      layoutDirty = true;
      cacheLayout();
    };

    window.addEventListener('resize', onResize, { passive: true });
    cacheLayout();

    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      pointerTargetX = clamp(e.clientX / Math.max(1, viewportW), 0, 1);
      pointerTargetY = clamp(e.clientY / Math.max(1, viewportH), 0, 1);
      field.style.setProperty('--field-glow-x', (pointerTargetX * 100).toFixed(1) + '%');
      field.style.setProperty('--field-glow-y', (pointerTargetY * 100).toFixed(1) + '%');
    }, { passive: true });

    document.addEventListener('pointerout', e => {
      if (e.pointerType !== 'mouse' || e.relatedTarget) return;
      pointerTargetX = 0.5;
      pointerTargetY = 0.5;
      field.style.setProperty('--field-glow-x', '50%');
      field.style.setProperty('--field-glow-y', '48%');
    }, { passive: true });

    window.addEventListener('scroll', () => {
      scrollTarget = window.scrollY || 0;
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
      const velocity = clamp((delta / dt) * 0.9, -1.4, 1.4);

      const tiltY = (pointerX - 0.5) * 2.2;
      const tiltX = (pointerY - 0.5) * -1.8 + velocity * -1.6;

      inner.style.setProperty('--field-rx', tiltX.toFixed(2) + 'deg');
      inner.style.setProperty('--field-ry', tiltY.toFixed(2) + 'deg');
      inner.style.setProperty('--field-y', (-scrollY * 0.028).toFixed(2) + 'px');

      tiles.forEach(tile => {
        const meta = tile.__field;
        if (!meta) return;

        const dx = pointerX - meta.cx;
        const dy = pointerY - meta.cy;
        const distance = Math.hypot(dx * 1.15, dy);
        const influence = clamp(1 - distance / 0.58, 0, 1);
        const depth = meta.depth * (0.65 + influence * 0.9);

        tile.style.setProperty('--px', (dx * (10 + influence * 28) * depth).toFixed(2) + 'px');
        tile.style.setProperty('--py', (dy * (8 + influence * 20) * depth).toFixed(2) + 'px');
        tile.style.setProperty('--pz', (influence * 24 * depth).toFixed(2) + 'px');
        tile.style.setProperty('--prx', (-dy * (4 + influence * 9)).toFixed(2) + 'deg');
        tile.style.setProperty('--pry', (dx * (5 + influence * 12)).toFixed(2) + 'deg');
        tile.style.setProperty('--sy', (-scrollY * meta.scroll * 0.032).toFixed(2) + 'px');
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
