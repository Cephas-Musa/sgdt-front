import { Building2, Bell, Users, FolderKanban, Map, Shield } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Link } from "@tanstack/react-router";
import { BUREAUX_DOUANIERS, DIRECTIONS_PROVINCIALES, DOSSIERS, ALERTS, ACCOUNTS } from "@/lib/mock";

export default function DirecteurProvincialDash() {
  const bureaux = BUREAUX_DOUANIERS.filter(b => b.province === "NORD-KIVU");
  const comptes = ACCOUNTS.filter(a =>
    ["inspecteur_chef", "agent_controle", "commandant_unite"].includes(a.role)
  );
  const alertes = ALERTS.filter(a => a.level === "urgent" || a.level === "important");

  return (
    <div>
      <DashHeader subtitle="Espace Directeur Provincial — gestion de la province, bureaux et subordonnés" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Bureaux de la province" value={bureaux.length} />
        <StatCard icon={Users} label="Subordonnés directs" value={comptes.length} />
        <StatCard icon={FolderKanban} label="Dossiers province" value={DOSSIERS.length} />
        <StatCard icon={Bell} label="Alertes" value={alertes.length} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Bureaux douaniers de la province"
          actions={<Link to="/app/barrieres" className="text-xs text-accent hover:underline">Tout voir</Link>}
        >
          <div className="divide-y divide-border">
            {bureaux.map((b) => (
              <Link
                key={b.id}
                to="/app/bureaux/$bureauId"
                params={{ bureauId: b.id }}
                className="flex items-center justify-between py-3 px-2 hover:bg-muted/30 rounded-md transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-medium">{b.denomination}</div>
                  <div className="text-xs text-muted-foreground font-mono">{b.code}</div>
                </div>
                <div className="text-xs text-muted-foreground">{b.icb ?? "—"}</div>
              </Link>
            ))}
            {bureaux.length === 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">Aucun bureau dans cette province</div>
            )}
          </div>
        </Panel>

        <Panel
          title="Subordonnés directs"
          actions={<Link to="/app/comptes" className="text-xs text-accent hover:underline">Gérer les comptes</Link>}
        >
          <div className="divide-y divide-border">
            {comptes.map((c) => (
              <Link
                key={c.id}
                to="/app/comptes/$compteId"
                params={{ compteId: c.id }}
                className="flex items-center justify-between py-3 px-2 hover:bg-muted/30 rounded-md transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-medium">{c.fullName}</div>
                  <div className="text-xs text-muted-foreground">{c.role === "inspecteur_chef" ? "Inspecteur Chef" : c.role === "agent_controle" ? "Agent Contrôle" : "Commandant Unité"} · {c.bureau ?? "—"}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Alertes récentes">
          <ul className="divide-y divide-border text-sm">
            {alertes.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.level === "urgent" ? "bg-destructive" : a.level === "important" ? "bg-warning" : "bg-info"}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Accès rapide">
          <div className="grid gap-2 text-sm">
            <Link to="/app/dossiers" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">📁 Dossiers de la province</Link>
            <Link to="/app/comptes" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">👥 Créer un compte subordonné</Link>
            <Link to="/app/entrepots" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">🏬 Entrepôts</Link>
            <Link to="/app/alertes" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">🔔 Alertes & Notifications</Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
