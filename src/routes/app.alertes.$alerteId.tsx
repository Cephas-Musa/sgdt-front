import { createFileRoute, Link, useParams, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, AlertCircle, AlertTriangle, Info,
  Clock, ExternalLink, User, Eye, CheckCheck, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApi, apiGetAlerte, apiMarkAlerteRead, apiAcknowledgeAlerte, apiResolveAlerte, type Alerte } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/alertes/$alerteId")({
  component: AlerteDetailPage,
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

function AlerteDetailPage() {
  const { alerteId } = useParams({ from: "/app/alertes/$alerteId" });
  const router = useRouter();
  const { data: alerte, loading, reload } = useApi(() => apiGetAlerte(Number(alerteId)), [alerteId]);
  const [actionLoading, setActionLoading] = useState(false);

  const sev = alerte ? SEVERITY_CONFIG[alerte.severity] || SEVERITY_CONFIG.medium : null;
  const SevIcon = sev?.icon || Info;
  const typeLabel = alerte ? TYPE_LABELS[alerte.type] || alerte.type : "";

  const doAction = async (fn: () => Promise<any>, msg: string) => {
    setActionLoading(true);
    try { await fn(); toast.success(msg); reload(); }
    catch (e: any) { toast.error(e?.message || "Erreur"); }
    finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!alerte) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold">Alerte non trouvée</h1>
        <Button variant="outline" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Alerte #{alerte.id}</h1>
          <p className="text-sm text-muted-foreground">{typeLabel}</p>
        </div>
      </div>

      <div className={`rounded-lg border p-5 ${sev?.color || ''}`}>
        <div className="flex items-start gap-3">
          <SevIcon className="h-6 w-6 mt-0.5" />
          <div>
            <p className="text-lg font-semibold">{alerte.title || "Sans titre"}</p>
            <p className="text-sm mt-1 opacity-80">{alerte.message}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Détails</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium mt-0.5">{typeLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sévérité</p>
                <p className="font-medium mt-0.5">{sev?.label || alerte.severity}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Statut</p>
                <Badge variant={alerte.resolved_at ? "default" : alerte.is_read ? "secondary" : "destructive"} className="mt-0.5">
                  {alerte.resolved_at ? "Traitée" : alerte.is_read ? "Lue" : "Nouvelle"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Créée le</p>
                <p className="font-medium mt-0.5">{alerte.created_at ? new Date(alerte.created_at).toLocaleString() : "—"}</p>
              </div>
              {alerte.acknowledged_at && (
                <div>
                  <p className="text-muted-foreground text-xs">Acquittée le</p>
                  <p className="font-medium mt-0.5">{new Date(alerte.acknowledged_at).toLocaleString()}</p>
                </div>
              )}
              {alerte.resolved_at && (
                <div>
                  <p className="text-muted-foreground text-xs">Résolue le</p>
                  <p className="font-medium mt-0.5">{new Date(alerte.resolved_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Message complet</h2>
            <div className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap">{alerte.message || "Aucun message"}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Actions</h2>
            <div className="space-y-2">
              {!alerte.is_read && (
                <Button className="w-full justify-start" variant="outline" size="sm" disabled={actionLoading} onClick={() => doAction(() => apiMarkAlerteRead(alerte.id), "Alerte marquée comme lue")}>
                  <Eye className="h-4 w-4 mr-2" /> Marquer lue
                </Button>
              )}
              {alerte.is_read && !alerte.acknowledged_at && !alerte.resolved_at && (
                <Button className="w-full justify-start" variant="outline" size="sm" disabled={actionLoading} onClick={() => doAction(() => apiAcknowledgeAlerte(alerte.id), "Alerte acquittée")}>
                  <CheckCheck className="h-4 w-4 mr-2" /> Acquitter
                </Button>
              )}
              {!alerte.resolved_at && (
                <Button className="w-full justify-start" variant="outline" size="sm" disabled={actionLoading} onClick={() => doAction(() => apiResolveAlerte(alerte.id), "Alerte résolue")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Résoudre
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Informations</h2>
            <div className="space-y-3 text-sm">
              {alerte.dossier && (
                <Link to="/app/dossiers/$dossierId" params={{ dossierId: alerte.dossier_id! }} className="flex items-center gap-2 text-accent hover:underline">
                  <ExternalLink className="h-4 w-4" />
                  {alerte.dossier.reference || alerte.dossier.id}
                </Link>
              )}
              {alerte.recipient && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  Destinataire: {alerte.recipient.full_name} ({alerte.recipient.role})
                </div>
              )}
              {alerte.trigger && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  Déclenché par: {alerte.trigger.full_name}
                </div>
              )}
              {alerte.target_role && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  Rôle cible: {alerte.target_role}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
