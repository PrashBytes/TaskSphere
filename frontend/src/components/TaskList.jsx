const statusClasses = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700'
};

const priorityClasses = {
  low: 'bg-sky-100 text-sky-700',
  medium: 'bg-violet-100 text-violet-700',
  high: 'bg-rose-100 text-rose-700'
};

const TaskList = ({ tasks, currentUser, onEdit, onDelete, deletingTaskId }) => {
  if (tasks.length === 0) {
    return (
      <div className="panel p-8 text-center text-sm text-slate-500">
        No tasks found for the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => {
        const ownerId = task.createdBy?._id || task.createdBy;
        const canManage = currentUser.role === 'admin' || ownerId === currentUser.id;

        return (
          <article key={task._id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusClasses[task.status]
                    }`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      priorityClasses[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  {task.description || 'No description added.'}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>
                    Created by: <strong>{task.createdBy?.name || 'Unknown user'}</strong>
                  </span>
                  <span>{new Date(task.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {canManage ? (
                <div className="flex shrink-0 gap-3">
                  <button type="button" className="btn-secondary" onClick={() => onEdit(task)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => onDelete(task._id)}
                    disabled={deletingTaskId === task._id}
                  >
                    {deletingTaskId === task._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default TaskList;
