document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('#github-projects .projects-list');
  if (!list) return;

  // 1) עטיפה אוטומטית לוידאו מקומי (MP4) או iframes, אם הדבקת אותם בלי wrapper
  list.querySelectorAll('li').forEach(li => {
    // find existing <video> or <iframe> not wrapped
    const vids = li.querySelectorAll('video, iframe');
    vids.forEach(el => {
      if (!el.closest('.video-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'video-wrap';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
      }
    });
  });

  // 2) הפיכת טקסטי URL חשופים ללינקים (למשל בסוף תיאור RentMate)
  list.querySelectorAll('li').forEach(li => {
    li.innerHTML = li.innerHTML.replace(
      /(https?:\/\/[^\s<]+)/g,
      (m) => {
        // אם כבר עטוף ב-<a> תשאיר כמו שהוא
        if (/<a\s[^>]*>.*<\/a>/i.test(m)) return m;
        return `<a href="${m}" target="_blank" rel="noopener">${m}</a>`;
      }
    );
  });
});
