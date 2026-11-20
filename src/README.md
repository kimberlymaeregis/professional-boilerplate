Professional Boilerplate

A production-ready Node.js + TypeScript + MySQL REST API boilerplate. It includes centralized error handling, request validation, structured logging, security middleware, database migrations, and a complete User CRUD example that shows every layer working together.

Features
TypeScript in strict mode with decorators enabled for TypeORM
Express 5 with an async handler wrapper (no try/catch in controllers)
Centralized error handling using custom error classes (NotFoundError, ValidationError, ConflictError, and others) and a single error middleware
Request validation with Joi for body, params, and query
Structured logging with Winston (JSON log files, colorized console in development, log rotation)
Request logging with a unique request ID on every request
Security through Helmet, CORS, and rate limiting
Environment validation: the app refuses to start if .env is invalid
TypeORM migrations (synchronize: false) plus a database seeder
Consistent response format with success, created, no-content, and paginated helpers
Health check endpoint that reports database connectivity
Graceful shutdown on SIGTERM and SIGINT
Tech Stack
Area	Tools
Runtime	Node.js 20/22 LTS
Language	TypeScript
Framework	Express
Database	MySQL with TypeORM
Validation	Joi
Logging	Winston
Security	Helmet, CORS, express-rate-limit
Auth utilities	bcrypt
Project Structure
professional-boilerplate/
├── src/
│   ├── config/          # env.ts, data-source.ts
│   ├── controllers/     # HTTP layer (userController.ts)
│   ├── services/        # Business logic (userService.ts)
│   ├── entities/        # TypeORM entities (User.ts)
│   ├── dto/             # Joi validation schemas (user.dto.ts)
│   ├── middleware/      # errorHandler, validate, requestLogger, security
│   ├── utils/           # errors, asyncHandler, logger, response helpers
│   ├── routes/          # userRoutes.ts, healthRoutes.ts
│   ├── migrations/      # Generated TypeORM migrations
│   ├── seeds/           # userSeeder.ts, runSeeds.ts
│   └── index.ts         # App entry point
├── tests/               # unit/ and integration/
├── logs/                # combined.log and error.log (git-ignored)
├── .env                 # Local config (git-ignored)
├── .env.example         # Template for other developers
├── package.json
└── tsconfig.json
Setup Instructions
Prerequisites
Node.js v20 or v22 LTS
MySQL Server installed and running
Postman or Insomnia for testing
Installation
bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/professional-boilerplate.git
cd professional-boilerplate

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env        # On Windows PowerShell: Copy-Item .env.example .env

# 4. Edit .env and fill in your MySQL credentials
Create the database

Run this in MySQL Workbench or the MySQL shell:

sql
CREATE DATABASE boilerplate_db;
Create the logs folder
bash
mkdir logs
Run migrations and seed data
bash
npm run migration:run
npm run seed
Start the server
bash
npm run dev

The API runs at http://localhost:3000.

Environment Variables
Variable	Required	Default	Description
NODE_ENV	No	development	development, production, or test
PORT	No	3000	Port the server listens on
DB_HOST	Yes	n/a	MySQL host
DB_PORT	No	3306	MySQL port
DB_USERNAME	Yes	n/a	MySQL username
DB_PASSWORD	Yes	n/a	MySQL password
DB_DATABASE	Yes	n/a	Database name (for example boilerplate_db)
FRONTEND_URL	No	http://localhost:4200	Allowed CORS origin
Available Scripts
Script	Description
npm run dev	Start the dev server with auto-restart
npm run build	Compile TypeScript to dist/
npm start	Run the compiled app from dist/
npm run migration:generate -- src/migrations/Name	Generate a migration from entity changes
npm run migration:run	Apply pending migrations
npm run migration:revert	Revert the last migration
npm run seed	Insert seed data
Migrations and Seeders
Migrations

Schema changes are never applied with synchronize. Workflow for a schema change:

Edit or add an entity in src/entities/.
Generate a migration (the timestamp is added automatically):
bash
   npm run migration:generate -- src/migrations/DescribeYourChange
Review the generated file in src/migrations/.
Apply it:
bash
   npm run migration:run
To undo the most recent migration:
bash
   npm run migration:revert

In production (NODE_ENV=production), pending migrations run automatically on startup.

Seeders
bash
npm run seed

The seeder is idempotent: it skips users that already exist. It creates:

Email	Password
admin@example.com	Admin123!
test@example.com	Test123!

These are development credentials only. Never seed known passwords in production.

API Endpoints

Base URL: http://localhost:3000

