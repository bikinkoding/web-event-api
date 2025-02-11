const db = require('../config/database');
const bcrypt = require('bcryptjs');

const adminController = {
  async getAllUsers(req, res) {
    try {
      const users = await db('users')
        .select('id', 'name', 'email', 'role', 'created_at')
        .orderBy('created_at', 'desc');

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'created_at')
        .where('id', req.params.id)
        .first();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's event registrations
      const eventRegistrations = await db('event_registrations as er')
        .join('events as e', 'er.event_id', 'e.id')
        .select(
          'e.id',
          'e.title',
          'er.status',
          'er.payment_status',
          'er.amount_paid',
          'er.created_at'
        )
        .where('er.user_id', user.id)
        .orderBy('er.created_at', 'desc');

      res.json({
        ...user,
        eventRegistrations
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { name, email } = req.body;
      const userId = req.params.id;

      // Check if email is already taken
      if (email) {
        const existingUser = await db('users')
          .where('email', email)
          .whereNot('id', userId)
          .first();

        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }

      await db('users')
        .where('id', userId)
        .update({
          name: name || undefined,
          email: email || undefined,
          updated_at: db.fn.now()
        });

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      // Check if user exists
      const user = await db('users')
        .where('id', userId)
        .first();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Begin transaction
      await db.transaction(async (trx) => {
        // Delete user's event registrations
        await trx('event_registrations')
          .where('user_id', userId)
          .delete();

        // Delete user's events
        await trx('events')
          .where('created_by', userId)
          .delete();

        // Delete user's blogs
        await trx('blogs')
          .where('created_by', userId)
          .delete();

        // Finally, delete the user
        await trx('users')
          .where('id', userId)
          .delete();
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      // Validate role
      if (!['mahasiswa', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      // Check if user exists
      const user = await db('users')
        .where('id', userId)
        .first();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update role
      await db('users')
        .where('id', userId)
        .update({
          role,
          updated_at: db.fn.now()
        });

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getSalesReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let query = db('event_registrations as er')
        .join('events as e', 'er.event_id', 'e.id')
        .join('users as u', 'er.user_id', 'u.id')
        .select(
          'e.title as event_title',
          'u.name as user_name',
          'er.amount_paid',
          'er.payment_status',
          'er.payment_date'
        )
        .where('er.payment_status', 'completed');

      if (startDate) {
        query = query.where('er.payment_date', '>=', startDate);
      }
      if (endDate) {
        query = query.where('er.payment_date', '<=', endDate);
      }

      const sales = await query.orderBy('er.payment_date', 'desc');

      // Calculate total
      const total = sales.reduce((sum, sale) => sum + parseFloat(sale.amount_paid), 0);

      res.json({
        sales,
        total,
        count: sales.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getEventReport(req, res) {
    try {
      const events = await db('events as e')
        .leftJoin('event_registrations as er', 'e.id', 'er.event_id')
        .select(
          'e.id',
          'e.title',
          'e.date',
          'e.capacity',
          db.raw('COUNT(DISTINCT er.user_id) as registered_users'),
          db.raw('SUM(CASE WHEN er.payment_status = "completed" THEN er.amount_paid ELSE 0 END) as total_revenue')
        )
        .groupBy('e.id')
        .orderBy('e.date', 'desc');

      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = adminController;
