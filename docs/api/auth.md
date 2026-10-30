# Auth

| Method | Path | Who | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | Creates a **student** account. Body: `name`, `email`, `password` (10+ characters). |
| POST | `/api/auth/login` | anyone | Returns `{ token, user }`. Send the token as `Authorization: Bearer <token>`. |
| GET | `/api/auth/me` | signed in | The signed-in user's profile. |

Sign-in routes are rate-limited (50 requests per 15 minutes per IP). Teachers and admins are
created by an admin, never through public sign-up.
