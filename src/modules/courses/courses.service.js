const db = require('../../db/pool');
const { notFound } = require('../../utils/httpError');

/**
 * Course catalogue for GET /api/courses.
 * `filters` holds the query-string options; none are supported yet.
 */
async function listCourses(filters = {}) {
  const { rows } = await db.query(
    'SELECT id, code, title, department, credits, capacity, teacher_id FROM courses ORDER BY code',
  );
  return rows;
}

async function getCourse(id) {
  const { rows } = await db.query(
    'SELECT id, code, title, department, credits, capacity, teacher_id FROM courses WHERE id = $1',
    [id],
  );
  if (!rows[0]) throw notFound('Course');
  return rows[0];
}

async function createCourse({ code, title, department, credits, capacity = 60 }) {
  const { rows } = await db.query(
    `INSERT INTO courses (code, title, department, credits, capacity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, code, title, department, credits, capacity, teacher_id`,
    [code.toUpperCase(), title, department.toUpperCase(), credits, capacity],
  );
  return rows[0];
}

async function assignTeacher(courseId, teacherId) {
  const teacher = await db.query("SELECT id FROM users WHERE id = $1 AND role = 'teacher'", [teacherId]);
  if (!teacher.rows[0]) throw notFound('Teacher');
  const { rows } = await db.query(
    'UPDATE courses SET teacher_id = $1 WHERE id = $2 RETURNING id, code, teacher_id',
    [teacherId, courseId],
  );
  if (!rows[0]) throw notFound('Course');
  return rows[0];
}

module.exports = { listCourses, getCourse, createCourse, assignTeacher };
