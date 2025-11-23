# Digi-Saarathi:

Digi Saarathi is unified Digital Identity platform for migrant and informal sector workers, enabling secure storage of personal documents, verified job history, skills, and experience. It supports skill-based job matching, access to government schemes and services, and a smoother transition across states promoting dignity, mobility, and inclusion for India’s most vital workforce.

**Short summary:** Digi-Saarathi is a full-stack platform for employers and workers that supports job posting/search, document uploads and verifications, admin reviews, and scheme recommendations. The repository contains a separate `backend`, `frontend`, and `admin` UI with API routes, models, and middleware for authentication and authorization.

**Primary goals:**
- **Connect** employers and workers via job listings and applicant workflows.
- **Manage** identity and work verification using document uploads and admin approvals.
- **Recommend** schemes and jobs using curated data and recommendation services.

**Keywords:** job marketplace, verification, admin dashboard, REST API, React, Node.js, MongoDB

**Repository layout (top-level):**
- `backend/`: Node.js Express API, data models, controllers, routes, and scripts.
- `frontend/`: User-facing React app (Vite), pages for jobs, documents, profile, verifications.
- `admin/`: Admin dashboard (Vite + React) for managing users, employers, and verifications.
- `data/`: curated JSON sources and ingest scripts used by backend.

**Tech stack (high level):**
- Backend: Node.js, Express, Mongoose (MongoDB), JWT-based auth middleware.
- Frontend & Admin: React + Vite, Tailwind CSS.
- Data: MongoDB for primary persistence. Local JSON files for ingest/curated scheme data.

---

**Getting started (developer quick-start)**

Prerequisites:
- Node.js (>= 16 recommended)
- npm or yarn
- MongoDB instance (local or hosted like Atlas)

Basic steps (run from repository root):

1. Install dependencies for each workspace:

```powershell
cd backend; npm install; cd ..
cd frontend; npm install; cd ..
cd admin; npm install; cd ..
```

2. Copy and set environment variables for the backend (example `.env` variables):

```text
MONGO_URI=mongodb://localhost:27017/digi-saarathi
JWT_SECRET=your_jwt_secret
PORT=4000
```

3. Run backend and one of the frontends concurrently (in separate terminals):

```powershell
# start backend
cd backend; npm run dev

# start frontend (user)
cd frontend; npm run dev

# start admin dashboard
cd admin; npm run dev
```

Adjust ports in each `vite.config.js` or backend `PORT` if needed.

---

**Key modules and where to look**
- `backend/controllers/`: API controllers for users, employers, admin actions, schemes, and recommendations.
- `backend/models/`: Mongoose schema definitions for users, employers, jobs, documents, verifications.
- `backend/routes/`: Express routes exposed to `frontend` and `admin` apps.
- `frontend/src/pages/`: React pages and components for user flows (jobs, documents, profile).
- `admin/src/pages/`: Admin-specific UI for verification and management.

---

**Authentication & Authorization**
- JWT-based tokens for users and employers.
- Middleware lives in `backend/middleware/` (e.g., `authUser.js`, `authEmployer.js`, `adminAuth.js`).

---

**Example Use Cases & Test Cases**

These examples can be used to write unit/integration tests or manual QA test scripts.

- Use case: User registration and login
	- Steps: POST `/api/users/register` with payload -> expect 201 and user id; POST `/api/users/login` -> expect JWT token and 200.
	- Test: assert token decodes to same user id; invalid password returns 401.

- Use case: Employer posts a job
	- Steps: Employer (authenticated) POST `/api/employers/:id/jobs` -> expect 201 and job resource.
	- Test: unauthorized user returns 403; missing fields return 400.

- Use case: Upload document for verification
	- Steps: Authenticated user uploads file to `/api/documents/upload` -> expect 201 and metadata (file id, url).
	- Test: verify file metadata persisted in MongoDB and storage contains file URL; invalid file type returns 415.

- Use case: Admin verifies a work verification
	- Steps: Admin GET pending verifications -> view -> PATCH `/api/admin/verifications/:id/approve` -> expect status change and log entry.
	- Test: action restricted to admin role; status transitions logged.



