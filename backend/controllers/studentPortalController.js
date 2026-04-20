import Student from '../models/Student.js';
import Recommendation from '../models/Recommendation.js';

/**
 * GET /api/student-portal/me
 * Returns the student profile linked to the currently logged-in user.
 * Uses .exec() and lean:false so Mongoose virtuals (attendancePercent) are included.
 */
export const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('teacherId', 'name email')
      .exec();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student profile is linked to your account. Ask your teacher to link your account email when creating your profile.'
      });
    }

    // Use toJSON to include virtuals (attendancePercent)
    res.json({ success: true, data: student.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/student-portal/recommendations
 * Returns all AI recommendations for the logged-in student, populated with strategy details.
 */
export const getMyRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student profile is linked to your account.'
      });
    }

    const recommendations = await Recommendation.find({ studentId: student._id })
      .populate('strategyId')
      .sort({ recommendedAt: -1 })
      .exec();

    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
