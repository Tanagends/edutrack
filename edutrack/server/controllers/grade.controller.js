const Grade = require('../models/Grade');
const Student = require('../models/Student');

// @desc    Get grades for a student in a course
// @route   GET /api/grades/:courseId
// @access  Faculty, Student (own)
const getGrades = async (req, res, next) => {
  try {
    let studentId;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      studentId = student._id;
    } else {
      studentId = req.query.studentId;
    }

    const grade = await Grade.findOne({ course: req.params.courseId, student: studentId })
      .populate('course', 'name code')
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    if (!grade) return res.status(404).json({ success: false, message: 'No grade record found' });

    res.status(200).json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all grades for a course (faculty view)
// @route   GET /api/grades/course/:courseId/all
// @access  Faculty, Admin
const getCourseGrades = async (req, res, next) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
    res.status(200).json({ success: true, count: grades.length, data: grades });
  } catch (err) {
    next(err);
  }
};

// @desc    Add or update an assessment score
// @route   POST /api/grades/assess
// @access  Faculty
const addAssessment = async (req, res, next) => {
  try {
    const { studentId, courseId, academicYear, semester, assessment } = req.body;

    let grade = await Grade.findOne({ student: studentId, course: courseId, academicYear });

    if (!grade) {
      grade = new Grade({ student: studentId, course: courseId, academicYear, semester, assessments: [] });
    }

    // Replace if assessment name already exists
    const existingIdx = grade.assessments.findIndex((a) => a.name === assessment.name);
    if (existingIdx >= 0) {
      grade.assessments[existingIdx] = assessment;
    } else {
      grade.assessments.push(assessment);
    }

    await grade.save(); // triggers weighted score computation

    res.status(200).json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGrades, getCourseGrades, addAssessment };
