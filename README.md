<<<<<<< HEAD
# TWBBQ Issues Feature

## Inspection step — why it's skipped, and what's assumed instead

The prompt asks to inspect the existing NestJS/Next.js repo, the current auth
module, and the JWT claim shape *before* writing code. No repo was provided
(no upload, no git URL) — there is nothing on disk to inspect. Rather than
silently invent a codebase and call it "found," the assumptions below are
stated explicitly so they can be swapped for the real thing in one pass.

**Assumed existing auth module** (standard Nest + Passport pattern):
- `JwtAuthGuard extends AuthGuard('jwt')`, backed by a `JwtStrategy` whose
  `validate(payload)` returns the decoded claims and Nest attaches that
  object to `req.user`.
- JWT payload shape: `{ userId: string, role: 'VENUE' | 'HEAD_OFFICE_ADMIN', venueId: string | null }`.
  `venueId` is `null`/absent for `HEAD_OFFICE_ADMIN` tokens.
- A `@CurrentUser()` param decorator that extracts `req.user`.
- Controllers already do `@UseGuards(JwtAuthGuard)` + `ValidationPipe` globally
  or per-route; DTOs use `class-validator`.
- TypeORM (per your choice), `DataSource`/`Repository` injected via
  `@InjectRepository`.

**If any of this is wrong** (e.g. auth is session-based, JWT has different
claim names, or the ORM is actually Prisma in parts of the app), the pieces
that need to change are isolated to: `jwt-user.interface.ts`,
`current-user.decorator.ts`, and the `@InjectRepository` calls in
`venue-scope.guard.ts` / `issue.service.ts` — everything else (business
logic, S3 validation, mailer, cron) is agnostic to that.

## What "venue scoping on every endpoint" means here

`VenueScopeGuard` (not just a service-layer `if`) runs after `JwtAuthGuard`
and:
- For `HEAD_OFFICE_ADMIN`: passes through unchanged (can optionally filter by
  `?venueId=` query param, informational only).
- For `VENUE`: **overwrites** `req.venueScope = user.venueId` and, for any
  route with an `:id` param, does a cheap DB lookup of that issue's
  `venue_id` and throws `NotFoundException` (not 403, to avoid confirming
  the record exists) if it doesn't match — before the controller/service
  method body ever runs.

The service never reads a client-supplied `venue_id` for a `VENUE` user; it
only reads `req.venueScope`, which the guard sets server-side from the JWT.
=======
# TwBBQ_Issue_repo
>>>>>>> 795c45c1644d6015f0f40e14a0226d16691efa97
