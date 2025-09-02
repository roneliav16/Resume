// routes/checkout.js
const express = require('express');
const router = express.Router();
const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';
const PURCHASES_FILE = 'purchases.json';

router.post('/pay', requireAuth, async (req, res) => {
  try {
    const username = req.username;

    // Load state
    const [carts, products, purchases] = await Promise.all([
      storage.load(CARTS_FILE),
      storage.load(PRODUCTS_FILE),
      storage.load(PURCHASES_FILE),
    ]);

    // Ensure we have an array cart for this user
    const userCart = Array.isArray(carts[username]) ? carts[username] : [];
    if (userCart.length === 0) {
      return res.status(400).send('Cart is empty');
    }

    // Parse optional selection by indexes
    const rawIdxs = Array.isArray(req.body?.selectedIdxs) ? req.body.selectedIdxs : null;
    let selectedIdxs = null;
    if (rawIdxs) {
      selectedIdxs = rawIdxs
        .map(n => parseInt(n, 10))
        .filter(n => Number.isInteger(n) && n >= 0 && n < userCart.length);
    }
  
    // Build selection (fallback to the entire cart)
    const selectedItems = (selectedIdxs && selectedIdxs.length > 0)
      ? selectedIdxs.map(i => userCart[i]).filter(Boolean)
      : userCart.slice();

    if (selectedItems.length === 0) {
      return res.status(400).send('No valid items selected');
    }

    // Validate and compute total on the server
    let total = 0;
    for (const item of selectedItems) {
      const { id, price, days } = item;

      // Product must exist and have stock
      if (!id || !products[id]) {
        return res.status(409).send('One or more selected items are no longer available');
      }
      if (products[id].stock <= 0) {
        return res.status(409).send(`Item "${products[id].title || id}" is out of stock`);
      }

      // Basic sanity on price/days
      if (typeof price !== 'number' || typeof days !== 'number' || days <= 0) {
        return res.status(400).send('Invalid item data in cart');
      }

      total += price * days;
    }

    // Update stock ONLY for selected items
    for (const item of selectedItems) {
      const pid = item.id;
      products[pid].stock -= 1;
      if (products[pid].stock <= 0) {
        delete products[pid]; // optional: remove product when stock hits zero
      }
    }

    // Create a purchase record
    const purchaseRecord = {
      date: new Date().toISOString(),
      items: selectedItems,
      totalPrice: total,
    };

    if (!Array.isArray(purchases[username])) {
      purchases[username] = [];
    }
    purchases[username].push(purchaseRecord);

    // Remove purchased lines from the cart (by index) or clear entire cart
    if (selectedIdxs && selectedIdxs.length > 0) {
      const toRemove = new Set(selectedIdxs);
      carts[username] = userCart.filter((_, idx) => !toRemove.has(idx));
    } else {
      carts[username] = []; // paid the entire cart
    }

    // Persist all changes
    await Promise.all([
      storage.save(CARTS_FILE, carts),
      storage.save(PRODUCTS_FILE, products),
      storage.save(PURCHASES_FILE, purchases),
    ]);

    return res.json({ message: 'Payment successful', purchase: purchaseRecord });
  } catch (err) {
    console.error('Payment error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
