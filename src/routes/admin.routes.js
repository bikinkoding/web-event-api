const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/admin.controller');

// All admin routes require both authentication and admin role
router.use(auth, isAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Role Management
router.put('/users/:id/role', adminController.updateUserRole);

// Sales Reports
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/events', adminController.getEventReport);

module.exports = router;
