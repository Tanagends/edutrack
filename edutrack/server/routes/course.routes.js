const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent } = require('../controllers/course.controller');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getCourses).post(authorise('admin'), createCourse);

router
  .route('/:id')
  .put(authorise('admin'), updateCourse)
  .delete(authorise('admin'), deleteCourse);

router.post('/:id/enroll', authorise('admin'), enrollStudent);

module.exports = router;
