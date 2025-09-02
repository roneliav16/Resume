document.addEventListener('DOMContentLoaded', async () => {
  const itemsContainer = document.getElementById('checkout-items');
  const totalPriceEl = document.getElementById('total-price');
  const confirmBtn = document.getElementById('confirmBtn');

  let cart = [];
  let selected = new Set(); // indexes of selected lines

  // Recompute total price only for selected lines
  function recomputeTotal() {
    let total = 0;
    selected.forEach(i => {
      const it = cart[i];
      if (it) total += (it.price * it.days);
    });
    totalPriceEl.textContent = `Total: $${total}`;
  }

  // "Select all" header
  function renderSelectAll() {
    const wrap = document.createElement('div');
    wrap.className = 'select-controls';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '.5rem';
    wrap.style.margin = '.5rem 0 1rem';
    wrap.innerHTML = `
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;">
        <input type="checkbox" id="selectAll" checked>
        <span>Select all</span>
      </label>
    `;
    itemsContainer.prepend(wrap);
    const selectAll = wrap.querySelector('#selectAll');
    selectAll.addEventListener('change', (e) => {
      selected.clear();
      const allCbs = itemsContainer.querySelectorAll('.item-select');
      if (e.target.checked) {
        for (let i = 0; i < cart.length; i++) selected.add(i);
        allCbs.forEach(cb => cb.checked = true);
      } else {
        allCbs.forEach(cb => cb.checked = false);
      }
      recomputeTotal();
    });
  }

  try {
    // Fetch current cart
    const res = await fetch('/api/cart', { method: 'GET', credentials: 'include' });
    cart = await res.json();
    if (!Array.isArray(cart)) cart = [];

    // Default: select all
    for (let i = 0; i < cart.length; i++) selected.add(i);

    // Render optional "Select all"
    renderSelectAll();

    // Render each line with a checkbox
    cart.forEach((item, idx) => {
      const name = item.title || item.name || `Item ${idx + 1}`;
      const lineTotal = item.price * item.days;

      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = `
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;flex:1">
          <input type="checkbox" class="item-select" data-idx="${idx}" checked>
          <span><strong>${name}</strong> (${item.days} days)</span>
        </label>
        <span>$${lineTotal}</span>
      `;
      itemsContainer.appendChild(row);
    });

    // Keep selection + totals in sync
    itemsContainer.addEventListener('change', (e) => {
      if (!e.target.classList.contains('item-select')) return;
      const idx = parseInt(e.target.dataset.idx, 10);
      if (e.target.checked) selected.add(idx); else selected.delete(idx);

      // Sync "Select all" checkbox
      const all = itemsContainer.querySelectorAll('.item-select');
      const allChecked = Array.from(all).every(cb => cb.checked);
      const selectAll = document.getElementById('selectAll');
      if (selectAll) selectAll.checked = allChecked;

      recomputeTotal();
    });

    // Initial total
    recomputeTotal();

    // On confirm, persist selected indexes and go to payment
    confirmBtn.addEventListener('click', () => {
      const chosen = Array.from(selected);
      if (chosen.length === 0) {
        alert('Please select at least one item to proceed.');
        return;
      }
      // pass selection to the payment page
      sessionStorage.setItem('checkout.selectedIdxs', JSON.stringify(chosen)); 
      window.location.href = 'payment.html';
    });

  } catch (err) {
    console.error('Failed to load cart for checkout:', err);
    itemsContainer.innerHTML = '<p>Failed to load items.</p>';
    totalPriceEl.textContent = 'Total: $0';
  }
});
