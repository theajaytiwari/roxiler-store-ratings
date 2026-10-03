# Roxiler Backend

Express + PostgreSQL REST API with JWT auth.

## Setup

1. Copy .env.example to .env and fill in your values
2. Run the SQL schema: `psql -U postgres -d roxiler -f schema.sql`
3. Seed demo accounts: `npm run seed`
4. Start dev server: `npm run dev`

## Demo credentials (after seed)
| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@example.com  | Admin@123 |
| User  | user@example.com   | Admin@123 |
| Owner | owner@example.com  | Admin@123 |

## API Routes
- POST /api/auth/signup
- POST /api/auth/login
- GET  /api/auth/me
- PUT  /api/auth/password
- GET  /api/admin/dashboard
- POST /api/admin/users
- GET  /api/admin/users
- GET  /api/admin/users/:id
- POST /api/admin/stores
- GET  /api/admin/stores
- GET  /api/stores
- PUT  /api/stores/:storeId/rating
- GET  /api/owner/dashboard
