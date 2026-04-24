const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const state = {
  organizations: [],
  users: [],
  tasks: [],
  auditLogs: []
};

const createId = () => randomUUID();

const clone = (value) => JSON.parse(JSON.stringify(value));

const withoutPassword = (user) => {
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return clone(safeUser);
};

const createOrganizationRecord = ({ name }) => ({
  _id: createId(),
  name: name.trim(),
  createdAt: new Date(),
  updatedAt: new Date()
});

const createUserRecord = async ({ name, email, password, role, organizationId }) => ({
  _id: createId(),
  name: name.trim(),
  email: email.toLowerCase().trim(),
  passwordHash: await bcrypt.hash(password, 12),
  role,
  organizationId,
  createdAt: new Date(),
  updatedAt: new Date()
});

const createTaskRecord = ({ title, description, status, priority, createdBy, organizationId }) => ({
  _id: createId(),
  title: title.trim(),
  description: description?.trim() || '',
  status: status || 'todo',
  priority: priority || 'medium',
  createdBy,
  organizationId,
  createdAt: new Date(),
  updatedAt: new Date()
});

const seedDemoData = async () => {
  if (state.organizations.length > 0 || state.users.length > 0) {
    return;
  }

  const organization = createOrganizationRecord({ name: 'TaskSphere Demo Org' });
  state.organizations.push(organization);

  const adminUser = await createUserRecord({
    name: 'Demo Admin',
    email: 'admin@tasksphere.demo',
    password: 'Demo@123',
    role: 'admin',
    organizationId: organization._id
  });

  state.users.push(adminUser);

  console.log('Running in demo mode without MongoDB');
  console.log(`[demo] Seeded organization: ${organization.name} (${organization._id})`);
  console.log('[demo] Seeded admin credentials: admin@tasksphere.demo / Demo@123');
};

const createOrganization = async ({ name }) => {
  const organization = createOrganizationRecord({ name });
  state.organizations.push(organization);
  return clone(organization);
};

const findOrganizationById = async (organizationId) =>
  clone(state.organizations.find((organization) => organization._id === organizationId) || null);

const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  return clone(state.users.find((user) => user.email === normalizedEmail) || null);
};

const findUserById = async (userId) =>
  withoutPassword(state.users.find((user) => user._id === userId) || null);

const createUser = async ({ name, email, password, role, organizationId }) => {
  const user = await createUserRecord({ name, email, password, role, organizationId });
  state.users.push(user);
  return withoutPassword(user);
};

const compareUserPassword = async (userId, candidatePassword) => {
  const user = state.users.find((entry) => entry._id === userId);
  if (!user) {
    return false;
  }

  return bcrypt.compare(candidatePassword, user.passwordHash);
};

const createTask = async ({ title, description, status, priority, createdBy, organizationId }) => {
  const task = createTaskRecord({
    title,
    description,
    status,
    priority,
    createdBy,
    organizationId
  });

  state.tasks.push(task);
  return populateTask(task);
};

const populateTask = (task) => {
  const owner = state.users.find((user) => user._id === task.createdBy);

  return clone({
    ...task,
    createdBy: owner ? withoutPassword(owner) : task.createdBy
  });
};

const getTasks = async ({ organizationId, role, userId, search, status, priority, page, limit }) => {
  let filteredTasks = state.tasks.filter((task) => task.organizationId === organizationId);

  if (role === 'member') {
    filteredTasks = filteredTasks.filter((task) => task.createdBy === userId);
  }

  if (search) {
    const query = search.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
    );
  }

  if (status) {
    filteredTasks = filteredTasks.filter((task) => task.status === status);
  }

  if (priority) {
    filteredTasks = filteredTasks.filter((task) => task.priority === priority);
  }

  filteredTasks = filteredTasks.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  const total = filteredTasks.length;
  const startIndex = (page - 1) * limit;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + limit).map(populateTask);

  return {
    tasks: paginatedTasks,
    total
  };
};

const findTaskById = async (taskId, organizationId) => {
  const task = state.tasks.find(
    (entry) => entry._id === taskId && entry.organizationId === organizationId
  );

  return task ? clone(task) : null;
};

const updateTask = async (taskId, organizationId, updates) => {
  const taskIndex = state.tasks.findIndex(
    (task) => task._id === taskId && task.organizationId === organizationId
  );

  if (taskIndex === -1) {
    return null;
  }

  state.tasks[taskIndex] = {
    ...state.tasks[taskIndex],
    ...updates,
    updatedAt: new Date()
  };

  return populateTask(state.tasks[taskIndex]);
};

const deleteTask = async (taskId, organizationId) => {
  const taskIndex = state.tasks.findIndex(
    (task) => task._id === taskId && task.organizationId === organizationId
  );

  if (taskIndex === -1) {
    return null;
  }

  const [deletedTask] = state.tasks.splice(taskIndex, 1);
  return clone(deletedTask);
};

const logTaskAction = async ({ action, taskId, userId, organizationId }) => {
  const logEntry = {
    _id: createId(),
    action,
    taskId,
    userId,
    organizationId,
    timestamp: new Date()
  };

  state.auditLogs.push(logEntry);
  return clone(logEntry);
};

const getAuditLogs = async (organizationId) =>
  clone(
    state.auditLogs
      .filter((log) => log.organizationId === organizationId)
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 100)
      .map((log) => {
        const task = state.tasks.find((entry) => entry._id === log.taskId);
        const user = state.users.find((entry) => entry._id === log.userId);

        return {
          ...log,
          taskId: task
            ? {
                _id: task._id,
                title: task.title,
                status: task.status,
                priority: task.priority
              }
            : null,
          userId: user ? withoutPassword(user) : null
        };
      })
  );

module.exports = {
  seedDemoData,
  createOrganization,
  findOrganizationById,
  findUserByEmail,
  findUserById,
  createUser,
  compareUserPassword,
  createTask,
  getTasks,
  findTaskById,
  updateTask,
  deleteTask,
  logTaskAction,
  getAuditLogs
};