Health
Method	Endpoint	Description	Success
GET	/health	Server uptime and database status	200 (503 if the database is down)
Users
Method	Endpoint	Description	Success
GET	/api/users	List users (paginated)	200
GET	/api/users/:id	Get one user	200
POST	/api/users	Create a user	201
PUT	/api/users/:id	Update a user	200
DELETE	/api/users/:id	Delete a user	204

Query parameters for GET /api/users

Param	Default	Rules
page	1	integer, min 1
limit	10	integer, 1 to 100
sort	createdAt	createdAt, updatedAt, name, email
order	DESC	ASC or DESC

Create user body

json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "age": 30
}
Field	Rules
name	required, 2 to 100 characters
email	required, valid email, unique
password	required, 8 to 50 characters, at least one letter and one number
age	optional, integer, 13 to 120

Update user body (at least one field): name, email, age, isActive.

Response Format

Success

json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": 3, "name": "John Doe", "email": "john@example.com" }
}

Paginated

json
{
  "success": true,
  "data": [],
  "meta": { "total": 2, "page": 1, "limit": 10, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}

Error

json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "message": "Email is required", "type": "any.required" }]
  }
}
Error Codes
Code	Status	Meaning
VALIDATION_ERROR	400	Request failed Joi validation
INVALID_JSON	400	Malformed JSON body
DATABASE_ERROR	400	A database query failed
UNAUTHORIZED	401	Authentication required
FORBIDDEN	403	Not permitted
NOT_FOUND	404	Resource does not exist
ROUTE_NOT_FOUND	404	Unknown route
CONFLICT	409	Duplicate resource (for example, email)
RATE_LIMIT_EXCEEDED	429	More than 100 requests per 15 minutes
INTERNAL_ERROR	500	Unexpected server error
Testing

All ten Postman tests from the lab pass:

Health check returns 200
Get all users returns the seeded users
Create a valid user returns 201
Create with missing fields returns 400
Create with a duplicate email returns 409
Get user by ID returns 200
Get a non-existent user returns 404
Update a user returns 200
Delete a user returns 204
Invalid route returns 404

Logs are written to logs/combined.log (everything) and logs/error.log (errors only), rotated at 5 MB with up to 5 files kept.

Troubleshooting (Issues I Hit While Building This)
Problem	Cause	Fix
mkdir -p and {a,b,c} fail in PowerShell	Those are bash features	Use mkdir a, b, c in PowerShell, or use Git Bash or WSL
Cannot find module 'tsconfig-paths/register'	The typeorm script preloads it but it was not installed	npm install -D tsconfig-paths
migration:generate -n is not recognized	-n is the old TypeORM 0.2 syntax	Pass the path instead: npm run migration:generate -- src/migrations/InitialSchema
Duplicate key name 'IDX_...' on migration	email was marked unique twice (@Index on the class and unique: true on the column)	Keep only one, then delete and regenerate the migration
Red squiggle on select: [...]	TypeORM 0.3+ expects an object for select	Remove it, since password already has select: false, or use select: { id: true, ... }
Cannot set property query of #<IncomingMessage> which has only a getter	In Express 5, req.query is read-only	Use Object.defineProperty(req, source, { value, ... }) in validate.ts
Reflection Answers
1. What was the most challenging part of building this boilerplate? How did you overcome it?

The hardest part was the tooling and version mismatches, not the application code. The lab instructions were written for older package versions, so I hit several errors that had nothing to do with my logic: the old -n flag for TypeORM migrations, the missing tsconfig-paths package, a duplicate unique index in my first generated migration, and Express 5 making req.query read-only, which crashed my validation middleware. I overcame these by reading the actual error message and stack trace instead of guessing. Each error pointed to a specific file and line, so I could trace it to a root cause: a deprecated flag, a missing dependency, or a breaking change between major versions. The lesson was to read the error output first and to check which version of a library the tutorial assumes.

2. How does this boilerplate differ from your Midterm project? What specific improvements did you make?

(Edit this one to describe your own Midterm.) Compared to a basic CRUD API, this boilerplate adds layers that make it maintainable and safe: separate controller, service, and entity layers instead of mixed logic; Joi validation on every input; centralized error handling with a consistent error response; Winston structured logging with a request ID; Helmet, CORS, and rate limiting; validated environment variables; migrations instead of synchronize; a seeder; a health check; and graceful shutdown. The result is that the app fails fast on bad config, never leaks passwords, and is easy to debug.

3. Why is centralized error handling better than try-catch in every controller?

With centralized handling, controllers and services just throw a meaningful error (for example NotFoundError or ConflictError) and the asyncHandler forwards it to one error middleware. This is better because:

