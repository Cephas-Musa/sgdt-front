import { FolderKanban, Bell, Activity, Clock } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { DOSSIERS, ALERTS } from "@/lib/mock";
import { StatusBadge } from "@/components/StatusBadge";

export default function GenericDash() {
  return (
    <div>
      <DashHeader />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={DOSSIERS.length} />
        <StatCard
          icon={Clock}
          label="En traitement"
          value={DOSSIERS.filter((d) => d.status === "en_cours").length}
        />
        <StatCard icon={Bell} label="Alertes" value={ALERTS.length} />
        <StatCard icon={Activity} label="Activité 24h" value={34} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Dossiers récents">
            <ul className="divide-y divide-border text-sm">
              {DOSSIERS.slice(0, 6).map((d) => (
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
        <Panel title="Alertes">
          <ul className="divide-y divide-border text-sm">
            {ALERTS.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-start gap-2 py-2">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.level === "urgent" ? "bg-destructive" : a.level === "important" ? "bg-warning" : "bg-info"}`}
                />
                <div className="min-w-0">
                  <div className="truncate">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
