const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Create checkout session (requires auth)
router.post('/create-checkout-session', authMiddleware, paymentController.createCheckoutSession);

// Webhook (NO auth - Stripe calls this directly)
// Note: This route needs raw body, handled in app.js
router.post('/webhook', paymentController.handleWebhook);

// Get payment status
router.get('/status/:sessionId', authMiddleware, paymentController.getPaymentStatus);

module.exports = router;
