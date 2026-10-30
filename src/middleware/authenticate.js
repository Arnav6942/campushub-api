const { verifyAccessToken } = require('../utils/tokens');
const { unauthorized } = require('../utils/httpError');

/** Reads "Authorization: Bearer <token>" and sets req.user = { id, role }. */
function authenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(unauthorized('Your session has expired, please sign in again'));
  }
}

module.exports = authenticate;
