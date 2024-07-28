const express = require('express');
const commonController = require('../controllers/productHelperController');
const { verifyToken, checkAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/wishlist',verifyToken, commonController.getWishlistProducts);
router.post('/wishlist',verifyToken, commonController.addremoveToWishlist);

router.get('/favorites',verifyToken, commonController.getFavoritesProducts);
router.post('/favorites',verifyToken, commonController.addremoveToFavorites);

router.get('/products/checkout/:id/:qty', verifyToken, commonController.getProductDetails);



module.exports = router;
