const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const { sendRiskAlert } = require('../utils/mailer');

const ATTENDANCE_THRESHOLD = 75;
const LOW_GRADE_THRESHOLD  = 50;

// @desc    Get at-risk students
// @route   GET /api/risk
// @access  Admin, Faculty
const getAtRiskStudents = async (req, res, next) => {
  try {
    const atRiskList = [];

    // ── 1. Attendance risk ───────────────────────────────────────────────
    const enrollmentFilter = { isActive: true };
    // Faculty only sees their own courses
    if (req.user.role === 'faculty') {
      const courses = await require('../models/Course').find({ faculty: req.user._id }).select('_id');
      enrollmentFilter.course = { $in: courses.map((c) => c._id) };
    }

    const enrollments = await Enrollment.find(enrollmentFilter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('course', 'name code faculty');

    for (const enr of enrollments) {
      if (!enr.student || !enr.course) continue;

      const totalSessions = await AttendanceSession.countDocuments({ course: enr.course._id });
      if (totalSessions === 0) continue;

      const attended = await AttendanceRecord.countDocuments({
        course: enr.course._id,
        student: enr.student._id,
        status: 'present',
      });

      const percentage = Math.round((attended / totalSessions) * 100);

      if (percentage < ATTENDANCE_THRESHOLD) {
        atRiskList.push({
          student: enr.student,
          course: enr.course,
          attendancePercent: percentage,
          attended,
          totalSessions,
          reason: 'low_attendance',
        });
      }
    }

    // ── 2. Grade risk ────────────────────────────────────────────────────
    const gradeFilter = {};
    if (req.user.role === 'faculty') {
      const courses = await require('../models/Course').find({ faculty: req.user._id }).select('_id');
      gradeFilter.course = { $in: courses.map((c) => c._id) };
    }

    const grades = await Grade.find({ ...gradeFilter, letterGrade: { $in: ['F', 'C'] } })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('course', 'name code');

    for (const g of grades) {
      if (!g.student || !g.course || g.weightedScore === 0) continue;

      // Avoid duplicating if already flagged for attendance in same course
      const alreadyFlagged = atRiskList.some(
        (r) =>
          r.student._id?.toString() === g.student._id?.toString() &&
          r.course._id?.toString() === g.course._id?.toString()
      );

      if (!alreadyFlagged) {
        atRiskList.push({
          student: g.student,
          course: g.course,
          currentScore: g.weightedScore,
          letterGrade: g.letterGrade,
          reason: 'low_grade',
        });
      }
    }

    res.status(200).json({ success: true, count: atRiskList.length, data: atRiskList });
  } catch (err) {
    next(err);
  }
};

// @desc    Send alert emails
// @route   POST /api/risk/notify
// @access  Admin, Faculty
const triggerRiskAlerts = async (req, res, next) => {
  try {
    const { atRiskStudents } = req.body;
    const results = [];

    for (const entry of atRiskStudents) {
      try {
        await sendRiskAlert(entry);
        results.push({ student: entry.student?._id || entry.student, status: 'sent' });
      } catch (e) {
        results.push({ student: entry.student?._id || entry.student, status: 'failed', error: e.message });
      }
    }

    res.status(200).json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAtRiskStudents, triggerRiskAlerts };
