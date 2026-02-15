const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/categories', productController.getCategories);
router.get('/products/:id', productController.getProductById);

module.exports = router;
