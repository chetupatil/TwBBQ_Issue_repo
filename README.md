# TWBBQ Issues

A backend service for managing venue issues, including issue creation, assignment, priority, status, due dates, venue-level access control, and authentication.

The project uses **NestJS, TypeScript, PostgreSQL, TypeORM, JWT authentication, Docker, MailHog, and Jest**.

---

## 1. Tech Stack

### Backend

* Node.js
* TypeScript
* NestJS
* TypeORM
* PostgreSQL 16
* JWT Authentication
* Jest
* Docker / Docker Compose
* MailHog

### API

The backend exposes REST APIs for:

* Creating issues
* Listing issues
* Getting an issue by ID
* Updating issues
* Reassigning issues

---

## 2. Project Structure

```text
twbbq-issues/
│
├── backend/
│   ├── src/
│   ├── test/
│   ├── migrations/
│   ├── package.json
│   ├── docker-compose.yml
│   └── ...
│
├── frontend/
│   └── ...
│
├── .gitignore
└── README.md
```

> The exact frontend structure may vary depending on the current frontend implementation.

---

# 3. Prerequisites

Install the following before running the project:

* Node.js
* npm
* Docker Desktop
* Git

Check installations:

```bash
node --version
npm --version
docker --version
git --version
```

---

# 4. Clone the Repository

```bash
git clone git@github.com:chetupatil/TwBBQ_Issue_repo.git
cd twbbq-issues
```

If using HTTPS:

```bash
git clone https://github.com/chetupatil/TwBBQ_Issue_repo.git
cd twbbq-issues
```

---

# 5. Backend Setup

Go to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# 6. Environment Configuration

Create your local environment file from the example file if the project provides one:

```bash
cp .env.example .env
```

Update the `.env` file with your local configuration.

Example structure:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_DATABASE=<your-db-name>

JWT_SECRET=<your-local-secret>
```

### Important

Never commit:

```text
.env
.env.*
```

except:

```text
.env.example
```

Do not commit:

* JWT tokens
* passwords
* API keys
* database credentials
* private keys
* production secrets

---

# 7. Start PostgreSQL and MailHog

The Docker Compose file is located in the backend directory.

From:

```bash
cd backend
```

run:

```bash
docker compose up -d
```

This starts the required containers.

The project currently uses:

* PostgreSQL 16
* MailHog

Check running containers:

```bash
docker ps
```

Expected containers include:

```text
backend-postgres-1
backend-mailhog-1
```

### Stop containers

```bash
docker compose down
```

### Stop containers and remove volumes

Use this only when you intentionally want to remove local database data:

```bash
docker compose down -v
```

---

# 8. Run Database Migrations

Make sure you are inside:

```bash
backend/
```

Run:

```bash
npm run migration:run
```

The migration creates the database structure.

The successful migration creates tables including:

```text
migrations
venue
user
issue
```

It also creates indexes including:

```text
idx_issue_venue_id
idx_issue_assigned_user_id
idx_issue_due_date_status
```

Foreign-key relationships are created between:

```text
issue.venue_id -> venue.venue_id
issue.assigned_user_id -> user.user_id
```

Expected successful output includes:

```text
Migration CreateStubVenueAndUserTables1725500000000 has been executed successfully.
Migration CreateIssueTable1725600000000 has been executed successfully.
COMMIT
```

---

# 9. Seed the Database

After migrations complete, run:

```bash
npm run seed
```

The seed script creates sample data for local development.

The seeded data includes:

### Venues

* Venue A
* Venue B

### Users

* Venue A user
* Venue B user
* Head Office Admin

Example local users:

```text
venue-a-user@twbbq.local
venue-b-user@twbbq.local
admin@twbbq.local
```

The seed process also generates authentication tokens for local API testing.

### Security

Do not copy generated JWT tokens into:

* GitHub
* README
* source code
* `.env.example`
* screenshots
* public documentation

Use placeholders instead:

```text
<VENUE_A_TOKEN>
<VENUE_B_TOKEN>
<ADMIN_TOKEN>
```

---

# 10. Start the Backend

Run:

```bash
npm run start:dev
```

The backend starts in development mode.

The application listens on:

```text
http://localhost:3001
```

The available routes include:

```text
GET    /issues
GET    /issues/:id
POST   /issues
PATCH  /issues/:id
PATCH  /issues/:id/reassign
```

Expected startup message:

```text
TWBBQ Issues API listening on http://localhost:3001
```

Keep this terminal running.

---

# 11. API Authentication

The API uses JWT authentication.

For protected endpoints, provide the JWT token in the request header:

```text
Authorization: Bearer <TOKEN>
```

Example:

```bash
-H "Authorization: Bearer <VENUE_A_TOKEN>"
```

Never commit a real token to GitHub.

---

# 12. Create an Issue

Example request:

```bash
curl -X POST http://localhost:3001/issues \
  -H "Authorization: Bearer <VENUE_A_TOKEN>" \
  -F issueDesc="Broken fridge" \
  -F issuePriority=HIGH \
  -F assignedUserId="<VENUE_A_USER_ID>" \
  -F dueDate=2026-09-01
