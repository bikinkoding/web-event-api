const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');

// Get user profile (requires authentication)
router.get('/profile', auth, userController.getProfile);

// Update user profile (requires authentication)
router.put('/profile', auth, userController.updateProfile);

// Change password (requires authentication)
router.put('/change-password', auth, userController.changePassword);

// Get user's registered events (requires authentication)
router.get('/events', auth, userController.getUserEvents);

module.exports = router;
