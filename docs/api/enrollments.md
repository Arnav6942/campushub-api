# Enrolments

| Method | Path | Who | What it does |
|---|---|---|---|
| POST | `/api/enrollments` | student (self), admin (anyone) | Enrols in a course; refused when the course is full. |
| GET | `/api/enrollments/mine` | student | The signed-in student's courses. |
| DELETE | `/api/enrollments/:courseId` | student | Drops a course. |
| GET | `/api/enrollments/course/:courseId` | admin, teacher | The class list for a course. |
