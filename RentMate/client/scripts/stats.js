document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/stats/my', { credentials: 'include' });
  if (!res.ok) {
    alert('Failed to load stats. Please log in !'); 
    window.location.href="index.html"
    return;
  }
  const data = await res.json();

  renderCards(data.cards);
  renderPopular(data.mostPopular);
  renderPriceChart(data.priceBuckets);
});

function renderCards(cards){
  const el = document.getElementById('cards');
  const defs = [
    { key:'productsCreated', label:'Products Created' },
    { key:'rentalsMade', label:'My Rentals' },
    { key:'rentalsFromMe', label:'Rentals From Me' },
    { key:'avgDaysRentedByMe', label:'Avg Days / Item' },
    { key:'addToCart', label:'Adds to Cart' },
    { key:'removeFromCart', label:'Removes from Cart' },
    { key:'clearCart', label:'Clears' },
  ];

  el.innerHTML = defs.map(d => {
    const val = cards?.[d.key] ?? 0;
    const cls = d.key === 'rentalsFromMe' ? 'ok' : (d.key === 'removeFromCart' || d.key === 'clearCart' ? 'bad' : '');
    return `
      <div class="card ${cls}">
        <div class="label">${d.label}</div>
        <div class="value">${val}</div>
      </div>
    `;
  }).join('');
}

function renderPopular(pop){
  const box = document.getElementById('popularBox');
  const meta = document.getElementById('popularMeta');
  if (!pop) {
    meta.textContent = 'No rentals from your items yet';
    box.textContent = '—';
    return;
  }
  meta.textContent = `Rented ${pop.count}×`;
  box.textContent = pop.name;
}

function renderPriceChart(buckets){
  const ctx = document.getElementById('priceChart').getContext('2d');
  const labels = ['≤ 10','11–25','26–50','≥ 51'];
  const values = labels.map(l => buckets?.[l] || 0);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Items Count', data: values }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: '#9aa4b2' }, grid: { color: 'rgba(255,255,255,.06)' } },
        y: { beginAtZero: true, ticks: { color: '#9aa4b2' }, grid: { color: 'rgba(255,255,255,.06)' } }
      }
    }
  });
}
