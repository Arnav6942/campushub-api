const db = require('../../db/pool');
const { hashPassword, verifyPassword } = require('../../utils/passwords');
const { signAccessToken } = require('../../utils/tokens');
const { conflict, notFound, unauthorized } = require('../../utils/httpError');

async function findUserByEmail(email) {
  const { rows } = await db.query(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
    [email],
  );
  return rows[0] || null;
}

async function register({ name, email, password }) {
  if (await findUserByEmail(email.trim())) throw conflict('An account with this email already exists');
  const passwordHash = await hashPassword(password);
  const { rows } = await db.query(
    `INSERT INTO users (name, email, role, password_hash)
     VALUES ($1, $2, 'student', $3)
     RETURNING id, name, email, role`,
    [name.trim(), email.trim(), passwordHash],
  );
  return rows[0];
}

async function login({ email, password }) {
  const user = await findUserByEmail(email.trim());
  // Same message for "no such user" and "wrong password", so nobody can probe which emails exist.
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw unauthorized('Wrong email or password');
  }
  return {
    token: signAccessToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

async function getProfile(userId) {
  const { rows } = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);
  if (!rows[0]) throw notFound('User');
  return rows[0];
}

module.exports = { register, login, getProfile, findUserByEmail };
