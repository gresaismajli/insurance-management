const { validationResult } = require('express-validator');

const { pool } = require('../config/database');

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

function mapInsuranceType(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    basePrice: Number(row.base_price),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getInsuranceTypes(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;

    const [rows] = search
      ? await pool.query(
          `SELECT * FROM insurance_types
           WHERE name LIKE ? OR description LIKE ?
           ORDER BY created_at DESC`,
          [search, search]
        )
      : await pool.query(
          'SELECT * FROM insurance_types ORDER BY created_at DESC'
        );

    res.json({
      insuranceTypes: rows.map(mapInsuranceType)
    });
  } catch (error) {
    next(error);
  }
}

async function getInsuranceTypeById(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM insurance_types WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Insurance type not found'
      });
    }

    res.json({
      insuranceType: mapInsuranceType(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

async function createInsuranceType(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const { name, description, basePrice, isActive = true } = req.body;

    const [result] = await pool.query(
      `INSERT INTO insurance_types (name, description, base_price, is_active)
       VALUES (?, ?, ?, ?)`,
      [name, description || null, basePrice, isActive]
    );

    const [rows] = await pool.query(
      'SELECT * FROM insurance_types WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Insurance type created successfully',
      insuranceType: mapInsuranceType(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Insurance type name already exists'
      });
    }

    next(error);
  }
}

async function updateInsuranceType(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const { name, description, basePrice, isActive = true } = req.body;

    const [result] = await pool.query(
      `UPDATE insurance_types
       SET name = ?, description = ?, base_price = ?, is_active = ?
       WHERE id = ?`,
      [name, description || null, basePrice, isActive, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Insurance type not found'
      });
    }

    const [rows] = await pool.query(
      'SELECT * FROM insurance_types WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Insurance type updated successfully',
      insuranceType: mapInsuranceType(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Insurance type name already exists'
      });
    }

    next(error);
  }
}

async function deleteInsuranceType(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM insurance_types WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Insurance type not found'
      });
    }

    res.json({
      message: 'Insurance type deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Insurance type cannot be deleted because it has related policies'
      });
    }

    next(error);
  }
}

module.exports = {
  getInsuranceTypes,
  getInsuranceTypeById,
  createInsuranceType,
  updateInsuranceType,
  deleteInsuranceType
};

