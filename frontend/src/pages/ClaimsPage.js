import { useEffect, useState } from 'react';

import httpClient from '../api/httpClient';
import PageHeader from './shared/PageHeader';

const emptyForm = {
  policyId: '',
  claimNumber: '',
  claimDate: '',
  description: '',
  requestedAmount: '',
  approvedAmount: '',
  status: 'submitted'
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

function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editingClaim, setEditingClaim] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadClaims(searchValue = search, statusValue = status) {
    setIsLoading(true);
    setError('');

    try {
      const response = await httpClient.get('/claims', {
        params: {
          ...(searchValue ? { search: searchValue } : {}),
          ...(statusValue ? { status: statusValue } : {})
        }
      });
      setClaims(response.data.claims);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load claims');
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
    loadClaims('', '');
    loadPolicies();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function openCreateForm() {
    setEditingClaim(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(claim) {
    setEditingClaim(claim);
    setFormData({
      policyId: claim.policyId,
      claimNumber: claim.claimNumber,
      claimDate: formatDate(claim.claimDate),
      description: claim.description,
      requestedAmount: claim.requestedAmount,
      approvedAmount: claim.approvedAmount ?? '',
      status: claim.status
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingClaim(null);
    setFormData(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      ...formData,
      policyId: Number(formData.policyId),
      requestedAmount: Number(formData.requestedAmount),
      approvedAmount:
        formData.approvedAmount === '' ? null : Number(formData.approvedAmount)
    };

    try {
      if (editingClaim) {
        await httpClient.put(`/claims/${editingClaim.id}`, payload);
      } else {
        await httpClient.post('/claims', payload);
      }

      closeForm();
      loadClaims();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save claim');
    }
  }

  async function handleDelete(claimId) {
    const shouldDelete = window.confirm('Delete this claim?');

    if (!shouldDelete) {
      return;
    }

    try {
      await httpClient.delete(`/claims/${claimId}`);
      loadClaims();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete claim');
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    loadClaims(search, status);
  }

  return (
    <>
      <PageHeader title="Claims">
        <button className="btn btn-primary" onClick={openCreateForm}>
          Add Claim
        </button>
      </PageHeader>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="panel">
        <form className="toolbar" onSubmit={handleFilterSubmit}>
          <input
            className="form-control"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search claims"
            type="search"
            value={search}
          />
          <select
            className="form-select toolbar-select"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="reviewing">Reviewing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <button className="btn btn-outline-primary" type="submit">
            Filter
          </button>
        </form>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Claim No.</th>
                <th>Policy</th>
                <th>Client</th>
                <th>Status</th>
                <th>Requested</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Loading claims...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No claims found.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id}>
                    <td>{claim.claimNumber}</td>
                    <td>{claim.policyNumber}</td>
                    <td>{claim.clientName}</td>
                    <td>{claim.status}</td>
                    <td>{formatCurrency(claim.requestedAmount)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => openEditForm(claim)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(claim.id)}
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
              <h3>{editingClaim ? 'Edit Claim' : 'Add Claim'}</h3>
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
                <label className="form-label" htmlFor="claimNumber">
                  Claim Number
                </label>
                <input
                  className="form-control"
                  id="claimNumber"
                  name="claimNumber"
                  onChange={handleChange}
                  required
                  value={formData.claimNumber}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="claimDate">
                  Claim Date
                </label>
                <input
                  className="form-control"
                  id="claimDate"
                  name="claimDate"
                  onChange={handleChange}
                  required
                  type="date"
                  value={formData.claimDate}
                />
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
                  <option value="submitted">Submitted</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="requestedAmount">
                  Requested Amount
                </label>
                <input
                  className="form-control"
                  id="requestedAmount"
                  min="0"
                  name="requestedAmount"
                  onChange={handleChange}
                  required
                  step="0.01"
                  type="number"
                  value={formData.requestedAmount}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="approvedAmount">
                  Approved Amount
                </label>
                <input
                  className="form-control"
                  id="approvedAmount"
                  min="0"
                  name="approvedAmount"
                  onChange={handleChange}
                  step="0.01"
                  type="number"
                  value={formData.approvedAmount}
                />
              </div>
              <div className="form-grid-wide">
                <label className="form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  onChange={handleChange}
                  required
                  rows="3"
                  value={formData.description}
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-outline-secondary" onClick={closeForm} type="button">
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save Claim
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default ClaimsPage;

