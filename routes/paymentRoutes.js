const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePaymentRequest } = require('../middleware/payment');

router.post('/Pay', paymentController.processPayment);
router.post('/Status', paymentController.processPaymentStatus);

module.exports = router;
