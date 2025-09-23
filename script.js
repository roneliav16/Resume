/* ---------- Data (edit only here to add links/videos) ---------- */
const PROJECTS = [
  {
    id: "rentmate",
    title: "Full Stack Project – RentMate (2025)",
    category: "fullstack",
    badge: "Full-Stack",
    desc: "Online rental marketplace with login, cart, checkout, purchase history, AI price suggestions, stats, dispute center, profile mgmt, admin panel, DoS protection, and automated testing.",
    repo: "https://github.com/roneliav16/RentMate",             // ← GitHub
    demo: "https://rentmate-lweq.onrender.com/index.html",       // ← Live demo
    video: "",                                                   // ← YouTube/MP4 optional
    tags: ["Node.js", "Express", "HTML/CSS/JS", "AI", "Testing"],
    bullets: [
      "Cookie-based sessions, JSON persistence on disk",
      "AI price suggestions (Gemini + Tavily) in chat",
      "Admin dashboard, dispute center, rate limiting"
    ]
  },
  {
    id: "os-ex1",
    title: "Operating Systems – Exercise 1",
    category: "os",
    badge: "OS",
    desc: "Synchronization primitives in C: semaphores (TAS & Ticket Lock), condition variables, RW locks, TLS, producer–consumer.",
    repo: "", demo: "", video: "",
    tags: ["C", "Concurrency", "Synchronization"],
    bullets: []
  },
  {
    id: "os-ex2",
    title: "Operating Systems – Exercise 2",
    category: "os",
    badge: "OS",
    desc: "User-level threading lib: round-robin, sigsetjmp/siglongjmp, virtual timer interrupts, TCBs.",
    repo: "", demo: "", video: "",
    tags: ["C", "Threads", "Scheduling"],
    bullets: []
  },
  {
    id: "os-ex3",
    title: "Operating Systems – Exercise 3",
    category: "os",
    badge: "OS",
    desc: "Block-based filesystem (OnlyFiles) on a 10MB virtual disk: create/delete/read/write + metadata.",
    repo: "", demo: "", video: "",
    tags: ["C", "Filesystem"],
    bullets: []
  },
  {
    id: "os-final",
    title: "Operating Systems – Final Project",
    category: "os",
    badge: "OS",
    desc: "Modular multithreaded string-processing pipeline with dynamically loaded plugins (uppercaser, flipper, logger), thread-safe queues and clean shutdown.",
    repo: "", demo: "", video: "",
    tags: ["C", "dlopen", "Plugins", "Queues"],
    bullets: []
  },
  {
    id: "ml",
    title: "Machine Learning from Data",
    category: "ml",
    badge: "ML",
    desc: "Decision trees with pruning, logistic regression with GD, Poisson MLE, k-means for image segmentation.",
    repo: "", demo: "", video: "",
    tags: ["Python", "ML"],
    bullets: []
  },
  {
    id: "digital",
    title: "Digital System (NAND2TETRIS)",
    category: "digital",
    badge: "Digital",
    desc: "P1–P11: gates→ALU→memory→CPU, Hack assembly, assembler, VM translator I/II, Jack game (Minesweeper), started Jack→VM compiler; OS libs planned, not completed.",
    repo: "", demo: "", video: "",
    tags: ["HDL", "Assembler", "VM", "Jack"],
    bullets: []
  },
  {
    id: "csharp",
    title: "OOP in .NET (C#)",
    category: "csharp",
    badge: "C#",
    desc: "Ex1 Assemblies/MSIL; Ex2 Bulls&Cows (Console); Ex3 Garage (OOP, enums, exceptions); Ex4 Hierarchical Menus (interfaces & delegates); Ex5 Bulls&Cows (WinForms).",
    repo: "", demo: "", video: "",
    tags: ["C#", ".NET", "OOP", "WinForms"],
    bullets: []
  },
  { id: "fun-run", title: "Fun Run game (2017)", category: "misc", badge:"Game",
    desc:"High-school cyber programming project (Python).", repo:"", demo:"", video:"",
    tags:["Python"], bullets:[] },
  { id: "snake", title: "Snake (Assembly)", category: "misc", badge:"Game",
    desc:"High-school dissertation in assembly programming.", repo:"", demo:"", video:"",
    tags:["Assembly"], bullets:[] },
  { id: "ds-hw2", title: "Data Structures HW2", category: "misc", badge:"Java",
    desc:"Course assignment in Java.", repo:"", demo:"", video:"",
    tags:["Java"], bullets:[] },
  { id: "ds-hw5", title: "Data Structures HW5", category: "misc", badge:"Java",
    desc:"Sorting algorithms & graph analysis (Java).", repo:"", demo:"", video:"",
    tags:["Java", "Algorithms"], bullets:[] },
  { id: "intro2cs", title: "IntroToCS", category: "misc", badge:"Java",
    desc:"Projects 5–9, increasing difficulty; 9 includes small ChatGPT-like features.", repo:"", demo:"", video:"",
    tags:["Java"], bullets:[] },
];

