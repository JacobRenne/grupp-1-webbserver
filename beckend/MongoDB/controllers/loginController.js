const User = require('../models/userModel');

exports.getLoginData = async (req, res) => {
  try {
    const { email, password } = req.query;
    console.log('Login attempt for:', email);
    console.log('Raw query params:', req.query);

    if (!email || !password) {
      return res.status(400).json({ error: "Both email and password are required" });
    }


    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });

    console.log('Found user:', user);

    if (!user) {
      console.log('No user found with email (case-insensitive):', email);
      return res.status(404).json({ 
        error: "Invalid credentials",
        details: "No user found with that email"
      });
    }

  
    console.log(`Comparing passwords:
      Input: ${password}
      Stored: ${user.password}`);

    if (user.password !== password) {
      return res.status(401).json({ 
        error: "Invalid credentials",
        details: "Password does not match"
      });
    }

    const userData = user.toObject();
    delete userData.password;
    res.json(userData);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: "Login failed",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};