const express = require('express');

const { createOrganization } = require('../controllers/orgController');
const validateRequest = require('../middleware/validateRequest');
const { organizationValidator } = require('../utils/validators');

const router = express.Router();

router.post('/', validateRequest(organizationValidator), createOrganization);

module.exports = router;
