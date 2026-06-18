const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    enrollmentYear: {
      type: Number,
      required: [true, 'Enrollment year is required'],
    },
    guardianEmail: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid guardian email'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
