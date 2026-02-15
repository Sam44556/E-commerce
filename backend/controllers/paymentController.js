const stripe = require('../utils/stripe');
const Order = require('../models/Order');
const User = require('../models/user');
const HttpError = require('../models/http-error');

// Create Checkout Session
exports.createCheckoutSession = async (req, res, next) => {
    try {
        const { shippingAddress } = req.body;
        const userId = req.userData.userId;

        // Get user's cart with populated products
        const user = await User.findById(userId).populate('cart.product');
        
        if (!user || !user.cart || user.cart.length === 0) {
            return next(new HttpError('Cart is empty', 400));
        }

        // Calculate total and create line items
        let totalAmount = 0;
        const lineItems = user.cart.map(item => {
            if (!item.product) {
                throw new Error('Product not found in cart');
            }
            
            const amount = item.product.price * item.quantity;
            totalAmount += amount;
            
            // Build product data
            const productData = {
                name: item.product.name,
                description: item.product.description || ''
            };
            
            // Only add images if they exist and are valid URLs
            if (item.product.images && item.product.images.length > 0 && item.product.images[0]) {
                productData.images = [item.product.images[0]];
            }
            
            return {
                price_data: {
                    currency: 'usd',
                    product_data: productData,
                    unit_amount: Math.round(item.product.price * 100) // Convert to cents
                },
                quantity: item.quantity
            };
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            customer_email: user.email,
            metadata: {
                userId: userId.toString(),
                shippingAddress: JSON.stringify(shippingAddress)
            }
        });

        res.json({ 
            sessionId: session.id,
            url: session.url 
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return next(new HttpError('Payment session creation failed', 500));
    }
};

// Webhook - Handle successful payment
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Payment successful for session:', session.id);
        
        // Create order
        await createOrderFromSession(session);
    }

    res.json({ received: true });
};

// Create order after successful payment
async function createOrderFromSession(session) {
    try {
        console.log('Starting order creation for session:', session.id);
        console.log('Session metadata:', session.metadata);

        const userId = session.metadata.userId;
        const shippingAddress = JSON.parse(session.metadata.shippingAddress);

        console.log('User ID:', userId);
        console.log('Shipping address:', shippingAddress);

        // Get user with cart
        const user = await User.findById(userId).populate('cart.product');
        console.log('User found:', !!user);
        console.log('User cart:', user?.cart);

        if (!user || !user.cart || user.cart.length === 0) {
            console.error('User or cart not found - User:', !!user, 'Cart length:', user?.cart?.length);
            return;
        }

        // Create order items with required fields
        const orderItems = user.cart.map(item => ({
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.images ? item.product.images[0] : ''
        }));

        console.log('Order items:', orderItems);

        // Generate unique order number
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

        // Create order
        const order = new Order({
            orderNumber: orderNumber,
            customer: userId, // Use 'customer' instead of 'user'
            items: orderItems,
            totalAmount: session.amount_total / 100, // Convert from cents
            shippingAddress: shippingAddress,
            paymentMethod: 'credit_card', // Use valid enum value
            paymentStatus: 'paid',
            status: 'pending' // Admin needs to process
        });

        console.log('Saving order...');
        await order.save();
        console.log('Order saved with ID:', order._id);

        // Add order to user's orders
        user.orders.push(order._id);

        // Clear user's cart
        user.cart = [];
        console.log('Clearing user cart and saving...');
        await user.save();
        console.log('User saved successfully');

        console.log('Order created successfully:', order._id);
    } catch (error) {
        console.error('Error creating order from session:', error);
        console.error('Error stack:', error.stack);
    }
}

// Get payment status
exports.getPaymentStatus = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            status: session.payment_status,
            customerEmail: session.customer_email,
            amountTotal: session.amount_total / 100
        });
    } catch (error) {
        console.error('Payment status error:', error);
        return next(new HttpError('Failed to retrieve payment status', 500));
    }
};

module.exports = {
    createCheckoutSession: exports.createCheckoutSession,
    handleWebhook: exports.handleWebhook,
    getPaymentStatus: exports.getPaymentStatus
};
