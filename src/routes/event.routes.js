const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/auth');
const eventController = require('../controllers/event.controller');

// Public routes (no token needed)
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (admin only)
router.post('/', auth, isAdmin, eventController.createEvent);
router.put('/:id', auth, isAdmin, eventController.updateEvent);
router.delete('/:id', auth, isAdmin, eventController.deleteEvent);

// User event registration (requires authentication)
router.post('/:id/register', auth, eventController.registerForEvent);

module.exports = router;
