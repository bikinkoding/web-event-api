const db = require('../config/database');
const { sendEmail } = require('../utils/email');
const path = require('path');

const paymentController = {
  async submitPaymentProof(req, res) {
    try {
      const { registrationId } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'Payment proof file is required' });
      }

      // Get the file path relative to the uploads directory
      const payment_proof_url = `/uploads/payment-proofs/${req.file.filename}`;

      // Check if registration exists and belongs to user
      const registration = await db('event_registrations as er')
        .join('events as e', 'er.event_id', 'e.id')
        .select('er.*', 'e.title as event_title')
        .where({
          'er.id': registrationId,
          'er.user_id': userId
        })
        .first();

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      if (registration.payment_status === 'completed') {
        return res.status(400).json({ message: 'Payment already completed' });
      }

      // Update payment proof
      await db('event_registrations')
        .where('id', registrationId)
        .update({
          payment_proof_url,
          payment_notes: notes,
          payment_status: 'pending_confirmation',
          updated_at: db.fn.now()
        });

      res.json({ 
        message: 'Payment proof submitted successfully',
        payment_proof_url
      });

    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getUserPayments(req, res) {
    try {
      const userId = req.user.id;

      const payments = await db('event_registrations as er')
        .join('events as e', 'er.event_id', 'e.id')
        .leftJoin('users as u', 'er.confirmed_by', 'u.id')
        .select(
          'er.id',
          'e.title as event_title',
          'er.amount_paid',
          'er.payment_status',
          'er.payment_proof_url',
          'er.payment_notes',
          'er.payment_date',
          'er.payment_confirmed_at',
          'u.name as confirmed_by_name'
        )
        .where('er.user_id', userId)
        .orderBy('er.created_at', 'desc');

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getPendingPayments(req, res) {
    try {
      const payments = await db('event_registrations as er')
        .join('events as e', 'er.event_id', 'e.id')
        .join('users as u', 'er.user_id', 'u.id')
        .select(
          'er.id',
          'e.title as event_title',
          'u.name as user_name',
          'u.email as user_email',
          'er.amount_paid',
          'er.payment_status',
          'er.payment_proof_url',
          'er.payment_notes',
          'er.created_at',
          'er.updated_at'
        )
        .where('er.payment_status', 'pending_confirmation')
        .orderBy('er.updated_at', 'desc');

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async confirmPayment(req, res) {
    try {
      const { registrationId } = req.params;
      const adminId = req.user.id;

      // Get registration details
      const registration = await db('event_registrations as er')
        .join('events as e', 'er.event_id', 'e.id')
        .join('users as u', 'er.user_id', 'u.id')
        .select(
          'er.*',
          'e.title as event_title',
          'u.email as user_email',
          'u.name as user_name'
        )
        .where('er.id', registrationId)
        .first();

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      if (registration.payment_status === 'completed') {
        return res.status(400).json({ message: 'Payment already confirmed' });
      }

      // Update payment status
      await db('event_registrations')
        .where('id', registrationId)
        .update({
          payment_status: 'completed',
          payment_date: db.fn.now(),
          payment_confirmed_at: db.fn.now(),
          confirmed_by: adminId,
          updated_at: db.fn.now()
        });

      // Send confirmation email to user
      await sendEmail({
        to: registration.user_email,
        subject: `Payment Confirmed - ${registration.event_title}`,
        text: `Dear ${registration.user_name},\n\nYour payment for ${registration.event_title} has been confirmed. You are now officially registered for the event.\n\nThank you for your participation!\n\nBest regards,\nHMSE UNIPI`
      });

      res.json({ message: 'Payment confirmed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = paymentController;
