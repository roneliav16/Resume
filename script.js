const PROJECTS = [
  {
    id:"rentmate",
    title:"Full Stack Project – RentMate (2025)",
    category:"fullstack",
    badge:"Full-Stack",
    desc:"Online rental marketplace with login, cart, checkout, purchase history, AI price suggestions, stats, dispute center, profile mgmt, admin panel, DoS protection, and automated testing.",
    repo:"https://github.com/roneliav16/RentMate",
    demo:"https://rentmate-lweq.onrender.com/index.html",
    video:"",
    tags:["Node.js","Express","HTML/CSS/JS","AI","Testing"],
    bullets:[
      "Cookie-based sessions, JSON persistence",
      "AI price suggestions (Gemini + Tavily)",
      "Admin dashboard, dispute center, rate limiting"
    ]
  },
  {id:"os-ex1",title:"Operating Systems – Exercise 1",category:"os",badge:"OS",
    desc:"Synchronization primitives in C: semaphores (TAS & Ticket Lock), condition variables, RW locks, TLS, producer–consumer.",
    repo:"",demo:"",video:"",tags:["C","Concurrency"],bullets:[]},
  {id:"os-ex2",title:"Operating Systems – Exercise 2",category:"os",badge:"OS",
    desc:"User-level threading lib: round-robin, sigsetjmp/siglongjmp, virtual timer interrupts, TCBs.",
    repo:"",demo:"",video:"",tags:["C","Threads"],bullets:[]},
  {id:"ml",title:"Machine Learning from Data",category:"ml",badge:"ML",
    desc:"Decision trees with pruning, logistic regression with GD, Poisson MLE, k-means for image segmentation.",
    repo:"",demo:"",video:"",tags:["Python","ML"],bullets:[]},
  {id:"digital",title:"Digital System (NAND2TETRIS)",category:"digital",badge:"Digital",
    desc:"P1–P11: gates→ALU→memory→CPU, Hack assembly, assembler, VM translator I/II, Jack game (Minesweeper), started Jack→VM compiler; OS libs planned, not completed.",
    repo:"",demo:"",video:"",tags:["HDL","Assembler"],bullets:[]},
  {id:"csharp",title:"OOP in .NET (C#)",category:"csharp",badge:"C#",
    desc:"Ex1 Assemblies/MSIL; Ex2 Bulls&Cows (Console); Ex3 Garage (OOP, enums, exceptions); Ex4 Hierarchical Menus (interfaces & delegates); Ex5 Bulls&Cows (WinForms).",
    repo:"",demo:"",video:"",tags:["C#",".NET"],bullets:[]},
];

const qs = (s,el=document)=>el.querySelector(s);
function createTag(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e;}

function renderProjects(list){
  const ul=qs('#project-list'); const tpl=qs('#card-tpl'); ul.innerHTML='';
  list.forEach(p=>{
    const li=tpl.content.firstElementChild.cloneNode(true);
    const a=qs('.card__link',li); a.textContent=p.title; a.href=p.demo||p.repo||'#';
    qs('.badge',li).textContent=p.badge;
    qs('.card__desc',li).textContent=p.desc;
    const tags=qs('.tags',li); (p.tags||[]).forEach(t=>tags.appendChild(createTag('li',null,t)));
    const repoBtn=qs('.repo',li); if(p.repo){repoBtn.href=p.repo; repoBtn.hidden=false;}
    const demoBtn=qs('.demo',li); if(p.demo){demoBtn.href=p.demo; demoBtn.hidden=false;}
    const bullets=qs('.bullets',li); (p.bullets||[]).forEach(b=>bullets.appendChild(createTag('li',null,b)));
    // וידאו
    if(p.video){const vw=qs('.video-wrap',li);vw.hidden=false;}
    li.id=p.id; ul.appendChild(li);
  });
  ul.setAttribute('aria-busy','false');
}

function applySearchFilter(){
  const term=qs('#search').value.toLowerCase(),cat=qs('#filter').value;
  let list=PROJECTS;
  if(cat!=='all') list=list.filter(p=>p.category===cat);
  if(term) list=list.filter(p=>p.title.toLowerCase().includes(term)||p.desc.toLowerCase().includes(term));
  renderProjects(list);
}

function backToTop(){const btn=qs('#backToTop');window.addEventListener('scroll',()=>{if(window.scrollY>400)btn.classList.add('show');else btn.classList.remove('show')});btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));}
document.addEventListener('DOMContentLoaded',()=>{applySearchFilter();qs('#search').addEventListener('input',applySearchFilter);qs('#filter').addEventListener('change',applySearchFilter);backToTop();});