No repetition (DRY): the same try/catch is not copied into every controller method.
Consistency: every error returns the same JSON shape, so frontend developers can rely on it.
Single place for policy: logging, status code mapping, and hiding stack traces in production all live in one file, so a change is made once.
Safety: one forgotten try/catch cannot leak a raw error or crash a request.
Cleaner controllers: they only describe the happy path, which is easier to read and test.
4. How does request validation with Joi improve security and code quality?

For security, validation rejects malformed or malicious input before it reaches the database or business logic. stripUnknown: true removes fields the client should not control (for example, trying to set isActive or id on create), type checks and length limits reduce injection and oversized-payload risks, and password rules enforce minimum strength. For code quality, the rules are declared in one place (user.dto.ts) instead of scattered if checks, convert: true turns strings like "5" into numbers, defaults (such as page=1) are applied automatically, and the error messages are clear and consistent. The service layer can then trust that the data it receives is already valid.

5. What is the difference between synchronize: true and migrations? Why are migrations essential for production?

synchronize: true makes TypeORM automatically change the database schema to match the entities every time the app starts. It is convenient in early development, but it is dangerous: renaming or removing a column can drop that column and its data, the changes are not reviewed or recorded, and you cannot roll back. Migrations are versioned scripts with an up (apply) and a down (revert) step. They are essential in production because they:

are reviewable in code review and tracked in Git,
run in the same order on every environment (dev, staging, production),
can be reverted if something goes wrong,
protect existing data, and
give the team a history of how the schema evolved.
6. How does structured logging (Winston) help in production debugging compared to console.log?

console.log prints unstructured text that disappears when the process restarts and cannot be filtered. Winston writes structured JSON with a timestamp, a log level, and metadata (request ID, method, path, status code, duration). In production this means I can search and filter logs by level or request ID, follow a single request across several log lines, separate errors into error.log, and keep logs persistent with automatic rotation so disks do not fill up. The JSON format can also be sent to log tools such as ELK, Datadog, or CloudWatch. Log levels let me keep verbose debug output in development and only info and above in production.

7. If you had to add a new feature (for example, Product CRUD), how would you use this boilerplate? What would you need to add?

I would repeat the same vertical slice used for User:

Entity: src/entities/Product.ts, registered in data-source.ts.
Migration: generate it and run npm run migration:generate -- src/migrations/AddProducts, then npm run migration:run.
DTO: src/dto/product.dto.ts with Joi schemas for create, update, and pagination.
Service: src/services/productService.ts with the business rules (for example, unique SKU).
Controller: src/controllers/productController.ts using the existing response helpers.
Routes: src/routes/productRoutes.ts, using validate() and asyncHandler, then mounted in index.ts as /api/products.
Seeder: optional sample products.

The error handling, validation middleware, logging, security, and response helpers all work without changes.

8. What additional features would you add to make this boilerplate even more production-ready?
Authentication and authorization: JWT login and registration, refresh tokens, and role-based access control (planned for the Final Project).
Automated tests: unit tests for services and integration tests for routes (Jest and Supertest) in the tests/ folder.
CI/CD pipeline: GitHub Actions to lint, test, and build on every push.
Docker: a Dockerfile and docker-compose.yml for the app and MySQL.
API documentation: Swagger/OpenAPI generated from the schemas.
Lint and format: ESLint, Prettier, and Husky pre-commit hooks.
Stronger rate limiting: stricter limits on auth routes, and Redis-backed limits when running multiple instances.
Monitoring: error tracking (such as Sentry) and metrics.
Soft deletes, audit fields, and caching where they make sense.




MODULE 9: README.md

# Professional Boilerplate API with JWT Authentication

A production-style REST API built with **Node.js, Express, TypeScript, TypeORM, and MySQL**. This version adds **JWT (JSON Web Token) authentication**: users log in with email and password, receive a signed token, and must send that token to access protected routes.

## Features

- User CRUD operations
- Login with bcrypt password verification
- JWT generation and verification
- Authentication middleware that protects routes
- Request validation with Joi
- Environment validation (the app refuses to start with a missing or weak `JWT_SECRET`)
- Security middleware (Helmet, CORS, rate limiting)
- Structured logging and centralized error handling

## Tech Stack

| Area | Technology |
|------|------------|
| Runtime / Language | Node.js, TypeScript |
| Framework | Express |
| Database / ORM | MySQL, TypeORM |
| Auth | jsonwebtoken, bcrypt |
| Validation | Joi |

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL running locally with a `boilerplate_db` database
- Postman or Insomnia for testing

### Installation

```bash
git clone <your-repo-url>
cd professional-boilerplate
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=boilerplate_db

# Frontend URL for CORS
FRONTEND_URL=http://localhost:4200

# JWT Configuration
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=24h
```

Generate a secure secret (minimum 32 characters is enforced):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> Never commit your `.env` file. Make sure it is listed in `.gitignore`.

