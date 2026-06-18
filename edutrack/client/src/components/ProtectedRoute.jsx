import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Usage:
 *  <ProtectedRoute />                      — any authenticated user
 *  <ProtectedRoute roles={['admin']} />    — admin only
 *  <ProtectedRoute roles={['admin','faculty']} />
 */
const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    // Redirect to their correct dashboard
    const home = user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
