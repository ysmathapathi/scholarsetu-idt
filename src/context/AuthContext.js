import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/auth/me")
      .then((result) => {
        if (active) setUser(result && (result.user || result));
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401 || error.status === 404) {
          setAccessToken(null);
          setUser(null);
        } else {
          setAuthError(error.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const result = await api.post("/auth/login", credentials);
    if (result && result.token) setAccessToken(result.token);
    setUser(result && (result.user || result));
    setAuthError("");
    return result;
  }, []);

  const register = useCallback(async (details) => {
    const result = await api.post("/auth/register", details);
    if (result && result.token) setAccessToken(result.token);
    if (result && result.user) setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      setAccessToken(null);
      setUser(null);
      setAuthError("");
    }
  }, []);

  const value = useMemo(() => ({
    user, loading, authError, signIn, register, signOut,
    setUser,
  }), [user, loading, authError, signIn, register, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
