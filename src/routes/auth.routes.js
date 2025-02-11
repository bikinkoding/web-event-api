const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login
router.post('/login', authController.login);

// Register
router.post('/register', authController.register);

// Reset Password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
