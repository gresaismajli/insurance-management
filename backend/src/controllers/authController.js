const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const { pool } = require('../config/database');
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  verifyRefreshToken
} = require('../utils/tokenUtils');

function sendValidationErrors(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
    return true;
  }

  return false;
}

async function findDefaultRoleId() {
  const [roles] = await pool.query(
    'SELECT id FROM roles WHERE name = ? LIMIT 1',
    ['agent']
  );

  if (roles.length > 0) {
    return roles[0].id;
  }

  const [result] = await pool.query('INSERT INTO roles (name) VALUES (?)', [
    'agent'
  ]);

  return result.insertId;
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role_name
  };
}

async function storeRefreshToken(userId, refreshToken) {
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );
}

async function register(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const { fullName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    const roleId = await findDefaultRoleId();
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (role_id, full_name, email, password_hash) VALUES (?, ?, ?, ?)',
      [roleId, fullName, normalizedEmail, passwordHash]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        fullName,
        email: normalizedEmail,
        role: 'agent'
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const [users] = await pool.query(
      `SELECT users.id, users.full_name, users.email, users.password_hash, roles.name AS role_name
       FROM users
       INNER JOIN roles ON roles.id = users.role_id
       WHERE users.email = ? AND users.is_active = TRUE
       LIMIT 1`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await storeRefreshToken(user.id, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required'
      });
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);

    const [tokens] = await pool.query(
      `SELECT id FROM refresh_tokens
       WHERE user_id = ? AND token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [payload.id, tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(401).json({
        message: 'Invalid refresh token'
      });
    }

    const [users] = await pool.query(
      `SELECT users.id, users.full_name, users.email, roles.name AS role_name
       FROM users
       INNER JOIN roles ON roles.id = users.role_id
       WHERE users.id = ? AND users.is_active = TRUE
       LIMIT 1`,
      [payload.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'User is not active'
      });
    }

    res.json({
      accessToken: createAccessToken(users[0])
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Invalid refresh token'
      });
    }

    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL',
        [hashRefreshToken(refreshToken)]
      );
    }

    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({
    user: req.user
  });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
