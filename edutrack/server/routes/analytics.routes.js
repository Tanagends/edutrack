const express = require('express');
const router = express.Router();
const { getOverview, getAttendanceAnalytics, getGradeAnalytics } = require('../controllers/analytics.controller');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);
router.get('/overview', authorise('admin'), getOverview);
router.get('/attendance', authorise('admin', 'faculty'), getAttendanceAnalytics);
router.get('/grades', authorise('admin', 'faculty'), getGradeAnalytics);

module.exports = router;
