
# Roxiler Store Rating Management System

A full-stack web application built as part of a Full-Stack Development Intern coding assessment. The platform allows users to discover stores, submit ratings, and manage their reviews, with separate functionality for administrators, normal users, and store owners.

## Tech Stack

**Frontend**
- React
- Vite
- React Router
- Axios

**Backend**
- Node.js
- Express.js
- REST API
- JWT authentication
- bcryptjs for password hashing

**Database**
- PostgreSQL
- Relational database design
- Foreign keys and data constraints

## Features

### System Administrator
- Dashboard showing total users, stores, and ratings
- Create users, administrators, store owners, and stores
- View and manage user and store listings
- Search, filter, and sort records
- View user details and store ratings

### Normal User
- Register and log in
- Browse registered stores
- Search stores by name and address
- Submit ratings from 1 to 5
- Update previously submitted ratings
- Change password

### Store Owner
- View average store rating
- View users who have submitted ratings
- Access an owner dashboard
- Change password

## Project Structure

```text
roxiler-app/
├── Backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/theajaytiwari/roxiler-store-ratings.git
cd roxiler-store-ratings
```

### 2. Configure the database

Create a PostgreSQL database named `roxiler`.

From the project root, run:

```bash
psql -U postgres -d roxiler -f Backend/schema.sql
```

Use your own PostgreSQL username if it is different.

**Important:** The schema script drops existing tables before recreating them. Run it only against a fresh database or data you can safely delete.

### 3. Configure the backend

```bash
cd Backend
npm ci
Copy-Item .env.example .env
```

Update `Backend/.env` with your local database connection and a strong, private JWT secret.

### 4. Seed demo data

```bash
npm run seed
```

Use only local demo data. Never use default demo passwords for production.

### 5. Start the backend

```bash
npm run dev
```

The backend uses port 5000 by default.

### 6. Start the frontend

Open a second terminal from the project root:

```bash
cd Frontend
npm ci
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Environment Variables

The backend configuration is documented in `Backend/.env.example`.

Never commit `.env` files, database passwords, JWT secrets, or production credentials.

## Security

- Passwords are hashed using bcryptjs.
- Protected API routes use JWT authentication.
- Backend routes enforce role-based permissions.
- Input validation and database constraints help maintain data integrity.

## Future Improvements

- Automated unit and integration tests
- Responsive UI refinements
- Production deployment
- Pagination for large datasets
- Improved production authentication security

## Author

**Ajay Kumar Tiwari**

GitHub: [@theajaytiwari](https://github.com/theajaytiwari)

---

Built as a full-stack development assessment project.
