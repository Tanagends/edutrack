const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
  },
  { timestamps: true }
);

// One record per student per session
AttendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
