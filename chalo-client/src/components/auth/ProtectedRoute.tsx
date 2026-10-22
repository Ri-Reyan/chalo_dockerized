"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, type UserRole } from "@/context/auth.context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Route protection and role authorization component.
 * Ensures unauthenticated users cannot access dashboard views and prevents
 * role cross-access (e.g., Drivers accessing Customer dashboard or vice versa).
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [hasTimedOut, setHasTimedOut] = React.useState(false);

  // Guarantee client mount synchronization and a 2.5s maximum loading safety release
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const rolesKey = allowedRoles?.slice().sort().join(",") || "";

  useEffect(() => {
    if (!mounted) return;

    // If still resolving session and user not cached, wait until resolved or timed out
    if (loading && !user && !hasTimedOut) return;

    if (!isAuthenticated) {
      // Preserve intended destination path in query parameter
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
      return;
    }

    // Role-based authorization guard
    if (user && allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on actual role
        const targetDashboard =
          user.role === "DRIVER" ? "/driver" : "/customer";
        router.replace(targetDashboard);
      }
    }
  }, [mounted, loading, isAuthenticated, user, rolesKey, router, pathname, hasTimedOut]);

  // SSR & initial client hydration: render consistent loading shell so server & client trees match identically
  if (!mounted || (loading && !user && !hasTimedOut)) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-4">
        <div className="relative w-12 h-12 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-md animate-pulse">
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-sm font-bold text-[#292524] tracking-wide">
            Verifying Chalo Session
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Securing connection with ride servers...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role - return null while redirect effect runs
  if (!isAuthenticated) {
    return null;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
