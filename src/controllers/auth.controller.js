const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendEmail } = require('../utils/email');

const generateEmailTemplate = (title, content, buttonText, buttonUrl) => {
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
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: rgb(249, 115, 22);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
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
          ${buttonText && buttonUrl ? `
            <div style="text-align: center;">
              <a href="${buttonUrl}" class="button">${buttonText}</a>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>Email ini dikirim oleh HMSE UNIPI. Mohon jangan membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

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
        return res.status(400).json({ message: 'Email sudah terdaftar' });
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
        subject: 'Selamat Datang di HMSE UNIPI',
        html: generateEmailTemplate(
          'Selamat Datang!',
          `
            <p>Halo ${name},</p>
            <p>Terima kasih telah mendaftar di HMSE UNIPI. Akun Anda telah berhasil dibuat.</p>
            <p>Sekarang Anda dapat:</p>
            <ul>
              <li>Mendaftar ke berbagai event menarik</li>
              <li>Melihat status pendaftaran event Anda</li>
              <li>Mengelola pembayaran event</li>
            </ul>
            <p>Silakan klik tombol di bawah untuk login ke akun Anda:</p>
          `,
          'Login Sekarang',
          `${process.env.FRONTEND_URL}/login`
        )
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
        subject: 'Reset Password HMSE UNIPI',
        html: generateEmailTemplate(
          'Reset Password',
          `
            <p>Halo ${user.name},</p>
            <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
            <p>Silakan klik tombol di bawah untuk mereset password Anda:</p>
            <p><strong>Link ini akan kadaluarsa dalam 1 jam.</strong></p>
          `,
          'Reset Password',
          resetLink
        )
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
