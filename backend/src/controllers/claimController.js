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

function mapClaim(row) {
  return {
    id: row.id,
    policyId: row.policy_id,
    claimNumber: row.claim_number,
    claimDate: row.claim_date,
    description: row.description,
    requestedAmount: Number(row.requested_amount),
    approvedAmount:
      row.approved_amount === null ? null : Number(row.approved_amount),
    status: row.status,
    policyNumber: row.policy_number,
    clientName: row.client_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const claimSelect = `
  SELECT claims.*,
         policies.policy_number,
         CONCAT(clients.first_name, ' ', clients.last_name) AS client_name
  FROM claims
  INNER JOIN policies ON policies.id = claims.policy_id
  INNER JOIN clients ON clients.id = policies.client_id
`;

async function getClaims(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const status = req.query.status || null;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(
        `(claims.claim_number LIKE ?
          OR claims.description LIKE ?
          OR policies.policy_number LIKE ?
          OR clients.first_name LIKE ?
          OR clients.last_name LIKE ?)`
      );
      params.push(search, search, search, search, search);
    }

    if (status) {
      conditions.push('claims.status = ?');
      params.push(status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${claimSelect} ${whereClause} ORDER BY claims.created_at DESC`,
      params
    );

    res.json({
      claims: rows.map(mapClaim)
    });
  } catch (error) {
    next(error);
  }
}

async function getClaimById(req, res, next) {
  try {
    const [rows] = await pool.query(`${claimSelect} WHERE claims.id = ?`, [
      req.params.id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Claim not found'
      });
    }

    res.json({
      claim: mapClaim(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

async function createClaim(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      policyId,
      claimNumber,
      claimDate,
      description,
      requestedAmount,
      approvedAmount = null,
      status = 'submitted'
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO claims
       (policy_id, claim_number, claim_date, description, requested_amount, approved_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        policyId,
        claimNumber,
        claimDate,
        description,
        requestedAmount,
        approvedAmount,
        status
      ]
    );

    const [rows] = await pool.query(`${claimSelect} WHERE claims.id = ?`, [
      result.insertId
    ]);

    res.status(201).json({
      message: 'Claim created successfully',
      claim: mapClaim(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Claim number already exists'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'Policy does not exist'
      });
    }

    next(error);
  }
}

async function updateClaim(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      policyId,
      claimNumber,
      claimDate,
      description,
      requestedAmount,
      approvedAmount = null,
      status = 'submitted'
    } = req.body;

    const [result] = await pool.query(
      `UPDATE claims
       SET policy_id = ?, claim_number = ?, claim_date = ?, description = ?,
           requested_amount = ?, approved_amount = ?, status = ?
       WHERE id = ?`,
      [
        policyId,
        claimNumber,
        claimDate,
        description,
        requestedAmount,
        approvedAmount,
        status,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Claim not found'
      });
    }

    const [rows] = await pool.query(`${claimSelect} WHERE claims.id = ?`, [
      req.params.id
    ]);

    res.json({
      message: 'Claim updated successfully',
      claim: mapClaim(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Claim number already exists'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'Policy does not exist'
      });
    }

    next(error);
  }
}

async function deleteClaim(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM claims WHERE id = ?', [
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Claim not found'
      });
    }

    res.json({
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClaims,
  getClaimById,
  createClaim,
  updateClaim,
  deleteClaim
};

