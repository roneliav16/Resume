document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('#github-projects .projects-list');
  if (!list) return; 

  // 1) לעטוף וידאו/iframe ב-video-wrap אם לא עטוף
  list.querySelectorAll('li').forEach(li => {
    li.querySelectorAll('video, iframe').forEach(el => {
      if (!el.closest('.video-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'video-wrap';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
      }
    });
  });

  // 2) להפוך כתובות חשופות ללינקים (לא נוגע בקישורים שכבר עטופים ב-<a>)
  list.querySelectorAll('li').forEach(li => {
    // נבצע החלפה רק בטקסטים בסיסיים כדי לא לשבור HTML קיים:
    // נחליף כתובות חשופות שלא כבר בתוך תגית <a>
    const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, null);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);

    texts.forEach(node => {
      const txt = node.nodeValue;
      if (!txt) return;
      const replaced = txt.replace(/(https?:\/\/[^\s<]+)/g, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
      if (replaced !== txt) {
        const span = document.createElement('span');
        span.innerHTML = replaced;
        node.parentNode.replaceChild(span, node);
      }
    });
  });
});

