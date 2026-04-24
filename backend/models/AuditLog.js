const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['task_created', 'task_updated', 'task_deleted']
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

auditLogSchema.index({ organizationId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
