const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePaymentRequest } = require('../middleware/payment');

router.post('/pay', paymentController.initiatePayment);
router.get('/status/:transactionId', paymentController.getPaymentStatus);

module.exports = router;
