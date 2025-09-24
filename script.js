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

// --- Progressive enhancements for your <ul><li> content ---
document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.projects-list');
  if(!list) return;

  // 0) Clean up any pre-existing "Files" links and "Expand" buttons from HTML
  list.querySelectorAll('.project-actions a').forEach(a => {
    const text = a.textContent.trim().toLowerCase();
    if (text === 'files') a.remove();
  });
  list.querySelectorAll('.project-actions .btn-expand, .btn.btn--ghost.btn-expand').forEach(b => b.remove());

  // 0.1) Build/complete action buttons from data-* (without Files/Expand)
  //      data-live, data-github, data-video (video only controls media display)
  const ensureActionsFromData = (li) => {
    const dataset = li.dataset || {};
    let actions = li.querySelector('.project-actions');
    if(!actions){
      actions = document.createElement('div');
      actions.className = 'project-actions';
      li.appendChild(actions);
    }

    // helper to add <a> only if not present with same label
    const ensureLink = (text, href, extraClass) => {
      if(!href) return;
      const exists = [...actions.querySelectorAll('a')].some(a => a.textContent.trim() === text);
      if(exists) return;
      const a = document.createElement('a');
      if(extraClass) a.className = extraClass;
      a.href = href; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = text;
      actions.appendChild(a);
    };

    // helper to add <button> only if not present with same class
    const ensureBtn = (className, label, onClick) => {
      if(actions.querySelector(`.${className.split(' ').join('.')}`)) return;
      const b = document.createElement('button');
      b.className = className;
      b.textContent = label;
      if(onClick) b.addEventListener('click', onClick);
      actions.appendChild(b);
    };

    // Keep ONLY Live + GitHub
    ensureLink('Live Demo', dataset.live, 'primary');
    ensureLink('GitHub', dataset.github);

    // Copy Link always
    ensureBtn('btn btn--ghost btn-copy', 'Copy Link', async (e) => {
      const url = `${location.origin}${location.pathname}#${li.id || ''}`;
      try{
        await navigator.clipboard.writeText(url);
        flash(e.currentTarget, 'Copied!');
      }catch{
        prompt('Copy link:', url);
      }
    });

    // Inject inline video ONLY if data-video exists and no inline video yet
    // (No Expand button here)
    if(dataset.video && !li.querySelector('video')){
      const wrap = document.createElement('div');
      wrap.className = 'video-wrap';
      const v = document.createElement('video');
      v.src = dataset.video;
      v.controls = true;
      v.preload = 'none';
      v.style.cursor = 'pointer';
      v.addEventListener('click', () => openLightbox(v.currentSrc || v.src));
      wrap.appendChild(v);
      li.appendChild(wrap);
    }
  };

  // Run for all items
  list.querySelectorAll('li').forEach(ensureActionsFromData);

  // 1) Linkify plain URLs (kept)
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
      node.parentNode?.replaceChild(span, node);
    }
  });

  // 2) Wrap videos/iframes if not wrapped; remove any auto-creation of Expand buttons
  list.querySelectorAll('li').forEach(li => {
    li.querySelectorAll('video, iframe').forEach(el => {
      let wrap = el.closest('.video-wrap');
      if(!wrap){
        wrap = document.createElement('div');
        wrap.className = 'video-wrap';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
      }
      if(el.tagName.toLowerCase()==='video'){
        // Clicking the video itself opens lightbox
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => openLightbox(el.currentSrc || el.src));
      }
    });
  });

  // 3) Category chips (kept)
  const chipsHost = document.getElementById('autoChips');
  if(chipsHost){
    const cats = [...new Set([...list.querySelectorAll('li')].map(li => li.dataset.category || 'misc'))];
    cats.forEach(cat => {
      if([...chipsHost.children].some(c => c.textContent === cat)) return;
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = cat;
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', () => {
        const pressed = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', String(!pressed));
        const filter = document.getElementById('filter');
        if(filter){
          filter.value = pressed ? 'all' : cat;
          applyFilters();
        }
        window.location.hash = '#projects';
      });
      chipsHost.appendChild(chip);
    });
  }

  // 4) Search & filter & sort (kept)
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  const sortBtn = document.getElementById('sortBtn');
  const items = [...list.children]; // original order snapshot

  function applyFilters(){
    const term = (search?.value || '').toLowerCase().trim();
    const cat = filter?.value || 'all';
    const sortAlt = sortBtn?.getAttribute('aria-pressed') === 'true';

    const lis = [...list.querySelectorAll('li')];
    lis.forEach(li => {
      const text = li.textContent.toLowerCase();
      const liCat = li.dataset.category || 'misc';
      const okSearch = !term || text.includes(term);
      const okCat = (cat === 'all') || (liCat === cat);
      li.style.display = (okSearch && okCat) ? '' : 'none';
    });

    if(sortAlt){
      const visible = lis.filter(li => li.style.display !== 'none');
      visible.sort((a,b) => {
        const ta = a.querySelector('strong')?.innerText?.toLowerCase() || a.innerText.toLowerCase();
        const tb = b.querySelector('strong')?.innerText?.toLowerCase() || b.innerText.toLowerCase();
        return ta.localeCompare(tb);
      }).forEach(li => list.appendChild(li));
    } else {
      items.forEach(li => list.appendChild(li));
    }
  }
  window.applyFilters = applyFilters;

  search?.addEventListener('input', applyFilters);
  filter?.addEventListener('change', applyFilters);
  sortBtn?.addEventListener('click', () => {
    const curr = sortBtn.getAttribute('aria-pressed') === 'true';
    sortBtn.setAttribute('aria-pressed', String(!curr));
    sortBtn.textContent = !curr ? 'Sort: A–Z' : 'Sort: Original';
    applyFilters();
  });

  applyFilters();

  // 5) Copy link buttons (kept)
  list.querySelectorAll('.btn-copy').forEach(btn => {
    if(btn.__hasCopyHandler) return;
    btn.__hasCopyHandler = true;
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

  // 6) (Removed) Expand listeners — no-op
});
