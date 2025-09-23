/* We render full original text (exactly as in your initial HTML).
   For rich text & line breaks we use innerHTML. */

const PROJECTS = [
  {
    id: "rentmate",
    title: "Full Stack Project – RentMate (2025):",
    category: "fullstack",
    badge: "Full-Stack",
    // Full original sentence (kept) with bold and link at end
    desc: `Developed an online rental marketplace with user registration/login, cart, checkout, and purchase history (disk persistence). Extended functionality: <strong>RentMate AI</strong> - price suggestions in AI Chat Box for current optimal price (using Gemini and Tavily), user stats, dispute center, profile management, an admin panel, DoS protection, and automated testing using node-fetch. <a href="https://rentmate-lweq.onrender.com/index.html" target="_blank" rel="noopener">https://rentmate-lweq.onrender.com/index.html</a>`,
    repo: "https://github.com/roneliav16/RentMate",
    demo: "https://rentmate-lweq.onrender.com/index.html",
    video: "",
    tags: ["Node.js","Express","HTML/CSS/JS","AI","Testing"],
    bullets: []
  },
  {
    id: "os-ex1",
    title: "Operating Systems – Exercise 1:",
    category: "os",
    badge: "OS",
    desc: `Implemented core synchronization primitives in C, including semaphores (TAS & Ticket Lock), condition variables, read–write locks, thread-local storage, and a producer–consumer system.`,
    repo: "", demo: "", video: "", tags: ["C","Concurrency","Synchronization"], bullets: []
  },
  {
    id: "os-ex2",
    title: "Operating Systems – Exercise 2:",
    category: "os",
    badge: "OS",
    desc: `Built a user-level threading library in C using round-robin scheduling, context switching with sigsetjmp/siglongjmp, virtual timer interrupts, and thread control blocks.`,
    repo: "", demo: "", video: "", tags: ["C","Threads","Scheduling"], bullets: []
  },
  {
    id: "os-ex3",
    title: "Operating Systems – Exercise 3:",
    category: "os",
    badge: "OS",
    desc: `Designed and implemented a simple block-based filesystem ("OnlyFiles") in C, supporting file creation, deletion, read/write, and metadata management on a 10MB virtual disk.`,
    repo: "", demo: "", video: "", tags: ["C","Filesystem"], bullets: []
  },
  {
    id: "os-final",
    title: "Operating Systems – Final Project:",
    category: "os",
    badge: "OS",
    desc: `Developed a modular multithreaded string-processing pipeline in C, with dynamically loaded plugins (e.g., uppercaser, flipper, logger). Implemented thread-safe producer–consumer queues, synchronization mechanisms, and clean shutdown via dynamic linking.`,
    repo: "", demo: "", video: "", tags: ["C","Plugins","Queues"], bullets: []
  },
  {
    id: "ml",
    title: "Machine Learning from Data:",
    category: "ml",
    badge: "ML",
    desc: `5 Full projects including: Implemented decision trees with pruning, logistic regression with gradient descent, Poisson MLE estimations, and k-means clustering for image segmentation.`,
    repo: "", demo: "", video: "", tags: ["Python","ML"], bullets: []
  },
  {
    id: "digital",
    title: "Digital System (Nand2Tetris):",
    category: "digital",
    badge: "Digital",
    // Keep the exact long, multi-line content with <br> breaks
    desc: `Project 1 – Implemented elementary logic gates (NAND, AND, OR, XOR, MUX, DMUX).<br>
           Project 2 – Built adders and a basic ALU.<br>
           Project 3 – Implemented memory chips (DFF, registers, RAM, counters).<br>
           Project 4 – Wrote Hack assembly programs (multiplication, drawing, loops).<br>
           Project 5 – Built the Hack CPU (ALU + registers + program counter).<br>
           Project 6 – Developed an assembler to translate Hack assembly into binary machine code.<br>
           Project 7 – VM Translator I (stack arithmetic: push/pop, arithmetic, logic).<br>
           Project 8 – VM Translator II (control flow & functions: labels, branching, calls, returns).<br>
           Project 9 – High-Level Language in Jack: implemented the game <em>Minesweeper</em>.<br>
           Project 10 – Began developing a Jack→VM compiler.<br>
           Project 11 – Planned OS libraries in Jack (Math, Memory, Screen, Keyboard) but not completed.`,
    repo: "", demo: "", video: "", tags: ["HDL","Assembler","VM","Jack"], bullets: []
  },
  {
    id: "csharp",
    title: "OOP in .NET (C#):",
    category: "csharp",
    badge: "C#",
    // Keep your original lines and bolds
    desc: `Exercise 1 – Assemblies & MSIL Exploration: Investigated .NET assemblies using ildasm, explored PE structure, MSIL code, and metadata. Practiced code inspection and analysis of managed code.<br>
           <br>
           Exercise 2 – Bulls & Cows Game: Implemented the classic logic game <em>Bulls and Cows</em> in a console app, using OOP principles, arrays/collections, and external DLL utilities for screen handling.<br>
           <br>
           Exercise 3 – Garage Management System: Built a full OOP system to manage a garage with cars, motorcycles, trucks (fuel/electric), using inheritance, polymorphism, enums, exceptions, and collections. Included operations like refueling, inflating tires, and vehicle state tracking.<br>
           <br>
           Exercise 4 – Hierarchical Menus with Interfaces & Delegates: Developed a reusable hierarchical menu system in the console, demonstrating <strong>interfaces</strong>, <strong>delegates/events</strong>, and polymorphism. Supported multiple navigation layers and user actions.<br>
           <br>
           Exercise 5 – Bulls & Cows (WinForms): Extended the Bulls & Cows game to a <strong>Windows Forms GUI</strong>, practicing event-driven programming, UI controls, and separation between game logic and presentation.`,
    repo: "", demo: "", video: "", tags: ["C#",".NET","OOP","WinForms"], bullets: []
  },
  {
    id: "fun-run",
    title: "Fun Run game (2017):",
    category: "misc",
    badge: "Game",
    desc: `Dissertation in high school cyber programming and system design. There are explanatory videos for running the game in Run instructions. Written in the PYTHON programming language.`,
    repo: "", demo: "", video: "", tags: ["Python"], bullets: []
  },
  {
    id: "snake",
    title: "Snake (Assembly):",
    category: "misc",
    badge: "Game",
    desc: `Dissertation in high school assembly programming. There is an explanatory video for running the game in Run instructions. Written in ASSEMBLY programming language.`,
    repo: "", demo: "", video: "", tags: ["Assembly"], bullets: []
  },
  {
    id: "ds-hw2",
    title: "Data Structures HW2:",
    category: "misc",
    badge: "Java",
    desc: `This is work in a data structures course at Reichman University. Written in the JAVA programming language.`,
    repo: "", demo: "", video: "", tags: ["Java"], bullets: []
  },
  {
    id: "ds-hw5",
    title: "Data Structures HW5:",
    category: "misc",
    badge: "Java",
    desc: `This is work in a data structures course at Reichman University. Combines different sorting algorithms and their analysis using a graph. Written in the JAVA programming language.`,
    repo: "", demo: "", video: "", tags: ["Java","Algorithms"], bullets: []
  },
  {
    id: "intro2cs",
    title: "IntroToCS:",
    category: "misc",
    badge: "Java",
    desc: `File folder of projects of Introduction to Computer Science course at Reichman University. These are projects 5-9 that we were asked to write in the course. They are of increasing difficulty, so that work 9 incorporates characteristics of a small CHATGPT.`,
    repo: "", demo: "", video: "", tags: ["Java"], bullets: []
  }
];

