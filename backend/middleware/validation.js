const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return next(new HttpError(errorMessages, 422));
    }
    next();
};

module.exports = handleValidationErrors;
