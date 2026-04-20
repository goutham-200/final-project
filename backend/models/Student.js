import mongoose from 'mongoose';

const subjectMarkSchema = new mongoose.Schema({
  subject:    { type: String, required: true },
  marks:      { type: Number, min: 0, max: 100, required: true },
  maxMarks:   { type: Number, default: 100 },
  examType:   { type: String, enum: ['Unit Test', 'Mid Term', 'Final', 'Assignment', 'Quiz'], default: 'Unit Test' },
  date:       { type: Date, default: Date.now }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  teacherId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // linked student account
  grade:             { type: String },
  rollNumber:        { type: String },
  // Per-subject marks
  subjectMarks:      [subjectMarkSchema],
  subjectWeaknesses: [{ type: String }],
  // Attendance
  totalClasses:      { type: Number, default: 0 },
  attendedClasses:   { type: Number, default: 0 },
  // Derived from marks (auto-calculated)
  performanceScore:  { type: Number, min: 0, max: 100, default: 0 },
  // Learning profile
  learningStyle: {
    type: String,
    enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading-Writing'],
    default: 'Visual'
  },
  notes: { type: String },
  photo: { type: String }
}, { timestamps: true });

// Auto-compute performanceScore and subjectWeaknesses before save
studentSchema.pre('save', function () {
  if (this.subjectMarks && this.subjectMarks.length > 0) {
    const avg = this.subjectMarks.reduce((sum, s) => sum + (s.marks / s.maxMarks) * 100, 0) / this.subjectMarks.length;
    this.performanceScore = Math.round(avg);
    // Subjects below 50% are weaknesses
    this.subjectWeaknesses = this.subjectMarks
      .filter(s => (s.marks / s.maxMarks) * 100 < 50)
      .map(s => s.subject);
  }
});

// Virtual: attendance percentage
studentSchema.virtual('attendancePercent').get(function () {
  if (!this.totalClasses || this.totalClasses === 0) return null;
  return Math.round((this.attendedClasses / this.totalClasses) * 100);
});

studentSchema.set('toObject', { virtuals: true });
studentSchema.set('toJSON',   { virtuals: true });

export default mongoose.model('Student', studentSchema);

