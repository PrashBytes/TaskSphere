const jwt = require('jsonwebtoken');

const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { findUserById } = require('../utils/demoStore');

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await findUserById(decoded.userId);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;
  next();
});

module.exports = {
  protect
};
