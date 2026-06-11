import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, Building2, Truck, Navigation, ArrowRight, RefreshCw } from "lucide-react";
import { useApi, apiGetVehiculeLocalisations, apiGetVehiculeLocalisationStats, apiGetDossiers } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/app/localisation")({
  component: LocalisationPage,
});

const posColor = (p: string) =>
  p.includes("Barrière")
    ? "bg-warning/15 text-warning"
    : p.includes("Entrepôt")
      ? "bg-info/15 text-info"
      : p === "En route"
        ? "bg-accent/15 text-accent"
        : "bg-muted text-muted-foreground";

const statColor = (s: string) =>
  s === "en_transit"
    ? "bg-accent/15 text-accent"
    : s === "chargement" || s === "dechargement"
      ? "bg-success/15 text-success"
      : s === "en_attente"
        ? "bg-warning/15 text-warning"
        : "bg-muted text-muted-foreground";

function LocalisationPage() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const dossiers = (rawDossiers || []) as any[];

  const [vehicules, setVehicules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [v, s] = await Promise.all([
        apiGetVehiculeLocalisations(),
        apiGetVehiculeLocalisationStats(),
      ]);
      setVehicules(v || []);
      setStats(s || null);
    } catch {
      // fallback silencieux si API pas encore prête
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling toutes les 15s pour données temps réel
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const barriereCount = vehicules.filter((v) => v.position?.includes("Barrière")).length;
  const entrepotCount = vehicules.filter((v) => v.position?.includes("Entrepôt")).length;
  const enRoute = vehicules.filter((v) => v.position === "En route").length;
  const autres = vehicules.filter(
    (v) => !v.position?.includes("Barrière") && !v.position?.includes("Entrepôt") && v.position !== "En route",
  ).length;

  const apures = dossiers.filter((d: any) => d.status === "apure").length;

  return (
    <div>
      <PageHeader
        title="Localisation véhicules"
        description="Position actuelle des véhicules en transit et en stationnement"
      >
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="h-3 w-3" />
            Auto {autoRefresh ? "ON" : "OFF"}
          </label>
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement des données...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
              <MapPin className="mx-auto h-8 w-8 text-warning mb-2" />
              <div className="font-medium">Barrière entrée</div>
              <div className="text-3xl font-bold mt-1">{barriereCount}</div>
              <div className="text-xs text-muted-foreground mt-1">véhicules en attente</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
              <Building2 className="mx-auto h-8 w-8 text-info mb-2" />
              <div className="font-medium">Entrepôts</div>
              <div className="text-3xl font-bold mt-1">{entrepotCount}</div>
              <div className="text-xs text-muted-foreground mt-1">véhicules</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
              <Truck className="mx-auto h-8 w-8 text-accent mb-2" />
              <div className="font-medium">En route</div>
              <div className="text-3xl font-bold mt-1">{enRoute}</div>
              <div className="text-xs text-muted-foreground mt-1">en transit</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
              <Navigation className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <div className="font-medium">Autres / Parking</div>
              <div className="text-3xl font-bold mt-1">{autres}</div>
              <div className="text-xs text-muted-foreground mt-1">stationnés ou divers</div>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-accent" />
              Flux des véhicules
            </h3>
            <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
              <div className="rounded-lg bg-warning/10 border border-warning/30 px-4 py-3 text-center">
                <div className="font-bold text-lg">{barriereCount}</div>
                <div className="text-xs">Barrière</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="rounded-lg bg-info/10 border border-info/30 px-4 py-3 text-center">
                <div className="font-bold text-lg">{entrepotCount}</div>
                <div className="text-xs">Entrepôts</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-center">
                <div className="font-bold text-lg">{apures}</div>
                <div className="text-xs">Sortis / Apurés</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-medium">Détail des véhicules ({vehicules.length})</h3>
              <span className="text-xs text-muted-foreground">
                Dernière mise à jour : {vehicules[0]?.last_seen_at ? new Date(vehicules[0].last_seen_at).toLocaleTimeString() : "—"}
              </span>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-3 py-2">Plaque</th>
                    <th className="px-3 py-2">Position actuelle</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Depuis</th>
                    <th className="px-3 py-2">Dossier</th>
                    <th className="px-3 py-2">Importateur</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground italic">
                        Aucun véhicule enregistré pour le moment.
                      </td>
                    </tr>
                  ) : (
                    vehicules.map((v) => (
                      <tr key={v.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 font-mono font-medium">{v.plaque}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${posColor(v.position)}`}>
                            {v.position}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statColor(v.status)}`}>
                            {v.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {v.last_seen_at ? (() => {
                            const diff = Math.floor((Date.now() - new Date(v.last_seen_at).getTime()) / 60000);
                            if (diff < 1) return "À l'instant";
                            if (diff < 60) return `Il y a ${diff} min`;
                            if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
                            return `Il y a ${Math.floor(diff / 1440)}j`;
                          })() : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{v.dossier?.reference || "—"}</td>
                        <td className="px-3 py-2 text-xs">{v.importateur || v.dossier?.importateur || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
