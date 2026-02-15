const express = require('express');
const { body } = require('express-validator');
const adminProductController = require('../controllers/adminProductController');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Image Upload
router.post('/upload-image', upload.single('image'), adminProductController.uploadProductImage);

// Product Management
router.get('/products', adminProductController.getAllProductsAdmin);
router.get('/products/stats', adminProductController.getInventoryStats);

// Create product with images (up to 5 images)
router.post('/products',
    upload.array('images', 5), // Accept up to 5 images
    [
        body('name').trim().notEmpty().withMessage('Product name is required'),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('category').notEmpty().withMessage('Category is required'),
        body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        body('sku').trim().notEmpty().withMessage('SKU is required')
    ],
    handleValidationErrors,
    adminProductController.createProduct
);

// Update product with optional new images
router.put('/products/:id',
    upload.array('images', 5), // Accept up to 5 new images
    adminProductController.updateProduct
);

router.delete('/products/:id', adminProductController.deleteProduct);

router.patch('/products/stock',
    [
        body('productId').notEmpty().withMessage('Product ID is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('operation').isIn(['add', 'subtract']).withMessage('Operation must be add or subtract')
    ],
    handleValidationErrors,
    adminProductController.updateStock
);

// Order Management
router.get('/orders', adminController.getAllOrders);
router.get('/orders/stats', adminController.getOrderStats);

router.patch('/orders/:id/status',
    [
        body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            .withMessage('Invalid order status')
    ],
    handleValidationErrors,
    adminController.updateOrderStatus
);

// Customer Management
router.get('/customers', adminController.getAllCustomers);
router.get('/customers/:id', adminController.getCustomerById);

module.exports = router;
