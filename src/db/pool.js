const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });

pool.on('error', (err) => logger.error('Unexpected PostgreSQL error', { error: err.message }));

/**
 * Runs one query. Values always go in `params` ($1, $2, ...), never inside `text`,
 * so user input can't change the meaning of the SQL.
 */
async function query(text, params = []) {
  const started = Date.now();
  const result = await pool.query(text, params);
  logger.debug('db query', { ms: Date.now() - started, rows: result.rowCount });
  return result;
}

module.exports = { pool, query };
