# Company Asset Management System

A full-stack internal tool for tracking company assets (laptops, monitors,
keyboards, etc.), assigning them to employees, and generating reports.

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (swap `DATABASE_URL` for Postgres/MySQL in production), JWT auth
- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios
- **Reports:** Excel export via `openpyxl`, PDF export via `reportlab`

## Features

- Admin login (JWT-based)
- Dashboard with live counts: total employees, total assets, assigned, available, maintenance, lost
- Employee directory with search, add, and a detail profile page showing assigned assets
- Asset inventory with search, filter by status, add asset form (name, category, brand, model, asset ID, serial number, purchase date, warranty, vendor, condition, status)
- Assign / return assets, with full assignment history
- Every status change and assignment is logged to `asset_history`
- Reports page: Employee, Asset, Department, Available Assets, Assigned Assets, Maintenance, Warranty Expiry — each exportable as Excel or PDF
- Settings page: view your account, and (superadmin only) create additional admin accounts

## Project Structure

```
asset-management/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy models (employee, asset, assignment, asset_history, admin)
│   │   ├── routes/        # API routes (auth, employees, assets, assignments, reports, dashboard)
│   │   ├── services/      # report_service.py — Excel/PDF generation
│   │   ├── auth/          # security.py (JWT/password hashing), dependencies.py (route protection)
│   │   ├── database.py
│   │   ├── schemas.py     # Pydantic request/response models
│   │   └── main.py        # FastAPI app entrypoint
│   ├── seed.py             # creates the first superadmin account
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Sidebar, Navbar, StatCard, StatusBadge, Modal, ProtectedLayout
│   │   ├── pages/          # Login, Dashboard, Employees, EmployeeProfile, Assets, Assignments, Reports, Settings
│   │   ├── hooks/          # useAuth.jsx
│   │   ├── services/       # api.js (axios client), resources.js (API calls)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## Local Setup (without Docker)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # edit SECRET_KEY for production

# Create the first admin account
python seed.py
# → prints a username/password, e.g. admin / ChangeMe123!

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000` (and at `http://<your-private-ip>:8000`
for other devices on your network). Interactive API docs at
`http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # points VITE_API_URL at the backend
npm run dev
```

Frontend runs at `http://localhost:5173` and is also reachable from other
devices on your network at `http://<your-private-ip>:5173` (Vite is
configured to listen on all interfaces — it'll print the network URL in
the terminal). Log in with the credentials printed by `seed.py`.

If you're accessing the app from another device, set `VITE_API_URL` in
`frontend/.env` to your machine's private IP (not `localhost`), and add
that same origin to `CORS_ORIGINS` in `backend/.env`.

## Local Setup (with Docker)

```bash
docker compose up --build
```

Then run the seed script once inside the backend container:

```bash
docker compose exec backend python seed.py
```

## Admin Workflow

```
Login → Dashboard → Add Employees → Add Assets → Assign Assets
      → Update Asset Status → Generate Reports
```

## Security Notes Before Production

- Change `SECRET_KEY` in `.env` to a long random value.
- Change the default seeded admin password immediately after first login
  (via `Settings` → create a new superadmin, or extend the API with a
  password-change endpoint).
- Swap SQLite for Postgres/MySQL for multi-user concurrent access — just
  change `DATABASE_URL` in `.env`.
- Put the app behind HTTPS in production; restrict `CORS_ORIGINS` to your
  real frontend domain.
