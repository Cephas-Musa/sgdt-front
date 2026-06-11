import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Bell, AlertTriangle, Info, AlertCircle, CheckCircle2,
  Eye, EyeOff, CheckCheck, XCircle, Search, Filter, RefreshCw,
  Loader2, ExternalLink, Clock
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "@/dashboards/_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useApi, apiGetAlertes, apiGetAlerteStats, apiGetAlerteUnreadCount, apiMarkAlerteRead, apiAcknowledgeAlerte, apiResolveAlerte, type Alerte, type AlerteStats } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/alertes")({
  component: AlertesPage,
});

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  critical: { label: "Critique", color: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertCircle },
  high: { label: "Élevée", color: "bg-orange-500/10 text-orange-600 border-orange-500/30", icon: AlertTriangle },
  medium: { label: "Moyenne", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Info },
  low: { label: "Information", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Info },
};

const TYPE_LABELS: Record<string, string> = {
  vehicule_transbordement_etranger: "Transbordement étranger",
  vehicule_absent_entrepot_24h: "Absent entrepôt 24h",
  vehicule_barriere_controle_sans_entrepot: "Barrière contrôle sans entrepôt",
  vehicule_charge_sortie_sans_dedouanement: "Sortie sans dédouanement",
  vehicule_charge_sortie_apres_apurement: "Sortie après apurement",
  historique_manipulation_complet: "Historique manipulation",
  vehicule_entre_vide_sorti_charge: "Entré vide / sorti chargé",
  sortie_sans_ref_douane: "Sortie sans réf douane",
  sortie_sans_bon_sortie: "Sortie sans bon de sortie",
  doublon_ref_douane: "Doublon réf douane",
  doublon_bon_sortie: "Doublon bon de sortie",
  plaque_incoherence: "Plaque incohérente",
  incoherence_dra_t1: "Incohérence DRA/T1",
  vehicule_sortie_sans_barriere_24h: "Sortie sans barrière 24h",
};

function AlertesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchRef, setSearchRef] = useState("");

  const params: Record<string, string> = {};
  if (statusFilter !== "all") params.status = statusFilter;
  if (typeFilter !== "all") params.type = typeFilter;
  if (severityFilter !== "all") params.severity = severityFilter;

  const { data: alertes, loading, reload } = useApi(() => apiGetAlertes(params), [statusFilter, typeFilter, severityFilter]);
  const { data: stats, reload: reloadStats } = useApi(apiGetAlerteStats);
  const { data: unreadData, reload: reloadUnread } = useApi(apiGetAlerteUnreadCount);

  // Polling unread count every 30s
  useEffect(() => {
    const interval = setInterval(reloadUnread, 30000);
    return () => clearInterval(interval);
  }, [reloadUnread]);

  const handleMarkRead = async (id: number) => {
    try { await apiMarkAlerteRead(id); toast.success("Alerte marquée comme lue"); reload(); reloadStats(); reloadUnread(); }
    catch (e: any) { toast.error(e?.message || "Erreur"); }
  };

  const handleAcknowledge = async (id: number) => {
    try { await apiAcknowledgeAlerte(id); toast.success("Alerte acquittée"); reload(); reloadStats(); }
    catch (e: any) { toast.error(e?.message || "Erreur"); }
  };

  const handleResolve = async (id: number) => {
    try { await apiResolveAlerte(id); toast.success("Alerte résolue"); reload(); reloadStats(); }
    catch (e: any) { toast.error(e?.message || "Erreur"); }
  };

  const getSeverity = (s?: string) => SEVERITY_CONFIG[s] || SEVERITY_CONFIG.medium;
  const getTypeLabel = (t?: string) => TYPE_LABELS[t] || t || "Inconnu";

  const filtered = searchRef
    ? (alertes || []).filter((a: Alerte) =>
        a.title?.toLowerCase().includes(searchRef.toLowerCase()) ||
        a.message?.toLowerCase().includes(searchRef.toLowerCase()) ||
        a.dossier?.reference?.toLowerCase().includes(searchRef.toLowerCase()))
    : (alertes || []);

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Centre de notifications — Alertes métier dynamiques" />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Bell} label="Nouvelles" value={stats?.nouvelles ?? "..."} hint="Non lues" />
        <StatCard icon={Eye} label="Lues" value={stats?.lues ?? "..."} hint="En cours" />
        <StatCard icon={CheckCircle2} label="Traitées" value={stats?.traitees ?? "..."} hint="Résolues" />
        <StatCard icon={AlertCircle} label="Critiques" value={stats?.critiques ?? "..."} hint="Non résolues" />
        <StatCard icon={AlertTriangle} label="Élevées" value={stats?.elevees ?? "..."} hint="Non résolues" />
        <StatCard icon={Info} label="Moyennes" value={stats?.moyennes ?? "..."} hint="Non résolues" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="nouvelle">Nouvelle</SelectItem>
              <SelectItem value="lue">Lue</SelectItem>
              <SelectItem value="traitee">Traitée</SelectItem>
              <SelectItem value="rejetee">Rejetée</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Sévérité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Information</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchRef} onChange={e => setSearchRef(e.target.value)} className="pl-8 h-9 w-[200px]" />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={() => { reload(); reloadStats(); reloadUnread(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
          </Button>
        </div>
      </div>

      {/* Alert list */}
      <Panel title={`Alertes (${filtered.length})`} actions={
        <span className="text-xs text-muted-foreground">
          {unreadData ? `${unreadData.unread_count} non lue(s)` : ""}
        </span>
      }>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">Aucune alerte trouvée</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((a: Alerte) => {
              const sev = getSeverity(a.severity);
              const SevIcon = sev.icon;
              const isUnresolved = !a.resolved_at;
              return (
                <div key={a.id} className={`flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors ${!a.is_read ? 'bg-accent/5' : ''}`}>
                  <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${sev.color}`}>
                    <SevIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{a.title || "—"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>
                      </div>
                      <Badge variant={a.resolved_at ? "default" : a.is_read ? "secondary" : "destructive"} className="shrink-0 text-[10px]">
                        {a.resolved_at ? "Traitée" : a.is_read ? "Lue" : "Nouvelle"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{getTypeLabel(a.type)}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${sev.color.split(' ')[1] || ''}`}>{sev.label}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {a.created_at ? new Date(a.created_at).toLocaleString() : "—"}
                      </span>
                      {a.dossier?.reference && (
                        <Link to="/app/dossiers/$dossierId" params={{ dossierId: a.dossier_id! }} className="text-[10px] text-accent hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> {a.dossier.reference}
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {!a.is_read && (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => handleMarkRead(a.id)}>
                          <Eye className="h-3 w-3 mr-1" /> Marquer lue
                        </Button>
                      )}
                      {a.is_read && !a.acknowledged_at && isUnresolved && (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => handleAcknowledge(a.id)}>
                          <CheckCheck className="h-3 w-3 mr-1" /> Acquitter
                        </Button>
                      )}
                      {isUnresolved && (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => handleResolve(a.id)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Résoudre
                        </Button>
                      )}
                      <Link to="/app/alertes/$alerteId" params={{ alerteId: String(a.id) }}>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]">
                          Détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
