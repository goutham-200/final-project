import mongoose from 'mongoose';

const strategySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetLearningStyles: [{ 
    type: String, 
    enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading-Writing']
  }],
  subjectTags: [{ type: String }],
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'] },
  resources: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Strategy', strategySchema);
