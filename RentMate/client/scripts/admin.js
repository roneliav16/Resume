document.addEventListener("DOMContentLoaded",async () => {
  const usernameFilter = document.getElementById("usernameFilter");
  const activityTableBody = document.querySelector("#activityTable tbody");
  const productForm = document.getElementById("productForm");
  const productList = document.getElementById("productList");

  let allActivities = [];

  // 1. Fetch and display activity log 
  async function fetchActivity() {
    try {
      const res = await fetch("/api/users/activity", { 
        method: 'GET',
        credentials: 'include'
    });
      
    const activitiesObj = await res.json();
    allActivities = activitiesObj.activity;
      if (!activitiesObj.isAdminLoggedIn) {
        alert("You are not authorized to view the activity log.");
        window.location.href = 'index.html'; // Redirect to index if not admin
        return; // Only admins can view activity log
      }   
      displayActivities(allActivities);
    } catch (err) {
      console.error("Failed to fetch activity log:", err);
    }
  }

  function displayActivities(data) {
    activityTableBody.innerHTML = "";
    if (data.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="3">No activity found.</td>`;
      activityTableBody.appendChild(row);
      return;
    }

    data.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.datetime}</td>
        <td>${entry.username}</td>
        <td>${entry.type}</td>
      `;
      activityTableBody.appendChild(row);
    });
  }

  usernameFilter.addEventListener("input", () => {
    const prefix = usernameFilter.value.toLowerCase();
    const filtered = allActivities.filter(a => a.username.toLowerCase().startsWith(prefix));
    displayActivities(filtered);
  });

  // 2. Handle product form submission
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
      title: document.getElementById("itemTitle").value,
      description: document.getElementById("itemDescription").value,
      price: Number(document.getElementById("itemPrice").value),
      stock: Number(document.getElementById("itemStock").value),
      image: document.getElementById("itemImage").value,
      rentalDays: Number(document.getElementById("itemRentalDays").value),
        addedBy: "Administrator" // Assuming admin adds products
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) throw new Error("Failed to save product");

      const savedProduct = await res.json();
      appendProductToList(savedProduct.newId, savedProduct.newItem);
      productForm.reset();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  });

  
  // 3. Add new product to DOM 
  function appendProductToList(key, product) {
    const li = document.createElement("li");
    li.classList.add("product-item");

    li.innerHTML = `
      <div class="product-info">
        <h3>${product.title}</h3>
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Price:</strong> $${product.price} / day</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
        <p><strong>Max Rental Days:</strong> ${product.rentalDays}</p>
        ${product.image ? `<img src="${product.image}" alt="${product.title}" class="product-image">` : ""}
      </div>
      <button class="delete-product-btn" data-id="${key}">Delete</button>
    `;

    productList.appendChild(li);
  }

  // 4. Delete product 
  async function deleteProduct(id, btn) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      btn.closest("li").remove();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  }

  // 5. Event delegation for delete button
  productList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-product-btn")) {
      const id = e.target.dataset.id;
      deleteProduct(id, e.target);
    }
  });

  // Load initial data
  fetchActivity();
  await loadProductsFromServer();


    async function loadProductsFromServer(filter = '') {
    try {
      const res = await fetch('/api/products', {
        method: 'GET',
        credentials: 'include'
      });
      const productsObj = await res.json();
      const products = Object.entries(productsObj);

      productList.innerHTML = '';

      products.forEach(([key, product]) => {
          appendProductToList(key, product)
        });

    } catch (err) {
      console.error('Error loading products:', err);
    }
  }
});