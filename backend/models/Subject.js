import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);
