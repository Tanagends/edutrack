const express = require('express');
const router = express.Router();
const { getStudents, getStudent, updateStudent, deleteStudent } = require('../controllers/student.controller');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);

router.route('/').get(authorise('admin', 'faculty'), getStudents);

router
  .route('/:id')
  .get(authorise('admin', 'faculty', 'student'), getStudent)
  .put(authorise('admin'), updateStudent)
  .delete(authorise('admin'), deleteStudent);

module.exports = router;
