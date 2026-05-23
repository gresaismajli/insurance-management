import { Navigate } from 'react-router-dom';

import { getAccessToken } from '../utils/authStorage';

function ProtectedRoute({ children }) {
  if (!getAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

