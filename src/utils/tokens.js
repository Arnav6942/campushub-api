const jwt = require('jsonwebtoken');
const config = require('../config');

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
  });
}

/** Throws if the token is expired, tampered with, or signed with another algorithm. */
function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
}

module.exports = { signAccessToken, verifyAccessToken };
