import { useEffect, useState } from 'react';

import httpClient from '../api/httpClient';
import Notification from '../components/Notification';
import PageHeader from './shared/PageHeader';

const emptyForm = {
  policyId: '',
  paymentDate: '',
  amount: '',
  method: 'cash',
  status: 'pending',
  referenceNumber: ''
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0);
}

function formatDate(value) {
  return value ? String(value).slice(0, 10) : '';
}

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editingPayment, setEditingPayment] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadPayments(searchValue = search, statusValue = status) {
    setIsLoading(true);
    setError('');

    try {
      const response = await httpClient.get('/payments', {
        params: {
          ...(searchValue ? { search: searchValue } : {}),
          ...(statusValue ? { status: statusValue } : {})
        }
      });
      setPayments(response.data.payments);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load payments');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPolicies() {
    try {
      const response = await httpClient.get('/policies');
      setPolicies(response.data.policies);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load policies');
    }
  }

  useEffect(() => {
    loadPayments('', '');
    loadPolicies();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function openCreateForm() {
    setEditingPayment(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(payment) {
    setEditingPayment(payment);
    setFormData({
      policyId: payment.policyId,
      paymentDate: formatDate(payment.paymentDate),
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      referenceNumber: payment.referenceNumber || ''
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingPayment(null);
    setFormData(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      ...formData,
      policyId: Number(formData.policyId),
      amount: Number(formData.amount),
      referenceNumber: formData.referenceNumber || null
    };

    try {
      if (editingPayment) {
        await httpClient.put(`/payments/${editingPayment.id}`, payload);
        setSuccess('Payment updated successfully.');
      } else {
        await httpClient.post('/payments', payload);
        setSuccess('Payment created successfully.');
      }

      closeForm();
      loadPayments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save payment');
    }
  }

  async function handleDelete(paymentId) {
    const shouldDelete = window.confirm('Delete this payment?');

    if (!shouldDelete) {
      return;
    }

    try {
      await httpClient.delete(`/payments/${paymentId}`);
      setSuccess('Payment deleted successfully.');
      loadPayments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete payment');
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    loadPayments(search, status);
  }

  function clearFilters() {
    setSearch('');
    setStatus('');
    loadPayments('', '');
  }

  return (
    <>
      <PageHeader title="Payments">
        <button className="btn btn-primary" onClick={openCreateForm}>
          Add Payment
        </button>
      </PageHeader>

      {error && <div className="alert alert-danger">{error}</div>}
      <Notification message={success} onClose={() => setSuccess('')} />

      <section className="panel">
        <form className="toolbar" onSubmit={handleFilterSubmit}>
          <input
            className="form-control"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search payments"
            type="search"
            value={search}
          />
          <select
            className="form-select toolbar-select"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button className="btn btn-outline-primary" type="submit">
            Filter
          </button>
          <button className="btn btn-outline-secondary" onClick={clearFilters} type="button">
            Reset
          </button>
        </form>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Policy</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.referenceNumber || '-'}</td>
                    <td>{payment.policyNumber}</td>
                    <td>{payment.clientName}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{payment.status}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => openEditForm(payment)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(payment.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <div className="modal-backdrop-custom">
          <section className="form-modal">
            <div className="form-modal-header">
              <h3>{editingPayment ? 'Edit Payment' : 'Add Payment'}</h3>
              <button className="btn-close" onClick={closeForm} type="button" />
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="policyId">
                  Policy
                </label>
                <select
                  className="form-select"
                  id="policyId"
                  name="policyId"
                  onChange={handleChange}
                  required
                  value={formData.policyId}
                >
                  <option value="">Select policy</option>
                  {policies.map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.policyNumber} - {policy.clientName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="paymentDate">
                  Payment Date
                </label>
                <input
                  className="form-control"
                  id="paymentDate"
                  name="paymentDate"
                  onChange={handleChange}
                  required
                  type="date"
                  value={formData.paymentDate}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="amount">
                  Amount
                </label>
                <input
                  className="form-control"
                  id="amount"
                  min="0"
                  name="amount"
                  onChange={handleChange}
                  required
                  step="0.01"
                  type="number"
                  value={formData.amount}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="method">
                  Method
                </label>
                <select
                  className="form-select"
                  id="method"
                  name="method"
                  onChange={handleChange}
                  value={formData.method}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  onChange={handleChange}
                  value={formData.status}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="referenceNumber">
                  Reference Number
                </label>
                <input
                  className="form-control"
                  id="referenceNumber"
                  name="referenceNumber"
                  onChange={handleChange}
                  value={formData.referenceNumber}
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-outline-secondary" onClick={closeForm} type="button">
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save Payment
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default PaymentsPage;
