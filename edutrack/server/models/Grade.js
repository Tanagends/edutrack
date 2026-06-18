const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Mid-1", "Assignment-2"
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, required: true, min: 1 },
  weightPercent: { type: Number, required: true, min: 0, max: 100 },
  recordedAt: { type: Date, default: Date.now },
});

const GradeSchema = new mongoose.Schema(
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
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    assessments: [AssessmentSchema],
    // Computed on save — weighted average out of 100
    weightedScore: {
      type: Number,
      default: 0,
    },
    letterGrade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'N/A'],
      default: 'N/A',
    },
  },
  { timestamps: true }
);

// One grade record per student per course per year
GradeSchema.index({ student: 1, course: 1, academicYear: 1 }, { unique: true });

// Compute weighted score and letter grade before saving
GradeSchema.pre('save', function (next) {
  if (this.assessments.length === 0) return next();

  const totalWeight = this.assessments.reduce((sum, a) => sum + a.weightPercent, 0);
  if (totalWeight === 0) return next();

  const weighted = this.assessments.reduce((sum, a) => {
    const normalised = (a.score / a.maxScore) * 100;
    return sum + normalised * (a.weightPercent / totalWeight);
  }, 0);

  this.weightedScore = Math.round(weighted * 10) / 10;

  // Aditya University grading scale
  if (weighted >= 90) this.letterGrade = 'O';
  else if (weighted >= 80) this.letterGrade = 'A+';
  else if (weighted >= 70) this.letterGrade = 'A';
  else if (weighted >= 60) this.letterGrade = 'B+';
  else if (weighted >= 50) this.letterGrade = 'B';
  else if (weighted >= 40) this.letterGrade = 'C';
  else this.letterGrade = 'F';

  next();
});

module.exports = mongoose.model('Grade', GradeSchema);
