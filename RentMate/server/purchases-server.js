const express = require('express');
const router = express.Router();
const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');

const PURCHASES_FILE = 'purchases.json';

// GET /api/purchases/
router.get('/', requireAuth, async (req, res) => {
  try {
    const purchases = await storage.load(PURCHASES_FILE);
    const userPurchases = purchases[req.username] || [];
    res.json(userPurchases);
  } catch (err) {
    console.error('Error loading items:', err);
    res.status(500).send('Failed to load items');
  }
});

module.exports = router;
