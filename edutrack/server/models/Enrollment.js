const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
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
    academicYear: {
      type: String, // e.g. "2024-25"
      required: [true, 'Academic year is required'],
    },
    semester: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A student can only be enrolled once per course per academic year
EnrollmentSchema.index({ student: 1, course: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
