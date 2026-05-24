import { useEffect, useState } from 'react';

import httpClient from '../api/httpClient';
import PageHeader from './shared/PageHeader';

const emptyDashboard = {
  stats: {
    totalClients: 0,
    activePolicies: 0,
    openClaims: 0,
    totalPayments: 0,
    completedPaymentAmount: 0
  },
  recentClaims: [],
  recentPayments: [],
  charts: {
    policyStatuses: [],
    claimStatuses: [],
    paymentStatuses: []
  }
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0);
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await httpClient.get('/dashboard/summary');
        setDashboard(response.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || 'Unable to load dashboard data'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    { label: 'Clients', value: dashboard.stats.totalClients },
    { label: 'Active Policies', value: dashboard.stats.activePolicies },
    { label: 'Open Claims', value: dashboard.stats.openClaims },
    {
      label: 'Completed Payments',
      value: formatCurrency(dashboard.stats.completedPaymentAmount)
    }
  ];

  function renderChart(title, items) {
    const maxValue = Math.max(...items.map((item) => item.value), 1);

    return (
      <article className="panel">
        <h2 className="panel-title">{title}</h2>
        {items.length === 0 ? (
          <p className="text-secondary mb-0">No data yet.</p>
        ) : (
          <div className="chart-list">
            {items.map((item) => (
              <div className="chart-row" key={item.label}>
                <div className="chart-row-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="chart-track">
                  <div
                    className="chart-fill"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" />

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{isLoading ? '...' : stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid mt-4">
        {renderChart('Policy Statuses', dashboard.charts.policyStatuses)}
        {renderChart('Claim Statuses', dashboard.charts.claimStatuses)}
        {renderChart('Payment Statuses', dashboard.charts.paymentStatuses)}
      </section>

      <section className="dashboard-grid mt-4">
        <article className="panel">
          <h2 className="panel-title">Recent Claims</h2>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Claim No.</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Requested</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentClaims.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No recent claims.
                    </td>
                  </tr>
                ) : (
                  dashboard.recentClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>{claim.claimNumber}</td>
                      <td>{claim.clientName}</td>
                      <td>{claim.status}</td>
                      <td>{formatCurrency(claim.requestedAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2 className="panel-title">Recent Payments</h2>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No recent payments.
                    </td>
                  </tr>
                ) : (
                  dashboard.recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.referenceNumber || '-'}</td>
                      <td>{payment.clientName}</td>
                      <td>{payment.status}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}

export default DashboardPage;
