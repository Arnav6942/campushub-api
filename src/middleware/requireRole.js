const { forbidden } = require('../utils/httpError');

/** Lets the request through only for the given roles, e.g. requireRole('admin', 'teacher'). */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(forbidden());
    return next();
  };
}

module.exports = requireRole;
