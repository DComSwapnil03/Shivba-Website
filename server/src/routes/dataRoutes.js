const express = require('express');
const router = express.Router();
const upload = require('../middleware/memoryUpload');
const dataController = require('../controllers/dataController');

// --- DASHBOARD & EXCEL ROUTES ---

// POST: Import Users
router.post('/import', upload.single('file'), dataController.importMembers);

// GET: Export Data (Query param: ?type=users|events|messages)
router.get('/export', dataController.exportData);

// GET: Fetch List (Query param: ?type=users|events|messages)
router.get('/list', dataController.getDashboardData);

// DELETE: Remove Item (URL: /api/data/delete/:id?type=users)
router.delete('/delete/:id', dataController.deleteData);


// --- NEW: EVENT PUBLISHING ROUTES ---

// POST: Admin publishes a new event from the dashboard modal
router.post('/publish-event', dataController.publishEvent);

// GET: Public website fetches the published events to display on the calendar
router.get('/published-events', dataController.getPublishedEvents);

module.exports = router;