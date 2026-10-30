const crypto = require('crypto');
const logger = require('../utils/logger');

/** Gives every request an id (returned in X-Request-Id) and logs it when it finishes. */
function requestLogger(req, res, next) {
  req.id = crypto.randomUUID();
  const started = Date.now();
  res.setHeader('X-Request-Id', req.id);
  res.on('finish', () => {
    logger.info('request', {
      id: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - started,
    });
  });
  next();
}

module.exports = requestLogger;
