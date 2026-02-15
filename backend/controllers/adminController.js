const Order = require('../models/Order');
const User = require('../models/user');
const Product = require('../models/Product');
const HttpError = require('../models/http-error');

// Get all orders (Admin only)
const getAllOrders = async (req, res, next) => {
    const { page = 1, limit = 20, status, search } = req.query;

    try {
        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.orderNumber = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(skip)
            .populate('customer', 'name email phone');

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            totalOrders: total
        });
    } catch (err) {
        const error = new HttpError('Fetching orders failed.', 500);
        return next(error);
    }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res, next) => {
    const orderId = req.params.id;
    const { status } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return next(new HttpError('Order not found.', 404));
        }

        order.status = status;
        await order.save();

        res.json({
            message: 'Order status updated successfully!',
            order
        });
    } catch (err) {
        const error = new HttpError('Updating order status failed.', 500);
        return next(error);
    }
};

// Get order statistics (Admin only)
const getOrderStats = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippedOrders = await Order.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { status: { $in: ['delivered', 'shipped', 'processing'] } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Recent orders
        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(5)
            .populate('customer', 'name email');

        res.json({
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue,
            recentOrders
        });
    } catch (err) {
        const error = new HttpError('Fetching order stats failed.', 500);
        return next(error);
    }
};

// Get all customers (Admin only)
const getAllCustomers = async (req, res, next) => {
    const { page = 1, limit = 20, search } = req.query;

    try {
        let query = { role: 'customer' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const customers = await User.find(query)
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(skip)
            .select('-password -googleId')
            .populate('orders');

        const total = await User.countDocuments(query);

        res.json({
            customers,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            totalCustomers: total
        });
    } catch (err) {
        const error = new HttpError('Fetching customers failed.', 500);
        return next(error);
    }
};

// Get customer details (Admin only)
const getCustomerById = async (req, res, next) => {
    const customerId = req.params.id;

    try {
        const customer = await User.findById(customerId)
            .select('-password -googleId')
            .populate({
                path: 'orders',
                options: { sort: '-createdAt' }
            });

        if (!customer) {
            return next(new HttpError('Customer not found.', 404));
        }

        // Get customer statistics
        const totalOrders = customer.orders.length;
        const totalSpent = customer.orders.reduce((sum, order) => {
            if (['delivered', 'shipped', 'processing'].includes(order.status)) {
                return sum + order.totalAmount;
            }
            return sum;
        }, 0);

        res.json({
            customer,
            stats: {
                totalOrders,
                totalSpent
            }
        });
    } catch (err) {
        const error = new HttpError('Fetching customer failed.', 500);
        return next(error);
    }
};

// Get dashboard statistics (Admin only)
const getDashboardStats = async (req, res, next) => {
    try {
        // Product stats
        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });
        const outOfStockProducts = await Product.countDocuments({ status: 'out_of_stock' });

        // Order stats
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // Revenue
        const revenueData = await Order.aggregate([
            { $match: { status: { $in: ['delivered', 'shipped', 'processing'] } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Customer stats
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        // Recent activity
        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(5)
            .populate('customer', 'name email');

        res.json({
            products: {
                total: totalProducts,
                lowStock: lowStockProducts,
                outOfStock: outOfStockProducts
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders
            },
            revenue: totalRevenue,
            customers: totalCustomers,
            recentOrders
        });
    } catch (err) {
        const error = new HttpError('Fetching dashboard stats failed.', 500);
        return next(error);
    }
};

exports.getAllOrders = getAllOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.getOrderStats = getOrderStats;
exports.getAllCustomers = getAllCustomers;
exports.getCustomerById = getCustomerById;
exports.getDashboardStats = getDashboardStats;
