
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, checkAdmin, verifyOptionalToken } = require('../middleware/auth');

router.get('/',verifyOptionalToken, categoryController.getCategories);

router.get('/:id',verifyOptionalToken, categoryController.getCategoryById);

router.post('/',verifyToken, checkAdmin, categoryController.createCategory);

router.put('/:id',verifyToken, checkAdmin, categoryController.updateCategory);

router.delete('/:id',verifyToken, checkAdmin, categoryController.deleteCategory);

module.exports = router;
