# Sampleton Stack (Django + React + PostgreSQL + Docker)

Full-stack project template.

## Requirements

- Python 3.10 or higher
- Node.js 18 or higher
- Docker Desktop (optional, for the database service)

## Backend Setup (Django)

1. Go to the backend directory:
   `cd Backend`
2. Create a virtual environment:
   `python -m venv venv`
3. Activate the virtual environment on Windows:
   `venv\Scripts\activate`
4. Install backend dependencies:
   `pip install -r requirements.txt`
5. Run database migrations:
   `python manage.py migrate`
6. Start the backend development server:
   `python manage.py runserver`

## Frontend Setup (React)

1. Go to the frontend directory:
   `cd Frontend`
2. Install frontend dependencies:
   `npm install`
3. Start the frontend development server:
   `npm run dev`

## Optional Docker Database Setup

To start PostgreSQL using Docker Compose, run:

`docker-compose up -d`

## Automatic Documentation

Official API documentation has been generated automatically from:

- Python docstrings (backend) using Sphinx autodoc
- JSDoc/TSDoc comments (frontend) using TypeDoc

Generated output locations:

- Backend HTML documentation: `docs/backend/_build/html/index.html`
- Frontend HTML documentation: `docs/frontend/index.html`

### Regenerate Backend Documentation

From `Backend`:

1. Install dependencies if needed:
   `python -m pip install -r requirements.txt`
2. Install documentation dependencies:
   `python -m pip install sphinx djangorestframework-simplejwt`
3. Build docs:
   `python -m sphinx -b html ../docs/backend ../docs/backend/_build/html`

### Regenerate Frontend Documentation

From `Frontend`:

1. Install dependencies:
   `npm install`
2. Install TypeDoc:
   `npm install -D typedoc`
3. Build docs:
   `npx typedoc --entryPoints src --entryPointStrategy expand --out ../docs/frontend --skipErrorChecking`