const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access token is required'
    });
  }

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid or expired access token'
    });
  }
}

module.exports = {
  authenticate
};

