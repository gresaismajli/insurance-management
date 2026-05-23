const jwt = require('jsonwebtoken');

function createAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role_name
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    }
  );
}

module.exports = {
  createAccessToken
};

