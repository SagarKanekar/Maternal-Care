import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Redirects unauthenticated users to /login.
 * Shows a loading screen while auth state is being determined.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface RoleRouteProps {
  role: UserRole;
  children: React.ReactNode;
}

/**
 * Requires the authenticated user to have a specific role.
 * If the user has the wrong role they are redirected to their own dashboard.
 * Must be used inside <ProtectedRoute>.
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({ role, children }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== role) {
    const ownDashboard = profile.role === "mother" ? "/mother-dashboard" : "/doctor-dashboard";
    return <Navigate to={ownDashboard} replace />;
  }

  return <>{children}</>;
};
