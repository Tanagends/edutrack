const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');

// @desc    Get courses
//          Admin → all courses
//          Faculty → their assigned courses
//          Student → only enrolled courses
// @route   GET /api/courses
// @access  All authenticated
const getCourses = async (req, res, next) => {
  try {
    let courses;

    if (req.user.role === 'admin') {
      courses = await Course.find().populate('faculty', 'name email');
    } else if (req.user.role === 'faculty') {
      courses = await Course.find({ faculty: req.user._id }).populate('faculty', 'name email');
    } else {
      // Student — find via enrollments
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(200).json({ success: true, count: 0, data: [] });

      const enrollments = await Enrollment.find({ student: student._id, isActive: true }).populate({
        path: 'course',
        populate: { path: 'faculty', select: 'name email' },
      });
      courses = enrollments.map((e) => e.course).filter(Boolean);
    }

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

// @desc    Get all students enrolled in a course
// @route   GET /api/courses/:id/students
// @access  Faculty, Admin
const getEnrolledStudents = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id, isActive: true })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    const students = enrollments.map((e) => e.student).filter(Boolean);
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, getEnrolledStudents };