```

Example successful response:

```json
{
  "issueDesc": "Broken fridge",
  "issuePhotoLink": null,
  "issuePriority": "HIGH",
  "venueId": "<VENUE_ID>",
  "assignedUserId": "<USER_ID>",
  "dueDate": "2026-09-01T00:00:00.000Z",
  "status": "Open",
  "issueComments": null,
  "createdUser": "<USER_ID>",
  "updatedUser": "<USER_ID>",
  "issueId": "<ISSUE_ID>",
  "createdDate": "<CREATED_DATE>",
  "updatedDate": "<UPDATED_DATE>"
}
```

This confirms that the API successfully:

1. Authenticated the user.
2. Identified the user's venue.
3. Created the issue.
4. Assigned the issue.
5. Stored the priority.
6. Stored the due date.
7. Set the initial status to `Open`.
8. Stored audit information.

---

# 13. Important Due-Date Validation

When testing the API, use an appropriate future date if the application requires issues to have a future due date.

For example:

```bash
-F dueDate=2026-09-15
```

A date such as:

```text
2026-09-01
```

is already in the past relative to September 6, 2026.

---

# 14. Get Issues

Example:

```bash
curl http://localhost:3001/issues \
  -H "Authorization: Bearer <VENUE_A_TOKEN>"
```

The venue user should only receive issues belonging to their venue.

---

# 15. Get an Issue by ID

```bash
curl http://localhost:3001/issues/<ISSUE_ID> \
  -H "Authorization: Bearer <VENUE_A_TOKEN>"
```

Example:

```bash
curl http://localhost:3001/issues/57efe393-90a2-47f5-a7d6-dc3d9b7253a9 \
  -H "Authorization: Bearer <VENUE_A_TOKEN>"
```

Replace the ID with the issue ID generated by your local environment.

---

# 16. Update an Issue

The API supports:

```text
PATCH /issues/:id
```

Example:

```bash
curl -X PATCH http://localhost:3001/issues/<ISSUE_ID> \
  -H "Authorization: Bearer <VENUE_A_TOKEN>" \
  -F issuePriority=MEDIUM
```

Use the fields supported by the current API implementation.

---

# 17. Reassign an Issue

The API supports:

```text
PATCH /issues/:id/reassign
```

Example:

```bash
curl -X PATCH http://localhost:3001/issues/<ISSUE_ID>/reassign \
  -H "Authorization: Bearer <VENUE_A_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedUserId": "<USER_ID>"
  }'
```

Replace the IDs with values from your local seeded database.

---

# 18. Venue-Level Access Control

The application implements venue-level isolation.

A `VENUE` user should only be able to access issues belonging to their own venue.

The JWT contains the user's venue information.

The venue scope is enforced by the application rather than trusting a client-provided venue ID.

This prevents a user from simply changing:

```text
venueId
```

in a request to access another venue's issues.

---

# 19. Security Behaviour

The test suite verifies that:

### Cross-venue access

A venue user trying to fetch another venue's issue receives:

```text
404
```

instead of:

```text
403
```

This avoids exposing information about whether an issue exists in another venue.

### Venue filtering

A venue user cannot override their venue scope by supplying another:

```text
venueId
```

in the request.

### Missing venue filter

Even if the client does not provide a venue filter, the backend applies the venue from the authenticated user's JWT.

### Head Office Admin

A:

```text
HEAD_OFFICE_ADMIN
```

can access issues across venues.

---

# 20. Run Tests

From the backend directory:

```bash
npm test
```

The current test suite passes successfully.

Expected result:

```text
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        approximately 6 seconds
```

Current tests:

```text
✓ blocks a VENUE user fetching another venue's issue by id (404, not 403)

