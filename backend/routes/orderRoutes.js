const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

router.get('/orders', orderController.getUserOrders);
router.get('/orders/:id', orderController.getOrderById);

router.post('/orders',
    [
        body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
        body('items.*.productId').notEmpty().withMessage('Product ID is required'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('shippingAddress.street').notEmpty().withMessage('Street is required'),
        body('shippingAddress.city').notEmpty().withMessage('City is required'),
        body('shippingAddress.state').notEmpty().withMessage('State is required'),
        body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
        body('shippingAddress.country').notEmpty().withMessage('Country is required'),
        body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
            .withMessage('Invalid payment method')
    ],
    handleValidationErrors,
    orderController.createOrder
);

router.patch('/orders/:id/cancel', orderController.cancelOrder);

module.exports = router;
