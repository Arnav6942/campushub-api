const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// New accounts are always students. Teachers and admins are created by an admin
// (see scripts/create-admin.js), never through public sign-up.
const registerSchema = {
  name: { type: 'string', required: true, maxLength: 120 },
  email: { type: 'string', required: true, maxLength: 200, pattern: EMAIL },
  password: { type: 'string', required: true, maxLength: 200, pattern: /^.{10,}$/ },
};

const loginSchema = {
  email: { type: 'string', required: true, maxLength: 200 },
  password: { type: 'string', required: true, maxLength: 200 },
};

module.exports = { registerSchema, loginSchema };
