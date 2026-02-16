"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import {
  clearSession,
  getRefreshToken,
  getSessionMeta,
  setAccessToken,
  setRefreshToken,
  setSessionMeta,
} from "@/utils/tokenManager";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setSessionFromPayload = useCallback((payload) => {
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    setSessionMeta({
      expiresAtUtc: payload.expiresAtUtc,
      roles: payload.roles || [],
    });

    setUser({
      roles: payload.roles || [],
      expiresAtUtc: payload.expiresAtUtc || null,
      tokenType: payload.tokenType || "Bearer",
    });
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const payload = await authService.login(credentials);
      setSessionFromPayload(payload);
      router.replace("/dashboard");
      return payload;
    },
    [router, setSessionFromPayload],
  );

  const register = useCallback(
    async (registrationData) => {
      const payload = await authService.register(registrationData);
      if (payload?.accessToken) {
        setSessionFromPayload(payload);
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
      return payload;
    },
    [router, setSessionFromPayload],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    await authService.logout({ refreshToken });
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    router.replace("/login");
  }, [router]);

  const refreshSession = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }

    try {
      const payload = await authService.refresh({ refreshToken });
      setSessionFromPayload({
        ...payload,
        refreshToken: payload.refreshToken || refreshToken,
      });
      return true;
    } catch {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, [setSessionFromPayload]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const meta = getSessionMeta();
      if (meta.roles?.length) {
        setUser({
          roles: meta.roles,
          expiresAtUtc: meta.expiresAtUtc,
          tokenType: "Bearer",
        });
      }

      const ok = await refreshSession();
      if (mounted) {
        setIsLoading(false);
        if (!ok) {
          setUser(null);
        }
      }
    };

    bootstrap();

    const onForceLogout = () => {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/login");
    };

    window.addEventListener("auth:logout", onForceLogout);
    return () => {
      mounted = false;
      window.removeEventListener("auth:logout", onForceLogout);
    };
  }, [refreshSession, router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, isAuthenticated, isLoading, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
