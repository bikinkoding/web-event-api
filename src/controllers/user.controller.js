const db = require('../config/database');
const bcrypt = require('bcryptjs');

const userController = {
  async getProfile(req, res) {
    try {
      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'created_at')
        .where('id', req.user.id)
        .first();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await db('users')
          .where('email', email)
          .whereNot('id', req.user.id)
          .first();

        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }

      // Update user profile
      await db('users')
        .where('id', req.user.id)
        .update({
          name: name || undefined,
          email: email || undefined,
          updated_at: db.fn.now()
        });

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await db('users')
        .select('password')
        .where('id', req.user.id)
        .first();

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await db('users')
        .where('id', req.user.id)
        .update({
          password: hashedPassword,
          updated_at: db.fn.now()
        });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getUserEvents(req, res) {
    try {
      const events = await db('event_registrations as er')
        .join('events as e', 'er.event_id', 'e.id')
        .select(
          'e.id',
          'e.title',
          'e.date',
          'e.time',
          'e.location',
          'er.status as registration_status',
          'er.payment_status',
          'er.amount_paid',
          'er.payment_date'
        )
        .where('er.user_id', req.user.id)
        .orderBy('e.date', 'desc');

      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = userController;
