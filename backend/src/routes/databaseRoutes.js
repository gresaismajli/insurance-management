const express = require('express');
const { testConnection } = require('../config/database');

const router = express.Router();

router.get('/database/health', async (req, res, next) => {
  try {
    await testConnection();

    res.json({
      status: 'ok',
      database: process.env.DB_NAME || 'insurance_management'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

