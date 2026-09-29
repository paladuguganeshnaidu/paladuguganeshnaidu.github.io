(() => {
  const nav = document.querySelector('.navlinks');
  const menu = document.querySelector('.menu');
  if (menu && nav) menu.addEventListener('click', () => nav.classList.toggle('open'));

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.endsWith(path) || (path === 'index.html' && href === 'index.html')) a.classList.add('active');
  });

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
          const when = event.created_at ? new Date(event.created_at).toLocaleString(undefined, {dateStyle:'medium', timeStyle:'short'}) : '';
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

  const scene = document.querySelector('[data-scene]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (scene && !reduce) {
    let tx = 0, ty = 0, rx = 0, ry = 0;
    const setPointer = (x, y, rect) => {
      tx = ((x - rect.left) / rect.width - .5) * 2;
      ty = ((y - rect.top) / rect.height - .5) * 2;
    };
    scene.parentElement?.addEventListener('pointermove', e => {
      const rect = scene.parentElement.getBoundingClientRect();
      setPointer(e.clientX, e.clientY, rect);
    }, {passive:true});
    scene.parentElement?.addEventListener('pointerleave', () => { tx = 0; ty = 0; }, {passive:true});
    const frame = () => {
      rx += (ty * -8 - rx) * .055;
      ry += (tx * 10 - ry) * .055;
      scene.style.setProperty('--scene-rx', rx.toFixed(2) + 'deg');
      scene.style.setProperty('--scene-ry', ry.toFixed(2) + 'deg');
      scene.style.transform = 'perspective(900px) rotateX(var(--scene-rx)) rotateY(var(--scene-ry))';
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
})();
  const field = document.querySelector('.global-field');
  if (field) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    let target = 0, currentScroll = 0;
    const tick = () => {
      target = window.scrollY || 0;
      currentScroll += (target - currentScroll) * (reduce ? .2 : .055);
      root.style.setProperty('--page-scroll', currentScroll.toFixed(2));
      root.style.setProperty('--field-y', Math.round(currentScroll * -0.025) + 'px');
      if (!reduce) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const profileImage = document.querySelector('img[data-profile-image]');
  if (profileImage) {
    profileImage.addEventListener('error', () => {
      profileImage.src = 'images/profile/ganesh-naidu.jpg';
    }, {once:true});
  }
})();