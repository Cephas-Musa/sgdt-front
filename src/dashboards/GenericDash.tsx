import { FolderKanban, Bell, Activity, Clock } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { useApi, apiGetDossiers, apiGetAlerteStats, apiGetAlerteCritical } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "@tanstack/react-router";

export default function GenericDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const { data: alertStats } = useApi(apiGetAlerteStats);
  const { data: criticalAlerts } = useApi(apiGetAlerteCritical);
  const activeDossiers = (rawDossiers as any[]) || [];
  const stats = alertStats as any;
  const critical = (criticalAlerts as any[]) || [];

  return (
    <div>
      <DashHeader />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={activeDossiers.length} />
        <StatCard
          icon={Clock}
          label="En traitement"
          value={activeDossiers.filter((d) => d.status === "en_cours").length}
        />
        <StatCard icon={Bell} label="Alertes" value={stats?.total ?? 0} />
        <StatCard icon={Activity} label="Activité 24h" value={34} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Dossiers récents">
            <ul className="divide-y divide-border text-sm">
              {activeDossiers.slice(0, 6).map((d: any) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{d.reference}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {d.importateur} · {d.vehicule}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel title="Alertes critiques">
          {critical.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 italic">Aucune alerte critique</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {critical.slice(0, 5).map((a: any) => (
                <li key={a.id} className="flex items-start gap-2 py-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                  <div className="min-w-0">
                    <Link to="/app/alertes/$alerteId" params={{ alerteId: String(a.id) }} className="truncate font-medium hover:underline">
                      {a.title || a.message}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
