"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSSOAndLoad = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const ssoToken = params.get("sso");
        if (ssoToken) {
          try {
            const decoded = atob(ssoToken);
            const [email, password] = decoded.split(":");
            if (email && password) {
              await login(email, password);
              const cleanUrl = window.location.pathname + window.location.search.replace(/[\?&]sso=[^&]+/, "").replace(/^&/, "?");
              window.history.replaceState({}, document.title, cleanUrl);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("SSO authentication failed:", e);
          }
        }
      }

      const savedUser = localStorage.getItem("skilizee_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing saved user session:", e);
          localStorage.removeItem("skilizee_user");
        }
      }
      setLoading(false);
    };

    handleSSOAndLoad();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("skilizee_user", JSON.stringify(data.user));
        localStorage.setItem("skilizee_sso", btoa(`${email}:${password}`));
        return data.user;
      } else {
        throw new Error("Invalid response from login server");
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skilizee_user");
    localStorage.removeItem("skilizee_sso");
    if (typeof window !== "undefined") {
      window.location.href = "/?login=true";
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      // Re-fetch users list or profile to sync role updates
      const res = await fetch("/api/admin/users", {
        headers: {
          "x-admin-email": user.email,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const me = data.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (me) {
          const { password: _, ...safeMe } = me;
          setUser(safeMe);
          localStorage.setItem("skilizee_user", JSON.stringify(safeMe));
        }
      }
    } catch (err) {
      console.error("Error refreshing user session:", err);
    }
  };

  const hasAccess = user ? (user.roles.includes("social_media") || user.isAdmin) : false;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasAccess, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
