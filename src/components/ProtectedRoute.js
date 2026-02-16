"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function ProtectedRoute({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!isPublicRoute && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isPublicRoute && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <Loader text="Checking session..." />;
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!isPublicRoute && !isAuthenticated) {
    return <Loader text="Redirecting to login..." />;
  }

  return children;
}
