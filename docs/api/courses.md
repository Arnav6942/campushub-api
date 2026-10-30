# Courses

| Method | Path | Who | What it does |
|---|---|---|---|
| GET | `/api/courses` | signed in | The course catalogue. |
| GET | `/api/courses/:id` | signed in | One course. |
| POST | `/api/courses` | admin | Creates a course (`code` like `CS101`). |
| PUT | `/api/courses/:id/teacher` | admin | Assigns a teacher. |
