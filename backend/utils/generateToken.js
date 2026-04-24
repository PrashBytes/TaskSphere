const jwt = require('jsonwebtoken');

const env = require('../config/env');

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id || user.id,
      organizationId: user.organizationId,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: '7d' }
  );

module.exports = generateToken;
