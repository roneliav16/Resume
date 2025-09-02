document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('cart-container');
  const clearBtn = document.getElementById('clearCartBtn');

  // Fetch the current user's cart from the server
  async function fetchCart() {
    const res = await fetch('/api/cart', {
      method: 'GET',
      credentials: 'include' 
    });
    const cart = await res.json();
    return cart;
  }

  // Create and return a single cart item DOM element
  function createCartItemElement(item, maxRentalDays) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `${item.image ? `<img src="${item.image}" alt="${item.name}" class="product-image">` : ''}`;


    // Product name and description
    const details = document.createElement('div');
    details.className = 'details';
    details.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p>
      <p>Price (per day): $${item.price}</p>
      <p>Days: ${item.days} (Max: ${maxRentalDays})</p>
      <p>Total: $${(item.price * item.days).toFixed(2)}</p>
      <p>Added by: ${item.addedBy}</p>`;

    // Rental duration input (number)
    const duration = document.createElement('input');
    duration.type = 'number';
    duration.value = item.days || 1;
    duration.min = 1;
    duration.max = item.maxRentalDays;

    // Update rental days when input changes
    duration.addEventListener('change', () => {
      if (duration.value > maxRentalDays) {
        duration.value = maxRentalDays;
      }
      updateRentalDuration(item.id, duration.value);
    });

    // Remove item button
    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'Remove';
    removeBtn.onclick = () => removeItem(item.id);

    // Append all to the cart item div
    div.appendChild(details);
    div.appendChild(duration);
    div.appendChild(removeBtn);

    return div;
  }

  // Render the entire cart to the DOM
  async function renderCart() {
    container.innerHTML = ''; // clear existing items
    const cart = await fetchCart();

    for (const item of cart) {
      const element = createCartItemElement(item, item.maxRentalDays);
      container.appendChild(element);
    }
  }

  // Remove a single item from the cart
  async function removeItem(itemId) {
    await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemId })
    });
    renderCart(); // refresh the UI
  }

  // Update rental duration for a specific item
  async function updateRentalDuration(itemId, days) {
    await fetch('/api/cart/update-duration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemId, days })
    });

    renderCart(); // refresh the UI
  }

  // Clear the entire cart when "Clear All" button is clicked
  clearBtn.addEventListener('click', async () => {
    await fetch('/api/cart/clear', {
      method: 'POST',
      credentials: 'include'
    });
    renderCart(); // refresh the cart UI
  });

  // Initial cart render on page load
  renderCart();
});
