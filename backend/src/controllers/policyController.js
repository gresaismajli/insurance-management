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

function mapPolicy(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    insuranceTypeId: row.insurance_type_id,
    policyNumber: row.policy_number,
    startDate: row.start_date,
    endDate: row.end_date,
    premiumAmount: Number(row.premium_amount),
    coverageAmount: Number(row.coverage_amount),
    status: row.status,
    clientName: row.client_name,
    insuranceTypeName: row.insurance_type_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const policySelect = `
  SELECT policies.*,
         CONCAT(clients.first_name, ' ', clients.last_name) AS client_name,
         insurance_types.name AS insurance_type_name
  FROM policies
  INNER JOIN clients ON clients.id = policies.client_id
  INNER JOIN insurance_types ON insurance_types.id = policies.insurance_type_id
`;

async function getPolicies(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const status = req.query.status || null;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(
        `(policies.policy_number LIKE ?
          OR clients.first_name LIKE ?
          OR clients.last_name LIKE ?
          OR insurance_types.name LIKE ?)`
      );
      params.push(search, search, search, search);
    }

    if (status) {
      conditions.push('policies.status = ?');
      params.push(status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${policySelect} ${whereClause} ORDER BY policies.created_at DESC`,
      params
    );

    res.json({
      policies: rows.map(mapPolicy)
    });
  } catch (error) {
    next(error);
  }
}

async function getPolicyById(req, res, next) {
  try {
    const [rows] = await pool.query(`${policySelect} WHERE policies.id = ?`, [
      req.params.id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Policy not found'
      });
    }

    res.json({
      policy: mapPolicy(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

async function createPolicy(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      clientId,
      insuranceTypeId,
      policyNumber,
      startDate,
      endDate,
      premiumAmount,
      coverageAmount,
      status = 'active'
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO policies
       (client_id, insurance_type_id, policy_number, start_date, end_date, premium_amount, coverage_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        insuranceTypeId,
        policyNumber,
        startDate,
        endDate,
        premiumAmount,
        coverageAmount,
        status
      ]
    );

    const [rows] = await pool.query(`${policySelect} WHERE policies.id = ?`, [
      result.insertId
    ]);

    res.status(201).json({
      message: 'Policy created successfully',
      policy: mapPolicy(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Policy number already exists'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'Client or insurance type does not exist'
      });
    }

    next(error);
  }
}

async function updatePolicy(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      clientId,
      insuranceTypeId,
      policyNumber,
      startDate,
      endDate,
      premiumAmount,
      coverageAmount,
      status = 'active'
    } = req.body;

    const [result] = await pool.query(
      `UPDATE policies
       SET client_id = ?, insurance_type_id = ?, policy_number = ?, start_date = ?, end_date = ?,
           premium_amount = ?, coverage_amount = ?, status = ?
       WHERE id = ?`,
      [
        clientId,
        insuranceTypeId,
        policyNumber,
        startDate,
        endDate,
        premiumAmount,
        coverageAmount,
        status,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Policy not found'
      });
    }

    const [rows] = await pool.query(`${policySelect} WHERE policies.id = ?`, [
      req.params.id
    ]);

    res.json({
      message: 'Policy updated successfully',
      policy: mapPolicy(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Policy number already exists'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'Client or insurance type does not exist'
      });
    }

    next(error);
  }
}

async function deletePolicy(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM policies WHERE id = ?', [
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Policy not found'
      });
    }

    res.json({
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Policy cannot be deleted because it has related claims or payments'
      });
    }

    next(error);
  }
}

module.exports = {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy
};

