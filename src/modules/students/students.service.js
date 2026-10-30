const db = require('../../db/pool');
const { notFound } = require('../../utils/httpError');

// Lists show only directory fields; phone and guardian details are on the single-student view,
// which is limited to the student themself and staff.
async function listStudents({ department } = {}) {
  if (department) {
    const { rows } = await db.query(
      'SELECT id, roll_number, name, email, department, year FROM students WHERE department = $1 ORDER BY roll_number',
      [String(department).toUpperCase()],
    );
    return rows;
  }
  const { rows } = await db.query('SELECT id, roll_number, name, email, department, year FROM students ORDER BY roll_number');
  return rows;
}

async function getStudent(id) {
  const { rows } = await db.query(
    `SELECT id, user_id, roll_number, name, email, phone, guardian_name, department, year
       FROM students
      WHERE id = $1`,
    [id],
  );
  if (!rows[0]) throw notFound('Student');
  return rows[0];
}

async function getStudentByUserId(userId) {
  const { rows } = await db.query(
    'SELECT id, roll_number, name, department, year FROM students WHERE user_id = $1',
    [userId],
  );
  return rows[0] || null;
}

async function createStudent({ userId = null, rollNumber, name, email, phone = null, guardianName = null, department, year }) {
  const { rows } = await db.query(
    `INSERT INTO students (user_id, roll_number, name, email, phone, guardian_name, department, year)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, roll_number, name, email, department, year`,
    [userId, rollNumber, name, email, phone, guardianName, String(department).toUpperCase(), year],
  );
  return rows[0];
}

async function updateContact(id, { phone, guardianName }) {
  const { rows } = await db.query(
    `UPDATE students
        SET phone = COALESCE($1, phone), guardian_name = COALESCE($2, guardian_name)
      WHERE id = $3
      RETURNING id, phone, guardian_name`,
    [phone ?? null, guardianName ?? null, id],
  );
  if (!rows[0]) throw notFound('Student');
  return rows[0];
}

module.exports = { listStudents, getStudent, getStudentByUserId, createStudent, updateContact };
