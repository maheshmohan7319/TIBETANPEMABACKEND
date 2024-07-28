const Stock = require('../models/stock');


exports.getAllStock = async (req, res) => {
    try {
        const stock = await Stock.find().populate('productId');
        res.json(stock);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.getStockByProductSizeColor = async (req, res) => {
    const { productId, size, color } = req.params;

    try {
        const stockEntry = await Stock.findOne({ productId, size, color });
        if (!stockEntry) return res.status(404).json({ status: false, message: 'Stock entry not found' });
        res.json(stockEntry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.updateStock = async (req, res) => {
    const { stockInQuantity, stockOutQuantity } = req.body;

    try {
        const stockEntry = await Stock.findById(req.params.id);
        if (!stockEntry) return res.status(404).json({ status: false, message: 'Stock entry not found' });

        if (stockInQuantity !== undefined) stockEntry.stockInQuantity = stockInQuantity;
        if (stockOutQuantity !== undefined) stockEntry.stockOutQuantity = stockOutQuantity;

        await stockEntry.save();
        res.json({ status: true, message: 'Stock updated successfully', stockEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.deleteStockEntry = async (req, res) => {
    try {
        const stockEntry = await Stock.findById(req.params.id);
        if (!stockEntry) return res.status(404).json({ status: false, message: 'Stock entry not found' });

        await stockEntry.remove();
        res.json({ status: true, message: 'Stock entry deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
