-- Sample data for trying the API locally. Accounts are created with scripts/create-admin.js
-- and POST /api/auth/register, so no password hashes are stored here.

INSERT INTO courses (code, title, department, credits, capacity) VALUES
  ('CS101', 'Programming Fundamentals', 'CS', 4, 120),
  ('CS201', 'Data Structures', 'CS', 4, 90),
  ('CS305', 'Database Systems', 'CS', 3, 60),
  ('EC102', 'Digital Electronics', 'EC', 4, 60),
  ('ME110', 'Engineering Graphics', 'ME', 2, 80),
  ('MA101', 'Engineering Mathematics I', 'MA', 4, 180);

INSERT INTO books (isbn, title, author, price, copies_total, copies_available) VALUES
  ('978-0262046305', 'Introduction to Algorithms', 'Cormen, Leiserson, Rivest, Stein', 1450.00, 6, 6),
  ('978-0132350884', 'Clean Code', 'Robert C. Martin', 699.00, 4, 4),
  ('978-0073523323', 'Database System Concepts', 'Silberschatz, Korth, Sudarshan', 925.00, 5, 5),
  ('978-0131103627', 'The C Programming Language', 'Kernighan, Ritchie', 450.00, 8, 8),
  ('978-8126509003', 'Engineering Mathematics', 'B. S. Grewal', 875.00, 10, 10);

INSERT INTO notices (title, body, audience, pinned) VALUES
  ('Welcome to the new semester', 'Classes start on Monday. Check your timetable on the notice board.', 'all', true),
  ('Library hours', 'The library is open 8:00 to 20:00 on weekdays and 9:00 to 14:00 on Saturdays.', 'students', false),
  ('Attendance deadline', 'Please mark attendance for each class on the same day.', 'teachers', false);
