const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      shopName,
      shopCategory,
      address,
      phoneNumber,
    } = req.body;

    const normalizedRole = role === 'shopkeeper' ? 'shopkeeper' : 'customer';

    if (normalizedRole === 'shopkeeper') {
      if (!shopName || !shopCategory || !address || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Shopkeeper signup requires shop name, category, address and phone number',
        });
      }
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      shopName: normalizedRole === 'shopkeeper' ? shopName : undefined,
      shopCategory: normalizedRole === 'shopkeeper' ? shopCategory : undefined,
      address: normalizedRole === 'shopkeeper' ? address : undefined,
      phoneNumber: normalizedRole === 'shopkeeper' ? phoneNumber : undefined,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        shopCategory: user.shopCategory,
        address: user.address,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        shopCategory: user.shopCategory,
        address: user.address,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
