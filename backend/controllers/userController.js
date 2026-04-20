import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password, role });
    
    res.status(201).json({ 
      success: true, 
      data: {
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        createdAt: user.createdAt
      } 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    
    if (password) {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
