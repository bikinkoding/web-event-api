const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendEmail } = require('../utils/email');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [userId] = await db('users').insert({
        name,
        email,
        password: hashedPassword,
        role: 'mahasiswa' // Default role
      });

      // Send welcome email
      await sendEmail({
        to: email,
        subject: 'Welcome to Web Event',
        text: `Welcome ${name}! Your account has been created successfully.`
      });

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // Find user
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save reset token to database
      await db('users')
        .where({ id: user.id })
        .update({ reset_token: resetToken });

      // Send reset password email
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: email,
        subject: 'Reset Password',
        text: `Click this link to reset your password: ${resetLink}`
      });

      res.json({ message: 'Password reset link sent to email' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await db('users')
        .where({ 
          id: decoded.id,
          reset_token: token
        })
        .first();

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await db('users')
        .where({ id: user.id })
        .update({
          password: hashedPassword,
          reset_token: null
        });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = authController;
