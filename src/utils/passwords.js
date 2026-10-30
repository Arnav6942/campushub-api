const bcrypt = require('bcryptjs');
const config = require('../config');

/** Hashes a password with bcrypt (salted, deliberately slow). Never store plain passwords. */
async function hashPassword(plain) {
  return bcrypt.hash(plain, config.bcryptRounds);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, verifyPassword };
