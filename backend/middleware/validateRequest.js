const AppError = require('../utils/AppError');

const validateRequest = (validator) => (req, _res, next) => {
  const errors = validator(req);

  if (errors.length > 0) {
    return next(new AppError(errors.join(', '), 400));
  }

  next();
};

module.exports = validateRequest;
