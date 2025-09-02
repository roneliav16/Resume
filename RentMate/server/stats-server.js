const express = require('express');
const router = express.Router();
const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');

const USERS_FILE = 'users.json';
const PRODUCTS_FILE = 'products.json';
const PURCHASES_FILE = 'purchases.json';
const ACTIVITY_FILE = 'activity.json';

function bucketPrice(n) {
  const x = Number(n || 0);
  if (x <= 10) return '≤ 10';
  if (x <= 25) return '11–25';
  if (x <= 50) return '26–50';
  return '≥ 51';
}

// GET /api/stats/my
router.get('/my', requireAuth, async (req, res) => {
  try {
    const username = req.username;

    const users = (await storage.load(USERS_FILE)) || {};
    if (!users[username]) return res.status(404).json({ error: 'user not found' });

    const products = (await storage.load(PRODUCTS_FILE)) || {};
    const purchases = (await storage.load(PURCHASES_FILE)) || {};
    const activity = (await storage.load(ACTIVITY_FILE)) || [];

    const myProducts = Object.entries(products).filter(
      ([, p]) => p?.user === username
    );
    const productsCreated = myProducts.length;

    const myPurchases = purchases[username] || [];
    const rentalsMade = myPurchases.length;

    let rentalsFromMe = 0;
    const myProductRentCounts = {}; // name -> count
    for (const [buyer, arr] of Object.entries(purchases)) {
      for (const rec of arr || []) {
        for (const it of rec.items || []) {
          if (it.addedBy === users[username].fullName) {
            rentalsFromMe++;
            const key = it.id;
            myProductRentCounts[key] = (myProductRentCounts[key] || 0) + 1;
          }
        }
      }
    }
    const mostPopularMyProduct = Object.entries(myProductRentCounts)
      .sort((a, b) => b[1] - a[1])[0] || null;
    const mostPopular = mostPopularMyProduct
      ? { name: mostPopularMyProduct[0], count: mostPopularMyProduct[1] }
      : null;

    const addToCart = activity.filter(a => a.username === username && a.type === 'add item to cart').length;
    const removeFromCart = activity.filter(a => a.username === username && a.type === 'remove item from cart').length;
    const clearCart = activity.filter(a => a.username === username && a.type === 'clear all items from cart').length;

    let sumDays = 0, sumItems = 0;
    for (const rec of myPurchases) {
      for (const it of rec.items || []) {
        if (typeof it.days === 'number') {
          sumDays += it.days;
          sumItems++;
        }
      }
    }
    const avgDaysRentedByMe = sumItems ? +(sumDays / sumItems).toFixed(2) : 0;

    const priceBuckets = {};
    for (const rec of myPurchases) {
      for (const it of rec.items || []) {
        const b = bucketPrice(it.price);
        priceBuckets[b] = (priceBuckets[b] || 0) + 1;
      }
    }

    res.json({
      username,
      cards: {
        productsCreated,
        rentalsMade,
        rentalsFromMe,
        avgDaysRentedByMe,
        addToCart,
        removeFromCart,
        clearCart
      },
      mostPopular,
      priceBuckets
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
