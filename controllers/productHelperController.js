const Product = require('../models/product');
const User = require('../models/user');
const Stock = require('../models/stock');
const Address = require('../models/address');

exports.addremoveToWishlist = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { productId } = req.body;

        const user = await User.findById(userId);

        const index = user.wishlist.indexOf(productId);
        if (index === -1) {
            user.wishlist.push(productId);
        } else {
            user.wishlist.splice(index, 1);
        }

        await user.save();

        res.status(200).json({ status: true, message: 'Wishlist updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.getWishlistProducts = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        const userId = req.user.user.id;

        const user = await User.findById(userId);
        const wishlistProductIds = user.wishlist.map(item => item.toString()); 

        const products = await Product.find({ _id: { $in: wishlistProductIds } })
            .populate('category')
            .exec();

        const productsWithStock = await Promise.all(products.map(async (product) => {
            const stock = await Stock.find({ productId: product._id });

            const stockDetails = stock.map((item) => ({
                size: item.size,
                color: item.color,
                availableStock: item.stockInQuantity - item.stockOutQuantity,
            }));

            return {
                ...product._doc,
                stock: stockDetails,
                wishlist: true,  
                favorite: user.favorites.includes(product._id.toString()),
            };
        }));

        res.json(productsWithStock);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.addremoveToFavorites = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { productId } = req.body;

        const user = await User.findById(userId);

        const index = user.favorites.indexOf(productId);
        if (index === -1) {
            user.favorites.push(productId);
        } else {
            user.favorites.splice(index, 1);
        }

        await user.save();

        res.status(200).json({ status: true, message: 'Favorites updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.getFavoritesProducts = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        const userId = req.user.user.id;

        const user = await User.findById(userId);
        const favoritesProductIds = user.favorites.map(item => item.toString()); 

        const products = await Product.find({ _id: { $in: favoritesProductIds } })
            .populate('category')
            .exec();

        const productsWithStock = await Promise.all(products.map(async (product) => {
            const stock = await Stock.find({ productId: product._id });

            const stockDetails = stock.map((item) => ({
                size: item.size,
                color: item.color,
                availableStock: item.stockInQuantity - item.stockOutQuantity,
            }));

            return {
                ...product._doc,
                stock: stockDetails,
                wishlist: true,  
                favorite: user.favorites.includes(product._id.toString()),
            };
        }));

        res.json(productsWithStock);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.getProductDetails = async (req, res) => {
    const productId = req.params.id;
    const qty = req.params.qty;

    try {
       
        const product = await Product.findById(productId).populate('category');
        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

   
        const quantity = qty;

       
        const itemTotal = product.offerPrice * quantity;
        const sgst = itemTotal * (product.taxPercentage / 2) / 100;
        const cgst = itemTotal * (product.taxPercentage / 2) / 100;
        
        const netAmount = itemTotal;
        const totalSGST = sgst;
        const totalCGST = cgst;
        const totalTaxAmount = sgst + cgst;
        const grossTotal = netAmount - totalTaxAmount;

        const roundedGrossTotal = grossTotal.toFixed(2);
        const roundedTotalTaxAmount = totalTaxAmount.toFixed(2);
        const roundedNetAmount = netAmount.toFixed(2);
        const roundedTotalSGST = totalSGST.toFixed(2);
        const roundedTotalCGST = totalCGST.toFixed(2);

        let defaultAddress = null;
        if (req.user) {
            const userId = req.user.user.id;
            defaultAddress = await Address.findOne({ userId, isDefault: true });
        }

        const response = {
            status: true,
            message: 'Product details retrieved successfully',
            product: {
                productId: product._id,
                productName: product.name,
                category: product.category,
                quantity: quantity,
                offerPrice: product.offerPrice,
                taxPercentage: product.taxPercentage,
                itemTotal: itemTotal.toFixed(2),
                sgst: sgst.toFixed(2),
                cgst: cgst.toFixed(2),
            },
            grossTotal: roundedGrossTotal,
            totalTaxAmount: roundedTotalTaxAmount,
            netAmount: roundedNetAmount,
            totalSGST: roundedTotalSGST,
            totalCGST: roundedTotalCGST,
            defaultAddress: defaultAddress ? defaultAddress : 'No default address found'
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