### Run the Server

```bash
npm run dev
```

Expected output:

```
✅ Database connected successfully
🚀 Server running on port 3000
```

## Project Structure

```
src/
├── config/
│   ├── data-source.ts      # TypeORM data source
│   └── env.ts              # Joi-validated environment config (incl. JWT)
├── controllers/
│   └── authController.ts   # login, getMe
├── dto/
│   └── auth.dto.ts         # loginSchema (Joi)
├── entities/
│   └── User.ts
├── middleware/
│   └── auth.ts             # authMiddleware (JWT verification)
├── routes/
│   ├── authRoutes.ts       # /api/auth/*
│   ├── userRoutes.ts
│   └── healthRoutes.ts
├── services/
│   └── authService.ts      # login, verifyToken, getUserFromToken
└── index.ts                # app setup and route registration
```

## Authentication Flow

```
 Client                                   Server
   |                                        |
   |  1. POST /api/auth/login               |
   |     { email, password }                |
   |--------------------------------------->|
   |                                        |  2. Find user by email
   |                                        |  3. bcrypt.compare(password, hash)
   |                                        |  4. jwt.sign({ userId, email })
   |  5. { token, user }                    |
   |<---------------------------------------|
   |                                        |
   |  6. GET /api/users                     |
   |     Authorization: Bearer <token>      |
   |--------------------------------------->|
   |                                        |  7. authMiddleware: verify token
   |                                        |  8. Attach decoded payload to req.user
   |  9. Protected data                     |
   |<---------------------------------------|
```

1. The client sends credentials to the login endpoint.
2. The server looks up the user and compares the password against the stored bcrypt hash.
3. If valid, the server signs a JWT containing `userId` and `email`, expiring after `JWT_EXPIRES_IN`.
4. The client stores the token and sends it in the `Authorization` header on later requests.
5. `authMiddleware` verifies the signature and expiry, attaches the payload to `req.user`, and calls `next()`.
6. If the token is missing, malformed, invalid, or expired, the request is rejected with `401 Unauthorized`.

## How to Get a Token

**Request**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123"
}
```

**Response**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User"
    }
  }
}
```

## How to Use the Token

Send the token in the `Authorization` header using the `Bearer` scheme:

```http
GET /api/users
Authorization: Bearer <your-token-here>
```

In Postman: **Authorization** tab → Type **Bearer Token** → paste the token.

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Log in and receive a JWT |
| POST | `/api/users` | Create a user (registration)* |

### Protected (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get the current user from the token |
| GET | `/api/users` | List users (paginated) |
| GET | `/api/users/:id` | Get a user by ID |
| PUT / PATCH | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

\* Adjust this table to match how you applied `authMiddleware` in `userRoutes.ts`.

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid request body (e.g. bad email format) |
| 401 | `UNAUTHORIZED` | Missing, invalid, or expired token; wrong credentials |

