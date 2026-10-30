# Library

| Method | Path | Who | What it does |
|---|---|---|---|
| GET | `/api/library/books` | signed in | Every book with available copies. |
| POST | `/api/library/books` | admin | Adds a book. |
| POST | `/api/library/loans` | admin, teacher | Issues a book to a student (at most 3 at a time, due in 14 days). |
| POST | `/api/library/loans/:id/return` | admin, teacher | Returns a book; late returns are fined ₹5 per day. |
| GET | `/api/library/loans/student/:studentId` | the student, staff | A student's loans and fines. |
