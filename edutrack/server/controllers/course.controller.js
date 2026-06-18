const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses
// @route   GET /api/courses
// @access  All authenticated
const getCourses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'faculty') filter.faculty = req.user._id;

    const courses = await Course.find(filter).populate('faculty', 'name email');
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Admin
const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Admin
const enrollStudent = async (req, res, next) => {
  try {
    const { studentId, academicYear, semester } = req.body;
    const enrollment = await Enrollment.create({
      student: studentId,
      course: req.params.id,
      academicYear,
      semester,
    });
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent };
