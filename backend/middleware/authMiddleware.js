import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists. Please log in again.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Super Admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

export const requireTeacher = (req, res, next) => {
  if (req.user && (req.user.role === 'Teacher' || req.user.role === 'Super Admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as a teacher' });
  }
};