Example:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided"
  }
}
```

## Testing Checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Login with valid credentials | 200, token returned |
| 2 | `GET /api/users` with valid token | 200, user list |
| 3 | `GET /api/users` without token | 401 "No token provided" |
| 4 | `GET /api/users` with invalid token | 401 "Invalid token" |
| 5 | `GET /api/auth/me` with valid token | 200, current user |
| 6 | Login with wrong password | 401 "Invalid email or password" |
| 7 | Login with invalid email format | 400 validation error |

## Security Notes

- Passwords are hashed with bcrypt and never returned in responses or stored in the token.
- `JWT_SECRET` is validated at startup and must be at least 32 characters.
- Login returns the same generic message for unknown emails and wrong passwords to avoid revealing which accounts exist.
- Use HTTPS in production so tokens cannot be intercepted in transit.

## Reflection Answers

**1. What is the difference between authentication and authorization?**
Authentication verifies *who you are*; authorization decides *what you are allowed to do*. Example: showing your ID and ticket at an airport check-in is authentication, while your boarding pass determining which gate and seat you can access is authorization. In this project, login is authentication, and deciding whether a user may delete other users would be authorization.

**2. Why is JWT "stateless," and how does that help scalability?**
The server does not store sessions. All the information needed to validate a request is inside the signed token, so any server instance can verify it using the shared secret, with no session lookup. This makes horizontal scaling simple because there is no shared session store to maintain.

**3. What are the three parts of a JWT?**
- **Header:** the token type and signing algorithm (e.g. HS256).
- **Payload:** the claims, such as `userId`, `email`, `iat` (issued at), and `exp` (expiry).
- **Signature:** a hash of the header and payload made with the secret, proving the token was not tampered with.

**4. Why should you never put sensitive data in the JWT payload?**
The payload is only Base64URL-encoded, not encrypted. Anyone who has the token can decode and read it (for example at jwt.io). Only non-sensitive identifiers belong there.

**5. How does bcrypt protect passwords? What are salt and rounds?**
bcrypt is a deliberately slow, one-way hashing function. The **salt** is random data added to each password before hashing, so identical passwords produce different hashes and precomputed rainbow tables are useless. The **rounds** (cost factor) set how much work each hash takes (2^rounds iterations), making brute-force attacks expensive, and the cost can be raised as hardware gets faster.

**6. What happens if someone steals a JWT, and how can you mitigate it?**
They can impersonate the user until the token expires, because the server cannot tell the difference. Mitigations: short expiry times, refresh tokens, HTTPS only, avoiding storage in places exposed to XSS (such as using httpOnly cookies), a token blacklist or revocation list for logout, and rotating the secret if it is compromised.

**7. Why is HTTPS important when transmitting JWTs?**
A JWT is a bearer token: whoever holds it has access. Over plain HTTP, it can be sniffed on the network. HTTPS encrypts the traffic so tokens and credentials cannot be read or replayed by an attacker in the middle.

**8. Access token vs. refresh token?**
An access token is short-lived (minutes to an hour) and sent with every API request, limiting damage if stolen. A refresh token is long-lived, stored more securely, and used only to obtain new access tokens, so users stay logged in without re-entering credentials. Use access tokens for API calls and refresh tokens for keeping sessions alive.

**9. How does the auth middleware know which user is making the request?**
It reads the `Authorization: Bearer <token>` header, verifies the signature and expiry with `jwt.verify`, and gets the `userId` and `email` from the decoded payload. It then attaches that payload to `req.user`, which controllers can use.

**10. How would you add role-based authorization (admin vs. regular user)?**
- Add a `role` column to the `User` entity (e.g. `'admin' | 'user'`, default `'user'`).
- Include `role` in the JWT payload and in the `TokenPayload` / `req.user` types.
- Create a `requireRole(...roles)` middleware that runs after `authMiddleware` and returns `403 Forbidden` if `req.user.role` is not allowed.
- Apply it to routes, e.g. `router.delete('/:id', authMiddleware, requireRole('admin'), ...)`.


ACTIVITY 10 README.md

# Professional Boilerplate: Node.js + TypeScript + TypeORM + JWT

A production-style REST API boilerplate built with **Express, TypeScript, TypeORM and MySQL**. It provides JWT authentication and, as of Lab 11, a complete **email verification** and **password reset** system powered by **Nodemailer**.

This moves the API from "basic authentication" to an enterprise-style security flow: users must prove they own their email before logging in, and can securely recover forgotten passwords through one-time, expiring tokens.

---

## Features

- JWT login with protected routes
- User registration with **email verification** (24-hour token)
- **Forgot / reset password** flow (1-hour token)
- Resend verification email
- Login blocked until the email is verified
- Cryptographically secure tokens (`crypto.randomBytes`)
- One-time-use tokens that are cleared after use
- No information leakage (email enumeration protection)
- Joi request validation with custom error messages
- HTML email templates, tested with Ethereal (no real emails sent)
- TypeORM migrations for schema management
- Centralized logging and error handling

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js, TypeScript |
| Framework | Express |
| Database | MySQL + TypeORM |
| Auth | JWT, bcrypt |
| Email | Nodemailer (Ethereal for testing) |
| Validation | Joi |

---

## Project Structure

```
src/
├── config/
│   ├── data-source.ts          # TypeORM DataSource
│   └── env.ts                  # Env validation (Joi) + config object
├── controllers/
│   ├── authController.ts
│   └── verificationController.ts
├── dto/
│   ├── auth.dto.ts
│   └── verification.dto.ts     # register, email, resetPassword schemas
├── entities/
│   └── User.ts                 # User entity with token fields
├── middleware/
│   ├── auth.ts                 # JWT middleware
│   └── validate.ts             # Joi validation middleware
├── migrations/                 # TypeORM migrations
├── routes/
│   ├── authRoutes.ts           # /login, /me + mounts verification routes
│   └── verificationRoutes.ts   # register, verify, resend, forgot, reset
├── services/
│   ├── authService.ts          # Login (checks isVerified)
│   ├── emailService.ts         # Nodemailer + HTML templates
│   └── verificationService.ts  # Verification and reset business logic
└── utils/                      # logger, errors, response, asyncHandler
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- MySQL running with a `boilerplate_db` database

### 2. Install

```bash
npm install
```

### 3. Configure `.env`

