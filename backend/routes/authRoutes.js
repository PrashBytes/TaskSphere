const express = require('express');

const { login, signup } = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { loginValidator, signupValidator } = require('../utils/validators');

const router = express.Router();

router.post('/signup', validateRequest(signupValidator), signup);
router.post('/login', validateRequest(loginValidator), login);

module.exports = router;
