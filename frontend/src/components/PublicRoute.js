import { Navigate } from 'react-router-dom';

import { getAccessToken } from '../utils/authStorage';

function PublicRoute({ children }) {
  if (getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;

