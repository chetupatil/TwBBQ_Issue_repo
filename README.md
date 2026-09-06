# TWBBQ Issues

A venue-aware maintenance and operational issue management application for Third Wave BBQ.

The application allows authenticated users to create, manage, assign and track maintenance issues while enforcing strict venue-level access control.

The implementation focuses on:

* Authentication and authorization
* Venue-level data isolation
* Issue management
* PostgreSQL persistence
* Database migrations
* Automated security testing
* Docker-based local development
* Email testing with MailHog
* Safe deployment and rollback considerations

---

## Tech Stack

### Frontend

* Next.js
* TypeScript

### Backend

* NestJS
* TypeScript
* REST APIs
* JWT authentication
* TypeORM

### Database

* PostgreSQL 16

### Testing

* Jest
* Supertest

### Infrastructure

* Docker
* Docker Compose
* Ubuntu VPS

### Email Development

* MailHog

---

# Features

The application supports:

* User authentication
* Create issues
* View issues
* Update issues
* Assign issues to users
* Set issue priority
* Set due dates
* Update issue status
* Venue-level access control
* Head Office access across venues
* PostgreSQL persistence
* Database migrations
* Seed data
* Automated authorization tests
* Local email testing with MailHog

---

# Architecture

```text
                         ┌──────────────────┐
                         │     Next.js      │
                         │    Frontend      │
                         └────────┬─────────┘
                                  │
                             REST / JWT
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     NestJS       │
                         │     Backend      │
                         └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         │                  │
                         ▼                  ▼
                  ┌─────────────┐    ┌─────────────┐
                  │ PostgreSQL  │    │   MailHog   │
                  │  Database   │    │ Email Inbox │
                  └─────────────┘    └─────────────┘
```

The frontend is not treated as a security boundary.

Authorization is enforced by the backend before data is returned or modified.

---

# Project Structure

```text
TwBBQ_Issue_repo/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── issues/
│   │   ├── users/
│   │   ├── venues/
│   │   └── ...
│   │
│   ├── test/
│   ├── migrations/
│   ├── package.json
│   ├── docker-compose.yml
│   └── ...
│
├── frontend/
│   └── ...
│
├
├── mailhog-dashboard.png
├── issue-list.png
├── create-issue.png
│
├── .gitignore
└── README.md
```

> The project structure above should match the actual files committed to the repository.

---

# Screenshots

## Issue List

The issue list displays issues available to the authenticated user according to their venue permissions.

![Issue List](/issue-list.png)

---

## Create Issue

The create issue screen allows an authorized user to provide the issue description, priority, assignment and due date.

![Create Issue](/create-issue.png)

---

## MailHog Dashboard

MailHog is used during local development to capture outgoing emails without sending real emails.

The MailHog dashboard can be used to verify the recipient, subject and email content.

![MailHog Dashboard](/mailhog-dashboard.png)

MailHog is particularly useful for testing email functionality locally without sending messages to real users.

---

# Local Development

## Prerequisites

Install:

* Node.js
* npm
* Docker Desktop / Docker Engine
* Git

Verify the installation:

```bash
node --version
npm --version
docker --version
git --version
```

---

# Clone the Repository

```bash
git clone https://github.com/chetupatil/TwBBQ_Issue_repo.git
cd TwBBQ_Issue_repo
```

---

# Backend Setup

```bash
cd backend
npm install
```

---

# Environment Configuration

Create a local environment file:

```bash
cp .env.example .env
```

Configure the required local values.

Example:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_DATABASE=<your-db-name>

JWT_SECRET=<your-local-secret>
```

## Security

Never commit:

* `.env`
* database passwords
* JWT secrets
* access tokens
* API keys
* private keys
* production credentials

Only `.env.example` should be committed.

---

# Start PostgreSQL and MailHog

From the backend directory:

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs
```

Stop the containers:

```bash
docker compose down
```

To remove local containers and database volumes:

```bash
docker compose down -v
```

> `docker compose down -v` should only be used when intentionally removing local database data.

---

# Database Migration

Run the database migrations:

```bash
npm run migration:run
```

The database contains the entities required for issue management, including:

* Users
* Venues
* Issues

Issues are associated with a venue and can be associated with an assigned user.

---

# Seed Data

Run:

```bash
npm run seed
```

The seed creates development data for testing different access levels, including venue users and Head Office users.

Example development users:

```text
venue-a-user@twbbq.local
venue-b-user@twbbq.local
admin@twbbq.local
```

Development credentials/tokens should never be used in production.

---

# Start the Backend

```bash
npm run start:dev
```