```env
# Database, JWT and app settings (existing)
# ...

# Email configuration (Ethereal for testing)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-username@ethereal.email
SMTP_PASS=your-ethereal-password
EMAIL_FROM=noreply@yourapp.com
```

### 4. Generate Ethereal test credentials

```bash
node -e "const nodemailer = require('nodemailer'); nodemailer.createTestAccount().then(a => { console.log('User:', a.user); console.log('Pass:', a.pass); console.log('Host:', a.smtp.host); console.log('Port:', a.smtp.port); })"
```

Copy the output into the `SMTP_*` values above.

### 5. Run migrations

```bash
# Generate a new migration (TypeORM 0.3+ takes the path as an argument)
npm run migration:generate -- src/migrations/AddEmailVerificationFields

# Apply migrations
npm run migration:run
```

Mark any pre-existing users as verified so they can still log in:

```sql
UPDATE users SET isVerified = true WHERE isVerified = false;
```

### 6. Start the server

```bash
npm run dev
```

Expected output:

```
✅ Database connected successfully
✅ Email service connected
🚀 Server running on port 3000
```

---

## Database Schema (users)

| Column | Type | Notes |
|--------|------|-------|
| id | INT | Primary key, auto increment |
| name | VARCHAR(100) | |
| email | VARCHAR(100) | Unique |
| password | VARCHAR(255) | bcrypt hash, `select: false` |
| isActive | TINYINT | Default 1 |
| **isVerified** | TINYINT | Default 0 |
| **verificationToken** | VARCHAR(255) | Nullable, unique, `select: false` |
| **verificationTokenExpiry** | DATETIME | Nullable |
| **resetPasswordToken** | VARCHAR(255) | Nullable, unique, `select: false` |
| **resetPasswordExpiry** | DATETIME | Nullable |
| age | INT | Nullable |
| createdAt / updatedAt | DATETIME(6) | Automatic |

Unique indexes exist on `email`, `verificationToken` and `resetPasswordToken`.

---

## Authentication Flow

### Registration and verification

```
Client                    API                         Email (Ethereal)
  | POST /register         |                                |
  |----------------------->| hash password                  |
  |                        | create token (24h expiry)      |
  |                        | save user (isVerified=false)   |
  |                        |------------------------------->| verification email
  |<-----------------------| 201 Registration successful    |
  |                        |                                |
  | POST /login            |                                |
  |----------------------->| isVerified = false             |
  |<-----------------------| 401 Please verify your email   |
  |                        |                                |
  | GET /verify-email?token|                                |
  |----------------------->| valid + not expired            |
  |                        | isVerified=true, clear token   |
  |<-----------------------| 200 Email verified             |
  |                        |                                |
  | POST /login            |                                |
  |----------------------->|                                |
  |<-----------------------| 200 JWT token                  |
```

### Password reset

```
1. POST /forgot-password   -> generates reset token (1h expiry), emails link
                              (always returns the same success message)
2. User opens email link   -> frontend reads ?token=...
3. POST /reset-password    -> validates token + expiry, hashes new password,
                              clears the token
4. POST /login             -> works with the new password
```

---

## API Endpoints

Base URL: `http://localhost:3000/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register and send verification email |
| GET | `/verify-email?token=...` | No | Verify email with token |
| POST | `/resend-verification` | No | Send a new verification email |
| POST | `/forgot-password` | No | Request a password reset email |
| POST | `/reset-password` | No | Reset password with token |
| POST | `/login` | No | Login (verified users only) |
| GET | `/me` | JWT | Get the current user |

### POST `/register`

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123",
  "age": 30
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "message": "Registration successful. Please check your email to verify your account.",
    "userId": 3
  }
}
```

### GET `/verify-email?token=YOUR_TOKEN`

Response `200`:

```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

### POST `/resend-verification`

```json
{ "email": "john.doe@example.com" }
```

Response `200`:

```json
{
  "success": true,
  "message": "If an account with that email exists, a verification email has been sent."
}
```

### POST `/login`

```json
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

Success `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 3, "email": "john.doe@example.com", "name": "John Doe" }
  }
}
```

