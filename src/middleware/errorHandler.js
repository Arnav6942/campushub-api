const logger = require('../utils/logger');
const { HttpError } = require('../utils/httpError');

// Turns every error into a JSON response. Internal details (stack traces, SQL) are logged,
// never sent to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err.code === '23505') return res.status(409).json({ error: 'This already exists' }); // unique violation
  if (err.code === '23503') return res.status(400).json({ error: 'A referenced record does not exist' }); // foreign key
  logger.error('Unhandled error', { requestId: req.id, path: req.path, error: err.message });
  return res.status(500).json({ error: 'Something went wrong', requestId: req.id });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

module.exports = { errorHandler, notFoundHandler };
