const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (err.name === 'CastError') {
    error = new AppError('Invalid resource identifier', 400);
  }

  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue)[0];
    error = new AppError(`${duplicatedField} must be unique`, 409);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
};

module.exports = {
  notFound,
  errorHandler
};