Unverified `401`:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Please verify your email address before logging in. Check your inbox for the verification link."
  }
}
```

### POST `/forgot-password`

```json
{ "email": "john.doe@example.com" }
```

Response `200` (same message whether or not the email exists):

```json
{
  "success": true,
  "message": "If an account with that email exists, a reset link has been sent."
}
```

### POST `/reset-password`

Send **only the token value** (the part after `?token=`), not the whole link.

```json
{
  "token": "YOUR_RESET_TOKEN_HERE",
  "newPassword": "NewPassword456"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in with your new password."
}
```

### Validation rules

- **name**: 2 to 100 characters
- **email**: valid email format
- **password / newPassword**: 8 to 50 characters, at least one letter and one number
- **age**: integer between 13 and 120 (optional)

---

## How to Test Emails with Ethereal

[Ethereal](https://ethereal.email) is a fake SMTP service. Emails are never delivered to real inboxes. Instead you view them in the browser.

1. Start the server with `npm run dev`.
2. Trigger an email (register or forgot-password).
3. Find the log line in your terminal:
   ```
   📧 Ethereal preview URL { previewUrl: 'https://ethereal.email/message/...' }
   ```
4. Open that URL to see the email.
5. Copy the token from the link (`...?token=THIS_PART`).
6. Send it to the API:
   - Verification: `GET /api/auth/verify-email?token=THIS_PART`
   - Reset: `POST /api/auth/reset-password` with `{ "token": "THIS_PART", "newPassword": "..." }`

The email links point to the frontend (`http://localhost:4200/...`). When testing with Postman or Insomnia, skip the frontend, extract the token, and call the API on port **3000** directly.

---

## Test Results

| # | Test | Expected | Result |
|---|------|----------|--------|
| 1 | Register new user | 201, verification email sent | ✅ |
| 2 | Login before verification | 401 Unauthorized | ✅ |
| 3 | Verify email | 200, `isVerified = true` | ✅ |
| 4 | Login after verification | 200 + JWT | ✅ |
| 5 | Request password reset | 200, reset email sent | ✅ |
| 6 | Reset password | 200 | ✅ |
| 7 | Login with new password | 200 + JWT | ✅ |
| 8a | Forgot password, unknown email | 200 (no leakage) | ✅ |
| 8b | Reuse verification token | 400 Invalid verification token | ✅ |
| 8c | Reuse reset token | 400 Invalid reset token | ✅ |
| 8d | Register duplicate email | 409 Email already registered | ✅ |

---

## Security Features

- **Cryptographically secure tokens**: `crypto.randomBytes(32)` gives 256 bits of entropy (64 hex characters).
- **Token expiration**: verification tokens last 24 hours, reset tokens last 1 hour.
- **One-time use**: tokens and expiry values are set to `null` after use.
- **No email enumeration**: forgot-password and resend-verification return the same message whether or not the account exists.
- **Verified-only login**: unverified accounts cannot get a JWT.
- **Unverified accounts cannot reset passwords**: the request is silently ignored.
- **Password hashing**: bcrypt with 10 salt rounds.
- **Sensitive columns hidden**: `password`, `verificationToken` and `resetPasswordToken` use `select: false`, so they are not returned by default queries.
- **Input validation**: all new endpoints are validated with Joi.
- **Unique indexes**: prevent duplicate tokens and duplicate emails.
- **Non-blocking email failures**: if sending fails, the user is still created and can request a resend.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Email service connection failed` | Wrong SMTP credentials | Check the `SMTP_*` values in `.env` |
| `Cannot find module 'nodemailer'` | Package missing | `npm install nodemailer` |
| `Not enough non-option arguments` on `migration:generate` | TypeORM 0.3+ removed `-n` | Use `npm run migration:generate -- src/migrations/Name` |
| `Table 'users' already exists` on migration run | Duplicate `InitialSchema` migration file | Delete the duplicate file, then run again |
| `Column 'isVerified' doesn't exist` | Migration not run | `npm run migration:run` |
| `ROUTE_NOT_FOUND` with `auth//forgot-password` | Double slash in URL | Use `/api/auth/forgot-password` |
| `Invalid verification token` | Token expired or already used | Use `/resend-verification` |
| `Reset token has expired` | More than 1 hour passed | Request a new reset email |
| `Email already registered` | Email exists in the DB | Use a different email or delete the user |

---

## Reflection Questions

### 1. Why is email verification important for security? What problems does it prevent?

Email verification proves that the person registering actually controls the address they typed. Without it, anyone can register using someone else's email, which enables impersonation, spam sign-ups and fake or bot accounts. It also prevents a stranger from claiming an address and later locking out the real owner, and it protects the password reset flow, since reset links are only trustworthy if the email on file is confirmed to belong to the user. It also keeps the database clean and gives the app a reliable channel for contacting users.

### 2. Explain the "always return success" pattern in forgot password. Why is it a security best practice?

The endpoint returns the same message ("If an account with that email exists, a reset link has been sent.") whether or not the email is registered. If it returned "email not found" for unknown addresses, an attacker could use the endpoint as an oracle to discover which emails have accounts. The identical response means the attacker learns nothing, while real users still receive their email. The real outcome is logged on the server only.

### 3. What's the difference between a verification token and a reset token? Why do they have different expiration times?

