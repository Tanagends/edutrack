const Course = require('../models/Course');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const { sendRiskAlert } = require('../utils/mailer');

const ATTENDANCE_THRESHOLD = 75; // %
const RISK_LETTER_GRADES = ['F', 'C']; // letterGrade values considered "at risk"

// @desc    Get at-risk students.
//          Returns one row per (student, course, reason) — a student can
//          appear multiple times if they're at risk for more than one
//          reason in the same course (e.g. low attendance AND low grade).
// @route   GET /api/risk
// @access  Admin, Faculty
const getAtRiskStudents = async (req, res, next) => {
  try {
    const atRiskList = [];

    // Faculty only sees their own courses
    let courseIdFilter = null;
    if (req.user.role === 'faculty') {
      const courses = await Course.find({ faculty: req.user._id }).select('_id');
      courseIdFilter = courses.map((c) => c._id);
    }

    // ── 1. Attendance risk ───────────────────────────────────────────────
    const enrollmentFilter = { isActive: true };
    if (courseIdFilter) enrollmentFilter.course = { $in: courseIdFilter };

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

    // ── 2. Grade risk — independent of attendance risk, always shown ─────
    const gradeFilter = { letterGrade: { $in: RISK_LETTER_GRADES } };
    if (courseIdFilter) gradeFilter.course = { $in: courseIdFilter };

    const grades = await Grade.find(gradeFilter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('course', 'name code');

    for (const g of grades) {
      if (!g.student || !g.course || g.weightedScore === 0) continue;

      // No dedup against attendance risk — a student at risk for two
      // different reasons in the same course should show two rows.
      atRiskList.push({
        student: g.student,
        course: g.course,
        currentScore: g.weightedScore,
        letterGrade: g.letterGrade,
        reason: 'low_grade',
      });
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
        results.push({ student: entry.student?._id || entry.student, reason: entry.reason, status: 'sent' });
      } catch (e) {
        results.push({ student: entry.student?._id || entry.student, reason: entry.reason, status: 'failed', error: e.message });
      }
    }

    res.status(200).json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAtRiskStudents, triggerRiskAlerts };
