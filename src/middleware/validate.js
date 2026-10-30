const { badRequest } = require('../utils/httpError');

/**
 * Small request-body check: { field: { type, required, maxLength, pattern, oneOf } }.
 * Keeps the project dependency-light; switch to zod or joi if the rules grow.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body || {};
    const errors = [];
    for (const [field, rule] of Object.entries(schema)) {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        if (rule.required) errors.push(`${field} is required`);
        continue;
      }
      if (rule.type === 'string' && typeof value !== 'string') errors.push(`${field} must be text`);
      if (rule.type === 'number' && typeof value !== 'number') errors.push(`${field} must be a number`);
      if (rule.type === 'boolean' && typeof value !== 'boolean') errors.push(`${field} must be true or false`);
      if (rule.maxLength && String(value).length > rule.maxLength) errors.push(`${field} is too long`);
      if (rule.pattern && !rule.pattern.test(String(value))) errors.push(`${field} has an invalid format`);
      if (rule.oneOf && !rule.oneOf.includes(value)) errors.push(`${field} must be one of: ${rule.oneOf.join(', ')}`);
    }
    if (errors.length) return next(badRequest('Please check the form', errors));
    return next();
  };
}

module.exports = { validateBody };
