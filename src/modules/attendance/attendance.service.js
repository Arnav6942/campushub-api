const db = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { badRequest } = require('../../utils/httpError');

const STATUSES = ['present', 'absent', 'late'];

/**
 * Saves one class's attendance. records = [{ studentId, status }]. Marking the same class
 * again (e.g. to correct a mistake) updates the earlier entry instead of duplicating it.
 */
async function markAttendance({ courseId, date, records, markedBy }) {
  if (!Array.isArray(records) || records.length === 0) throw badRequest('records must be a non-empty list');
  for (const record of records) {
    if (!STATUSES.includes(record.status)) throw badRequest(`status must be one of: ${STATUSES.join(', ')}`);
  }
  return withTransaction(async (client) => {
    for (const record of records) {
      await client.query(
        `INSERT INTO attendance (course_id, student_id, date, status, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (course_id, student_id, date)
         DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by`,
        [courseId, record.studentId, date, record.status, markedBy],
      );
    }
    return { courseId: Number(courseId), date, saved: records.length };
  });
}

/** Everyone enrolled in a course, with their status for one date (null = not marked yet). */
async function attendanceForCourse(courseId, date) {
  const { rows } = await db.query(
    `SELECT s.id AS student_id, s.roll_number, s.name, a.status
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       LEFT JOIN attendance a ON a.student_id = s.id AND a.course_id = e.course_id AND a.date = $2
      WHERE e.course_id = $1
      ORDER BY s.roll_number`,
    [courseId, date],
  );
  return rows;
}

/** Every attendance entry for one student, newest first. */
async function attendanceForStudent(studentId) {
  const { rows } = await db.query(
    `SELECT a.date, a.status, c.code, c.title
       FROM attendance a JOIN courses c ON c.id = a.course_id
      WHERE a.student_id = $1
      ORDER BY a.date DESC`,
    [studentId],
  );
  return rows;
}

module.exports = { markAttendance, attendanceForCourse, attendanceForStudent, STATUSES };
