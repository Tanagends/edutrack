const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

// @desc    Faculty generates a QR session for a course
// @route   POST /api/attendance/session
// @access  Faculty
const createSession = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const expireMinutes = parseInt(process.env.QR_EXPIRE_MINUTES || '10');

    const qrToken = uuidv4();
    const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000);

    // Deactivate any previous open session for this course
    await AttendanceSession.updateMany(
      { course: courseId, faculty: req.user._id, isActive: true },
      { isActive: false }
    );

    const session = await AttendanceSession.create({
      course: courseId,
      faculty: req.user._id,
      qrToken,
      expiresAt,
    });

    // Generate QR code as base64 data URL
    const qrData = JSON.stringify({ sessionId: session._id, token: qrToken });
    const qrImage = await QRCode.toDataURL(qrData);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session._id,
        qrImage,
        expiresAt,
        expireMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Student scans QR to mark attendance
// @route   POST /api/attendance/mark
// @access  Student
const markAttendance = async (req, res, next) => {
  try {
    const { sessionId, token } = req.body;

    // Find session
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (!session.isActive) return res.status(400).json({ success: false, message: 'Session is no longer active' });
    if (new Date() > session.expiresAt) {
      await AttendanceSession.findByIdAndUpdate(sessionId, { isActive: false });
      return res.status(400).json({ success: false, message: 'QR code has expired' });
    }
    if (session.qrToken !== token) {
      return res.status(400).json({ success: false, message: 'Invalid QR token' });
    }

    // Get student profile
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    // Check enrollment
    const enrolled = await Enrollment.findOne({ student: student._id, course: session.course, isActive: true });
    if (!enrolled) return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });

    // Create record (unique index prevents duplicates)
    const record = await AttendanceRecord.create({
      session: sessionId,
      student: student._id,
      course: session.course,
    });

    // Increment present count
    await AttendanceSession.findByIdAndUpdate(sessionId, { $inc: { totalPresent: 1 } });

    res.status(201).json({ success: true, message: 'Attendance marked!', data: record });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this session' });
    }
    next(err);
  }
};

// @desc    Get attendance summary for a student in a course
// @route   GET /api/attendance/summary/:courseId
// @access  Faculty, Student (own)
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Total sessions for this course
    const totalSessions = await AttendanceSession.countDocuments({ course: courseId });

    let studentId;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      studentId = student._id;
    } else {
      studentId = req.query.studentId;
    }

    const attended = await AttendanceRecord.countDocuments({ course: courseId, student: studentId, status: 'present' });
    const percentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

    res.status(200).json({
      success: true,
      data: { totalSessions, attended, percentage, atRisk: percentage < 75 },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all sessions for a course (faculty)
// @route   GET /api/attendance/sessions/:courseId
// @access  Faculty, Admin
const getSessionsByCourse = async (req, res, next) => {
  try {
    const sessions = await AttendanceSession.find({ course: req.params.courseId })
      .sort('-date')
      .populate('faculty', 'name');
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSession, markAttendance, getAttendanceSummary, getSessionsByCourse };
