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

function mapClient(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    personalNumber: row.personal_number,
    address: row.address,
    city: row.city,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getClients(req, res, next) {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;

    const [rows] = search
      ? await pool.query(
          `SELECT * FROM clients
           WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR personal_number LIKE ?
           ORDER BY created_at DESC`,
          [search, search, search, search]
        )
      : await pool.query('SELECT * FROM clients ORDER BY created_at DESC');

    res.json({
      clients: rows.map(mapClient)
    });
  } catch (error) {
    next(error);
  }
}

async function getClientById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [
      req.params.id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    res.json({
      client: mapClient(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

async function createClient(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      personalNumber,
      address,
      city
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO clients
       (first_name, last_name, email, phone, personal_number, address, city)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email.toLowerCase(),
        phone,
        personalNumber,
        address,
        city
      ]
    );

    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [
      result.insertId
    ]);

    res.status(201).json({
      message: 'Client created successfully',
      client: mapClient(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Client email or personal number already exists'
      });
    }

    next(error);
  }
}

async function updateClient(req, res, next) {
  try {
    if (sendValidationErrors(req, res)) {
      return;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      personalNumber,
      address,
      city
    } = req.body;

    const [result] = await pool.query(
      `UPDATE clients
       SET first_name = ?, last_name = ?, email = ?, phone = ?, personal_number = ?, address = ?, city = ?
       WHERE id = ?`,
      [
        firstName,
        lastName,
        email.toLowerCase(),
        phone,
        personalNumber,
        address,
        city,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [
      req.params.id
    ]);

    res.json({
      message: 'Client updated successfully',
      client: mapClient(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Client email or personal number already exists'
      });
    }

    next(error);
  }
}

async function deleteClient(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    res.json({
      message: 'Client deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Client cannot be deleted because it has related policies'
      });
    }

    next(error);
  }
}

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};

