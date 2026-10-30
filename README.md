# CampusHub API

A REST API for running a college: student records, courses and enrolment, attendance, the
library and the notice board. Built with **Node.js, Express and PostgreSQL**.

## Features

- **Accounts and roles:** students sign up themselves; teachers and admins are created by an admin.
  Sign-in uses short-lived JWTs, passwords are hashed with bcrypt, and sign-in is rate-limited.
- **Students:** a staff directory, plus a full record (contact and guardian details) that only the
  student themself and staff can see.
- **Courses and enrolment:** a course catalogue; students enrol themselves, full courses refuse new
  students.
- **Attendance:** teachers mark a whole class at once; students can see their own history.
- **Library:** issue and return books, a limit of 3 books per student, automatic late fines.
- **Notices:** announcements for everyone, students only or teachers only, with pinning.

## Project structure

```
src/
  app.js, server.js, routes.js   Express app, startup, route mounting
  config/                        settings from environment variables
  db/                            PostgreSQL pool and transactions
  middleware/                    sign-in check, role check, validation, errors, logging
  utils/                         passwords, tokens, access checks, errors
  modules/<feature>/             one folder per feature: *.routes.js + *.service.js
db/                              schema.sql and sample data
docs/api/                        endpoint reference, one page per feature
scripts/                         create-admin.js
tests/                           API tests (the database is mocked)
```

## Run it locally

1. Install **Node.js 20+** and **PostgreSQL 14+**.
2. Install the packages: `npm install`
3. Copy `.env.example` to `.env`, then set `DATABASE_URL` and a long random `JWT_SECRET`.
4. Create the tables and sample data: `npm run db:init`
5. Create the first admin:
   `ADMIN_PASSWORD=<at least 12 characters> node scripts/create-admin.js "Your Name" you@college.edu`
6. Start the server: `npm run dev`, then open http://localhost:4000/health

## Tests

`npm test` runs the API tests. They don't need a database: the database layer is mocked.

## Roles

| Role | Can |
|---|---|
| student | see their own record, attendance and loans; enrol in courses; read notices |
| teacher | everything a student can see for any student; mark attendance; issue books; post notices |
| admin | everything, plus create students, courses and staff accounts |

## API

See [docs/api](docs/api) for every endpoint, one page per feature.
