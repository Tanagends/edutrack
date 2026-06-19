const express = require('express');
const router = express.Router();
const { createSession, markAttendance, getAttendanceSummary, getSessionsByCourse, manualMark } = require('../controllers/attendance.controller');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);

router.post('/session', authorise('faculty'), createSession);
router.post('/mark', authorise('student'), markAttendance);
router.post('/manual', authorise('faculty'), manualMark);
router.get('/summary/:courseId', getAttendanceSummary);
router.get('/sessions/:courseId', authorise('faculty', 'admin'), getSessionsByCourse);

module.exports = router;
