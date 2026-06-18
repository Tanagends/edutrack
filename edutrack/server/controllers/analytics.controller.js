const Student = require('../models/Student');
const Course = require('../models/Course');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const Grade = require('../models/Grade');
const User = require('../models/User');

// @desc    Admin overview stats
// @route   GET /api/analytics/overview
// @access  Admin
const getOverview = async (req, res, next) => {
  try {
    const [totalStudents, totalCourses, totalFaculty, totalSessions] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'faculty' }),
      AttendanceSession.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { totalStudents, totalCourses, totalFaculty, totalSessions },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Attendance breakdown per course (for charts)
// @route   GET /api/analytics/attendance
// @access  Admin, Faculty
const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const stats = await AttendanceRecord.aggregate([
      {
        $group: {
          _id: '$course',
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          totalRecords: { $sum: 1 },
        },
      },
      {
        $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' },
      },
      { $unwind: '$course' },
      {
        $project: {
          courseName: '$course.name',
          courseCode: '$course.code',
          presentCount: 1,
          totalRecords: 1,
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$presentCount', '$totalRecords'] }, 100] }, 1],
          },
        },
      },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// @desc    Grade distribution per course
// @route   GET /api/analytics/grades
// @access  Admin, Faculty
const getGradeAnalytics = async (req, res, next) => {
  try {
    const dist = await Grade.aggregate([
      {
        $group: {
          _id: { course: '$course', letterGrade: '$letterGrade' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: { from: 'courses', localField: '_id.course', foreignField: '_id', as: 'course' },
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$_id.course',
          courseName: { $first: '$course.name' },
          courseCode: { $first: '$course.code' },
          distribution: { $push: { grade: '$_id.letterGrade', count: '$count' } },
        },
      },
    ]);

    res.status(200).json({ success: true, data: dist });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverview, getAttendanceAnalytics, getGradeAnalytics };
