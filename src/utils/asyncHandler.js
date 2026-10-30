/**
 * Lets route handlers be async functions: if the promise rejects, the error goes to the
 * error-handling middleware instead of crashing the server.
 */
module.exports = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
