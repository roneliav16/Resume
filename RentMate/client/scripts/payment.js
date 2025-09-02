document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('paymentForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await Pay(); // run Pay on submit
  });

  submitBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to complete the payment?')) return;
    await Pay();
  });

  async function Pay() {
    try {
      // Read selection saved by Checkout
      const raw = sessionStorage.getItem('checkout.selectedIdxs');
      const selectedIdxs = raw ? JSON.parse(raw) : [];

      if (!Array.isArray(selectedIdxs) || selectedIdxs.length === 0) {
        alert('No items selected. Please go back to Checkout and select items.');
        return;
      }

      const res = await fetch('/api/checkout/pay', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ selectedIdxs })              
      });

      if (!res.ok) {
        const msg = await res.text();
        alert('Payment failed: ' + msg);
        return;
      }

      // Clear the temporary selection and redirect on success
      sessionStorage.removeItem('checkout.selectedIdxs');
      const data = await res.json();
      window.location.href = 'successPayment.html';
    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong during payment.');
    }
  }
});
