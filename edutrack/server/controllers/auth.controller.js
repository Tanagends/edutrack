const User = require('../models/User');
const Student = require('../models/Student');

// Helper: send token response
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (Admin-only in production — seeded or via admin panel)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, department, semester, enrollmentYear, guardianEmail } = req.body;

    const user = await User.create({ name, email, password, role: role || 'student' });

    // If student role, also create Student profile
    if ((role || 'student') === 'student') {
      await Student.create({
        user: user._id,
        rollNumber: rollNumber || `STU${Date.now()}`,
        department: department || 'Computer Science',
        semester: semester || 1,
        enrollmentYear: enrollmentYear || new Date().getFullYear(),
        guardianEmail: guardianEmail || '',
      });
    }

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated — contact admin' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