/* ---------- Helpers ---------- */
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

function createTag(tag, className, text){
  const el = document.createElement(tag);
  if(className) el.className = className;
  if(text) el.textContent = text;
  return el;
}

/* ---------- Render ---------- */
function renderProjects(list){
  const ul = qs('#project-list');
  const tpl = qs('#card-tpl');
  ul.innerHTML = '';
  list.forEach(p=>{
    const li = tpl.content.firstElementChild.cloneNode(true);

    // Title + link
    const a = qs('.card__link', li);
    a.textContent = p.title;
    a.href = p.demo || p.repo || '#';
    a.target = p.demo || p.repo ? '_blank' : '_self';
    a.rel = 'noopener';

    // Badge
    qs('.badge', li).textContent = p.badge || p.category;

    // Desc
    qs('.card__desc', li).textContent = p.desc;

    // Tags
    const tags = qs('.tags', li);
    (p.tags || []).forEach(t => tags.appendChild(createTag('li', null, t)));

    // Actions
    const repoBtn = qs('.repo', li);
    if(p.repo){ repoBtn.href = p.repo; repoBtn.hidden = false; }
    const demoBtn = qs('.demo', li);
    if(p.demo){ demoBtn.href = p.demo; demoBtn.hidden = false; }

    // More (bullets + optional video)
    const moreBtn = qs('.more', li);
    const moreId = `more-${p.id}`;
    moreBtn.setAttribute('aria-controls', moreId);
    const more = qs('.card__more', li);
    more.id = moreId;

    if(p.video){
      const vw = qs('.video-wrap', li);
      vw.hidden = false;
      // If YouTube URL, embed iframe; else try <video>
      if(p.video.includes('youtube.com') || p.video.includes('youtu.be')){
        const iframe = document.createElement('iframe');
        iframe.src = p.video.replace('watch?v=', 'embed/'); // simple transform
        iframe.title = `${p.title} demo video`;
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        vw.appendChild(iframe);
      } else {
        const vid = document.createElement('video');
        vid.src = p.video; vid.controls = true; vid.preload = 'none';
        vw.appendChild(vid);
      }
    }

    const bullets = qs('.bullets', li);
    (p.bullets || []).forEach(b => bullets.appendChild(createTag('li', null, b)));
    if(!(p.video || (p.bullets && p.bullets.length))) {
      // If nothing to show, hide More button
      moreBtn.hidden = true;
    }

    // Toggle more
    moreBtn.addEventListener('click', ()=>{
      const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
      more.hidden = expanded;
      moreBtn.setAttribute('aria-expanded', String(!expanded));
      moreBtn.textContent = expanded ? 'More' : 'Less';
    });

    // Hash deep-link (#id)
    li.id = p.id;
    a.addEventListener('click', e=>{
      if(!a.hash && li.id) history.replaceState(null, '', `#${li.id}`);
    });

    ul.appendChild(li);
  });
  ul.setAttribute('aria-busy', 'false');
}

/* ---------- Search & Filter ---------- */
function applySearchFilter(){
  const term = qs('#search').value.trim().toLowerCase();
  const cat = qs('#filter').value;
  let list = PROJECTS;
  if(cat !== 'all') list = list.filter(p => p.category === cat);
  if(term){
    list = list.filter(p =>
      p.title.toLowerCase().includes(term) ||
      (p.tags||[]).some(t => t.toLowerCase().includes(term)) ||
      (p.desc||'').toLowerCase().includes(term)
    );
  }
  renderProjects(list);
}

/* ---------- Back to top ---------- */
function backToTop(){
  const btn = qs('#backToTop');
  const toggle = () => {
    if(window.scrollY > 400){ btn.classList.add('show'); }
    else { btn.classList.remove('show'); }
  };
  window.addEventListener('scroll', toggle, {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  toggle();
}

/* ---------- Keyboard shortcuts ---------- */
function shortcuts(){
  window.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase() === '/' && !e.metaKey && !e.ctrlKey){
      e.preventDefault();
      qs('#search').focus();
    }
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // If URL has #id, scroll to it after render
  const hash = location.hash.slice(1);
  applySearchFilter();
  qs('#search').addEventListener('input', applySearchFilter);
  qs('#filter').addEventListener('change', applySearchFilter);
  backToTop();
  shortcuts();

  if(hash){
    const el = document.getElementById(hash);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
});
