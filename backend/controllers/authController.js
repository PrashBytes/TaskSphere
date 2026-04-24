const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  compareUserPassword,
  createUser,
  findOrganizationById,
  findUserByEmail
} = require('../utils/demoStore');
const generateToken = require('../utils/generateToken');

const buildAuthPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organizationId: user.organizationId
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, organizationId } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const organization = await findOrganizationById(organizationId);
  if (!organization) {
    throw new AppError('Organization not found', 404);
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError('Email is already in use', 409);
  }

  const user = await createUser({
    name,
    email: normalizedEmail,
    password,
    role,
    organizationId
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Signup successful',
    data: {
      token,
      user: buildAuthPayload(user)
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await compareUserPassword(user._id, password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: buildAuthPayload(user)
    }
  });
});

module.exports = {
  signup,
  login
};
