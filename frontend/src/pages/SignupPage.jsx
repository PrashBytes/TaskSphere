import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { createOrganization } from '../services/orgService';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signupUser } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    organizationMode: 'create',
    organizationName: '',
    organizationId: ''
  });
  const [createdOrgId, setCreatedOrgId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let organizationId = formState.organizationId;

      if (formState.organizationMode === 'create') {
        const organization = await createOrganization({ name: formState.organizationName });
        organizationId = organization._id;
        setCreatedOrgId(organizationId);
      }

      await signupUser({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        role: formState.role,
        organizationId
      });

      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Signup failed. Please review the form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-2xl p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
            TaskSphere
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Create your workspace access</h1>
          <p className="mt-2 text-sm text-slate-500">
            Start a new organization or join an existing one with its organization ID.
          </p>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input id="name" name="name" className="input" value={formState.name} onChange={handleChange} required />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={formState.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              value={formState.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="role">
              Role
            </label>
            <select id="role" name="role" className="input" value={formState.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="organizationMode">
              Organization setup
            </label>
            <select
              id="organizationMode"
              name="organizationMode"
              className="input"
              value={formState.organizationMode}
              onChange={handleChange}
            >
              <option value="create">Create a new organization</option>
              <option value="join">Join an existing organization</option>
            </select>
          </div>

          {formState.organizationMode === 'create' ? (
            <div className="md:col-span-2">
              <label className="label" htmlFor="organizationName">
                Organization name
              </label>
              <input
                id="organizationName"
                name="organizationName"
                className="input"
                value={formState.organizationName}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="label" htmlFor="organizationId">
                Organization ID
              </label>
              <input
                id="organizationId"
                name="organizationId"
                className="input"
                value={formState.organizationId}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {createdOrgId ? (
            <p className="md:col-span-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Organization created. Share this ID with teammates: <strong>{createdOrgId}</strong>
            </p>
          ) : null}

          {error ? (
            <p className="md:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          ) : null}

          <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Sign up'}
            </button>
            <p className="text-sm text-slate-500">
              Already registered?{' '}
              <Link className="font-semibold text-brand-600 hover:text-brand-700" to="/login">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
