const express = require('express');

const { getLogs } = require('../controllers/auditLogController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin'), getLogs);

module.exports = router;
