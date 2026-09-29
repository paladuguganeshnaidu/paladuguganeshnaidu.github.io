(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Accessible mobile navigation.
  const nav = document.querySelector('.navlinks');
  const menu = document.querySelector('.menu');

  const closeMenu = () => {
    if (!nav || !menu) return;
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  };

  if (menu && nav) {
    menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', event => {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
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

  // Work filters.
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-type]')];

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;
      cards.forEach(card => {
        card.hidden = !(filter === 'all' || card.dataset.type === filter);
      });
    });
  });

  const setFeedMessage = (feed, message) => {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = message;
    feed.replaceChildren(p);
  };

  // Live public GitHub activity with timeout + short client cache.
  const feed = document.querySelector('#github-feed');
  if (feed) {
    const cacheKey = 'gn.github.activity.v1';
    const cacheTtl = 5 * 60 * 1000;
    const now = Date.now();

    const renderEvents = events => {
      if (!Array.isArray(events) || !events.length) {
        setFeedMessage(feed, 'No recent public activity was returned by GitHub.');
        return;
      }

      const nodes = events.slice(0, 8).map(event => {
        const item = document.createElement('a');
        const repo = event.repo?.name || 'GitHub';
        const when = event.created_at
          ? new Date(event.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
          : '';
        const action = (event.type || 'Activity')
          .replace('Event', '')
          .replace(/([A-Z])/g, ' $1')
          .trim();

        item.className = 'activity-item';
        item.href = 'https://github.com/' + repo;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';

        const dot = document.createElement('span');
        dot.className = 'activity-dot';

        const box = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = action + ' · ' + repo;

        const meta = document.createElement('small');
        meta.textContent = when;

        box.append(title, meta);
        item.append(dot, box);
        return item;
      });

      feed.replaceChildren(...nodes);
    };

    let cached = null;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.timestamp && Array.isArray(parsed.events) && now - parsed.timestamp < cacheTtl) {
          cached = parsed.events;
        }
      }
    } catch {
      cached = null;
    }

    if (cached) {
      renderEvents(cached);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);

    fetch('https://api.github.com/users/paladuguganeshnaidu/events/public?per_page=12', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('GitHub request failed')))
      .then(events => {
        if (Array.isArray(events)) {
          renderEvents(events);
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              timestamp: Date.now(),
              events
            }));
          } catch {
            // Storage may be disabled or full; the live result is still usable.
          }
        }
      })
      .catch(() => {
        if (!cached) {
          setFeedMessage(feed, 'Live GitHub activity is temporarily unavailable. The project archive remains fully indexed and browsable.');
        }
      })
      .finally(() => window.clearTimeout(timeout));
  }

  // Hero 3D scene.
  const scene = document.querySelector('[data-scene]');
  if (scene && !reduceMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
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
    host?.addEventListener('pointermove', event => setPointer(event.clientX, event.clientY), { passive: true });
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

  const profileImage = document.querySelector('img[data-profile-image]');
  if (profileImage) {
    profileImage.addEventListener('error', () => {
      profileImage.src = 'images/profile/ganesh-naidu.jpg';
    }, { once: true });
  }
})();
