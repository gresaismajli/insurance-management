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

function mapPayment(row) {
  return {
    id: row.id,
    policyId: row.policy_id,
    paymentDate: row.payment_date,
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    referenceNumber: row.reference_number,
    policyNumber: row.policy_number,
    clientName: row.client_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const paymentSelect = `
  SELECT payments.*,
         policies.policy_number,
         CONCAT(clients.first_name, ' ', clients.last_name) AS client_name
  FROM payments
  INNER JOIN policies ON policies.id = payments.policy_id
  INNER JOIN clients ON clients.id = policies.client_id
`;

async function getPayments(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const status = req.query.status || null;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(
        `(payments.reference_number LIKE ?
          OR policies.policy_number LIKE ?
          OR clients.first_name LIKE ?
          OR clients.last_name LIKE ?)`
      );
      params.push(search, search, search, search);
    }

    if (status) {
      conditions.push('payments.status = ?');
      params.push(status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${paymentSelect} ${whereClause} ORDER BY payments.created_at DESC`,
      params
    );

    res.json({
      payments: rows.map(mapPayment)
    });
  } catch (error) {
    next(error);
  }
}

async function getPaymentById(req, res, next) {
  try {
    const [rows] = await pool.query(`${paymentSelect} WHERE payments.id = ?`, [
      req.params.id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.json({
      payment: mapPayment(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

async function createPayment(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      policyId,
      paymentDate,
      amount,
      method,
      status = 'pending',
      referenceNumber = null
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO payments
       (policy_id, payment_date, amount, method, status, reference_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [policyId, paymentDate, amount, method, status, referenceNumber || null]
    );

    const [rows] = await pool.query(`${paymentSelect} WHERE payments.id = ?`, [
      result.insertId
    ]);

    res.status(201).json({
      message: 'Payment created successfully',
      payment: mapPayment(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Payment reference number already exists'
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

async function updatePayment(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      policyId,
      paymentDate,
      amount,
      method,
      status = 'pending',
      referenceNumber = null
    } = req.body;

    const [result] = await pool.query(
      `UPDATE payments
       SET policy_id = ?, payment_date = ?, amount = ?, method = ?, status = ?, reference_number = ?
       WHERE id = ?`,
      [
        policyId,
        paymentDate,
        amount,
        method,
        status,
        referenceNumber || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    const [rows] = await pool.query(`${paymentSelect} WHERE payments.id = ?`, [
      req.params.id
    ]);

    res.json({
      message: 'Payment updated successfully',
      payment: mapPayment(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Payment reference number already exists'
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

async function deletePayment(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM payments WHERE id = ?', [
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.json({
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};

