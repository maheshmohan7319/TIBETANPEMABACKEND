const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
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
    stockInQuantity: {
        type: Number,
        required: true,
        default: 0,
    },
    stockOutQuantity: {
        type: Number,
        required: true,
        default: 0,
    },
    stockFrom: {
        type: String,
        required: true,
        default: 0,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Stock = mongoose.model('Stock', StockSchema);

module.exports = Stock;
