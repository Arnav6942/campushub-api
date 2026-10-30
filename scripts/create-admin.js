// Creates the first admin account (or promotes an existing account to admin).
//
//   ADMIN_PASSWORD=<at least 12 characters> node scripts/create-admin.js "Full Name" admin@college.edu
//
// The password comes from an environment variable so it never ends up in shell history.
const db = require('../src/db/pool');
const { hashPassword } = require('../src/utils/passwords');

async function main() {
  const [name, email] = process.argv.slice(2);
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password || password.length < 12) {
    console.error('usage: ADMIN_PASSWORD=<at least 12 characters> node scripts/create-admin.js "Full Name" email');
    process.exit(1);
  }
  const passwordHash = await hashPassword(password);
  await db.query(
    `INSERT INTO users (name, email, role, password_hash)
     VALUES ($1, $2, 'admin', $3)
     ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash`,
    [name, email.toLowerCase(), passwordHash],
  );
  console.log(`Admin account ready: ${email.toLowerCase()}`);
  await db.pool.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
