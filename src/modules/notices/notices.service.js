const db = require('../../db/pool');
const { notFound } = require('../../utils/httpError');

// Which notices each role is allowed to see.
const AUDIENCES_FOR_ROLE = {
  student: ['all', 'students'],
  teacher: ['all', 'teachers'],
  admin: ['all', 'students', 'teachers'],
};

async function listNotices(role) {
  const audiences = AUDIENCES_FOR_ROLE[role] || ['all'];
  const { rows } = await db.query(
    `SELECT id, title, body, audience, pinned, created_at
       FROM notices
      WHERE audience = ANY($1)
      ORDER BY pinned DESC, created_at DESC
      LIMIT 100`,
    [audiences],
  );
  return rows;
}

async function createNotice({ title, body, audience = 'all', createdBy }) {
  const { rows } = await db.query(
    `INSERT INTO notices (title, body, audience, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, body, audience, pinned, created_at`,
    [title, body, audience, createdBy],
  );
  return rows[0];
}

async function setPinned(id, pinned) {
  const { rows } = await db.query('UPDATE notices SET pinned = $1 WHERE id = $2 RETURNING id, pinned', [pinned, id]);
  if (!rows[0]) throw notFound('Notice');
  return rows[0];
}

async function deleteNotice(id) {
  const { rowCount } = await db.query('DELETE FROM notices WHERE id = $1', [id]);
  if (!rowCount) throw notFound('Notice');
}

module.exports = { listNotices, createNotice, setPinned, deleteNotice };
