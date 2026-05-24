import { useEffect, useState } from 'react';

import httpClient from '../api/httpClient';
import PageHeader from './shared/PageHeader';

const emptyForm = {
  name: '',
  description: '',
  basePrice: '',
  isActive: true
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0);
}

function InsuranceTypesPage() {
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [editingType, setEditingType] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadInsuranceTypes(searchValue = search) {
    setIsLoading(true);
    setError('');

    try {
      const response = await httpClient.get('/insurance-types', {
        params: searchValue ? { search: searchValue } : {}
      });
      setInsuranceTypes(response.data.insuranceTypes);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to load insurance types'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInsuranceTypes('');
  }, []);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function openCreateForm() {
    setEditingType(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(insuranceType) {
    setEditingType(insuranceType);
    setFormData({
      name: insuranceType.name,
      description: insuranceType.description || '',
      basePrice: insuranceType.basePrice,
      isActive: insuranceType.isActive
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingType(null);
    setFormData(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      ...formData,
      basePrice: Number(formData.basePrice)
    };

    try {
      if (editingType) {
        await httpClient.put(`/insurance-types/${editingType.id}`, payload);
      } else {
        await httpClient.post('/insurance-types', payload);
      }

      closeForm();
      loadInsuranceTypes();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to save insurance type'
      );
    }
  }

  async function handleDelete(typeId) {
    const shouldDelete = window.confirm('Delete this insurance type?');

    if (!shouldDelete) {
      return;
    }

    try {
      await httpClient.delete(`/insurance-types/${typeId}`);
      loadInsuranceTypes();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to delete insurance type'
      );
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadInsuranceTypes(search);
  }

  return (
    <>
      <PageHeader title="Insurance Types">
        <button className="btn btn-primary" onClick={openCreateForm}>
          Add Type
        </button>
      </PageHeader>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="panel">
        <form className="toolbar" onSubmit={handleSearchSubmit}>
          <input
            className="form-control"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search insurance types"
            type="search"
            value={search}
          />
          <button className="btn btn-outline-primary" type="submit">
            Search
          </button>
        </form>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Base Price</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    Loading insurance types...
                  </td>
                </tr>
              ) : insuranceTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No insurance types found.
                  </td>
                </tr>
              ) : (
                insuranceTypes.map((insuranceType) => (
                  <tr key={insuranceType.id}>
                    <td>{insuranceType.name}</td>
                    <td>{insuranceType.description || '-'}</td>
                    <td>{formatCurrency(insuranceType.basePrice)}</td>
                    <td>{insuranceType.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => openEditForm(insuranceType)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(insuranceType.id)}
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
              <h3>{editingType ? 'Edit Insurance Type' : 'Add Insurance Type'}</h3>
              <button className="btn-close" onClick={closeForm} type="button" />
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input
                  className="form-control"
                  id="name"
                  name="name"
                  onChange={handleChange}
                  required
                  value={formData.name}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="basePrice">
                  Base Price
                </label>
                <input
                  className="form-control"
                  id="basePrice"
                  min="0"
                  name="basePrice"
                  onChange={handleChange}
                  required
                  step="0.01"
                  type="number"
                  value={formData.basePrice}
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
                  rows="3"
                  value={formData.description}
                />
              </div>
              <div className="form-check form-grid-wide">
                <input
                  checked={formData.isActive}
                  className="form-check-input"
                  id="isActive"
                  name="isActive"
                  onChange={handleChange}
                  type="checkbox"
                />
                <label className="form-check-label" htmlFor="isActive">
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button className="btn btn-outline-secondary" onClick={closeForm} type="button">
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save Type
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default InsuranceTypesPage;

