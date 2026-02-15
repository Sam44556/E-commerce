const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

// Verify JWT token
const authMiddleware = (req, res, next) => {
  // Skip auth for login/register routes
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new Error('Authentication failed!');
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (req.userData && req.userData.role === 'admin') {
    next();
  } else {
    const error = new HttpError('Access denied. Admin privileges required.', 403);
    return next(error);
  }
};

module.exports = { authMiddleware, adminMiddleware };
