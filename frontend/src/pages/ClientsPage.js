import { useEffect, useState } from 'react';

import httpClient from '../api/httpClient';
import PageHeader from './shared/PageHeader';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  personalNumber: '',
  address: '',
  city: ''
};

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadClients(searchValue = search) {
    setIsLoading(true);
    setError('');

    try {
      const response = await httpClient.get('/clients', {
        params: searchValue ? { search: searchValue } : {}
      });
      setClients(response.data.clients);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load clients');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadClients('');
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function openCreateForm() {
    setEditingClient(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(client) {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      personalNumber: client.personalNumber,
      address: client.address,
      city: client.city
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingClient(null);
    setFormData(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      if (editingClient) {
        await httpClient.put(`/clients/${editingClient.id}`, formData);
      } else {
        await httpClient.post('/clients', formData);
      }

      closeForm();
      loadClients();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save client');
    }
  }

  async function handleDelete(clientId) {
    const shouldDelete = window.confirm('Delete this client?');

    if (!shouldDelete) {
      return;
    }

    try {
      await httpClient.delete(`/clients/${clientId}`);
      loadClients();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete client');
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadClients(search);
  }

  return (
    <>
      <PageHeader title="Clients">
        <button className="btn btn-primary" onClick={openCreateForm}>
          Add Client
        </button>
      </PageHeader>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="panel">
        <form className="toolbar" onSubmit={handleSearchSubmit}>
          <input
            className="form-control"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients"
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
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      {client.firstName} {client.lastName}
                    </td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.city}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => openEditForm(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(client.id)}
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
              <h3>{editingClient ? 'Edit Client' : 'Add Client'}</h3>
              <button className="btn-close" onClick={closeForm} type="button" />
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="firstName">
                  First Name
                </label>
                <input
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  onChange={handleChange}
                  required
                  value={formData.firstName}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  className="form-control"
                  id="lastName"
                  name="lastName"
                  onChange={handleChange}
                  required
                  value={formData.lastName}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-control"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  required
                  type="email"
                  value={formData.email}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  className="form-control"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  required
                  value={formData.phone}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="personalNumber">
                  Personal Number
                </label>
                <input
                  className="form-control"
                  id="personalNumber"
                  name="personalNumber"
                  onChange={handleChange}
                  required
                  value={formData.personalNumber}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="city">
                  City
                </label>
                <input
                  className="form-control"
                  id="city"
                  name="city"
                  onChange={handleChange}
                  required
                  value={formData.city}
                />
              </div>
              <div className="form-grid-wide">
                <label className="form-label" htmlFor="address">
                  Address
                </label>
                <input
                  className="form-control"
                  id="address"
                  name="address"
                  onChange={handleChange}
                  required
                  value={formData.address}
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-outline-secondary" onClick={closeForm} type="button">
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save Client
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default ClientsPage;

