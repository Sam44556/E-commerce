const Product = require('../models/Product');
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Upload product image
const uploadProductImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new HttpError('No image file provided.', 400));
        }

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(req.file.buffer, 'products');

        res.status(200).json({
            message: 'Image uploaded successfully!',
            imageUrl
        });
    } catch (err) {
        console.error('Image upload error:', err);
        const error = new HttpError('Image upload failed, please try again.', 500);
        return next(error);
    }
};

// Create new product with images (Admin only)
const createProduct = async (req, res, next) => {
    const { name, description, price, category, stock, sku, brand, featured } = req.body;

    try {
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return next(new HttpError('Product with this SKU already exists.', 422));
        }

        // Handle multiple image uploads
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            // Upload all images to Cloudinary
            const uploadPromises = req.files.map(file => 
                uploadToCloudinary(file.buffer, 'products')
            );
            imageUrls = await Promise.all(uploadPromises);
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock,
            images: imageUrls,
            sku,
            brand,
            featured: featured || false,
            status: stock > 0 ? 'active' : 'out_of_stock',
            createdBy: req.userData.userId
        });

        await newProduct.save();

        res.status(201).json({
            message: 'Product created successfully!',
            product: newProduct
        });
    } catch (err) {
        console.error('Create product error:', err);
        const error = new HttpError(
            'Creating product failed, please try again.',
            500
        );
        return next(error);
    }
};

// Update product with image handling (Admin only)
const updateProduct = async (req, res, next) => {
    const productId = req.params.id;
    const updates = req.body;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return next(new HttpError('Product not found.', 404));
        }

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            // Upload new images to Cloudinary
            const uploadPromises = req.files.map(file => 
                uploadToCloudinary(file.buffer, 'products')
            );
            const newImageUrls = await Promise.all(uploadPromises);
            
            // Add new images to existing ones
            product.images = [...product.images, ...newImageUrls];
        }

        // Handle image deletion (if deleteImages array is provided)
        if (updates.deleteImages && Array.isArray(updates.deleteImages)) {
            // Delete from Cloudinary
            const deletePromises = updates.deleteImages.map(imageUrl => 
                deleteFromCloudinary(imageUrl)
            );
            await Promise.all(deletePromises);
            
            // Remove from product images array
            product.images = product.images.filter(
                img => !updates.deleteImages.includes(img)
            );
        }

        // Update other fields
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && 
                key !== '_id' && 
                key !== 'createdBy' && 
                key !== 'deleteImages' &&
                key !== 'images') {
                product[key] = updates[key];
            }
        });

        // Update status based on stock
        if (updates.stock !== undefined) {
            product.status = updates.stock > 0 ? 'active' : 'out_of_stock';
        }

        await product.save();

        res.json({
            message: 'Product updated successfully!',
            product
        });
    } catch (err) {
        console.error('Update product error:', err);
        const error = new HttpError('Updating product failed, please try again.', 500);
        return next(error);
    }
};

// Delete product and its images (Admin only)
const deleteProduct = async (req, res, next) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return next(new HttpError('Product not found.', 404));
        }

        // Delete all product images from Cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(imageUrl => 
                deleteFromCloudinary(imageUrl)
            );
            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(productId);

        res.json({ 
            message: 'Product and all images deleted successfully!' 
        });
    } catch (err) {
        console.error('Delete product error:', err);
        const error = new HttpError('Deleting product failed, please try again.', 500);
        return next(error);
    }
};

// Get all products for admin (including inactive)
const getAllProductsAdmin = async (req, res, next) => {
    const { page = 1, limit = 20, status, category, search } = req.query;

    try {
        let query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) query.$text = { $search: search };

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(skip)
            .populate('createdBy', 'name email');

        const total = await Product.countDocuments(query);

        res.json({
            products,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });
    } catch (err) {
        const error = new HttpError('Fetching products failed.', 500);
        return next(error);
    }
};

// Update product stock (Admin only)
const updateStock = async (req, res, next) => {
    const { productId, quantity, operation } = req.body; // operation: 'add' or 'subtract'

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return next(new HttpError('Product not found.', 404));
        }

        if (operation === 'add') {
            product.stock += quantity;
        } else if (operation === 'subtract') {
            if (product.stock < quantity) {
                return next(new HttpError('Insufficient stock.', 400));
            }
            product.stock -= quantity;
        }

        product.status = product.stock > 0 ? 'active' : 'out_of_stock';
        await product.save();

        res.json({
            message: 'Stock updated successfully!',
            product
        });
    } catch (err) {
        const error = new HttpError('Updating stock failed.', 500);
        return next(error);
    }
};

// Get inventory statistics (Admin only)
const getInventoryStats = async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ status: 'active' });
        const outOfStock = await Product.countDocuments({ status: 'out_of_stock' });
        const lowStock = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });

        const categoryStats = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json({
            totalProducts,
            activeProducts,
            outOfStock,
            lowStock,
            categoryStats
        });
    } catch (err) {
        const error = new HttpError('Fetching inventory stats failed.', 500);
        return next(error);
    }
};

exports.uploadProductImage = uploadProductImage;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getAllProductsAdmin = getAllProductsAdmin;
exports.updateStock = updateStock;
exports.getInventoryStats = getInventoryStats;
