import Student from '../models/Student.js';
import User from '../models/User.js';
import Strategy from '../models/Strategy.js';
import Recommendation from '../models/Recommendation.js';

/**
 * GET /api/stats
 * Returns aggregate counts visible to any authenticated user.
 * Admins get system-wide counts; Teachers get personal counts.
 */
export const getStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Super Admin';

    // System-wide counts (admin only)
    const totalUsers      = isAdmin ? await User.countDocuments() : null;
    const totalTeachers   = isAdmin ? await User.countDocuments({ role: 'Teacher' }) : null;
    const totalStudentAccounts = isAdmin ? await User.countDocuments({ role: 'Student' }) : null;
    const totalAdmins     = isAdmin ? await User.countDocuments({ role: 'Super Admin' }) : null;

    // Teacher-scoped counts
    const teacherFilter = isAdmin ? {} : { teacherId: req.user._id };
    const totalStudents   = await Student.countDocuments(teacherFilter);
    const totalStrategies = await Strategy.countDocuments({ isApproved: true });
    const totalRecs       = await Recommendation.countDocuments(
      isAdmin ? {} : { studentId: { $in: await Student.find(teacherFilter).distinct('_id') } }
    );

    // Performance breakdown
    const students = await Student.find(teacherFilter).select('performanceScore attendancePercent learningStyle subjectWeaknesses');
    const atRisk   = students.filter(s => s.performanceScore < 50).length;
    const avgPerf  = students.length
      ? Math.round(students.reduce((a, s) => a + (s.performanceScore || 0), 0) / students.length)
      : 0;

    const styleMap = { Visual: 0, Auditory: 0, Kinesthetic: 0, 'Reading-Writing': 0 };
    students.forEach(s => { if (styleMap[s.learningStyle] !== undefined) styleMap[s.learningStyle]++; });

    res.json({
      success: true,
      data: {
        // Admin-specific
        totalUsers, totalTeachers, totalStudentAccounts, totalAdmins,
        // Shared
        totalStudents, totalStrategies, totalRecs,
        atRisk, avgPerf, learningStyles: styleMap
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
