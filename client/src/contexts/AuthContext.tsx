import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User } from "@shared/schema";
import { apiRequest, setAuthToken } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string, displayName: string, avatar: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync auth token to queryClient
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = useCallback(async (username: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username });
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, displayName: string, avatar: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", { username, displayName, avatar });
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (token) {
      apiRequest("POST", "/api/auth/logout", undefined).catch(() => {});
    }
    setUser(null);
    setToken(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
