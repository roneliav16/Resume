const storage = require('./persist_module');
const { v4: uuidv4 } = require('uuid');

const USERS_FILE = 'users.json';
const SESSIONS_FILE = 'sessions.json';

async function requireAuth(req, res, next) {
  try {
    const oldSessionId = req.cookies?.sessionId;
    const sessions = await storage.load('sessions.json');
    const sessionData = sessions[oldSessionId];
    
    if (!sessionData || !sessionData.username) {
      return res.status(401).send('Unauthorized: No user logged in');
    }
    
    const { username, rememberMe } = sessionData;

    // Check if user exists in users.json
    const users = await storage.load(USERS_FILE);
    if (!users[username]) {
      return res.status(401).send('Unauthorized: User does not exist');
    }

    // Rotate session ID
    delete sessions[oldSessionId];
    const newSessionId = uuidv4();
    sessions[newSessionId] = {username, rememberMe};
    await storage.save(SESSIONS_FILE, sessions);

    const maxAge = rememberMe ? 12 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
    res.cookie('sessionId', newSessionId, {
      maxAge: maxAge, // Reset cookie expiration
      httpOnly: true
    });

    req.username = username;
    req.newSessionId = newSessionId; // Pass new session
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = { 
  requireAuth, 
};