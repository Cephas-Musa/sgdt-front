import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./roles";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  phone?: string;
  email?: string;
  bureau?: string;
  matricule?: string;
  avatar?: string; // base64 data URL
  mustChangePassword?: boolean;
}

interface AuthCtx {
  user: User | null;
  login: (username: string, role: Role, opts?: { firstLogin?: boolean }) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "douanes.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login: AuthCtx["login"] = (username, role, opts) => {
    persist({
      id: crypto.randomUUID(),
      username,
      fullName: username,
      role,
      mustChangePassword: opts?.firstLogin ?? false,
    });
  };

  const logout = () => persist(null);

  const updateUser = (patch: Partial<User>) => {
    if (!user) return;
    persist({ ...user, ...patch });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
