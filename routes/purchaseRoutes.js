const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/auth');


router.post('/', verifyToken, purchaseController.addPurchase);

router.get('/', verifyToken, purchaseController.getPurchases);

router.get('/:id', verifyToken, purchaseController.getPurchaseById);

router.put('/:id', verifyToken, purchaseController.updatePurchase);

router.delete('/:id', verifyToken, purchaseController.deletePurchase);

module.exports = router;
