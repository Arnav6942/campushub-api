-- Fees and payments (run after schema.sql).

CREATE TABLE fees (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term       TEXT NOT NULL,
  amount_due NUMERIC(10, 2) NOT NULL CHECK (amount_due >= 0),
  due_date   DATE NOT NULL,
  UNIQUE (student_id, term)
);

CREATE TABLE payments (
  id                 SERIAL PRIMARY KEY,
  fee_id             INTEGER NOT NULL REFERENCES fees(id),
  student_id         INTEGER NOT NULL REFERENCES students(id),
  amount             NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  method             TEXT NOT NULL,
  receipt_no         TEXT NOT NULL UNIQUE,
  verification_token TEXT NOT NULL,
  checksum           TEXT NOT NULL,
  file_name          TEXT NOT NULL,
  paid_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX payments_student_idx ON payments (student_id, paid_at);
