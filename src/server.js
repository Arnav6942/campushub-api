const config = require('./config');
const logger = require('./utils/logger');
const { createApp } = require('./app');
const { pool } = require('./db/pool');

const server = createApp().listen(config.port, () => {
  logger.info(`CampusHub API listening on http://localhost:${config.port}`);
});

// Finish in-flight requests and close database connections before exiting.
function shutdown(signal) {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
