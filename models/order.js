const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    expectedDeliveryDate: {
        type: Date,
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    paymentStatus: {
        type: String,
        required: true,
    },
    grossTotal: {
        type: Number,
        required: true,
    },
    totalTaxAmount: {
        type: Number,
        required: true,
    },
    netAmount: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