const qs = (s,el=document)=>el.querySelector(s);
function createTag(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e;}

function renderProjects(list){
  const ul=qs('#project-list'); const tpl=qs('#card-tpl'); ul.innerHTML='';
  list.forEach(p=>{
    const li=tpl.content.firstElementChild.cloneNode(true);

    // title + main link
    const a=qs('.card__link',li);
    a.textContent=p.title;
    a.href=p.demo || p.repo || '#';

    // badge
    qs('.badge',li).textContent=p.badge || p.category;

    // description (preserve original HTML with <br>, <em>, <strong>, links)
    const descEl = qs('.card__desc', li);
    descEl.innerHTML = p.desc;

    // tags
    const tags=qs('.tags',li);
    (p.tags||[]).forEach(t=>tags.appendChild(createTag('li',null,t)));

    // actions
    const repoBtn=qs('.repo',li); if(p.repo){repoBtn.href=p.repo; repoBtn.hidden=false;}
    const demoBtn=qs('.demo',li); if(p.demo){demoBtn.href=p.demo; demoBtn.hidden=false;}

    // bullets (optional)
    const bullets=qs('.bullets',li);
    (p.bullets||[]).forEach(b=>bullets.appendChild(createTag('li',null,b)));

    // video placeholder visible only if provided
    if(p.video){const vw=qs('.video-wrap',li);vw.hidden=false;}

    li.id=p.id;
    ul.appendChild(li);
  });
  ul.setAttribute('aria-busy','false');
}

function applySearchFilter(){
  const term=qs('#search').value.toLowerCase(),cat=qs('#filter').value;
  let list=PROJECTS;
  if(cat!=='all') list=list.filter(p=>p.category===cat);
  if(term){
    list=list.filter(p =>
      p.title.toLowerCase().includes(term) ||
      (p.desc||'').toLowerCase().includes(term) ||
      (p.tags||[]).some(t=>t.toLowerCase().includes(term))
    );
  }
  renderProjects(list);
}

function backToTop(){
  const btn=qs('#backToTop');
  const toggle=()=>{ if(window.scrollY>400)btn.classList.add('show'); else btn.classList.remove('show'); };
  window.addEventListener('scroll',toggle,{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  toggle();
}

document.addEventListener('DOMContentLoaded',()=>{
  applySearchFilter();
  qs('#search').addEventListener('input',applySearchFilter);
  qs('#filter').addEventListener('change',applySearchFilter);
  backToTop();
});
