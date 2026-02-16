const User = require('../models/user');
const Product = require('../models/Product');
const HttpError = require('../models/http-error');

// Get user's cart
const getCart = async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId).populate('cart.product');

        if (!user) {
            return next(new HttpError('User not found.', 404));
        }

        // Calculate total
        const total = user.cart.reduce((sum, item) => {
            const price = item.product && item.product.price ? item.product.price : 0;
            return sum + price * item.quantity;
        }, 0);

        res.json({ cart: user.cart, total });
    } catch (err) {
        const error = new HttpError('Fetching cart failed.', 500);
        return next(error);
    }
};

// Add item to cart
const addToCart = async (req, res, next) => {
    const userId = req.userData.userId;
    const { productId, quantity = 1 } = req.body;

    try {
        const user = await User.findById(userId);
        const product = await Product.findById(productId);

        if (!product) {
            return next(new HttpError('Product not found.', 404));
        }

        if (product.stock < quantity) {
            return next(new HttpError('Insufficient stock.', 400));
        }

        // Check if product already in cart
        const existingItemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex >= 0) {
            // Update quantity
            user.cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            user.cart.push({ product: productId, quantity });
        }

        await user.save();
        await user.populate('cart.product');

        res.json({
            message: 'Item added to cart!',
            cart: user.cart
        });
    } catch (err) {
        const error = new HttpError('Adding to cart failed.', 500);
        return next(error);
    }
};

// Update cart item quantity
const updateCartItem = async (req, res, next) => {
    const userId = req.userData.userId;
    const { productId, quantity } = req.body;

    try {
        const user = await User.findById(userId);
        const product = await Product.findById(productId);

        if (!product) {
            return next(new HttpError('Product not found.', 404));
        }

        if (product.stock < quantity) {
            return next(new HttpError('Insufficient stock.', 400));
        }

        const cartItem = user.cart.find(item => item.product.toString() === productId);

        if (!cartItem) {
            return next(new HttpError('Item not in cart.', 404));
        }

        cartItem.quantity = quantity;
        await user.save();
        await user.populate('cart.product');

        res.json({
            message: 'Cart updated!',
            cart: user.cart
        });
    } catch (err) {
        const error = new HttpError('Updating cart failed.', 500);
        return next(error);
    }
};

// Remove item from cart
const removeFromCart = async (req, res, next) => {
    const userId = req.userData.userId;
    const { productId } = req.params;

    try {
        const user = await User.findById(userId);

        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        await user.save();
        await user.populate('cart.product');

        res.json({
            message: 'Item removed from cart!',
            cart: user.cart
        });
    } catch (err) {
        const error = new HttpError('Removing from cart failed.', 500);
        return next(error);
    }
};

// Clear cart
const clearCart = async (req, res, next) => {
    const userId = req.userData.userId;

    try {
        const user = await User.findById(userId);
        user.cart = [];
        await user.save();

        res.json({ message: 'Cart cleared!' });
    } catch (err) {
        const error = new HttpError('Clearing cart failed.', 500);
        return next(error);
    }
};

exports.getCart = getCart;
exports.addToCart = addToCart;
exports.updateCartItem = updateCartItem;
exports.removeFromCart = removeFromCart;
exports.clearCart = clearCart;
