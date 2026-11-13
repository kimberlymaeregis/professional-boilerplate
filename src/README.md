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