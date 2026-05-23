import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  apiMe,
  apiLogout,
  apiSaveToken,
  clearToken,
  type ApiUser,
} from "./api";

/** Utilisateur connecté côté frontend */
export interface User {
  id: string;
  username: string;    // = phone_number
  fullName: string;
  role: string;
  phone?: string;
  bureau?: string;
  province?: string;
  matricule?: string;
  walletBalance?: number;
  avatar?: string;     // base64 data URL (profil)
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  /** Appelé après un login ou verify-otp réussi : sauvegarde le token + recharge le profil */
  finalizeLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "douanes.user";

function toFrontendUser(u: ApiUser): User {
  return {
    id: String(u.id),
    username: u.phone_number,
    fullName: u.full_name,
    role: u.role,
    phone: u.phone_number,
    bureau: u.bureau,
    province: u.province,
    matricule: u.matricule,
    walletBalance: u.wallet_balance,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Au démarrage : si un token est déjà présent, recharger le profil depuis l'API
  useEffect(() => {
    const token = localStorage.getItem("douanes.token");
    if (!token) {
      // Pas de token — essayer l'ancienne session locale (compatibilité)
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      setLoading(false);
      return;
    }

    apiMe()
      .then((apiUser) => {
        const u = toFrontendUser(apiUser);
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      })
      .catch(() => {
        // Token invalide ou expiré
        clearToken();
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const finalizeLogin = async (token: string) => {
    apiSaveToken(token);
    const apiUser = await apiMe();
    const u = toFrontendUser(apiUser);
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const logout = async () => {
    await apiLogout();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, finalizeLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
