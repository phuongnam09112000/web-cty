import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiFetch, setUnauthorizedHandler } from "../api/client";
import type { Me, PermissionKey } from "../api/types";

type AuthContextValue = {
  user: Me | null;
  loading: boolean;
  can: (key: PermissionKey) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function hasPermission(user: Me | null, key: PermissionKey): boolean {
  if (!user) return false;
  if (user.role.isSystem) return true;
  if (user.permissions.includes(key)) return true;
  return key === "users.view" && user.permissions.includes("users.manage");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      setUser(null);
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, navigate]);

  const refresh = useCallback(async () => {
    try {
      setUser(await apiFetch<Me>("/auth/me"));
    } catch (error) {
      if (error instanceof ApiError && error.status === 403 && error.code === "PASSWORD_CHANGE_REQUIRED") {
        return;
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await apiFetch("/auth/login", { method: "POST", body: { email, password } });
      setUser(await apiFetch<Me>("/auth/me"));
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, can: (key) => hasPermission(user, key), login, logout, refresh }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
