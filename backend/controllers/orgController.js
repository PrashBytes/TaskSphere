const asyncHandler = require('../utils/asyncHandler');
const { createOrganization: createDemoOrganization } = require('../utils/demoStore');

const createOrganization = asyncHandler(async (req, res) => {
  const organization = await createDemoOrganization({
    name: req.body.name
  });

  res.status(201).json({
    success: true,
    message: 'Organization created successfully',
    data: organization
  });
});

module.exports = {
  createOrganization
};