The API runs on:

```text
http://localhost:3001
```

---

# API Endpoints

| Method | Endpoint               | Purpose           |
| ------ | ---------------------- | ----------------- |
| GET    | `/issues`              | List issues       |
| GET    | `/issues/:id`          | Get an issue      |
| POST   | `/issues`              | Create an issue   |
| PATCH  | `/issues/:id`          | Update an issue   |
| PATCH  | `/issues/:id/reassign` | Reassign an issue |

Protected endpoints require:

```http
Authorization: Bearer <TOKEN>
```

---

# Create an Issue

Example:

```bash
curl -X POST http://localhost:3001/issues \
  -H "Authorization: Bearer <VENUE_A_TOKEN>" \
  -F issueDesc="Broken fridge" \
  -F issuePriority=HIGH \
  -F assignedUserId="<USER_ID>" \
  -F dueDate=2026-09-15
```

The backend authenticates the user and determines the user's venue from trusted authentication information.

The client cannot choose another venue simply by supplying a different `venueId`.

---

# List Issues

```bash
curl http://localhost:3001/issues \
  -H "Authorization: Bearer <TOKEN>"
```

### Venue User

A venue user can only access issues belonging to their own venue.

### Head Office

A Head Office user can access issues across venues according to their role.

---

# Get an Issue

```bash
curl http://localhost:3001/issues/<ISSUE_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

The backend validates authorization before returning the issue.

---

# Update an Issue

Example:

```bash
curl -X PATCH http://localhost:3001/issues/<ISSUE_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -F issuePriority=MEDIUM
```

Authorization is checked before the issue is modified.

---

# Reassign an Issue

```bash
curl -X PATCH http://localhost:3001/issues/<ISSUE_ID>/reassign \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedUserId": "<USER_ID>"
  }'
```

The backend validates that the authenticated user is permitted to perform the operation.

---

# Security and Venue Isolation

Venue isolation is one of the most important security requirements.

A venue employee must only be able to access issues belonging to their own venue.

The backend therefore does **not** trust a client-supplied `venueId` when determining authorization.

Instead:

```text
Authenticated User
        │
        ▼
JWT / Authentication Context
        │
        ▼
Determine User's Venue
        │
        ▼
Apply Venue Scope
        │
        ▼
Query / Modify Issue
```

The frontend may filter or display information, but the backend remains the final security boundary.

---

# Cross-Venue Access Protection

An unsafe implementation could use a client-controlled value:

```javascript
const venueId = req.query.venueId;

const issues = await db.issue.findMany({
  where: venueId ? { venueId } : {}
});
```

This is unsafe because a venue user could potentially modify the request and provide another venue's ID.

For example:

```text
GET /api/issues?venueId=<ANOTHER_VENUE>
```

The backend should instead derive the venue scope from trusted authentication information.

This prevents users from bypassing authorization by changing request parameters.

---

# 404 Behaviour for Cross-Venue Issues

When a venue user attempts to access an issue belonging to another venue, the application returns:

```text
404 Not Found
```

rather than revealing the existence of the resource through a different response.

This also helps reduce unnecessary information disclosure and issue enumeration.

Head Office users are permitted to access issues across venues.

---

# Automated Tests

Run:

```bash
npm test
```

The security-focused tests cover:

```text
✓ blocks a VENUE user fetching another venue's issue by id (404, not 403)

✓ allows a VENUE user fetching their own venue's issue by id

✓ returns 404 for a non-existent issue id

✓ ignores a client-supplied venueId when determining venue scope

✓ applies venue scope even when the client does not provide a venue filter

✓ allows HEAD_OFFICE_ADMIN to access issues across venues
```

The tests specifically protect against regression of the venue authorization rules.

Example result:

```text
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

---

# Email Testing with MailHog

MailHog is used as the local email testing environment.

Start the service:

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

MailHog captures application-generated emails so they can be inspected locally.

The dashboard allows developers to verify:

* Recipient
* Subject
* Email body
* Email formatting
* Email generation behaviour

No real emails are sent during local development.

---

# Overdue Issue Reminder Design

The requirement is for overdue issues to generate a daily reminder.

A production implementation can use a scheduled NestJS job or external scheduler:

```text
Daily Scheduler
      │
      ▼
Find Overdue Issues
      │
      ▼
Exclude Completed / Closed Issues
      │
      ▼
Identify Responsible User
      │
      ▼
Send Reminder Email
      │
      ▼
Log / Record Result
```

The reminder process should run independently from normal issue API requests.

MailHog is used for local email testing; production would use the configured email delivery service.

---

