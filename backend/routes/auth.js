import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this name already exists.' });
    }

    // Create new user
    const user = new User({
      name,
      password,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Find user by name
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// Protected route example
router.get('/protected', auth, requireRole(['admin']), (req, res) => {
  res.json({ message: 'This is a protected admin route', user: req.user });
});

export default router; 