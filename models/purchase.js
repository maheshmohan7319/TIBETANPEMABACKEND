const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    purchaseDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        purchasePricePerUnit: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);

module.exports = Purchase;
