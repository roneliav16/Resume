// --- Theme toggle with persistence (auto / light / dark) ---
(function themeInit(){
  const root = document.documentElement;
  const saved = localStorage.getItem('ron.theme');
  if(saved === 'light' || saved === 'dark'){ root.setAttribute('data-theme', saved); }
  else { root.setAttribute('data-theme', 'auto'); }
})();
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  btn?.addEventListener('click', () => {
    const curr = root.getAttribute('data-theme') || 'auto';
    const next = curr === 'dark' ? 'light' : (curr === 'light' ? 'auto' : 'dark');
    root.setAttribute('data-theme', next);
    localStorage.setItem('ron.theme', next);
    btn.setAttribute('aria-label', `Theme: ${next}`);
  });
});

// --- Back to top ---
(function backToTop(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;
  const onScroll = () => { if (window.scrollY > 400) btn.classList.add('show'); else btn.classList.remove('show'); };
  window.addEventListener('scroll', onScroll, {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  onScroll();
})();

// --- Progressive enhancements for your <ul><li> content ---
document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.projects-list');
  if(!list) return;

  // 1) Linkify plain URLs
  const walker = document.createTreeWalker(list, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    const txt = node.nodeValue;
    if(!txt) return;
    const replaced = txt.replace(/(https?:\/\/[^\s<]+)/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
    if (replaced !== txt) {
      const span = document.createElement('span');
      span.innerHTML = replaced;
      node.parentNode.replaceChild(span, node);
    }
  });

  // 2) Wrap videos/iframes if not wrapped + add "Open in lightbox" button
  list.querySelectorAll('li').forEach(li => {
    li.querySelectorAll('video, iframe').forEach(el => {
      let wrap = el.closest('.video-wrap');
      if(!wrap){
        wrap = document.createElement('div');
        wrap.className = 'video-wrap';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
      }
      // Add expand button only for <video>
      if(el.tagName.toLowerCase()==='video' && !li.querySelector('.btn-expand')) {
        const btn = document.createElement('button');
        btn.className = 'btn btn--ghost btn-expand';
        btn.textContent = 'Open Fullscreen';
        btn.addEventListener('click', () => openLightbox(el.currentSrc || el.src));
        const actions = li.querySelector('.project-actions') || li.appendChild(Object.assign(document.createElement('div'), {className: 'project-actions'}));
        actions.appendChild(btn);
      }

      // Clicking the video itself opens lightbox
      if(el.tagName.toLowerCase()==='video'){
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => openLightbox(el.currentSrc || el.src));
      }
    });
  });

  // 3) Category chips (auto from data-category)
  const chipsHost = document.getElementById('autoChips');
  if(chipsHost){
    const cats = [...new Set([...list.querySelectorAll('li')].map(li => li.dataset.category || 'misc'))];
    cats.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = cat;
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', () => {
        const pressed = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', String(!pressed));
        document.getElementById('filter').value = pressed ? 'all' : cat;
        applyFilters();
      });
      chipsHost.appendChild(chip);
    });
  }

  // 4) Search & filter & sort (preserve original order by default)
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  const sortBtn = document.getElementById('sortBtn');
  const items = [...list.children]; // original order snapshot

  function applyFilters(){
    const term = (search?.value || '').toLowerCase().trim();
    const cat = filter?.value || 'all';
    const sortAlt = sortBtn?.getAttribute('aria-pressed') === 'true';

    // Filter
    const lis = [...list.querySelectorAll('li')];
    lis.forEach(li => {
      const text = li.textContent.toLowerCase();
      const liCat = li.dataset.category || 'misc';
      const okSearch = !term || text.includes(term);
      const okCat = (cat === 'all') || (liCat === cat);
      li.style.display = (okSearch && okCat) ? '' : 'none';
    });

    // Sort: Original vs Alphabetic by title
    if(sortAlt){
      const visible = lis.filter(li => li.style.display !== 'none');
      visible.sort((a,b) => {
        const ta = a.querySelector('strong')?.innerText?.toLowerCase() || a.innerText.toLowerCase();
        const tb = b.querySelector('strong')?.innerText?.toLowerCase() || b.innerText.toLowerCase();
        return ta.localeCompare(tb);
      }).forEach(li => list.appendChild(li));
    } else {
      // restore original order (only visible stay visible)
      items.forEach(li => list.appendChild(li));
    }
  }

  search?.addEventListener('input', applyFilters);
  filter?.addEventListener('change', applyFilters);
  sortBtn?.addEventListener('click', () => {
    const curr = sortBtn.getAttribute('aria-pressed') === 'true';
    sortBtn.setAttribute('aria-pressed', String(!curr));
    sortBtn.textContent = !curr ? 'Sort: A–Z' : 'Sort: Original';
    applyFilters();
  });

  applyFilters();

  // 5) Copy link buttons
  list.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sel = btn.getAttribute('data-copy');
      const el = sel ? document.querySelector(sel) : btn.closest('li');
      if(!el || !el.id) return;
      const url = `${location.origin}${location.pathname}#${el.id}`;
      try{
        await navigator.clipboard.writeText(url);
        flash(btn, 'Copied!');
      }catch{
        prompt('Copy link:', url);
      }
    });
  });

  // 6) Expand button (scrolls to item; if יש וידאו — פותח לייטבוקס מיד)
  list.querySelectorAll('.btn-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = btn.getAttribute('data-target');
      const target = sel ? document.querySelector(sel) : btn.closest('li');
      if(!target) return;
      target.scrollIntoView({behavior:'smooth', block:'start'});
      const vid = target.querySelector('video');
      if(vid && (vid.currentSrc || vid.src)){
        setTimeout(()=> openLightbox(vid.currentSrc || vid.src), 250);
      }
    });
  });
});

// --- Lightbox for local videos ---
function openLightbox(src){
  const dlg = document.getElementById('lightbox');
  const body = dlg?.querySelector('.lightbox__body');
  const closeBtn = dlg?.querySelector('.lightbox__close');
  if(!dlg || !body) return;

  body.innerHTML = '';
  const vid = document.createElement('video');
  vid.src = src;
  vid.controls = true;
  vid.autoplay = true;
  vid.style.width = '100%';
  body.appendChild(vid);

  dlg.showModal();

  function onClose(){
    vid.pause?.();
    dlg.close();
    body.innerHTML = '';
    closeBtn?.removeEventListener('click', onClose);
    dlg.removeEventListener('click', onBackdrop);
    document.removeEventListener('keydown', onEsc);
  }
  function onBackdrop(e){
    if(e.target === dlg) onClose();
  }
  function onEsc(e){
    if(e.key === 'Escape') onClose();
  }

  closeBtn?.addEventListener('click', onClose);
  dlg.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onEsc);
}

// --- Small helper: button flash feedback ---
function flash(el, text='Done'){
  if(!el) return;
  const old = el.textContent;
  el.disabled = true;
  el.textContent = text;
  setTimeout(()=>{
    el.textContent = old;
    el.disabled = false;
  }, 1200);
}
