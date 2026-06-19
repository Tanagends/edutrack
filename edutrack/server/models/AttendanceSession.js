const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Short-lived UUID token embedded in the QR code
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // How this session was taken — avoids guessing from timestamps in the UI
    type: {
      type: String,
      enum: ['qr', 'manual'],
      default: 'qr',
    },
    // Count for quick stats
    totalPresent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-close expired sessions (TTL index on expiresAt does NOT delete the doc,
// we handle expiry in the controller — this index just helps with queries)
AttendanceSessionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema);
