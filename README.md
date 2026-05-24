# Insurance Management System

University project for **Lab Course 1 (Programim), Academic Year 2025/2026**.

The application manages insurance clients, insurance types, policies, claims, and payments through a secure REST API and a React dashboard.

## Technology Stack

- Backend: Node.js, Express.js
- Frontend: ReactJS
- Styling: Bootstrap
- Database: MySQL
- Authentication: JWT access tokens and refresh tokens

## Project Structure

```text
backend/   Express REST API
frontend/  React application
database/  MySQL schema
docs/      Database, API, testing, and presentation documentation
```

## Requirements

- Node.js 14.16 or compatible
- npm
- MySQL Server
- MySQL Shell or MySQL Workbench

## Database Setup

Connect to MySQL:

```sql
\sql
\connect root@localhost:3306
```

Run the schema:

```sql
SOURCE C:/Insurance-management/insurance-management/database/schema.sql;
```

The script creates:

- `insurance_management` database
- tables, constraints, indexes, and relations
- default roles: `admin`, `agent`
- default insurance types

## Backend Setup

```bash
cd backend
npm install
Copy-Item .env.example .env
```

Update `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=insurance_management
JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Start backend:

```bash
npm run dev
```

Health checks:

```text
http://localhost:5000/api/health
http://localhost:5000/api/database/health
```

## Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

```text
http://localhost:3000
```

## Login Flow

Create an account from:

```text
http://localhost:3000/register
```

Then log in from:

```text
http://localhost:3000/login
```

The frontend stores the access token and refresh token in local storage, refreshes expired access tokens, and redirects unauthenticated users to the login page.

## Main Features

- Register and login
- JWT authentication and refresh tokens
- Role-based authorization
- Dashboard with statistics and charts
- CRUD for clients
- CRUD for insurance types
- CRUD for policies
- CRUD for claims
- CRUD for payments
- Search and filters
- Success/error notifications

## Documentation

- Database schema: `docs/database-schema.md`
- API endpoints: `docs/api-documentation.md`
- Manual testing checklist: `docs/manual-test-checklist.md`
- Trello evidence guide: `docs/trello-evidence.md`

## Git Notes

The project uses individual commits from both group contributors:

- `gresaismajli <gi73877@ubt-uni.net>`
- `rinesaismajli <ri73882@ubt-uni.net>`

Do not commit:

- `.env`
- `node_modules/`
- `build/`

