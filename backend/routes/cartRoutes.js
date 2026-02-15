const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/cart', cartController.getCart);

router.post('/cart',
    [
        body('productId').notEmpty().withMessage('Product ID is required'),
        body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    handleValidationErrors,
    cartController.addToCart
);

router.put('/cart',
    [
        body('productId').notEmpty().withMessage('Product ID is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    handleValidationErrors,
    cartController.updateCartItem
);

router.delete('/cart/:productId', cartController.removeFromCart);
router.delete('/cart', cartController.clearCart);

module.exports = router;
