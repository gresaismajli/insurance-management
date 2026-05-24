const { pool } = require('../config/database');

async function getSummary(req, res, next) {
  try {
    const [[clientStats]] = await pool.query(
      'SELECT COUNT(*) AS totalClients FROM clients'
    );
    const [[policyStats]] = await pool.query(
      `SELECT
         COUNT(*) AS totalPolicies,
         SUM(status = 'active') AS activePolicies
       FROM policies`
    );
    const [[claimStats]] = await pool.query(
      `SELECT
         COUNT(*) AS totalClaims,
         SUM(status IN ('submitted', 'reviewing')) AS openClaims
       FROM claims`
    );
    const [[paymentStats]] = await pool.query(
      `SELECT
         COUNT(*) AS totalPayments,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS completedPaymentAmount
       FROM payments`
    );

    const [recentClaims] = await pool.query(
      `SELECT claims.id, claims.claim_number, claims.status, claims.requested_amount,
              policies.policy_number,
              CONCAT(clients.first_name, ' ', clients.last_name) AS client_name
       FROM claims
       INNER JOIN policies ON policies.id = claims.policy_id
       INNER JOIN clients ON clients.id = policies.client_id
       ORDER BY claims.created_at DESC
       LIMIT 5`
    );

    const [recentPayments] = await pool.query(
      `SELECT payments.id, payments.reference_number, payments.amount, payments.status,
              policies.policy_number,
              CONCAT(clients.first_name, ' ', clients.last_name) AS client_name
       FROM payments
       INNER JOIN policies ON policies.id = payments.policy_id
       INNER JOIN clients ON clients.id = policies.client_id
       ORDER BY payments.created_at DESC
       LIMIT 5`
    );
    const [policyStatusRows] = await pool.query(
      `SELECT status, COUNT(*) AS total
       FROM policies
       GROUP BY status`
    );
    const [claimStatusRows] = await pool.query(
      `SELECT status, COUNT(*) AS total
       FROM claims
       GROUP BY status`
    );
    const [paymentStatusRows] = await pool.query(
      `SELECT status, COUNT(*) AS total
       FROM payments
       GROUP BY status`
    );

    res.json({
      stats: {
        totalClients: Number(clientStats.totalClients),
        totalPolicies: Number(policyStats.totalPolicies),
        activePolicies: Number(policyStats.activePolicies || 0),
        totalClaims: Number(claimStats.totalClaims),
        openClaims: Number(claimStats.openClaims || 0),
        totalPayments: Number(paymentStats.totalPayments),
        completedPaymentAmount: Number(paymentStats.completedPaymentAmount)
      },
      recentClaims: recentClaims.map((claim) => ({
        id: claim.id,
        claimNumber: claim.claim_number,
        policyNumber: claim.policy_number,
        clientName: claim.client_name,
        status: claim.status,
        requestedAmount: Number(claim.requested_amount)
      })),
      recentPayments: recentPayments.map((payment) => ({
        id: payment.id,
        referenceNumber: payment.reference_number,
        policyNumber: payment.policy_number,
        clientName: payment.client_name,
        amount: Number(payment.amount),
        status: payment.status
      })),
      charts: {
        policyStatuses: policyStatusRows.map((row) => ({
          label: row.status,
          value: Number(row.total)
        })),
        claimStatuses: claimStatusRows.map((row) => ({
          label: row.status,
          value: Number(row.total)
        })),
        paymentStatuses: paymentStatusRows.map((row) => ({
          label: row.status,
          value: Number(row.total)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary
};
