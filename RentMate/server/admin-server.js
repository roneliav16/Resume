const express = require('express');
const router = express.Router();

const storage = require('./persist_module');
const { requireAuth } = require('./authMiddleware');
const activityLogFile = 'activity.json';

// GET /api/admin/activity
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const activityLog = await storage.load(activityLogFile);
    res.json(activityLog);
  } catch (error) {
    console.error('Failed to load activity log:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
