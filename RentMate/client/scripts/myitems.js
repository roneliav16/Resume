document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('items-container');
  let username = null;

  try {
    // Get logged in user
    const res = await fetch('/api/users/status', {
      credentials: 'include'
    });

    const data = await res.json();
    loggedIn = data.loggedIn;
    if (!loggedIn) {
      container.innerHTML = "<p>You must be logged in to view your purchases.</p>";
      return;
    }
    
    username = data.username;
  } catch (err) {
    console.error('Failed to fetch user status:', err);
    return;
  }

  try {
    // Fetch purchases.json
    const res = await fetch('/api/purchases', {
      method: 'GET',
      credentials: 'include'
    });

    const userPurchases = await res.json();

    if (!userPurchases || userPurchases.length === 0) {
      container.innerHTML = "<p>You have not purchased anything yet.</p>";
      return;
    }

    userPurchases.forEach(purchase => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'purchase-group';
      const date = new Date(purchase.date).toLocaleString();
      groupDiv.innerHTML = `<h3>Purchase on ${date}</h3>`;

      purchase.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="purchase-img" />
          <div class="item-info">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <p><strong>Price:</strong> $${item.price}</p>
            <p><strong>Rental Days:</strong> ${item.days}</p>
            <p><strong>Added By:</strong> ${item.addedBy}</p>
          </div>
        `;

        groupDiv.appendChild(div);
      });

      const total = document.createElement('p');
      total.className = 'total-price';
      total.innerHTML = `<strong>Total Price:</strong> $${purchase.totalPrice}`;
      groupDiv.appendChild(total);

      container.appendChild(groupDiv);
    });

  } catch (err) {
    console.error('Failed to load purchases:', err);
    container.innerHTML = "<p>Error loading purchases.</p>";
  }
});