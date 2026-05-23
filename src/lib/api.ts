/**
 * Service API — communication avec le backend Laravel
 * Toutes les requêtes utilisent le token Bearer stocké dans localStorage.
 */

const API_BASE = "http://localhost:8000/api";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("douanes.token");
    return raw ?? null;
  } catch {
    return null;
  }
}

function saveToken(token: string) {
  localStorage.setItem("douanes.token", token);
}

export function clearToken() {
  localStorage.removeItem("douanes.token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Erreur réseau" }));
    throw new ApiError(res.status, error?.message ?? "Erreur inconnue", error);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  status: "success" | "otp_required";
  access_token?: string;
  token_type?: string;
  sms_sent?: boolean;
  phone_number?: string;
  message?: string;
  user?: ApiUser;
}

export interface ApiUser {
  id: number;
  phone_number: string;
  full_name: string;
  role: string;
  bureau?: string;
  province?: string;
  matricule?: string;
  wallet_balance?: number;
}

export async function apiLogin(
  phone_number: string,
  password: string
): Promise<LoginResponse> {
  return request<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ phone_number, password }),
  });
}

export async function apiVerifyOtp(
  phone_number: string,
  code: string
): Promise<LoginResponse> {
  const res = await request<LoginResponse>("/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone_number, code }),
  });
  if (res.access_token) saveToken(res.access_token);
  return res;
}

export async function apiMe(): Promise<ApiUser> {
  return request<ApiUser>("/me");
}

export async function apiLogout(): Promise<void> {
  await request("/logout", { method: "POST" }).catch(() => {});
  clearToken();
}

export function apiSaveToken(token: string) {
  saveToken(token);
}

// ─── DOSSIERS ────────────────────────────────────────────────────────────────

export async function apiGetDossiers(params?: Record<string, string>): Promise<unknown[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<unknown[]>(`/dossiers${qs}`);
}

