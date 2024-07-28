const Purchase = require('../models/purchase');
const Stock = require('../models/stock');


exports.addPurchase = async (req, res) => {
    const { items, totalAmount } = req.body;

    try {
        const newPurchase = new Purchase({ items, totalAmount });
        await newPurchase.save();

        for (const item of items) {
            const { productId, size, color, quantity } = item;

            let stockEntry = await Stock.findOne({ productId, size, color });

            if (!stockEntry) {
                stockEntry = new Stock({ productId, size, color, stockInQuantity: 0, stockOutQuantity: 0 ,stockFrom: 'Purchase'});
            }

            stockEntry.stockInQuantity += quantity;
            await stockEntry.save();
        }

        res.json({ status: true, message: 'Purchase added successfully', purchase: newPurchase });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find().populate('items.productId');
        res.json(purchases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id).populate('items.productId');
        if (!purchase) return res.status(404).json({ status: false, message: 'Purchase not found' });
        res.json(purchase);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.updatePurchase = async (req, res) => {
    const { items, totalAmount } = req.body;

    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ status: false, message: 'Purchase not found' });

        for (const item of purchase.items) {
            const { productId, size, color, quantity } = item;
            const stockEntry = await Stock.findOne({ productId, size, color });

            if (stockEntry) {
                stockEntry.stockInQuantity -= quantity;
                await stockEntry.save();
            }
        }

        purchase.items = items;
        purchase.totalAmount = totalAmount;
        await purchase.save();

        for (const item of items) {
            const { productId, size, color, quantity } = item;
            let stockEntry = await Stock.findOne({ productId, size, color });

            if (!stockEntry) {
                stockEntry = new Stock({ productId, size, color, stockInQuantity: 0, stockOutQuantity: 0 });
            }

            stockEntry.stockInQuantity += quantity;
            await stockEntry.save();
        }

        res.json({ status: true, message: 'Purchase updated successfully', purchase });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ status: false, message: 'Purchase not found' });

        for (const item of purchase.items) {
            const { productId, size, color, quantity } = item;
            const stockEntry = await Stock.findOne({ productId, size, color });

            if (stockEntry) {
                stockEntry.stockInQuantity -= quantity;
                await stockEntry.save();
            }
        }

        await purchase.remove();
        res.json({ status: true, message: 'Purchase deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
