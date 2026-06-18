const User = require('../models/User');

// @desc    Get all users, optionally filter by role
// @route   GET /api/users?role=faculty
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a faculty or admin account (admin only)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['faculty', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Use /api/auth/register for student accounts' });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle
// @access  Admin
const toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ success: true, data: { id: user._id, isActive: user.isActive } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, toggleUser };
