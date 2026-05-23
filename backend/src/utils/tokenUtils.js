const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function tokenPayload(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role_name
  };
}

function createAccessToken(user) {
  return jwt.sign(tokenPayload(user), process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });
}

function createRefreshToken(user) {
  return jwt.sign(tokenPayload(user), process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
}

function verifyRefreshToken(refreshToken) {
  return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
}

function hashRefreshToken(refreshToken) {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashRefreshToken
};
