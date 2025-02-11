const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const blogRoutes = require('./blog.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const paymentRoutes = require('./payment.routes');

// Auth routes
router.use('/auth', authRoutes);

// Event routes
router.use('/events', eventRoutes);

// Blog routes
router.use('/blogs', blogRoutes);

// User routes
router.use('/users', userRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

module.exports = router;
