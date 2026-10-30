// Shared test setup. The database is replaced by a jest mock in each test file, so the tests
// run without PostgreSQL. These environment values only exist inside the test run.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/campushub_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'jest-run-only-signing-value';
process.env.BCRYPT_ROUNDS = '4';
process.env.LOG_LEVEL = 'error';

const { signAccessToken } = require('../src/utils/tokens');

/** "Authorization" header value for a user with the given role. */
function authHeader(role, userId = 1) {
  return `Bearer ${signAccessToken({ id: userId, role })}`;
}

module.exports = { authHeader };
