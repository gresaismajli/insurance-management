import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import httpClient from '../api/httpClient';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await httpClient.post('/auth/register', formData);
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to create an account with these details'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <h1>Create Account</h1>
        <form className="d-grid gap-3" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger mb-0">{error}</div>}
          <div>
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="form-control"
              id="fullName"
              name="fullName"
              onChange={handleChange}
              required
              type="text"
              value={formData.fullName}
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
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-control"
              id="password"
              minLength="8"
              name="password"
              onChange={handleChange}
              required
              type="password"
              value={formData.password}
            />
          </div>
          <button className="btn btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;

