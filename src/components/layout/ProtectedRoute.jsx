import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

export function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullScreen />;
  if (!currentUser)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { currentUser, isAdmin, loading, profileLoading } = useAuth();
  const location = useLocation();

  // Wait for BOTH auth state AND Firestore profile to load
  if (loading || profileLoading) return <Spinner fullScreen />;

  if (!currentUser)
    return <Navigate to="/admin/login" state={{ from: location }} replace />;

  // Profile loaded but role is not admin
  if (!isAdmin)
    return <Navigate to="/admin/login" replace />;

  return children;
}