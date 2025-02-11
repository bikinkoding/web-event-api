const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/auth');
const paymentController = require('../controllers/payment.controller');
const upload = require('../middlewares/upload');

// User routes
router.post('/registrations/:registrationId/proof', 
  auth, 
  upload.single('proof'),
  paymentController.submitPaymentProof
);

router.get('/my-payments', auth, paymentController.getUserPayments);

// Admin routes
router.get('/pending', auth, isAdmin, paymentController.getPendingPayments);
router.post('/registrations/:registrationId/confirm', auth, isAdmin, paymentController.confirmPayment);

module.exports = router;
