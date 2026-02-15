const Product = require('../models/Product');
const HttpError = require('../models/http-error');

// Get all products (with filtering, pagination, search)
const getProducts = async (req, res, next) => {
    const {
        category,
        search,
        minPrice,
        maxPrice,
        featured,
        page = 1,
        limit = 12,
        sort = '-createdAt'
    } = req.query;

    try {
        let query = { status: 'active' };

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Search by name or description
        if (search) {
            query.$text = { $search: search };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Featured filter
        if (featured === 'true') {
            query.featured = true;
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit))
            .skip(skip)
            .select('-__v');

        const total = await Product.countDocuments(query);

        res.json({
            products,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });
    } catch (err) {
        const error = new HttpError('Fetching products failed, please try again.', 500);
        return next(error);
    }
};

// Get single product by ID
const getProductById = async (req, res, next) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId).select('-__v');

        if (!product) {
            return next(new HttpError('Product not found.', 404));
        }

        res.json({ product });
    } catch (err) {
        const error = new HttpError('Fetching product failed, please try again.', 500);
        return next(error);
    }
};

// Get featured products
const getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ featured: true, status: 'active' })
            .limit(8)
            .select('-__v');

        res.json({ products });
    } catch (err) {
        const error = new HttpError('Fetching featured products failed.', 500);
        return next(error);
    }
};

// Get product categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category');
        res.json({ categories });
    } catch (err) {
        const error = new HttpError('Fetching categories failed.', 500);
        return next(error);
    }
};

exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.getFeaturedProducts = getFeaturedProducts;
exports.getCategories = getCategories;
