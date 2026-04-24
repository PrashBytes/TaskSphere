import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import { useAuth } from '../context/AuthContext';
import { getLogs } from '../services/logService';
import {
  createTask,
  deleteTask as removeTask,
  getTasks,
  updateTask
} from '../services/taskService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState('');
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create',
    task: null
  });

  const fetchDashboardData = async (activeFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const taskResponse = await getTasks(activeFilters);
      setTasks(taskResponse.tasks);
      setPagination(taskResponse.pagination);

      if (user.role === 'admin') {
        const auditLogs = await getLogs();
        setLogs(auditLogs);
      } else {
        setLogs([]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters.page]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: name === 'page' ? Number(value) : 1
    }));
  };

  const applyFilters = () => {
    fetchDashboardData({ ...filters, page: 1 });
    setFilters((current) => ({ ...current, page: 1 }));
  };

  const resetFilters = () => {
    const nextFilters = {
      search: '',
      status: '',
      priority: '',
      page: 1,
      limit: 10
    };
    setFilters(nextFilters);
    fetchDashboardData(nextFilters);
  };

  const handleModalSubmit = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      if (modalState.mode === 'edit' && modalState.task) {
        await updateTask(modalState.task._id, payload);
      } else {
        await createTask(payload);
      }

      setModalState({ isOpen: false, mode: 'create', task: null });
      fetchDashboardData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save the task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setDeletingTaskId(taskId);
    setError('');

    try {
      await removeTask(taskId);
      fetchDashboardData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete the task.');
    } finally {
      setDeletingTaskId('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: 'create', task: null });
  };

  const openEditModal = (task) => {
    setModalState({ isOpen: true, mode: 'edit', task });
  };

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="panel p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                TaskSphere Dashboard
              </p>
              <h1 className="text-3xl font-bold text-slate-900">
                {user.role === 'admin' ? 'Organization control center' : 'My task workspace'}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>
                  Signed in as <strong>{user.name}</strong> ({user.role})
                </span>
                <span>
                  Organization ID: <strong>{user.organizationId}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={openCreateModal}>
                Create Task
              </button>
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="panel p-5">
            <p className="text-sm text-slate-500">Visible tasks</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{pagination.total}</p>
          </div>
          <div className="panel p-5">
            <p className="text-sm text-slate-500">Scope</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {user.role === 'admin' ? 'Org-wide' : 'Personal'}
            </p>
          </div>
          <div className="panel p-5">
            <p className="text-sm text-slate-500">Audit visibility</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {user.role === 'admin' ? logs.length : 0}
            </p>
          </div>
        </section>

        <section className="panel p-6">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="label" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                name="search"
                className="input"
                placeholder="Search title or description"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label className="label" htmlFor="status">
                Status
              </label>
              <select id="status" name="status" className="input" value={filters.status} onChange={handleFilterChange}>
                <option value="">All statuses</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="input"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
            <button type="button" className="btn-secondary" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </section>

        {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {loading ? (
          <div className="panel p-10 text-center text-sm text-slate-500">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            currentUser={user}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            deletingTaskId={deletingTaskId}
          />
        )}

        <section className="flex items-center justify-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const nextFilters = { ...filters, page: Math.max(filters.page - 1, 1) };
              setFilters(nextFilters);
            }}
            disabled={filters.page <= 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const nextFilters = {
                ...filters,
                page: Math.min(filters.page + 1, pagination.totalPages || 1)
              };
              setFilters(nextFilters);
            }}
            disabled={filters.page >= (pagination.totalPages || 1)}
          >
            Next
          </button>
        </section>

        {user.role === 'admin' ? (
          <section className="panel p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Recent audit logs</h2>
              <p className="mt-1 text-sm text-slate-500">
                Admins can see organization-level task activity only within their own tenant.
              </p>
            </div>

            {logs.length === 0 ? (
              <p className="text-sm text-slate-500">No audit events yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-3 pr-4 font-medium">Action</th>
                      <th className="py-3 pr-4 font-medium">Task</th>
                      <th className="py-3 pr-4 font-medium">User</th>
                      <th className="py-3 pr-4 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td className="py-3 pr-4">{log.action}</td>
                        <td className="py-3 pr-4">{log.taskId?.title || 'Deleted task'}</td>
                        <td className="py-3 pr-4">{log.userId?.name || 'Unknown user'}</td>
                        <td className="py-3 pr-4">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>

      <TaskModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.task}
        onClose={() => setModalState({ isOpen: false, mode: 'create', task: null })}
        onSubmit={handleModalSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default DashboardPage;
