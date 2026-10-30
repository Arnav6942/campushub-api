# Students

| Method | Path | Who | What it does |
|---|---|---|---|
| GET | `/api/students?department=CS` | admin, teacher | Directory (no phone or guardian details). |
| GET | `/api/students/:id` | the student, staff | Full record, including contact details. |
| POST | `/api/students` | admin | Creates a student record. |
| PATCH | `/api/students/:id/contact` | the student, staff | Updates `phone` and `guardianName`. |
