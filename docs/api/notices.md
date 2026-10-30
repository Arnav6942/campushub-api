# Notices

| Method | Path | Who | What it does |
|---|---|---|---|
| GET | `/api/notices` | signed in | Notices for your role, pinned first. |
| POST | `/api/notices` | admin, teacher | Posts a notice for `all`, `students` or `teachers`. |
| PATCH | `/api/notices/:id/pin` | admin | Pins or unpins: `{ "pinned": true }`. |
| DELETE | `/api/notices/:id` | admin | Deletes a notice. |
