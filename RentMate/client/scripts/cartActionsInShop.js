document.addEventListener('DOMContentLoaded', async () => {
  const addItemBtn = document.getElementById('addItemBtn');
  const addItemForm = document.getElementById('addItemForm');
  const itemList = document.getElementById('item-list');
    const clearBtn = document.getElementById('clearCartBtn');


  let loggedIn = null;
  let fullName = null;

  // 1. Check login status
  try {
    const res = await fetch('/api/users/status', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();
    loggedIn = data.loggedIn;
    fullName = data.fullName;
    if (data.loggedIn) {
      document.getElementById('logoutBtn').style.display = 'inline-block';
    } else {
      console.warn('User not logged in');
    }
  } catch (err) {
    console.error('Login check failed:', err);
  }
  
  // 2. Load current cart to mark which items are in cart
  let currentCartItems = [];
  if (loggedIn) {
    try {
      const cartRes = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include'
      });
      currentCartItems = await cartRes.json();
    } catch (err) {
      console.error('Failed loading cart items:', err);
    }
  }

  // 3. Load and render store items
  await loadProductsFromServer();

  // 4. Handle form show/hide
  addItemBtn?.addEventListener('click', () => {
    addItemForm.style.display = addItemForm.style.display === 'none' ? 'block' : 'none';
  });

  // 5. Add item form submission
  addItemForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('itemTitle').value;
    const description = document.getElementById('itemDescription').value;
    const price = Number(document.getElementById('itemPrice').value);
    const stock = Number(document.getElementById('itemStock').value);
    const image = document.getElementById('itemImage').value;
    const rentalDays = Number(document.getElementById('itemRentalDays').value);

    const newProduct = { title, description, price, stock, image, rentalDays, addedBy : fullName};
    try {
      await updateItemList(newProduct);
      await loadProductsFromServer();
      addItemForm.reset();
      addItemForm.style.display = 'none';
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product: ' + err.message);
    }
  });

  // 6. Delegate cart add/remove on click
  itemList.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('add-to-cart-btn')) return;
    const button = e.target;
    const itemId = button.dataset.productId;
    const action = button.dataset.inCart === 'true' ? 'remove' : 'add';

    try {
      const res = await fetch(`/api/cart/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (!res.ok) {
        const errText = await res.text();
        alert(`Failed to ${action} item: ` + errText);
        window.location.href='login.html'
        return;
      }

      button.innerText = action === 'add' ? '❌Remove from Cart' : '🛒Add to Cart';
      button.dataset.inCart = action === 'add' ? 'true' : 'false';

    } catch (err) {
      console.error(`Error on ${action} cart:`, err);
      alert(`Error: ${err.message}`);
    }
  });

  // Supporting Functions:
  async function updateItemList(newProduct) {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newProduct)
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json().newItem;
  }

async function loadProductsFromServer(filter = '') {
  try {
    const res = await fetch('/api/products', {
      method: 'GET',
      credentials: 'include'
    });
    const productsObj = await res.json();
    const products = Object.entries(productsObj);

    itemList.innerHTML = '';

    products
      .filter(([_, product]) => {
        return product.title.toLowerCase().includes(filter.toLowerCase()) ||
               product.description.toLowerCase().includes(filter.toLowerCase());
      })
      .forEach(([key, product]) => {
        const div = createItemCard(key, product);
        const isInCart = currentCartItems.some(item => item.id === key);
        const button = div.querySelector('.add-to-cart-btn');
        if (isInCart) {
          button.innerText = '❌Remove from Cart';
          button.dataset.inCart = 'true';
        }
        itemList.appendChild(div);
      });

  } catch (err) {
    console.error('Error loading products:', err);
  }
}


function createItemCard(key, product) {
  const { title, description, price, stock, image, rentalDays, addedBy } = product;

  const div = document.createElement('div');
  div.className = 'item-card';

  div.innerHTML = `
    <h3>${title}</h3>
    <p>ID: ${key}<p>
    <p>${description}</p>
    <p>Price: $${price}</p>
    <p>Stock: ${stock}</p>
    ${image ? `<img src="${image}" alt="${title}" class="product-image">` : ''}
    <p>Max Rental Days: ${rentalDays}</p>
    <p>Added by: ${addedBy}</p>
    <button class="add-to-cart-btn" data-product-id="${key}" data-in-cart="false">🛒Add to Cart</button>
  `;

  // Show delete button only if the logged-in user is the creator
  if (loggedIn && addedBy === fullName) {
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = '🗑 Delete Product';
    deleteBtn.classList.add('delete-product-btn');
    deleteBtn.dataset.productId = key;

    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete "${title}"?`)) {
        try {
          const res = await fetch(`/api/products/${key}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!res.ok) {
            const errText = await res.text();
            alert('Failed to delete: ' + errText);
            return;
          }

          // Reload products
          await loadProductsFromServer();
        } catch (err) {
          console.error('Error deleting product:', err);
          alert('Error deleting product: ' + err.message);
        }
      }
    });

    div.appendChild(deleteBtn);
  }

  return div;
}

  // Clear the entire cart when "Clear All" button is clicked
  clearBtn.addEventListener('click', async () => {
    await fetch('/api/cart/clear', {
      method: 'POST',
      credentials: 'include'
    });
      currentCartItems = []; 
      await loadProductsFromServer();
  });

    document.getElementById('searchBtn')?.addEventListener('click', () => {
    const term = document.getElementById('searchInput').value.trim();
    loadProductsFromServer(term);
  });

    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
  }
  });
      document.getElementById('searchInput')?.addEventListener('input', (e) => {
      document.getElementById('searchBtn').click();
  });
});
