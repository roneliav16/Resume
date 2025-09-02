const express = require('express');
const router = express.Router();
const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');

const USERS_FILE = 'users.json';

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const users = (await storage.load(USERS_FILE)) || {};
    const u = users[req.username];
    if (!u) return res.status(404).send('user not found');
    res.json({ username: u.username, fullName: u.fullName, mode: u.preferences?.mode || 'light' });
  } catch (err) {
    console.error('Error in GET /profile:', err);
    res.status(500).send('internal server error');
  }
});

router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, mode } = req.body || {};
    const users = (await storage.load(USERS_FILE)) || {};
    const u = users[req.username];
    if (!u) return res.status(404).send('user not found');
    if (mode === 'light' || mode === 'dark') {
    if (!u.preferences) u.preferences = {};
      u.preferences.mode = mode;
    }
    if (typeof fullName === 'string' && fullName.trim().length >= 2){
        if (req.username === "admin" && fullName !== "Administrator") return res.status(404).send("Admin can't change his name !");
        u.fullName = fullName.trim();
    } 

    await storage.save(USERS_FILE, users);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error in POST /profile:', err);
    res.status(500).send('internal server error');
  }
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    const users = (await storage.load(USERS_FILE)) || {};
    const u = users[req.username];
    if (!u) return res.status(404).send('user not found');
    if (u.password !== oldPassword) return res.status(400).send('old password incorrect');
    if (
      typeof newPassword !== 'string' ||
      newPassword.length < 4 ||
      /^\d+$/.test(newPassword) ||
      !/^[a-zA-Z0-9]+$/.test(newPassword)
    ) {
      return res.status(400).send('invalid new password');
    }
    u.password = newPassword;
    await storage.save(USERS_FILE, users);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error in POST /change-password:', err);
    res.status(500).send('internal server error');
  }
});

module.exports = router;