✓ allows a VENUE user fetching their own venue's issue by id

✓ returns 404 for a non-existent issue id, same as a cross-venue one (no enumeration signal)

✓ forces venueScope to the JWT's venueId on list requests, ignoring a client-supplied venueId query param

✓ forces venueScope even when the client omits any venue filter at all

✓ lets HEAD_OFFICE_ADMIN through untouched, including across venues
```

Current result:

```text
6 tests passed
6 tests total
1 test suite passed
```

---

# 21. MailHog

MailHog is used for local email testing.

It runs through Docker Compose.

After starting Docker:

```bash
docker compose up -d
```

MailHog is available through its web interface on the configured MailHog port.

Check the Docker Compose configuration if you need the exact mapped port:

```bash
docker compose ps
```

MailHog allows development emails to be viewed locally without sending real emails.

---

# 22. Useful Docker Commands

### Check containers

```bash
docker ps
```

### Check all containers

```bash
docker ps -a
```

### View backend Docker logs

```bash
docker compose logs
```

### View PostgreSQL logs

```bash
docker compose logs postgres
```

### View MailHog logs

```bash
docker compose logs mailhog
```

### Stop services

```bash
docker compose down
```

### Restart services

```bash
docker compose restart
```

### Stop and remove database volume

```bash
docker compose down -v
```

---

# 23. Useful npm Commands

From the backend directory:

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run start:dev
```

### Run tests

```bash
npm test
```

### Run database migrations

```bash
npm run migration:run
```

### Run seed

```bash
npm run seed
```

---

# 24. Complete Local Startup

For a fresh local environment, follow these steps.

### Terminal 1 — Backend dependencies

```bash
cd twbbq-issues/backend
npm install
```

### Terminal 1 — Start Docker

```bash
docker compose up -d
```

### Terminal 1 — Run migrations

```bash
npm run migration:run
```

### Terminal 1 — Seed database

```bash
npm run seed
```

### Terminal 1 — Start API

```bash
npm run start:dev
```

The API should be available at:

```text
http://localhost:3001
```

---

# 25. Run Tests

Open another terminal:

```bash
cd twbbq-issues/backend
npm test
```

Expected:

```text
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

---

# 26. Test the API

Use the JWT generated by the seed script.

For example:

```bash
curl -X POST http://localhost:3001/issues \
  -H "Authorization: Bearer <VENUE_A_TOKEN>" \
  -F issueDesc="Broken fridge" \
  -F issuePriority=HIGH \
  -F assignedUserId="<VENUE_A_USER_ID>" \
  -F dueDate=2026-09-15
```

A successful response should contain:

```json
{
  "issueDesc": "Broken fridge",
  "issuePriority": "HIGH",
  "status": "Open",
  "venueId": "<VENUE_ID>",
  "assignedUserId": "<USER_ID>",
  "issueId": "<ISSUE_ID>"
}
```

---

# 27. Frontend Setup

First identify the frontend package location:

```bash
cd twbbq-issues
find . -name package.json
```

If the frontend has its own `package.json`, move into that directory.

For example:

```bash
cd frontend
npm install
```

Then check the available scripts:

```bash
cat package.json
```

Run the script defined by the project, for example:

```bash
npm run dev
```

or:

```bash
npm start
```

Use the URL printed by the frontend development server.

> Do not assume the frontend port until it is confirmed by the frontend startup output.

---

# 28. Troubleshooting

## PostgreSQL is not running

Check:

```bash
docker ps
```

If PostgreSQL is not running:

```bash
docker compose up -d
```

---

## Migration fails

Check that PostgreSQL is running:

```bash
docker compose ps
```

Then check PostgreSQL logs:

```bash
docker compose logs postgres
```

---

## Port 3001 is already in use

Check which process is using the port:

```bash
lsof -i :3001
```

Stop the process if appropriate, then restart the backend.

---

## npm install fails

Try:

```bash
rm -rf node_modules
npm install
```

Do not delete `package-lock.json` unless there is a specific reason to regenerate dependencies.

---

## Docker Compose warning about `version`

If Docker shows:

```text
the attribute `version` is obsolete
```

remove the old `version:` field from `docker-compose.yml`.

This warning does not prevent Docker Compose from starting the services.

---

## Frontend `package.json` not found

If:

```bash
cd frontend
npm install
```

returns:

```text
ENOENT: no such file or directory
```

verify where the package files are located:

```bash
find . -name package.json
```

Then run npm commands from the directory containing the appropriate `package.json`.

---

# 29. Git Safety

Before committing:

```bash
git status
```

Make sure secrets are not included.

Recommended `.gitignore`:

```gitignore
# Dependencies
node_modules/

