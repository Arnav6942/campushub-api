const db = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { conflict, notFound } = require('../../utils/httpError');

/** Enrols a student, refusing when the course is full. The course row is locked so two
 * students can't take the last seat at the same moment. */
async function enroll({ studentId, courseId }) {
  return withTransaction(async (client) => {
    const course = await client.query('SELECT id, capacity FROM courses WHERE id = $1 FOR UPDATE', [courseId]);
    if (!course.rows[0]) throw notFound('Course');

    const taken = await client.query('SELECT COUNT(*)::int AS n FROM enrollments WHERE course_id = $1', [courseId]);
    if (taken.rows[0].n >= course.rows[0].capacity) throw conflict('This course is full');

    const { rows } = await client.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING id, student_id, course_id, enrolled_at',
      [studentId, courseId],
    );
    return rows[0];
  });
}

async function drop({ studentId, courseId }) {
  const { rowCount } = await db.query('DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
  if (!rowCount) throw notFound('Enrolment');
}

async function enrollmentsForStudent(studentId) {
  const { rows } = await db.query(
    `SELECT c.id, c.code, c.title, c.credits, e.enrolled_at
       FROM enrollments e JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = $1
      ORDER BY c.code`,
    [studentId],
  );
  return rows;
}

async function roster(courseId) {
  const { rows } = await db.query(
    `SELECT s.id, s.roll_number, s.name, s.department, s.year
       FROM enrollments e JOIN students s ON s.id = e.student_id
      WHERE e.course_id = $1
      ORDER BY s.roll_number`,
    [courseId],
  );
  return rows;
}

module.exports = { enroll, drop, enrollmentsForStudent, roster };
