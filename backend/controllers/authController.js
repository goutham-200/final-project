import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });
    
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
