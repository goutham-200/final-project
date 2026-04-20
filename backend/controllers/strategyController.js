import Strategy from '../models/Strategy.js';

export const getStrategies = async (req, res) => {
  try {
    const { learningStyle, subject, difficulty } = req.query;
    let query = { isApproved: true };

    if (learningStyle) query.targetLearningStyles = learningStyle;
    if (subject) query.subjectTags = subject;
    if (difficulty) query.difficultyLevel = difficulty;

    const strategies = await Strategy.find(query);
    res.json({ success: true, data: strategies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStrategyById = async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);
    if (!strategy) return res.status(404).json({ success: false, message: 'Strategy not found' });
    
    res.json({ success: true, data: strategy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStrategy = async (req, res) => {
  try {
    const newStrategy = await Strategy.create({
      ...req.body,
      createdBy: req.user._id,
      // Admins bypass approval, teachers require it
      isApproved: req.user.role === 'Super Admin'
    });
    res.status(201).json({ success: true, data: newStrategy });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateStrategy = async (req, res) => {
  try {
    const updatedStrategy = await Strategy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStrategy) return res.status(404).json({ success: false, message: 'Strategy not found' });
    
    res.json({ success: true, data: updatedStrategy });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteStrategy = async (req, res) => {
  try {
    const deletedStrategy = await Strategy.findByIdAndDelete(req.params.id);
    if (!deletedStrategy) return res.status(404).json({ success: false, message: 'Strategy not found' });
    
    res.json({ success: true, message: 'Strategy removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveStrategy = async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);
    if (!strategy) return res.status(404).json({ success: false, message: 'Strategy not found' });

    strategy.isApproved = true;
    await strategy.save();

    res.json({ success: true, data: strategy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
