import { useEffect, useState } from 'react';

import httpClient from '../api/httpClient';
import Notification from '../components/Notification';
import PageHeader from './shared/PageHeader';

const emptyForm = {
  clientId: '',
  insuranceTypeId: '',
  policyNumber: '',
  startDate: '',
  endDate: '',
  premiumAmount: '',
  coverageAmount: '',
  status: 'active'
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

function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [clients, setClients] = useState([]);
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadPolicies(searchValue = search, statusValue = status) {
    setIsLoading(true);
    setError('');

    try {
      const response = await httpClient.get('/policies', {
        params: {
          ...(searchValue ? { search: searchValue } : {}),
          ...(statusValue ? { status: statusValue } : {})
        }
      });
      setPolicies(response.data.policies);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load policies');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadFormOptions() {
    try {
      const [clientsResponse, typesResponse] = await Promise.all([
        httpClient.get('/clients'),
        httpClient.get('/insurance-types')
      ]);
      setClients(clientsResponse.data.clients);
      setInsuranceTypes(typesResponse.data.insuranceTypes);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load form options');
    }
  }

  useEffect(() => {
    loadPolicies('', '');
    loadFormOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function openCreateForm() {
    setEditingPolicy(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(policy) {
    setEditingPolicy(policy);
    setFormData({
      clientId: policy.clientId,
      insuranceTypeId: policy.insuranceTypeId,
      policyNumber: policy.policyNumber,
      startDate: formatDate(policy.startDate),
      endDate: formatDate(policy.endDate),
      premiumAmount: policy.premiumAmount,
      coverageAmount: policy.coverageAmount,
      status: policy.status
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingPolicy(null);
    setFormData(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      ...formData,
      clientId: Number(formData.clientId),
      insuranceTypeId: Number(formData.insuranceTypeId),
      premiumAmount: Number(formData.premiumAmount),
      coverageAmount: Number(formData.coverageAmount)
    };

    try {
      if (editingPolicy) {
        await httpClient.put(`/policies/${editingPolicy.id}`, payload);
        setSuccess('Policy updated successfully.');
      } else {
        await httpClient.post('/policies', payload);
        setSuccess('Policy created successfully.');
      }

      closeForm();
      loadPolicies();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save policy');
    }
  }

  async function handleDelete(policyId) {
    const shouldDelete = window.confirm('Delete this policy?');

    if (!shouldDelete) {
      return;
    }

    try {
      await httpClient.delete(`/policies/${policyId}`);
      setSuccess('Policy deleted successfully.');
      loadPolicies();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete policy');
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    loadPolicies(search, status);
  }

  function clearFilters() {
    setSearch('');
    setStatus('');
    loadPolicies('', '');
  }

  return (
    <>
      <PageHeader title="Policies">
        <button className="btn btn-primary" onClick={openCreateForm}>
          Add Policy
        </button>
      </PageHeader>

      {error && <div className="alert alert-danger">{error}</div>}
      <Notification message={success} onClose={() => setSuccess('')} />

      <section className="panel">
        <form className="toolbar" onSubmit={handleFilterSubmit}>
          <input
            className="form-control"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search policies"
            type="search"
            value={search}
          />
          <select
            className="form-select toolbar-select"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
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
                <th>Policy No.</th>
                <th>Client</th>
                <th>Type</th>
                <th>Premium</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Loading policies...
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No policies found.
                  </td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy.id}>
                    <td>{policy.policyNumber}</td>
                    <td>{policy.clientName}</td>
                    <td>{policy.insuranceTypeName}</td>
                    <td>{formatCurrency(policy.premiumAmount)}</td>
                    <td>{policy.status}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => openEditForm(policy)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(policy.id)}
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
              <h3>{editingPolicy ? 'Edit Policy' : 'Add Policy'}</h3>
              <button className="btn-close" onClick={closeForm} type="button" />
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="clientId">
                  Client
                </label>
                <select
                  className="form-select"
                  id="clientId"
                  name="clientId"
                  onChange={handleChange}
                  required
                  value={formData.clientId}
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="insuranceTypeId">
                  Insurance Type
                </label>
                <select
                  className="form-select"
                  id="insuranceTypeId"
                  name="insuranceTypeId"
                  onChange={handleChange}
                  required
                  value={formData.insuranceTypeId}
                >
                  <option value="">Select type</option>
                  {insuranceTypes.map((insuranceType) => (
                    <option key={insuranceType.id} value={insuranceType.id}>
                      {insuranceType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="policyNumber">
                  Policy Number
                </label>
                <input
                  className="form-control"
                  id="policyNumber"
                  name="policyNumber"
                  onChange={handleChange}
                  required
                  value={formData.policyNumber}
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
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  onChange={handleChange}
                  required
                  type="date"
                  value={formData.startDate}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="endDate">
                  End Date
                </label>
                <input
                  className="form-control"
                  id="endDate"
                  name="endDate"
                  onChange={handleChange}
                  required
                  type="date"
                  value={formData.endDate}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="premiumAmount">
                  Premium Amount
                </label>
                <input
                  className="form-control"
                  id="premiumAmount"
                  min="0"
                  name="premiumAmount"
                  onChange={handleChange}
                  required
                  step="0.01"
                  type="number"
                  value={formData.premiumAmount}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="coverageAmount">
                  Coverage Amount
                </label>
                <input
                  className="form-control"
                  id="coverageAmount"
                  min="0"
                  name="coverageAmount"
                  onChange={handleChange}
                  required
                  step="0.01"
                  type="number"
                  value={formData.coverageAmount}
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-outline-secondary" onClick={closeForm} type="button">
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save Policy
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default PoliciesPage;
