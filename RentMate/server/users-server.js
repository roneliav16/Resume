const express = require('express');
const router = express.Router();
const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');
const { v4: uuidv4 } = require('uuid');

const USERS_FILE = 'users.json';
const ACTIVITY_FILE = 'activity.json';
const SESSIONS_FILE = 'sessions.json';

// Helper to log activity
async function logActivity(username, type) {
  const activity = await storage.load(ACTIVITY_FILE);
  const now = new Date().toISOString();
  activity.push({ datetime: now, username, type });
  await storage.save(ACTIVITY_FILE, activity);
}

function isValidUsername(username) {
  return (
    typeof username === 'string' &&
    username.trim().length >= 3 &&
    !/^\d+$/.test(username) &&         
    /^[a-zA-Z0-9]+$/.test(username)         
  );
}

function isValidPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 4 &&
    !/^\d+$/.test(password) &&          
    /^[a-zA-Z0-9]+$/.test(password)     
  );
}

function isValidFullName(fullName) {
  return (
    typeof fullName === 'string' &&
    fullName.trim().length >= 2 &&
    /^[a-zA-Z\s]+$/.test(fullName)
  );
}



// POST /api/users/register
router.post('/register', async (req, res) => {
try {
    const { username, password , fullName} = req.body;

  if (!isValidUsername(username)) {
    return res
      .status(400)
      .send('Username must be at least 3 characters, contain only English letters and numbers, and not be only digits');
  }

  if (!isValidPassword(password)) {
    return res
      .status(400)
      .send('Password must be at least 4 characters, contain only English letters and numbers, and not be only digits');
  }

  if (!isValidFullName(fullName)) {
    return res
      .status(400)
      .send('Full name must be at least 2 characters and contain only letters and spaces');
  }

    const users = await storage.load(USERS_FILE);
    if (users[username]) return res.status(409).send('User already exists');

    users[username] = {
      username,
      password,
      role: 'user',
      preferences: {"mode": "light"}, // Default mode
      rememberMe: false, // change that after !!! maybe
      fullName: fullName 
    };
    await storage.save(USERS_FILE, users);
    await logActivity(username, 'register');
    res.status(201).send('User registered');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe = false } = req.body;

    if (!isValidUsername(username)) {
      return res
        .status(400)
        .send('Username must be at least 3 characters, contain only English letters and numbers, and not be only digits');
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .send('Password must be at least 4 characters, contain only English letters and numbers, and not be only digits');
    }

    const users = await storage.load(USERS_FILE);
    const user = users[username];

    if (!user || user.password !== password) {
      return res.status(401).send('Invalid credentials');
    }

    const sessions = await storage.load(SESSIONS_FILE);
    const sessionId = uuidv4();
    sessions[sessionId] = {
      username,
      rememberMe
    };
    await storage.save(SESSIONS_FILE, sessions);

    const maxAge = rememberMe ? 12 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
    res.cookie('sessionId', sessionId, { maxAge, httpOnly: true });
    await logActivity(username, 'login');
    res.status(200).send('Login successful');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/users/logout
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return res.status(400).send('No session ID provided');

    const sessions = await storage.load(SESSIONS_FILE);
    const username = sessions[sessionId];

    if (username) {
      delete sessions[sessionId];
      await storage.save(SESSIONS_FILE, sessions);
      await logActivity(username, 'logout');
    }

    res.clearCookie('sessionId');
    res.send('Logged out');
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/status' , async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return res.json({ loggedIn: false , mode : "light" });

    const sessions = await storage.load(SESSIONS_FILE);
    const username = sessions[sessionId]?.username;

    if (!username) return res.json({ loggedIn: false , mode : "light" });
    const users = await storage.load(USERS_FILE);
    if (!users[username]) return res.json({ loggedIn: false, mode : "light" });

    res.json({ loggedIn: true,  fullName: users[username].fullName , isAdminLoggedIn: users[username].role === 'admin' , mode: users[username].preferences?.mode || 'light' });
  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ loggedIn: false , mode : "light"});
  }
});

router.post('/status' , async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return res.status(500).send('No session ID provided');

    const sessions = await storage.load(SESSIONS_FILE);
    const username = sessions[sessionId]?.username;

    if (!username) return res.status(500).send('No user logged in');
    const users = await storage.load(USERS_FILE);
    if (!users[username]) return res.status(500).send('User does not exist');
    const newMode = users[username].preferences?.mode === "light" ? "dark" : "light"
    users[username].preferences = { mode: newMode };
    await storage.save(USERS_FILE, users);
    res.status(200).json({ mode: newMode });

  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ loggedIn: false , mode : "light"});
  }
});

router.get('/activity' , requireAuth, async (req, res) => {
  try {
    const username = req.username;
    if (!username || !(username === "admin")) return res.json({ isAdminLoggedIn: false });
    const activity = await storage.load(ACTIVITY_FILE);
    res.status(200).json({ isAdminLoggedIn : true , activity });
  } catch (err) {
    console.error('Activity check error:', err);
    res.status(500).json({ loggedIn: false });
  }
});

module.exports = router;


