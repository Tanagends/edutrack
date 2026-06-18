const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const { sendRiskAlert } = require('../utils/mailer');

const ATTENDANCE_THRESHOLD = 75; // %
const GRADE_DROP_THRESHOLD = 15; // points drop triggers alert

// @desc    Get at-risk students across all courses (admin) or faculty's courses
// @route   GET /api/risk
// @access  Admin, Faculty
const getAtRiskStudents = async (req, res, next) => {
  try {
    // Aggregate attendance per student per course
    const attendanceStats = await AttendanceRecord.aggregate([
      { $match: { status: 'present' } },
      {
        $group: {
          _id: { student: '$student', course: '$course' },
          presentCount: { $sum: 1 },
        },
      },
    ]);

    // Get total sessions per course
    const sessionCounts = await AttendanceSession.aggregate([
      { $group: { _id: '$course', totalSessions: { $sum: 1 } } },
    ]);

    const sessionMap = {};
    sessionCounts.forEach((s) => { sessionMap[s._id.toString()] = s.totalSessions; });

    // Compute at-risk list
    const atRiskList = [];
    for (const stat of attendanceStats) {
      const total = sessionMap[stat._id.course.toString()] || 0;
      if (total === 0) continue;
      const percentage = Math.round((stat.presentCount / total) * 100);
      if (percentage < ATTENDANCE_THRESHOLD) {
        atRiskList.push({
          student: stat._id.student,
          course: stat._id.course,
          attendancePercent: percentage,
          reason: 'low_attendance',
        });
      }
    }

    // Also flag students with significant grade drops
    const grades = await Grade.find().sort({ updatedAt: 1 });
    const gradeMap = {};
    for (const g of grades) {
      const key = `${g.student}_${g.course}`;
      if (!gradeMap[key]) {
        gradeMap[key] = g.weightedScore;
      } else {
        const drop = gradeMap[key] - g.weightedScore;
        if (drop >= GRADE_DROP_THRESHOLD) {
          atRiskList.push({
            student: g.student,
            course: g.course,
            gradeDrop: drop,
            currentScore: g.weightedScore,
            reason: 'grade_drop',
          });
        }
        gradeMap[key] = g.weightedScore;
      }
    }

    // Populate student and course info
    const populated = await Student.populate(atRiskList, [
      { path: 'student', populate: { path: 'user', select: 'name email' } },
      { path: 'course', select: 'name code' },
    ]);

    res.status(200).json({ success: true, count: populated.length, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger risk alerts — sends emails to faculty for at-risk students
// @route   POST /api/risk/notify
// @access  Admin, Faculty
const triggerRiskAlerts = async (req, res, next) => {
  try {
    const { atRiskStudents } = req.body; // array from getAtRiskStudents
    const results = [];

    for (const entry of atRiskStudents) {
      try {
        await sendRiskAlert(entry);
        results.push({ student: entry.student, status: 'sent' });
      } catch (e) {
        results.push({ student: entry.student, status: 'failed', error: e.message });
      }
    }

    res.status(200).json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAtRiskStudents, triggerRiskAlerts };
