import Recommendation from '../models/Recommendation.js';
import Student from '../models/Student.js';
import Strategy from '../models/Strategy.js';
import { generateTopStrategies } from '../utils/recommendationEngine.js';

export const generateRecommendations = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    // Load student WITH virtuals (attendancePercent) using .exec()
    const student = await Student.findOne({ _id: studentId, teacherId: req.user._id }).exec();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch all approved strategies
    const approvedStrategies = await Strategy.find({ isApproved: true });
    if (approvedStrategies.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No approved strategies in the database. Please add strategies to the Strategy Bank first.'
      });
    }

    // Pass student as plain object WITH virtuals so the engine can read attendancePercent
    const studentData = student.toObject({ virtuals: true });

    // Engine scores and picks top strategies
    const topStrategies = await generateTopStrategies(studentData, approvedStrategies);

    // Clear old recommendations and save fresh ones
    await Recommendation.deleteMany({ studentId: student._id });

    const newRecs = topStrategies.map(strat => ({
      studentId: student._id,
      strategyId: strat._id || strat.id,
      teacherNotes: strat.explanation || 'Recommended based on student profile.'
    }));

    await Recommendation.insertMany(newRecs);

    // Return populated data
    const populated = await Recommendation.find({ studentId: student._id })
      .populate('strategyId')
      .sort({ createdAt: -1 });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('Recommendation generation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getStudentRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.studentId, teacherId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
    }

    const recommendations = await Recommendation.find({ studentId: req.params.studentId })
      .populate('strategyId')
      .sort({ recommendedAt: -1 });

    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rateRecommendation = async (req, res) => {
  try {
    const { rating, notes } = req.body;
    const recId = req.params.id;

    const recommendation = await Recommendation.findById(recId).populate('studentId');
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    // Verify teacher owns the student
    if (recommendation.studentId.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    recommendation.effectivenessRating = rating;
    if (notes) recommendation.teacherNotes = notes;
    await recommendation.save();

    res.json({ success: true, data: recommendation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
