import { useEffect, useState } from 'react';

const defaultFormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium'
};

const TaskModal = ({ isOpen, mode, initialData, onClose, onSubmit, submitting }) => {
  const [formState, setFormState] = useState(defaultFormState);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState(
      initialData
        ? {
            title: initialData.title,
            description: initialData.description || '',
            status: initialData.status,
            priority: initialData.priority
          }
        : defaultFormState
    );
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="panel w-full max-w-2xl p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {mode === 'edit' ? 'Edit Task' : 'Create Task'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep tasks scoped to your organization and update progress cleanly.
            </p>
          </div>
          <button type="button" className="btn-secondary px-3 py-2" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              className="input"
              value={formState.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="input resize-none"
              value={formState.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="input"
                value={formState.status}
                onChange={handleChange}
              >
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
                value={formState.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'edit' ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
