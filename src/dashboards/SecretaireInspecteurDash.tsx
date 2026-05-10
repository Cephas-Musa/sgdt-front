import { FolderKanban, FileCheck, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Link } from "@tanstack/react-router";
import { DOSSIER_ASSIGNMENTS, APUREMENT_SUBMISSIONS, ALERTS } from "@/lib/mock";

export default function SecretaireInspecteurDash() {
  const totalAssignes = DOSSIER_ASSIGNMENTS.length;
  const enAttente = DOSSIER_ASSIGNMENTS.filter(d => d.status === "assigné").length;
  const traites = DOSSIER_ASSIGNMENTS.filter(d => d.status === "vérifié" || d.status === "apuré").length;
  const apurementsSoumis = APUREMENT_SUBMISSIONS.filter(a => a.status === "soumis").length;

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Secrétaire Inspecteur — Vérification, complétion et apurement des dossiers" />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers assignés" value={totalAssignes} />
        <StatCard icon={Clock} label="En attente vérification" value={enAttente} hint="Action requise" />
        <StatCard icon={FileCheck} label="Dossiers traités" value={traites} />
        <StatCard icon={AlertTriangle} label="Alertes" value={ALERTS.length} />
      </div>

      {/* Permissions */}
      <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <div>
          <span className="font-medium">Vos permissions :</span> Vérifier les dossiers et soumettre des apurements.
          Vous ne pouvez <span className="font-medium text-destructive">pas</span> créer de dossiers ni modifier les paiements.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accès rapides */}
        <Panel title="Accès rapides">
          <div className="space-y-1">
            {[
              { to: "/app/dossiers", label: "Dossiers assignés", icon: FolderKanban, desc: `${enAttente} en attente de vérification` },
              { to: "/app/appurement", label: "Apurement", icon: FileCheck, desc: `${apurementsSoumis} soumissions en cours` },
              { to: "/app/localisation", label: "Localisation véhicules", icon: Clock, desc: "Position actuelle" },
              { to: "/app/entrepots", label: "Entrepôt", icon: FolderKanban, desc: "Flux entrants/sortants" },
              { to: "/app/alertes", label: "Alertes", icon: AlertTriangle, desc: `${ALERTS.length} alertes` },
            ].map(item => (
              <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors group">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </Panel>

        {/* Dossiers récents */}
        <Panel title={`Derniers dossiers assignés (${Math.min(8, totalAssignes)})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Réf.</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {DOSSIER_ASSIGNMENTS.slice(0, 8).map(d => (
                  <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-mono text-xs">{d.dossierRef}</td>
                    <td className="px-3 py-2 capitalize text-xs">{d.type}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        d.status === "vérifié" || d.status === "apuré" ? "bg-success/15 text-success"
                        : d.status === "rejeté" ? "bg-destructive/15 text-destructive"
                        : "bg-warning/15 text-warning"
                      }`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
