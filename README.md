# CounterScam (Production-ready template)

CounterScam is a scam/phishing detection system with:
- FastAPI backend (JWT admin auth + customer API keys)
- Usage metering (per endpoint call)
- Rate limiting + abuse protection
- Postgres/SQLite support
- Alembic migrations
- Structured logging with request IDs
- Versioned model loading

## Repo structure
- `Backend/` FastAPI + ML inference + DB
- `admin-dashboard/` React admin UI
- `phishing-detector-app/` React Native / Expo client

---

## Backend quick start (local)

### 1) Create a virtualenv and install deps
```bash
cd Backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt
```

### 2) Configure env vars
Copy:
```bash
cp .env.example .env
```

Edit `.env` and set at least:
- `JWT_SECRET_KEY`
- `CORS_ORIGINS`

### 3) Run migrations and start
```bash
alembic upgrade head
uvicorn main:app --reload
```

### 4) Create an admin user
```bash
python scripts/create_admin.py admin@example.com MyStrongPassword
```

### 5) Create a customer API key (admin-only)
1) Login: `POST /admin/login` with `{ "email": "...", "password": "..." }`
2) Create key: `POST /admin/api-keys` with `{ "owner_email": "customer@x.com", "plan": "free" }`
3) Customer calls endpoints with header: `X-API-Key: <api_key>`

---

## Model versioning

Place your trained pipelines here:
- `Backend/models/v1/url_pipeline.pkl`
- `Backend/models/v1/message_pipeline.pkl`

If models are missing, the API will return `503` and `/model/info` will show the error.

---

## Deploy to Render (backend + Postgres)

This repo includes `render.yaml` (recommended).

### Required env vars on Render (Web Service)
- `ENV=prod`
- `JWT_SECRET_KEY=<generated>`
- `CORS_ORIGINS=["https://your-frontend.onrender.com"]`
- `DATABASE_URL=<Render Postgres connection string>`

### Start command (Render)
```bash
alembic upgrade head && gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120
```

After deploy, open Render Shell and create your first admin user:
```bash
python scripts/create_admin.py admin@example.com MyStrongPassword
```

---

## Frontend env vars

### admin-dashboard
Set:
- `REACT_APP_API_BASE_URL=https://<your-backend>.onrender.com`

### phishing-detector-app (Expo)
Set:
- `EXPO_PUBLIC_API_BASE_URL=https://<your-backend>.onrender.com`
- `EXPO_PUBLIC_API_KEY=<customer-api-key>`
