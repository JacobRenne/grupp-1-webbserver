const User = require('../models/userModel');
const mongoose = require('mongoose');

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      new mongoose.Types.ObjectId(req.params.id)
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ 
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

exports.updateUser = async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(req.params.id),
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (err) {
      res.status(400).json({ 
        error: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) 
      });
    }
  };
  
  exports.deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };