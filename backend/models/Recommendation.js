import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  strategyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', required: true },
  recommendedAt: { type: Date, default: Date.now },
  effectivenessRating: { type: Number, min: 1, max: 5 },
  teacherNotes: { type: String }
}, { timestamps: true });

export default mongoose.model('Recommendation', recommendationSchema);
