import { useEffect, PropsWithChildren } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = PropsWithChildren<{
  requireAdmin?: boolean;
}>;

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (!isAuthenticated) {
          console.log("Not authenticated, redirecting to login");
          router.push("/login");
        } else if (requireAdmin && !user?.is_admin) {
          console.log("Not admin, redirecting to home");
          router.push("/");
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, user, requireAdmin, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log("ProtectedRoute state:", { isAuthenticated, isLoading, user });

  if (!isAuthenticated || (requireAdmin && !user?.is_admin)) {
    return null;
  }

  return <>{children}</>;
}
