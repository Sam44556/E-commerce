const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// Create new order
const createOrder = async (req, res, next) => {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.userData.userId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);

            if (!product) {
                throw new HttpError(`Product ${item.productId} not found.`, 404);
            }

            if (product.stock < item.quantity) {
                throw new HttpError(`Insufficient stock for ${product.name}.`, 400);
            }

            // Reduce stock
            product.stock -= item.quantity;
            product.status = product.stock > 0 ? 'active' : 'out_of_stock';
            await product.save({ session });

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                image: product.images[0] || ''
            });

            totalAmount += product.price * item.quantity;
        }

        // Create order
        const newOrder = new Order({
            orderNumber: generateOrderNumber(),
            customer: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            notes
        });

        await newOrder.save({ session });

        // Update user's orders
        const user = await User.findById(userId).session(session);
        user.orders.push(newOrder._id);
        user.cart = []; // Clear cart
        await user.save({ session });

        await session.commitTransaction();

        res.status(201).json({
            message: 'Order created successfully!',
            order: newOrder
        });
    } catch (err) {
        await session.abortTransaction();
        const error = new HttpError(err.message || 'Creating order failed.', err.code || 500);
        return next(error);
    } finally {
        session.endSession();
    }
};

// Get user's orders
const getUserOrders = async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const orders = await Order.find({ customer: userId })
            .sort('-createdAt')
            .populate('items.product', 'name images');

        res.json({ orders });
    } catch (err) {
        const error = new HttpError('Fetching orders failed.', 500);
        return next(error);
    }
};

// Get single order
const getOrderById = async (req, res, next) => {
    const orderId = req.params.id;
    const userId = req.userData.userId;

    try {
        const order = await Order.findById(orderId)
            .populate('items.product', 'name images')
            .populate('customer', 'name email');

        if (!order) {
            return next(new HttpError('Order not found.', 404));
        }

        // Check if user owns this order (unless admin)
        if (order.customer._id.toString() !== userId && req.userData.role !== 'admin') {
            return next(new HttpError('Not authorized to view this order.', 403));
        }

        res.json({ order });
    } catch (err) {
        const error = new HttpError('Fetching order failed.', 500);
        return next(error);
    }
};

// Cancel order
const cancelOrder = async (req, res, next) => {
    const orderId = req.params.id;
    const userId = req.userData.userId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new HttpError('Order not found.', 404);
        }

        // Check if user owns this order
        if (order.customer.toString() !== userId) {
            throw new HttpError('Not authorized to cancel this order.', 403);
        }

        // Can only cancel pending or processing orders
        if (!['pending', 'processing'].includes(order.status)) {
            throw new HttpError('Cannot cancel this order.', 400);
        }

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product).session(session);
            if (product) {
                product.stock += item.quantity;
                product.status = 'active';
                await product.save({ session });
            }
        }

        order.status = 'cancelled';
        await order.save({ session });

        await session.commitTransaction();

        res.json({
            message: 'Order cancelled successfully!',
            order
        });
    } catch (err) {
        await session.abortTransaction();
        const error = new HttpError(err.message || 'Cancelling order failed.', err.code || 500);
        return next(error);
    } finally {
        session.endSession();
    }
};

exports.createOrder = createOrder;
exports.getUserOrders = getUserOrders;
exports.getOrderById = getOrderById;
exports.cancelOrder = cancelOrder;
