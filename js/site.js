(() => {
 const nav=document.querySelector('.navlinks'),menu=document.querySelector('.menu');
 if(menu) menu.onclick=()=>nav.classList.toggle('open');
 document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
 const path=location.pathname.split('/').pop()||'index.html';
 document.querySelectorAll('.navlinks a').forEach(a=>{const href=a.getAttribute('href')||'';if(href.endsWith(path)||(path==='index.html'&&href==='/'))a.classList.add('active')});
 const filterButtons=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('[data-type]')];
 filterButtons.forEach(btn=>btn.addEventListener('click',()=>{filterButtons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(c=>c.hidden=!(f==='all'||c.dataset.type===f))}));
 const feed=document.querySelector('#github-feed');
 if(feed) fetch('https://api.github.com/users/paladuguganeshnaidu/events/public?per_page=12').then(r=>r.ok?r.json():Promise.reject()).then(events=>{feed.innerHTML=events.slice(0,8).map(e=>{const repo=e.repo?.name||'GitHub',when=new Date(e.created_at).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}),action=e.type.replace('Event','').replace(/([A-Z])/g,' $1').trim();return '<a class="activity-item" href="https://github.com/'+repo+'" target="_blank" rel="noopener"><span class="activity-dot"></span><div><strong>'+action+'</strong> · '+repo+'<small>'+when+'</small></div></a>'}).join('')||'<p class="muted">No recent public activity returned by GitHub.</p>'}).catch(()=>feed.innerHTML='<p class="muted">Live GitHub activity is temporarily unavailable. Use the GitHub profile for the current stream.</p>');
})();