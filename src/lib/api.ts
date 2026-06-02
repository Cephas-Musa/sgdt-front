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
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Si le body n'est PAS un FormData, et qu'on n'a pas spécifié de content-type, on met JSON par défaut
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
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
  return request<unknown[]>(`/dossiers${qs}`); // Retourne les dossiers actifs par défaut
}

export async function apiGetNextReference(): Promise<{ reference: string }> {
  return request<{ reference: string }>("/dossiers/next-reference");
}

export async function apiSearchDossier(reference: string): Promise<unknown> {
  return request<unknown>(`/dossiers/search/${reference}`);
}

export async function apiGetDossierHistory(): Promise<unknown[]> {
  return request<unknown[]>("/dossiers/history");
}

export async function apiGetDossier(id: string): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}`);
}

export async function apiGetTypeDossiers(): Promise<any[]> {
  return request<any[]>("/type-dossiers");
}

export async function apiCreateDossier(data: unknown): Promise<unknown> {
  return request<unknown>("/dossiers", { method: "POST", body: JSON.stringify(data) });
}

export async function apiUpdateDossier(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiDeleteDossier(id: string): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}`, { method: "DELETE" });
}

export async function apiUpdateDossierStatus(id: string, status: string): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function apiUploadAttachment(file: File): Promise<{ url: string; path: string; name: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ url: string; path: string; name: string }>("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function apiGetDossierDetails(id: string): Promise<any> {
  return request<any>(`/dossiers/${id}/details`);
}

export async function apiGetDossierAggregate(id: string): Promise<any> {
  return request<any>(`/dossiers/${id}/aggregate`);
}

export async function apiActionUpdateInfos(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/infos`, { method: "POST", body: JSON.stringify(data) });
}

export async function apiActionSubmitVerification(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/verification`, { method: "POST", body: JSON.stringify(data) });
}

export async function apiActionFlagAnomaly(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/anomaly`, { method: "POST", body: JSON.stringify(data) });
}

export async function apiActionAddRepresentation(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/representation`, { method: "POST", body: JSON.stringify(data) });
}