# Photograph Storage

Photographs should not be stored as large binary objects directly in PostgreSQL for a production system.

A production approach would use private object storage such as S3-compatible storage and store a reference/metadata in PostgreSQL.

Example metadata:

```text
issueId
objectKey
fileName
contentType
fileSize
createdAt
```

Uploads should be protected with:

* File type validation
* File size limits
* Generated object names
* Authorization checks
* Private storage where appropriate
* Signed URLs when direct access is required

The application should never rely on a client-supplied file path as an authorization mechanism.

---

# Deployment Strategy

The feature should be deployed without unnecessarily risking the existing production application or database.

Recommended workflow:

```text
Feature Branch
      │
      ▼
Pull Request
      │
      ▼
Code Review
      │
      ▼
Automated Tests
      │
      ▼
Database Backup
      │
      ▼
Build Docker Image
      │
      ▼
Run Migration
      │
      ▼
Deploy New Version
      │
      ▼
Health Check
      │
      ▼
Smoke Test
      │
      ▼
Monitor Logs
```

## Production Considerations

* Use a separate Git branch for feature development.
* Require code review before merging.
* Run automated tests before deployment.
* Back up PostgreSQL before database migrations.
* Use version-controlled migrations.
* Store secrets outside Git.
* Use production environment variables securely.
* Deploy a specific Docker image/version.
* Verify application health after deployment.
* Monitor application and database logs.
* Perform smoke tests after release.

---

# Database Migration Safety

Production migrations should be designed carefully.

Where possible, migrations should be backward-compatible so that an application rollback does not immediately require a destructive database rollback.

Before running a production migration:

1. Confirm the migration has been tested.
2. Back up the database.
3. Review the migration SQL/schema changes.
4. Confirm application compatibility.
5. Apply the migration.
6. Verify the application health.

---

# Rollback Strategy

If a release fails:

```text
Deployment Failure
        │
        ▼
Stop / Isolate New Version
        │
        ▼
Deploy Previous Known-Good Image
        │
        ▼
Run Health Checks
        │
        ▼
Run Smoke Tests
        │
        ▼
Monitor Logs
        │
        ▼
Investigate Before Retrying
```

Database restoration should only be performed when necessary and after understanding the impact.

---

# Production Incident Response

## Scenario

A venue manager reports that they can see an issue belonging to another restaurant.

At approximately the same time, some users receive HTTP 500 errors.

## Immediate Priority

I would prioritize the **cross-venue data exposure** because it is a security and data-isolation issue.

Immediate actions:

1. Confirm the reported behaviour.
2. Identify the affected endpoint and user.
3. Prevent further unauthorized access if necessary.
4. Preserve relevant application/access logs.
5. Determine the scope of potential exposure.
6. Reproduce the issue safely.
7. Inspect authentication and authorization logic.
8. Review database queries and venue filters.
9. Investigate the HTTP 500 errors separately.
10. Determine whether the errors originate from application code, database, permissions, configuration or deployment.
11. Implement the security correction.
12. Add or strengthen regression tests.
13. Review the change.
14. Deploy using a controlled release process.
15. Monitor the application after deployment.

The key principle is to stop unauthorized data access before treating the HTTP 500 errors as the primary issue.

---

# AI-Assisted Development

AI tools were used as development and review assistants during this exercise.

## AI Tools Used

* ChatGPT
* Codex / AI coding assistance

## How AI Was Used

AI assistance was used for:

* Requirements analysis
* Architecture discussion
* Identifying security edge cases
* API design review
* Test scenario generation
* Troubleshooting
* Documentation improvement
* Reviewing implementation approaches

AI-generated suggestions were reviewed before being accepted.

## Human Decision-Making

The final architecture, implementation decisions, security model and testing approach remained my responsibility.

One important example was venue-level authorization.

A client-controlled `venueId` should not be trusted to determine what data a venue user can access.

I chose to derive venue scope from the authenticated user's trusted context and enforce that restriction on the backend.

I then verified this behaviour with automated tests covering cross-venue access, own-venue access, client-supplied venue filters and Head Office access.

The purpose of using AI was to improve development speed and challenge my assumptions while keeping engineering responsibility and final decisions with me.

---

# Development Workflow

The development process followed these stages:

```text
Requirements
    │
    ▼
Identify Assumptions
    │
    ▼
Design Database and Authorization
    │
    ▼
Implement Backend APIs
    │
    ▼
Implement Frontend
    │
    ▼
Add Security Controls
    │
    ▼
Add Automated Tests
    │
    ▼
Run Application Locally
    │
    ▼
Review AI Suggestions
    │
    ▼
Manual Testing
    │
    ▼
Deployment Review
```

