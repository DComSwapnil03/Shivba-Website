const express = require('express');
const router = express.Router();
const upload = require('../middleware/memoryUpload');
const dataController = require('../controllers/dataController');

// POST: Import Users
router.post('/import', upload.single('file'), dataController.importMembers);

// GET: Export Data (Query param: ?type=users|events|messages)
router.get('/export', dataController.exportData);

// GET: Fetch List (Query param: ?type=users|events|messages)
router.get('/list', dataController.getDashboardData);

// DELETE: Remove Item (URL: /api/data/delete/:id?type=users)
// --- THIS WAS MISSING ---
router.delete('/delete/:id', dataController.deleteData);

module.exports = router;