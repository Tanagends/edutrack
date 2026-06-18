const express = require('express');
const router = express.Router();
const { getAtRiskStudents, triggerRiskAlerts } = require('../controllers/risk.controller');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);
router.get('/', authorise('admin', 'faculty'), getAtRiskStudents);
router.post('/notify', authorise('admin', 'faculty'), triggerRiskAlerts);

module.exports = router;
