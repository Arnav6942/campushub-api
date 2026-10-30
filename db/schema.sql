-- CampusHub database schema (PostgreSQL 14+). Run with: npm run db:init

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE students (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  roll_number   TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  guardian_name TEXT,
  department    TEXT NOT NULL,
  year          SMALLINT NOT NULL CHECK (year BETWEEN 1 AND 4)
);

CREATE TABLE courses (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  department TEXT NOT NULL,
  credits    SMALLINT NOT NULL CHECK (credits BETWEEN 1 AND 6),
  capacity   INTEGER NOT NULL DEFAULT 60 CHECK (capacity > 0),
  teacher_id INTEGER REFERENCES users(id)
);

CREATE TABLE enrollments (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE attendance (
  id         SERIAL PRIMARY KEY,
  course_id  INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by  INTEGER REFERENCES users(id),
  UNIQUE (course_id, student_id, date)
);

CREATE TABLE books (
  id               SERIAL PRIMARY KEY,
  isbn             TEXT UNIQUE,
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  price            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  copies_total     INTEGER NOT NULL CHECK (copies_total >= 0),
  copies_available INTEGER NOT NULL CHECK (copies_available >= 0)
);

CREATE TABLE loans (
  id          SERIAL PRIMARY KEY,
  book_id     INTEGER NOT NULL REFERENCES books(id),
  student_id  INTEGER NOT NULL REFERENCES students(id),
  issued_by   INTEGER REFERENCES users(id),
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date    DATE NOT NULL,
  returned_at TIMESTAMPTZ,
  fine        NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE notices (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  audience   TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'students', 'teachers')),
  pinned     BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX attendance_student_idx ON attendance (student_id, date);
CREATE INDEX loans_student_idx ON loans (student_id) WHERE returned_at IS NULL;
