const db = require('../config/database');
const { sendEmail } = require('../utils/email');
const path = require('path');

const generateEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: rgb(249, 115, 22);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: white;
          padding: 20px;
          border-radius: 0 0 5px 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .status {
          padding: 10px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
          font-weight: bold;
        }
        .status.success {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Email ini dikirim oleh HMSE UNIPI. Mohon jangan membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const paymentController = {
  async submitPaymentProof(req, res) {
    try {
      const { registrationId } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'Bukti pembayaran wajib diunggah' });
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
        return res.status(404).json({ message: 'Registrasi tidak ditemukan' });
      }

      if (registration.payment_status === 'completed') {
        return res.status(400).json({ message: 'Pembayaran sudah selesai' });
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
        message: 'Bukti pembayaran berhasil diunggah',
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
        return res.status(404).json({ message: 'Registrasi tidak ditemukan' });
      }

      if (registration.payment_status === 'completed') {
        return res.status(400).json({ message: 'Pembayaran sudah dikonfirmasi' });
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
        subject: `Pembayaran Dikonfirmasi - ${registration.event_title}`,
        html: generateEmailTemplate(
          'Pembayaran Berhasil',
          `
            <p>Halo ${registration.user_name},</p>
            <p>Pembayaran Anda untuk event <strong>${registration.event_title}</strong> telah kami konfirmasi.</p>
            <div class="status success">
              ✓ Anda telah terdaftar sebagai peserta event
            </div>
            <p>Detail Event:</p>
            <ul>
              <li>Nama Event: ${registration.event_title}</li>
              <li>Status: Pembayaran Selesai</li>
              <li>Tanggal Konfirmasi: ${new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</li>
            </ul>
            <p>Terima kasih atas partisipasi Anda!</p>
            <p>Salam,<br>HMSE UNIPI</p>
          `
        )
      });

      res.json({ message: 'Pembayaran berhasil dikonfirmasi' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = paymentController;
