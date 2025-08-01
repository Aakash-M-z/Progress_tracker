import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'user')[];
  fallback?: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
        Access denied. Please log in.
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 px-4 py-3 rounded-lg">
        Access denied. Insufficient permissions.
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRoute;