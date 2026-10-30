# Attendance

| Method | Path | Who | What it does |
|---|---|---|---|
| POST | `/api/attendance` | teacher, admin | Marks a class: `{ courseId, date, records: [{ studentId, status }] }`. Status is `present`, `absent` or `late`. Marking again corrects the earlier entry. |
| GET | `/api/attendance/course/:courseId?date=YYYY-MM-DD` | teacher, admin | Everyone in the class and their status for that day (default: today). |
| GET | `/api/attendance/student/:studentId` | the student, staff | Every attendance entry for one student. |
