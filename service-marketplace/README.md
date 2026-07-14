# Service Marketplace API

A production-ready **FastAPI + PostgreSQL** backend for a private service marketplace,  
featuring JWT authentication, role-based access control, provider profile management,  
and location-aware provider search optimised for Lagos districts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| Database | PostgreSQL (via psycopg2) |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Migrations | Alembic |
| Server | Uvicorn (production: Gunicorn + Uvicorn workers) |

---

## Project Structure

```
service-marketplace/
├── app/
│   ├── main.py          # FastAPI app & lifespan
│   ├── config.py        # Settings (Pydantic BaseSettings)
│   ├── database.py      # Engine & session factory
│   ├── dependencies.py  # DI: DB session, JWT auth, role guards
│   ├── core/
│   │   └── security.py  # bcrypt + JWT utilities
│   ├── models/
│   │   ├── user.py      # User ORM (client / provider roles)
│   │   ├── profile.py   # ProviderProfile ORM
│   │   └── constants.py # Lagos district list
│   ├── schemas/
│   │   ├── auth.py      # SignUp / Login / Token schemas
│   │   └── profile.py   # Profile create / update / search schemas
│   └── routers/
│       ├── auth.py      # POST /auth/signup  POST /auth/login
│       ├── profile.py   # CRUD /profile
│       └── search.py    # GET  /providers/search
└── alembic/             # Database migrations
```

---

## Local / Server Setup

### 1. Clone & enter the directory
```bash
cd /opt/service-marketplace   # or your preferred path
```

### 2. Create & activate a virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
nano .env
```

Edit the following values:
```env
DATABASE_URL=postgresql://marketplace_user:yourpassword@localhost:5432/marketplace_db
SECRET_KEY=<run: python3 -c "import secrets; print(secrets.token_hex(32))">
```

### 5. Create the PostgreSQL database
```sql
CREATE USER marketplace_user WITH PASSWORD 'yourpassword';
CREATE DATABASE marketplace_db OWNER marketplace_user;
```

### 6. Run Alembic migrations
```bash
# Generate initial migration (first time only)
alembic revision --autogenerate -m "initial schema"

# Apply migrations
alembic upgrade head
```

### 7. Run the development server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 8. Production (Gunicorn + Uvicorn workers)
```bash
pip install gunicorn

gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

> **Rule of thumb for workers:** `(2 × CPU cores) + 1`

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | None | Register as Client or Provider |
| POST | `/auth/login` | None | Get JWT access token |

**Signup body:**
```json
{
  "username": "john_doe",
  "password": "securepass123",
  "role": "client",          // or "provider"
  "email": "john@example.com",
  "phone_number": "+2348012345678"
}
```

---

### Provider Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/profile/` | Provider JWT | Create profile |
| GET | `/profile/me` | Provider JWT | View own profile |
| PATCH | `/profile/` | Provider JWT | Update profile |
| GET | `/profile/{user_id}` | Any JWT | View a provider's profile |

**Profile body:**
```json
{
  "age": 26,
  "location": "Lekki",
  "bio": "Available weekdays and weekends.",
  "st_rate": true,
  "ovn_rate": false
}
```

---

### Search & Discovery

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/providers/search` | Client JWT | Filter providers |

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `min_age` | int (18–80) | Minimum age filter |
| `max_age` | int (18–80) | Maximum age filter |
| `location` | string | Lagos district (case-insensitive) |
| `service_type` | `ST` or `OVN` | Filter by service duration |
| `skip` | int | Pagination offset (default 0) |
| `limit` | int | Results per page (default 20, max 100) |

**Example:**
```
GET /providers/search?location=Lekki&service_type=ST&min_age=22&max_age=35
Authorization: Bearer <client_token>
```

---

## Interactive Docs

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc:       `http://localhost:8000/redoc`

---

## Lagos Districts Supported

Ikeja, Surulere, Mushin, Oshodi-Isolo, Agege, Alimosho, Ifako-Ijaiye,
Shomolu, Kosofe, Lagos Island, Lagos Mainland, Eti-Osa, Ikoyi,
Victoria Island, Lekki, Ajah, Badagry, Ikorodu, Epe, Ibeju-Lekki.

---

## Security Notes

- Passwords are hashed with **bcrypt** (work factor 12 by default).
- JWT tokens use **HS256**; rotate `SECRET_KEY` to invalidate all sessions.
- Login endpoint uses **constant-time comparison** to prevent user enumeration.
- Tighten `allow_origins` in `main.py` to your frontend domain before going live.
- Disable `/docs` and `/redoc` in `main.py` (`docs_url=None`) for production if desired.
