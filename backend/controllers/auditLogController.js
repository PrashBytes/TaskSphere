const asyncHandler = require('../utils/asyncHandler');
const { getAuditLogs } = require('../utils/demoStore');

const getLogs = asyncHandler(async (req, res) => {
  const logs = await getAuditLogs(req.user.organizationId);

  res.status(200).json({
    success: true,
    data: logs
  });
});

module.exports = {
  getLogs
};
