const db = require('../../db/pool');
const { notFound } = require('../../utils/httpError');

/**
 * Course catalogue for GET /api/courses.
 * Supports ?page=2&pageSize=20 (pageSize is capped at 100).
 */
async function listCourses(filters = {}) {
  const page = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(filters.pageSize, 10) || 20, 1), 100);
  const { rows } = await db.query(
    'SELECT id, code, title, department, credits, capacity, teacher_id FROM courses ORDER BY code LIMIT $1 OFFSET $2',
    [pageSize, (page - 1) * pageSize],
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
