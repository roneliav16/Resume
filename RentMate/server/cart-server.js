const express = require('express');
const router = express.Router();

const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');
const CARTS_FILE = 'carts.json';
const ACTIVITY_FILE = 'activity.json';

// Helper to log activity
async function logActivity(username, type) {
  const activity = await storage.load(ACTIVITY_FILE);
  const now = new Date().toISOString();
  activity.push({ datetime: now, username, type });
  await storage.save(ACTIVITY_FILE, activity);
}

// GET /api/cart/
router.get('/', requireAuth, async (req, res) => {
  try {
    const username = req.username; // requireAuth should ensure all of this line
    const carts = await storage.load(CARTS_FILE);
    const userCart = carts[username] || [];
    res.json(userCart);
  } catch (err) {
    console.error('Error loading cart:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/cart/remove
router.post('/remove', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    const { itemId } = req.body;

    const carts = await storage.load(CARTS_FILE);
    if (!carts[username]) return res.status(404).send('Cart not found');

    carts[username] = carts[username].filter(item => item.id !== itemId);
    await storage.save(CARTS_FILE, carts);
    await logActivity(username, 'remove item from cart');
    res.sendStatus(200);
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/cart/update-duration
router.post('/update-duration', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    const { itemId, days } = req.body;

    const carts = await storage.load(CARTS_FILE);
    const userCart = carts[username];
    if (!userCart) return res.status(404).send('Cart not found');

    const product = userCart.find(item => item.id === itemId);
    if (!product) return res.status(404).send('Item not found');
    if (days < 1 || days > product.maxRentalDays || !Number.isInteger(Number(days))) return res.status(400).send('Invalid rental days');

    product.days = days;
    await storage.save(CARTS_FILE, carts);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating rental duration:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/cart/clear
router.post('/clear', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    const carts = await storage.load(CARTS_FILE);
    if (!carts[username] || carts[username].length !== 0) await logActivity(username, 'clear all items from cart');
    carts[username] = [];
    await storage.save(CARTS_FILE, carts);

    res.sendStatus(200);
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).send('Internal Server Error');
  }
});

const PRODUCTS_FILE = 'products.json';

// POST /api/cart/add
router.post('/add', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    const { itemId } = req.body;

    if (!itemId) return res.status(400).send('Missing itemId');

    const products = await storage.load(PRODUCTS_FILE);
    const product = products[itemId];
    if (!product) return res.status(404).send('Product not found');

    const carts = await storage.load(CARTS_FILE);
    if (!carts[username]) carts[username] = [];

    // Check if product already in cart
    const alreadyInCart = carts[username].some(item => item.id === itemId);
    if (alreadyInCart) return res.status(409).send('Item already in cart');

    carts[username].push({
      id: itemId,
      name: product.title,
      description: product.description,
      price: product.price,
      maxRentalDays: product.rentalDays,
      days: 1,
      image: product.image || '', // Ensure image is included
      addedBy: product.addedBy // Track who added the item
    });

    await storage.save(CARTS_FILE, carts);
    await logActivity(username, 'add item to cart');
    res.status(201).send('Item added to cart');
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
