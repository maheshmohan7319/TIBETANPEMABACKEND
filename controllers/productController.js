const Product = require('../models/product');
const User = require('../models/user');
const Stock = require('../models//stock');
const Address = require('../models/address');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products',
        format: async (req, file) => 'jpg', 
        public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
    },
});

const upload = multer({ storage }).array('images', 5);

exports.getProducts = async (req, res) => {
    try {
        let productsQuery = Product.find();
        
        if (req.query.category) {
            productsQuery = productsQuery.populate({
                path: 'category',
                match: { name: req.query.category },
            });
        } else {
            productsQuery = productsQuery.populate('category');
        }

        if (!req.user) {
            productsQuery = productsQuery.where({ isActive: true });
        }

        if (req.query.sort === 'lowToHigh') {
            productsQuery = productsQuery.sort({ offerPrice: 1 });
        } else if (req.query.sort === 'highToLow') {
            productsQuery = productsQuery.sort({ offerPrice: -1 }); 
        } else if (req.query.sort === 'nameAsc') {
            productsQuery = productsQuery.sort({ name: 1 }); 
        } else if (req.query.sort === 'nameDesc') {
            productsQuery = productsQuery.sort({ name: -1 });
        }

          
          if (req.query.minPrice && req.query.maxPrice) {
            productsQuery = productsQuery.where('offerPrice').gte(req.query.minPrice).lte(req.query.maxPrice);
        } else if (req.query.minPrice) {
            productsQuery = productsQuery.where('offerPrice').gte(req.query.minPrice);
        } else if (req.query.maxPrice) {
            productsQuery = productsQuery.where('offerPrice').lte(req.query.maxPrice);
        }

     
        if (req.query.productName) {
            const regexQuery = new RegExp(`^${req.query.productName}`, 'i'); 
            productsQuery = productsQuery.where('name').regex(regexQuery);
        }

        const products = await productsQuery.exec();

        const productsWithStock = await Promise.all(products.map(async (product) => {
            const stock = await Stock.find({ productId: product._id });

            const hasStock = stock.some(item =>
                item.stockInQuantity - item.stockOutQuantity > 0
            );

            return {
                ...product._doc,
                isStock: hasStock, 
            };
        }));

        if (req.user) {
            const user = await User.findById(req.user.user.id);

            const productsWithStatus = productsWithStock.map(product => ({
                ...product,
                wishlist: user.wishlist.includes(product._id),
                favorite: user.favorites.includes(product._id),
            }));

            res.json(productsWithStatus);
        } else {
            const productsWithStatus = productsWithStock.map(product => ({
                ...product,
                wishlist: false,
                favorite: false,
            }));

            res.json(productsWithStatus);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const { size, color } = req.query;
        let productQuery = Product.findById(productId).populate('category');

        if (!req.user) {
            productQuery = productQuery.where({ isActive: true });
        }

        const product = await productQuery.exec();

        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        const stock = await Stock.find({ productId: product._id});

        const stockDetails = stock.map((item) => ({
            size: item.size,
            color: item.color,
            availableStock: item.stockInQuantity - item.stockOutQuantity,
        }));

        const productWithStock = {
            ...product._doc,
            stock: stockDetails,
        };

        if (req.user) {
            const user = await User.findById(req.user.user.id);
        
            productWithStock.wishlist = user.wishlist.includes(product._id);
            productWithStock.favorite = user.favorites.includes(product._id);

            const address = await Address.findOne({ userId: req.user.user.id });
            productWithStock.isAddress = !!address;

            res.json(productWithStock);
        } else {
            productWithStock.wishlist = false;
            productWithStock.favorite = false;
            res.json(productWithStock);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


exports.createProduct = [
    upload,
    async (req, res) => {
        const { name, description, category, isNewArrivals, isTaxInclusive, taxPercentage, sizes, colors } = req.body;
        let { salePrice, offerPrice, purchasePrice } = req.body;
        const images = req.files ? req.files.map(file => file.path) : [];
        const createdBy = req.user.user.id; 

        try {
            salePrice = parseFloat(salePrice).toFixed(2);
            offerPrice = parseFloat(offerPrice).toFixed(2);
            purchasePrice = parseFloat(purchasePrice).toFixed(2);

            const newProduct = new Product({ 
                name, 
                description, 
                salePrice,
                offerPrice, 
                purchasePrice, 
                category, 
                isNewArrivals, 
                isTaxInclusive, 
                taxPercentage, 
                sizes, 
                colors, 
                createdBy,
                images 
            });
            
            await newProduct.save();
            res.json(newProduct);
        } catch (err) {
            if (err.code === 11000) { 
                return res.status(400).json({status : false, message: 'Product name already exists' });
            }
            console.error(err);
            res.status(500).json({ status : false, message: 'Internal server error' });
        }
    },
];

exports.updateProduct = [
    upload,
    async (req, res) => {
        const { name, description, salePrice, offerPrice, purchasePrice, category, isNewArrivals, isTaxInclusive, taxPercentage, sizes, colors, isActive } = req.body;
        const images = req.files ? req.files.map(file => file.path) : null;
        const updatedBy = req.user.user.id; 

        try {
            let product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({status : false, message: 'Product not found' });

            if (name !== product.name) {
                const existingProduct = await Product.findOne({ name });
                if (existingProduct && existingProduct._id.toString() !== req.params.id) {
                    return res.status(400).json({ status: false, message: 'Product name already exists' });
                }
            }


            product.name = name || product.name;
            product.description = description || product.description;
            product.salePrice = salePrice || product.salePrice;
            product.offerPrice = offerPrice || product.offerPrice;
            product.purchasePrice = purchasePrice || product.purchasePrice;
            product.category = category || product.category;
            product.isNewArrivals = isNewArrivals || product.isNewArrivals;
            product.isTaxInclusive = isTaxInclusive || product.isTaxInclusive;
            product.taxPercentage = taxPercentage || product.taxPercentage;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.updatedBy = updatedBy || product.updatedBy;
            product.isActive = isActive || product.isActive;
            if (images) product.images = images;
            product.modifiedOn = Date.now();
            await product.save();
            res.json(product);
        } catch (err) {
            console.log(err);
            res.status(500).json({ status : false, message: 'Internal server error' });
        }
    },
];

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({status : false, message: 'Product not found' });

        await product.deleteOne();
        res.status(200).json({ status: true, message: 'Product removed' });
    } catch (err) {
    
        res.status(500).json({ status : false, message: 'Internal server error' });
    }
};






