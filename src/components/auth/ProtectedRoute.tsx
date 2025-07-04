import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // TODO: Add authentication logic here
  // For now, just render children without auth check
  return <>{children}</>;
};

export default ProtectedRoute;
