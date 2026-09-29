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

  // Profile image fallback
  const profileImage = document.querySelector('img[data-profile-image]');
  if (profileImage) {
    profileImage.addEventListener('error', () => {
      profileImage.src = 'images/profile/ganesh-naidu.jpg';
    }, { once: true });
  }
})();