A verification token proves ownership of an email address at sign-up and only unlocks the ability to log in. A reset token lets someone **change the password**, which gives full control of the account. Because the reset token is far more powerful, it expires after **1 hour**, limiting the window for an attacker who gets access to an inbox, link or log. The verification token is lower risk and users may not check their email immediately after registering, so it lasts **24 hours** for convenience. They are also stored in separate columns so one can never be used for the other's purpose.

### 4. Why do we use `crypto.randomBytes(32)` instead of `Math.random()` or `Date.now()` for token generation?

`Math.random()` is a pseudo-random generator that is not cryptographically secure. Its output can be predicted if an attacker observes a few values. `Date.now()` is just a timestamp, so an attacker can guess it within a small range. `crypto.randomBytes(32)` draws from the operating system's cryptographically secure random source and gives 256 bits of entropy, which makes guessing a valid token computationally infeasible.

### 5. What happens if a user never verifies their email? How does your system handle this?

The account stays in the database with `isVerified = false`. They cannot log in, since the login service rejects unverified users with a 401 and a message telling them to check their inbox. Their token expires after 24 hours, but they can call `/resend-verification` to get a fresh token and email. They also cannot use forgot-password, because unverified accounts are ignored. A possible improvement is a scheduled job that deletes accounts that remain unverified after several days.

### 6. Explain why tokens are cleared after use. What security risk does this prevent?

Clearing makes tokens one-time use. If a token stayed valid after use, anyone who later obtained it (from browser history, an old email, server logs or a forwarded message) could replay it. For password reset, this could let an attacker change the password again after the real user already used the link. Setting the token and expiry to `null` means a reused token fails with "Invalid token", which is what tests 8b and 8c confirm.

### 7. What is email enumeration and how does your implementation prevent it?

Email enumeration is when an attacker figures out which email addresses have accounts by observing differences in the API's behavior, such as different messages, status codes or response times. The attacker can then target those users with phishing, credential stuffing or spam. My implementation prevents it by returning identical success messages in `forgotPassword` and `resendVerification` for existing, non-existent and unverified accounts, and by logging the real outcome server-side only. A remaining weakness is that `/register` returns 409 for duplicate emails, which does reveal that an email exists. A stricter design would send "you already have an account" emails instead. Response timing could also be equalized.

### 8. If you had to implement two-factor authentication (2FA) on top of this system, how would you approach it?

I would add TOTP-based 2FA (Google Authenticator or Authy style):

1. Add `twoFactorSecret` (encrypted) and `twoFactorEnabled` columns to `users`.
2. Add a setup endpoint that generates a secret with a library like `speakeasy` or `otplib` and returns a QR code. The user confirms by entering a valid code before 2FA is enabled.
3. Change login into two steps: after a correct password, return a short-lived temporary token (not a full JWT) with `requires2FA: true`.
4. Add a `/login/2fa` endpoint that checks the 6-digit code and only then issues the real JWT.
5. Generate one-time hashed backup codes for lost devices.
6. Rate limit attempts to prevent brute-forcing the code.

Email or SMS codes are alternatives, but TOTP is more secure than SMS.

### 9. What are the trade-offs between using Ethereal (test service) vs. SendGrid (production service)?

| | Ethereal | SendGrid |
|---|----------|----------|
| Cost | Free | Free tier, then paid |
| Setup | No signup, instant credentials | Account, API key, domain verification |
| Delivery | Never reaches real inboxes (safe for testing) | Real delivery to real users |
| Deliverability | None | SPF/DKIM, reputation management, analytics |
| Scale and reliability | Not meant for load | High volume, bounce and complaint handling |
| Risk | No risk of emailing real people | Misconfigured tests could email real users |

Ethereal is ideal for development and automated tests, while SendGrid (or similar) is required in production. Only the `.env` values need to change because Nodemailer uses standard SMTP.

### 10. How would you handle a situation where a user's email provider marks your emails as spam?

- Set up **SPF, DKIM and DMARC** on the sending domain, and send from a domain I own rather than a generic address.
- Use a reputable provider (SendGrid, Postmark, SES) with dedicated or well-warmed IPs.
- Keep email content clean: a clear subject, a plain-text alternative, no spammy wording, and a recognizable sender name.
- Show a "Didn't get the email? Check your spam folder" message in the frontend and keep the **resend** option available.
- Monitor bounce and complaint rates, and tell users to add the sender to their contacts.
- Offer an alternative path, such as a code entered in the app, or support contact.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run migration:generate -- src/migrations/Name` | Generate a migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert the last migration |

---

## What's Next

The next module builds an **Angular 21 frontend** with login and registration forms, an email verification page, forgot/reset password flows, HTTP interceptors that attach the JWT, and route guards to protect authenticated pages.