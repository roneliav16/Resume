document.addEventListener('DOMContentLoaded', async () => {
  const ul = document.getElementById('list');

async function loadList() {
  const res = await fetch('/api/disputes', { credentials: 'include' });
  if (!res.ok) { alert('Failed to load disputes. You must log in !');
    window.location.href = "index.html"
    return;
 }
  const arr = await res.json();
  ul.innerHTML = '';

  // Prevent Dos Attack code !!
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  // Nice Date Format
  const fmt = iso => {
    try { return new Date(iso).toLocaleString(); } catch { return iso || ''; }
  };

  arr.forEach(d => {
    const li = document.createElement('li');
    li.className = 'dispute-item';
    li.dataset.id = d.id;

    const messages = Array.isArray(d.messages) ? d.messages : [];
    const messagesHtml = messages.map(m => `
      <li class="message">
        <div class="msg-meta">
          <span class="by">${esc(m.by || '')}</span>
          <span class="at">• ${esc(fmt(m.at))}</span>
        </div>
        <div class="msg-text">${esc(m.text || '')}</div>
      </li>
    `).join('');

    li.innerHTML = `
      <div class="row top">
        <span class="id">Dispute ID: #${esc(d.id)}</span>
        <span class="meta">• ${esc(d.type)}</span>
        <span class="meta">• product: ${esc(d.productId)}</span>
        <span class="grow"></span>
        <span class="badge status-${esc(d.status)}">${esc(d.status)}</span>
      </div>

      <div class="row meta">
        <span>openedBy: ${esc(d.openedBy)}</span>
        <span class="meta">•</span>
        <span>against: ${esc(d.against)}</span>
      </div>

      <div class="messages-wrap">
        <h4>Messages</h4>
        <ul class="messages">
          ${messagesHtml || '<li class="message empty">No messages yet</li>'}
        </ul>
      </div>

      <div class="actions">
        <textarea class="reply-input" placeholder="Write a reply..." rows="2"></textarea>
        <div class="btns">
          <button class="btn btn-reply">Reply</button>
          <button class="btn btn-resolve" ${d.status === 'resolved' ? 'disabled' : ''}>Resolve</button>
        </div>
      </div>
    `;

    ul.appendChild(li);
  });
}


  ul.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const li = e.target.closest('.dispute-item');
    const id = li?.dataset.id;
    if (!id) return;

    // Reply
    if (btn.classList.contains('btn-reply')) {
      const ta = li.querySelector('.reply-input');
      const text = (ta.value || '').trim();
      if (!text) return alert('Please enter a message');
      btn.disabled = true;
      try {
        const res = await fetch(`/api/disputes/${id}/reply`, {
          method:'POST', credentials:'include',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ text })
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || 'Reply failed');
        }
        ta.value = '';
        btn.textContent = 'Replied ✓';
        await loadList();
        setTimeout(() => {
            btn.textContent = 'Reply';
            btn.disabled = false;
            }, 800);
        } catch (err) {
        console.error(err);
        alert('Reply failed (maybe not authorized?)');
        btn.disabled = false;
      }
    }

    // Resolve
    if (btn.classList.contains('btn-resolve')) {
      if (!confirm('Mark this dispute as resolved?')) return;
      btn.disabled = true;
      try {
        const res = await fetch(`/api/disputes/${id}/resolve`, {
          method:'POST', credentials:'include'
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || 'Resolve failed');
        }

        await loadList();
      } catch (err) {
        console.error(err);
        alert('Resolve failed (only owner/admin can resolve?)');
        btn.disabled = false;
      }
    }
  });

  document.getElementById('openForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = await fetch('/api/disputes', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        productId: fd.get('productId'),
        type: fd.get('type'),
        description: fd.get('description')
      })
    });
    console.log(JSON.stringify({
        productId: fd.get('productId'),
        type: fd.get('type'),
        description: fd.get('description')
      }));
    if (!res.ok) { alert('Create failed'); return; }
    e.target.reset();
    loadList();
  });

  loadList();
});