# Environment variables / secrets
.env
.env.*
!.env.example

# Build
dist/
build/
coverage/

# Logs
*.log
npm-debug.log*

# macOS
.DS_Store

# IDE
.vscode/
.idea/

# Private keys / certificates
*.pem
*.key
*.crt
```

---

# 30. Check What Will Be Committed

Before:

```bash
git add .
```

check:

```bash
git status
```

You can also check staged files:

```bash
git diff --cached
```

Never commit:

```text
.env
JWT tokens
passwords
API keys
private keys
production credentials
node_modules
```

---

# 31. Git Workflow

Check status:

```bash
git status
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Add TWBBQ issues implementation"
```

Pull changes:

```bash
git pull origin main --allow-unrelated-histories --no-rebase
```

Push:

```bash
git push -u origin main
```

If the GitHub repository already contains commits, do not immediately use:

```bash
git push --force
```

because force-pushing can overwrite remote history.

---

# 32. Application URLs

### Backend API

```text
http://localhost:3001
```

### API endpoints

```text
GET    http://localhost:3001/issues
GET    http://localhost:3001/issues/:id
POST   http://localhost:3001/issues
PATCH  http://localhost:3001/issues/:id
PATCH  http://localhost:3001/issues/:id/reassign
```

### MailHog

Use the port configured in:

```text
backend/docker-compose.yml
```

---

# 33. Development Workflow

The recommended development workflow is:

```text
Clone repository
      ↓
Install dependencies
      ↓
Configure .env
      ↓
Start PostgreSQL + MailHog
      ↓
Run migrations
      ↓
Run seed
      ↓
Start backend
      ↓
Start frontend
      ↓
Run API tests
      ↓
Run Jest tests
      ↓
Commit changes
      ↓
Push to GitHub
```

---

# 34. Validation Checklist

Before submitting the project, verify:

* [ ] Docker Desktop is running
* [ ] PostgreSQL container is running
* [ ] MailHog container is running
* [ ] Database migrations succeed
* [ ] Seed succeeds
* [ ] Backend starts successfully
* [ ] API is available on port `3001`
* [ ] Issue creation works
* [ ] Issue listing works
* [ ] Issue retrieval works
* [ ] Issue update works
* [ ] Issue reassignment works
* [ ] Venue isolation works
* [ ] Admin access works
* [ ] Cross-venue access returns `404`
* [ ] Jest tests pass
* [ ] No JWT tokens are committed
* [ ] No `.env` files are committed
* [ ] No passwords/API keys are committed
* [ ] `.DS_Store` is ignored
* [ ] `node_modules` is ignored

---

# 35. Current Test Status

The backend test suite currently passes:

```text
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
```

This confirms the implemented venue-scope authorization behaviour is covered by automated tests.

---

# 36. Summary

TWBBQ Issues provides a venue-aware issue management API with:

* JWT authentication
* Venue-level authorization
* Issue creation
* Issue assignment
* Issue priority
* Issue status
* Issue due dates
* Issue updates
* Issue reassignment
* PostgreSQL persistence
* TypeORM migrations
* Seed data
* Dockerized PostgreSQL and MailHog
* Automated Jest tests
* Protection against cross-venue issue enumeration
* Head Office Admin access across venues

The backend can be started locally with:

```bash
cd backend
docker compose up -d
npm run migration:run
npm run seed
npm run start:dev
```

Then run the automated tests with:

```bash
npm test
```

Current test result:

```text
6 passed, 6 total
```
