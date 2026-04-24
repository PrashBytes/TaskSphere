const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateEnum = (value, allowedValues, fieldName, errors) => {
  if (value !== undefined && !allowedValues.includes(value)) {
    errors.push(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
};

const organizationValidator = (req) => {
  const errors = [];

  if (!req.body.name || req.body.name.trim().length < 2) {
    errors.push('Organization name must be at least 2 characters long');
  }

  return errors;
};

const signupValidator = (req) => {
  const errors = [];
  const { name, email, password, role, organizationId } = req.body;

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  validateEnum(role, ['admin', 'member'], 'Role', errors);

  if (!organizationId) {
    errors.push('organizationId is required');
  }

  return errors;
};

const loginValidator = (req) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};

const taskCreateValidator = (req) => {
  const errors = [];
  const { title, status, priority } = req.body;

  if (!title || title.trim().length < 2) {
    errors.push('Task title must be at least 2 characters long');
  }

  validateEnum(status, ['todo', 'in-progress', 'done'], 'Status', errors);
  validateEnum(priority, ['low', 'medium', 'high'], 'Priority', errors);

  return errors;
};

const taskUpdateValidator = (req) => {
  const errors = [];
  const { title, status, priority } = req.body;

  if (title !== undefined && title.trim().length < 2) {
    errors.push('Task title must be at least 2 characters long');
  }

  validateEnum(status, ['todo', 'in-progress', 'done'], 'Status', errors);
  validateEnum(priority, ['low', 'medium', 'high'], 'Priority', errors);

  return errors;
};

module.exports = {
  organizationValidator,
  signupValidator,
  loginValidator,
  taskCreateValidator,
  taskUpdateValidator
};
