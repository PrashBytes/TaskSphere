# TaskSphere MVP

TaskSphere is a production-oriented multi-tenant task management MVP built for the internship assignment. It includes strict tenant isolation, JWT authentication, RBAC for `admin` and `member` roles, organization-scoped task management, audit logging, Docker support, and a minimal React dashboard. The current submission is configured to run in demo mode without MongoDB so it can be started instantly for evaluation and deployment demos.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js, Mongoose
- Database: In-memory demo store for the deployed/demo build, with the original Mongo-oriented structure still preserved in the code organization
- Authentication: JWT, bcrypt
- Deployment targets: Vercel (frontend), Render (backend)
- Containerization: Docker, docker-compose

## Project Structure

```text
TaskSphere/
├── api/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── index.html
├── docker-compose.yml
├── package.json
└── vercel.json
```

## Core Security Decisions

- Every task query is filtered by `organizationId: req.user.organizationId`.
- Members can only see and manage their own tasks.
- Admins can manage all tasks within their own organization only.
- Audit logs also store `organizationId` so log queries can be tenant-scoped safely.
- Passwords are hashed with bcrypt before persistence.
- Protected routes require a valid Bearer JWT.
- Helmet headers and rate limiting are enabled.
- The demo backend preserves RBAC and tenant isolation without requiring MongoDB at runtime.

## Backend Setup

1. Copy [backend/.env.example](/C:/Users/ASUS/Desktop/TaskSphere/backend/.env.example) to `backend/.env`.
2. Update the environment values:

```env
PORT=5000
MONGO_URI=
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

3. Install dependencies and start the backend:

```bash
cd backend
npm install
npm run dev
```

## Frontend Setup

1. Copy [frontend/.env.example](/C:/Users/ASUS/Desktop/TaskSphere/frontend/.env.example) to `frontend/.env`.
2. Update the API base URL:

```env
API_BASE_URL=http://localhost:5000/api
```

3. Install dependencies and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Docker Setup

Run the entire stack with MongoDB:

```bash
docker-compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000/api`
- MongoDB: `mongodb://localhost:27017`

## API Endpoints

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`

Example signup payload:

```json
{
  "name": "Asha Admin",
  "email": "asha@example.com",
  "password": "Password123",
  "role": "admin",
  "organizationId": "66112233445566778899aabb"
}
```

### Organizations

- `POST /api/orgs`

Example payload:

```json
{
  "name": "Acme Labs"
}
```

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Optional query params:

- `search`
- `status`
- `priority`
- `page`
- `limit`

### Audit Logs

- `GET /api/logs`

Note: logs are restricted to admins and filtered by tenant.

## Frontend Flow

- Signup supports two onboarding paths:
  - Create a new organization and sign up immediately.
  - Join an existing organization with its `organizationId`.
- Login stores JWT auth state in local storage.
- Dashboard supports:
  - Task list
  - Create/edit modal
  - Delete task
  - Search and filters
  - Pagination
  - Admin-only audit log viewer

## Deployment Notes

### Vercel Frontend

- Root directory: project root
- Build command: `npm run build --prefix frontend`
- Output directory: `frontend/dist`
- API routes are served from the same Vercel project at `/api/*`

### Vercel Backend

- Same Vercel project, exposed at `/api/*`
- Entry point: `api/index.js`
- Runtime: Node.js serverless function via Express export
- Recommended environment variables:
  - `JWT_SECRET`
  - `FRONTEND_URL`

## RBAC Rules Implemented

- `admin`
  - Can read all tasks in their organization
  - Can update/delete all tasks in their organization
  - Can view organization audit logs
- `member`
  - Can only read their own tasks
  - Can only update/delete tasks they created
  - Cannot access audit logs

## Bonus Features Included

- Search and filter tasks
- Pagination on task listing

## Recommended Demo Sequence

1. Create an organization.
2. Sign up an admin inside that organization.
3. Create tasks as admin.
4. Sign up a member in the same organization using the shared organization ID.
5. Verify the member only sees their own tasks.
6. Verify the admin can see all organization tasks and audit logs.
7. Verify users from different organizations cannot access each other's resources.

## Demo Credentials

- Email: `admin@tasksphere.demo`
- Password: `Demo@123`