export async function apiGetDossier(id: string): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}`);
}

export async function apiCreateDossier(data: unknown): Promise<unknown> {
  return request<unknown>("/dossiers", { method: "POST", body: JSON.stringify(data) });
}

export async function apiUpdateDossierStatus(id: string, status: string): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── ALERTES ─────────────────────────────────────────────────────────────────

export async function apiGetAlertes(): Promise<unknown[]> {
  return request<unknown[]>("/alertes");
}

export async function apiMarkAlerteRead(id: number): Promise<unknown> {
  return request<unknown>(`/alertes/${id}/read`, { method: "PATCH" });
}

// ─── BARRIÈRE ENTRIES ────────────────────────────────────────────────────────

export async function apiGetBarriereEntries(): Promise<unknown[]> {
  return request<unknown[]>("/barriere-entries");
}

export async function apiCreateBarriereEntry(data: unknown): Promise<unknown> {
  return request<unknown>("/barriere-entries", { method: "POST", body: JSON.stringify(data) });
}

// ─── EMPTY MANIFESTS ─────────────────────────────────────────────────────────

export async function apiGetEmptyManifests(): Promise<unknown[]> {
  return request<unknown[]>("/empty-manifests");
}

export async function apiCreateEmptyManifest(data: unknown): Promise<unknown> {
  return request<unknown>("/empty-manifests", { method: "POST", body: JSON.stringify(data) });
}

export async function apiPayEmptyManifest(id: number): Promise<unknown> {
  return request<unknown>(`/empty-manifests/${id}/pay`, { method: "POST" });
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export async function apiGetConversations(): Promise<unknown[]> {
  return request<unknown[]>("/chat/conversations");
}

export async function apiCreateConversation(data: unknown): Promise<unknown> {
  return request<unknown>("/chat/conversations", { method: "POST", body: JSON.stringify(data) });
}

export async function apiGetMessages(convId: number): Promise<unknown[]> {
  return request<unknown[]>(`/chat/conversations/${convId}/messages`);
}

export async function apiSendMessage(convId: number, content: string): Promise<unknown> {
  return request<unknown>(`/chat/conversations/${convId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// ─── USERS / COMPTES ─────────────────────────────────────────────────────────

export async function apiGetUsers(): Promise<unknown[]> {
  return request<unknown[]>("/users");
}

export async function apiCreateUser(data: unknown): Promise<unknown> {
  return request<unknown>("/users", { method: "POST", body: JSON.stringify(data) });
}

export async function apiDeleteUser(id: number): Promise<unknown> {
  return request<unknown>(`/users/${id}`, { method: "DELETE" });
}

export async function apiUpdateUser(id: number, data: unknown): Promise<unknown> {
  return request<unknown>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiUpdateUserStatus(id: number, status: string): Promise<unknown> {
  return request<unknown>(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

export async function apiGetTransactions(): Promise<unknown[]> {
  return request<unknown[]>("/transactions");
}

export async function apiRechargeWallet(data: unknown): Promise<unknown> {
  return request<unknown>("/transactions/recharge", { method: "POST", body: JSON.stringify(data) });
}

// ─── APUREMENTS ──────────────────────────────────────────────────────────────

export async function apiGetApurements(): Promise<unknown[]> {
  return request<unknown[]>("/apurements");
}

export async function apiCreateApurement(data: unknown): Promise<unknown> {
  return request<unknown>("/apurements", { method: "POST", body: JSON.stringify(data) });
}

export async function apiUpdateApurementStatus(id: number, status: string): Promise<unknown> {
  return request<unknown>(`/apurements/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── COLISAGE ────────────────────────────────────────────────────────────────

export async function apiGetColisageAffectations(): Promise<unknown[]> {
  return request<unknown[]>("/colisage/affectations");
}

export async function apiGetColisageRapports(): Promise<unknown[]> {
  return request<unknown[]>("/colisage/rapports");
}

// ─── CONFIGURATION ───────────────────────────────────────────────────────────

export async function apiGetCountries(): Promise<unknown[]> {
  return request<unknown[]>("/config/countries");
}

export async function apiGetBureauxDouaniers(): Promise<unknown[]> {
  return request<unknown[]>("/config/customs-offices");
}
export async function apiCreateBureauDouanier(data: unknown): Promise<unknown> {
  return request<unknown>("/config/customs-offices", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateBureauDouanier(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/customs-offices/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteBureauDouanier(id: string): Promise<unknown> {
  return request<unknown>(`/config/customs-offices/${id}`, { method: "DELETE" });
}

export async function apiGetBureauxRepresentation(): Promise<unknown[]> {
  return request<unknown[]>("/config/representation-offices");
}
export async function apiCreateBureauRepresentation(data: unknown): Promise<unknown> {
  return request<unknown>("/config/representation-offices", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateBureauRepresentation(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/representation-offices/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteBureauRepresentation(id: string): Promise<unknown> {
  return request<unknown>(`/config/representation-offices/${id}`, { method: "DELETE" });
}

export async function apiGetLocodes(): Promise<unknown[]> {
  return request<unknown[]>("/config/locodes");
}

export async function apiGetProvincialDirections(): Promise<unknown[]> {
  return request<unknown[]>("/config/provincial-directions");
}
export async function apiCreateProvincialDirection(data: unknown): Promise<unknown> {
  return request<unknown>("/config/provincial-directions", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateProvincialDirection(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/provincial-directions/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteProvincialDirection(id: string): Promise<unknown> {
  return request<unknown>(`/config/provincial-directions/${id}`, { method: "DELETE" });
}

export async function apiGetCurrencies(): Promise<unknown[]> {
  return request<unknown[]>("/config/currencies");
}

export async function apiGetWarehouses(): Promise<unknown[]> {
  return request<unknown[]>("/config/warehouses");
}
export async function apiCreateWarehouse(data: unknown): Promise<unknown> {
  return request<unknown>("/config/warehouses", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateWarehouse(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteWarehouse(id: string): Promise<unknown> {
  return request<unknown>(`/config/warehouses/${id}`, { method: "DELETE" });
}

// ─── HOOK UTILITAIRE ─────────────────────────────────────────────────────────

/** Hook simple pour charger des données depuis l'API avec état loading/error */
import { useState, useEffect } from "react";

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? "Erreur"); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: () => fetcher().then(setData).catch(() => {}) };
}
