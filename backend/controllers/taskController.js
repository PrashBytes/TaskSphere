const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  createTask: createDemoTask,
  deleteTask: deleteDemoTask,
  findTaskById,
  getTasks: getDemoTasks,
  logTaskAction,
  updateTask: updateDemoTask
} = require('../utils/demoStore');

const isTaskOwner = (task, userId) => task.createdBy.toString() === userId.toString();

const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const search = req.query.search?.trim();

  const { tasks, total } = await getDemoTasks({
    organizationId: req.user.organizationId,
    role: req.user.role,
    userId: req.user._id,
    search,
    status: req.query.status,
    priority: req.query.priority,
    page,
    limit
  });

  res.status(200).json({
    success: true,
    data: {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await createDemoTask({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    createdBy: req.user._id,
    organizationId: req.user.organizationId
  });

  await logTaskAction({
    action: 'task_created',
    taskId: task._id,
    userId: req.user._id,
    organizationId: req.user.organizationId
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await findTaskById(req.params.id, req.user.organizationId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (req.user.role === 'member' && !isTaskOwner(task, req.user._id)) {
    throw new AppError('You can only update your own tasks', 403);
  }

  const allowedFields = ['title', 'description', 'status', 'priority'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  const updatedTask = await updateDemoTask(req.params.id, req.user.organizationId, {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority
  });

  await logTaskAction({
    action: 'task_updated',
    taskId: task._id,
    userId: req.user._id,
    organizationId: req.user.organizationId
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await findTaskById(req.params.id, req.user.organizationId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (req.user.role === 'member' && !isTaskOwner(task, req.user._id)) {
    throw new AppError('You can only delete your own tasks', 403);
  }

  await deleteDemoTask(req.params.id, req.user.organizationId);

  await logTaskAction({
    action: 'task_deleted',
    taskId: task._id,
    userId: req.user._id,
    organizationId: req.user.organizationId
  });

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