export async function apiActionLinkBarriere(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/barriere`, { method: "POST", body: JSON.stringify(data) });
}

export async function apiGetDossierChat(id: string): Promise<unknown[]> {
  return request<unknown[]>(`/dossiers/${id}/chat`);
}

export async function apiSendDossierChat(id: string, message: string, attachment?: string): Promise<unknown> {
  return request<unknown>(`/dossiers/${id}/chat`, { method: "POST", body: JSON.stringify({ message, attachment }) });
}

// ─── ALERTES ─────────────────────────────────────────────────────────────────

export async function apiGetAlertes(): Promise<unknown[]> {
  return request<unknown[]>("/alertes");
}

export async function apiMarkAlerteRead(id: number): Promise<unknown> {
  return request<unknown>(`/alertes/${id}/read`, { method: "PATCH" });
}

// ─── MOUVEMENTS (Brigadier) ──────────────────────────────────────────────────

export async function apiGetMouvements(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any[]>(`/mouvements${qs}`);
}

export async function apiCreateMouvement(data: unknown): Promise<any> {
  return request<any>("/mouvements", { method: "POST", body: JSON.stringify(data) });
}

// ─── VRACS ───────────────────────────────────────────────────────────────────

export async function apiGetVracs(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any[]>(`/vracs${qs}`);
}

export async function apiCreateVrac(data: unknown): Promise<any> {
  return request<any>("/vracs", { method: "POST", body: JSON.stringify(data) });
}

// ─── MOUVEMENTS STOCKAGE ─────────────────────────────────────────────────────

export async function apiGetMouvementsStockage(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any[]>(`/stockage-movements${qs}`);
}

export async function apiCreateStockageMouvement(data: unknown): Promise<any> {
  return request<any>("/stockage-movements", { method: "POST", body: JSON.stringify(data) });
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

// ─── TYPES DOSSIERS ─────────────────────────────────────────────────────────

export async function apiGetTypesDossiers(): Promise<unknown[]> {
  return request<unknown[]>("/config/types-dossiers");
}

export async function apiCreateTypeDossier(data: unknown): Promise<unknown> {
  return request<unknown>("/config/types-dossiers", { method: "POST", body: JSON.stringify(data) });
}

export async function apiUpdateTypeDossier(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/types-dossiers/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiDeleteTypeDossier(id: string): Promise<unknown> {
  return request<unknown>(`/config/types-dossiers/${id}`, { method: "DELETE" });
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

export async function apiUpdateUser(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
  return request<ApiUser>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiTopupWallet(id: string, amount: number): Promise<unknown> {
  return request<unknown>(`/users/${id}/topup`, { method: "POST", body: JSON.stringify({ amount }) });
}

export async function apiUpdateUserStatus(id: number, status: string): Promise<unknown> {
  return request<unknown>(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

export async function apiGetTransactions(): Promise<unknown[]> {
  return request<unknown[]>("/transactions");
}

export async function apiRechargeWallet(data: { user_id: number; amount: number; description?: string }): Promise<unknown> {
  return request<unknown>(`/users/${data.user_id}/topup`, { method: "POST", body: JSON.stringify({ amount: data.amount }) });
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
export async function apiCreateCountry(data: unknown): Promise<unknown> {
  return request<unknown>("/config/countries", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateCountry(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/countries/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteCountry(id: string): Promise<unknown> {
  return request<unknown>(`/config/countries/${id}`, { method: "DELETE" });
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
export async function apiCreateLocode(data: unknown): Promise<unknown> {
  return request<unknown>("/config/locodes", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateLocode(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/locodes/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteLocode(id: string): Promise<unknown> {
  return request<unknown>(`/config/locodes/${id}`, { method: "DELETE" });
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
export async function apiCreateCurrency(data: unknown): Promise<unknown> {
  return request<unknown>("/config/currencies", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateCurrency(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/config/currencies/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteCurrency(id: string): Promise<unknown> {
  return request<unknown>(`/config/currencies/${id}`, { method: "DELETE" });
}

export async function apiGetWarehouses(): Promise<unknown[]> {
  return request<unknown[]>("/warehouses");
}
export async function apiCreateWarehouse(data: unknown): Promise<unknown> {
  return request<unknown>("/warehouses", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateWarehouse(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteWarehouse(id: string): Promise<unknown> {
  return request<unknown>(`/warehouses/${id}`, { method: "DELETE" });
}

// ─── PARTENAIRES ─────────────────────────────────────────────────────────────

export async function apiGetPartenaires(): Promise<unknown[]> {
  return request<unknown[]>("/partenaires");
}
export async function apiCreatePartenaire(data: unknown): Promise<unknown> {
  return request<unknown>("/partenaires", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdatePartenaire(id: string, data: unknown): Promise<unknown> {
  return request<unknown>(`/partenaires/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeletePartenaire(id: string): Promise<unknown> {
  return request<unknown>(`/partenaires/${id}`, { method: "DELETE" });
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


// ─── REPRESENTATION ENTRIES ──────────────────────────────────────────────────

export async function apiGetRepresentationEntry(dossierId: string): Promise<any> {
  return request<any>(`/representation/dossier/${dossierId}`);
}

export async function apiSaveRepresentationEntry(dossierId: string, data: unknown): Promise<any> {
  return request<any>(`/representation/dossier/${dossierId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetRepresentationList(): Promise<any[]> {
  return request<any[]>("/representation");
}

export async function apiGetRepresentationStats(): Promise<any> {
  return request<any>("/representation/stats");
}

// ─── TYPING DOCS (BARRIERE ETRANGER) ─────────────────────────────────────────

export async function apiGetTypingDocsDirect(): Promise<any[]> {
  return request<any[]>("/typing-docs");
}

export async function apiCreateTypingDocDirect(data: unknown): Promise<any> {
  return request<any>("/typing-docs/direct", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiCreateTypingDocTranshipment(data: unknown): Promise<any> {
  return request<any>("/typing-docs/transhipment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetTypingDocsByDossier(dossierId: string): Promise<any> {
  return request<any>(`/typing-docs/dossier/${dossierId}`);
}

export async function apiGetTypingDocStats(params?: Record<string, string>): Promise<any> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/typing-docs/stats${qs}`);
}

export async function apiLinkTypingDocToDossier(docId: string, data: { dossier_dra: string; doc_type: "direct" | "transhipment" }): Promise<any> {
  return request<any>(`/typing-docs/${docId}/link`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ─── IT ENTRIES ──────────────────────────────────────────────────────────────

export async function apiGetItEntries(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any[]>(`/it-entries${qs}`);
}

export async function apiCreateItEntry(data: unknown): Promise<any> {
  return request<any>("/it-entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetItEntriesByDossier(dossierId: string): Promise<any[]> {
  return request<any[]>(`/it-entries/dossier/${dossierId}`);
}

// ─── ENTRY/EXIT POINTS ─────────────────────────────────────────────────────

export async function apiGetEntryPoints(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any[]>(`/config/entry-points${qs}`);
}

export async function apiCreateEntryPoint(data: any): Promise<any> {
  return request<any>("/config/entry-points", { method: "POST", body: JSON.stringify(data) });
}

export async function apiUpdateEntryPoint(id: string, data: any): Promise<any> {
  return request<any>(`/config/entry-points/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiDeleteEntryPoint(id: string): Promise<any> {
  return request<any>(`/config/entry-points/${id}`, { method: "DELETE" });
}

export async function apiGetExitPoints(params?: Record<string, string>): Promise<any[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any[]>(`/config/exit-points${qs}`);
}

export async function apiCreateExitPoint(data: any): Promise<any> {
  return request<any>("/config/exit-points", { method: "POST", body: JSON.stringify(data) });
}

export async function apiUpdateExitPoint(id: string, data: any): Promise<any> {
  return request<any>(`/config/exit-points/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiDeleteExitPoint(id: string): Promise<any> {
  return request<any>(`/config/exit-points/${id}`, { method: "DELETE" });
}

// ── Barrière Commissions / V1 Barrier ────────────────────────────────────

export async function apiGetCommissions(params?: Record<string, string>): Promise<any> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/commissions${qs}`);
}

export async function apiCalculateCommission(data: {
  barriere_code: string;
  typing_operator_id: string;
  document_type: string;
  reference_document: string;
  montant_base: number;
}): Promise<any> {
  return request<any>("/commissions/calculate", { method: "POST", body: JSON.stringify(data) });
}

export async function apiApproveCommission(id: string): Promise<any> {
  return request<any>(`/commissions/${id}/approve`, { method: "POST" });
}

export async function apiPayCommission(id: string): Promise<any> {
  return request<any>(`/commissions/${id}/pay`, { method: "POST" });
}

export async function apiCancelCommission(id: string, notes?: string): Promise<any> {
  return request<any>(`/commissions/${id}/cancel`, { method: "POST", body: JSON.stringify({ notes }) });
}

export async function apiGetCommissionStats(params?: Record<string, string>): Promise<any> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/commissions/stats${qs}`);
}

export async function apiGetOperatorCommissionBalance(operatorId: string): Promise<any> {
  return request<any>(`/commissions/operator/${operatorId}/balance`);
}

export async function apiGetBarrieres(): Promise<any[]> {
  return request<any[]>("/v1/barrier/barrieres");
}

export async function apiGetBarriere(id: string): Promise<any> {
  return request<any>(`/v1/barrier/barrieres/${id}`);
}

export async function apiGetBarriereBalance(id: string): Promise<any> {
  return request<any>(`/v1/barrier/barrieres/${id}/balance`);
}

export async function apiGetBarriereMovements(id: string): Promise<any[]> {
  return request<any[]>(`/v1/barrier/barrieres/${id}/movements`);
}

