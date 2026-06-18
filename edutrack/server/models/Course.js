const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 6,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', CourseSchema);
