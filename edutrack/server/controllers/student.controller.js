const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Admin, Faculty
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate('user', 'name email isActive');
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Admin, Faculty, Student (own)
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', 'name email');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Admin
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete (deactivate) student
// @route   DELETE /api/students/:id
// @access  Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    // Deactivate user account instead of hard delete
    await User.findByIdAndUpdate(student.user, { isActive: false });
    res.status(200).json({ success: true, message: 'Student deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents, getStudent, updateStudent, deleteStudent };
