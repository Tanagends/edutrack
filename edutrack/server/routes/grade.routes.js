const express = require('express');
const router = express.Router();
const { getGrades, getCourseGrades, addAssessment } = require('../controllers/grade.controller');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);

router.post('/assess', authorise('faculty'), addAssessment);
router.get('/course/:courseId/all', authorise('faculty', 'admin'), getCourseGrades);
router.get('/:courseId', getGrades);

module.exports = router;