---

# Code Review Checklist

Before accepting AI-generated or manually written changes, I would review:

### Functionality

* Does the implementation satisfy the requirements?
* Are validation rules correct?
* Are error responses appropriate?
* Are edge cases handled?

### Security

* Is authentication required?
* Is authorization enforced on the backend?
* Can a user access another venue's issues?
* Can a client manipulate `venueId`?
* Can a user update another venue's issue?
* Are uploaded files validated?
* Are secrets excluded from source control?

### Database

* Are migrations correct?
* Are relationships correct?
* Are indexes appropriate?
* Could queries return excessive data?
* Are transactions required?

### Dependencies

I would review:

```bash
npm ls
```

and inspect:

```text
package.json
package-lock.json
```

I would check whether each newly added dependency is necessary, maintained and appropriate for the feature.

I would also look for unexpected packages, duplicate dependencies or packages unrelated to the requested functionality.

### Testing

Run:

```bash
npm test
```

and manually test:

* Login
* Issue creation
* Issue listing
* Issue update
* Issue reassignment
* Venue isolation
* Head Office access
* Invalid requests
* Unauthorized requests
* Email generation

---

# Useful Commands

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run start:dev
```

## Run Tests

```bash
npm test
```

## Run Database Migration

```bash
npm run migration:run
```

## Seed Database

```bash
npm run seed
```

## Start Docker Services

```bash
docker compose up -d
```

## Stop Docker Services

```bash
docker compose down
```

## View Docker Logs

```bash
docker compose logs
```

## View PostgreSQL Logs

```bash
docker compose logs postgres
```

## Check Running Containers

```bash
docker compose ps
```

---

# Troubleshooting

## PostgreSQL is not running

```bash
docker compose ps
docker compose up -d
```

Check PostgreSQL logs:

```bash
docker compose logs postgres
```

---

## Migration fails

Verify PostgreSQL is running:

```bash
docker compose ps
```

Then inspect:

```bash
docker compose logs postgres
```

---

## Port 3001 is already in use

```bash
lsof -i :3001
```

Stop the conflicting process if appropriate and restart the backend.

---

## npm installation problems

```bash
rm -rf node_modules
npm install
```

Avoid deleting `package-lock.json` unless there is a specific reason to regenerate dependencies.

---

# Git and Secret Safety

Before committing:

```bash
git status
```

Review changes:

```bash
git diff
```

Review staged changes:

```bash
git diff --cached
```

Never commit:

```text
.env
JWT tokens
Passwords
API keys
Private keys
Production credentials
node_modules
```

Recommended `.gitignore` entries:

```text
node_modules/
.env
.env.*
!.env.example
dist/
build/
coverage/
*.log
npm-debug.log*
.DS_Store
.vscode/
.idea/
*.pem
*.key
*.crt
```

---

# Validation Checklist

Before considering the feature ready:

* [ ] PostgreSQL starts successfully
* [ ] MailHog starts successfully
* [ ] Database migrations succeed
* [ ] Seed data loads successfully
* [ ] Backend starts successfully
* [ ] Frontend starts successfully
* [ ] Authentication works
* [ ] Issue creation works
* [ ] Issue listing works
* [ ] Issue retrieval works
* [ ] Issue update works
* [ ] Issue reassignment works
* [ ] Venue isolation works
* [ ] Head Office access works
* [ ] Cross-venue access is blocked
* [ ] Client-supplied venue IDs cannot bypass authorization
* [ ] Automated tests pass
* [ ] MailHog receives development emails
* [ ] No secrets are committed
* [ ] Dependencies have been reviewed
* [ ] Docker services are healthy
* [ ] Production deployment/rollback approach has been reviewed

---

# Summary

TWBBQ Issues is a venue-aware issue management application designed around secure backend authorization and maintainable development practices.

The most important security principle is:

> **Authorization is enforced by the backend using trusted authentication context; the client cannot choose which venue's data it is authorized to access.**

The project demonstrates:

* Next.js frontend
* NestJS backend
* PostgreSQL
* JWT authentication
* Venue-level authorization
* Head Office cross-venue access
* Issue management
* Database migrations
* Docker Compose
* MailHog email testing
* Jest security tests
* Production deployment considerations
* AI-assisted development with human review and technical ownership

## Quick Start

```bash
cd backend
npm install
docker compose up -d
npm run migration:run
npm run seed
npm run start:dev
```

Run the test suite:

```bash
npm test
```

Backend:

```text
http://localhost:3001
```
