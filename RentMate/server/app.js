const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.gitignore/.env') });

const usersRoutes = require('./users-server');
const purchasesRoutes = require('./purchases-server');
const cartRoutes = require('./cart-server');
const checkoutRoutes = require('./checkout-server');
const adminRoutes = require('./admin-server');
const productsRouter = require('./products-server');
const aiRoutes = require('./ai-server');
const disputesRoutes = require('./disputes-server');
const profileRoutes = require('./profile-server');
const statsRoutes = require('./stats-server');

const app = express();
const PORT = process.env.PORT || 3000;

// === Prevent Dos attacks Section ===  
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(express.json({ limit: '10kb' })); // Limit JSON body size to 10kb
app.use((req, res, next) => {
  res.setTimeout(5000, () => { // timeout to 5 seconds
    return res.status(408).send('Request Timeout');
  });
  next();
});

//====== End of Prevent Dos attacks Section =====

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // dont think this is needed, but keeping for compatibility
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRouter);
app.use('/api/ai', aiRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/account', profileRoutes);
app.use('/api/stats', statsRoutes);

// HTML Routes fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
