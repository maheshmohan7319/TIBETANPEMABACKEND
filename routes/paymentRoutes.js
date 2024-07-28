const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePaymentRequest } = require('../middleware/payment');

router.post('/Pay', validatePaymentRequest, paymentController.generatePaymentLink);

module.exports = router;
