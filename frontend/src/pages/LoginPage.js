import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import httpClient from '../api/httpClient';
import { saveTokens } from '../utils/authStorage';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await httpClient.post('/auth/login', formData);
      saveTokens(response.data.accessToken, response.data.refreshToken);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to log in with these credentials'
      );
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <h1>Insurance Management</h1>
        <form className="d-grid gap-3" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger mb-0">{error}</div>}
          <div>
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              className="form-control"
              id="email"
              name="email"
              onChange={handleChange}
              type="email"
              value={formData.email}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-control"
              id="password"
              name="password"
              onChange={handleChange}
              type="password"
              value={formData.password}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;

