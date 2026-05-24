import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import httpClient from '../api/httpClient';
import { clearTokens, getAccessToken } from '../utils/authStorage';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [authState, setAuthState] = useState(
    getAccessToken() ? 'checking' : 'unauthenticated'
  );

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (!getAccessToken()) {
        setAuthState('unauthenticated');
        return;
      }

      try {
        await httpClient.get('/auth/me');

        if (isMounted) {
          setAuthState('authenticated');
        }
      } catch (error) {
        clearTokens();

        if (isMounted) {
          setAuthState('unauthenticated');
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === 'checking') {
    return (
      <main className="route-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </main>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
