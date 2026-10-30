// Errors that carry an HTTP status. Throw them anywhere; middleware/errorHandler.js turns
// them into a JSON response.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest = (message, details) => new HttpError(400, message, details);
const unauthorized = (message = 'Please sign in first') => new HttpError(401, message);
const forbidden = (message = 'You do not have access to this') => new HttpError(403, message);
const notFound = (what = 'Resource') => new HttpError(404, `${what} not found`);
const conflict = (message) => new HttpError(409, message);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
