import Student from '../models/Student.js';

export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { teacherId: req.user._id };
    
    // Add simple keyword search if provided
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const students = await Student.find(query).skip(skip).limit(limit);
    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { studentEmail, ...rest } = req.body;

    let userId = null;
    if (studentEmail && studentEmail.trim()) {
      const { default: User } = await import('../models/User.js');
      const userAccount = await User.findOne({ email: studentEmail.trim(), role: 'Student' });
      if (!userAccount) {
        return res.status(404).json({
          success: false,
          message: `No Student account found with email "${studentEmail}". Ask the Admin to create it first.`
        });
      }
      // Prevent double-linking
      const alreadyLinked = await Student.findOne({ userId: userAccount._id });
      if (alreadyLinked) {
        return res.status(400).json({
          success: false,
          message: `This student account is already linked to "${alreadyLinked.name}".`
        });
      }
      userId = userAccount._id;
    }

    const newStudent = await Student.create({
      ...rest,
      teacherId: req.user._id,
      ...(userId && { userId })
    });

    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    // Find the document first (so pre-save hooks run on .save())
    const student = await Student.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { studentEmail, ...rest } = req.body;

    // Apply all fields from body onto the document
    Object.assign(student, rest);

    // If teacher wants to link/re-link a student account
    if (studentEmail && studentEmail.trim()) {
      const { default: User } = await import('../models/User.js');
      const userAccount = await User.findOne({ email: studentEmail.trim(), role: 'Student' });
      if (!userAccount) {
        return res.status(404).json({
          success: false,
          message: `No Student account found with email "${studentEmail}".`
        });
      }
      // Only block if already linked to a DIFFERENT student
      const alreadyLinked = await Student.findOne({ userId: userAccount._id, _id: { $ne: student._id } });
      if (alreadyLinked) {
        return res.status(400).json({
          success: false,
          message: `This account is already linked to "${alreadyLinked.name}".`
        });
      }
      student.userId = userAccount._id;
    }

    // .save() triggers pre-save hook → recalculates performanceScore & subjectWeaknesses
    await student.save();

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ _id: req.params.id, teacherId: req.user._id });
    if (!deletedStudent) return res.status(404).json({ success: false, message: 'Student not found' });
    
    // In a real app, you would also remove recommendations associated with this student here
    res.json({ success: true, message: 'Student removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/students/:id/link
 * Teacher links a User account (by email) to a student profile
 * so that student can log in and see their own marks & strategies.
 */
export const linkStudentAccount = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    // Find the User with that email and role Student
    const { default: User } = await import('../models/User.js');
    const userAccount = await User.findOne({ email, role: 'Student' });
    if (!userAccount) {
      return res.status(404).json({ success: false, message: 'No Student account found with that email.' });
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id },
      { userId: userAccount._id },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    res.json({ success: true, message: `Linked to ${userAccount.email}`, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

