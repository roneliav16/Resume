const express = require('express');
const router = express.Router();
const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');

const DISPUTES_FILE = 'disputes.json';
const PRODUCTS_FILE = 'products.json';

router.get('/', requireAuth, async (req,res)=>{
  const disputes = (await storage.load(DISPUTES_FILE)) || {};
  const mine = Object.values(disputes).filter(d => d.openedBy === req.username || d.against === req.username || "admin" === req.username);
  res.json(mine);
});

router.post('/', requireAuth, async (req, res) => {
    try{
        const body = req.body || {};
        const productId = body.productId;
        let type = String(body.type || 'damage').toLowerCase();
        const description = String(body.description || '');

        if (!productId) return res.status(400).send('productId required');

        const allowed = new Set(['damage', 'delay']);
        if (!allowed.has(type)) return res.status(400).send('invalid type');

        const disputes = (await storage.load(DISPUTES_FILE)) || {};
        const products = (await storage.load(PRODUCTS_FILE)) || {};
        
        if (!products[productId]) return res.status(404).send('product not found');

        const dId = `p${Object.keys(disputes).length + 1}`;
        disputes[dId] = {
            id: dId,
            productId,
            openedBy: req.username,
            against: products[productId].user || 'unknown',
            type, // guaranteed: 'damage' or 'delay'
            description,
            status: 'open',
            messages: [{ by: req.username, text: description, at: new Date().toISOString() }]
        };

        await storage.save(DISPUTES_FILE, disputes);
        res.status(201).json(disputes[dId]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/:id/reply', requireAuth, async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const disputes = (await storage.load(DISPUTES_FILE)) || {};

    const id = req.params.id;
    const d = disputes[id];
    if (!d) {
      return res.status(404).json({ error: 'not found' });
    }

    // Authorization: only opener or opponent may reply
    if (![d.openedBy, d.against].includes(req.username)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    // Append message (sanitize + cap length)
    const msg = {
      id: 'm' + Date.now().toString(36),
      by: req.username,
      text: String(text).trim().slice(0, 2000),
      at: new Date().toISOString()
    };
    d.messages.push(msg);

    await storage.save(DISPUTES_FILE, disputes);

    return res.json({
      ok: true,
      disputeId: id,
      appended: msg,
      totalMessages: d.messages.length
    });
  } catch (err) {
    console.error('dispute reply error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'reply_failed' });
    }
  }
});

router.post('/:id/resolve', requireAuth, async (req, res) => {
  try {
    // Load disputes JSON (supports string or object)
    let disputes = await storage.load(DISPUTES_FILE);

    const id = req.params.id;
    const d = disputes[id];
    if (!d) {
      return res.status(404).json({ error: 'not_found' });
    }

    // AuthZ: only the "against" user or admin may resolve
    const isAdmin = req.username === 'admin';
    const isOwner = req.username === d.against;
    if (!(isAdmin || isOwner)) {
      return res.status(403).json({ error: 'only_owner_or_admin_can_resolve' });
    }

    // Already resolved?
    if (d.status === 'resolved') {
      return res.status(409).json({ error: 'already_resolved' });
    }

    // Mark as resolved
    d.status = 'resolved';
    d.resolvedAt = new Date().toISOString();
    d.resolvedBy = req.username;

    await storage.save(DISPUTES_FILE, disputes);

    return res.json({ ok: true, dispute: d });
  } catch (err) {
    console.error('dispute resolve error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'resolve_failed' });
    }
  }
});


module.exports = router;
