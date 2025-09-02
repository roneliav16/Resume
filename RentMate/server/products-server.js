const express = require('express');
const router = express.Router();
const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');

const PRODUCTS_FILE = 'products.json';

// GET /api/products/
router.get('/', async (req, res) => {
  try {
    const products = await storage.load(PRODUCTS_FILE);
    res.json(products);
  } catch (err) {
    console.error('Error loading items:', err);
    res.status(500).send('Failed to load items');
  }
});

// POST /api/products/
router.post('/', requireAuth, async (req, res) => {
  const { title, description, price, stock, image, rentalDays, addedBy } = req.body;

  try {
    if (
      typeof title !== 'string' || title.trim().length < 2 ||
      typeof description !== 'string' ||
      typeof price !== 'number' || price <= 0 || !Number.isInteger(stock) ||
      typeof stock !== 'number' || stock <= 0 || rentalDays <= 0 || typeof rentalDays !== "number" || 
      !Number.isInteger(price)
    ) {
      return res.status(400).send('Invalid input data');
    }
    } catch (err) {
        return res.status(400).send('Invalid input data');
    }
    
  try{
    const items = await storage.load(PRODUCTS_FILE) || {};
    const newId = `p${Object.keys(items).length + 1}`;

    const newItem = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        image: typeof image === 'string' ? image.trim() : '',
        rentalDays: Number(rentalDays),
        addedBy: addedBy,
        user: req.username,
        //  createdAt: new Date().toISOString()
    };
    
    items[newId] = newItem;
    await storage.save(PRODUCTS_FILE, items);
    res.status(201).json({newItem, newId});
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).send('Failed to add item');
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const products = await storage.load(PRODUCTS_FILE);

    const product = products[productId];
    if (!product) return res.status(404).send('Product not found');

    if (product.user !== req.username && req.username !== 'admin') {
      return res.status(403).send('You can only delete products you created.');
    }

    delete products[productId];
    await storage.save(PRODUCTS_FILE, products);
    res.sendStatus(204); // No Content
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
